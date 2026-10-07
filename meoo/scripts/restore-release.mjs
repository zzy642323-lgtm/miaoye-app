import fs from 'node:fs/promises';
import path from 'node:path';
import {gunzipSync,inflateRawSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const patch=JSON.parse(gunzipSync(await fs.readFile(new URL('./apk-update.json.gz',import.meta.url))));
const downloads=new URL('../web/downloads/',import.meta.url);
await fs.mkdir(downloads,{recursive:true});
const baseFile=new URL('miaoye-0.17.0-test.apk',downloads);
let base;try{base=await fs.readFile(baseFile);}catch{}
if(!base||hash(base)!==patch.baseSha256){
  const url=process.env.MIAOYE_APK_BASE_URL||'https://s7ianzbg94fw.meoo.run/downloads/miaoye-0.17.0-test.apk';
  const response=await fetch(url,{signal:AbortSignal.timeout(240000)});
  if(!response.ok)throw Error('Cannot download the previously published release');
  base=Buffer.from(await response.arrayBuffer());
  if(hash(base)!==patch.baseSha256)throw Error('Published base APK checksum mismatch');
  await fs.writeFile(baseFile,base);
}
const apk=Buffer.concat(patch.operations.map(op=>'offset' in op?base.subarray(op.offset,op.offset+op.length):Buffer.from(op.data,'base64')));
if(apk.length!==patch.size||hash(apk)!==patch.sha256)throw Error('Reconstructed APK checksum mismatch');
await fs.writeFile(new URL(patch.filename,downloads),apk);
// Read ZIP central directory; do not treat the APK signing block as ZIP entries.
let end=apk.length-22;while(end>=Math.max(0,apk.length-65557)&&apk.readUInt32LE(end)!==0x06054b50)end--;
if(end<0)throw Error('ZIP directory missing');
let cursor=apk.readUInt32LE(end+16),count=apk.readUInt16LE(end+10),restored=0;
const root=path.resolve(fileURLToPath(new URL('../web/',import.meta.url)));
for(let n=0;n<count;n++){
  if(apk.readUInt32LE(cursor)!==0x02014b50)throw Error('Invalid ZIP entry');
  const method=apk.readUInt16LE(cursor+10),size=apk.readUInt32LE(cursor+20),nameLength=apk.readUInt16LE(cursor+28),extra=apk.readUInt16LE(cursor+30),comment=apk.readUInt16LE(cursor+32),offset=apk.readUInt32LE(cursor+42);
  const name=apk.subarray(cursor+46,cursor+46+nameLength).toString();cursor+=46+nameLength+extra+comment;
  if(!/^assets\/web\/(assets|models|vendor)\//.test(name)||name.endsWith('/'))continue;
  const relative=name.slice('assets/web/'.length);
  if(relative.split('/').some(x=>x==='..'||x.includes('\\')))throw Error('Unsafe ZIP path');
  const begin=offset+30+apk.readUInt16LE(offset+26)+apk.readUInt16LE(offset+28);
  const packed=apk.subarray(begin,begin+size),bytes=method===0?packed:method===8?inflateRawSync(packed):null;
  if(!bytes)throw Error('Unsupported ZIP compression');
  const target=path.resolve(root,relative);if(!target.startsWith(root+path.sep))throw Error('Outside asset root');
  await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,bytes);restored++;
}
console.log('Verified release restored:',patch.filename,patch.sha256,restored,'bundled resources');
