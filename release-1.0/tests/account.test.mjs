import {test} from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs/promises';
const source=await fs.readFile(new URL('../web/account.js',import.meta.url),'utf8');
function harness(response={access_token:'test',user:{id:'test-user',identities:[{}]},expires_in:3600}){
  const handlers={},calls=[],feedback={textContent:''},values=new Map([['miaoye-preview-onboarded','1'],['miaoye-preview-account-intro','1']]);
  const storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
  const context={console,URL,AbortController,Blob,Event,setTimeout,clearTimeout,localStorage:storage,sessionStorage:storage,
    FormData:class{constructor(form){this.data=new Map(Object.entries(form.values))}get(k){return this.data.get(k)}set(k,v){this.data.set(k,v)}},
    document:{addEventListener:(kind,handler)=>(handlers[kind]??=[]).push(handler),querySelector:()=>feedback,head:{insertAdjacentHTML(){}},body:{insertAdjacentHTML(){}}},
    window:{dispatchEvent(){}},show(){},fetch:async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return {ok:!response.error,json:async()=>response}}};
  vm.runInNewContext(source,context);return {calls,feedback,submit:async(phone,mode='signup')=>{await handlers.submit[0]({target:{id:'preview-auth-form',values:{username:phone,password:'test-only-password'},querySelectorAll:()=>[]},submitter:{value:mode},preventDefault(){},stopImmediatePropagation(){}})}};
}
test('phone account canonicalizes +86 formatting into a single unique cloud identity without SMS',async()=>{const h=harness();await h.submit('+86 138-0013-8000');assert.equal(h.calls.length,1);assert.equal(h.calls[0].body.email,'13800138000@meoo.local');assert.equal(h.calls[0].body.data.username,'13800138000');assert.equal(h.calls[0].body.phone,undefined);assert.ok(h.calls[0].url.endsWith('/auth/v1/signup'));});
test('invalid phone is rejected before any network request',async()=>{const h=harness();await h.submit('123');assert.equal(h.calls.length,0);assert.match(h.feedback.textContent,/手机号/);});
test('duplicate cloud account stays rejected and prompts login',async()=>{const h=harness({error:'User already registered'});await h.submit('13800138000');assert.equal(h.calls.length,1);assert.match(h.feedback.textContent,/已注册/);});
test('phone password login uses the same normalized identity',async()=>{const h=harness();await h.submit('13800138000','login');assert.ok(h.calls[0].url.endsWith('grant_type=password'));assert.equal(h.calls[0].body.email,'13800138000@meoo.local');});
