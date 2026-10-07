import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initFriends} from '../web/friends.js';
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
