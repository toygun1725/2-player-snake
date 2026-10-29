'use strict';
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const assert = require('node:assert/strict');

(async () => {
  const executablePath = process.env.SNAKE_CHROME_PATH || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : undefined);
  const browser = await chromium.launch({ headless: true, executablePath });
  try {
    for (const [kind, sizes] of [['Mobile', [[320,568],[390,844],[768,1024]]], ['PC', [[800,600],[1280,800]]]]) {
      if (process.argv[2] && process.argv[2] !== kind) continue;
      for (const [width,height] of sizes) for (const lang of ['tr','en','de','ar','hi']) {
        if (process.argv[3] && process.argv[3] !== lang) continue;
        const context = await browser.newContext({ viewport: {width,height} });
        await context.route(/^https?:/, route => route.abort());
        await context.addInitScript(({kind,lang}) => localStorage.setItem(kind === 'Mobile' ? 'neoSnakeLangMobile' : 'neoSnakeLang', lang), {kind,lang});
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        const file = path.resolve(`Ana Dosya/${kind}/Beta/v3/2 Player Snake ${kind} v3.6.5.html`);
        await page.goto(pathToFileURL(file).href);
        await page.waitForSelector('#menuPlay', {timeout: 30000});
        await page.locator('#menuSettings').click();
        assert.equal(await page.locator('#menuInstagram').count(), 0, `${kind} settings Instagram`);
        await page.locator(kind === 'Mobile' ? '#menuDevelopers' : '#settingsDevelopers').click();
        assert.ok(await page.locator('.developers-section .btn-instagram').count(), `${kind} developer Instagram`);
        await page.locator('#developersBack').click();
        await page.locator('#settingsBack').click();
        await page.locator('#menuPlay').click();
        await page.locator('#btnPlayLocal').click();
        const prefix = kind === 'Mobile' ? 'qs' : 'pqs';
        await page.locator(`#${prefix}-1p`).click();
        await page.waitForTimeout(600); // Let the menu transition finish before measuring.
        const normal = await page.locator(`#${prefix}-start`).boundingBox();
        const beast = await page.locator(`#${prefix}-start-beast`).boundingBox();
        assert.ok(normal && beast, `${kind} ${lang} missing buttons`);
        assert.ok(Math.abs(normal.height-beast.height) < 1 && Math.abs(normal.width-beast.width) < 1, `${kind} ${width} ${lang} normal=${JSON.stringify(normal)} beast=${JSON.stringify(beast)}`);
        const fits = await page.locator(`#${prefix}-start-beast`).evaluate(el => el.scrollHeight <= el.clientHeight + 1 && el.scrollWidth <= el.clientWidth + 1);
        assert.ok(fits, `${kind} ${width} ${lang} beast text clipped`);
        await page.locator(`#${prefix}-2p`).click();
        assert.equal(await page.locator(`#${prefix}-start-beast`).isVisible(), false, `${kind} 2P beast button`);
        assert.deepEqual(errors, [], `${kind} ${lang} JS errors`);
        console.log(`PASS ${kind} ${width}x${height} ${lang}`);
        await context.close();
      }
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode=1; });
