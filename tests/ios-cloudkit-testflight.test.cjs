'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const workflow = fs.readFileSync('.github/workflows/ios-testflight.yml', 'utf8');
const fastfile = fs.readFileSync('Ana Dosya/iOS/fastlane/Fastfile', 'utf8');
const controller = fs.readFileSync('Ana Dosya/iOS/TwoPlayerSnake/ViewController.swift', 'utf8');

test('iCloud TestFlight option is opt-in and wired to the release lane', () => {
  assert.match(workflow, /icloud_testflight:\s*\n(?:[^\n]*\n)*?\s+default:\s*false/);
  assert.match(workflow, /SNAKE_ENABLE_TESTFLIGHT_CLOUDKIT:\s*\$\{\{ inputs\.icloud_testflight \}\}/);
  assert.match(fastfile, /cloudkit_testflight\s*=\s*ENV\["SNAKE_ENABLE_TESTFLIGHT_CLOUDKIT"\]\s*==\s*"true"/);
  assert.match(fastfile, /if cloudkit_testflight\s*\n\s*build_xcargs \+= " CODE_SIGN_ENTITLEMENTS=TwoPlayerSnake\/CloudKit\.staged\.entitlements SNAKE_CLOUDKIT_CONTAINER_ID=iCloud\.com\.twoplayersnake\.app SNAKE_TESTFLIGHT_BUNDLED_GAME=YES"/);
  assert.match(fastfile, /xcargs:\s*build_xcargs/);
  assert.match(fastfile, /upload_to_testflight\(/);
  assert.doesNotMatch(fastfile, /upload_to_app_store\(/);
  assert.match(fastfile, /export_opts\[:testFlightInternalTestingOnly\]\s*=\s*true/);
  assert.match(controller, /if useBundledTestGame\s*\{[\s\S]*?loadHTMLString\(bundledHTML, baseURL: finalUrl\)[\s\S]*?\} else \{[\s\S]*?webView\.load\(request\)/);
});

test('Xcode settings checker accepts opt-in configuration and rejects unsafe defaults', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'snake-cloud-settings-'));
  const debug = { SNAKE_CLOUDKIT_CONTAINER_ID: 'iCloud.com.twoplayersnake.app', CODE_SIGN_ENTITLEMENTS: 'TwoPlayerSnake/CloudKit.staged.entitlements', PRODUCT_BUNDLE_IDENTIFIER: 'com.twoplayersnake.app', SNAKE_TESTFLIGHT_BUNDLED_GAME: 'NO' };
  const release = { SNAKE_CLOUDKIT_CONTAINER_ID: '', CODE_SIGN_ENTITLEMENTS: 'TwoPlayerSnake/TwoPlayerSnake.entitlements', PRODUCT_BUNDLE_IDENTIFIER: 'com.twoplayersnake.app', SNAKE_TESTFLIGHT_BUNDLED_GAME: 'NO' };
  const testflight = { ...debug, SNAKE_TESTFLIGHT_BUNDLED_GAME: 'YES' };
  const names = ['debug.json', 'release.json', 'testflight.json'];
  const write = (name, value) => fs.writeFileSync(path.join(dir, name), JSON.stringify([{ target: 'TwoPlayerSnake', buildSettings: value }]));
  write(names[0], debug); write(names[1], release); write(names[2], testflight);
  const run = () => spawnSync(process.execPath, ['tools/check-ios-cloud-settings.cjs', ...names.map(n => path.join(dir, n))]);
  try {
    assert.equal(run().status, 0);
    write(names[2], { ...testflight, SNAKE_CLOUDKIT_CONTAINER_ID: '' });
    assert.notEqual(run().status, 0, 'missing TestFlight container must fail');
    write(names[2], testflight);
    write(names[1], debug);
    assert.notEqual(run().status, 0, 'ordinary Release must stay disabled');
  } finally {
    for (const name of names) fs.unlinkSync(path.join(dir, name));
    fs.rmdirSync(dir);
  }
});
