const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const version = process.env.SNAKE_TEST_VERSION || '3.6.3';
const path = require('node:path');

for (const platform of ['Mobile', 'PC']) {
  const source = fs.readFileSync(path.join(__dirname, `../Ana Dosya/${platform}/Beta/v3/2 Player Snake ${platform} v${version}.html`), 'utf8');
  const a = source.indexOf('function prepareOnlineInterpolation(');
  const b = source.indexOf('\n', source.indexOf('return moved || snap;', a));
  const end = source.indexOf('}', b) + 1;
  assert.ok(a >= 0 && end > a, 'interpolation function must exist');
  const context = vm.createContext({ Number, gameStyle: 'normal', GRID_COLS: 20, GRID_ROWS: 20 });
  vm.runInContext(source.slice(a, end), context);
  const make = (x, seq, jump = 0) => ({ segments: [{x, y: 1}], moveSequence: seq, positionDiscontinuitySequence: jump, lastMoveIntervalMs: 75 });

  test(`${platform}: single move uses server duration; stationary update keeps the animation`, () => {
    const previous = make(1, 1), next = make(2, 2);
    assert.equal(context.prepareOnlineInterpolation(previous, next, 100, false), true);
    assert.equal(next.prev[0].x, 1);
    assert.equal(next._interpInterval, 75);
    const stationary = make(2, 2);
    assert.equal(context.prepareOnlineInterpolation(next, stationary, 125, false), false);
    assert.equal(stationary._interpStart, 100);
    assert.equal(stationary.prev[0].x, 1);
  });
  test(`${platform}: skipped moves and teleport snap to the authoritative position`, () => {
    for (const [sequence, jump] of [[4, 0], [2, 1]]) {
      const next = make(2, sequence, jump);
      context.prepareOnlineInterpolation(make(1, 1), next, 100, false);
      assert.equal(next.prev[0].x, 2);
    }
  });
  test(`${platform}: old servers can still animate without sequence metadata`, () => {
    const previous = {segments: [{x: 1, y: 0}]}, next = {segments: [{x: 2, y: 0}]};
    assert.equal(context.prepareOnlineInterpolation(previous, next, 50, false), true);
    assert.equal(next.prev[0].x, 1);
  });

  test(`${platform}: the portal jump remains discontinuous as it travels through the body`, () => {
    context.gameStyle = 'adventure';
    const previous = {segments: [{x: 12, y: 4}, {x: 2, y: 4}], moveSequence: 4, positionDiscontinuitySequence: 1};
    const next = {segments: [{x: 13, y: 4}, {x: 12, y: 4}], moveSequence: 5, positionDiscontinuitySequence: 1, lastMoveIntervalMs: 80};
    context.prepareOnlineInterpolation(previous, next, 100, false);
    assert.equal(next.prev[0].x, 12);
    assert.equal(next.prev[1].x, 12);
    context.gameStyle = 'normal';
  });

  test(`${platform}: a repeated round result is counted only once`, () => {
    const start = source.indexOf('let onlineStatsMatchKey = null;');
    const finish = source.indexOf('function prepareOnlineInterpolation(', start);
    const statsContext = vm.createContext({ snakes: null, matchTotalFoodP1: 0, matchTotalFoodP2: 0, longestSnakeP1: 0, longestSnakeP2: 0 });
    vm.runInContext(source.slice(start, finish), statsContext);
    const result = {roundId: 9, roundStats: {p1: {foodCount: 3, length: 7}, p2: {foodCount: 2, length: 8}}};
    statsContext.recordOnlineRound(result);
    statsContext.recordOnlineRound(result);
    assert.equal(statsContext.matchTotalFoodP1, 3);
    assert.equal(statsContext.matchTotalFoodP2, 2);
    assert.equal(statsContext.longestSnakeP1, 7);
    assert.equal(statsContext.longestSnakeP2, 8);
  });
}
