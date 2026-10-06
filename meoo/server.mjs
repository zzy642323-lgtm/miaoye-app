import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const web = path.resolve(fileURLToPath(new URL('./web/', import.meta.url)));
const types = {'.mjs':'text/javascript; charset=utf-8','.wasm':'application/wasm','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.ttf':'font/ttf','.apk':'application/vnd.android.package-archive'};
export function createServer() {
  return http.createServer(async (req, res) => {
    const send = (status, type, body) => {
      res.writeHead(status, {'Content-Type':type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
      res.end(req.method === 'HEAD' ? undefined : body);
    };
    try {
      const url = new URL(req.url, 'http://localhost');
      const name = decodeURIComponent(url.pathname);
      if (name === '/api/me' && ['GET','HEAD'].includes(req.method)) return send(200, types['.js'].replace('text/javascript','application/json'), '{"authenticated":false}');
      if (name.startsWith('/api/')) return send(401, 'application/json; charset=utf-8', '{"error":"此版本使用设备上的手账，暂未开放云同步。"}');
      if (!['GET','HEAD'].includes(req.method)) return send(405, 'text/plain', 'Method not allowed');
      const relative = name === '/' ? 'index.html' : name.slice(1);
      if (relative.split(/[\\/]/).some(part => part === '..' || part.startsWith('.')) || relative.includes('\0')) return send(403, 'text/plain', 'Forbidden');
      const file = path.resolve(web, relative);
      if (!file.startsWith(web + path.sep)) return send(403, 'text/plain', 'Forbidden');
      const bytes = await fs.readFile(file);
      res.setHeader('Content-Length', bytes.length);
      send(200, types[path.extname(file)] || 'application/octet-stream', bytes);
    } catch (error) {
      send(error instanceof URIError ? 400 : error.code === 'ENOENT' || error.code === 'EISDIR' ? 404 : 500, 'text/plain; charset=utf-8', 'Unable to load this page');
    }
  });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 9000);
  createServer().listen(port, '0.0.0.0', () => console.log(`Miaoye ready on port ${port}`));
}
