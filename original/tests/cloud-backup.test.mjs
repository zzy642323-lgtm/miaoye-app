import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateBackup,initCloudBackup,cloudJson,cloudCredentials} from '../web/cloud-backup.js';
test('cloud credentials explain rejected username and password instead of silent native form validation',()=>{
  for(const name of ['猫咪','test@example.com','ab','a b'])assert.throws(()=>cloudCredentials(name,'12345678'),/用户名请用/);
  assert.throws(()=>cloudCredentials('miaoye_123','123'),/密码至少/);
  assert.equal(cloudCredentials(' MIAOYE_123 ','12345678').email,'miaoye_123@meoo.local');
});
test('cloud requests work on WebViews without AbortSignal.timeout, abort slow requests and explain auth failures',async()=>{
  const originalFetch=globalThis.fetch,originalSignal=globalThis.AbortSignal;
  try{
    globalThis.AbortSignal=undefined;
    globalThis.fetch=async(url,options)=>{assert.ok(options.signal);return new Response('{"ok":true}');};
    assert.deepEqual(await cloudJson('https://cloud.test'),{ok:true});
    globalThis.fetch=async()=>new Response('{"error_code":"invalid_credentials"}',{status:400});
    await assert.rejects(cloudJson('https://cloud.test'),/用户名或密码不正确/);
    globalThis.fetch=async(url,options)=>new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(Error('aborted'))));
    await assert.rejects(cloudJson('https://cloud.test',{},5),/连接云端超时/);
  }finally{globalThis.fetch=originalFetch;globalThis.AbortSignal=originalSignal;}
});
test('cloud restore validates format and retains local photos, cat stories and draft without importing account tokens',()=>{
  const journal={books:[{id:'book',local:true}],records:[],draft:{library:[{src:'data:image/png;base64,aGVsbG8='}]},catLife:{0:{stories:[1]}},catNames:{0:'奶油'},access_token:'reject'};
  const result=validateBackup({format:'miaoye-backup',version:1,journal});assert.equal(result.id,'v2-state');assert.equal(result.draft.library[0].src,journal.draft.library[0].src);assert.deepEqual(result.catLife,journal.catLife);assert.equal(result.access_token,undefined);
  for(const bad of [null,{format:'miaoye-backup',version:2,journal},{format:'miaoye-backup',version:1,journal:{books:[],records:'invalid'}}])assert.throws(()=>validateBackup(bad));
});
test('failed cloud upload keeps local journal and does not enable automatic upload; successful opt-in binds the account',async()=>{
  const previous=Object.fromEntries(['window','document','localStorage','fetch','setTimeout','clearTimeout'].map(k=>[k,globalThis[k]]));
  const user='11111111-1111-4111-8111-111111111111';
  const values=new Map([['miaoye-cloud-session',JSON.stringify({user:{id:user,email:'tester@meoo.local'},access_token:'private.token',refresh_token:'private.refresh',expires_at:Date.now()/1000+3600})]]);
  const listeners={},journal={id:'v2-state',books:[{id:'book',local:true}],records:[{id:'entry',photos:['local-photo']}],draft:null};
  let fail=true,scheduled=0,writes=0;const requests=[];
  globalThis.window={MIAOYE_STANDALONE:true,addEventListener(){}};
  globalThis.document={addEventListener(type,callback){listeners[type]=callback;}};
  globalThis.localStorage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
  globalThis.setTimeout=(callback,delay)=>{if(delay===30000)scheduled++;return 1;};globalThis.clearTimeout=()=>{};
  globalThis.fetch=async(url,options)=>{requests.push({url,options});if(fail)return new Response('{"error":"offline"}',{status:502});return new Response(url.includes('?select=')?'[]':'{}');};
  try{
    const cloud=initCloudBackup({local:async method=>{if(method!=='getAll')writes++;return [structuredClone(journal)];},openModal(){},toast(){},esc:x=>x});
    const button={dataset:{cloud:'backup'},disabled:false};const event={target:{closest:selector=>selector==='[data-cloud]'?button:null},stopImmediatePropagation(){}};
    await listeners.click(event);assert.equal(values.has('miaoye-cloud-auto'),false);assert.equal(writes,0);assert.equal(journal.records[0].photos[0],'local-photo');
    fail=false;await listeners.click(event);assert.equal(values.get('miaoye-cloud-auto'),'true');assert.equal(values.get('miaoye-cloud-owner'),user);cloud.changed();assert.equal(scheduled,1);assert.equal(writes,0);
    const upload=requests.find(x=>x.url.includes('storage/v1/object/'));assert.ok(upload);assert.equal(upload.options.headers.Authorization,'Bearer private.token');assert.doesNotMatch(await upload.options.body.text(),/private.token|private.refresh/);
  }finally{for(const [key,value]of Object.entries(previous)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}
});
