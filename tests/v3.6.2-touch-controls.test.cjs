const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '../Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.6.2.html'), 'utf8');

test('D-pad slides between directions and keeps a shared press until both pointers release', () => {
  const calls = [], handlers = {}, windowHandlers = {};
  const buttons = ['up', 'right'].map(dir => {
    const classes = new Set();
    return { dataset: {player: 'p1', dir}, classList: {add: v => classes.add(v), remove: v => classes.delete(v)}, classes };
  });
  const cluster = { addEventListener: (type, fn) => { handlers[type] = fn; }, contains: b => buttons.includes(b), setPointerCapture() {} };
  let hit = buttons[0];
  const document = {
    querySelectorAll: selector => selector === '.dpad-cluster' ? [cluster] : buttons.filter(b => b.classes.has('pressed')),
    elementFromPoint: () => ({ closest: () => hit })
  };
  const c = vm.createContext({ document, touchGesture: {active: false}, performance: {now: () => 0},
    window: {addEventListener: (type, fn) => {windowHandlers[type] = fn;}},
    handleDpadPress: (player, dir) => calls.push([player, dir]) });
  const start = html.indexOf('const activeDpadPointers = new Map();');
  const end = html.indexOf('// Keyboard input for desktop testing', start);
  assert.ok(start > 0 && end > start);
  vm.runInContext(html.slice(start, end), c);
  c.initDpadButtons();
  const event = (id, button) => ({pointerId: id, target: {closest: () => button}, preventDefault() {}, stopPropagation() {}, cancelable: true, clientX: 0, clientY: 0});
  handlers.pointerdown(event(1, buttons[0]));
  handlers.pointerdown(event(2, buttons[0]));
  hit = buttons[1]; handlers.pointermove(event(1, buttons[0]));
  assert.ok(buttons[0].classes.has('pressed'));
  assert.ok(buttons[1].classes.has('pressed'));
  handlers.pointerup(event(2, buttons[0]));
  assert.equal(buttons[0].classes.has('pressed'), false);
  handlers.lostpointercapture(event(1, buttons[1]));
  assert.equal(buttons[1].classes.has('pressed'), false);
  assert.deepEqual(calls, [['p1', 'up'], ['p1', 'up'], ['p1', 'right']]);
  handlers.pointerdown(event(3, buttons[0])); windowHandlers.blur();
  assert.equal(buttons[0].classes.has('pressed'), false);
});

test('online swipe sends direction on movement even when gameMode is 2P', () => {
  const handlers = {}, sent = [];
  const canvas = { style: {}, width: 240, height: 360, setPointerCapture() {},
    getBoundingClientRect: () => ({left: 0, top: 0, width: 240, height: 360}),
    addEventListener: (type, fn) => {handlers[type] = fn;} };
  const c = vm.createContext({ document: {getElementById: () => canvas}, window: {addEventListener() {}}, dpr: 1,
    touchGesture: {active: false}, isSwipeControlEnabled: true, gameMode: '2P', isOnlineMode: true,
    snakes: {p2: {}}, myRole: 'p2', inCountdown: false, intermission: false, paused: false,
    currentSpeedMode: null, onlineRoomId: 'room', socket: {emit: (...args) => sent.push(args)},
    getAbsoluteDir: dir => dir, performance: {now: () => 10}, hapticVibrate() {} });
  const start = html.indexOf('(function initSwipeControls()');
  const end = html.indexOf('/* === Menu Pages === */', start);
  assert.ok(start > 0 && end > start);
  vm.runInContext(html.slice(start, end), c);
  handlers.pointerdown({pointerId: 1, clientX: 10, clientY: 10});
  handlers.pointermove({pointerId: 1, clientX: 50, clientY: 10});
  assert.equal(sent.length, 1);
  assert.equal(sent[0][0], 'directionChange');
  assert.equal(sent[0][1].roomId, 'room');
  assert.equal(sent[0][1].direction, 'right');
  handlers.pointerup({pointerId: 1});
  assert.equal(sent.length, 1);
});
