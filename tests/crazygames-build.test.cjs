const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const crazyGamesDir = path.join(rootDir, 'Ana Dosya', 'CrazyGames');
const indexHtmlPath = path.join(crazyGamesDir, 'index.html');
const logoPath = path.join(crazyGamesDir, 'logo.webp');
const zipPath = path.join(crazyGamesDir, '2playersnake-crazygames.zip');

test('CrazyGames directory and required files exist', () => {
  assert.equal(fs.existsSync(crazyGamesDir), true, 'CrazyGames directory should exist');
  assert.equal(fs.existsSync(indexHtmlPath), true, 'index.html should exist');
  assert.equal(fs.existsSync(logoPath), true, 'logo.webp should exist');
  assert.equal(fs.existsSync(zipPath), true, '2playersnake-crazygames.zip should exist');
});

test('CrazyGames index.html has SDK v3 and NO Google AdSense references', () => {
  const content = fs.readFileSync(indexHtmlPath, 'utf8');

  // Must include CrazyGames SDK v3
  assert.match(content, /https:\/\/sdk\.crazygames\.com\/crazygames-sdk-v3\.js/, 'Should load CrazyGames SDK v3');
  assert.match(content, /window\.CrazyGames\.SDK\.init\(\)/, 'Should initialize CrazyGames SDK v3');

  // Must strictly omit Google AdSense for Games / pagead2 / adsbygoogle
  assert.doesNotMatch(content, /pagead2\.googlesyndication\.com/, 'Should NOT include Google AdSense script');
  assert.doesNotMatch(content, /adsbygoogle/, 'Should NOT include adsbygoogle');
  assert.doesNotMatch(content, /window\.__h5GamesAdsReady/, 'Should NOT include AdSense __h5GamesAdsReady flag');
  assert.doesNotMatch(content, /adBreak\s*=\s*adConfig/, 'Should NOT include AdSense adBreak shim');
});

test('CrazyGames index.html implements CrazyGames lifecycle, ad methods, and safety timers', () => {
  const content = fs.readFileSync(indexHtmlPath, 'utf8');

  // Gameplay lifecycle hooks
  assert.match(content, /function crazyGamesGameplayStart\(\)/, 'Should define crazyGamesGameplayStart');
  assert.match(content, /function crazyGamesGameplayStop\(\)/, 'Should define crazyGamesGameplayStop');
  assert.match(content, /window\.CrazyGames\.SDK\.game\.gameplayStart\(\)/, 'Should call SDK gameplayStart');
  assert.match(content, /window\.CrazyGames\.SDK\.game\.gameplayStop\(\)/, 'Should call SDK gameplayStop');

  // Audio muting during ads
  assert.match(content, /function muteGameAudioForAd\(\)/, 'Should define muteGameAudioForAd');
  assert.match(content, /function unmuteGameAudioAfterAd\(\)/, 'Should define unmuteGameAudioAfterAd');

  // Midgame interstitial and rewarded ads
  assert.match(content, /window\.CrazyGames\.SDK\.ad\.requestAd\(["']midgame["']/, 'Should request midgame interstitial ad');
  assert.match(content, /window\.CrazyGames\.SDK\.ad\.requestAd\(["']rewarded["']/, 'Should request rewarded ad');

  // Ad safety timer fallback to avoid freeze
  assert.match(content, /8500/, 'Should include 8.5s fallback safety timer for ads');

  // Async adblock check
  assert.match(content, /window\.__crazyGamesAdblockActive/, 'Should track adblocker status');

  // Hooks attached to game events
  assert.match(content, /crazyGamesGameplayStart\(\);[\s\S]*?hideBanner\(\);/, 'Should hook gameplayStart into unpause');
  assert.match(content, /crazyGamesGameplayStop\(\);[\s\S]*?showBanner\(/, 'Should hook gameplayStop into pause');
});

test('CrazyGames index.html includes sandboxed iframe defenses', () => {
  const content = fs.readFileSync(indexHtmlPath, 'utf8');

  // Safe localStorage in-memory fallback
  assert.match(content, /memoryStorage/, 'Should include safe in-memory localStorage fallback for iframe SecurityError');

  // Focus on pointerdown
  assert.match(content, /window\.focus\(\)/, 'Should ensure iframe grabs keyboard focus on click');
});

test('CrazyGames index.html inline scripts parse cleanly with no syntax errors', () => {
  const content = fs.readFileSync(indexHtmlPath, 'utf8');
  const scriptMatches = [...content.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi)];
  assert.ok(scriptMatches.length >= 2, 'Should find inline scripts');

  for (let i = 0; i < scriptMatches.length; i++) {
    const code = scriptMatches[i][1];
    assert.doesNotThrow(() => {
      new vm.Script(code, { filename: `inline-script-${i}.js` });
    }, `Inline script ${i} should parse without syntax errors`);
  }
});

test('2playersnake-crazygames.zip archive has index.html and logo.webp at root', () => {
  const tarOutput = execSync(`tar -tf "${zipPath}"`, { encoding: 'utf8' }).trim();
  const entries = tarOutput.split(/\r?\n/).map(e => e.trim()).filter(Boolean);

  assert.ok(entries.includes('index.html'), 'ZIP archive must contain index.html at root');
  assert.ok(entries.includes('logo.webp'), 'ZIP archive must contain logo.webp at root');

  // Ensure entries are not in a nested directory
  for (const entry of entries) {
    assert.equal(entry.includes('/'), false, `Entry ${entry} should be at archive root, not nested in a subdirectory`);
  }
});
