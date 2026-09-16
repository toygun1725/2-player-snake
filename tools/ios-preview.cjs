// Local-only browser fixture. It never calls production AdMob or StoreKit.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const nativeRoot = path.join(root, 'Ana Dosya/iOS/TwoPlayerSnake');
const port = Number(process.env.SNAKE_PREVIEW_PORT || 8765);
const mime = { '.css': 'text/css', '.js': 'application/javascript', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${port}`);
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/webfonts/')) {
    const leaf = path.posix.basename(url.pathname);
    if (!/^[a-zA-Z0-9._-]+$/.test(leaf)) { res.writeHead(404).end(); return; }
    const asset = leaf === 'logo.png'
      ? path.join(nativeRoot, 'Resources/Offline/offline_logo.png')
      : path.join(nativeRoot, 'Resources/WebAssets', leaf);
    if (!fs.existsSync(asset)) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': mime[path.extname(asset)] || 'application/octet-stream' });
    res.end(fs.readFileSync(asset)); return;
  }
  if (url.pathname !== '/') { res.writeHead(404).end(); return; }
  const file = url.searchParams.get('source') === 'offline'
    ? path.join(nativeRoot, 'Resources/Offline/mobile_offline_fallback.html')
    : path.join(root, 'Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.3.5.html');
  let html = fs.readFileSync(file, 'utf8');
  if (url.searchParams.get('platform') !== 'web') {
    let bridge = fs.readFileSync(path.join(nativeRoot, 'Bridge/ios_bridge_bootstrap.js'), 'utf8');
    bridge = bridge.replace('snake-asset://bundle/', `http://127.0.0.1:${port}/assets/`);
    const mock = `window.__nativeMessages = []; window.webkit = { messageHandlers: { iOS: { postMessage: function(m) {
      window.__nativeMessages.push(m);
      if (m.action === 'adBreak') { var p = JSON.parse(m.payload); setTimeout(function() { window.__onNativeAdDone(p.callbackId, false); }, 0); }
    } } } };`;
    html = html.replace('<head>', '<head><script>' + mock + bridge + '</script>');
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(html);
});
server.listen(port, '127.0.0.1', () => console.log(`iOS fixture: http://127.0.0.1:${port}/`));
