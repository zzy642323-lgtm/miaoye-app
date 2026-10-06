import {test} from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createHash} from 'node:crypto';
import fs from 'node:fs/promises';
import {createServer} from '../server.mjs';

test('standalone homepage, every packaged asset, local auth and APK are served correctly', async () => {
  const server = createServer().listen(0, '127.0.0.1');
  await once(server, 'listening');
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    const home = await fetch(origin);
    assert.equal(home.status, 200);
    assert.match(await home.text(), /MIAOYE_STANDALONE=true/);
    for (const file of await fs.readdir(new URL('../web/', import.meta.url), {recursive:true})) {
      const local = new URL('../web/' + file.replaceAll('\\','/'), import.meta.url);
      if (!(await fs.stat(local)).isFile()) continue;
      const response = await fetch(origin + '/' + file.replaceAll('\\','/'));
      assert.equal(response.status, 200, file);
      const actual = Buffer.from(await response.arrayBuffer());
      const expected = await fs.readFile(local);
      assert.equal(createHash('sha256').update(actual).digest('hex'), createHash('sha256').update(expected).digest('hex'), file);
    }
    const me = await fetch(origin + '/api/me', {headers:{'oai-authenticated-user-id':'forged','oai-authenticated-user-email':'fake@example.com'}});
    assert.deepEqual(await me.json(), {authenticated:false});
    assert.equal((await fetch(origin + '/api/entries')).status, 401);
    assert.equal((await fetch(origin + '/%2e%2e%2fpackage.json')).status, 403);
    assert.equal((await fetch(origin + '/.env')).status, 403);
    const apk = await fetch(origin + '/downloads/miaoye-0.17.0-test.apk', {method:'HEAD'});
    assert.equal(apk.headers.get('content-type'), 'application/vnd.android.package-archive');
    assert.ok(Number(apk.headers.get('content-length')) > 4000000);
    const images = await (await fetch(origin + '/images.js')).text();
    assert.match(images, /local-ai-cutout.js/);
    assert.doesNotMatch(images, /https:\/\/esm.sh/);
    assert.equal((await fetch(origin + '/vendor/ort-wasm-simd-threaded.mjs', {method:'HEAD'})).headers.get('content-type'), 'text/javascript; charset=utf-8');
    assert.equal((await fetch(origin + '/vendor/ort-wasm-simd-threaded.wasm', {method:'HEAD'})).headers.get('content-type'), 'application/wasm');
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
