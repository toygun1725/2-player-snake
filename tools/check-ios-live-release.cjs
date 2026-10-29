'use strict';

// A release candidate uses the live HTTPS game, so do not sign or upload it
// until that game is exactly the reviewed version packaged as the fallback.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const url = 'https://2playersnake.com/wp-content/uploads/game-mobile/index.html';
const fallback = path.join(root, 'Ana Dosya/iOS/TwoPlayerSnake/Resources/Offline/mobile_offline_fallback.html');
const mobile = path.join(root, 'Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.6.5.html');
const maxBytes = 8 * 1024 * 1024;

function verify(actual, localFallback, mobileSource) {
  if (![actual, localFallback, mobileSource].every(Buffer.isBuffer)) throw new Error('Game sources are unavailable.');
  const text = localFallback.toString('utf8');
  if (!/const VERSION\s*=\s*['"]v3\.6\.5['"]/.test(text) ||
      !text.includes('saveCloudState') || !text.includes('onCloudSaveSyncResult')) {
    throw new Error('The bundled game is not the expected CloudKit-compatible v3.6.5 source.');
  }
  const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
  if (hash(localFallback) !== hash(mobileSource)) throw new Error('Bundled and reviewed mobile game differ.');
  if (hash(actual) !== hash(localFallback)) throw new Error('The live mobile game does not match the reviewed v3.6.5 game.');
}

async function main() {
  const expected = fs.readFileSync(fallback);
  const reviewed = fs.readFileSync(mobile);
  const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(20000) });
  if (!response.ok || !response.body) throw new Error(`Live mobile game request failed (HTTP ${response.status}).`);
  const chunks = [];
  let bytes = 0;
  for await (const chunk of response.body) {
    bytes += chunk.length;
    if (bytes > maxBytes) throw new Error('Live mobile game is unexpectedly large.');
    chunks.push(Buffer.from(chunk));
  }
  verify(Buffer.concat(chunks), expected, reviewed);
  console.log('Live mobile game matches the reviewed v3.6.5 source and bundled fallback.');
}

if (require.main === module) main().catch(error => {
  console.error(`Release candidate blocked: ${error.message}`);
  process.exitCode = 1;
});
module.exports = { verify };
