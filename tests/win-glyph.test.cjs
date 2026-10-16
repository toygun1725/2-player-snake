const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = kind => fs.readFileSync(path.join(root, `Ana Dosya/${kind}/Beta/v3/2 Player Snake ${kind} v3.6.1.html`), 'utf8').replace(/\r\n/g, '\n');
function fn(source, name, indent) {
  const start = source.indexOf(indent + 'function ' + name + '(');
  assert.ok(start >= 0, name);
  const end = source.indexOf('\n' + indent + '}', start);
  assert.ok(end > start, `${name} closing brace`);
  return source.slice(start, end + indent.length + 2);
}
function snake(length) {
  const segments = Array.from({ length }, (_, i) => ({ x: (48 - i + 640) % 64, y: 10 + Math.floor(i / 64) }));
  return { segments, prev: segments.map(p => ({ ...p })), dir: { x: 1, y: 0 }, grow: 2,
    shakeUntil: 1300, flashUntil: 1400, digestAnims: [{ startTime: 990 }], gulpPop: { start: 990 } };
}
for (const kind of ['PC', 'Mobile']) {
  const source = read(kind), indent = kind === 'PC' ? '      ' : '';
  const run = (name, body) => test(`${kind}: ${name}`, body);
  function fixture(extra = {}) {
    const rectangles = [], texts = [], calls = [], stack = [];
    const dimensions = { width: 1280, height: 720 }, clock = { now: 1000 };
    const context = vm.createContext({
      GRID_COLS: 64, GRID_ROWS: 36, snakes: { p1: snake(8), p2: null },
      gameMode: '1P', aiSnakeEnabled: false, isOnlineMode: false, myRole: 'p1',
      winAnim: { active: false }, deathAnim: { active: true }, screenShake: { trauma: 1 },
      hitStopUntil: 1200, comboPopups: [{}], foods: [{}], intermission: false,
      playerColors: { p1: '#ff4fbf', p2: '#35e6e6' }, performance: { now: () => clock.now },
      AdManager: { recordMatchCompleted() { calls.push('completed'); } },
      SFX: { win() { calls.push('win'); }, winRound() { calls.push('round'); } },
      startConfetti(color) { calls.push(['confetti', color]); },
      resetSoloLengthMilestone(reset) { calls.push(['milestoneReset', reset]); },
      document: { getElementById() { return { classList: { remove(...classes) { calls.push(['remove', ...classes]); } } }; } },
      getDisplayName: role => role, t: () => '{name}', escapeHtml: text => text,
      showBanner() { calls.push('banner'); }, window: { isAndroidWebView: false }, IS_IOS_SHELL: false,
      hexToRgba(color, alpha) { return `${color}:${alpha}`; },
      canvas: { width: 2560, height: 1440 }, dpr: 2,
      getCellCoords(x, y) {
        const szX = dimensions.width / context.GRID_COLS, szY = dimensions.height / context.GRID_ROWS;
        return { x: 12 + x * szX, y: 24 + y * szY, szX, szY };
      },
      ctx: {
        globalAlpha: 0.5, globalCompositeOperation: 'screen', fillStyle: '#000', shadowBlur: 0,
        save() { stack.push({ globalAlpha: this.globalAlpha, globalCompositeOperation: this.globalCompositeOperation, fillStyle: this.fillStyle, shadowBlur: this.shadowBlur }); },
        restore() { Object.assign(this, stack.pop()); },
        fillRect(x, y, w, h) { rectangles.push({ x, y, w, h, color: this.fillStyle, blur: this.shadowBlur }); },
        fillText(text, x, y, maxWidth) { texts.push({ text, x, y, maxWidth, font: this.font }); },
        clearRect() { calls.push('clear'); }
      },
      drawGrid() { calls.push('grid'); }, renderConfettiOnCanvas() { calls.push('confettiFrame'); },
      drawSnakeBlocks() { throw Error('Victory text must not draw gameplay snakes'); },
      ...extra
    });
    const digits = source.match(/const SOLO_LENGTH_DIGITS = \{[\s\S]*?\n\s*\};/)[0];
    vm.runInContext(digits + ['buildWinGlyphData', 'drawWinGlyph', 'startWinAnim', 'renderWinAnim'].map(name => fn(source, name, indent)).join('\n'), context);
    const start = (winner = 'p1', final = true) => context.startWinAnim(winner, final, true);
    const glyph = () => JSON.parse(JSON.stringify(context.winAnim.glyph));
    return { c: context, start, glyph, rectangles, texts, calls, dimensions, clock };
  }
  run('solo victories tolerate an absent second snake and preserve short/long snake coordinates', () => {
    for (const length of [0, 6, 8, 10, 100, 200, 300]) {
      for (const final of [false, true]) {
        const f = fixture({ snakes: { p1: snake(length), p2: null } });
        const before = JSON.stringify(f.c.snakes);
        f.start('p1', final);
        f.c.renderWinAnim();
        assert.equal(JSON.stringify(f.c.snakes), before, `${length}: gameplay state is preserved`);
        assert.ok(f.rectangles.length > 0);
      }
    }
    for (const snakes of [null, {}, { p1: null, p2: null }]) {
      const f = fixture({ snakes });
      f.start(); f.c.renderWinAnim();
      assert.ok(f.rectangles.length > 0, 'rendering does not depend on snake objects');
    }
  });
  run('P1, P2 and AI labels remain correct, including stale AI preferences during online play', () => {
    for (const [winner, mode, ai, online, label] of [
      ['p1', '1P', false, false, 'P1'], ['p2', '2P', false, false, 'P2'],
      ['p2', '1P', true, false, 'AI'], ['p2', '1P', true, true, 'P2'], ['p1', '1P', true, false, 'P1']
    ]) {
      const f = fixture({ gameMode: mode, aiSnakeEnabled: ai, isOnlineMode: online, snakes: { p1: snake(8), p2: snake(30) } });
      f.start(winner); f.c.drawWinGlyph();
      assert.equal(f.c.winAnim.text, label);
      assert.equal(f.glyph().text, label);
      assert.equal(f.c.winAnim.color, winner === 'p1' ? '#ff4fbf' : '#35e6e6');
    }
  });
  run('ceremony initialization clears transient effects without mutating the snake', () => {
    const f = fixture(), before = JSON.stringify(f.c.snakes);
    f.start();
    assert.equal(f.c.deathAnim.active, false);
    assert.equal(f.c.screenShake.trauma, 0);
    assert.equal(f.c.hitStopUntil, 0);
    assert.equal(f.c.comboPopups.length, 0);
    assert.equal(f.c.foods.length, 0);
    assert.equal(f.c.intermission, true);
    assert.equal(JSON.stringify(f.c.snakes), before);
    assert.ok(f.calls.some(call => Array.isArray(call) && call[0] === 'milestoneReset' && call[1] === false));
  });
  run('the full P1 glyph is independent of former snake positions and uses a readable one', () => {
    const f = fixture(); f.start(); f.c.drawWinGlyph();
    const base = f.rectangles.slice();
    f.rectangles.length = 0;
    f.c.snakes = { p1: snake(300), p2: snake(400) };
    f.c.drawWinGlyph();
    assert.deepEqual(f.rectangles, base);
    const glyph = f.c.buildWinGlyphData('1');
    const rows = Array.from({ length: 7 }, (_, row) => glyph.positions.filter(p => Math.floor((p.y - Math.min(...glyph.positions.map(p => p.y))) / glyph.scale) === row));
    assert.ok(rows[1].length < rows[6].length, 'the top of 1 is narrower than its base');
    assert.equal(f.c.ctx.globalAlpha, 0.5);
    assert.equal(f.c.ctx.globalCompositeOperation, 'screen');
  });
  run('all labels fit and stay centered in wide, portrait and short matrices', () => {
    for (const [cols, rows] of [[64,36], [24,36], [24,42], [24,10], [24,14], [24,18], [24,7], [11,7]]) {
      for (const label of ['P1', 'P2', 'AI']) {
        const f = fixture({ GRID_COLS: cols, GRID_ROWS: rows });
        f.start(); f.c.winAnim.text = label; f.c.drawWinGlyph();
        const glyph = f.glyph();
        assert.ok(glyph.scale >= 1, `${cols}x${rows}: ${label}`);
        assert.ok(glyph.positions.every(p => p.x >= 0 && p.x < cols && p.y >= 0 && p.y < rows));
        assert.equal(new Set(glyph.positions.map(p => `${p.x},${p.y}`)).size, glyph.positions.length);
        const centerX = (Math.min(...glyph.positions.map(p => p.x)) + Math.max(...glyph.positions.map(p => p.x)) + 1) / 2;
        const centerY = (Math.min(...glyph.positions.map(p => p.y)) + Math.max(...glyph.positions.map(p => p.y)) + 1) / 2;
        assert.ok(Math.abs(centerX - cols / 2) <= 0.5);
        assert.ok(Math.abs(centerY - rows / 2) <= 0.5);
        assert.ok(f.rectangles.every(r => r.x >= 12 && r.y >= 24 && r.x + r.w <= 12 + f.dimensions.width && r.y + r.h <= 24 + f.dimensions.height));
      }
    }
  });
  run('boards smaller than a seven-row glyph use compact centered text instead of wrapped cells', () => {
    for (const [cols, rows] of [[24,2], [24,6], [2,2]]) {
      const f = fixture({ GRID_COLS: cols, GRID_ROWS: rows });
      f.start(); f.c.drawWinGlyph();
      assert.equal(f.rectangles.length, 0);
      assert.equal(f.texts.length, 1);
      assert.equal(f.texts[0].text, 'P1');
      assert.equal(f.texts[0].x, 12 + f.dimensions.width / 2);
      assert.equal(f.texts[0].y, 24 + f.dimensions.height / 2);
      assert.ok(f.texts[0].maxWidth < f.dimensions.width);
    }
  });
  run('a live resize rebuilds grid placement and scales cells from current CSS dimensions', () => {
    const f = fixture(); f.start(); f.c.drawWinGlyph();
    const first = f.c.winAnim.glyph;
    f.c.GRID_COLS = 24; f.c.GRID_ROWS = 10;
    f.dimensions.width = 852; f.dimensions.height = 240;
    f.rectangles.length = 0; f.c.drawWinGlyph(false);
    assert.notEqual(f.c.winAnim.glyph, first);
    assert.equal(f.glyph().scale, 1);
    assert.ok(f.rectangles.every(r => r.blur === 0 && r.x + r.w <= 864 && r.y + r.h <= 264));
    const layout = f.c.winAnim.glyph;
    f.dimensions.width = 320; f.dimensions.height = 100;
    f.rectangles.length = 0; f.c.drawWinGlyph();
    assert.equal(f.c.winAnim.glyph, layout, 'same matrix can reuse positions after a pixel resize');
    assert.ok(f.rectangles.every(r => r.x + r.w <= 332 && r.y + r.h <= 124));
    f.c.GRID_ROWS = 2; f.c.drawWinGlyph();
    assert.equal(f.glyph().scale, 0);
    f.c.GRID_ROWS = 42; f.c.drawWinGlyph();
    assert.equal(f.glyph().scale, 2);
  });
  run('victory rendering preserves blink timing and confetti without drawing gameplay snakes', () => {
    const f = fixture(); f.start();
    f.c.renderWinAnim();
    assert.ok(f.rectangles.length > 0);
    f.rectangles.length = 0;
    f.clock.now += f.c.winAnim.blinkPeriod;
    f.c.renderWinAnim();
    assert.equal(f.rectangles.length, 0);
    f.clock.now += f.c.winAnim.blinkPeriod;
    f.c.renderWinAnim();
    assert.ok(f.rectangles.length > 0);
    assert.equal(f.calls.filter(call => call === 'confettiFrame').length, 3);
  });
  run('normal rendering delegates to the independent ceremony renderer while a victory is active', () => {
    const f = fixture(); f.start();
    vm.runInContext(fn(source, 'render', kind === 'PC' ? '      ' : '            '), f.c);
    f.c.render(0, 0);
    assert.ok(f.rectangles.length > 0);
  });
  run('round/final durations, match bookkeeping and local/online sound policies are preserved', () => {
    const round = fixture(); round.start('p1', false);
    assert.equal(round.c.winAnim.duration, 2000);
    assert.equal(round.calls.includes('round'), true);
    assert.equal(round.calls.includes('completed'), false);
    const final = fixture(); final.start();
    assert.equal(final.c.winAnim.duration, 3000);
    assert.equal(final.calls.includes('completed'), true);
    assert.equal(final.calls.includes('win'), true);
    const opponent = fixture({ isOnlineMode: true, myRole: 'p2' }); opponent.start();
    assert.equal(opponent.calls.includes('win'), false);
    assert.equal(opponent.calls.some(call => Array.isArray(call) && call[0] === 'confetti'), false);
  });
  run('a draw or missing winner does not accidentally start a P2 or AI celebration', () => {
    for (const winner of [null, undefined, 'draw']) {
      const f = fixture();
      f.c.startWinAnim(winner, true);
      assert.equal(f.c.winAnim.active, false);
      assert.equal(f.calls.length, 0);
    }
  });
}
test('PC and Mobile share the same victory glyph layout and cell renderer', () => {
  for (const name of ['buildWinGlyphData', 'drawWinGlyph']) {
    const blocks = ['PC', 'Mobile'].map(kind => fn(read(kind), name, kind === 'PC' ? '      ' : '').split('\n').map(line => line.trim()).join('\n'));
    assert.equal(blocks[0], blocks[1]);
  }
});
