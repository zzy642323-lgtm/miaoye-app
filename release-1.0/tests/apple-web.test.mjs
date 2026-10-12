import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const web=new URL('../web/',import.meta.url);
test('Apple cloud transport preserves user JWT and uses the same social backend as Android',async()=>{
 const calls=[],store=new Map([['miaoye-preview-cleared-v022','1']]);
 const window={MIAOYE_WEB_CLOUD:{url:'https://example.database.meoo.xyz',anonKey:'public-anon',project:'s7ianzbg94fw'},fetch:async(url,options)=>{calls.push({url,options});return new Response('{}',{status:200})}};
 const context={window,localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},document:{addEventListener(){}},URL,Headers,Response,Blob,Map,DOMException,Date};
 vm.runInNewContext(fs.readFileSync(new URL('release-config.js',web),'utf8'),context);
 await window.fetch('https://s7ianzbg94fw.meoo.run/cloud/rest/v1/rpc/miaoye_social_feed',{method:'POST',headers:{Authorization:'Bearer user-jwt'},body:'{}'});
 assert.equal(calls[0].url,'https://example.database.meoo.xyz/rest/v1/rpc/miaoye_social_feed');
 assert.equal(calls[0].options.headers.get('Authorization'),'Bearer user-jwt');
 assert.equal(calls[0].options.headers.get('apikey'),'public-anon');
 await window.fetch('https://s7ianzbg94fw.meoo.run/cloud/auth/v1/token?grant_type=password',{method:'POST',body:'{}'});
 assert.equal(calls[1].options.headers.get('Authorization'),'Bearer public-anon');
 await assert.rejects(window.fetch('https://s7ianzbg94fw.meoo.run/cloud/rest/v1/unrelated_table'),/不支持/);
});
test('Apple app has standalone install metadata, real PNG icons, and does not cache cloud requests',()=>{
 const manifest=JSON.parse(fs.readFileSync(new URL('manifest.webmanifest',web)));
 assert.equal(manifest.display,'standalone');assert.equal(manifest.start_url,'./index.html?view=c');
 for(const icon of manifest.icons){const png=fs.readFileSync(new URL(icon.src,web));assert.equal(png.subarray(1,4).toString(),'PNG');const size=Number(icon.sizes.split('x')[0]);assert.equal(png.readUInt32BE(16),size);assert.equal(png.readUInt32BE(20),size)}
 for(const name of ['index.html','notebook.html']){const html=fs.readFileSync(new URL(name,web),'utf8');assert.match(html,/apple-mobile-web-app-capable/);assert.match(html,/viewport-fit=cover/);assert.match(html,/apple-app.js/)}
 const sw=fs.readFileSync(new URL('service-worker.js',web),'utf8');assert.match(sw,/url.origin!==self.location.origin/);assert.match(sw,/\/cloud\//);assert.match(sw,/event.request.method!=='GET'/);
});
