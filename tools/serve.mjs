/**
 * Static development server.
 *
 * The app uses ES modules and a web worker, so it cannot be opened from
 * `file://`. This serves the repository as-is on http://localhost:8000.
 *
 * Usage: node tools/serve.mjs [port]
 */

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.argv[2]) || 8000;

const CONTENT_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.wasm': 'application/wasm',
    '.gz': 'application/octet-stream',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.pdf': 'application/pdf',
};

http.createServer((request, response) => {
    const url = new URL(request.url, `http://localhost:${PORT}`);
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.join(ROOT, relative);

    // Refuse anything that escapes the repository.
    if (!file.startsWith(ROOT)) {
        response.writeHead(403).end('Forbidden');
        return;
    }

    fs.readFile(file, (error, data) => {
        if (error) {
            response.writeHead(404, { 'content-type': 'text/plain' }).end('Not found');
            return;
        }
        response.writeHead(200, {
            'content-type': CONTENT_TYPES[path.extname(file)] || 'application/octet-stream',
            'cache-control': 'no-cache',
        }).end(data);
    });
}).listen(PORT, () => {
    console.log(`Serving ${ROOT} on http://localhost:${PORT}`);
});
