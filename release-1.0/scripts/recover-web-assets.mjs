import fs from 'node:fs/promises';import path from 'node:path';import {createHash} from 'node:crypto';
const root=process.cwd(),entries=JSON.parse(await fs.readFile('source-assets.json','utf8'));let next=0,done=0;
const digest=b=>createHash('sha256').update(b).digest('hex');
async function recover(entry){
 if(!/^web\/(?:assets|engine\/(?:models|vendor)|downloads)\/[a-zA-Z0-9_.-]+$/.test(entry.path)||!entry.sources.length)throw Error('Invalid asset manifest');
 const destination=path.resolve(root,entry.path);if(!destination.startsWith(root+path.sep))throw Error('Invalid asset destination');
 let data;
 try{const existing=await fs.readFile(destination);if(existing.length===entry.size&&digest(existing)===entry.sha256)return}catch{}
 for(const source of entry.sources){
  const url=new URL(source);if(url.protocol!=='https:'||url.username||url.password||!['s7ianzbg94fw.meoo.run','raw.githubusercontent.com','dnu0oysda99yukul.database.meoo.xyz'].includes(url.hostname))throw Error('Invalid asset source');
  for(let attempt=0;attempt<6;attempt++){
   try{
    const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(120000)});
    if(response.status===429||response.status>=500){const delay=Math.min(30000,Math.max(1000*2**attempt,(Number(response.headers.get('retry-after'))||0)*1000));await response.body?.cancel();console.log('Waiting to retry resource: '+entry.path+' HTTP '+response.status);await new Promise(resolve=>setTimeout(resolve,delay));continue}
    if(!response.ok){console.log('Resource source HTTP '+response.status+': '+entry.path);await response.body?.cancel();break}
    const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length===entry.size&&digest(bytes)===entry.sha256){data=bytes;break}
    console.log('Resource checksum rejected: '+entry.path);break;
   }catch(error){console.log('Resource source unavailable: '+entry.path+' ('+(error.cause?.code||error.name)+')');if(attempt<5)await new Promise(resolve=>setTimeout(resolve,Math.min(30000,1000*2**attempt)))}
  }
  if(data)break;
 }
 if(!data)throw Error('Could not recover verified asset: '+entry.path);
 await fs.mkdir(path.dirname(destination),{recursive:true});await fs.writeFile(destination,data);
}
async function worker(){while(next<entries.length){const entry=entries[next++];await recover(entry);done++;if(done%10===0||done===entries.length)console.log('Verified release resources '+done+'/'+entries.length);await new Promise(resolve=>setTimeout(resolve,250))}}
try{await Promise.all(Array.from({length:2},worker));await fs.unlink('source-assets.json');console.log('All release resources match their SHA-256 checksums')}catch(error){console.error(error.message);process.exitCode=1}
