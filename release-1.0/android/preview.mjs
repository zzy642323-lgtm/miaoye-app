import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const port=Number(process.env.MIAOYE_PREVIEW_PORT||4175);
const root=fileURLToPath(new URL('../.sites-runtime/android-build/assets/web/',import.meta.url));
http.createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://127.0.0.1:4175').pathname;const name=pathname==='/'?'index.html':pathname.slice(1);const p=path.resolve(root,name);if(!p.startsWith(root))throw Error('Invalid path');const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.ttf':'font/ttf','.webp':'image/webp'};const data=await fs.readFile(p);res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);}catch{res.writeHead(404);res.end();}}).listen(port,'127.0.0.1',()=>console.log(`Android bundled UI preview http://127.0.0.1:${port}/`));
