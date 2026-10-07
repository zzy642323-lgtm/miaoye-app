import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initFriends} from '../web/friends.js';
test('timeline shows own and friend profiles, add button and private remark editing by friend user ID',async()=>{
 const old=globalThis.document,oldData=globalThis.FormData,listeners={},calls=[];let html='';
 const rows=[{id:'relation',user_id:'friend',username:'friend_login',nickname:'小橘主人',avatar:'cat:1',note:'橘友',accepted:true}];
 const posts=[{id:'mine',owner:'owner',username:'owner_login',nickname:'我自己',avatar:'cat:0',journal_day:'2026-10-07',title:'我的动态',image:'data:image/jpeg;base64,aA==',message:'hello',likes:0},{id:'other',owner:'friend',username:'friend_login',nickname:'小橘主人',note:'橘友',avatar:'cat:1',journal_day:'2026-10-07',title:'朋友动态',image:'data:image/jpeg;base64,aA==',message:'hello',likes:0}];
 globalThis.document={addEventListener:(type,fn)=>listeners[type]=fn};globalThis.FormData=class{get(){return '新备注';}};
 const cloud={getUser:()=>({id:'owner'}),panel(){},request:async(path,options)=>{calls.push({path,body:JSON.parse(options.body)});return path.endsWith('_me')?{id:'owner',username:'owner_login',nickname:'我自己',avatar:'cat:0'}:path.endsWith('_friends')?rows:path.endsWith('_feed')?posts:{};}};
 try{
  const friends=initFriends({cloud,openModal:value=>html=value,showFeed:value=>html=value,toast(){},esc:String,records:()=>[],prepare(){}});await friends.feed();assert.ok(html.includes('加好友'));assert.ok(html.includes('p_today')===false);assert.ok(html.includes('data-friend-focus="all"'));assert.ok(!html.includes('data-friend-focus="owner"'));assert.ok(!html.includes('data-social="today"'));assert.ok(!html.includes('data-social="mine"'));assert.ok(!html.includes('data-social="recent"'));assert.ok(html.includes('friend-new-dot'));assert.deepEqual(calls.find(c=>c.path.endsWith('_feed')).body,{p_today:false});assert.ok(html.includes('朋友动态'));assert.ok(html.includes('我 · 我自己'));assert.ok(html.includes('橘友'));
  await listeners.click({target:{closest:()=>({dataset:{social:'note',user:'friend'}})},preventDefault(){},stopImmediatePropagation(){}});assert.ok(html.includes('只对你自己可见'));assert.ok(html.includes('data-user="friend"'));
  const form={id:'friend-note',dataset:{user:'friend'},querySelector:()=>({})};await listeners.submit({target:form,preventDefault(){},stopImmediatePropagation(){}});
  assert.deepEqual(calls.find(c=>c.path.endsWith('_note')).body,{p_friend:'friend',p_note:'新备注'});
 }finally{globalThis.document=old;globalThis.FormData=oldData;}
});
test('dedicated friend page shows login and retry states without opening a feed modal',async()=>{
 const old=globalThis.document;let html='',signed=false,fail=false,modals=0;
 globalThis.document={addEventListener(){}};
 const cloud={getUser:()=>signed?{id:'owner'}:null,panel(){modals++;},request:async path=>{if(fail)throw Error('云服务响应超时');return path.endsWith('_me')?{id:'owner',username:'tester'}:[];}};
 try{
  const friends=initFriends({cloud,openModal(){modals++;},showFeed:value=>html=value,toast(){},esc:String,records:()=>[],prepare(){}});
  await friends.feed();assert.ok(html.includes('登录 / 注册云账号'));assert.equal(modals,0);
  signed=true;await friends.feed();assert.ok(html.includes('小日子，慢慢收集'));assert.equal(modals,0);
  fail=true;await friends.feed();assert.ok(html.includes('云服务响应超时'));assert.ok(html.includes('重新加载'));assert.equal(modals,0);
 }finally{globalThis.document=old;}
});
test('sharing renders a preview and sends only the selected page after explicit confirmation',async()=>{
 const previous=globalThis.document,listeners={},calls=[];let html='',prepared;
 globalThis.document={addEventListener:(type,fn)=>listeners[type]=fn,querySelector:()=>({value:'hello'})};
 const cloud={getUser:()=>({id:'owner'}),panel(){},request:async(path,options)=>{calls.push({path,body:JSON.parse(options.body)});return path.endsWith('_me')?{id:'owner',username:'tester'}:path.endsWith('_feed')||path.endsWith('_friends')?[]:{id:'post'};}};
 const esc=x=>String(x).replaceAll('<','&lt;');
 const click=async(action,entry)=>{const b={dataset:{social:action,entry},disabled:false};await listeners.click({target:{closest:()=>b},preventDefault(){},stopImmediatePropagation(){}});};
 try{
  initFriends({cloud,openModal:value=>html=value,toast(){},esc,records:()=>[],prepare:async id=>{prepared=id;return {entry:'selected:0',title:'<private title>',day:'2026-10-07',image:'data:image/jpeg;base64,test'};}});
  await click('prepare','selected');assert.equal(prepared,'selected');assert.ok(html.includes('确认分享这一页'));assert.ok(html.includes('&lt;private title>'));
  assert.equal(calls.filter(c=>c.path.endsWith('_publish')).length,0,'Preview must not upload the page');
  await click('publish');const published=calls.find(c=>c.path.endsWith('_publish'));assert.deepEqual(Object.keys(published.body).sort(),['p_day','p_entry','p_image','p_message','p_title']);assert.equal(published.body.p_entry,'selected:0');assert.equal(published.body.p_image,'data:image/jpeg;base64,test');
 }finally{globalThis.document=previous;}
});

test('new activity badge clears per friend and account, returns for new shares, and navigation defaults to all',async()=>{
 const oldDoc=globalThis.document,oldStorage=globalThis.localStorage,listeners={},memory=new Map();let html='',owner='owner';
 const rows=[{id:'relation',user_id:'friend',username:'friend_login',nickname:'橘子',avatar:'cat:1',accepted:true}];
 const posts=[{id:'a',owner:'friend',username:'friend_login',nickname:'橘子',avatar:'cat:1',journal_day:'2026-10-08',title:'朋友的一页',image:'data:image/jpeg;base64,aA==',likes:0}];
 globalThis.document={addEventListener:(type,fn)=>listeners[type]=fn};globalThis.localStorage={getItem:key=>memory.get(key),setItem:(key,value)=>memory.set(key,value)};
 const cloud={getUser:()=>({id:owner}),request:async path=>path.endsWith('_me')?{id:owner,username:owner}:path.endsWith('_friends')?rows:posts};
 try{
  const friends=initFriends({cloud,openModal:value=>html=value,showFeed:value=>html=value,toast(){},esc:String,records:()=>[]});
  await friends.feed();assert.ok(html.includes('friend-new-dot'));
  await listeners.click({target:{closest:()=>({dataset:{social:'note',user:'friend'}})},preventDefault(){},stopImmediatePropagation(){}});
  await friends.feed();assert.ok(!html.includes('friend-new-dot'));assert.ok(html.includes('all-friends is-current'));assert.ok(html.includes('大家的小日子'));
  owner='another-account';await friends.feed();assert.ok(html.includes('friend-new-dot'),'One account must not consume another account’s unread marker');
  owner='owner';posts.push({...posts[0],id:'b'});await friends.feed();assert.ok(html.includes('friend-new-dot'),'A new share must restore the marker');
  posts.pop();await friends.feed();assert.ok(!html.includes('friend-new-dot'),'Removing a share must not create a false new marker');
 }finally{globalThis.document=oldDoc;globalThis.localStorage=oldStorage;}
});
