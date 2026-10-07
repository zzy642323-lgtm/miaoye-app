import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initFriends} from '../web/friends.js';
test('dedicated friend page shows login and retry states without opening a feed modal',async()=>{
 const old=globalThis.document;let html='',signed=false,fail=false,modals=0;
 globalThis.document={addEventListener(){}};
 const cloud={getUser:()=>signed?{id:'owner'}:null,panel(){modals++;},request:async path=>{if(fail)throw Error('云服务响应超时');return path.endsWith('_me')?{id:'owner',username:'tester'}:[];}};
 try{
  const friends=initFriends({cloud,openModal(){modals++;},showFeed:value=>html=value,toast(){},esc:String,records:()=>[],prepare(){}});
  await friends.feed();assert.ok(html.includes('登录 / 注册云账号'));assert.equal(modals,0);
  signed=true;await friends.feed();assert.ok(html.includes('今天还没有分享'));assert.equal(modals,0);
  fail=true;await friends.feed();assert.ok(html.includes('云服务响应超时'));assert.ok(html.includes('重新加载'));assert.equal(modals,0);
 }finally{globalThis.document=old;}
});
test('sharing renders a preview and sends only the selected page after explicit confirmation',async()=>{
 const previous=globalThis.document,listeners={},calls=[];let html='',prepared;
 globalThis.document={addEventListener:(type,fn)=>listeners[type]=fn,querySelector:()=>({value:'hello'})};
 const cloud={getUser:()=>({id:'owner'}),panel(){},request:async(path,options)=>{calls.push({path,body:JSON.parse(options.body)});return path.endsWith('_me')?{id:'owner',username:'tester'}:path.endsWith('_feed')?[]:{id:'post'};}};
 const esc=x=>String(x).replaceAll('<','&lt;');
 const click=async(action,entry)=>{const b={dataset:{social:action,entry},disabled:false};await listeners.click({target:{closest:()=>b},preventDefault(){},stopImmediatePropagation(){}});};
 try{
  initFriends({cloud,openModal:value=>html=value,toast(){},esc,records:()=>[],prepare:async id=>{prepared=id;return {entry:'selected:0',title:'<private title>',day:'2026-10-07',image:'data:image/jpeg;base64,test'};}});
  await click('prepare','selected');assert.equal(prepared,'selected');assert.ok(html.includes('确认分享这一页'));assert.ok(html.includes('&lt;private title>'));
  assert.equal(calls.filter(c=>c.path.endsWith('_publish')).length,0,'Preview must not upload the page');
  await click('publish');const published=calls.find(c=>c.path.endsWith('_publish'));assert.deepEqual(Object.keys(published.body).sort(),['p_day','p_entry','p_image','p_message','p_title']);assert.equal(published.body.p_entry,'selected:0');assert.equal(published.body.p_image,'data:image/jpeg;base64,test');
 }finally{globalThis.document=previous;}
});
