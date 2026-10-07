import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cloudFetch} from '../web/cloud-transport.js';
const url='https://s7ianzbg94fw.meoo.run/cloud/auth/v1/token?grant_type=password';
test('native HTTPS bridge forwards headers and JSON, handles failure and abort without duplicate requests',async()=>{
 const old=globalThis.window;let calls=0,late;
 try{
  globalThis.window={MIAOYE_ANDROID:true,MiaoyeCloud:{request(id,target,method,headers,body){calls++;assert.equal(target,url);assert.equal(method,'POST');assert.equal(JSON.parse(headers).Authorization,'Bearer test');assert.equal(body,'{"test":true}');window.miaoyeCloudReply(id,{status:200,body:'{"ok":true}'});}}};
  const options={method:'POST',headers:{authorization:'Bearer test'},body:new Blob(['{"test":true}'])};
  assert.deepEqual(await (await cloudFetch(url,options)).json(),{ok:true});assert.equal(calls,1);
  await assert.rejects(cloudFetch('https://evil.test/cloud/status',options),/地址/);assert.equal(calls,1);
  window.MiaoyeCloud.request=(id)=>window.miaoyeCloudReply(id,{status:0,error:'证书验证失败'});
  await assert.rejects(cloudFetch(url),/证书验证失败/);
  window.MiaoyeCloud.request=id=>{late=id;};const controller=new AbortController();const request=cloudFetch(url,{signal:controller.signal});controller.abort();await assert.rejects(request,{name:'AbortError'});
  window.miaoyeCloudReply(late,{status:200,body:'{}'});
 }finally{globalThis.window=old;}
});
