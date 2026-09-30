const fs = require('fs');
const path = require('path');

// Extract collision logic from PC v3.5.3
const html = fs.readFileSync(path.resolve(__dirname, '../Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.5.3.html'), 'utf8');

// Let's create an environment
function runCollisionTest(gameMode, gameStyle, aiSnakeEnabled, p1HeadHitsP2Body) {
  let GRID_COLS = 64, GRID_ROWS = 36;
  let MOD_WALLS = { SOLID: 'SOLID', NONE: 'NONE' };
  let currentWallMode = MOD_WALLS.NONE;
  let barrierHitThisStep = { p1: false, p2: false };
  function getBarrierCellsSet() { return new Set(); }
  function isPowered(s) { return false; }

  // Create snakes
  // p2 is horizontal at y=10, from x=5 to x=10
  const p2 = {
    segments: [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
      { x: 7, y: 10 },
      { x: 6, y: 10 },
      { x: 5, y: 10 }
    ],
    dir: { x: 1, y: 0 }
  };

  // p1 head either hits p2 body at (8, 10), or misses
  const p1Head = p1HeadHitsP2Body ? { x: 8, y: 10 } : { x: 8, y: 9 };
  const p1 = {
    segments: [
      p1Head,
      { x: 8, y: 8 },
      { x: 8, y: 7 },
      { x: 8, y: 6 },
      { x: 8, y: 5 }
    ],
    dir: { x: 0, y: 1 }
  };

  const snakes = { p1, p2 };

  // Run the EXACT collideCheckDetailed code from the game
  function collideCheckDetailed() {
    if (!snakes) return { result: null, eater: null };

    // v2.95.5: Self Area 51 — each snake plays in its own half; only self-collision counts.
    if (gameStyle === 'selfArea51') {
      const s1 = snakes.p1, s2 = snakes.p2;
      if (s1 && s1.segments.length) {
        const h1 = s1.segments[0];
        for (let i = 1; i < s1.segments.length; i++) {
          if (s1.segments[i].x === h1.x && s1.segments[i].y === h1.y) {
            s1.segments = s1.segments.slice(0, i);
            break;
          }
        }
      }
      if (s2 && s2.segments.length) {
        const h2 = s2.segments[0];
        for (let i = 1; i < s2.segments.length; i++) {
          if (s2.segments[i].x === h2.x && s2.segments[i].y === h2.y) {
            s2.segments = s2.segments.slice(0, i);
            break;
          }
        }
      }
      return { result: null, eater: null };
    }

    // 1P Logic
    if (gameMode === '1P' && !aiSnakeEnabled) {
      const s1 = snakes.p1;
      if (!s1) return { result: null, eater: null };
      const head1 = s1.segments[0];

      if (currentWallMode === MOD_WALLS.SOLID) {
        if (head1.x < 0 || head1.x >= GRID_COLS || head1.y < 0 || head1.y >= GRID_ROWS) {
          return { result: 'p1_self', eater: null };
        }
      }
      const self1 = new Set(s1.segments.slice(1).map(c => c.x + ',' + c.y));
      if (self1.has(head1.x + ',' + head1.y)) {
        if (!isPowered(s1)) {
          return { result: 'p1_self', eater: null };
        }
      }
      return { result: null, eater: null };
    }

    // 2P Logic
    const s1 = snakes.p1, s2 = snakes.p2;
    if (!s1 || !s2 || !s1.segments.length || !s2.segments.length) return { result: null, eater: null };
    const head1 = s1.segments[0], head2 = s2.segments[0];
    const beast1 = isPowered(s1);
    const beast2 = isPowered(s2);
    const isAiDuel = (gameMode === '1P' && aiSnakeEnabled);

    if (head1.x === head2.x && head1.y === head2.y) {
      if (beast1 || beast2) return { result: null, eater: null };
      if (isAiDuel) return { result: 'draw', eater: null };
      return { result: 'draw', eater: null };
    }

    const body1 = new Set(); for (let _i = 0; _i < s1.segments.length; _i++) { const _s = s1.segments[_i]; body1.add(_s.x + ',' + _s.y); }
    const body2 = new Set(); for (let _i = 0; _i < s2.segments.length; _i++) { const _s = s2.segments[_i]; body2.add(_s.x + ',' + _s.y); }
    const self1 = new Set(); for (let _i = 1; _i < s1.segments.length; _i++) { const _s = s1.segments[_i]; self1.add(_s.x + ',' + _s.y); }
    const self2 = new Set(); for (let _i = 1; _i < s2.segments.length; _i++) { const _s = s2.segments[_i]; self2.add(_s.x + ',' + _s.y); }

    const head1Pos = head1.x + ',' + head1.y;
    const head2Pos = head2.x + ',' + head2.y;

    let p1HitBarrier = false;
    let p1HitWall = false;
    const p1HitSelf = !(beast1) && self1.has(head1Pos);
    const p1CanPhaseThroughOpponent = isAiDuel ? (beast1 && !beast2) : beast1;
    const p1HitOpponentBody = (!p1CanPhaseThroughOpponent && body2.has(head1Pos));

    let p2HitBarrier = false;
    let p2HitWall = false;
    const p2HitSelf = !(isAiDuel ? false : beast2) && self2.has(head2Pos);
    const p2CanPhaseThroughOpponent = beast2;
    const p2HitOpponentBody = (!p2CanPhaseThroughOpponent && body1.has(head2Pos));

    const p1Loses = p1HitSelf || p1HitOpponentBody || p1HitBarrier || p1HitWall;
    const p2Loses = p2HitSelf || p2HitOpponentBody || p2HitBarrier || p2HitWall;

    if (p1Loses && p2Loses) return { result: 'draw', eater: null };
    if (p1Loses) return { result: 'p2', eater: p1HitOpponentBody ? 'p2' : null };
    if (p2Loses) return { result: 'p1', eater: p2HitOpponentBody ? 'p1' : null };

    return { result: null, eater: null };
  }

  return collideCheckDetailed();
}

console.log('Test 1: 1P Fast Competitive vs AI (aiSnakeEnabled=true, P1 hits P2 body):',
  runCollisionTest('1P', 'fastCompetitive', true, true));

console.log('Test 2: 1P Adventure vs AI (aiSnakeEnabled=true, P1 hits P2 body):',
  runCollisionTest('1P', 'adventure', true, true));

console.log('Test 3: 1P Normal vs AI (aiSnakeEnabled=true, P1 hits P2 body):',
  runCollisionTest('1P', 'normal', true, true));

console.log('Test 4: 1P Self Area 51 vs AI (aiSnakeEnabled=true, P1 hits P2 body):',
  runCollisionTest('1P', 'selfArea51', true, true));

console.log('Test 5: 1P Normal Solo (aiSnakeEnabled=false, P1 hits P2 body):',
  runCollisionTest('1P', 'normal', false, true));

console.log('Test 6: 2P Fast Competitive (P1 hits P2 body):',
  runCollisionTest('2P', 'fastCompetitive', false, true));
