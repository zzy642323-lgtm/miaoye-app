import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createServer} from '../server.mjs';
const settings=await(await fetch(process.env.SUPABASE_URL+'/auth/v1/settings',{headers:{apikey:process.env.SUPABASE_ANON_KEY}})).json();
assert.equal(settings.mailer_autoconfirm,true,'Do not send test emails');
const server=createServer().listen(0,'127.0.0.1');await once(server,'listening');
const base=process.env.MIAOYE_CLOUD_TEST_BASE||'http://127.0.0.1:'+server.address().port+'/cloud/';
const users=[];
async function call(path,body,user){const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',...(user?{Authorization:'Bearer '+user.access_token}:{})},body:JSON.stringify(body)});return {status:r.status,data:await r.json()};}
const rpc=(name,body,user)=>call('rest/v1/rpc/miaoye_social_'+name,body,user);
async function ok(name,body,user){const r=await rpc(name,body,user);assert.equal(r.status,200,name+': '+JSON.stringify(r.data));return r.data;}
try{
 for(let n=0;n<3;n++){const username='qa'+crypto.randomUUID().replaceAll('-','').slice(0,20);const r=await call('auth/v1/signup',{email:username+'@meoo.local',password:crypto.randomBytes(24).toString('hex')});assert.equal(r.status,200);assert.ok(r.data.access_token);users.push({...r.data,username});await ok('me',{},users[n]);}
 const [a,b,c]=users,day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Singapore',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const post=await ok('publish',{p_entry:'synthetic',p_day:day,p_title:'Synthetic QA',p_message:'Test only',p_image:'data:image/jpeg;base64,aGVsbG8='},a);
 assert.equal((await ok('feed',{p_today:true},b)).length,0);
 await ok('request',{p_username:b.username},a);
 const request=(await ok('friends',{},b))[0];assert.equal(request.incoming,true);assert.equal(request.accepted,false);
 assert.ok((await rpc('friend_action',{p_id:request.id,p_action:'accept'},a)).status>=400,'Sender cannot accept own request');
 assert.equal((await ok('feed',{p_today:true},b)).length,0,'Pending request cannot read shares');
 await ok('friend_action',{p_id:request.id,p_action:'accept'},b);
 assert.equal((await ok('feed',{p_today:true},b))[0].id,post.id);
 assert.equal((await ok('feed',{p_today:true},c)).length,0,'Stranger cannot read shares');
 assert.ok((await rpc('like',{p_id:post.id,p_like:true},c)).status>=400,'Stranger cannot like');
 assert.ok((await rpc('unshare',{p_id:post.id},b)).status>=400,'Friend cannot revoke owner share');
 await ok('like',{p_id:post.id,p_like:true},b);await ok('like',{p_id:post.id,p_like:true},b);
 assert.equal((await ok('feed',{p_today:true},a))[0].likes,1,'Repeated likes do not add votes');
 await ok('like',{p_id:post.id,p_like:false},b);assert.equal((await ok('feed',{p_today:true},a))[0].likes,0);
 assert.equal((await rpc('feed',{p_today:true})).status,401,'Signed out access blocked');
 await ok('friend_action',{p_id:request.id,p_action:'remove'},a);
 assert.equal((await ok('feed',{p_today:true},b)).length,0,'Removed friend loses read access');
 assert.ok((await rpc('like',{p_id:post.id,p_like:true},b)).status>=400);
 await ok('unshare',{p_id:post.id},a);assert.equal((await ok('feed',{p_today:true},a)).length,0);
 console.log('PASS: mutual friendship consent, private feeds, idempotent likes, unlike, withdrawal and removal revoke access across three real accounts');
}finally{
 await fs.mkdir('.cloud-qa',{recursive:true});
 if(users.length)await fs.writeFile('.cloud-qa/friends-cleanup.sql','delete from auth.users where id in ('+users.map(u=>"'"+u.user.id+"'").join(',')+');');
 server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
}
