import {test} from 'node:test';
import assert from 'node:assert/strict';
import {profileValues,avatarHtml,initAccountProfile} from '../web/social-profile.js';
import {catRects,catArtHtml,paintCat} from '../web/cat-art.js';
test('profile supports a display name without changing login identity and rejects unsafe avatars',()=>{
 assert.deepEqual(profileValues(' 主人 ','cat:3'),{p_nickname:'主人',p_avatar:'cat:3'});
 for(const value of ['https://tracking.test/a.jpg','data:image/svg+xml;base64,abc','cat:5'])assert.throws(()=>profileValues('主人',value));
 assert.throws(()=>profileValues('', 'cat:0'));
 assert.ok(!avatarHtml('https://tracking.test/a.jpg',String).includes('tracking.test'));
});
test('all thirty reference cats use measured whole-object bounds for both screen and export',()=>{
 assert.equal(catRects.length,5);for(const row of catRects){assert.equal(row.length,6);for(const [x,y,w,h] of row){assert.ok(x>=0&&y>=0&&x+w<=1374&&y+h<=1145);}}
 const html=catArtHtml(3,4,'cat-pose','栗栗');assert.ok(html.includes('viewBox="926 722 221 211"'));
 let call;paintCat({drawImage:(...args)=>call=args},{},3,4,200);assert.deepEqual(call.slice(1,5),[926,722,221,211]);assert.equal(call[7],200);assert.ok(call[8]<200);
});
test('account editor saves only chosen avatar and nickname after explicit submit',async()=>{
 const old=globalThis.document,oldData=globalThis.FormData,listeners={},calls=[];let html='',saved=false;
 globalThis.document={addEventListener:(type,fn)=>listeners[type]=fn,querySelector:()=>null};globalThis.FormData=class{get(){return '新昵称';}};
 try{
  const account=initAccountProfile({request:async(path,options)=>{calls.push({path,body:JSON.parse(options.body)});return {id:'owner',username:'fixed_login',nickname:'旧昵称',avatar:'cat:0'};},getUser:()=>({id:'owner'}),openModal:value=>html=value,toast(){},esc:String,onSaved:()=>saved=true});
  await account.edit();assert.ok(html.includes('登录用户名保持不变'));assert.equal(calls.filter(c=>c.path.endsWith('_profile')).length,0);
  listeners.click({target:{closest:()=>({dataset:{accountCat:'2'}})},preventDefault(){},stopImmediatePropagation(){}});
  await listeners.submit({target:{id:'account-profile',querySelector:()=>({})},preventDefault(){},stopImmediatePropagation(){}});
  assert.deepEqual(calls.find(c=>c.path.endsWith('_profile')).body,{p_nickname:'新昵称',p_avatar:'cat:2'});assert.equal(saved,true);
 }finally{globalThis.document=old;globalThis.FormData=oldData;}
});
