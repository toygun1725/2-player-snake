'use strict';

// Exercises HTML against the checked-in legacy iOS shim and simulated Android
// bridge capabilities. Store billing and native dialogs are not simulated.
const { chromium } = require('playwright');
const { execFileSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');

const shimPath = 'Ana Dosya/iOS/TwoPlayerSnake/Bridge/ios_bridge_bootstrap.js';
const legacyIos = execFileSync('git', ['show', `HEAD:${shimPath}`], { encoding: 'utf8' });
const currentIos = fs.readFileSync(shimPath, 'utf8');
const mobileNew = 'Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.6.5.html';
const iosFallback = 'Ana Dosya/iOS/TwoPlayerSnake/Resources/Offline/mobile_offline_fallback.html';
const androidFallback = 'Ana Dosya/Android/app/src/main/assets/offline/mobile_offline_fallback.html';
const oldFallbackPath = 'Ana Dosya/iOS/TwoPlayerSnake/Resources/Offline/mobile_offline_fallback.html';
const oldFallback = execFileSync('git', ['show', `HEAD:${oldFallbackPath}`]);
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'snake-legacy-'));
const mobileOld = path.join(tempDir, 'mobile_offline_fallback.html');
fs.writeFileSync(mobileOld, oldFallback);
const chrome = process.env.SNAKE_CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function scenario(browser, name, html, platform, shim, modern) {
  const context = await browser.newContext({viewport:{width:360,height:720}});
  await context.route(/^https?:/, route => route.abort());
  await context.addInitScript(({platform,modern}) => {
    window.__testBridgeCalls = [];
    if (platform === 'ios') {
      window.webkit = {messageHandlers:{iOS:{postMessage:message => window.__testBridgeCalls.push(message)}}};
    } else {
      window.Android = {
        restorePurchases() { window.__testBridgeCalls.push({action:'restorePurchases'}); },
        notifyHighScore(scores, platform) { window.__testBridgeCalls.push({action:'notifyHighScore',scores,platform}); },
        hapticEvent() {}, triggerVibration() {}, isAdsRemoved() { return 'false'; }
      };
      if (modern) window.Android.setHapticsEnabled = enabled => window.__testBridgeCalls.push({action:'setHapticsEnabled',enabled});
    }
  },{platform,modern});
  if (shim) await context.addInitScript({content:shim});
  const page = await context.newPage();
  const errors=[]; page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(pathToFileURL(path.resolve(html)).href,{waitUntil:'load',timeout:30000});
    await page.locator('#menuSettings').click({timeout:12000});
    const restore=page.locator('#menuRestorePurchases');
    await restore.waitFor();
    await page.evaluate(()=>{
      window.onAndroidSettings({adsRemoved:false,vibrationEnabled:false});
      window.onAndroidSettings({adsRemoved:false,vibrationEnabled:false});
    });
    assert.equal(await restore.count(),1,`${name}: duplicate restore button`);
    await restore.click();
    const calls=await page.evaluate(()=>window.__testBridgeCalls.filter(x=>x.action==='restorePurchases'));
    assert.equal(calls.length,1,`${name}: restore must invoke the native bridge once`);
    await page.evaluate(()=>window.onAndroidSettings({adsRemoved:true,vibrationEnabled:false}));
    if (html === mobileOld) {
      // The shipped v3.6.1 fallback refreshes this menu only on reopening it.
      await page.locator('#settingsBack').click();
      await page.locator('#menuSettings').click();
    }
    assert.equal(await restore.count(),0,`${name}: restore button should disappear for premium`);
    await page.evaluate(()=>window.onAndroidSettings({adsRemoved:false,vibrationEnabled:false}));
    if (html === mobileOld) {
      await page.locator('#settingsBack').click();
      await page.locator('#menuSettings').click();
    }
    assert.equal(await restore.count(),1,`${name}: restore button should return`);
    if (html !== mobileOld) {
      assert.equal(await page.locator('#toggleHaptics').count(),modern ? 1 : 0,`${name}: haptics capability`);
      await page.evaluate(()=>{
        localStorage.setItem('neoSnakeHighscoresMobile',JSON.stringify([{name:'Existing',score:20}]));
        window.onCloudSaveLoaded({schemaVersion:1,mobileScores:[{name:'Incoming',score:30}],pcScores:[],achievements:[]});
      });
      const scores=await page.evaluate(()=>JSON.parse(localStorage.getItem('neoSnakeHighscoresMobile')));
      assert.deepEqual(scores.map(s=>s.name),['Incoming','Existing'],`${name}: local score merge`);
    }
    assert.deepEqual(errors,[],`${name}: JavaScript errors`);
    console.log(`${name}: restore button and bridge checks passed${html!==mobileOld ? '; score merge passed' : ''}.`);
  } finally { await context.close(); }
}

(async()=>{
  let browser;
  try {
    browser=await chromium.launch({headless:true,executablePath:chrome});
    await scenario(browser,'new HTML + old iOS shim',mobileNew,'ios',legacyIos,false);
    await scenario(browser,'new HTML + current iOS shim',mobileNew,'ios',currentIos,true);
    await scenario(browser,'old offline HTML + current iOS shim',mobileOld,'ios',currentIos,true);
    await scenario(browser,'new HTML + old Android capabilities',mobileNew,'android',null,false);
    await scenario(browser,'new HTML + current Android capabilities',mobileNew,'android',null,true);
    await scenario(browser,'old offline HTML + current Android capabilities',mobileOld,'android',null,true);
    await scenario(browser,'updated iOS fallback + current iOS shim',iosFallback,'ios',currentIos,true);
    await scenario(browser,'updated Android fallback + current Android capabilities',androidFallback,'android',null,true);
  } finally {
    if (browser) await browser.close();
    fs.unlinkSync(mobileOld);
    fs.rmdirSync(tempDir);
  }
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
