import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
const allowed = new Set(['index.html','styles.css','app.js','favicon.svg']);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};
http.createServer(async (req,res) => {
  const name = new URL(req.url, 'http://localhost').pathname.replace(/^\/(?:direct-source\/)?/, '') || 'index.html';
  if (!allowed.has(name)) { res.writeHead(404); return res.end('Not found'); }
  try { const content = await readFile(new URL(`../docs/${name}`, import.meta.url)); res.writeHead(200, {'Content-Type':types[extname(name)],'Cache-Control':'no-store'}); res.end(content); }
  catch { res.writeHead(500); res.end('Run npm run build first'); }
}).listen(4173, '127.0.0.1', () => console.log('Preview: http://127.0.0.1:4173/direct-source/'));
