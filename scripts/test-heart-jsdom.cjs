const fs = require('fs');

const content = fs.readFileSync('Ana Dosya/CrazyGames/index.html', 'utf8');

// Let's create an environment with JSDOM / mocked DOM and run step()
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const dom = new JSDOM(content, {
  runScripts: "dangerously",
  resources: "usable",
  url: "https://localhost/"
});

const window = dom.window;
const document = window.document;

console.log('DOM loaded');
setTimeout(() => {
  try {
    // Start 1P vs AI Fast Competitive
    console.log('Starting game...');
    window.gameMode = '1P';
    window.gameStyle = 'fastCompetitive';
    window.aiSnakeEnabled = true;
    window.currentSpeedMode = 'NORMAL';
    window.currentWallMode = 'NONE';
    
    // Spawn snakes and foods
    window.softReset(true, 0).then(() => {
      console.log('softReset completed. Snakes:', !!window.snakes);
      
      // Force spawn a heart food right in front of P1
      const p1 = window.snakes.p1;
      const head = p1.segments[0];
      const heartFood = { x: head.x + p1.dir.x, y: head.y + p1.dir.y, type: 'heart', spawnAt: Date.now() };
      window.foods.push(heartFood);
      console.log('Spawned heart food at', heartFood);
      
      // Run step multiple times
      for (let f = 0; f < 60; f++) {
        window.step(Date.now());
      }
      console.log('60 frames executed successfully! P1 powerEnd:', p1.powerEnd, 'Foods count:', window.foods.length);
    }).catch(err => {
      console.error('softReset error:', err);
    });
  } catch (err) {
    console.error('Test error:', err);
  }
}, 500);
