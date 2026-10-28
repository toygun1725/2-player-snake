const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.6.2.html'), 'utf8').replace(/\r\n/g, '\n');
function extract(name) {
  const start = source.indexOf(`      function ${name}(`);
  assert.ok(start >= 0, name);
  const end = source.indexOf('\n      }', start);
  assert.ok(end > start, name);
  return source.slice(start, end + '\n      }'.length);
}
test('vertical cross-play arena interpolates within each player half', () => {
  const c = vm.createContext({GRID_COLS: 24, GRID_ROWS: 36});
  vm.runInContext(extract('selfArea51HalfBounds') + '\n' + extract('selfArea51LerpY'), c);
  assert.equal(c.selfArea51LerpY(35, 18, 'p1', 0.5), 35.5);
  assert.equal(c.selfArea51LerpY(0, 17, 'p2', 0.5), 17.5);
});
test('vertical cross-play arena draws a horizontal divider', () => {
  const lines = [];
  const ctx = {save() {}, restore() {}, createLinearGradient: () => ({addColorStop() {}}),
    fillRect() {}, beginPath() {}, moveTo: (x, y) => lines.push([x, y]),
    lineTo: (x, y) => lines.push([x, y]), stroke() {}};
  const c = vm.createContext({GRID_COLS: 24, GRID_ROWS: 36, canvas: {clientWidth: 240, clientHeight: 360}, ctx});
  vm.runInContext(extract('drawSelfArea51Divider'), c);
  c.drawSelfArea51Divider();
  assert.deepEqual(lines, [[0, 180], [240, 180]]);
});
