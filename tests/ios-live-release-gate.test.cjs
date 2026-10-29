'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { verify } = require('../tools/check-ios-live-release.cjs');
const { mode } = require('../tools/check-ios-release-mode.cjs');
const { check } = require('../tools/check-ios-source-readiness.cjs');

test('iOS build requires exactly one explicitly selected cloud mode', () => {
  assert.equal(mode({ SNAKE_ENABLE_TESTFLIGHT_CLOUDKIT: 'true', SNAKE_ENABLE_RELEASE_CLOUDKIT: 'false' }), 'internal');
  assert.equal(mode({ SNAKE_ENABLE_TESTFLIGHT_CLOUDKIT: 'false', SNAKE_ENABLE_RELEASE_CLOUDKIT: 'true' }), 'release');
  assert.throws(() => mode({}), /exactly one/);
  assert.throws(() => mode({ SNAKE_ENABLE_TESTFLIGHT_CLOUDKIT: 'false', SNAKE_ENABLE_RELEASE_CLOUDKIT: 'false' }), /exactly one/);
  assert.throws(() => mode({ SNAKE_ENABLE_TESTFLIGHT_CLOUDKIT: 'true', SNAKE_ENABLE_RELEASE_CLOUDKIT: 'true' }), /exactly one/);
  assert.throws(() => mode({ SNAKE_ENABLE_TESTFLIGHT_CLOUDKIT: 'TRUE' }), /Unknown/);
});

test('live release only accepts matching reviewed CloudKit-compatible game sources', () => {
  const reviewed = fs.readFileSync('Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.6.5.html');
  const bundled = fs.readFileSync('Ana Dosya/iOS/TwoPlayerSnake/Resources/Offline/mobile_offline_fallback.html');
  assert.doesNotThrow(() => verify(reviewed, bundled, reviewed));
  assert.throws(() => verify(Buffer.from('old live game'), bundled, reviewed), /live mobile game/i);
  assert.throws(() => verify(reviewed, bundled, Buffer.from('different reviewed game')), /Bundled and reviewed/);
  assert.throws(() => verify(Buffer.from('v3.6.5'), Buffer.from('v3.6.5'), Buffer.from('v3.6.5')), /CloudKit-compatible/);
  assert.throws(() => verify(null, bundled, reviewed), /unavailable/);
});

test('current checkout contains the required iOS and mobile source set', () => {
  assert.doesNotThrow(() => check());
});

test('old or incomplete checkout cannot be signed as the new release', () => {
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'snake-old-source-'));
  try { assert.throws(() => check(empty), /ENOENT/); }
  finally { fs.rmdirSync(empty); }
});
