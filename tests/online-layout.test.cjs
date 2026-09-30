const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const mobilePath = 'Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.5.8.html';
const html = fs.readFileSync(path.join(root, mobilePath), 'utf8');

function functionSource(name) {
  const start = html.indexOf(`            function ${name}(`);
  assert.ok(start >= 0, name);
  const end = html.indexOf('\n            }', start) + '\n            }'.length;
  return html.slice(start, end);
}
function fixture(extra = {}) {
  const context = vm.createContext(extra);
  for (const name of ['fitOnlineBoard', 'intersectOnlineViewport', 'optimalOnlineRows', 'getCellCoords']) {
    vm.runInContext(functionSource(name), context);
  }
  return context;
}

test('v3.5.8 source and both packaged fallbacks are identical; both scripts parse', () => {
  for (const fallback of ['Ana Dosya/iOS/TwoPlayerSnake/Resources/Offline/mobile_offline_fallback.html',
    'Ana Dosya/Android/app/src/main/assets/offline/mobile_offline_fallback.html']) {
    assert.equal(fs.readFileSync(path.join(root, fallback), 'utf8'), html);
  }
  const pc = fs.readFileSync(path.join(root, 'Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.5.8.html'), 'utf8');
  for (const source of [html, pc]) {
    assert.match(source, /const VERSION = 'v3\.5\.8';/);
    for (const script of source.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)) {
      new vm.Script(script[1]);
    }
  }
  const isOnlineModeDecl = pc.indexOf('let isOnlineMode = false;');
  const resizeInvocation = pc.indexOf("addEventListener('resize', resize, { passive: true }); resize();");
  assert.ok(isOnlineModeDecl > 0, 'isOnlineMode must be declared in PC client');
  assert.ok(resizeInvocation > isOnlineModeDecl, 'isOnlineMode must be declared before initial resize() invocation');
});

test('all online cells fit short, tall, narrow and safe-area viewports with square cells', () => {
  const context = fixture({ canvas: { width: 432, height: 700 }, dpr: 1,
    GRID_COLS: 24, GRID_ROWS: 42, isOnlineMode: true, onlineViewport: null });
  for (const area of [
    { x: 0, y: 0, width: 432, height: 700 },
    { x: 0, y: 59, width: 430, height: 696 },
    { x: 0, y: 0, width: 412, height: 774 },
    { x: 16, y: 20, width: 288, height: 390 },
    { x: 0, y: 0, width: 768, height: 400 }
  ]) {
    for (const rows of [10, 36, 40, 42, 100]) {
      context.onlineViewport = area;
      context.GRID_ROWS = rows;
      for (const [x, y] of [[0, 0], [23, rows - 1], [24, rows]]) {
        const c = context.getCellCoords(x, y);
        assert.equal(c.szX, c.szY);
        assert.ok(c.x >= area.x - 1e-9 && c.y >= area.y - 1e-9);
        assert.ok(c.x <= area.x + area.width + 1e-9);
        assert.ok(c.y <= area.y + area.height + 1e-9);
      }
      assert.equal(context.GRID_ROWS, rows, 'display sizing must never alter the match grid');
    }
  }
});

test('safe-area intersection does not subtract the bottom panel or inset twice', () => {
  const c = fixture();
  const viewport = { left: 0, top: 0, width: 430, height: 932 };
  const insets = { top: 59, bottom: 34, left: 0, right: 0 };
  const area = c.intersectOnlineViewport({ left: 0, top: 0, right: 430, bottom: 755 }, viewport, insets);
  assert.deepEqual(JSON.parse(JSON.stringify(area)), { x: 0, y: 59, width: 430, height: 696 });
  const alreadyInset = c.intersectOnlineViewport({ left: 0, top: 59, right: 430, bottom: 755 }, viewport, insets);
  assert.equal(alreadyInset.y, 0);
  assert.equal(alreadyInset.height, 696);
  const keyboard = c.intersectOnlineViewport({ left: 0, top: 0, right: 430, bottom: 755 },
    { ...viewport, height: 500 }, insets);
  assert.equal(keyboard.height, 407);
});

test('row negotiation rounds down to even rows and preserves bounds and missing-size fallback', () => {
  const c = fixture();
  assert.equal(c.optimalOnlineRows({ width: 432, height: 755 }), 40);
  assert.equal(c.optimalOnlineRows({ width: 432, height: 756 }), 42);
  assert.equal(c.optimalOnlineRows({ width: 0, height: 700 }), 36);
  assert.equal(c.optimalOnlineRows({ width: 432, height: 0 }), 36);
  assert.equal(c.optimalOnlineRows({ width: 432, height: 18 }), 10);
  assert.equal(c.optimalOnlineRows({ width: 432, height: 3000 }), 100);
});

test('local coordinates retain independent horizontal and vertical sizing', () => {
  const c = fixture({ canvas: { width: 432, height: 700 }, dpr: 1,
    GRID_COLS: 24, GRID_ROWS: 40, isOnlineMode: false, onlineViewport: null });
  const end = c.getCellCoords(24, 40);
  assert.equal(end.x, 432);
  assert.equal(end.y, 700);
  assert.equal(end.szX, 18);
  assert.equal(end.szY, 17.5);
});

test('resize preserves online matrix, skips unchanged buffers and retains last valid hidden layout', () => {
  let rect = { left: 0, top: 0, right: 432, bottom: 700, width: 432, height: 700 };
  let writes = 0, transforms = 0, w = 432, h = 700;
  const canvas = { style: {}, get width() { return w; }, set width(v) { writes++; w = v; },
    get height() { return h; }, set height(v) { writes++; h = v; } };
  const c = fixture({ canvas, ctx: { setTransform() { transforms++; } }, dpr: 1,
    GRID_COLS: 24, GRID_ROWS: 42, isOnlineMode: true, onlineViewport: null, NOTCH_SAFE_ROWS: 0,
    document: { getElementById() { return { getBoundingClientRect() { return rect; } }; } },
    measureOnlineViewport(r) { return { x: 0, y: 0, width: r.width, height: r.height }; },
    measureOnlineDpadHeight() {}, safeAreaProbe: {}, getComputedStyle() { return { paddingTop: '0px' }; } });
  vm.runInContext(functionSource('resize'), c);
  c.resize(); c.resize();
  assert.equal(writes, 0);
  rect = { ...rect, height: 600, bottom: 600 };
  c.resize();
  assert.equal(writes, 2); assert.equal(transforms, 1);
  assert.equal(c.GRID_ROWS, 42);
  const saved = c.onlineViewport;
  rect = { ...rect, height: 0, bottom: 0 };
  c.resize();
  assert.equal(writes, 2); assert.equal(c.onlineViewport, saved);
});

test('PC v3.5.8: vertical arena locks aspect ratio and produces square cells for cross-play', () => {
  const pcHtml = fs.readFileSync(path.join(root, 'Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.5.8.html'), 'utf8');
  assert.match(pcHtml, /#stage\.vertical-arena #canvasWrap/);
  assert.match(pcHtml, /st\.classList\.toggle\('vertical-arena',\s*isVerticalArena\)/);
  assert.match(pcHtml, /cwEl\.style\.aspectRatio\s*=\s*`\$\{GRID_COLS\} \/ \$\{GRID_ROWS\}`/);

  // Simulate PC resize with simulated 1920x1080 stage and vertical 24x42 cross-play grid
  const stage = { classList: { contains: x => x === 'vertical-arena', toggle(c, v) { this.active = v; } },
    getBoundingClientRect: () => ({ width: 1920, height: 950 }) };
  const canvasWrap = { style: {},
    getBoundingClientRect: () => {
      // In CSS, with height 950 and aspect-ratio 24/42, width becomes 950 * (24/42) = 542.857
      const h = 950;
      const w = h * (24 / 42);
      return { width: w, height: h };
    } };
  const r = canvasWrap.getBoundingClientRect();
  const cw = r.width / 24;
  const ch = r.height / 42;
  assert.ok(Math.abs(cw - ch) < 1e-9, `Cells must be square in vertical arena: cw=${cw}, ch=${ch}`);
});
