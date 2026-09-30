const fs = require('fs');

// Simulate the exact step() loop in 1P vs AI
let baseStepMs = 120;
let speedFactor = 0.60;
let i1 = baseStepMs; // P1 interval = 120ms
let i2 = baseStepMs / speedFactor; // AI interval = 200ms

let p1Pos = { x: 10, y: 10 };
let p2Pos = { x: 15, y: 10 };

let dt = 16.67; // 60fps frame delta
let acc1 = 0;
let acc2 = 0;

let p1Segments = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }];
let p2Segments = [{ x: 15, y: 10 }, { x: 16, y: 10 }, { x: 17, y: 10 }, { x: 18, y: 10 }];

let collisionDetected = false;

for (let frame = 0; frame < 200; frame++) {
  acc1 += dt;
  acc2 += dt;

  let guard = 0;
  while (guard++ < 12) {
    let r1 = acc1 >= i1;
    let r2 = acc2 >= i2;

    if (!r1 && !r2) break;

    if (r1 && r2) {
      // Both move
      p1Segments.unshift({ x: p1Segments[0].x + 1, y: 10 }); p1Segments.pop();
      p2Segments.unshift({ x: p2Segments[0].x - 1, y: 10 }); p2Segments.pop();
      acc1 -= i1;
      acc2 -= i2;
      console.log(`[Frame ${frame}] BOTH moved: P1=${JSON.stringify(p1Segments[0])}, AI=${JSON.stringify(p2Segments[0])}`);
    } else if (r1) {
      // P1 moves
      p1Segments.unshift({ x: p1Segments[0].x + 1, y: 10 }); p1Segments.pop();
      acc1 -= i1;
      console.log(`[Frame ${frame}] P1 moved: P1=${JSON.stringify(p1Segments[0])}, AI=${JSON.stringify(p2Segments[0])}`);
    } else if (r2) {
      // AI moves
      p2Segments.unshift({ x: p2Segments[0].x - 1, y: 10 }); p2Segments.pop();
      acc2 -= i2;
      console.log(`[Frame ${frame}] AI moved: P1=${JSON.stringify(p1Segments[0])}, AI=${JSON.stringify(p2Segments[0])}`);
    }

    // Check collision
    const h1 = p1Segments[0];
    const h2 = p2Segments[0];
    const body1 = new Set(p1Segments.map(s => s.x + ',' + s.y));
    const body2 = new Set(p2Segments.map(s => s.x + ',' + s.y));

    if (h1.x === h2.x && h1.y === h2.y) {
      console.log(`COLLISION DRAW (head-on same cell) at (${h1.x}, ${h1.y})`);
      collisionDetected = true;
      break;
    }
    const p1HitOpponent = body2.has(h1.x + ',' + h1.y);
    const p2HitOpponent = body1.has(h2.x + ',' + h2.y);
    if (p1HitOpponent || p2HitOpponent) {
      console.log(`COLLISION: p1HitOpponent=${p1HitOpponent}, p2HitOpponent=${p2HitOpponent}`);
      collisionDetected = true;
      break;
    }
  }

  if (collisionDetected) break;
}
