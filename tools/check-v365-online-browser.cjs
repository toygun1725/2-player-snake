'use strict';

// Runs actual game HTML against a temporary local copy of the game server.
// Network requests other than the local server are blocked. The Socket.IO
// client and local test URL are injected without modifying game sources.
const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const net = require('node:net');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const serverDir = path.resolve('Ana Dosya/Server/Mobile');
const socketLib = fs.readFileSync('Ana Dosya/Android/app/src/main/assets/web_assets/socket.io.min.js', 'utf8');
const chrome = process.env.SNAKE_CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const game = (kind, version) => path.resolve(`Ana Dosya/${kind}/Beta/v3/2 Player Snake ${kind} v${version}.html`);

async function reservePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.once('error', reject);
    s.listen(0, '127.0.0.1', () => { const port = s.address().port; s.close(() => resolve(port)); });
  });
}

async function openPlayer(browser, port, kind, version) {
  const context = await browser.newContext({viewport: kind === 'Mobile' ? {width:390,height:844} : {width:1280,height:800}});
  await context.addInitScript(({port}) => {
    window.__testEvents = [];
    const originalFetch = window.fetch.bind(window);
    window.fetch = (url, ...args) => originalFetch(String(url).replace('http://localhost:3000', `http://127.0.0.1:${port}`), ...args);
  }, {port});
  await context.route(/^https?:/, async route => {
    const url = route.request().url();
    if (url.startsWith('https://cdn.socket.io/4.7.5/socket.io.min.js')) {
      const hook = `\n;(function(){var original=window.io;window.io=function(url,opts){var s=original('http://127.0.0.1:${port}',opts);window.__testSocket=s;s.on('connect',function(){window.__testEvents.push({name:'connect'});});s.on('connect_error',function(e){window.__testEvents.push({name:'connect_error',data:String(e)});});s.onAny(function(name,data){if(name==='gameUpdate'){window.__updateCount=(window.__updateCount||0)+1;return;}window.__testEvents.push({name:name,data:data});});var emit=s.emit;s.emit=function(name,data){window.__testEvents.push({name:'sent:'+name,data:data});return emit.apply(s,arguments);};return s;};})();`;
      await route.fulfill({status:200,contentType:'application/javascript',body:socketLib+hook});
    } else if (url.startsWith(`http://127.0.0.1:${port}/`)) await route.continue();
    else await route.abort();
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const networkErrors = [];
  page.on('console', message => { if (message.type() === 'error') networkErrors.push(message.text()); });
  page.on('requestfailed', request => { if (request.url().startsWith(`http://127.0.0.1:${port}/`)) networkErrors.push(`${request.url()} ${request.failure()?.errorText}`); });
  try {
    await page.goto(pathToFileURL(game(kind,version)).href, {waitUntil:'load',timeout:30000});
    await page.locator('#menuPlay').click({timeout:15000});
    await page.locator('#btnPlayOnline').click({timeout:15000});
    await page.locator('#btnMatchmaking').click({timeout:15000});
    return {context,page,errors,kind,version};
  } catch (error) {
    const state = await page.evaluate(() => ({events:window.__testEvents, text:document.body.innerText.slice(-500), hasIo:typeof window.io})).catch(() => ({}));
    await context.close();
    throw new Error(`${kind} v${version}: ${error.message}; JS errors: ${errors.join('; ')}; network: ${networkErrors.slice(-5).join('; ')}; state: ${JSON.stringify(state)}`);
  }
}

async function match(browser, port, a, b) {
  const players = [];
  try {
    players.push(await openPlayer(browser,port,...a));
    players.push(await openPlayer(browser,port,...b));
    for (const player of players) {
      await player.page.waitForFunction(() => window.__testEvents.some(e => e.name === 'gameStart') && window.__updateCount > 0, null, {timeout:20000});
      const data = await player.page.evaluate(() => ({events:window.__testEvents,updates:window.__updateCount}));
      assert.ok(data.events.some(e => e.name === 'sent:joinMatchmaking'), 'matchmaking request missing');
      const init = data.events.find(e => e.name === 'gameInit');
      assert.ok(init && init.data.snakes && init.data.foods, 'game initialization missing');
      assert.ok(data.updates > 0, 'no server updates');
      assert.deepEqual(player.errors, [], `${player.kind} v${player.version} page errors`);
    }
    if (a[0] === 'Mobile' && a[1] === '3.6.5' && b[0] === 'PC' && b[1] === '3.6.5') {
      const mobile = players[0].page, pc = players[1].page;
      // Exercise actual UI input rather than emitting socket events from the test.
      for (const key of ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft']) await pc.keyboard.press(key);
      await pc.waitForFunction(() => window.__testEvents.some(e => e.name === 'sent:directionChange'), null, {timeout:5000});
      await mobile.locator('#pauseBtnP1').click({timeout:8000});
      for (const player of players) await player.page.waitForFunction(() => window.__testEvents.some(e => e.name === 'gamePaused'), null, {timeout:8000});
      await mobile.locator('#btnOnlineResume').click({timeout:8000});
      for (const player of players) {
        await player.page.waitForFunction(() => window.__testEvents.filter(e => e.name === 'gameStart').length >= 2, null, {timeout:10000});
        assert.deepEqual(player.errors, [], `${player.kind} v${player.version} page errors after pause/resume`);
      }
      console.log('Mobile/PC v3.6.5: PC direction input and mobile pause/resume UI reached both clients.');
      await reconnect(players[1], players[0]);
    }
    await reconnect(players[0], players[1]);
    console.log(`${a.join(' v')} + ${b.join(' v')}: actual HTML connected, matched and received game updates.`);
  } finally { for (const player of players) await player.context.close(); }
}

async function reconnect(disconnected, other) {
  const counts = await Promise.all([disconnected, other].map(p => p.page.evaluate(() => ({
    starts: window.__testEvents.filter(e => e.name === 'gameStart').length,
    reconnects: window.__testEvents.filter(e => e.name === 'sent:reconnectToGame').length,
    disconnects: window.__testEvents.filter(e => e.name === 'playerDisconnected').length
  }))));
  await disconnected.page.evaluate(() => window.__testSocket.io.engine.close());
  await other.page.waitForFunction(previous => window.__testEvents.filter(e => e.name === 'playerDisconnected').length > previous, counts[1].disconnects, {timeout:8000});
  await disconnected.page.waitForFunction(previous => window.__testEvents.filter(e => e.name === 'sent:reconnectToGame').length > previous, counts[0].reconnects, {timeout:10000});
  for (const [index, player] of [disconnected, other].entries()) {
    await player.page.waitForFunction(previous => window.__testEvents.filter(e => e.name === 'gameStart').length > previous, counts[index].starts, {timeout:12000});
    const updates = await player.page.evaluate(() => window.__updateCount);
    await player.page.waitForFunction(previous => window.__updateCount > previous, updates, {timeout:5000});
    assert.deepEqual(player.errors, [], `${player.kind} v${player.version} page errors after reconnect`);
  }
  console.log(`${disconnected.kind} v${disconnected.version}: dropped connection rejoined the match and both clients received new updates.`);
}

(async () => {
  const port = await reservePort();
  const child = spawn(process.execPath,['server.js'],{cwd:serverDir,env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']});
  let browser;
  try {
    await new Promise((resolve,reject) => {
      const timer=setTimeout(()=>reject(new Error('Local server startup timed out')),10000);
      child.once('error',reject);
      child.once('exit',code=>reject(new Error(`Local server stopped: ${code}`)));
      child.stdout.on('data',chunk=>{if(String(chunk).includes('Server listening')){clearTimeout(timer);resolve();}});
      child.stderr.on('data',chunk=>process.stderr.write(chunk));
    });
    browser=await chromium.launch({headless:true,executablePath:chrome});
    await match(browser,port,['Mobile','3.6.5'],['PC','3.6.5']);
    await match(browser,port,['Mobile','3.6.1'],['Mobile','3.6.5']);
    await match(browser,port,['PC','3.6.1'],['PC','3.6.5']);
  } finally {
    if(browser) await browser.close();
    child.kill();
  }
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
