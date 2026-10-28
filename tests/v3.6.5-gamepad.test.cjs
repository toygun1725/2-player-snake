const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function pad(index = 0) {
  return { index, id: `test-${index}`, connected: true, mapping: 'standard', axes: [0,0,0,0],
    buttons: Array.from({length:17}, () => ({pressed:false,value:0})) };
}
function harness(kind) {
  const source = fs.readFileSync(`Ana Dosya/${kind}/Beta/v3/2 Player Snake ${kind} v3.6.5.html`, 'utf8');
  const start = source.indexOf('// GAMEPAD_V365_BEGIN'), end = source.indexOf('function queueSnakeDirection(', start);
  assert.ok(start >= 0 && end > start);
  const code = source.slice(start,end) + '\nglobalThis.controller = gamepadController;';
  const calls = [], pads = [], nodes = {};
  const document = {hidden:false,activeElement:null,querySelector:()=>null,getElementById:id=>nodes[id]||null};
  const snake = () => ({dir:{x:1,y:0},segments:[{},{},{}],dashCooldown:0});
  const ctx = vm.createContext({navigator:{getGamepads:()=>pads},document,getComputedStyle:()=>({visibility:'visible'}),
    banner:{inert:true},AdManager:{adInProgress:false,finalizePendingLoss:()=>calls.push(['finalize'])},
    snakes:{p1:snake(),p2:snake()},dirMap:{up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}},
    isOnlineMode:false,gameMode:'1P',myRole:'p1',currentSpeedMode:'NORMAL',paused:false,inCountdown:false,
    intermission:false,isDemoMode:false,onlineRoomId:'room', socket:{emit:(event,payload)=>calls.push(['socket',event,JSON.parse(JSON.stringify(payload))])},
    queueSnakeDirection:(s,d)=>calls.push(['move',s===ctx.snakes.p1?'p1':'p2',d.x,d.y]),
    opposite:(a,b)=>a.x===-b.x&&a.y===-b.y,getAbsoluteDir:d=>d,
    showPauseMenu:role=>calls.push(['pause',role]),window:{handleNativeBackPress:()=>calls.push(['back'])},
    goBack:()=>calls.push(['back']),isBoostEnabled:()=>ctx.boostAvailable,
    boostAvailable:true,performance:{now:()=>100},SFX:{whoosh:()=>calls.push(['whoosh'])}});
  nodes.pauseBtn={click:()=>calls.push(['pause','pc'])};
  vm.runInContext(code,ctx);
  return {ctx,calls,pads,document,poll:()=>ctx.controller.poll(),nodes};
}
for (const kind of ['Mobile','PC']) {
  test(`${kind}: radial deadzone, direction edges and disconnect reset`,()=>{
    const h=harness(kind), p=pad();h.pads.push(p);
    p.axes[0]=0.3;p.axes[1]=0.3;h.poll();assert.equal(h.calls.length,0);
    p.axes[0]=0.5;p.axes[1]=0;h.poll();h.poll();assert.deepEqual(h.calls,[['move','p1',1,0]]);
    p.axes[0]=0;h.poll();p.axes[0]=0.5;h.poll();assert.equal(h.calls.length,2);
    h.pads.length=0;h.poll();h.pads.push(p);h.poll();assert.equal(h.calls.length,3);
  });
  test(`${kind}: split controller and two controllers route to the right player`,()=>{
    const h=harness(kind), a=pad(0);h.ctx.gameMode='2P';h.pads.push(a);
    a.axes[0]=-1;a.axes[3]=-1;h.poll();assert.deepEqual(h.calls,[['move','p1',-1,0],['move','p2',0,-1]]);
    h.calls.length=0;a.axes=[0,0,0,0];const b=pad(1);b.buttons[13].pressed=true;h.pads.push(b);h.poll();
    assert.deepEqual(h.calls,[['move','p2',0,1]]);
  });
  test(`${kind}: online input uses only the local role and does not require mobile speed selection`,()=>{
    const h=harness(kind), a=pad(0), b=pad(1);h.ctx.isOnlineMode=true;h.ctx.myRole='p2';
    h.ctx.currentSpeedMode = kind === 'Mobile' ? null : 'NORMAL';h.pads.push(a,b);
    a.axes[1]=-1;b.axes[1]=1;h.poll();
    assert.deepEqual(h.calls,[['socket','directionChange',{roomId:'room',direction:'up'}]]);
  });
  test(`${kind}: start pauses once and assigns the second local controller`,()=>{
    const h=harness(kind), a=pad(0),b=pad(1);h.ctx.gameMode='2P';h.pads.push(a,b);
    b.buttons[9].pressed=true;h.poll();h.poll();
    assert.deepEqual(h.calls,[[ 'pause',kind==='Mobile'?'p2':'pc' ]]);
  });
  test(`${kind}: gameplay face buttons do not change direction`,()=>{
    const h=harness(kind),a=pad();h.pads.push(a);a.buttons[0].pressed=true;a.buttons[1].pressed=true;h.poll();
    assert.deepEqual(h.calls,[]);
  });
  test(`${kind}: ads and countdown block gameplay controls`,()=>{
    const h=harness(kind),a=pad();h.pads.push(a);a.axes[1]=-1;a.buttons[9].pressed=true;
    h.ctx.AdManager.adInProgress=true;h.poll();assert.deepEqual(h.calls,[]);
    h.ctx.AdManager.adInProgress=false;h.ctx.inCountdown=true;h.poll();assert.deepEqual(h.calls,[]);
  });
}
test('PC: triggers boost the correct players and respect the boost setting',()=>{
  const h=harness('PC'),a=pad();h.ctx.gameMode='2P';h.pads.push(a);
  a.buttons[6].pressed=true;a.buttons[7].pressed=true;h.poll();
  assert.equal(h.ctx.snakes.p1.segments.length,2);assert.equal(h.ctx.snakes.p2.segments.length,2);
  h.poll();assert.equal(h.ctx.snakes.p1.segments.length,2);
  h.ctx.boostAvailable=false;const b=pad(1);h.pads.push(b);b.buttons[7].pressed=true;h.poll();
  assert.equal(h.ctx.snakes.p1.segments.length,2);assert.equal(h.ctx.snakes.p2.segments.length,2);
});
test('PC: online boost uses server action for local role only',()=>{
  const h=harness('PC'),a=pad(),b=pad(1);h.ctx.isOnlineMode=true;h.ctx.myRole='p2';h.pads.push(a,b);
  a.buttons[7].pressed=true;b.buttons[7].pressed=true;h.poll();
  assert.deepEqual(h.calls,[['socket','requestDash',{roomId:'room'}]]);
});
test('PC: start resumes an existing online pause through the resume control',()=>{
  const h=harness('PC'),a=pad();h.ctx.isOnlineMode=true;h.ctx.paused=true;h.pads.push(a);
  h.nodes.onlinePauseResumeBtn={click:()=>h.calls.push(['resume'])};
  a.buttons[9].pressed=true;h.poll();h.poll();assert.deepEqual(h.calls,[['resume']]);
});
for (const kind of ['Mobile','PC']) {
  test(`${kind}: menu focus, navigation, confirm and back use button edges`,()=>{
    const h=harness(kind),a=pad();h.pads.push(a);h.ctx.intermission=true;
    const makeButton = name=>({name,isConnected:true,classList:{add(){},remove(){}},matches:()=>false,
      focus(){h.document.activeElement=this;},scrollIntoView(){},getClientRects:()=>[{}],closest:()=>null,
      click(){h.calls.push(['click',name]);}});
    const one=makeButton('one'),two=makeButton('two');
    const root={firstElementChild:{},querySelectorAll:()=>[one,two],contains:x=>x===one||x===two,
      querySelector:()=>null,matches:()=>false};
    h.document.querySelector=()=>root;
    h.poll();assert.equal(h.document.activeElement,one);
    a.buttons[13].pressed=true;h.poll();h.poll();assert.equal(h.document.activeElement,two);
    a.buttons[0].pressed=true;h.poll();h.poll();assert.deepEqual(h.calls,[['click','two']]);
    a.buttons[0].pressed=false;a.buttons[1].pressed=true;h.poll();h.poll();
    assert.deepEqual(h.calls,[['click','two'],['back']]);
  });
  test(`${kind}: focus returns to the previous control when the menu closes`,()=>{
    const h=harness(kind),a=pad();h.pads.push(a);h.ctx.intermission=true;
    const previous={isConnected:true,focus(){h.document.activeElement=this;}};
    h.document.activeElement=previous;
    const item={isConnected:true,classList:{add(){},remove(){}},matches:()=>false,closest:()=>null,
      getClientRects:()=>[{}],focus(){h.document.activeElement=this;},scrollIntoView(){}};
    const root={firstElementChild:{},querySelectorAll:()=>[item],contains:x=>x===item};
    h.document.querySelector=()=>root;h.poll();assert.equal(h.document.activeElement,item);
    h.document.querySelector=()=>null;h.poll();assert.equal(h.document.activeElement,previous);
  });
}
