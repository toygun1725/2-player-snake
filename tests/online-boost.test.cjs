const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const serverSource = fs.readFileSync('Ana Dosya/Server/Mobile/server.js','utf8');
const pcSource = fs.readFileSync('Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.6.1.html','utf8').replace(/\r\n/g,'\n');
const pairs = [['pc','pc'],['pc','mobile'],['mobile','pc'],['mobile','mobile']];
function serverFixture() {
  const events = [], clock = {now:10000};
  let connection;
  const io = { on(name,callback) { if(name==='connection') connection=callback; }, to(id) { return {emit(name,data) { events.push({id,name,data}); }}; } };
  const app = {use(){},get(){}};
  const timer = () => ({unref(){}});
  const c = vm.createContext({
    require(name) {
      if(name==='express') return ()=>app;
      if(name==='http') return {createServer:()=>({listen(){}})};
      if(name==='socket.io') return {Server:class {constructor(){return io;}}};
      if(name==='cors') return ()=>()=>{};
      throw Error('Unexpected dependency: '+name);
    },
    Date:class extends Date {static now(){return clock.now;}}, Buffer,
    process:{env:{}},console:{log(){}},
    setInterval:timer,setTimeout:timer,clearInterval(){},clearTimeout(){}
  });
  vm.runInContext(serverSource+'\nglobalThis.testServer = {rooms,isBoostAllowed,initGameInRoom,gameTick60FPS};',c);
  const api = c.testServer;
  function socket(id) {
    const handlers = {};
    const client = {id,on(name,callback){handlers[name]=callback;},emit(name,data){events.push({id,name,data});},join(){},leave(){}};
    connection(client);
    return {id,send(name,data){assert.ok(handlers[name],name);handlers[name](data);}};
  }
  function match(platforms, random=false, mode='fastCompetitive') {
    const a=socket('p1'),b=socket('p2');
    if(random) {
      a.send('joinMatchmaking',{platform:platforms[0],name:'One',requestedRows:42});
      b.send('joinMatchmaking',{platform:platforms[1],name:'Two',requestedRows:36});
    } else {
      a.send('createRoom',{platform:platforms[0],name:'One',mode,requestedRows:42});
      const id=events.find(e=>e.name==='roomCreated').data.roomId;
      b.send('joinRoom',{platform:platforms[1],name:'Two',roomId:id,requestedRows:36});
    }
    const room=Object.values(api.rooms)[0];
    return {a,b,room,init:events.filter(e=>e.name==='gameInit').at(-1).data};
  }
  return {api,clock,events,socket,match};
}

test('server enables boost only for fully identified PC-PC Fast Competitive rooms',()=>{
  const f=serverFixture();
  for(const mode of ['normal','fastCompetitive','adventure','selfArea51']) for(const [a,b] of pairs) {
    const room={mode,platform:a===b?a:'crossplay',p1:{platform:a},p2:{platform:b}};
    assert.equal(f.api.isBoostAllowed(room),mode==='fastCompetitive'&&a==='pc'&&b==='pc');
  }
  for(const room of [null,{}, {mode:'fastCompetitive',platform:'pc',p1:{platform:'pc'}},
    {mode:'fastCompetitive',platform:'pc',p1:{platform:'pc'},p2:{}},
    {mode:'fastCompetitive',platform:'crossplay',p1:{platform:'pc'},p2:{platform:'pc'}}]) assert.equal(f.api.isBoostAllowed(room),false);
});

for(const random of [false,true]) for(const platforms of pairs) {
  test(`${random?'random matchmaking':'custom room'}: ${platforms.join('-')} shares boost permission and enforces both players' requests`,()=>{
    const f=serverFixture(),{a,b,room,init}=f.match(platforms,random);
    const allowed=platforms.every(p=>p==='pc');
    assert.equal(init.boostEnabled,allowed);
    room.state='playing';
    const before=JSON.stringify(room.snakes);
    a.send('requestDash',{roomId:room.id,boostEnabled:true});
    b.send('requestDash',{roomId:room.id,boostEnabled:true});
    if(allowed) {
      for(const role of ['p1','p2']) {
        assert.equal(room.snakes[role].segments.length,5);
        assert.equal(room.snakes[role].dashEndTime,f.clock.now+250);
        assert.equal(room.snakes[role].dashCooldown,f.clock.now+3000);
      }
      assert.equal(f.events.filter(e=>e.name==='soundEffect'&&e.data.effect==='whoosh').length,2);
    } else {
      assert.equal(JSON.stringify(room.snakes),before);
      assert.equal(f.events.filter(e=>e.name==='soundEffect').length,0);
    }
  });
}

test('normal PC-PC rooms reject dash and an unclaimed platform defaults to mobile',()=>{
  const f=serverFixture(),{a,room,init}=f.match(['pc','pc'],false,'normal');
  assert.equal(init.boostEnabled,false);room.state='playing';
  const before=JSON.stringify(room.snakes);a.send('requestDash',{roomId:room.id});
  assert.equal(JSON.stringify(room.snakes),before);
  const missing=serverFixture(),r=missing.match(['pc',undefined]);
  assert.equal(r.init.boostEnabled,false);
});

test('PC-PC boost retains cooldown, one-cell cost, length guard and room membership checks',()=>{
  const f=serverFixture(),{a,room}=f.match(['pc','pc']);room.state='playing';
  const outsider=f.socket('outsider');
  const before=JSON.stringify(room.snakes);outsider.send('requestDash',{roomId:room.id});
  assert.equal(JSON.stringify(room.snakes),before);
  a.send('requestDash',{roomId:room.id});assert.equal(room.snakes.p1.segments.length,5);
  a.send('requestDash',{roomId:room.id});assert.equal(room.snakes.p1.segments.length,5);
  f.clock.now+=3000;a.send('requestDash',{roomId:room.id});assert.equal(room.snakes.p1.segments.length,4);
  f.clock.now+=3000;room.snakes.p1.segments.length=1;
  a.send('requestDash',{roomId:room.id});assert.equal(room.snakes.p1.segments.length,1);
});

test('server simulation ignores stale dash on mobile/cross-play while retaining PC dash and Beast speed',()=>{
  for(const platforms of pairs) for(const power of [false,true]) {
    const f=serverFixture(),{room}=f.match(platforms);room.state='playing';room.foods=[];
    const snake=room.snakes.p1,head={...snake.segments[0]};
    snake.dashEndTime=f.clock.now+250;
    snake.powerEnd=power?f.clock.now+1000:0;
    f.api.gameTick60FPS(room,power?80:70);
    const shouldMove=power||platforms.every(p=>p==='pc');
    assert.equal(snake.segments[0].x!==head.x,shouldMove,platforms.join('-')+' beast='+power);
  }
});

test('permission and cooldown reset correctly on new rounds and actual rematch-ready handlers',()=>{
  for(const platforms of pairs) {
    const f=serverFixture(),{a,b,room}=f.match(platforms);
    const allowed=platforms.every(p=>p==='pc');
    room.snakes.p1.dashCooldown=999999;
    f.api.initGameInRoom(room);
    assert.equal(f.events.filter(e=>e.name==='gameInit').at(-1).data.boostEnabled,allowed);
    assert.equal(room.snakes.p1.dashCooldown,0);
    room.state='postGame';
    a.send('rematchReady',{roomId:room.id});b.send('rematchReady',{roomId:room.id});
    assert.equal(f.events.filter(e=>e.name==='gameInit').at(-1).data.boostEnabled,allowed);
    assert.equal(room.state,'countdown');assert.equal(room.snakes.p1.dashEndTime,0);
  }
});

function clientFunction(name) {
  const start=pcSource.indexOf('      function '+name+'(');assert.ok(start>=0,name);
  const end=pcSource.indexOf('\n      }',start);return pcSource.slice(start,end+8);
}
function clientFixture(extra={}) {
  const calls=[];
  const snake=()=>({segments:[{x:4,y:4},{x:5,y:4},{x:6,y:4}],dir:{x:-1,y:0},dashCooldown:0});
  let keydown;
  const c=vm.createContext({gameStyle:'fastCompetitive',isOnlineMode:true,onlineBoostEnabled:false,boostEnabled:true,
    inCountdown:false,intermission:false,paused:false,currentSpeedMode:'FAST',gameMode:'2P',
    snakes:{p1:snake(),p2:snake()},myRole:'p1',onlineRoomId:'room',
    socket:{emit(name,data){calls.push({name,data});}},
    document:{activeElement:{tagName:'DIV'},querySelector(){return null;}},
    AdManager:{adInProgress:false},ensureAudio(){},performance:{now:()=>10000},
    SFX:{whoosh(){calls.push({name:'localWhoosh'});}},
    addEventListener(name,callback){if(name==='keydown')keydown=callback;},...extra});
  vm.runInContext(['isBoostEnabled','shouldShowBoostControls','updateControlHints'].map(clientFunction).join('\n'),c);
  const start=pcSource.indexOf("      addEventListener('keydown', async e => {");
  const close='      }, { passive: false });';
  const end=pcSource.indexOf(close,start)+close.length;assert.ok(start>=0&&end>start);
  vm.runInContext(pcSource.slice(start,end),c);
  return {c,calls,press(code='ShiftLeft'){return keydown({key:'Shift',code,preventDefault(){}});}};
}

test('PC effective boost follows online permission independently of the saved local preference',()=>{
  const f=clientFixture();
  for(const online of [true,false]) for(const permission of [true,false]) for(const local of [true,false]) for(const mode of ['normal','fastCompetitive']) {
    Object.assign(f.c,{isOnlineMode:online,onlineBoostEnabled:permission,boostEnabled:local,gameStyle:mode});
    const expected=mode==='fastCompetitive'&&(online?permission:local);
    assert.equal(f.c.isBoostEnabled(),expected);assert.equal(f.c.shouldShowBoostControls(),expected);
  }
});

test('PC boost keyboard hints and control cards follow effective permission',()=>{
  const state={};
  const ui={};
  for(const key of ['p1BoostControls','p2BoostControls','p1ControlsCard','p2ControlsCard']) ui[key]={classList:{toggle(name,value){state[key+name]=value;}}};
  const f=clientFixture({UI:ui});
  f.c.updateControlHints();assert.equal(state.p1BoostControlshidden,true);assert.equal(state.p2BoostControlshidden,true);
  f.c.onlineBoostEnabled=true;f.c.updateControlHints();assert.equal(state.p1BoostControlshidden,false);assert.equal(state.p2BoostControlshidden,false);
});

test('actual PC Shift handler emits dash only with online permission for either role and Shift key',async()=>{
  for(const permission of [false,true]) for(const role of ['p1','p2']) for(const code of ['ShiftLeft','ShiftRight']) {
    const f=clientFixture({onlineBoostEnabled:permission,myRole:role,boostEnabled:!permission});
    const before=JSON.stringify(f.c.snakes);await f.press(code);
    assert.equal(f.calls.filter(e=>e.name==='requestDash').length,permission?1:0);
    assert.equal(JSON.stringify(f.c.snakes),before);
  }
});

test('actual offline Shift handler keeps the local boost option, cost and cooldown',async()=>{
  for(const enabled of [false,true]) {
    const f=clientFixture({isOnlineMode:false,boostEnabled:enabled,onlineBoostEnabled:!enabled});
    await f.press();assert.equal(f.c.snakes.p1.segments.length,enabled?2:3);
    if(enabled) assert.equal(f.c.snakes.p1.dashCooldown,13000);
    assert.equal(f.calls.filter(e=>e.name==='requestDash').length,0);
  }
});

test('online cleanup clears server permission and preserves the local boost preference',()=>{
  for(const enabled of [false,true]) {
    const f=clientFixture({boostEnabled:enabled,onlineBoostEnabled:true,
      invalidateGameFlow(){},winAnim:{},deathAnim:{},stopConfetti(){},
      connectionTimeoutTimer:null,onlineTimerInterval:null,matchmakingTimer:null,clearOnlineRematchWait(){},
      resize(){},hideBanner(){},closeOnlinePauseMenu(){},socket:null,updatePlayerColors(){},COLOR_PALETTE:[{hex:'#fff'},{hex:'#000'}],
      document:{getElementById(){return null;},querySelector(){return null;}}});
    vm.runInContext(clientFunction('cleanupOnlineGame'),f.c);f.c.cleanupOnlineGame();
    assert.equal(f.c.onlineBoostEnabled,false);assert.equal(f.c.boostEnabled,enabled);assert.equal(f.c.isOnlineMode,false);
  }
});
