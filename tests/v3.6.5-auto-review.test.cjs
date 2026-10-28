const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html=fs.readFileSync('Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.6.5.html','utf8');
function between(start,end) {
  const a=html.indexOf(start),b=html.indexOf(end,a);assert.ok(a>=0&&b>a,start);return html.slice(a,b);
}
function fixture() {
  const messages=[], overlays=[];
  const c=vm.createContext({IS_IOS_SHELL:true,isDemoMode:false,window:{webkit:{messageHandlers:{iOS:{postMessage:m=>messages.push(JSON.parse(JSON.stringify(m)))}}}},
    document:{querySelector:()=>null,createElement:()=>({className:'',innerHTML:''}),body:{appendChild:el=>overlays.push(el)}},
    paused:false,intermission:false,gameMode:'1P',aiSnakeEnabled:false,gameStyle:'normal',isOnlineMode:false,
    myRole:'p1',playerColors:{p1:'#111',p2:'#222'},stats:{p1Food:10},games:{p1:1,p2:0},
    matchStartTime:1,matchTotalFoodP1:10,matchTotalFoodP2:0,longestSnakeP1:12,longestSnakeP2:5,
    getDisplayName:key=>key,escapeHtml:s=>s,t:key=>key,performance:{now:()=>120000},
    AchievementTracker:{state:{},unlock(){}},lastGameNewRecord:false,setGameTimeout(){}});
  vm.runInContext(between('let reviewNotifiedForMatch = false;','let last = 0, acc1 = 0, acc2 = 0;')+
    '\nglobalThis.resetReviewFlag=()=>{ reviewNotifiedForMatch=false; };\n'+between('function showGameEndStats(winner, options = {})','function finalizeCompetitiveResult(result)'),c);
  return {c,messages,overlays};
}
test('completed solo and competitive match result screens notify once per match',()=>{
  const f=fixture();f.c.showGameEndStats('p1');f.c.showGameEndStats('p1');
  assert.equal(f.messages.length,1);assert.deepEqual(f.messages[0],{action:'matchResult',payload:{isMatchFinal:true,isForfeit:false}});
  f.c.resetReviewFlag();f.c.gameMode='2P';f.c.showGameEndStats('p2');assert.equal(f.messages.length,2);
  assert.equal(f.overlays.length,3);
});
test('online forfeits, demo and non-iOS play never request a review',()=>{
  const f=fixture();f.c.gameMode='2P';f.c.isOnlineMode=true;
  f.c.showGameEndStats('p1',{wasOnline:true,isForfeit:true});assert.equal(f.messages.length,0);
  f.c.isDemoMode=true;f.c.showGameEndStats('p1',{wasOnline:true});assert.equal(f.messages.length,0);
  f.c.isDemoMode=false;f.c.IS_IOS_SHELL=false;f.c.showGameEndStats('p1');assert.equal(f.messages.length,0);
});
test('missing or failing bridge can retry on a later eligible result',()=>{
  const f=fixture();const handler=f.c.window.webkit.messageHandlers.iOS;
  delete f.c.window.webkit.messageHandlers.iOS;f.c.showGameEndStats('p1');assert.equal(f.messages.length,0);
  f.c.window.webkit.messageHandlers.iOS={postMessage(){throw Error('unavailable');}};f.c.showGameEndStats('p1');
  f.c.window.webkit.messageHandlers.iOS=handler;f.c.showGameEndStats('p1');assert.equal(f.messages.length,1);
});
test('native request is connected only to the final result screen, with per-match reset paths',()=>{
  assert.equal([...html.matchAll(/notifyNativeMatchResult\(/g)].length,2);
  assert.match(between("onCurrentSocket('gameInit'",'onCurrentSocket(\'gameStart\''),/onlineStatsMatchKey !== matchKey[\s\S]*reviewNotifiedForMatch = false/);
  assert.match(between('function softReset(','function showGameEndStats('),/if \(full\) \{\s*reviewNotifiedForMatch = false;/);
});
