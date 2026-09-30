const fs = require('fs');

function runTest(fileLabel, filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`=== Testing ${fileLabel} ===`);

  // Extract functions
  const evalEnv = `
    const MOD_WALLS = { NONE: 'NONE', SOLID: 'SOLID' };
    let GRID_COLS = 64, GRID_ROWS = 36;
    let gameStyle = 'fastCompetitive';
    let gameMode = '1P';
    let aiSnakeEnabled = true;
    let currentWallMode = MOD_WALLS.NONE;
    let currentSpeedMode = 'NORMAL';
    let barrierHitThisStep = { p1: false, p2: false };
    let getBarrierCellsSet = () => new Set();
    let SFX = { shrink: () => {} };
    let playerColors = { p1: '#00e5ff', p2: '#ff4fbf' };
    let lastKnownLength1P = 0;
    let attemptedPortalEntry = { p1: false, p2: false };
    let teleportingOwner = null;
    let teleportStepsRemaining = 0;
    let portals = [];
    let recordGridTrail = () => {};
    let opposite = (a, b) => a.x === -b.x && a.y === -b.y;
    let handleBoundaries = (pos, ownerKey) => {
      let x = pos.x, y = pos.y;
      if (currentWallMode === MOD_WALLS.NONE) {
        if (x < 0) x = GRID_COLS - 1; else if (x >= GRID_COLS) x = 0;
        if (y < 0) y = GRID_ROWS - 1; else if (y >= GRID_ROWS) y = 0;
      }
      return { x, y };
    };

    function createSnake(start, dir) {
      const seg = [
        start,
        { x: start.x - dir.x, y: start.y - dir.y },
        { x: start.x - 2 * dir.x, y: start.y - 2 * dir.y },
        { x: start.x - 3 * dir.x, y: start.y - 3 * dir.y },
      ];
      return { segments: seg, prev: seg.map(s => ({ ...s })), dir: { ...dir }, nextDir: { ...dir }, grow: 0, powerEnd: 0 };
    }

    function isPowered(s) { return s && Date.now() < s.powerEnd; }

    ${content.match(/function bodyAdvance[\s\S]*?^      }/m)[0]}

    ${content.match(/function collideCheckDetailed[\s\S]*?^      }/m)[0]}

    return {
      setGameStyle: (v) => gameStyle = v,
      setAiSnakeEnabled: (v) => aiSnakeEnabled = v,
      setGameMode: (v) => gameMode = v,
      createSnake,
      bodyAdvance,
      collideCheckDetailed,
      setSnakes: (s) => snakes = s,
      getSnakes: () => snakes
    };
  `;

  const factory = new Function(evalEnv);
  const sim = factory();

  // Test 1: P1 runs into AI body
  let s1 = sim.createSnake({ x: 10, y: 10 }, { x: 1, y: 0 });
  let s2 = sim.createSnake({ x: 11, y: 12 }, { x: 0, y: -1 }); // AI body at (11,11), (11,12)...
  sim.setSnakes({ p1: s1, p2: s2 });
  sim.bodyAdvance(s1, 'p1'); // s1 head moves to (11, 10)
  // s2 body is at (11,12), (11,13)... not hit yet
  sim.bodyAdvance(s1, 'p1'); // s1 head moves to (12, 10)
  
  // Direct collision test: P1 head at (20, 20), AI body has (20, 20)
  s1 = sim.createSnake({ x: 20, y: 20 }, { x: 1, y: 0 });
  s2 = sim.createSnake({ x: 25, y: 20 }, { x: 1, y: 0 });
  s2.segments = [{ x: 25, y: 20 }, { x: 24, y: 20 }, { x: 20, y: 20 }]; // body contains (20, 20)
  sim.setSnakes({ p1: s1, p2: s2 });
  let res = sim.collideCheckDetailed();
  console.log('P1 head inside AI body ->', res); // Should be result: 'p2', eater: 'p2'

  // Test 2: AI head at (20, 20), P1 body has (20, 20)
  s1 = sim.createSnake({ x: 25, y: 20 }, { x: 1, y: 0 });
  s1.segments = [{ x: 25, y: 20 }, { x: 24, y: 20 }, { x: 20, y: 20 }];
  s2 = sim.createSnake({ x: 20, y: 20 }, { x: 1, y: 0 });
  sim.setSnakes({ p1: s1, p2: s2 });
  res = sim.collideCheckDetailed();
  console.log('AI head inside P1 body ->', res); // Should be result: 'p1', eater: 'p1'

  // Test 3: Head-on collision (same cell)
  s1 = sim.createSnake({ x: 20, y: 20 }, { x: 1, y: 0 });
  s2 = sim.createSnake({ x: 20, y: 20 }, { x: -1, y: 0 });
  sim.setSnakes({ p1: s1, p2: s2 });
  res = sim.collideCheckDetailed();
  console.log('Head-on same cell ->', res); // Should be result: 'draw'

  // Test 4: Self Area 51 mode
  sim.setGameStyle('selfArea51');
  s1 = sim.createSnake({ x: 20, y: 20 }, { x: 1, y: 0 });
  s2 = sim.createSnake({ x: 25, y: 20 }, { x: 1, y: 0 });
  s2.segments = [{ x: 25, y: 20 }, { x: 24, y: 20 }, { x: 20, y: 20 }];
  sim.setSnakes({ p1: s1, p2: s2 });
  res = sim.collideCheckDetailed();
  console.log('Self Area 51 P1 inside AI body ->', res); // Expected { result: null, eater: null }

  // Test 5: Beast mode
  sim.setGameStyle('fastCompetitive');
  s1.powerEnd = Date.now() + 10000; // P1 has beast
  s2.powerEnd = 0;
  res = sim.collideCheckDetailed();
  console.log('Fast Competitive with Beast P1 inside AI body ->', res); // Expected { result: null, eater: null } (phases through!)
}

runTest('PC v3.5.3', 'Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.5.3.html');
runTest('CrazyGames index.html', 'Ana Dosya/CrazyGames/index.html');
