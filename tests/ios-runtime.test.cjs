const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const files = [
  'Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.3.9.html',
  'Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.3.8.html',
  'Ana Dosya/iOS/TwoPlayerSnake/Resources/Offline/mobile_offline_fallback.html'
];
const bridge = read('Ana Dosya/iOS/TwoPlayerSnake/Bridge/ios_bridge_bootstrap.js');

function bridgeFixture() {
  const timers = new Map(), messages = [], styles = [];
  let nextTimer = 0;
  const context = {
    console: { log() {}, warn() {} },
    setTimeout(fn, delay) { timers.set(++nextTimer, { fn, delay }); return nextTimer; },
    clearTimeout(id) { timers.delete(id); },
    addEventListener() {},
    document: {
      readyState: 'loading', getElementById() { return null; },
      createElement() { return {}; }, head: { appendChild(s) { styles.push(s); } },
      documentElement: { classList: { add() {} }, setAttribute() {} },
      addEventListener() {}
    },
    webkit: { messageHandlers: { iOS: { postMessage(m) { messages.push(m); } } } },
    AdManager: { adInProgress: true }
  };
  context.window = context;
  vm.createContext(context); vm.runInContext(bridge, context);
  return { context, timers, messages, styles,
    request(type, callbacks = {}) {
      context.adBreak({ type, ...callbacks });
      return JSON.parse(messages.at(-1).payload).callbackId;
    },
    expire() { for (const [id, timer] of [...timers]) { timers.delete(id); timer.fn(); } }
  };
}

test('bridge is installed once and retains original blur/shadow/animation CSS', () => {
  const f = bridgeFixture(); vm.runInContext(bridge, f.context);
  assert.equal(f.styles.length, 1);
  assert.doesNotMatch(f.styles[0].textContent, /(?:backdrop-filter|animation|box-shadow|filter)\s*:\s*none/);
});
test('missing native reply releases once without granting a reward', () => {
  const f = bridgeFixture(); let done = 0, viewed = 0, dismissed = 0;
  const id = f.request('reward', { adBreakDone() { done++; }, adViewed() { viewed++; }, adDismissed() { dismissed++; } });
  f.expire(); f.context.__onNativeAdDone(id, true);
  assert.deepEqual([done, viewed, dismissed], [1, 0, 1]);
});
test('presented ad may outlast watchdog; only dismissal completes it', () => {
  const f = bridgeFixture(); let done = 0, viewed = 0;
  const id = f.request('reward', { adBreakDone() { done++; }, adViewed() { viewed++; } });
  f.context.__onNativeAdPresented(id); f.expire();
  assert.equal(done, 0);
  f.context.__onNativeAdDone(id, true);
  assert.deepEqual([done, viewed], [1, 1]);
});
test('late and reentrant callbacks cannot finish twice or unlock another request', () => {
  const f = bridgeFixture(); let done = 0, id;
  id = f.request('next', { adBreakDone() { done++; f.context.__onNativeAdDone(id, true); } });
  f.context.__onNativeAdDone(id, true);
  assert.equal(done, 1);
  f.request('next'); f.context.AdManager.adInProgress = true;
  f.context.__onNativeAdDone(id, true);
  assert.equal(f.context.AdManager.adInProgress, true);
});
test('offline skips network ads; premium keeps established reward entitlement', () => {
  const f = bridgeFixture(); let viewed = 0, dismissed = 0;
  f.context.__twoPlayerSnakeOfflineMode = true;
  const callbacks = { adViewed() { viewed++; }, adDismissed() { dismissed++; } };
  f.context.adBreak({ type: 'reward', ...callbacks });
  assert.equal(f.messages.length, 0);
  f.context.TwoPlayerSnakeAppSettings = { adsRemoved: true };
  f.context.adBreak({ type: 'reward', ...callbacks });
  assert.deepEqual([viewed, dismissed], [1, 1]);
});
test('bridge forwards unlockAchievement and review requests to native shell', () => {
  const f = bridgeFixture();
  f.context.Android.unlockAchievement('ACH_FIRST_FOOD');
  f.context.Android.emit(JSON.stringify({ name: 'unlockAchievement', payload: { key: 'ACH_AI_HUNTER' } }));
  f.context.Android.requestReview();
  const actions = f.messages.map(m => m.action);
  assert.ok(actions.includes('unlockAchievement'));
  assert.ok(actions.includes('emit'));
  assert.ok(actions.includes('requestReview'));
});

function aiFixture(html, ios = true, appleDevice = false) {
  const source = html.slice(html.indexOf('const _aiCache ='), html.indexOf('function softReset('));
  assert.match(source, /function calculateAIMove/);
  const c = { IS_IOS_SHELL: ios, IS_APPLE_DEVICE: appleDevice, GRID_COLS: 24, GRID_ROWS: 36, gameStyle: 'normal',
    iosPerf: { enabled: true, cacheHits: 0, bfsRuns: 0 },
    MOD_WALLS: { SOLID: 'solid', NONE: 'none' }, _tickBarrierSet: new Set(),
    getBarrierCellsSet() { return c._tickBarrierSet; },
    selfArea51WrapForOwner(p) { return { x: (p.x + 24) % 24, y: (p.y + 18) % 18 }; },
    dirMap: { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } },
    opposite(a, b) { return a.x === -b.x && a.y === -b.y; }
  };
  vm.createContext(c); vm.runInContext(source, c);
  c.cache = (snake, wall = 'solid') => c.getIosAiCache(snake, wall);
  return c;
}
const snake = (x, y, dx = 1) => ({ segments: [{ x, y }], dir: { x: dx, y: 0 } });
function move(s, dir) { s.segments[0] = { x: (s.segments[0].x + dir.x + 24) % 24, y: (s.segments[0].y + dir.y + 36) % 36 }; s.dir = dir; }

for (const file of files) {
  const html = read(file);
  test(`${file}: all inline scripts parse`, () => {
    let count = 0;
    for (const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
      if (m[1].trim()) { new vm.Script(m[1]); count++; }
    }
    assert.ok(count >= 7);
  });
  test(`${file}: iOS closure-local version checks exit before fetching/scheduling`, async () => {
    const a = html.slice(html.indexOf('async function checkForFreshVersion('), html.indexOf('function scheduleVersionCheck('));
    const start = html.indexOf('function scheduleVersionCheck(');
    const b = html.slice(start, html.indexOf('\n            }', start) + 14);
    const c = { IS_IOS_SHELL: true, window: {}, Date: { now() { throw Error('unexpected version check'); } } };
    vm.createContext(c); vm.runInContext(a + b, c);
    await c.checkForFreshVersion(true); c.scheduleVersionCheck(true);
    assert.match(html, /isMenuDemoFreezeTarget\s*&&\s*isDemoMode/);
    assert.match(html, /iosAiCaches = new WeakMap\(\);\s*_aiCache.foodX/);
  });
  test(`${file}: alternating snakes retain independent cached paths`, () => {
    const c = aiFixture(html), p1 = snake(2, 5), p2 = snake(20, 15, -1);
    const foods = [{ x: 10, y: 5 }, { x: 12, y: 15 }];
    for (let n = 0; n < 4; n++) {
      move(p1, c.calculateAIMove(p1, p2, foods, 'solid'));
      move(p2, c.calculateAIMove(p2, p1, foods, 'solid'));
    }
    assert.equal(c.iosPerf.bfsRuns, 2); assert.equal(c.iosPerf.cacheHits, 6);
    assert.notEqual(c.cache(p1), c.cache(p2));
    // Control: legacy shared cache overwrites the other snake's target on each turn.
    const legacy = aiFixture(html, false), a = snake(2, 5), b = snake(20, 15, -1);
    for (let n = 0; n < 4; n++) { move(a, legacy.calculateAIMove(a, b, foods, 'solid')); move(b, legacy.calculateAIMove(b, a, foods, 'solid')); }
    assert.equal(legacy.iosPerf.bfsRuns, 8);
  });
  test(`${file}: iOS Safari (IS_IOS_SHELL: false, IS_APPLE_DEVICE: true) retains independent per-snake AI caching`, () => {
    const safari = aiFixture(html, false, true), p1 = snake(2, 5), p2 = snake(20, 15, -1);
    const foods = [{ x: 10, y: 5 }, { x: 12, y: 15 }];
    for (let n = 0; n < 4; n++) {
      move(p1, safari.calculateAIMove(p1, p2, foods, 'solid'));
      move(p2, safari.calculateAIMove(p2, p1, foods, 'solid'));
    }
    assert.equal(safari.iosPerf.bfsRuns, 2); assert.equal(safari.iosPerf.cacheHits, 6);
    assert.notEqual(safari.cache(p1), safari.cache(p2));
  });
  test(`${file}: iOS CSS rules contain hardware-accelerated scoped blur and shadow optimizations`, () => {
    assert.match(html, /@supports \(-webkit-touch-callout:\s*none\)/);
    assert.match(html, /html\[data-ios-device="true"\]\s*#canvasWrap\.paused-blur > canvas/);
    assert.match(html, /html\[data-ios-device="true"\]\s*\.banner\.padded/);
    assert.match(html, /html\[data-ios-device="true"\]\s*\.main-menu-actions/);
    assert.match(html, /html\[data-ios-device="true"\]\s*\.android-menu-transition-ghost/);
    assert.match(html, /html\[data-ios-device="true"\]\s*#p1-controls\s*\{[\s\S]*?padding-bottom:\s*0\s*!important/);
    assert.match(html, /html\[data-ios-device="true"\]\s*#p1-controls\s*\.player-stat-panel::before\s*\{[\s\S]*?border-radius:\s*12px\s*!important/);
  });
  test(`${file}: moving obstacles and geometry invalidate stale paths`, () => {
    const c = aiFixture(html), s = snake(2, 5), food = [{ x: 10, y: 5 }];
    move(s, c.calculateAIMove(s, null, food, 'solid'));
    const before = c.cache(s); c.gameStyle = 'adventure';
    assert.notEqual(c.cache(s), before);
    move(s, c.calculateAIMove(s, null, food, 'solid'));
    const next = { x: s.segments[0].x + 1, y: 5 };
    c._tickBarrierSet.add(next.y * 24 + next.x);
    const direction = c.calculateAIMove(s, null, food, 'solid');
    assert.notEqual(direction.x, 1);
    const cached = c.cache(s); c.GRID_ROWS = 35;
    assert.notEqual(c.cache(s), cached);
    assert.notEqual(c.cache(s, 'none'), c.cache(s, 'solid'));
  });
  test(`${file}: moved food, reversed direction and teleported head cannot reuse a stale step`, () => {
    const c = aiFixture(html), s = snake(2, 5), food = [{ x: 10, y: 5 }];
    move(s, c.calculateAIMove(s, null, food, 'solid'));
    s.dir = { x: -1, y: 0 };
    assert.notEqual(c.calculateAIMove(s, null, food, 'solid').x, 1);
    const cached = c.cache(s); s.segments[0] = { x: 5, y: 8 };
    assert.notEqual(c.cache(s), cached);
    const runs = c.iosPerf.bfsRuns;
    c.calculateAIMove(s, null, [{ x: 7, y: 8 }], 'solid');
    assert.equal(c.iosPerf.bfsRuns, runs + 1);
  });
}

test('online/offline AI implementation stays identical', () => {
  const chunks = files.map(file => { const h = read(file); return h.slice(h.indexOf('const _aiCache ='), h.indexOf('function softReset(')); });
  for (let i = 1; i < chunks.length; i++) {
    assert.equal(chunks[i], chunks[0]);
  }
});

test('both online and offline HTML expose window.joinOnlineRoom', () => {
  for (const file of files) {
    const html = read(file);
    assert.match(html, /window\.joinOnlineRoom\s*=\s*function/);
    assert.match(html, /startOnlineServerConnectionWithRoom\(targetRoom,\s*targetMode/);
  }
});

test('apple-app-site-association has valid json and correct App ID for Universal Links', () => {
  const aasaContent = read('Ana Dosya/apple-app-site-association');
  const aasa = JSON.parse(aasaContent);
  assert.ok(aasa.applinks, 'missing applinks key');
  assert.ok(Array.isArray(aasa.applinks.details), 'details should be array');
  const appDetail = aasa.applinks.details[0];
  assert.equal(appDetail.appID, 'GUFQF359Q7.com.twoplayersnake.app');
  assert.ok(appDetail.paths.includes('/invite*'));
});

test('TwoPlayerSnake.entitlements contains applinks:2playersnake.com', () => {
  const entitlements = read('Ana Dosya/iOS/TwoPlayerSnake/TwoPlayerSnake.entitlements');
  assert.match(entitlements, /applinks:2playersnake\.com/);
});

test('Info.plist contains twoplayersnake URL scheme', () => {
  const plist = read('Ana Dosya/iOS/TwoPlayerSnake/Info.plist');
  assert.match(plist, /<string>twoplayersnake<\/string>/);
});

test('project.pbxproj includes NotificationManager, NotificationStrings, and UserNotifications.framework', () => {
  const pbx = read('Ana Dosya/iOS/TwoPlayerSnake.xcodeproj/project.pbxproj');
  assert.match(pbx, /NotificationManager\.swift in Sources/);
  assert.match(pbx, /NotificationStrings\.swift in Sources/);
  assert.match(pbx, /UserNotifications\.framework in Frameworks/);
  assert.match(pbx, /CODE_SIGN_ENTITLEMENTS = TwoPlayerSnake\/TwoPlayerSnake\.entitlements;/);
});

test('Info.plist contains CFBundleLocalizations for multi-language App Store listing', () => {
  const plist = read('Ana Dosya/iOS/TwoPlayerSnake/Info.plist');
  assert.match(plist, /<key>CFBundleLocalizations<\/key>/);
  assert.match(plist, /<string>tr<\/string>/);
  assert.match(plist, /<string>en<\/string>/);
  assert.match(plist, /<string>de<\/string>/);
  assert.match(plist, /<string>fr<\/string>/);
  assert.match(plist, /<string>es<\/string>/);
  assert.match(plist, /<string>zh-Hans<\/string>/);
  assert.match(plist, /<string>ja<\/string>/);
});

test('v3.3.9 mobile and offline fallback implement 3-column D-Pad and opponent panel layout', () => {
  const v339Files = [
    'Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.3.9.html',
    'Ana Dosya/iOS/TwoPlayerSnake/Resources/Offline/mobile_offline_fallback.html',
    'Ana Dosya/Android/app/src/main/assets/offline/mobile_offline_fallback.html'
  ];
  for (const f of v339Files) {
    const html = read(f);
    // 3-column D-Pad structure in P1 and P2
    assert.match(html, /<div class="dpad-cluster dpad-only" id="p1Dpad">[\s\S]*?class="dpad-btn dpad-tall left"[\s\S]*?class="dpad-col-center"[\s\S]*?class="dpad-btn up"[\s\S]*?class="dpad-btn down"[\s\S]*?class="dpad-btn dpad-tall right"/);
    assert.match(html, /<div class="dpad-cluster dpad-only" id="p2Dpad">[\s\S]*?class="dpad-btn dpad-tall left"[\s\S]*?class="dpad-col-center"[\s\S]*?class="dpad-btn up"[\s\S]*?class="dpad-btn down"[\s\S]*?class="dpad-btn dpad-tall right"/);
    // Controls modal 3-column mini preview
    assert.match(html, /<div class="dpad-mini-grid">[\s\S]*?class="ctrl-mini-box mini-tall"[\s\S]*?class="dpad-mini-col"[\s\S]*?class="ctrl-mini-box mini-up"[\s\S]*?class="ctrl-mini-box mini-down"[\s\S]*?class="ctrl-mini-box mini-tall"/);
    // CSS rules for opponent panel & pause placement in D-Pad mode
    assert.match(html, /#p1-controls:is\(\.mode-2p,\s*\.dual-ai\)\.layout-dpad\s+#p1OpponentPanel/);
    assert.match(html, /#p1-controls:is\(\.mode-2p,\s*\.dual-ai\)\.layout-dpad\s+#pauseBtnP1/);
    assert.match(html, /#p1-controls\.layout-dpad\s+#aiStatPanel\s*\{[\s\S]*?display:\s*none\s*!important/);
    // hasOpponent in applyPlayerControlLayout
    assert.match(html, /const hasOpponent = \(is2P \|\| \(gameMode === '1P' && aiSnakeEnabled\) \|\| \(typeof isOnlineMode !== 'undefined' && isOnlineMode\)\);/);

    // v3.3.9 D-Pad vertical stretch with stat panels (no empty vertical dead space)
    assert.match(html, /#p1-controls\.layout-dpad\s*\{[\s\S]*?align-items:\s*stretch;/);
    assert.match(html, /\.dpad-col-center\s+\.dpad-btn\s*\{[\s\S]*?height:\s*calc\(50%\s*-\s*3px\);/);

    // v3.3.9 Ergonomic D-Pad adjustments:
    // 1. Widened Up/Down buttons horizontally (clamp(75px, 23vw, 108px))
    assert.match(html, /\.dpad-col-center\s*\{[\s\S]*?max-width:\s*clamp\(75px,\s*23vw,\s*108px\);/);
    // 2. Solo 1P enlarged Pause & Sound buttons (36px x 36px, SVG 19px x 19px)
    assert.match(html, /#p1-controls\.layout-dpad:not\(\.mode-2p\):not\(\.dual-ai\)\s+#pauseBtnP1[\s\S]*?width:\s*36px\s*!important;\s*height:\s*36px\s*!important;/);
    assert.match(html, /#p1-controls\.layout-dpad:not\(\.mode-2p\):not\(\.dual-ai\)\s+#pauseBtnP1\s*>\s*svg[\s\S]*?width:\s*19px\s*!important;\s*height:\s*19px\s*!important;/);
    // 3. P2 full-height stretch matching P1 (safe area on parent, unrotated symmetric 6px 8px padding)
    assert.match(html, /#p2-controls\.layout-dpad\s*\{[\s\S]*?padding-top:\s*var\(--safe-area-top\)\s*!important;/);
    assert.match(html, /#p2-controls\.layout-dpad\s+\.ctrl-content-rotated\s*\{[\s\S]*?padding:\s*6px\s*8px\s*!important;/);
    // 4. Opponent mode Pause & Sound buttons embedded inside stat panels (static, margin top)
    assert.match(html, /#p1-controls:is\(\.mode-2p,\s*\.dual-ai\)\.layout-dpad\s+#pauseBtnP1[\s\S]*?position:\s*static\s*!important;[\s\S]*?margin:\s*(?:4px|8px)\s*auto\s*(?:0|2px)\s*!important;/);
    assert.match(html, /#p1-controls:is\(\.mode-2p,\s*\.dual-ai\)\.layout-dpad\s+#soundBtnP1[\s\S]*?position:\s*static\s*!important;[\s\S]*?margin:\s*(?:4px|8px)\s*auto\s*(?:0|2px)\s*!important;/);
    // 5. 1PvsAI panel width fix (100% full width, exactly matching 1Pvs2P)
    assert.match(html, /#p1-controls\.dual-ai\.layout-dpad\s+\.player-stat-panel\s*\{[\s\S]*?flex:\s*1\s*1\s*100%\s*!important;\s*max-width:\s*100%\s*!important;/);

    // v3.3.9 Sound toggle buttons (mirror symmetry in opponent modes, stacked in Solo 1P)
    assert.match(html, /id="soundBtnP1"\s+class="panel-sound-btn soundBtn"/);
    assert.match(html, /id="soundBtnP2"\s+class="panel-sound-btn soundBtn"/);
    assert.match(html, /#p1-controls:is\(\.mode-2p,\s*\.dual-ai\)\.layout-dpad\s+#soundBtnP1/);
    assert.match(html, /#p1-controls\.layout-dpad:not\(\.mode-2p\):not\(\.dual-ai\)\s+#soundBtnP1/);
    assert.match(html, /\['soundBtnP1',\s*'soundBtnP2'\]\.forEach/);
  }
});

test('PC v3.3.9 html exists, scripts parse cleanly and VERSION is v3.3.9', () => {
  const pcPath = 'Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.3.9.html';
  const html = read(pcPath);
  assert.match(html, /<title>2 Player Snake \| v3\.3\.9<\/title>/);
  assert.match(html, /const VERSION = 'v3\.3\.9';/);
  assert.match(html, /window\.joinOnlineRoom\s*=\s*function/);
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  for (const s of scripts) {
    assert.doesNotThrow(() => new vm.Script(s), `Syntax error in ${pcPath}`);
  }
});

test('v3.4.0 mobile implements dynamic vsAiMode and 21 languages', () => {
  const p = 'Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.4.0.html';
  const html = read(p);
  assert.match(html, /const VERSION = 'v3\.4\.0';/);
  assert.match(html, /vsAiMode/);
  assert.match(html, /\(qs\.playerMode === '1P' \? t\('vsAiMode'\) : t\('fastCompetitiveMode'\)\)/);
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  for (const s of scripts) {
    assert.doesNotThrow(() => new vm.Script(s), `Syntax error in ${p}`);
  }
});

test('PC v3.4.0 html exists, scripts parse cleanly and dynamic vsAiMode is implemented', () => {
  const pcPath = 'Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.4.0.html';
  const html = read(pcPath);
  assert.match(html, /<title>2 Player Snake \| v3\.4\.0<\/title>/);
  assert.match(html, /const VERSION = 'v3\.4\.0';/);
  assert.match(html, /vsAiMode/);
  assert.match(html, /h1\.textContent = \(qs2\.playerMode === '1P'\) \? t\('vsAiMode'\) : t\('fastCompetitiveMode'\);/);
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  for (const s of scripts) {
    assert.doesNotThrow(() => new vm.Script(s), `Syntax error in ${pcPath}`);
  }
});

test('v3.4.1 mobile implements v3.4.1 defaults and online UI layout fix', () => {
  const p = 'Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.4.1.html';
  const html = read(p);
  assert.match(html, /const VERSION = 'v3\.4\.1';/);
  assert.match(html, /gameStyle:\s*'fastCompetitive'/);
  assert.match(html, /wallMode:\s*MOD_WALLS\.NONE/);
  assert.match(html, /speedMode:\s*'NORMAL'/);
  assert.match(html, /if\s*\(p1OppPanel\)\s*p1OppPanel\.style\.display\s*=\s*'flex'/);
  assert.match(html, /applyPlayerControlLayout\('p1',\s*p1ControlLayout\);[\s\S]*?return;\s*\}/);
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  for (const s of scripts) {
    assert.doesNotThrow(() => new vm.Script(s), `Syntax error in ${p}`);
  }
});

test('PC v3.4.1 html exists, scripts parse cleanly and defaults to 1P NONE NORMAL', () => {
  const pcPath = 'Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.4.1.html';
  const html = read(pcPath);
  assert.match(html, /<title>2 Player Snake \| v3\.4\.1<\/title>/);
  assert.match(html, /const VERSION = 'v3\.4\.1';/);
  assert.match(html, /playerMode:\s*'1P'/);
  assert.match(html, /wallMode:\s*MOD_WALLS\.NONE/);
  assert.match(html, /speedMode:\s*'NORMAL'/);
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  for (const s of scripts) {
    assert.doesNotThrow(() => new vm.Script(s), `Syntax error in ${pcPath}`);
  }
});

test('v3.4.2 mobile and offline fallback implement v3.4.2 and parse cleanly', () => {
  const targets = [
    'Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.4.2.html',
    'Ana Dosya/iOS/TwoPlayerSnake/Resources/Offline/mobile_offline_fallback.html',
    'Ana Dosya/Android/app/src/main/assets/offline/mobile_offline_fallback.html'
  ];
  for (const p of targets) {
    const html = read(p);
    assert.match(html, /const VERSION = 'v3\.4\.2';/);
    assert.match(html, /gameStyle:\s*'fastCompetitive'/);
    assert.match(html, /wallMode:\s*MOD_WALLS\.NONE/);
    assert.match(html, /speedMode:\s*'NORMAL'/);
    assert.match(html, /if\s*\(p1OppPanel\)\s*p1OppPanel\.style\.display\s*=\s*'flex'/);
    assert.match(html, /applyPlayerControlLayout\('p1',\s*p1ControlLayout\);[\s\S]*?return;\s*\}/);
    const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
    for (const s of scripts) {
      assert.doesNotThrow(() => new vm.Script(s), `Syntax error in ${p}`);
    }
  }
});

test('PC v3.4.2 html implements unified openPCQuickSetupMenu and all scripts parse cleanly', () => {
  const pcPath = 'Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.4.2.html';
  const html = read(pcPath);
  assert.match(html, /<title>2 Player Snake \| v3\.4\.2<\/title>/);
  assert.match(html, /const VERSION = 'v3\.4\.2';/);
  assert.match(html, /function openPCQuickSetupMenu\(\)/);
  assert.match(html, /navigateTo\(openPCQuickSetupMenu\)/);
  assert.match(html, /pqs-gm-normal/);
  assert.match(html, /pqs-gm-fast/);
  assert.match(html, /pqs-gm-self51/);
  assert.match(html, /pqs-gm-adv/);
  assert.match(html, /pqs-info/);
  assert.match(html, /gameStyle:\s*'fastCompetitive'/);
  assert.match(html, /wallMode:\s*MOD_WALLS\.NONE/);
  assert.match(html, /speedMode:\s*'NORMAL'/);
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  for (const s of scripts) {
    assert.doesNotThrow(() => new vm.Script(s), `Syntax error in ${pcPath}`);
  }
});

test('v3.4.2 AdManager enforces 45s cooldown and centrally blocks rapid interstitials', () => {
  const files = [
    'Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.4.2.html',
    'Ana Dosya/iOS/TwoPlayerSnake/Resources/Offline/mobile_offline_fallback.html',
    'Ana Dosya/Android/app/src/main/assets/offline/mobile_offline_fallback.html',
    'Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.4.2.html'
  ];
  for (const f of files) {
    const html = read(f);
    assert.match(html, /cooldownMs:\s*45000/);
    assert.match(html, /showInterstitial\s*\(\s*\{[\s\S]*?this\.isGlobalCooldownActive\(\)/);
  }
});





