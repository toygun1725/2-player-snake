const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const version = process.env.SNAKE_TEST_VERSION || '3.6.3';
const read = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const ckey = c => `${c.x},${c.y}`;
function randomMath() { let seed=13579; return Object.assign(Object.create(Math), {random() { seed=(seed*16807)%2147483647; return (seed-1)/2147483646; }}); }
function verifyBarriers(barriers) {
  const seen = new Set(), forbidden=new Set(['0,0','19,0','1,0','0,19','1,19','19,19','0,1','1,1','19,1','3,3','4,4','5,5']);
  for(const b of barriers) for(const cell of b.cells) {const key=ckey(cell);assert.ok(!forbidden.has(key),`blocked ${key}`);assert.ok(!seen.has(key),`duplicate ${key}`);seen.add(key)}
  assert.ok(barriers.length >= 10);
}
for(const platform of ['Mobile','PC']) {
  const source=read(`Ana Dosya/${platform}/Beta/v3/2 Player Snake ${platform} v${version}.html`);
  test(`${platform}: barriers avoid heads, wrapped safety cells, food, portal and each other`,()=>{
    const c=vm.createContext({Math:randomMath(),GRID_COLS:20,GRID_ROWS:20,barriers:[],foods:[{x:4,y:4}],portals:[{x:5,y:5}],snakes:{p1:{segments:[{x:0,y:0},{x:3,y:3}]},p2:null},TETROMINO_SHAPES:[[{x:0,y:0}]],rotateCells:a=>a,translateCells:(cs,x,y)=>cs.map(c=>({x:c.x+x,y:c.y+y})),handleBoundaries:c=>({x:(c.x+20)%20,y:(c.y+20)%20}),barriersVersion:0,markGridDirty:()=>{}});
    const a=source.indexOf('function spawnBarriers(desiredCount)'),b=source.indexOf(platform==='Mobile'?'function spawnPortals()':'let lastFoodP1',a);vm.runInContext(source.slice(a,b),c);c.spawnBarriers(30);verifyBarriers(c.barriers);
  });
  test(`${platform}: portal placement retries the first portal cell`,()=>{
    const cells=[{x:1,y:1},{x:1,y:1},{x:2,y:2}];const c=vm.createContext({teleportingOwner:null,portals:[],snakes:{p1:null,p2:null},foods:[],barriers:[],portalTimerMs:0,PORTAL_CYCLE_MS:15000,rngCell:()=>cells.shift()});
    const a=source.indexOf('function spawnPortals()'),b=source.indexOf('function isPortalCell(',a);vm.runInContext(source.slice(a,b),c);c.spawnPortals();assert.deepEqual(Array.from(c.portals,ckey),['1,1','2,2']);
  });
  test(`${platform}: unsuccessful portal relocation preserves the existing pair`,()=>{
    const original=[{x:4,y:4},{x:5,y:5}];const c=vm.createContext({teleportingOwner:null,portals:original,snakes:{p1:{segments:[{x:1,y:1}]},p2:null},foods:[],barriers:[],portalTimerMs:0,PORTAL_CYCLE_MS:15000,rngCell:()=>({x:1,y:1})});
    const a=source.indexOf('function spawnPortals()'),b=source.indexOf('function isPortalCell(',a);vm.runInContext(source.slice(a,b),c);c.spawnPortals();assert.equal(c.portals,original);assert.equal(c.portalTimerMs,15000);
  });
}
test('server: barriers avoid heads, wrapped safety cells, food, portal and each other',()=>{
  const source=read('Ana Dosya/Server/Mobile/server.js');const c=vm.createContext({Math:randomMath(),GRID_COLS:20,GRID_ROWS:20,TETROMINO_SHAPES:[[{x:0,y:0}]],rotateCells:a=>a,translateCells:(cs,x,y)=>cs.map(c=>({x:c.x+x,y:c.y+y})),markWorldDirty:()=>{}});
  const a=source.indexOf('function spawnBarriers(room, desiredCount)'),b=source.indexOf('function spawnPortals(',a);vm.runInContext(source.slice(a,b),c);const room={gridCols:20,gridRows:20,mode:'adventure',foods:[{x:4,y:4}],portals:[{x:5,y:5}],snakes:{p1:{segments:[{x:0,y:0},{x:3,y:3}]},p2:null}};c.spawnBarriers(room,30);verifyBarriers(room.barriers);
});
test('server: unsuccessful portal relocation preserves the existing pair',()=>{
  const source=read('Ana Dosya/Server/Mobile/server.js');const c=vm.createContext({findFreeCell:()=>null,markWorldDirty:()=>{throw Error('unchanged portals must not be marked dirty')}});const a=source.indexOf('function spawnPortals(room)'),b=source.indexOf('// Shrink opponent',a);vm.runInContext(source.slice(a,b),c);const original=[{x:1,y:1},{x:2,y:2}],room={portals:original};c.spawnPortals(room);assert.equal(room.portals,original);assert.equal(room.portalTimer,15000);
});
test('Mobile: food occupancy includes snakes, barriers, portals and other food',()=>{
  const source=read(`Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v${version}.html`);const c=vm.createContext({gameStyle:'adventure',snakes:{p1:{segments:[{x:1,y:1}]},p2:null},foods:[{x:2,y:2}],barriers:[{cells:[{x:3,y:3}]}],portals:[{x:4,y:4}]});const a=source.indexOf('function buildFoodOccupancy('),b=source.indexOf('function findFreeFoodCell(',a);vm.runInContext(source.slice(a,b),c);const occ=c.buildFoodOccupancy();for(const cell of ['1,1','2,2','3,3','4,4'])assert.ok(occ.has(cell));
});
test('Mobile: full selfArea51 half returns no cell and preserves green diamonds',()=>{
  const source=read(`Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v${version}.html`);const food={x:1,y:3,type:'green',selfArea51Half:'p2'};const c=vm.createContext({GRID_ROWS:20,GRID_COLS:20,NOTCH_SAFE_ROWS:2,foods:[food],snakes:{p1:null,p2:null},Math:randomMath(),performance:{now:()=>100},selfArea51GreenLastMove:0});
  let a=source.indexOf('function selfArea51HalfBounds('),b=source.indexOf('async function countdown(',a);vm.runInContext(source.slice(a,b),c);assert.equal(c.selfArea51HalfBounds('p2').yMin,2);c.rngCellForHalf=()=>({x:1,y:3});assert.equal(c.findFreeFoodCellForHalf(new Set(['1,3']),'p2'),null);
  a=source.indexOf('function buildOccupancyForHalf()');b=source.indexOf('function maybeSpawnGreenDiamonds(',a);vm.runInContext(source.slice(a,b),c);c.findFreeFoodCellForHalf=()=>null;c.relocateGreenDiamonds();assert.equal(food.x,1);assert.equal(food.y,3);assert.equal(c.foods.length,1);
});
test('Mobile: Ruby Burst prevents ordinary food from spawning',()=>{
  const source=read(`Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v${version}.html`);let called=false;const c=vm.createContext({redBulkEndTime:1,foods:[{rubyBurst:true}],gameStyle:'normal',spawnNormal:()=>{called=true}});const a=source.indexOf('function spawnFood()'),b=source.indexOf('function spawnNormal(',a);vm.runInContext(source.slice(a,b),c);c.spawnFood();assert.equal(called,false);
});
