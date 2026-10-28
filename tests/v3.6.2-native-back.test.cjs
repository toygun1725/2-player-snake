const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '../Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.6.2.html'), 'utf8');

function fixture(extra = {}) {
  const actions = [], elements = new Map();
  const c = vm.createContext({ window: {},
    document: {querySelector: selector => elements.get(selector) || null, getElementById: () => null},
    banner: {classList: {contains: () => false}}, MENU_IDS: {MAIN: 'main', SETTINGS: 'settings'},
    currentMenuScreen: null, menuHistory: [], settingsFromPause: false, pauseFromPlayer: 'p1',
    isOnlineMode: true, isDemoMode: false, onlineRoomId: 'r', myRole: 'p2', snakes: {p2: {}},
    inCountdown: false, intermission: false, paused: false, gameMode: '2P', currentSpeedMode: 'NORMAL', onlinePauseState: null,
    showPauseMenu: role => actions.push(`pause:${role}`), closePauseBubbles: () => actions.push('resume'),
    closeControlsModal: () => actions.push('close-controls'), goBack: () => actions.push('back'), hideBanner() {},
    AdManager: {finalizePendingLoss: () => actions.push('loss')}, ...extra });
  const start = html.indexOf('window.handleNativeBackPress = function()');
  const end = html.indexOf('async function requestOnlineRematchFromStats()', start);
  assert.ok(start > 0 && end > start);
  vm.runInContext(html.slice(start, end), c);
  return {c, actions, elements};
}

test('Android back pauses the online player without leaving the room', () => {
  const {c, actions} = fixture();
  assert.equal(c.window.handleNativeBackPress(), 'CONSUMED');
  assert.deepEqual(actions, ['pause:p2']);
});

test('Android back waits when the opponent paused the match', () => {
  const {c, actions} = fixture({banner: {classList: {contains: x => x === 'online-pause-banner'}}, onlinePauseState: {pausedBy: 'p1'}});
  assert.equal(c.window.handleNativeBackPress(), 'CONSUMED');
  assert.deepEqual(actions, []);
});

test('Android back dismisses a confirmation through its cancel button', () => {
  const {c, elements} = fixture();
  let cancel = 0;
  elements.set('.online-alert-overlay', {querySelector: selector => selector === '#onlineAlertCancel' ? {click() {cancel++;}} : null});
  assert.equal(c.window.handleNativeBackPress(), 'CONSUMED');
  assert.equal(cancel, 1);
});

test('Android back returns EXIT on the main menu', () => {
  const {c} = fixture({isOnlineMode: false, isDemoMode: true, currentMenuScreen: 'main'});
  assert.equal(c.window.handleNativeBackPress(), 'EXIT');
});
