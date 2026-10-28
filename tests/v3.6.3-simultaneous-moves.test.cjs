const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const read = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const server = read('Ana Dosya/Server/Mobile/server.js');
const version = process.env.SNAKE_TEST_VERSION || '3.6.3';
const snake = (x, y, dx, dy, length = 1) => ({segments: Array.from({length}, (_, i) => ({x: x - i * dx, y: y - i * dy})), dir: {x: dx, y: dy}, nextDir: {x: dx, y: dy}, grow: 0, acc: 0, score: 0, foodCount: 0, powerEnd: 0, slowEnd: 0, dashEndTime: 0});
const room = (p1, p2, mode = 'normal') => ({state:'playing', id:'test', mode, gridCols: 10, gridRows: 10, snakes:{p1,p2}, foods:[], barriers:[], portals:[], roundTimer:180, normalFoodsEaten:0, attemptedPortalEntry:{p1:false,p2:false}, portalTimer:15000});

function serverContext() {
  const c = vm.createContext({Date:{now:()=>1000}, GRID_COLS:10, GRID_ROWS:10, BASE_TPS:10, MOD_SPEED:{NORMAL:1}, isBoostAllowed:r=>!!r.boost, selfArea51WrapForOwner:(r,c)=>c, emitGameUpdate:(r,p)=>{r.lastPayload=p}, buildGameUpdatePayload:r=>({snakes:r.snakes}), endRound:(r,w)=>{r.winner=w;r.state='roundOver'}, markWorldDirty:()=>{}, maybeSpawnGreenDiamonds:()=>false});
  vm.runInContext(server.slice(server.indexOf('function resolveServerSimultaneousIntent('), server.indexOf('function roundSummary(')), c);
  return c;
}
for (const platform of ['Mobile', 'PC']) {
  const source=read(`Ana Dosya/${platform}/Beta/v3/2 Player Snake ${platform} v${version}.html`);
  const a=source.indexOf('function resolveSimultaneousIntent('), b=source.indexOf('function bodyAdvance(', a);
  const c=vm.createContext({gameStyle:'normal', portals:[], teleportingOwner:null, opposite:(a,b)=>a.x===-b.x&&a.y===-b.y, isPowered:s=>!!s.powered, isPortalCell:(x,y)=>c.portals.some(p=>p.x===x&&p.y===y), handleBoundaries:p=>c.solid&&(p.x<0||p.x>=10||p.y<0||p.y>=10)?null:{x:(p.x+10)%10,y:(p.y+10)%10}});
  vm.runInContext(source.slice(a,b),c);
  test(`${platform}: portal intentions resolve before either moves`,()=>{c.gameStyle='adventure'; c.portals=[{x:2,y:2},{x:7,y:2}]; assert.equal(c.resolveSimultaneousIntent(snake(1,2,1,0),snake(8,2,-1,0)),'draw'); c.teleportingOwner='p1'; assert.equal(c.resolveSimultaneousIntent(snake(1,2,1,0),snake(8,2,-1,0)),null); c.teleportingOwner=null;c.portals=[];c.gameStyle='normal'});
  test(`${platform}: head swaps respect length, wrap, walls and power`,()=>{const a=snake(0,3,-1,0,2),b=snake(9,3,1,0,1); assert.equal(c.resolveSimultaneousIntent(a,b),'p1'); c.solid=true; assert.equal(c.resolveSimultaneousIntent(a,b),null); c.solid=false; a.powered=true; assert.equal(c.resolveSimultaneousIntent(a,b),null);a.powered=false;c.gameStyle='selfArea51';assert.equal(c.resolveSimultaneousIntent(a,b),null);c.gameStyle='normal'});
  test(`${platform}: queued direction is used before the swap check`,()=>{const a=snake(2,2,0,1),b=snake(3,2,-1,0);a.inputQueue=[{x:1,y:0}];assert.equal(c.resolveSimultaneousIntent(a,b),'draw')});
  test(`${platform}: portal countdown and body interpolation follow actual movements`,()=>{
    const portalList=[{x:2,y:1},{x:8,y:8}];const body=vm.createContext({gameStyle:'adventure',isOnlineMode:false,myRole:null,portals:portalList,teleportingOwner:null,teleportStepsRemaining:0,attemptedPortalEntry:{p1:false,p2:false},portalTimerMs:0,PORTAL_CYCLE_MS:15000,GRID_COLS:20,GRID_ROWS:20,barrierHitThisStep:{p1:false,p2:false},_tickBarrierSet:new Set(),getBarrierCellsSet:()=>new Set(),opposite:(a,b)=>a.x===-b.x&&a.y===-b.y,handleBoundaries:p=>p,isPortalCell:(x,y)=>portalList.some(p=>p.x===x&&p.y===y),otherPortal:(x,y)=>portalList.find(p=>p.x!==x||p.y!==y),AchievementTracker:{state:{portalsUsedInMatch:0},unlock:()=>{}},recordGridTrail:()=>{},recordSoloLengthMilestone:()=>{}});
    const start=source.indexOf('function bodyAdvance('),end=source.indexOf('function collideCheckDetailed()',start);vm.runInContext(source.slice(start,end),body);const s=snake(1,1,1,0,3);assert.equal(body.bodyAdvance(s,'p1'),true);assert.equal(body.teleportStepsRemaining,2);assert.equal(s.prev[0].x,8);assert.equal(body.bodyAdvance(s,'p1'),true);assert.equal(body.teleportStepsRemaining,1);assert.equal(s.prev[1].x,8);
  });
}
test('server: simultaneous portal entry ends the round before ownership is assigned',()=>{const c=serverContext(),r=room(snake(1,2,1,0),snake(8,2,-1,0),'adventure');r.portals=[{x:2,y:2},{x:7,y:2}];c.gameTick60FPS(r,100);assert.equal(r.winner,'draw');assert.equal(r.teleportingOwner,undefined);assert.equal(r.snakes.p1.segments[0].x,1)});
test('server: a second catch-up step detects a head swap without skipping it',()=>{const c=serverContext(),r=room(snake(1,4,1,0),snake(4,4,-1,0));c.gameTick60FPS(r,250);assert.equal(r.winner,'draw');assert.equal(r.snakes.p1.moveSequence,1);assert.equal(r.snakes.p2.moveSequence,1)});
test('server: different lengths determine the head-swap result',()=>{const c=serverContext(),r=room(snake(1,2,1,0,3),snake(2,2,-1,0,1));c.gameTick60FPS(r,100);assert.equal(r.winner,'p1')});
test('server: movement payload records the actual power and slow interval',()=>{const c=serverContext(),r=room(snake(1,1,1,0),snake(7,7,-1,0));r.snakes.p1.powerEnd=2000;r.snakes.p2.slowEnd=2000;c.gameTick60FPS(r,160);assert.equal(r.snakes.p1.lastMoveIntervalMs,80);assert.equal(r.snakes.p2.lastMoveIntervalMs,100/0.65)});
test('server: dash applies only when enabled for the room',()=>{const c=serverContext();for(const boost of [false,true]){const r=room(snake(1,1,1,0),snake(7,7,-1,0),'fastCompetitive');r.boost=boost;r.snakes.p1.dashEndTime=2000;c.gameTick60FPS(r,110);assert.equal(r.snakes.p1.lastMoveIntervalMs,boost?100/1.45:100)}});
test('server: each mode and player role reports its own actual speed interval',()=>{
  const c=serverContext();
  for(const mode of ['normal','fastCompetitive','adventure','selfArea51']) for(const role of ['p1','p2']) for(const effect of ['normal','beast','slow']) {
    const r=room(snake(1,1,1,0),snake(7,7,-1,0),mode);const s=r.snakes[role];if(effect==='beast')s.powerEnd=2000;if(effect==='slow')s.slowEnd=2000;c.gameTick60FPS(r,160);
    const expected=100/(effect==='beast'?1.25:effect==='slow'?0.65:1);assert.equal(s.lastMoveIntervalMs,expected,`${mode} ${role} ${effect}`);
  }
});
test('server: a collision on the first catch-up move is not skipped by a later move',()=>{const c=serverContext(),r=room(snake(1,4,1,0),snake(2,5,0,1,2));r.snakes.p2.slowEnd=2000;r.snakes.p2.acc=-200;c.gameTick60FPS(r,250);assert.equal(r.winner,'p2');assert.equal(r.snakes.p1.moveSequence,1)});
test('server: portal owner countdown decreases only on its own moves',()=>{const c=serverContext(),r=room(snake(1,2,1,0,3),snake(5,7,1,0),'adventure');r.portals=[{x:2,y:2},{x:7,y:2}];r.snakes.p2.acc=-200;c.gameTick60FPS(r,100);assert.equal(r.teleportingOwner,'p1');assert.equal(r.teleportStepsRemaining,2);assert.equal(r.snakes.p1.positionDiscontinuitySequence,1);r.snakes.p1.acc=-200;r.snakes.p2.acc=0;c.gameTick60FPS(r,100);assert.equal(r.teleportStepsRemaining,2)});
