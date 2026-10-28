const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');
const serverDir = path.resolve(__dirname, '../Ana Dosya/Server/Mobile');
const { io } = require(path.join(serverDir, 'node_modules/socket.io-client'));

function event(socket, name, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { socket.off(name, onEvent); reject(new Error(`Timed out: ${name}`)); }, timeout);
    function onEvent(value) { clearTimeout(timer); resolve(value); }
    socket.once(name, onEvent);
  });
}

test('two real Socket.IO clients reconnect during countdown and resume a manual pause', {timeout: 25000}, async () => {
  const port = await new Promise((resolve, reject) => {
    const reservation = net.createServer();
    reservation.once('error', reject);
    reservation.listen(0, '127.0.0.1', () => {
      const selected = reservation.address().port;
      reservation.close(() => resolve(selected));
    });
  });
  const child = spawn(process.execPath, ['server.js'], { cwd: serverDir, env: {...process.env, PORT: String(port)}, stdio: ['ignore', 'pipe', 'pipe'] });
  const clients = [];
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Server startup timed out')), 8000);
      child.once('error', reject);
      child.once('exit', code => reject(new Error(`Server stopped: ${code}`)));
      child.stdout.on('data', chunk => { if (String(chunk).includes('Server listening')) { clearTimeout(timer); resolve(); } });
    });
    const connect = async () => {
      const socket = io(`http://127.0.0.1:${port}`, {transports: ['websocket'], reconnection: false, forceNew: true});
      clients.push(socket);
      await event(socket, 'connect');
      return socket;
    };
    let p1 = await connect();
    let p2 = await connect();
    const created = event(p1, 'roomCreated');
    p1.emit('createRoom', {name: 'P1', mode: 'normal', platform: 'mobile'});
    const {roomId, sessionToken} = await created;
    const init = event(p2, 'gameInit');
    const joined = event(p2, 'roomJoined');
    p2.emit('joinRoom', {roomId, name: 'P2', platform: 'mobile'});
    const p2SessionToken = (await joined).sessionToken;
    const initial = await init;
    assert.ok(Number.isInteger(initial.roundId));

    const disconnected = event(p2, 'playerDisconnected');
    p1.disconnect();
    await disconnected;
    p1 = await connect();
    const restored = event(p2, 'gameResumeState');
    const started = event(p2, 'gameStart');
    p1.emit('reconnectToGame', {roomId, role: 'p1', sessionToken});
    assert.equal((await restored).restoredState, 'countdown');
    await started;
    const update = await event(p2, 'gameUpdate');
    assert.equal(update.roundId, initial.roundId);
    assert.ok(update.snakes.p1.lastMoveIntervalMs > 0);
    assert.ok(Number.isSafeInteger(update.snakes.p1.moveSequence));
    assert.ok(Number.isSafeInteger(update.snakes.p1.positionDiscontinuitySequence));

    const paused = event(p2, 'gamePaused');
    p2.emit('requestPause', {roomId});
    assert.equal((await paused).pausedBy, 'p2');
    const resumed = event(p2, 'gameStart');
    p2.emit('requestResume', {roomId});
    const result = await resumed;
    assert.ok(result.pauseDurationMs >= 2900);
    assert.ok(Number.isInteger(result.resumeGeneration));

    const p1Disconnected = event(p2, 'playerDisconnected');
    p1.disconnect();
    await p1Disconnected;
    p2.disconnect();
    await new Promise(resolve => setTimeout(resolve, 150));
    p1 = await connect();
    let prematureResume = false;
    p1.on('gameResumeCountdown', () => { prematureResume = true; });
    p1.emit('reconnectToGame', {roomId, role: 'p1', sessionToken});
    await new Promise(resolve => setTimeout(resolve, 500));
    assert.equal(prematureResume, false);
    p2 = await connect();
    const countdown = event(p1, 'gameResumeCountdown');
    const bothResumed = event(p1, 'gameStart');
    p2.emit('reconnectToGame', {roomId, role: 'p2', sessionToken: p2SessionToken});
    await countdown;
    await bothResumed;

    const roundOver = event(p2, 'roundOver');
    p1.emit('forfeitGame', {roomId});
    const finalRound = await roundOver;
    assert.equal(finalRound.isGameOver, true);
    assert.equal(finalRound.roundId, initial.roundId);
    assert.ok(finalRound.roundStats.p1.length > 0);
    assert.ok(Number.isInteger(finalRound.roundStats.p1.foodCount));
    let intents = 0;
    p1.on('opponentRematchIntent', () => {intents++;});
    p2.emit('rematchIntent', {roomId});
    p2.emit('rematchIntent', {roomId});
    await new Promise(resolve => setTimeout(resolve, 100));
    assert.equal(intents, 1);
    const rematch = event(p2, 'rematchStart');
    const newRound = event(p2, 'gameInit');
    p1.emit('rematchIntent', {roomId});
    p1.emit('rematchReady', {roomId});
    p2.emit('rematchReady', {roomId});
    await rematch;
    assert.ok((await newRound).roundId > initial.roundId);
  } finally {
    clients.forEach(socket => socket.disconnect());
    child.kill();
  }
});
