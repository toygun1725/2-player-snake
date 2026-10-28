'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');

function settings(path) {
  const result = JSON.parse(fs.readFileSync(path, 'utf8'));
  const target = result.find(item => item.target === 'TwoPlayerSnake');
  assert.ok(target && target.buildSettings, 'TwoPlayerSnake settings are unavailable');
  return target.buildSettings;
}

const debug = settings(process.argv[2]);
const release = settings(process.argv[3]);
assert.equal(debug.SNAKE_CLOUDKIT_CONTAINER_ID, 'iCloud.com.twoplayersnake.app');
assert.equal(debug.CODE_SIGN_ENTITLEMENTS, 'TwoPlayerSnake/CloudKit.staged.entitlements');
assert.equal(release.SNAKE_CLOUDKIT_CONTAINER_ID || '', '');
assert.equal(release.CODE_SIGN_ENTITLEMENTS, 'TwoPlayerSnake/TwoPlayerSnake.entitlements');
assert.equal(debug.PRODUCT_BUNDLE_IDENTIFIER, 'com.twoplayersnake.app');
assert.equal(release.PRODUCT_BUNDLE_IDENTIFIER, 'com.twoplayersnake.app');
if (process.argv[4]) {
  const testflight = settings(process.argv[4]);
  assert.equal(testflight.SNAKE_CLOUDKIT_CONTAINER_ID, 'iCloud.com.twoplayersnake.app');
  assert.equal(testflight.CODE_SIGN_ENTITLEMENTS, 'TwoPlayerSnake/CloudKit.staged.entitlements');
  assert.equal(testflight.PRODUCT_BUNDLE_IDENTIFIER, 'com.twoplayersnake.app');
}
console.log('Xcode Debug configuration, Release safety gate, and optional TestFlight settings passed.');
