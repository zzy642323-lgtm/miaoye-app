// Integration test uses official virtual @meoo.local usernames only when no email is sent.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {createServer} from '../server.mjs';
import {once} from 'node:events';
import assert from 'node:assert/strict';
const headers={apikey:process.env.SUPABASE_ANON_KEY};
const settings=await(await fetch(process.env.SUPABASE_URL+'/auth/v1/settings',{headers})).json();
assert.equal(settings.mailer_autoconfirm,true,'Do not send test emails');
const server=createServer().listen(0,'127.0.0.1');await once(server,'listening');
const base='http://127.0.0.1:'+server.address().port+'/cloud/';
const users=[];let objectPath;
async function call(path,body,token,method=body?'POST':'GET'){
  const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});
  const text=await r.text();let data;try{data=JSON.parse(text)}catch{data=text}return {status:r.status,data};
}
try{
  for(let i=0;i<2;i++){const password=crypto.randomBytes(24).toString('hex'),email='qa'+crypto.randomUUID().replaceAll('-','').slice(0,20)+'@meoo.local';const signed=await call('auth/v1/signup',{email,password});assert.equal(signed.status,200,JSON.stringify(signed.data).replaceAll(password,'[redacted]'));assert.ok(signed.data.access_token);users.push(signed.data);const login=await call('auth/v1/token?grant_type=password',{email,password});assert.equal(login.status,200);assert.equal(login.data.user.id,signed.data.user.id);}
  const [a,b]=users,id=crypto.randomUUID(),device=crypto.randomUUID();objectPath=a.user.id+'/'+device+'/'+id+'.json';
  const document={format:'miaoye-backup',version:1,journal:{id:'v2-state',books:[],records:[],catLife:{},draft:null}};
  assert.equal((await call('storage/v1/object/miaoye-private/'+objectPath,document,a.access_token)).status,200);
  const row={id,user_id:a.user.id,device_id:device,path:objectPath,bytes:JSON.stringify(document).length,entries:0};
  assert.equal((await call('rest/v1/miaoye_backups',row,a.access_token)).status,201);
  assert.deepEqual((await call('storage/v1/object/authenticated/miaoye-private/'+objectPath,null,a.access_token)).data,document);
  const stranger=await call('storage/v1/object/authenticated/miaoye-private/'+objectPath,null,b.access_token);assert.notEqual(stranger.status,200);
  assert.deepEqual((await call('rest/v1/miaoye_backups?select=*',null,b.access_token)).data,[]);
  const forged=await call('rest/v1/miaoye_backups',{...row,id:crypto.randomUUID()},b.access_token);assert.ok(forged.status>=400);
  assert.equal((await call('storage/v1/object/authenticated/miaoye-private/'+objectPath)).status,401);
  const refresh=await call('auth/v1/token?grant_type=refresh_token',{refresh_token:a.refresh_token});assert.equal(refresh.status,200);a.access_token=refresh.data.access_token;
  console.log('PASS: real signup, password login, JWT refresh, private upload/download and two-account isolation');
}finally{
  if(objectPath&&users[0])await call('storage/v1/object/miaoye-private/'+objectPath,null,users[0].access_token,'DELETE');
  for(const user of users){await call('rest/v1/miaoye_backups?user_id=eq.'+user.user.id,null,user.access_token,'DELETE');}
  await fs.mkdir('.cloud-qa',{recursive:true});await fs.writeFile('.cloud-qa/cleanup.sql',"delete from auth.users where id in ("+users.map(x=>"'"+x.user.id+"'").join(',')+");");
  server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
}
