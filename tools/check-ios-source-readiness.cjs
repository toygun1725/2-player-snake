'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { verify } = require('./check-ios-live-release.cjs');

const root = path.resolve(__dirname, '..');
function check(projectRoot = root) {
  const read = relative => fs.readFileSync(path.join(projectRoot, relative));
  const mobile = read('Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.6.5.html');
  const fallback = read('Ana Dosya/iOS/TwoPlayerSnake/Resources/Offline/mobile_offline_fallback.html');
  verify(mobile, fallback, mobile);
  const requirements = [
    ['Ana Dosya/iOS/TwoPlayerSnake/Bridge/CloudSaveStore.swift', ['class CloudSaveStore', 'privateCloudDatabase']],
    ['Ana Dosya/iOS/TwoPlayerSnake/CloudKit.staged.entitlements', ['iCloud.$(PRODUCT_BUNDLE_IDENTIFIER)', 'CloudKit']],
    ['Ana Dosya/iOS/TwoPlayerSnake/ViewController.swift', ['useBundledTestGame', 'loadHTMLString(bundledHTML, baseURL: finalUrl)']],
    ['Ana Dosya/iOS/TwoPlayerSnake/Info.plist', ['SnakeCloudKitContainerIdentifier', 'SnakeTestFlightBundledGame']],
    ['Ana Dosya/iOS/TwoPlayerSnake.xcodeproj/project.pbxproj', ['CloudSaveStore.swift', 'SNAKE_CLOUDKIT_CONTAINER_ID']],
  ];
  for (const [file, markers] of requirements) {
    const data = read(file).toString('utf8');
    if (!markers.every(marker => data.includes(marker))) throw new Error(`Required v3.6.5 iOS source is incomplete: ${file}`);
  }
  console.log('Required v3.6.5 iOS cloud and bundled game sources are present.');
}

if (require.main === module) {
  try { check(); }
  catch (error) { console.error(`Build blocked: ${error.message}`); process.exitCode = 1; }
}
module.exports = { check };
