const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
for (const kind of ['Mobile', 'PC']) {
const source = fs.readFileSync(path.join(root, `Ana Dosya/${kind}/Beta/v3/2 Player Snake ${kind} v3.6.1.html`), 'utf8').replace(/\r\n/g, '\n');
const indent = kind === 'Mobile' ? '            ' : '      ';
const runTest = (name, body) => test(`${kind}: ${name}`, body);
const start = source.indexOf('/* v3.5.9: Solo Normal length milestones');
const feature = source.slice(start, source.indexOf(`\n${kind === 'PC' ? indent : ''}function resetArcadeFxState()`, start));
assert.ok(start > 0);

function fixture(extra = {}) {
  const rectangles = [], motion = { matches: false }, stack = [], sounds = [];
  const context = vm.createContext({
    window: { matchMedia: () => motion }, gameStyle: 'normal', gameMode: '1P',
    aiSnakeEnabled: false, isOnlineMode: false, isDemoMode: false,
    paused: false, intermission: false, inCountdown: false,
    winAnim: { active: false }, deathAnim: { active: false },
    GRID_COLS: 24, GRID_ROWS: 36, playerColors: { p1: '#ff4fbf' },
    SFX: { lengthMilestone() { sounds.push('milestone'); } },
    getCellCoords(x, y) { return { x: 12 + x * 17, y: 24 + y * 17, szX: 17, szY: 17 }; },
    ctx: {
      globalAlpha: 1, fillStyle: '#fff',
      save() { stack.push({ alpha: this.globalAlpha, color: this.fillStyle }); },
      restore() { const state = stack.pop(); this.globalAlpha = state.alpha; this.fillStyle = state.color; },
      fillRect(x, y, w, h) { rectangles.push({ x, y, w, h, alpha: this.globalAlpha, color: this.fillStyle }); }
    },
    opposite(a, b) { return a.x === -b.x && a.y === -b.y; },
    handleBoundaries(cell) { return { x: (cell.x + 24) % 24, y: (cell.y + 36) % 36 }; },
    ...extra
  });
  vm.runInContext(feature, context);
  const bodyStart = source.indexOf(`${indent}function bodyAdvance(`);
  vm.runInContext(source.slice(bodyStart, source.indexOf(`${indent}function collideCheckDetailed(`, bodyStart)), context);
  context.state = () => JSON.parse(vm.runInContext('JSON.stringify(soloLengthMilestone)', context));
  return { context, rectangles, motion, sounds };
}

runTest('actual growth reaches 10 on its second movement; the popup keeps controls live', () => {
  const { context: c, sounds } = fixture();
  const snake = { segments: Array.from({ length: 8 }, (_, i) => ({ x: 14 - i, y: 4 })),
    dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 }, inputQueue: [], grow: 2 };
  assert.equal(c.bodyAdvance(snake, 'p1'), true);
  assert.equal(snake.segments.length, 9);
  assert.equal(c.state().value, 0);
  assert.equal(sounds.length, 0);
  assert.equal(c.bodyAdvance(snake, 'p1'), true);
  assert.equal(snake.segments.length, 10);
  assert.equal(c.state().value, 10);
  assert.equal(sounds.length, 1);
  c.advanceSoloLengthMilestone(100);
  snake.inputQueue.push({ x: 0, y: 1 });
  c.bodyAdvance(snake, 'p1');
  assert.equal(snake.segments[0].y, 5);
  assert.equal(c.state().elapsed, 100, 'moving at length 10 must not restart the effect');
  assert.equal(sounds.length, 1, 'the sound fires once at the actual growth threshold');
});

runTest('each crossed multiple appears once; rewarded rewind retains reached milestones; a new round clears them', () => {
  const { context: c } = fixture();
  for (const length of [10, 20, 30, 100]) {
    c.recordSoloLengthMilestone(length - 1, length);
    assert.equal(c.state().value, length);
    c.advanceSoloLengthMilestone(400);
    c.recordSoloLengthMilestone(length, length);
    assert.equal(c.state().elapsed, 400);
  }
  c.resetSoloLengthMilestone(false);
  c.recordSoloLengthMilestone(99, 100);
  assert.equal(c.state().value, 0);
  c.recordSoloLengthMilestone(109, 110);
  assert.equal(c.state().value, 110);
  c.resetSoloLengthMilestone();
  c.recordSoloLengthMilestone(9, 10);
  assert.equal(c.state().value, 10);
});

runTest('2P, AI, online, demo and other game styles never trigger the solo effect', () => {
  for (const mode of [
    { gameMode: '2P' }, { aiSnakeEnabled: true }, { isOnlineMode: true }, { isDemoMode: true },
    { gameStyle: 'fastCompetitive' }, { gameStyle: 'adventure' }, { gameStyle: 'selfArea51' }
  ]) {
    const { context: c, rectangles, sounds } = fixture(mode);
    c.recordSoloLengthMilestone(9, 10);
    c.advanceSoloLengthMilestone(100);
    c.drawSoloLengthMilestone();
    assert.equal(c.state().value, 0, JSON.stringify(mode));
    assert.equal(rectangles.length, 0);
    assert.equal(sounds.length, 0);
  }
});

runTest('pause, countdown, intermission and result ceremonies suspend and hide the effect', () => {
  for (const key of ['paused', 'inCountdown', 'intermission', 'winAnim', 'deathAnim']) {
    const { context: c, rectangles } = fixture();
    c.recordSoloLengthMilestone(9, 10);
    c.advanceSoloLengthMilestone(100);
    if (key.endsWith('Anim')) c[key].active = true; else c[key] = true;
    c.advanceSoloLengthMilestone(1600);
    c.drawSoloLengthMilestone();
    assert.equal(c.state().elapsed, 100, key);
    assert.equal(rectangles.length, 0, key);
    if (key.endsWith('Anim')) c[key].active = false; else c[key] = false;
    c.advanceSoloLengthMilestone(1499);
    assert.equal(c.state().value, 10);
    c.advanceSoloLengthMilestone(1);
    assert.equal(c.state().value, 0);
  }
});

runTest('matrix cells briefly brighten then fade continuously over 1.6 seconds, without blinking', () => {
  const { context: c, rectangles } = fixture();
  c.recordSoloLengthMilestone(9, 10);
  c.advanceSoloLengthMilestone(100);
  c.drawSoloLengthMilestone();
  assert.ok(rectangles.length > 0);
  assert.ok(rectangles.every(r => r.color === '#ff4fbf' && r.alpha > 0 && r.alpha <= 0.34));
  assert.equal(c.ctx.globalAlpha, 1);
  let previousOpacity = rectangles[0].alpha;
  rectangles.length = 0;
  for (const delta of [150, 250, 250, 250, 400]) {
    c.advanceSoloLengthMilestone(delta);
    c.drawSoloLengthMilestone();
    assert.ok(rectangles.length > 0, 'the number stays visible during the fade');
    const opacity = rectangles[0].alpha;
    assert.ok(opacity < previousOpacity, 'brightness never rebounds after the initial shine');
    previousOpacity = opacity;
    rectangles.length = 0;
  }
  c.advanceSoloLengthMilestone(200);
  c.drawSoloLengthMilestone();
  assert.equal(rectangles.length, 0, 'the effect has expired at 1600ms');
});

runTest('10, 100 and 2000 remain centered inside small, tall and wide matrices', () => {
  for (const [cols, rows] of [[24, 10], [24, 36], [24, 42], [24, 100], [64, 36]]) {
    for (const value of [10, 100, 2000]) {
      const { context: c, rectangles } = fixture({ GRID_COLS: cols, GRID_ROWS: rows });
      c.recordSoloLengthMilestone(value - 1, value);
      c.advanceSoloLengthMilestone(100);
      c.drawSoloLengthMilestone();
      assert.ok(rectangles.length > 0, `${cols}x${rows}: ${value}`);
      assert.ok(rectangles.every(r => r.x >= 12 && r.y >= 24 && r.x + r.w <= 12 + cols * 17 && r.y + r.h <= 24 + rows * 17));
      assert.ok(rectangles.every(r => r.w === r.h), 'every drawn tile stays square');
      const centerX = (Math.min(...rectangles.map(r => r.x)) + Math.max(...rectangles.map(r => r.x + r.w))) / 2;
      const centerY = (Math.min(...rectangles.map(r => r.y)) + Math.max(...rectangles.map(r => r.y + r.h))) / 2;
      assert.ok(Math.abs(centerX - (12 + cols * 17 / 2)) <= 8.5);
      assert.ok(Math.abs(centerY - (24 + rows * 17 / 2)) <= 8.5);
    }
  }
});

runTest('reduced motion retains the same gentle fade as the regular motion preference', () => {
  const { context: c, rectangles, motion } = fixture();
  motion.matches = true;
  c.recordSoloLengthMilestone(9, 10);
  c.advanceSoloLengthMilestone(250);
  c.drawSoloLengthMilestone();
  assert.ok(rectangles.length > 0);
  const regular = fixture();
  regular.context.recordSoloLengthMilestone(9, 10);
  regular.context.advanceSoloLengthMilestone(250);
  regular.context.drawSoloLengthMilestone();
  assert.equal(rectangles[0].alpha, regular.rectangles[0].alpha);
});

function audioFixture(extra = {}) {
  const f = fixture(), oscillators = [], timers = [];
  Object.assign(f.context, {
    muted: false, ensureAudio() {},
    audioCtx: {
      state: 'running', currentTime: 0, destination: {},
      createOscillator() {
        const oscillator = { frequency: { value: 0, linearRampToValueAtTime() {} },
          connect(gain) { return gain; },
          start(time) { this.startAt = time; }, stop(time) { this.stopAt = time; } };
        oscillators.push(oscillator);
        return oscillator;
      },
      createGain() { return { gain: { value: 0, linearRampToValueAtTime() {} }, connect() {} }; }
    },
    setGameTimeout(callback, ms) { timers.push({ callback, ms }); },
    ...extra
  });
  const toneStart = source.indexOf(`${indent}function tone(`);
  const sfxStart = source.indexOf(`${indent}const SFX =`, toneStart);
  const sfxClose = `\n${indent}};`;
  const sfxEnd = source.indexOf(sfxClose, sfxStart) + sfxClose.length;
  vm.runInContext(source.slice(toneStart, sfxStart) + source.slice(sfxStart, sfxEnd).replace('const SFX =', 'SFX ='), f.context);
  return { ...f, oscillators, timers };
}

runTest('the milestone plays two rising notes in 260ms and does not repeat after the same threshold', () => {
  const { context: c, oscillators, timers } = audioFixture();
  c.recordSoloLengthMilestone(9, 10);
  assert.equal(oscillators.length, 1);
  assert.equal(oscillators[0].frequency.value, 880);
  assert.equal(oscillators[0].type, 'triangle');
  assert.equal(timers.length, 1);
  assert.equal(timers[0].ms, 90);
  c.audioCtx.currentTime = 0.09;
  timers[0].callback();
  assert.equal(oscillators.length, 2);
  assert.equal(oscillators[1].frequency.value, 1320);
  assert.equal(oscillators[1].type, 'sine');
  assert.ok(Math.abs(oscillators[1].stopAt - 0.26) < 0.00001);
  c.recordSoloLengthMilestone(10, 10);
  c.resetSoloLengthMilestone(false);
  c.recordSoloLengthMilestone(9, 10);
  assert.equal(oscillators.length, 2);
});

runTest('mute silences milestones without hiding them, and can suppress the pending second note', () => {
  const { context: c, oscillators, timers } = audioFixture({ muted: true });
  c.recordSoloLengthMilestone(9, 10);
  assert.equal(c.state().value, 10);
  assert.equal(oscillators.length, 0);
  assert.equal(timers.length, 0);
  c.muted = false;
  c.recordSoloLengthMilestone(19, 20);
  assert.equal(oscillators.length, 1);
  c.muted = true;
  timers[0].callback();
  assert.equal(oscillators.length, 1);
  c.muted = false;
  c.paused = true;
  timers[0].callback();
  assert.equal(oscillators.length, 1);
});

runTest('the render path places the number below snakes and food', () => {
  const renderStart = source.indexOf(`${indent}function render(alpha1, alpha2)`);
  const render = source.slice(renderStart, source.indexOf(`${indent}function drawSelfArea51Divider()`, renderStart));
  const calls = [];
  const { context: c } = fixture({ IS_IOS_SHELL: false, canvas: { width: 408, height: 612 }, dpr: 1,
    snakes: { p1: {} }, screenShake: { trauma: 0 } });
  c.ctx.clearRect = () => {};
  for (const name of ['drawGrid', 'drawGridRipples', 'drawGridGlowTrail', 'drawSoloLengthMilestone',
    'drawAdventureOverlay', 'drawSnakeBlocks', 'drawFoods', 'drawFoodBursts', 'drawComboPopups',
    'drawTouchGestureIndicator', 'drawInGameCountdown']) c[name] = () => calls.push(name);
  vm.runInContext(render, c);
  c.render(0, 0);
  assert.ok(calls.indexOf('drawGrid') < calls.indexOf('drawSoloLengthMilestone'));
  assert.ok(calls.indexOf('drawSoloLengthMilestone') < calls.indexOf('drawSnakeBlocks'));
  assert.ok(calls.indexOf('drawSoloLengthMilestone') < calls.indexOf('drawFoods'));
});

runTest('v3.6.1 scripts parse and mobile packaged fallbacks match current Mobile', () => {
  assert.match(source, /const VERSION = 'v3\.6\.1';/);
  for (const script of source.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)) new vm.Script(script[1]);
  if (kind === 'Mobile') for (const file of ['Ana Dosya/Android/app/src/main/assets/offline/mobile_offline_fallback.html',
    'Ana Dosya/iOS/TwoPlayerSnake/Resources/Offline/mobile_offline_fallback.html']) {
    const currentMobile = fs.readFileSync(path.join(root, 'Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.6.5.html'), 'utf8');
    assert.ok(fs.readFileSync(path.join(root, file), 'utf8') === currentMobile, `${file} differs from current Mobile`);
  }
});
}

test('PC canvas cell coordinates use CSS dimensions, including on high DPI displays', () => {
  const source = fs.readFileSync(path.join(root, 'Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.6.1.html'), 'utf8');
  const helper = source.match(/function getCellCoords\(x, y\) \{[\s\S]*?\n      \}/)[0];
  const context = vm.createContext({ canvas: { clientWidth: 1280, clientHeight: 720, width: 2560, height: 1440 }, GRID_COLS: 64, GRID_ROWS: 36 });
  vm.runInContext(helper, context);
  assert.deepEqual(JSON.parse(JSON.stringify(context.getCellCoords(32, 18))), { x: 640, y: 360, szX: 20, szY: 20 });
});

test('Mobile and PC share identical milestone behavior', () => {
  const blocks = ['Mobile', 'PC'].map(kind => {
    const source = fs.readFileSync(path.join(root, `Ana Dosya/${kind}/Beta/v3/2 Player Snake ${kind} v3.6.1.html`), 'utf8').replace(/\r\n/g, '\n');
    const start = source.indexOf('/* v3.5.9: Solo Normal length milestones');
    const rest = source.slice(start);
    return rest.slice(0, rest.search(/\n\s*function resetArcadeFxState\(/)).split('\n').map(line => line.trim()).join('\n').trim();
  });
  assert.equal(blocks[0], blocks[1]);
});
