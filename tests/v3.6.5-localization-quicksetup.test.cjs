const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { catalog } = require('./fixtures/localization.cjs');

function slice(source, start, end) {
  const a = source.indexOf(start), b = source.indexOf(end, a);
  assert.ok(a >= 0 && b > a, `${start} / ${end}`);
  return source.slice(a, b);
}
function splash(kind, saved, languages = ['en-US']) {
  const source = catalog(kind, '3.6.5').source;
  const langInit = kind === 'Mobile'
    ? slice(source, "const LANG_STORAGE_KEY =", 'const ONLINE_PAUSE_LIMIT =')
    : slice(source, 'const SUPPORTED_LANGS =', 'const ONLINE_PAUSE_LIMIT =');
  const splashCode = slice(source, 'const _splashLoadingTexts =', '// Loading bar progress controller');
  const storage = new Map(saved ? [[kind === 'Mobile' ? 'neoSnakeLangMobile' : 'neoSnakeLang', saved]] : []);
  const element = { textContent: '' };
  const context = vm.createContext({ navigator: { languages, language: languages[0] },
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
    document: { getElementById: () => element } });
  vm.runInContext(langInit + splashCode, context);
  return element.textContent;
}

for (const kind of ['Mobile', 'PC']) {
  test(`${kind}: v3.6.5 inline scripts parse`, () => {
    const source = catalog(kind, '3.6.5').source;
    const scripts = [...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script\s*>/gi)];
    assert.ok(scripts.length >= 2);
    for (const script of scripts) new vm.Script(script[1]);
  });
  test(`${kind}: splash follows every saved game language and language aliases`, () => {
    const locales = Object.keys(catalog(kind, '3.6.5').strings);
    assert.equal(locales.length, 21);
    for (const locale of locales) {
      const result = splash(kind, locale);
      assert.ok(result && (locale === 'en' || result !== 'Loading...'), `${locale} fell back to English`);
    }
    assert.equal(splash(kind, null, ['fil-PH']), 'Naglo-load...');
    assert.equal(splash(kind, null, ['pt-BR']), 'Carregando...');
    assert.equal(splash(kind, null, ['zz-ZZ']), 'Loading...');
  });
}

test('targeted mobile and PC translations use the intended languages and keys', () => {
  const mobile = catalog('Mobile', '3.6.5').strings;
  assert.equal(mobile.hi.rateUs, 'हमें रेट करें!');
  assert.equal(mobile.ar.rateUs, 'قيّمنا!');
  assert.equal(mobile.el.restorePurchases, 'Επαναφορά αγορών');
  assert.equal(mobile.el.removeAds, 'Αφαίρεση διαφημίσεων');
  assert.equal(mobile.el.continueForFree, 'Συνέχεια δωρεάν');
  const pc = catalog('PC', '3.6.5').strings;
  assert.equal(pc.it.developers, 'Sviluppatori');
  assert.equal(pc.es.playerMode, 'Modo de Jugador');
  for (const locale of ['zh', 'hi']) {
    for (const key of ['wallMode', 'easy', 'fastCompetitiveMode', 'adventureMode']) {
      assert.ok(pc[locale][key], `${locale}: ${key}`);
    }
  }
});

function quickSetup(kind, color, name) {
  const source = fs.readFileSync(`Ana Dosya/${kind}/Beta/v3/2 Player Snake ${kind} v3.6.5.html`, 'utf8');
  const code = kind === 'Mobile'
    ? slice(source, 'function openQuickSetupMenu()', '// ===== End Quick Setup =====')
    : slice(source, 'function openPCQuickSetupMenu()', '// Legacy aliases for full backward compatibility');
  const nodes = new Map();
  let lastHtml = '';
  const decode = s => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  function addNodes(html) {
    for (const match of html.matchAll(/<(?:input|button|div)\b[^>]*\bid="([^"]+)"[^>]*>/g)) {
      const tag = match[0], id = match[1], value = tag.match(/\bvalue="([^"]*)"/);
      const n = { id, value: value ? decode(value[1]) : '', style: {}, classList: {toggle(){}, add(){}, remove(){}},
        querySelectorAll: () => [], scrollIntoView() {} };
      Object.defineProperty(n, 'innerHTML', { set(html) { n.html = html; addNodes(html); }, get() { return n.html || ''; } });
      nodes.set(id, n);
    }
  }
  const palette = [{name:'Pink',hex:'#ff4fbf'}, {name:'Turquoise',hex:'#35e6e6'}, {name:'Lime',hex:'#AEEA00'}];
  const ctx = vm.createContext({ COLOR_PALETTE: palette, playerColors: {p1:color,p2:color}, playerNames:{p1:name,p2:'Second'},
    MOD_WALLS:{NONE:'NONE',SOLID:'SOLID'}, MENU_IDS:{QUICK_SETUP:'quick',MAIN:'main'}, paused:false, intermission:false,
    currentOpenMenu:null, boostEnabled:true, window:{adsRemoved:false}, SFX:{menuClick(){}},
    document:{getElementById:id=>nodes.get(id)||null,querySelectorAll:()=>[]},
    showBanner(html){lastHtml=html;nodes.clear();addNodes(html);}, buildMenuBackButton:id=>`<button id="${id}"></button>`,
    markMenuScreen(){},updateUIVisibility(){},showGameplayHud(){}, t:key=>key,
    escapeHtml:value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
    updatePlayerColors(){},markGridDirty(){},updateControlHints(){},AdManager:{adInProgress:true},
    requestAnimationFrame(){}, setTimeout(){} });
  vm.runInContext(code, ctx);
  ctx[kind === 'Mobile' ? 'openQuickSetupMenu' : 'openPCQuickSetupMenu']();
  return {ctx,nodes,html:()=>lastHtml,click(id){assert.ok(nodes.get(id)?.onclick, id);nodes.get(id).onclick();}};
}

for (const kind of ['Mobile', 'PC']) {
  for (const color of ['#35e6e6', '#AEEA00']) {
    test(`${kind}: quick setup keeps player colors distinct for ${color}`, () => {
      const q = quickSetup(kind, color, 'A"<B&');
      assert.ok(q.html().includes('A&quot;&lt;B&amp;'));
      q.click(kind === 'Mobile' ? 'qs-2p' : 'pqs-2p');
      q.click(kind === 'Mobile' ? 'qs-start' : 'pqs-start');
      assert.notEqual(q.ctx.playerColors.p1, q.ctx.playerColors.p2);
      assert.equal(q.ctx.playerNames.p1, 'A"<B&');
      if (kind === 'Mobile') assert.notEqual(q.ctx.playerColors.p1, '#AEEA00');
    });
  }
}

test('PC: selecting AI after EXTREME selects FAST instead of retaining a hidden option', () => {
  const q = quickSetup('PC', '#ff4fbf', 'Ada');
  q.click('pqs-2p');
  q.click('pqs-sp-ext');
  q.click('pqs-1p');
  assert.match(q.nodes.get('pqs-sec-speed').innerHTML, /pc-qs-opt-btn active" id="pqs-sp-fast"/);
  q.click('pqs-start');
  assert.equal(q.ctx.currentSpeedMode, 'FAST');
});

test('Mobile: turn-button ripples reuse four nodes while preserving touch position and player color', () => {
  const source = catalog('Mobile', '3.6.5').source;
  const code = slice(source, "document.querySelectorAll('.turn-btn').forEach(btn => {", '/* === v3.3.9: D-Pad');
  const children = [], listeners = {};
  const button = {dataset:{player:'p1',dir:'left'},style:{},
    getBoundingClientRect:()=>({left:10,top:20,width:100,height:80}),
    getAttribute:()=> 'p1', appendChild:node=>children.push(node),
    addEventListener:(name,callback)=>{listeners[name]=callback;} };
  const context = vm.createContext({document:{querySelectorAll:()=>[button],createElement:()=>({style:{}})},
    hapticVibrate(){},ensureAudio(){},isOnlineMode:false,snakes:null});
  vm.runInContext(code, context);
  for(let i=0;i<4;i++) listeners.pointerdown({preventDefault(){},clientX:30,clientY:50});
  assert.equal(children.length,4);
  assert.equal(children[0].style.left,'-30px');
  assert.equal(children[0].style.top,'-20px');
  assert.match(children[0].style.background,/var\(--p1\)/);
  const previous = children[0].style.animationName;
  listeners.pointerdown({preventDefault(){},clientX:40,clientY:60});
  assert.equal(children.length,4);
  assert.notEqual(children[0].style.animationName,previous);
  assert.equal(children[0].style.left,'-20px');
  for(let i=0;i<20;i++) listeners.pointerdown({preventDefault(){},clientX:40,clientY:60});
  assert.equal(children.length,4);
});
