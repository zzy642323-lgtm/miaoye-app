import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import worker from './src/worker.js';
const root=path.dirname(fileURLToPath(import.meta.url));
await fs.mkdir(path.join(root,'.sites-runtime'),{recursive:true});
const db=new DatabaseSync(path.join(root,'.sites-runtime/preview.sqlite'));
db.exec('CREATE TABLE IF NOT EXISTS local_migrations (name TEXT PRIMARY KEY)');
try{for(const name of (await fs.readdir(path.join(root,'drizzle'))).filter(n=>n.endsWith('.sql')).sort())if(!db.prepare('SELECT name FROM local_migrations WHERE name=?').get(name)){db.exec(await fs.readFile(path.join(root,'drizzle',name),'utf8'));db.prepare('INSERT INTO local_migrations(name) VALUES(?)').run(name);}}catch(error){if(error.code!=='ENOENT')throw error;}
const DB={prepare(sql){let values=[];return {bind(...args){values=args;return this;},async first(){return db.prepare(sql).get(...values)||null;},async all(){return {results:db.prepare(sql).all(...values)};},async run(){return db.prepare(sql).run(...values);}};},async batch(statements){db.exec('BEGIN');try{const output=[];for(const s of statements)output.push(await s.run());db.exec('COMMIT');return output;}catch(error){db.exec('ROLLBACK');throw error;}}};
const BUCKET={async put(key,bytes,options){const file=path.join(root,'.sites-runtime/bucket',key);await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,new Uint8Array(bytes));},async get(key){try{return {body:await fs.readFile(path.join(root,'.sites-runtime/bucket',key))};}catch{return null;}},async delete(key){try{await fs.unlink(path.join(root,'.sites-runtime/bucket',key));}catch{}}};
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.webp':'image/webp','.ttf':'font/ttf'};
const ASSETS={async fetch(request){try{let name=decodeURIComponent(new URL(request.url).pathname);if(name==='/')name='/index.html';const web=path.join(root,'web'),file=path.resolve(web,'.'+name);if(!file.startsWith(web+path.sep))return new Response('Forbidden',{status:403});return new Response(await fs.readFile(file),{headers:{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'}});}catch{return new Response('Not found',{status:404});}}};
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://127.0.0.1:4174');const headers=new Headers(req.headers);if(process.env.MIAOYE_LOCAL_AUTH==='1'){const account=url.searchParams.get('tester')==='friend'?'local-friend':'local-owner';headers.set('oai-authenticated-user-id',account);headers.set('oai-authenticated-user-email',account+'@test.invalid');}const chunks=[];for await(const chunk of req)chunks.push(chunk);const bytes=Buffer.concat(chunks);const request=new Request(url,{method:req.method,headers,...(req.method!=='GET'&&req.method!=='HEAD'?{body:bytes}: {})});const response=await worker.fetch(request,{DB,BUCKET,ASSETS});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch(error){res.writeHead(500);res.end(error.message);}});
server.listen(4174,'127.0.0.1',()=>console.log('喵页 v2 preview: http://127.0.0.1:4174'));
