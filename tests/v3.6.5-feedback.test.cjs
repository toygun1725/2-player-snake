const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const {catalog} = require('./fixtures/localization.cjs');

function between(source, start, end) {
  const a = source.indexOf(start), b = source.indexOf(end,a);
  assert.ok(a >= 0 && b > a, start);
  return source.slice(a,b);
}
for (const kind of ['Mobile','PC']) {
  const html = catalog(kind,'3.6.5').source;
  test(`${kind}: all languages have vibration and screen-shake labels`,()=>{
    const catalogData=catalog(kind,'3.6.5');
    for(const locale of catalogData.locales) {
      assert.ok(catalogData.effective[locale].haptics,locale);
      assert.ok(catalogData.effective[locale].screenShake,locale);
    }
  });
  test(`${kind}: disabling screen shake clears active motion and persists preference`,()=>{
    const values=new Map(), removed=[];
    const ctx=vm.createContext({window:{},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},
      document:{getElementById:()=>({classList:{remove:x=>removed.push(x)}})}});
    vm.runInContext(between(html,'const screenShake = {','let hitStopUntil = 0;') + '\nglobalThis.state=()=>screenShake.trauma;',ctx);
    ctx.addTrauma(0.5);assert.equal(ctx.state(),0.5);
    ctx.setScreenShakeEnabled(false);assert.equal(ctx.state(),0);assert.equal(values.get('neoSnakeScreenShake'),'0');
    assert.deepEqual(removed,['shake']);ctx.addTrauma(0.5);assert.equal(ctx.state(),0);
    ctx.setScreenShakeEnabled(true);ctx.addTrauma(0.25);assert.equal(ctx.state(),0.25);
  });
  test(`${kind}: sound bus connects once and falls back when compressor is unavailable`,()=>{
    const ctx=vm.createContext({});vm.runInContext(between(html,'function setupMasterAudio(ctx) {','function ensureAudio() {'),ctx);
    let gainCount=0, compressorCount=0;const destination={name:'destination'}, connected=[];
    const audio={destination,createGain(){gainCount++;return {gain:{value:0},connect:n=>connected.push(['gain',n])};},
      createDynamicsCompressor(){compressorCount++;return {threshold:{},knee:{},ratio:{},attack:{},release:{},connect:n=>connected.push(['compressor',n])};}};
    const first=ctx.setupMasterAudio(audio);assert.equal(ctx.setupMasterAudio(audio),first);
    assert.equal(gainCount,1);assert.equal(compressorCount,1);assert.equal(connected[1][1],destination);
    const fallback={destination,createGain(){throw Error('unsupported');}};
    assert.equal(ctx.setupMasterAudio(fallback),destination);
  });
  test(`${kind}: ad recovery creates a fresh sound bus for the new context`,()=>{
    const contexts=[];
    class FakeAudio {
      constructor(){this.state='running';this.destination={};this.compressorCount=0;contexts.push(this);}
      createGain(){return {gain:{value:0},connect(){}};}
      createDynamicsCompressor(){this.compressorCount++;return {threshold:{},knee:{},ratio:{},attack:{},release:{},connect(){}};}
      addEventListener(){} resume(){return Promise.resolve();} close(){this.state='closed';return Promise.resolve();}
      createBuffer(){return {};} createBufferSource(){return {connect(){},start(){}};}
    }
    const ctx=vm.createContext({window:{AudioContext:FakeAudio},document:{hidden:false},console,setTimeout(){}});
    const audioFunctions=between(html,'function primeAudioContext(ctx) {','// Global user gesture unlock');
    const rebuild=between(html,'function forceRebuildAudio() {','const userAudioGestureEvents');
    vm.runInContext('let audioCtx; let muted=false;\n'+audioFunctions+rebuild,ctx);
    ctx.ensureAudio();const old=contexts[0];assert.equal(old.compressorCount,1);assert.ok(old._snakeMasterOutput);
    ctx.forceRebuildAudio();assert.equal(contexts.length,2);assert.equal(old.state,'closed');
    assert.equal(contexts[1].compressorCount,1);assert.notEqual(contexts[1]._snakeMasterOutput,old._snakeMasterOutput);
  });
}
test('Mobile: browser vibration preference blocks vibration without disabling native preference',()=>{
  const html=catalog('Mobile','3.6.5').source, values=new Map([['neoSnakeHapticsEnabled','0']]), calls=[];
  const ctx=vm.createContext({window:{},navigator:{vibrate:v=>calls.push(v)},performance:{now:()=>1000},
    localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},document:{getElementById:()=>null},
    isAndroidApp:()=>!!ctx.window.Android});
  vm.runInContext(between(html,'let webHapticsEnabled =','/* v2.98.0 — Android tespiti'),ctx);
  ctx.hapticVibrate(50);ctx.hapticTyped('heavy');assert.deepEqual(calls,[]);
  ctx.window.Android={hapticEvent:(...args)=>calls.push(args)};
  ctx.hapticTyped('heavy');assert.deepEqual(calls,[['heavy',null]]);
  assert.equal(ctx.hapticsSettingAvailable(),false);
  ctx.window.Android.setHapticsEnabled=()=>{};assert.equal(ctx.hapticsSettingAvailable(),true);
});
test('iOS bridge forwards a boolean haptic setting and rejects non-booleans',()=>{
  const bridge=fs.readFileSync('Ana Dosya/iOS/TwoPlayerSnake/Bridge/ios_bridge_bootstrap.js','utf8');
  const messages=[];const ctx={console:{log(){},warn(){}},setTimeout(){},clearTimeout(){},addEventListener(){},
    document:{readyState:'loading',getElementById(){return null;},createElement(){return {};},head:{appendChild(){}},
      documentElement:{classList:{add(){}},setAttribute(){}},addEventListener(){}},
    webkit:{messageHandlers:{iOS:{postMessage:m=>messages.push(m)}}}};
  ctx.window=ctx;vm.createContext(ctx);vm.runInContext(bridge,ctx);
  ctx.Android.setHapticsEnabled(false);assert.equal(messages[0].action,'setHapticsEnabled');
  assert.deepEqual(JSON.parse(messages[0].payload),{enabled:false});
  ctx.Android.setHapticsEnabled('false');assert.equal(messages.length,1);
});
