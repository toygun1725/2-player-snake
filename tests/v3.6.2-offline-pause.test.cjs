const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
for (const kind of ['Mobile', 'PC']) {
  const file = path.join(root, `Ana Dosya/${kind}/Beta/v3/2 Player Snake ${kind} v3.6.2.html`);
  const html = fs.readFileSync(file, 'utf8');
  const start = html.indexOf('let offlinePauseStartedAt = null;');
  const end = html.indexOf(kind === 'Mobile' ? 'function closePauseBubbles(' : "addEventListener('keydown'", start);
  assert.ok(start > 0 && end > start);
  const state = {
    time: 1000, paused: false, isOnlineMode: false, isDemoMode: false,
    gameMode: '1P', currentSpeedMode: 'NORMAL', inCountdown: false, intermission: false,
    roundTimerEnd: 2000, matchStartTime: 500, redBulkEndTime: 0,
    selfArea51GreenSpawnAt: 2000, selfArea51GreenLastMove: 0,
    foods: [{spawnAt: 900, relocateTime: 2000, expiryTime: 1800}],
    snakes: {p1: {powerEnd: 1500, slowEnd: 0, digestAnims: [{startTime: 900}], gulpPop: {start: 950, duration: 140}}},
    comboState: {p1: {lastEatAt: 900}, p2: {lastEatAt: 0}},
    SFX: {pause() {}, unpause() {}}, syncPauseButtons() {}
  };
  state.performance = { now: () => state.time };
  state.shiftSnakeTimestamps = (snake, delta) => {
    for (const k of ['powerEnd', 'slowEnd', 'flashUntil', 'shakeUntil', 'dashEndTime', 'dashCooldown']) {
      if (snake[k] > 0) snake[k] += delta;
    }
    for (const anim of snake.digestAnims || []) anim.startTime += delta;
  };
  const c = vm.createContext(state);
  vm.runInContext(html.slice(start, end), c, {filename: file});
  const setPause = kind === 'Mobile' ? c.setPauseState : c.setOfflinePauseState;

  test(`${kind}: a repeated pause shifts active timestamps once on resume`, () => {
    setPause(true);
    c.time = 2000;
    setPause(true);
    c.time = 4000;
    setPause(false);
    assert.equal(c.roundTimerEnd, 5000);
    assert.equal(c.matchStartTime, 3500);
    assert.equal(c.redBulkEndTime, 0);
    assert.equal(c.foods[0].expiryTime, 4800);
    assert.equal(c.snakes.p1.powerEnd, 4500);
    assert.equal(c.snakes.p1.slowEnd, 0);
    assert.equal(c.snakes.p1.gulpPop.start, 3950);
    assert.equal(c.comboState.p1.lastEatAt, 3900);
    assert.equal(c.comboState.p2.lastEatAt, 0);
    setPause(false);
    assert.equal(c.roundTimerEnd, 5000);
  });
}
