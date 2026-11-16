// A tiny static server for playing VOID HARVEST locally (Node 22, standard library
// only): it serves this repository's game/ folder, which is all the game needs —
// plain files, no build step, nothing fetched from the network.
//   node serve.ts        then open http://localhost:8080

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), 'game');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0]);
    const rel = normalize(urlPath === '/' ? '/index.html' : urlPath).replace(/^(\.\.[/\\])+/, '');
    const path = join(root, rel);
    if (!path.startsWith(root)) throw new Error('outside game/');
    const info = await stat(path);
    if (!info.isFile()) throw new Error('not a file');
    res.writeHead(200, { 'content-type': MIME[extname(path).toLowerCase()] ?? 'application/octet-stream' });
    res.end(await readFile(path));
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
  }
});

server.listen(8080, () => console.log('VOID HARVEST at http://localhost:8080'));
