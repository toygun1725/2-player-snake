// Loopback-only localization acceptance UI; production sources have no test hooks.
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  res.setHeader('Cache-Control', 'no-store');
  if (url.pathname === '/ads-disabled.js') {
    res.setHeader('Content-Type', 'application/javascript');
    return res.end('// Ads are disabled in the loopback acceptance fixture.');
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (url.pathname === '/') return res.end(fs.readFileSync(path.join(root, 'tests/fixtures/localization-preview.html')));
  if (url.pathname !== '/game') { res.statusCode = 404; return res.end('Not found'); }
  const kind = url.searchParams.get('kind') === 'PC' ? 'PC' : 'Mobile';
  let source = fs.readFileSync(path.join(root, `Ana Dosya/${kind}/Beta/v3/2 Player Snake ${kind} v3.5.2.html`), 'utf8');
  source = source.replace(/^[ \t]*<script[^>]*\bsrc="https:[^"]*"[^>]*>[\s\S]*?<\/script>/gm, '');
  source = source.replace('const SPLASH_DURATION_MS = 2000;', 'const SPLASH_DURATION_MS = 10;');
  // Disable network version checks and ad SDK loading in this local fixture.
  source = source.replace(/function scheduleVersionCheck\([^)]*\) \{/, '$& return;');
  source = source.replace(/https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js[^"']*/g, '/ads-disabled.js');
  source = source.replace(/env\(safe-area-inset-top(?:,\s*0px)?\)/g, url.searchParams.has('safe') ? '59px' : '0px');
  source = source.replace(/env\(safe-area-inset-bottom(?:,\s*0px)?\)/g, url.searchParams.has('safe') ? '34px' : '0px');
  const close = source.lastIndexOf('})();');
  source = source.slice(0, close) + fs.readFileSync(path.join(root, 'tests/fixtures/localization-hooks.js'), 'utf8') + '\n' + source.slice(close);
  res.end(source);
}).listen(8766, '127.0.0.1', () => console.log('Localization preview: http://127.0.0.1:8766'));
