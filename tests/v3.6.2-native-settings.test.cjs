const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const version = process.env.SNAKE_TEST_VERSION || '3.6.2';
const html = fs.readFileSync(path.join(__dirname, `../Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v${version}.html`), 'utf8');

test('native settings update changes only the visible settings purchase button', () => {
  const start = html.indexOf('window.onAndroidSettings = function(settings)');
  const end = html.indexOf('async function checkServerAwake', start);
  assert.ok(start > 0 && end > start);
  let restore = null, nativeCalls = 0, hapticUpdates = 0;
  const divider = {before(button) { restore = button; }};
  const banner = {
    classList: {contains: value => value === 'settings-banner'},
    querySelector(selector) {
      if (selector === '#menuRestorePurchases') return restore;
      if (selector === '#settingsBack') return {closest: () => divider};
      return null;
    }
  };
  const c = vm.createContext({
    window: {Android: {restorePurchases() { nativeCalls++; }}}, currentMenuScreen: 'settings',
    MENU_IDS: {SETTINGS: 'settings'}, banner, isAndroidApp: () => true,
    t: () => 'Restore', SFX: {menuClick() {}}, nativeHapticsEnabled: null,
    refreshHapticsSettingButton: () => { hapticUpdates++; }, document: {
      createElement() { return {querySelector() {return {};}, remove() {restore = null;}}; }
    }
  });
  vm.runInContext(html.slice(start, end), c);
  c.window.onAndroidSettings({adsRemoved: false});
  const original = restore;
  assert.ok(original);
  if (version === '3.6.5') {
    c.window.onAndroidSettings({adsRemoved: false, vibrationEnabled: false});
    assert.equal(c.nativeHapticsEnabled, false);
    assert.equal(hapticUpdates, 1);
    assert.equal(restore, original);
  }
  c.window.onAndroidSettings({adsRemoved: false});
  assert.equal(restore, original);
  restore.onclick();
  assert.equal(nativeCalls, 1);
  c.window.onAndroidSettings({adsRemoved: true});
  assert.equal(restore, null);
  c.currentMenuScreen = 'other';
  c.window.onAndroidSettings({adsRemoved: false});
  assert.equal(restore, null);
});
