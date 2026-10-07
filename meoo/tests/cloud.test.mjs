import {test} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {once} from 'node:events';
import {cloudProxy} from '../cloud-proxy.mjs';
test('cloud proxy rejects other origins, missing JWT, traversal and privileged APIs; preserves user JWT',async()=>{
  const calls=[];
  const server=http.createServer(async(req,res)=>{if(!await cloudProxy(req,res,new URL(req.url,'http://local'),{SUPABASE_URL:'https://cloud.test/sb-api',SUPABASE_ANON_KEY:'public-anon',SUPABASE_SERVICE_ROLE_KEY:'NEVER_FORWARD'},async(url,opts)=>{calls.push({url,opts});return new Response('{"ok":true}');})){res.writeHead(404);res.end();}}).listen(0,'127.0.0.1');
  await once(server,'listening');const base='http://127.0.0.1:'+server.address().port;
  try{
    assert.equal((await fetch(base+'/cloud/rest/v1/miaoye_backups')).status,401);
    assert.equal((await fetch(base+'/cloud/auth/v1/admin/users')).status,404);
    assert.equal((await fetch(base+'/cloud/auth/v1/signup',{headers:{Origin:'https://evil.test'}})).status,403);
    assert.equal((await fetch(base+'/cloud/storage/v1/object/public/miaoye-private/a/b/c.json')).status,404);
    const preflight=await fetch(base+'/cloud/rest/v1/miaoye_backups',{method:'OPTIONS',headers:{Origin:'https://appassets.androidplatform.net'}});assert.equal(preflight.status,204);assert.equal(preflight.headers.get('access-control-allow-origin'),'https://appassets.androidplatform.net');
    const result=await fetch(base+'/cloud/rest/v1/miaoye_backups?select=*',{headers:{Authorization:'Bearer user.token',Origin:'https://appassets.androidplatform.net'}});assert.equal(result.status,200);assert.equal(calls.length,1);assert.equal(calls[0].opts.headers.Authorization,'Bearer user.token');assert.equal(calls[0].opts.headers.apikey,'public-anon');assert.equal(calls[0].url,'https://cloud.test/sb-api/rest/v1/miaoye_backups?select=*');assert.doesNotMatch(JSON.stringify(calls),/NEVER_FORWARD/);
  }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
