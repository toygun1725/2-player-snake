const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { catalog, dictionary } = require('./fixtures/localization.cjs');

function functionSource(source, name) {
  const match = source.match(new RegExp('^( +)function ' + name + '\\(', 'm'));
  assert.ok(match, name);
  const end = source.indexOf('\n' + match[1] + '}', match.index);
  return source.slice(match.index, end + match[1].length + 2);
}
const parameters = text => [...String(text).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();

for (const kind of ['Mobile', 'PC']) {
  const c = catalog(kind);
  const onlineKeys = Object.keys(dictionary(c.source, 'ONLINE_STRINGS').en);
  const required = new Set([...onlineKeys, ...Object.keys(dictionary(c.source, 'ONLINE_ERROR_STRINGS').en || {}),
    ...Object.keys(dictionary(c.source, 'CONTROLS_STRINGS').en || {}),
    ...['winP1', 'winP2', 'winAI', 'p1', 'p2', 'dark', 'light', 'yes', 'onlineOk'].filter(key => c.effective.en[key]),
    ...[...c.source.matchAll(/\bt\(['"]([^'"]+)['"](?:,|\))/g)].map(m => m[1])]);
  const server = fs.readFileSync('Ana Dosya/Server/Mobile/server.js', 'utf8');
  const serverMessages = [...server.matchAll(/emit\('errorMsg', \{ message: '([^']+)'/g)].map(m => m[1]);
  const count = Number(c.source.match(/const ONLINE_PAUSE_LIMIT = (\d+);/)[1]);
  const seconds = Number(c.source.match(/const ONLINE_PAUSE_SECONDS = (\d+);/)[1]);

  test(`${kind}: pause copy uses current server limits`, () => {
    assert.equal(count, Number(server.match(/room\.pauseUsed\[role\] >= (\d+)/)[1]));
    assert.equal(seconds, Number(server.slice(server.indexOf("socket.on('requestPause'")).match(/room\.pauseTimeLeft = (\d+);/)[1]));
    assert.equal(c.locales.length, 21);
  });

  for (const locale of c.locales) {
    test(`${kind} ${locale}: no fallback, complete templates, localized pause and server errors`, () => {
      for (const key of required) assert.ok(c.effective[locale][key]?.trim(), `${locale} missing ${key}`);
      for (const key of onlineKeys) assert.deepEqual(parameters(c.effective[locale][key]), parameters(c.effective.en[key]), `${locale} ${key}`);

      let html = '';
      const elements = new Map();
      const element = id => {
        if (!elements.has(id)) elements.set(id, { id, style: {}, classList: { add() {}, remove() {} },
          appendChild(el) { html = el.innerHTML; }, remove() {} });
        return elements.get(id);
      };
      const context = vm.createContext({ lang: locale, STRINGS: c.strings, EXTRA_STRINGS: c.extra,
        ONLINE_PAUSE_LIMIT: count, ONLINE_PAUSE_SECONDS: seconds,
        isOnlineMode: true, myRole: 'p1', gameFlowRevision: 1, onlinePauseState: null,
        document: { documentElement: { lang: locale === 'ptbr' ? 'pt-BR' : locale },
          getElementById: element, createElement: () => ({}) },
        showBanner(value) { html = value; }, closeOnlinePauseMenu() {},
        requestAnimationFrame() {}, SFX: { menuClick() {} } });
      vm.runInContext(functionSource(c.source, 't'), context);
      vm.runInContext(functionSource(c.source, 'showOnlinePauseMenu'), context);
      vm.runInContext(functionSource(c.source, 'translateOnlineServerMessage'), context);

      for (const pausedBy of ['p1', 'p2']) {
        context.showOnlinePauseMenu(pausedBy, 7);
        const key = kind === 'Mobile' ? (pausedBy === 'p1' ? 'onlinePauseRuleMe' : 'onlinePauseRuleOpponent') : 'onlinePauseRule';
        assert.ok(html.includes(context.t(key, { count, seconds })), `${locale} pause text not rendered`);
        assert.ok(!/\{(?:count|seconds)\}/.test(html));
        if (locale !== 'en') assert.ok(!html.includes('You can pause'));
        assert.ok(!html.includes('90 seconds'));
      }
      for (const message of serverMessages) {
        const translated = context.translateOnlineServerMessage(message);
        assert.ok(translated && !/^online[A-Z]/.test(translated));
        assert.notEqual(translated, context.t('onlineUnknownError'), `unmapped server error: ${message}`);
        if (locale !== 'tr') assert.notEqual(translated, message);
      }
      assert.equal(context.translateOnlineServerMessage('<b>Unexpected server detail</b>'), context.t('onlineUnknownError'));
      assert.equal(context.t('onlineOpponentDisconnectedText', { seconds: 4 }), c.effective[locale].onlineOpponentDisconnectedText.replace('{seconds}', '4'));
      assert.ok(!context.t('onlinePauseRuleMe', { count, seconds }).includes('{'));
    });
  }

  test(`${kind}: alerts acknowledge without suggesting a game resume`, () => {
    const source = functionSource(c.source, 'showOnlineDialog');
    assert.ok(source.includes("'onlineOk'"));
    assert.ok(!source.includes("t('onlineResume')"));
    assert.ok(functionSource(c.source, 'reconnectOnlineGame').includes("t('onlineReconnectText')"));
  });
}

test('Mobile: disconnect countdown stays in the selected language', () => {
  const c = catalog('Mobile');
  const start = c.source.indexOf("onCurrentSocket('playerDisconnected',");
  const event = c.source.slice(start, c.source.indexOf("onCurrentSocket('playerReconnected',", start));
  for (const lang of c.locales) {
    let handler, tick, html;
    const paragraph = { innerHTML: '' };
    const context = vm.createContext({ lang, STRINGS: c.strings, EXTRA_STRINGS: c.extra,
      dismissOnlineControls() {}, onlinePauseState: null, paused: false,
      onCurrentSocket(name, callback) { handler = callback; }, showBanner(value) { html = value; },
      setGameInterval(callback) { tick = callback; return 1; }, document: { querySelector: () => paragraph } });
    vm.runInContext(functionSource(c.source, 't') + '\n' + event, context);
    handler({ gracePeriod: 10 }); tick();
    assert.ok(html.includes(context.t('onlineOpponentDisconnectedText', { seconds: 10 })));
    assert.equal(paragraph.innerHTML, context.t('onlineOpponentDisconnectedText', { seconds: 9 }));
  }
});

test('Mobile: control and D-pad accessibility labels follow the selected language', () => {
  const c = catalog('Mobile');
  for (const lang of c.locales) {
    const elements = new Map();
    const create = () => ({ setAttribute(key, value) { this[key] = value; } });
    const directions = ['left', 'right', 'up', 'down'].map(dir => ({ ...create(), dataset: { dir } }));
    const context = vm.createContext({ lang, STRINGS: c.strings, EXTRA_STRINGS: c.extra,
      document: { getElementById(id) { if (!elements.has(id)) elements.set(id, create()); return elements.get(id); },
        querySelectorAll() { return directions; } } });
    vm.runInContext(functionSource(c.source, 't') + '\n' + functionSource(c.source, 'updateControlsModalTexts'), context);
    context.updateControlsModalTexts();
    assert.equal(elements.get('closeControlsModalBtn')['aria-label'], c.effective[lang].ctrlClose);
    assert.equal(elements.get('ctrlTurnLeftIcon')['aria-label'], c.effective[lang].ctrlTurnLeft);
    assert.equal(elements.get('soundBtnP1')['aria-label'], c.effective[lang].ctrlSound);
    directions.forEach(button => assert.equal(button['aria-label'], c.effective[lang]['ctrl' + button.dataset.dir[0].toUpperCase() + button.dataset.dir.slice(1)]));
  }
});
