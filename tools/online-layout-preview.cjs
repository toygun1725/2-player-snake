// Local-only regression preview. Production HTML/server remain unmodified.
// Run: node tools/online-layout-preview.cjs ; open http://127.0.0.1:8765
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const Module = require('node:module');
const root = path.resolve(__dirname, '..');
const serverFile = path.join(root, 'Ana Dosya/Server/Mobile/server.js');
const serverModule = new Module(serverFile, module);
serverModule.filename = serverFile;
serverModule.paths = Module._nodeModulePaths(path.dirname(serverFile));
let serverSource = fs.readFileSync(serverFile, 'utf8');
serverSource = serverSource.replace('server.listen(PORT,', "server.listen(0, '127.0.0.1',");
serverModule._compile(serverSource + '\nmodule.exports = { server, rooms, initGameInRoom, io };', serverFile);
const gameServer = serverModule.exports;
const sourceFile = path.join(root, 'Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.5.2.html');
const bridge = fs.readFileSync(path.join(root, 'Ana Dosya/iOS/TwoPlayerSnake/Bridge/ios_bridge_bootstrap.js'), 'utf8');
const nativeCss = bridge.match(/style\.textContent = `([\s\S]*?)`;/)[1];

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  res.setHeader('Cache-Control', 'no-store');
  if (url.pathname === '/') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8'); return res.end(fs.readFileSync(path.join(root, 'tests/fixtures/online-layout-preview.html'), 'utf8'));
  }
  if (url.pathname === '/socket.io.js') {
    res.setHeader('Content-Type', 'application/javascript');
    return res.end(fs.readFileSync(path.join(root, 'Ana Dosya/Server/Mobile/node_modules/socket.io-client/dist/socket.io.min.js')));
  }
  if (url.pathname === '/game') {
    const ios = url.searchParams.get('device') === 'iphone';
    let html = fs.readFileSync(sourceFile, 'utf8');
    html = html.replace(/^[ \t]*<script[^>]*\bsrc="https:[^"]*"[^>]*>[\s\S]*?<\/script>/gm, '');
    html = html.replaceAll('https://cdn.socket.io/4.7.5/socket.io.min.js', '/socket.io.js');
    html = html.replace(/https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js[^"']*/g, '/ads-disabled.js');
    html = html.replace('const SPLASH_DURATION_MS = 2000;', 'const SPLASH_DURATION_MS = 10;');
    html = html.replace('})();</script>', fs.readFileSync(path.join(root, 'tests/fixtures/online-layout-hooks.js'), 'utf8') + '\n})();</script>');
    html = html.replace('</head>', `<style>${ios ? nativeCss : ''}</style><script>window.__layoutServer = 'http://127.0.0.1:${gameServer.server.address().port}';</script></head>`);
    // Chromium cannot emulate an iPhone notch; inject the same CSS inset values.
    html = html.replace(/env\(safe-area-inset-top(?:,\s*0px)?\)/g, ios ? '59px' : '0px');
    html = html.replace(/env\(safe-area-inset-bottom(?:,\s*0px)?\)/g, ios ? '34px' : '0px');
    res.setHeader('Content-Type', 'text/html; charset=utf-8'); return res.end(html);
  }
  if (url.pathname === '/next-round' && req.method === 'POST') {
    const room = gameServer.rooms[url.searchParams.get('room')];
    if (!room) { res.statusCode = 404; return res.end('missing room'); }
    gameServer.initGameInRoom(room);
    return res.end('ok');
  }
  res.statusCode = 404; res.end('Not found');
}).listen(8765, '127.0.0.1', () => console.log('Layout preview: http://127.0.0.1:8765'));
