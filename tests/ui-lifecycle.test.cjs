const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = (kind, version = 'v3.5.8') => fs.readFileSync(`Ana Dosya/${kind}/Beta/v3/2 Player Snake ${kind} ${version}.html`, 'utf8').replace(/\r\n/g, '\n');
function fn(s, name, indent = '            ') {
  const start = s.search(new RegExp('^' + indent + '(?:async )?function ' + name + '\\(', 'm'));
  assert.ok(start >= 0, name);
  return s.slice(start, s.indexOf('\n' + indent + '}', start) + indent.length + 2);
}
function lifecycle(s, extra = {}) {
  let next = 0;
  const scheduled = new Map();
  const c = vm.createContext({
    setTimeout(callback) { scheduled.set(++next, callback); return next; },
    setInterval(callback) { scheduled.set(++next, callback); return next; },
    clearTimeout(id) { scheduled.delete(id); }, clearInterval(id) { scheduled.delete(id); },
    requestAnimationFrame(callback) { scheduled.set(++next, callback); return next; },
    cancelAnimationFrame(id) { scheduled.delete(id); }, ...extra
  });
  vm.runInContext(s.slice(s.indexOf('            let gameFlowRevision'), s.indexOf("const banner = document.getElementById('banner');")), c);
  return { c, scheduled };
}
for (const kind of ['Mobile', 'PC']) {
  const s = source(kind);
  test(`${kind}: exiting cancels timers and already queued round/ad callbacks`, async () => {
    const { c, scheduled } = lifecycle(s);
    let calls = 0;
    const callback = c.guardGameCallback(() => calls++);
    c.setGameTimeout(callback, 600);
    c.setGameInterval(callback, 1000);
    const queued = [...scheduled.values()];
    const delay = c.gameDelay(800);
    c.invalidateGameFlow(true);
    assert.equal(await delay, false, 'cancelled countdown must settle');
    assert.equal(scheduled.size, 0);
    queued.forEach(f => f()); callback();
    assert.equal(calls, 0);
    c.guardGameCallback(() => calls++)();
    assert.equal(calls, 1, 'current flow remains usable');
  });
  test(`${kind}: old socket callbacks cannot mutate a replacement session`, () => {
    let callback;
    const socket = { on(event, cb) { callback = cb; } };
    const { c } = lifecycle(s, { socket });
    let calls = 0;
    c.onCurrentSocket('gameStart', () => calls++);
    callback(); c.socket = {}; callback();
    assert.equal(calls, 1);
  });
  test(`${kind}: stale banner animation frame cannot resurrect hidden menu`, () => {
    const classes = new Set();
    const banner = { style: {}, innerHTML: '', inert: true, setAttribute() {},
      classList: { contains: x => classes.has(x), add: x => classes.add(x), remove: x => classes.delete(x),
        toggle: (x, on) => on ? classes.add(x) : classes.delete(x) } };
    Object.defineProperty(banner, 'className', { set() { classes.clear(); }, get() { return [...classes].join(' '); } });
    const { c, scheduled } = lifecycle(s, { banner, document: { getElementById() { return null; } },
      pendingBannerTransition: null, bannerInlineResetTimer: null, activeBannerGhostTimer: null, activeBannerGhost: null });
    const indent = kind === 'Mobile' ? '            ' : '      ';
    const names = kind === 'Mobile' ? ['clearBannerGhost', 'resetBannerInlineStyles', 'showBanner', 'hideBanner'] : ['showBanner', 'hideBanner'];
    names.forEach(name => vm.runInContext(fn(s, name, indent), c));
    c.showBanner('<button>Play</button>');
    const queued = [...scheduled.values()];
    c.hideBanner(); queued.forEach(f => f());
    assert.equal(classes.has('show'), false); assert.equal(banner.inert, true);
    c.showBanner('<button>Settings</button>'); [...scheduled.values()].forEach(f => f());
    assert.equal(classes.has('show'), true); assert.equal(banner.inert, false);
  });
}
test('online round winner callback cannot replace or hide a newer main menu', () => {
  const s = source('Mobile');
  for (const isGameOver of [false, true]) {
    let handler; const events = [];
    const socket = { on(event, callback) { handler = callback; } };
    const { c, scheduled } = lifecycle(s, { socket, intermission: false, games: {}, drawSeries() {},
      SFX: { winRound() {}, drawCrash() {}, crash() {} }, myRole: 'p1', gameMode: '2P', aiSnakeEnabled: false,
      playerNames: { p1: 'P1', p2: 'P2' }, t: x => x, escapeHtml: x => x, hapticTyped() {},
      snakes: { p1: { segments: [{}] }, p2: { segments: [{}] } }, deathAnim: {},
      dismissOnlineControls() {}, onlinePauseState: null, startDeathAnim() {},
      startWinAnim() { events.push('win'); }, showBanner() { events.push('replace'); }, hideBanner() { events.push('hide'); } });
    const start = s.indexOf("onCurrentSocket('roundOver',");
    vm.runInContext(s.slice(start, s.indexOf("onCurrentSocket('playerDisconnected',", start)), c);
    handler({ winner: 'p1', scores: { p1: 5, p2: 0 }, isGameOver });
    const pending = [...scheduled.values()];
    c.invalidateGameFlow(true); pending.forEach(f => f());
    assert.deepEqual(events, []);
  }
});
test('online control modal returns to latest pause state and never to local pause', () => {
  const s = source('Mobile'); const calls = [];
  const c = vm.createContext({ document: { getElementById() { return { classList: { remove() {} } }; } },
    controlsFromOnlinePause: true, isOnlineMode: true, paused: true, gameFlowRevision: 3,
    onlinePauseState: { revision: 3, pausedBy: 'p2', timeLeft: 7 },
    markControlsOnboardingSeen() { throw Error('online must not change onboarding'); },
    showOnlinePauseMenu: (...args) => calls.push(args) });
  vm.runInContext(fn(s, 'closeControlsModal'), c);
  c.closeControlsModal(); assert.deepEqual(calls, [['p2', 7]]);
  c.controlsFromOnlinePause = true; c.paused = false; c.closeControlsModal();
  assert.equal(calls.length, 1, 'server resume cannot reopen pause');
  c.controlsFromOnlinePause = true; c.paused = true; c.gameFlowRevision = 4; c.closeControlsModal();
  assert.equal(calls.length, 1, 'new match cannot reopen old pause');
});

test('v3.5.5: Mobile and PC include rewarded Beast start button and resume countdown', () => {
  for (const kind of ['Mobile', 'PC']) {
    const s = source(kind, 'v3.5.5');
    assert.match(s, /requestRewardedBeastStart\(/);
    assert.match(s, /startRewardedResumeCountdown\(/);
    assert.match(s, /BEAST_MODE_DURATION_MS\s*=\s*8000/);
    assert.match(s, /startWithBeast\s*=\s*(?:true|false)/);
    if (kind === 'Mobile') {
      assert.match(s, /id="qs-start-beast"/);
      assert.match(s, /display:\s*\$\{qs\.playerMode === '1P' \? 'flex' : 'none'\}/);
    } else {
      assert.match(s, /id="pqs-start-beast"/);
      assert.match(s, /display:\s*\$\{qs2\.playerMode === '1P' \? 'flex' : 'none'\}/);
    }
  }
});

test('v3.5.6: Mobile and PC apply Beast buff only to player snake without food burst', () => {
  for (const kind of ['Mobile', 'PC']) {
    const s = source(kind, 'v3.5.6');
    assert.match(s, /const VERSION = 'v3\.5\.6';/);
    assert.match(s, /requestRewardedBeastStart\(/);
    assert.match(s, /startRewardedResumeCountdown\(/);

    // Verify countdown finish hook applies buff only to player snake
    const beastStartBlock = (s.match(/if\s*\(startWithBeast\s*&&\s*snakes\s*&&\s*snakes\.p1\)\s*\{([\s\S]*?)\}/) || [])[1] || '';
    assert.ok(beastStartBlock.includes('BEAST_MODE_DURATION_MS'), `${kind} startWithBeast sets duration`);
    assert.ok(beastStartBlock.includes('SFX.heart()'), `${kind} startWithBeast triggers heart sound`);
    assert.ok(!beastStartBlock.includes('spawnRubyBurstFoods'), `${kind} startWithBeast must not trigger spawnRubyBurstFoods`);
    assert.ok(!beastStartBlock.includes('redBulkEndTime'), `${kind} startWithBeast must not set redBulkEndTime`);

    // Verify natural heart food pickup still triggers spawnRubyBurstFoods
    assert.match(s, /spawnRubyBurstFoods\(\)/, `${kind} must retain spawnRubyBurstFoods for natural pickups`);

    // Verify beastOwner cleanup when powerEnd expires
    assert.match(s, /if\s*\(beastOwner\s*&&\s*snakes(?:\s*&&\s*snakes\[beastOwner\]|\[beastOwner\])\s*&&\s*!isPowered\(snakes\[beastOwner\]\)\)\s*\{[\s\S]*?beastOwner\s*=\s*null;/);
  }
});

test('v3.5.7: PC and Mobile implement cross-play matchmaking and PC vertical arena', () => {
  for (const kind of ['Mobile', 'PC']) {
    const s = source(kind, 'v3.5.7');
    assert.match(s, /const VERSION = 'v3\.5\.7';/);
    if (kind === 'PC') {
      assert.match(s, /#stage\.vertical-arena #canvasWrap/);
      assert.match(s, /st\.classList\.toggle\('vertical-arena',\s*isVerticalArena\)/);
      assert.match(s, /cwEl\.style\.aspectRatio\s*=\s*`\$\{GRID_COLS\} \/ \$\{GRID_ROWS\}`/);
      assert.match(s, /socket\.emit\('joinMatchmaking',\s*\{[^}]*requestedRows:\s*42[^}]*\}\)/);
      assert.match(s, /function selfArea51HalfBounds\(ownerKey\)\s*\{\s*if\s*\(GRID_COLS < GRID_ROWS\)/);
    }
  }
});

test('v3.5.8: PC and Mobile implement online forfeit ad trigger and replay matchmaking', () => {
  for (const kind of ['Mobile', 'PC']) {
    const s = source(kind, 'v3.5.8');
    assert.match(s, /const VERSION = 'v3\.5\.8';/);
    assert.match(s, /const isForfeit = data\.reason === 'forfeit';/);
    assert.match(s, /AdManager\.maybeShowGameOverAd/);
    assert.match(s, /showGameEndStats\(finalWinner,\s*\{[^}]*isForfeit:\s*isForfeit/);
    assert.match(s, /if\s*\(wasOnline\s*&&\s*isForfeit\)\s*\{[\s\S]*?startMatchmaking\(\);/);
    assert.match(s, /onlinePartnerLeft/);
  }
});

