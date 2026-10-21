const fs=require('fs'),path=require('path'),crypto=require('crypto');
const source=path.resolve(__dirname,'..'),checkout=path.resolve(source,'..'),output=path.join(source,'.sites-runtime/meoo-web-thin');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function main(){
 let ref=fs.readFileSync(path.join(checkout,'.git/HEAD'),'utf8').trim();
 if(ref.startsWith('ref: ')){const name=ref.slice(5);try{ref=fs.readFileSync(path.join(checkout,'.git',name),'utf8').trim()}catch{ref=fs.readFileSync(path.join(checkout,'.git/packed-refs'),'utf8').split(/\r?\n/).find(line=>line.endsWith(' '+name))?.split(' ')[0]||name}}
 const inventory=JSON.parse(fs.readFileSync(path.join(__dirname,'web-assets.json'),'utf8'));
 const remote=new Map(inventory.map(entry=>[entry.path,entry]));
 fs.mkdirSync(output,{recursive:true});fs.mkdirSync(path.join(output,'scripts'),{recursive:true});fs.mkdirSync(path.join(output,'web'),{recursive:true});
 for(const name of ['package.json','server.mjs','cloud-proxy.mjs'])fs.copyFileSync(path.join(source,name),path.join(output,name));
 const assets=[];let localBytes=0;
 function copy(directory){for(const e of fs.readdirSync(path.join(source,directory),{withFileTypes:true})){
  const relative=directory+'/'+e.name,from=path.join(source,relative),to=path.join(output,relative);
  if(e.isDirectory()){if(relative!=='web/downloads')copy(relative);continue}
  if(e.name==='AGENTS.md')continue;
  const data=fs.readFileSync(from);fs.mkdirSync(path.dirname(to),{recursive:true});
  if(data.length>65536&&/\.(?:png|jpg|webp|ttf|onnx|wasm)$/.test(relative)){
   const entry=remote.get(relative);if(!entry||entry.size!==data.length||entry.sha256!==hash(data))throw Error('Published resource missing or changed: '+relative);
   if(!entry.sources.every(source=>{const u=new URL(source);return u.protocol==='https:'&&!u.username&&!u.password&&['s7ianzbg94fw.meoo.run','dnu0oysda99yukul.database.meoo.xyz'].includes(u.hostname)}))throw Error('Unexpected resource source');
   assets.push(entry);
  }else{fs.writeFileSync(to,data);localBytes+=data.length}
 }}
 copy('web');
 const release=JSON.parse(fs.readFileSync(path.join(source,'scripts/release.json'),'utf8'));
 assets.push({path:'web/downloads/'+release.filename,size:release.size,sha256:release.sha256,sources:['https://dnu0oysda99yukul.database.meoo.xyz/storage/v1/object/public/miaoye-updates/'+release.filename]});
 fs.writeFileSync(path.join(output,'source-assets.json'),JSON.stringify(assets),{mode:0o600});
 fs.copyFileSync(path.join(__dirname,'recover-web-assets.mjs'),path.join(output,'scripts/recover-assets.mjs'));
 fs.writeFileSync(path.join(output,'scripts/setup.sh'),'#!/bin/sh\nset -eu\ncd "$(dirname "$0")/.."\nnode scripts/recover-assets.mjs\nnode --check server.mjs\n');
 fs.copyFileSync(path.join(source,'scripts/start.sh'),path.join(output,'scripts/start.sh'));
 fs.writeFileSync(path.join(output,'.dockerignore'),'.git\n.env\n.meoo\nnode_modules\n');
 console.log(JSON.stringify({sourceRef:ref,verifiedResources:assets.length,localBytes,output:'.sites-runtime/meoo-web-thin'}));
}
main().catch(error=>{console.error(error.message);process.exitCode=1});
