import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webp':'image/webp','.ttf':'font/ttf','.apk':'application/vnd.android.package-archive'};
const assets={};
async function walk(dir,prefix=''){for(const item of await fs.readdir(dir,{withFileTypes:true})){const name=prefix+'/'+item.name;if(item.isDirectory())await walk(path.join(dir,item.name),name);else if(!item.name.endsWith('.idsig')&&item.name!=='app-v1.js'&&item.name!=='social.js'&&(!item.name.endsWith('.apk')||item.name==='miaoye-0.16.0-test.apk')&&!['/assets/coffee.png','/assets/cats.png','/assets/cats-gouache.png','/assets/scenes-gouache.png','/assets/stickers-gouache.png','/assets/stickers-gouache.webp','/assets/cat-actions-v4.png','/assets/cat-actions-v4.webp','/assets/cat-actions-v7.webp','/assets/cat-actions-v8.webp','/assets/cats-gouache.webp'].includes(name)){const bytes=await fs.readFile(path.join(dir,item.name));const binary=/\.(png|webp|ttf|apk)$/.test(item.name);assets[name]={type:types[path.extname(item.name)]||'application/octet-stream',binary,data:binary?bytes.toString('base64'):bytes.toString('utf8')};}}}
await walk(path.join(root,'web'));
const source='const STATIC='+JSON.stringify(assets)+';\n'+await fs.readFile(path.join(root,'src/worker.js'),'utf8');
if(zlib.gzipSync(source).length>9*1024*1024)throw new Error('Worker bundle too large');
await fs.mkdir(path.join(root,'dist/server'),{recursive:true});
await fs.writeFile(path.join(root,'dist/server/index.js'),source);
console.log('Miaoye Worker built: '+Math.round(zlib.gzipSync(source).length/1024)+' KB compressed');

await fs.mkdir(path.join(root,'dist/.openai'),{recursive:true});
await fs.copyFile(path.join(root,'.openai/hosting.json'),path.join(root,'dist/.openai/hosting.json'));
await fs.cp(path.join(root,'drizzle'),path.join(root,'dist/.openai/drizzle'),{recursive:true});
