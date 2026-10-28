const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../Ana Dosya/Server/Mobile/server.js'), 'utf8');
function fixture() {
  let now = 10000, nextId = 1;
  const tasks = new Map(), events = [];
  const room = { id: 'room', p1: { id: 'a' }, p2: { id: 'b' }, state: 'playing',
    snakes: { p1: { powerEnd: 11000, slowEnd: 0 }, p2: { powerEnd: 0 } },
    foods: [{ relocateTime: 12000 }], selfArea51GreenSpawnAt: 13000 };
  const c = vm.createContext({
    rooms: { room }, matchmakingQueue: [], Date: { now: () => now },
    io: { to: () => ({ emit: (name, data) => events.push({ name, data }) }) },
    setTimeout(fn, ms) { const id = nextId++; tasks.set(id, { fn, at: now + ms }); return id; },
    clearTimeout(id) { tasks.delete(id); }, clearInterval(id) { tasks.delete(id); },
    startGameLoop() { events.push({ name: 'loop' }); },
    initGameInRoom() { events.push({ name: 'nextRound' }); }
  });
  let a = source.indexOf('function clearRoomTimers('), b = source.indexOf('function schedulePostGameCleanup(', a);
  vm.runInContext(source.slice(a, b), c);
  a = source.indexOf('function roundSummary('); b = source.indexOf('function endRound(', a);
  vm.runInContext(source.slice(a, b), c);
  a = source.indexOf('function scheduleNextRound('); b = source.indexOf('// Socket.io listeners', a);
  assert.ok(a > 0 && b > a);
  vm.runInContext(source.slice(a, b), c);
  function advance(ms) {
    const until = now + ms;
    while (true) {
      const next = [...tasks.entries()].sort((x, y) => x[1].at - y[1].at)[0];
      if (!next || next[1].at > until) break;
      tasks.delete(next[0]); now = next[1].at; next[1].fn();
    }
    now = until;
  }
  function reconnect(role) { room.disconnectedRoles[role] = false; clearTask(room.graceTimers[role]); delete room.graceTimers[role]; c.autoResumeRoom(room); }
  function clearTask(id) { tasks.delete(id); }
  return { c, room, events, advance, reconnect, time: () => now };
}

test('initial countdown resumes with its remaining time after a disconnect', () => {
  const f = fixture();
  Object.assign(f.room, {state: 'countdown', countdownKind: 'initial', countdownValue: 3});
  f.c.scheduleRoomCountdown(f.room, 1000);
  f.advance(400); f.c.handleDisconnect({id: 'a'}); f.advance(2000); f.reconnect('p1');
  f.advance(599); assert.equal(f.room.countdownValue, 3);
  f.advance(1); assert.equal(f.room.countdownValue, 2);
  f.advance(2000); assert.equal(f.room.state, 'playing');
  assert.equal(f.events.filter(e => e.name === 'loop').length, 1);
});

test('repeated disconnect during resume keeps its countdown and shifts deadlines once', () => {
  const f = fixture();
  f.c.handleDisconnect({id: 'a'}); f.advance(1000); f.reconnect('p1');
  f.advance(1000); assert.equal(f.room.countdownValue, 2);
  f.c.handleDisconnect({id: 'b'}); f.advance(2000); f.reconnect('p2');
  assert.equal(f.room.countdownValue, 2);
  f.advance(2000);
  assert.equal(f.room.state, 'playing');
  assert.equal(f.room.snakes.p1.powerEnd, 17000);
  assert.equal(f.room.snakes.p1.slowEnd, 0);
  assert.equal(f.room.foods[0].relocateTime, 18000);
  assert.equal(f.events.filter(e => e.name === 'loop').length, 1);
  assert.equal(f.events.filter(e => e.name === 'gameStart').at(-1).data.pauseDurationMs, 6000);
});

test('two disconnected players do not produce a false forfeit winner', () => {
  const f = fixture();
  f.c.handleDisconnect({id: 'a'}); f.advance(1000); f.c.handleDisconnect({id: 'b'});
  f.advance(14000);
  assert.equal(f.c.rooms.room, undefined);
  assert.equal(f.events.some(e => e.name === 'gameOver'), false);
});

test('round transition resumes after its original remaining time', () => {
  const f = fixture();
  f.room.state = 'roundOver';
  f.c.scheduleNextRound(f.room, 4000);
  f.advance(1000); f.c.handleDisconnect({id: 'a'}); f.advance(2000); f.reconnect('p1');
  assert.equal(f.room.state, 'roundOver');
  f.advance(2999); assert.equal(f.events.some(e => e.name === 'nextRound'), false);
  f.advance(1); assert.equal(f.events.filter(e => e.name === 'nextRound').length, 1);
  assert.equal(f.events.find(e => e.name === 'gameResumeState').data.pauseDurationMs, 2000);
});

test('only the still disconnected player forfeits when the opponent remains connected', () => {
  const f = fixture();
  f.c.handleDisconnect({id: 'a'});
  f.advance(15000);
  const result = f.events.find(e => e.name === 'gameOver');
  assert.equal(result.data.winner, 'p2');
  assert.equal(result.data.reason, 'forfeit');
  assert.equal(f.c.rooms.room, undefined);
});
