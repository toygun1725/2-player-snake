const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const files = [
  'Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.3.6.html',
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
  assert.equal(chunks[0], chunks[1]);
});
