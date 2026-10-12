import {test} from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs/promises';
const load=name=>fs.readFile(new URL('../web/'+name,import.meta.url),'utf8');
test('long press offers a choice, calls native gallery only after confirmation; scrolling cancels it',async()=>{
 const listeners={},windowListeners={},timers=new Map(),saved=[],dialogs=[];let id=0,button={disabled:false};
 const img={src:'data:image/png;base64,PHOTO',currentSrc:'',closest:()=>img};
 const ctx={window:{addEventListener:(e,f)=>windowListeners[e]=f,MiaoyeExport:{savePng:v=>saved.push(v)}},document:{addEventListener:(e,f)=>(listeners[e]??=[]).push(f),createElement:()=>({getContext:()=>({drawImage(){}}),toDataURL:()=> 'data:image/png;base64,SAVED'})},setTimeout:f=>{timers.set(++id,f);return id},clearTimeout:id=>timers.delete(id),Image:class{complete=true;naturalWidth=30;naturalHeight=40},show:(...v)=>dialogs.push(v),panel:{close(){}},toast(){},Date};
 vm.runInNewContext(await load('card-photo-save.js'),ctx);
 const down=()=>listeners.pointerdown[0]({target:img,button:0,pointerId:1,clientX:0,clientY:0});
 down();listeners.pointermove[0]({pointerId:1,clientX:30,clientY:0});assert.equal(timers.size,0);assert.equal(dialogs.length,0);
 down();[...timers.values()][0]();assert.equal(dialogs.length,1);assert.equal(saved.length,0);assert.match(dialogs[0][1],/保存到图库/);
 let blocked=false;windowListeners.click({target:img,preventDefault(){blocked=true},stopImmediatePropagation(){}});assert.equal(blocked,true);
 await listeners.click[0]({target:{closest:()=>button}});assert.deepEqual(saved,['data:image/png;base64,SAVED']);assert.equal(button.disabled,false);
});
test('update notice waits for onboarding, acknowledges only on button click, and does not repeat',async()=>{
 const storage={},layers=[];let mutation,blocked=true;
 const ctx={window:{MIAOYE_VERSION:'1.0.15',addEventListener(){}},localStorage:{getItem:k=>storage[k],setItem:(k,v)=>storage[k]=v},document:{querySelector:()=>blocked?{}:null,head:{insertAdjacentHTML(){}},body:{append:layer=>layers.push(layer)},createElement:()=>({setAttribute(){},querySelector(){return this.button??={}},remove(){this.removed=true}})},MutationObserver:class{constructor(f){mutation=f}observe(){}disconnect(){}}};
 const code=await load('update-notice.js');vm.runInNewContext(code,ctx);assert.equal(layers.length,0);
 storage['miaoye-preview-onboarded']='1';blocked=false;mutation();assert.equal(layers.length,1);assert.equal(storage['miaoye-preview-update-seen'],undefined);
 layers[0].button.onclick();assert.equal(storage['miaoye-preview-update-seen'],'1.0.15');vm.runInNewContext(code,ctx);assert.equal(layers.length,1);
});
test('legacy local avatar and nickname are synced as profile metadata, then a new account pulls its own identity',async()=>{
 const storage={},events={},calls=[];let current={id:'a'};
 const account={getUser:()=>current,request:async(path,options)=>{calls.push({path,body:JSON.parse(options.body)});return {nickname:'新账号',avatar:'cat:2'}}};
 const ctx={window:{MiaoYeAccount:account,addEventListener:(e,f)=>events[e]=f},profileState:{name:'我的昵称',avatar:'data:image/png;base64,LOCAL'},RecordArt:{adopted:()=>({cat:0})},localStorage:{getItem:k=>storage[k],setItem:(k,v)=>storage[k]=v,removeItem:k=>delete storage[k]},document:{createElement:()=>({getContext:()=>({fillRect(){},drawImage(){}}),toDataURL:()=> 'data:image/jpeg;base64,COMPRESSED'})},Image:class{width=320;height=320;set src(v){queueMicrotask(()=>this.onload())}},render(){},toast(){}};
 vm.runInNewContext(await load('cloud-profile.js'),ctx);await ctx.window.CloudProfile.sync();
 assert.ok(calls.some(c=>c.path.endsWith('social_profile')&&c.body.p_nickname==='我的昵称'&&c.body.p_avatar.includes('COMPRESSED')));
 current={id:'b'};events['miaoye-account-change']();await ctx.window.CloudProfile.sync();assert.equal(ctx.profileState.name,'新账号');assert.equal(ctx.profileState.avatar,undefined);assert.equal(storage['miaoye-preview-profile-owner'],'b');
});


