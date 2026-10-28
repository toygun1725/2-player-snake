const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
for (const kind of ['Mobile', 'PC']) {
  const file = path.join(root, `Ana Dosya/${kind}/Beta/v3/2 Player Snake ${kind} v3.6.2.html`);
  const html = fs.readFileSync(file, 'utf8');
  const start = html.indexOf('function buildRespawnSegments(');
  const end = html.indexOf(kind === 'Mobile' ? '// AI BFS path cache' : 'let totalEaten = 0;', start);
  assert.ok(start > 0 && end > start, 'respawn functions found in v3.6.2');
  const c = vm.createContext({
    GRID_COLS: 24, GRID_ROWS: 36,
    dirMap: { up: {x: 0, y: -1}, right: {x: 1, y: 0}, down: {x: 0, y: 1}, left: {x: -1, y: 0} },
    handleBoundaries(cell, owner) {
      assert.equal(owner, 'p1');
      return { x: (cell.x + 24) % 24, y: ((cell.y - 18 + 18) % 18) + 18 };
    }
  });
  vm.runInContext(html.slice(start, end), c, { filename: file });

  test(`${kind}: safe respawn stays in P1 half and retains pending length`, () => {
    const snake = { dir: {x: 1, y: 0}, segments: Array.from({length: 80}, () => ({x: 9, y: 20})), grow: 3 };
    const foods = [{ x: 9, y: 20 }];
    const barriers = [{ cells: [{x: 8, y: 20}] }];
    const portals = [{x: 7, y: 20}];
    const revived = c.buildRewardedContinueSnake(snake, null, barriers, portals, foods);
    assert.ok(revived);
    assert.equal(revived.segments.length, 5);
    assert.equal(revived.grow, 78);
    const occupied = new Set(['9,20', '8,20', '7,20']);
    for (const segment of revived.segments) {
      assert.ok(segment.y >= 18 && segment.y < 36);
      assert.equal(occupied.has(`${segment.x},${segment.y}`), false);
    }
  });

  test(`${kind}: no free respawn returns null`, () => {
    const snake = { dir: {x: 1, y: 0}, segments: [{x: 0, y: 18}], grow: 0 };
    const blocked = Array.from({length: 24 * 18}, (_, i) => ({ x: i % 24, y: 18 + Math.floor(i / 24) }));
    assert.equal(c.buildRewardedContinueSnake(snake, null, [{ cells: blocked }], [], []), null);
  });
}
