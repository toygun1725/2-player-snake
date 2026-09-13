const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

// Health check endpoint for Render.com
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins for mobile/PC clients
        methods: ['GET', 'POST']
    }
});

// Grid configurations matching the Mobile layout
const GRID_COLS = 24;
const GRID_ROWS = 36;
const BASE_TPS = 14.2;
const SERVER_TICK_MS = 25;
const PERF_LOG_INTERVAL_MS = 60000;
const PERF_PAYLOAD_SAMPLE_RATE = 20;

const MOD_SPEED = {
    EASY: 1.00,
    NORMAL: 1.00,
    FAST: 1.35,
    EXTREME: 1.80
};

// Rooms dictionary to hold active games
const rooms = {};
// Matchmaking queue
let matchmakingQueue = { mobile: [], pc: [] };
const REMATCH_WAIT_SECONDS = 30;
const POST_GAME_ROOM_TTL_MS = 5 * 60 * 1000;
const perfStats = {
    startedAt: Date.now(),
    updates: 0,
    sampledBytes: 0,
    samples: 0,
    tickMsTotal: 0,
    tickSamples: 0,
    maxTickMs: 0,
    maxEventLoopLagMs: 0
};

// Helper functions
function generateRoomId() {
    let id;
    do {
        id = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit room code
    } while (rooms[id]);
    return id;
}

const MAX_PLAYER_NAME_LENGTH = 12;

function normalizePlayerName(value, fallback = '') {
    if (typeof value !== 'string') return fallback;

    const normalized = value
        .normalize('NFC')
        .replace(/[\u0000-\u001F\u007F]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    const truncated = Array.from(normalized).slice(0, MAX_PLAYER_NAME_LENGTH).join('');
    return truncated || fallback;
}

function ensureWorldSync(room) {
    if (!room.worldVersions) room.worldVersions = { foods: 0, barriers: 0, portals: 0 };
    if (!room.worldDirty) room.worldDirty = { foods: true, barriers: true, portals: true };
}

function resetWorldSync(room) {
    room.worldVersions = { foods: 0, barriers: 0, portals: 0 };
    room.worldDirty = { foods: true, barriers: true, portals: true };
}

function markWorldDirty(room, key) {
    if (!room || !key) return;
    ensureWorldSync(room);
    room.worldVersions[key] = (room.worldVersions[key] || 0) + 1;
    room.worldDirty[key] = true;
}

function clearWorldDirty(room) {
    ensureWorldSync(room);
    room.worldDirty.foods = false;
    room.worldDirty.barriers = false;
    room.worldDirty.portals = false;
}

function buildSnakeSyncPayload(snake, now) {
    return {
        segments: snake.segments,
        dir: snake.dir,
        grow: snake.grow,
        score: snake.score,
        foodCount: snake.foodCount || 0,
        powerTimeLeft: Math.max(0, snake.powerEnd - now),
        slowTimeLeft: Math.max(0, snake.slowEnd - now),
        flashTimeLeft: Math.max(0, snake.flashUntil - now),
        flashColor: snake.flashColor,
        dashTimeLeft: Math.max(0, snake.dashEndTime - now),
        dashCooldownLeft: Math.max(0, snake.dashCooldown - now)
    };
}

function buildGameUpdatePayload(room, now) {
    ensureWorldSync(room);
    const payload = {
        snakes: {
            p1: buildSnakeSyncPayload(room.snakes.p1, now),
            p2: buildSnakeSyncPayload(room.snakes.p2, now)
        },
        roundTimer: room.roundTimer,
        normalFoodsEaten: room.normalFoodsEaten,
        foodsVersion: room.worldVersions.foods,
        barriersVersion: room.worldVersions.barriers,
        portalsVersion: room.worldVersions.portals
    };

    if (room.worldDirty.foods) payload.foods = room.foods;
    if (room.worldDirty.barriers) payload.barriers = room.barriers;
    if (room.worldDirty.portals) payload.portals = room.portals;
    clearWorldDirty(room);
    return payload;
}

function recordGameUpdatePerf(payload, tickMs) {
    perfStats.updates++;
    perfStats.tickMsTotal += tickMs;
    perfStats.tickSamples++;
    if (tickMs > perfStats.maxTickMs) perfStats.maxTickMs = tickMs;
    if (perfStats.updates % PERF_PAYLOAD_SAMPLE_RATE === 0) {
        perfStats.sampledBytes += Buffer.byteLength(JSON.stringify(payload));
        perfStats.samples++;
    }
}

function emitGameUpdate(room, payload, tickMs) {
    io.to(room.id).emit('gameUpdate', payload);
    recordGameUpdatePerf(payload, tickMs);
}

function countRoomsByState(state) {
    return Object.values(rooms).filter(room => room.state === state).length;
}

let lastLagProbeAt = Date.now();
const lagProbeTimer = setInterval(() => {
    const now = Date.now();
    const lagMs = Math.max(0, now - lastLagProbeAt - 5000);
    perfStats.maxEventLoopLagMs = Math.max(perfStats.maxEventLoopLagMs, lagMs);
    lastLagProbeAt = now;
}, 5000);
if (lagProbeTimer.unref) lagProbeTimer.unref();

const perfLogTimer = setInterval(() => {
    const elapsedSec = Math.max(1, (Date.now() - perfStats.startedAt) / 1000);
    const avgPayload = perfStats.samples ? Math.round(perfStats.sampledBytes / perfStats.samples) : 0;
    const avgTick = perfStats.tickSamples ? (perfStats.tickMsTotal / perfStats.tickSamples).toFixed(2) : '0.00';
    console.log(`[perf] rooms=${Object.keys(rooms).length} playing=${countRoomsByState('playing')} updates/s=${(perfStats.updates / elapsedSec).toFixed(1)} avgPayload=${avgPayload}B avgTick=${avgTick}ms maxTick=${perfStats.maxTickMs.toFixed(2)}ms maxLag=${perfStats.maxEventLoopLagMs}ms`);
    perfStats.startedAt = Date.now();
    perfStats.updates = 0;
    perfStats.sampledBytes = 0;
    perfStats.samples = 0;
    perfStats.tickMsTotal = 0;
    perfStats.tickSamples = 0;
    perfStats.maxTickMs = 0;
    perfStats.maxEventLoopLagMs = 0;
}, PERF_LOG_INTERVAL_MS);
if (perfLogTimer.unref) perfLogTimer.unref();

function clearRoomTimers(room) {
    if (!room) return;
    if (room.gameTimeout) clearTimeout(room.gameTimeout);
    if (room.pauseTimer) clearInterval(room.pauseTimer);
    if (room.graceTimer) clearTimeout(room.graceTimer);
    if (room.nextRoundTimer) clearTimeout(room.nextRoundTimer);
    if (room.rematchTimer) clearTimeout(room.rematchTimer);
    if (room.postGameCleanupTimer) clearTimeout(room.postGameCleanupTimer);
    room.gameTimeout = null;
    room.pauseTimer = null;
    room.graceTimer = null;
    room.nextRoundTimer = null;
    room.rematchTimer = null;
    room.postGameCleanupTimer = null;
}

function schedulePostGameCleanup(room) {
    if (!room) return;
    if (room.postGameCleanupTimer) clearTimeout(room.postGameCleanupTimer);
    room.postGameCleanupTimer = setTimeout(() => {
        if (rooms[room.id] && (rooms[room.id].state === 'postGame' || rooms[room.id].state === 'rematchWaiting')) {
            io.to(room.id).emit('rematchExpired');
            clearRoomTimers(room);
            delete rooms[room.id];
        }
    }, POST_GAME_ROOM_TTL_MS);
}

function getRoomRole(room, socket) {
    if (!room || !socket) return null;
    if (room.p1 && room.p1.id === socket.id) return 'p1';
    if (room.p2 && room.p2.id === socket.id) return 'p2';
    return null;
}

function resetRoomForRematch(room) {
    clearRoomTimers(room);
    room.state = 'lobby';
    room.scores = { p1: 0, p2: 0 };
    room.pauseUsed = { p1: 0, p2: 0 };
    room.rematchVotes = {};
    room.rematchReadys = {};
    room.previousState = null;
    room.pausedBy = null;
    room.pauseStartTime = 0;
    room.pauseTimeLeft = 0;
    room.normalFoodsEaten = 0;
    room.foods = [];
    room.snakes = {};
    room.barriers = [];
    room.portals = [];
    resetWorldSync(room);
    room.teleportingOwner = null;
    room.teleportStepsRemaining = 0;
    room.attemptedPortalEntry = { p1: false, p2: false };
}

function oppositeDirection(dir1, dir2) {
    return dir1.x === -dir2.x && dir1.y === -dir2.y;
}

function getFoodCycleStep(room) {
    return (room.normalFoodsEaten % 14) + 1;
}

function findFreeCell(room) {
    const occupied = new Set();
    if (room.snakes.p1) room.snakes.p1.segments.forEach(s => occupied.add(`${s.x},${s.y}`));
    if (room.snakes.p2) room.snakes.p2.segments.forEach(s => occupied.add(`${s.x},${s.y}`));
    room.foods.forEach(f => occupied.add(`${f.x},${f.y}`));
    if (room.barriers) room.barriers.forEach(b => b.cells.forEach(c => occupied.add(`${c.x},${c.y}`)));
    if (room.portals) room.portals.forEach(p => occupied.add(`${p.x},${p.y}`));

    const cols = room.gridCols || GRID_COLS;
    const rows = room.gridRows || GRID_ROWS;

    const freeCells = [];
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            if (!occupied.has(`${x},${y}`)) {
                freeCells.push({ x, y });
            }
        }
    }

    if (freeCells.length === 0) return null;
    return freeCells[Math.floor(Math.random() * freeCells.length)];
}

// === Self Area 51 helpers ===
function selfArea51HalfBounds(room, ownerKey) {
    const cols = room.gridCols || GRID_COLS;
    const rows = room.gridRows || GRID_ROWS;
    if (room.platform === 'pc') {
        const half = Math.floor(cols / 2);
        if (ownerKey === 'p1') return { xMin: 0, xMax: half - 1 };
        return { xMin: half, xMax: cols - 1 };
    } else {
        const half = Math.floor(rows / 2);
        if (ownerKey === 'p2') return { yMin: 0, yMax: half - 1 };
        return { yMin: half, yMax: rows - 1 };
    }
}

function selfArea51WrapForOwner(room, c, ownerKey) {
    const cols = room.gridCols || GRID_COLS;
    const rows = room.gridRows || GRID_ROWS;
    let x = c.x, y = c.y;

    if (room.platform === 'pc') {
        const { xMin, xMax } = selfArea51HalfBounds(room, ownerKey);
        if (x < xMin) x = xMax;
        else if (x > xMax) x = xMin;
        if (y < 0) y = rows - 1;
        else if (y >= rows) y = 0;
    } else {
        const { yMin, yMax } = selfArea51HalfBounds(room, ownerKey);
        if (x < 0) x = cols - 1;
        else if (x >= cols) x = 0;
        if (y < yMin) y = yMax;
        else if (y > yMax) y = yMin;
    }
    return { x, y };
}

function findFreeCellForHalf(room, ownerKey) {
    const occupied = new Set();
    if (room.snakes.p1) room.snakes.p1.segments.forEach(s => occupied.add(`${s.x},${s.y}`));
    if (room.snakes.p2) room.snakes.p2.segments.forEach(s => occupied.add(`${s.x},${s.y}`));
    room.foods.forEach(f => occupied.add(`${f.x},${f.y}`));
    if (room.barriers) room.barriers.forEach(b => b.cells.forEach(c => occupied.add(`${c.x},${c.y}`)));
    if (room.portals) room.portals.forEach(p => occupied.add(`${p.x},${p.y}`));

    const cols = room.gridCols || GRID_COLS;
    const rows = room.gridRows || GRID_ROWS;
    const freeCells = [];

    if (room.platform === 'pc') {
        const { xMin, xMax } = selfArea51HalfBounds(room, ownerKey);
        for (let x = xMin; x <= xMax; x++) {
            for (let y = 0; y < rows; y++) {
                if (!occupied.has(`${x},${y}`)) {
                    freeCells.push({ x, y });
                }
            }
        }
    } else {
        const { yMin, yMax } = selfArea51HalfBounds(room, ownerKey);
        for (let x = 0; x < cols; x++) {
            for (let y = yMin; y <= yMax; y++) {
                if (!occupied.has(`${x},${y}`)) {
                    freeCells.push({ x, y });
                }
            }
        }
    }

    if (freeCells.length === 0) return null;
    return freeCells[Math.floor(Math.random() * freeCells.length)];
}

function spawnGreenDiamondForHalf(room, ownerKey) {
    const cell = findFreeCellForHalf(room, ownerKey);
    if (cell) {
        room.foods.push({
            x: cell.x,
            y: cell.y,
            type: 'green',
            selfArea51Half: ownerKey
        });
        markWorldDirty(room, 'foods');
    }
}

function clearGreenDiamonds(room) {
    const before = room.foods.length;
    room.foods = room.foods.filter(f => f.type !== 'green');
    if (room.foods.length !== before) markWorldDirty(room, 'foods');
    room.selfArea51GreenActive = false;
}

function relocateGreenDiamonds(room) {
    const greens = room.foods.filter(f => f.type === 'green');
    if (greens.length === 0) return;
    clearGreenDiamonds(room);
    spawnGreenDiamondForHalf(room, 'p1');
    spawnGreenDiamondForHalf(room, 'p2');
    room.selfArea51GreenActive = true;
    room.selfArea51GreenLastMove = Date.now();
}

function maybeSpawnGreenDiamonds(room, now) {
    if (room.mode !== 'selfArea51') return false;
    
    if (!room.selfArea51GreenActive && room.selfArea51GreenSpawnAt > 0 && now >= room.selfArea51GreenSpawnAt) {
        spawnGreenDiamondForHalf(room, 'p1');
        spawnGreenDiamondForHalf(room, 'p2');
        room.selfArea51GreenActive = true;
        room.selfArea51GreenLastMove = now;
        return true;
    }
    
    if (room.selfArea51GreenActive && room.selfArea51GreenLastMove > 0 && (now - room.selfArea51GreenLastMove) >= 3000) {
        relocateGreenDiamonds(room);
        return true;
    }
    return false;
}

// === Adventure Mode helpers ===
const TETROMINO_SHAPES = [
    [{ x:0,y:0 },{ x:1,y:0 },{ x:2,y:0 },{ x:3,y:0 }], // I
    [{ x:0,y:0 },{ x:1,y:0 },{ x:0,y:1 },{ x:1,y:1 }], // O
    [{ x:0,y:0 },{ x:1,y:0 },{ x:2,y:0 },{ x:1,y:1 }], // T
    [{ x:0,y:0 },{ x:0,y:1 },{ x:0,y:2 },{ x:1,y:2 }], // L
    [{ x:1,y:0 },{ x:1,y:1 },{ x:1,y:2 },{ x:0,y:2 }], // J
    [{ x:1,y:0 },{ x:2,y:0 },{ x:0,y:1 },{ x:1,y:1 }], // S
    [{ x:0,y:0 },{ x:1,y:0 },{ x:1,y:1 },{ x:2,y:1 }]  // Z
];

function rotateCells(cells, times) {
    let out = cells.map(c => ({ ...c }));
    for (let t = 0; t < times; t++) {
        out = out.map(c => ({ x: c.y, y: -c.x }));
        const minX = Math.min(...out.map(c => c.x));
        const minY = Math.min(...out.map(c => c.y));
        out = out.map(c => ({ x: c.x - minX, y: c.y - minY }));
    }
    return out;
}

function translateCells(cells, dx, dy) {
    return cells.map(c => ({ x: c.x + dx, y: c.y + dy }));
}

function getBarrierCellsSet(room) {
    const set = new Set();
    if (room.barriers) {
        room.barriers.forEach(b => {
            if (b && b.cells) b.cells.forEach(c => set.add(c.x + ',' + c.y));
        });
    }
    return set;
}

function spawnBarriers(room, desiredCount) {
    room.barriers = [];
    markWorldDirty(room, 'barriers');
    const maxAttempts = 2000;
    let attempts = 0;

    const cols = room.gridCols || GRID_COLS;
    const rows = room.gridRows || GRID_ROWS;

    const baseOcc = new Set();
    room.foods.forEach(f => baseOcc.add(f.x + ',' + f.y));
    if (room.portals) room.portals.forEach(p => baseOcc.add(p.x + ',' + p.y));

    const cx = Math.floor(cols / 2), cy = Math.floor(rows / 2);
    for (let x = cx - 3; x <= cx + 3; x++) {
        for (let y = cy - 3; y <= cy + 3; y++) baseOcc.add(x + ',' + y);
    }

    const addSnakeOcc = (s) => {
        if (!s || !s.segments) return;
        s.segments.forEach((seg, idx) => {
            if (idx === 0) {
                for (let bx = -1; bx <= 1; bx++) {
                    for (let by = -1; by <= 1; by++) baseOcc.add((seg.x + bx) + ',' + (seg.y + by));
                }
            } else {
                baseOcc.add(seg.x + ',' + seg.y);
            }
        });
    };
    if (room.snakes) {
        addSnakeOcc(room.snakes.p1);
        addSnakeOcc(room.snakes.p2);
    }

    while (room.barriers.length < desiredCount && attempts++ < maxAttempts) {
        const base = TETROMINO_SHAPES[Math.floor(Math.random() * TETROMINO_SHAPES.length)];
        const rot = Math.floor(Math.random() * 4);
        let cells = rotateCells(base, rot);
        const maxX = cols - Math.max(...cells.map(c => c.x)) - 1;
        const maxY = rows - Math.max(...cells.map(c => c.y)) - 1;
        const dx = Math.floor(Math.random() * Math.max(1, maxX));
        const dy = Math.floor(Math.random() * Math.max(1, maxY));
        cells = translateCells(cells, dx, dy);

        let valid = true;
        const currentBarrierCells = getBarrierCellsSet(room);
        for (const c of cells) {
            if (c.x < 0 || c.x >= cols || c.y < 0 || c.y >= rows) { valid = false; break; }
            const key = c.x + ',' + c.y;
            if (baseOcc.has(key) || currentBarrierCells.has(key)) { valid = false; break; }
        }
        if (!valid) continue;
        room.barriers.push({ cells });
    }
}

function spawnPortals(room) {
    if (room.teleportingOwner) return;
    room.portals = [];
    markWorldDirty(room, 'portals');
    for (let i = 0; i < 2; i++) {
        const cell = findFreeCell(room);
        if (cell) {
            room.portals.push({ x: cell.x, y: cell.y, id: i });
            markWorldDirty(room, 'portals');
        }
    }
    room.portalTimer = 15000;
}

// Shrink opponent snake by `amount` segments. Returns true if opponent was killed.
function shrinkOpponent(room, eaterRole, amount) {
    const otherRole = eaterRole === 'p1' ? 'p2' : 'p1';
    const other = room.snakes[otherRole];
    if (!other) return false;

    let remaining = amount;
    while (remaining > 0 && other.segments.length > 1) {
        other.segments.pop();
        remaining--;
    }

    if (remaining > 0 && other.segments.length <= 1) {
        other.segments = [];
        return true; // opponent killed
    }

    return false;
}

function spawnRubyBurstFoods(room) {
    room.foods = [];
    markWorldDirty(room, 'foods');
    // Spawn 12 normal white foods with rubyBurst: true flag
    for (let k = 0; k < 12; k++) {
        const cell = findFreeCell(room);
        if (cell) {
            room.foods.push({ x: cell.x, y: cell.y, type: 'normal', rubyBurst: true });
            markWorldDirty(room, 'foods');
        }
    }
    // Spawn 1 standalone sapphire food with rubyBurst: true
    const cellS = findFreeCell(room);
    if (cellS) {
        room.foods.push({ x: cellS.x, y: cellS.y, type: 'sapphire', rubyBurst: true });
        markWorldDirty(room, 'foods');
    }
}

function spawnFood(room) {
    // If the room has double foods or sapphire pair foods that are not eaten yet, don't spawn more
    const hasLockedCycleFood = room.foods.some(f => f.type !== 'normal' || f.pairId);
    if (hasLockedCycleFood) return;

    if (room.mode === 'selfArea51') {
        const halves = ['p1', 'p2'];
        halves.forEach(h => {
            const hasNormal = room.foods.some(f => f.type === 'normal' && f.selfArea51Half === h);
            if (!hasNormal) {
                const cell = findFreeCellForHalf(room, h);
                if (cell) {
                    room.foods.push({
                        x: cell.x,
                        y: cell.y,
                        type: 'normal',
                        selfArea51Half: h
                    });
                    markWorldDirty(room, 'foods');
                }
            }
        });
        return;
    }

    if (room.mode !== 'fastCompetitive' && room.mode !== 'adventure') {
        // Standard modes
        const normalCount = room.foods.filter(f => f.type === 'normal' && !f.pairId && !f.rubyBurst).length;
        if (normalCount < 1) {
            const cell = findFreeCell(room);
            if (cell) {
                room.foods.push({ x: cell.x, y: cell.y, type: 'normal' });
                markWorldDirty(room, 'foods');
            }
        }
        return;
    }

    // Fast Competitive or Adventure cycles
    const step = getFoodCycleStep(room);
    if (step === 4 || step === 11) {
        // Double food pair
        const pairId = 'pair_' + Date.now();
        const cell1 = findFreeCell(room);
        if (cell1) {
            room.foods.push({ x: cell1.x, y: cell1.y, type: 'double', pairId });
            markWorldDirty(room, 'foods');
            const cell2 = findFreeCell(room);
            if (cell2) {
                room.foods.push({ x: cell2.x, y: cell2.y, type: 'double', pairId });
                markWorldDirty(room, 'foods');
            }
        }
    } else if (step === 5 || step === 10) {
        // Sapphire pair
        const pairId = 'pair_' + Date.now();
        const cell1 = findFreeCell(room);
        if (cell1) {
            room.foods.push({ x: cell1.x, y: cell1.y, type: 'normal', pairId });
            markWorldDirty(room, 'foods');
            const cell2 = findFreeCell(room);
            if (cell2) {
                room.foods.push({ x: cell2.x, y: cell2.y, type: 'sapphire', pairId });
                markWorldDirty(room, 'foods');
            }
        }
    } else if (step === 7 || step === 14) {
        // Diamond — includes relocateTime for 3s relocation cycle
        const cell = findFreeCell(room);
        if (cell) {
            room.foods.push({ x: cell.x, y: cell.y, type: 'diamond', relocateTime: Date.now() + 3000 });
            markWorldDirty(room, 'foods');
        }
    } else if (step === 9 && room.mode === 'fastCompetitive') {
        // Ruby (heart)
        const cell = findFreeCell(room);
        if (cell) {
            room.foods.push({ x: cell.x, y: cell.y, type: 'heart' });
            markWorldDirty(room, 'foods');
        }
    } else {
        // Normal food — only spawn if no normal food on field
        const normalCount = room.foods.filter(f => f.type === 'normal' && !f.pairId && !f.rubyBurst).length;
        if (normalCount < 1) {
            const cell = findFreeCell(room);
            if (cell) {
                room.foods.push({ x: cell.x, y: cell.y, type: 'normal' });
                markWorldDirty(room, 'foods');
            }
        }
    }
}

function startGameLoop(room) {
    if (room.gameTimeout) clearTimeout(room.gameTimeout);

    room.lastTickTime = Date.now();
    let expected = Date.now() + SERVER_TICK_MS;

    function tick() {
        if (!rooms[room.id] || room.state !== 'playing') {
            room.gameTimeout = null;
            return;
        }

        const now = Date.now();
        const dt = now - room.lastTickTime;
        room.lastTickTime = now;

        gameTick60FPS(room, dt);

        const nextTickStartedAt = Date.now();
        const drift = nextTickStartedAt - expected;
        expected += SERVER_TICK_MS;

        // Self-correcting delay
        const nextDelay = Math.max(0, SERVER_TICK_MS - drift);
        room.gameTimeout = setTimeout(tick, nextDelay);
    }

    room.gameTimeout = setTimeout(tick, SERVER_TICK_MS);
}

function initGameInRoom(room) {
    resetWorldSync(room);
    room.normalFoodsEaten = 0;

    const cols = room.gridCols || GRID_COLS;
    const rows = room.gridRows || GRID_ROWS;

    const p1Segments = [];
    const p2Segments = [];
    let p1Dir = { x: -1, y: 0 };
    let p2Dir = { x: 1, y: 0 };

    if (room.mode === 'selfArea51') {
        const cx = Math.floor(cols / 2);
        const halfRows = Math.floor(rows / 2);
        
        if (room.platform === 'pc') {
            const halfW = Math.floor(cols / 2);
            const p1CenterX = Math.floor(halfW / 2);
            const p2CenterX = halfW + Math.floor(halfW / 2);
            const cy = Math.floor(rows / 2);
            p1Dir = { x: 1, y: 0 }; // faces right
            p2Dir = { x: -1, y: 0 }; // faces left
            
            for (let i = 0; i < 5; i++) {
                p1Segments.push({ x: p1CenterX - 2 - i, y: cy });
                p2Segments.push({ x: p2CenterX + 2 + i, y: cy });
            }
        } else {
            const y1 = Math.floor(halfRows + halfRows / 2); // p1 y
            const y2 = Math.floor(halfRows / 2); // p2 y
            p1Dir = { x: 1, y: 0 }; // both face right
            p2Dir = { x: 1, y: 0 };
            
            for (let i = 0; i < 5; i++) {
                p1Segments.push({ x: cx - i, y: y1 });
                p2Segments.push({ x: cx - i, y: y2 });
            }
        }
    } else {
        const y1 = Math.floor(rows * 0.25);
        const y2 = Math.floor(rows * 0.75);
        const x1 = Math.floor(cols * 0.25);
        const x2 = Math.floor(cols * 0.75);

        for (let i = 0; i < 6; i++) {
            p1Segments.push({ x: x2 + i, y: y2 }); // p1 faces LEFT (-1, 0)
        }
        for (let i = 0; i < 6; i++) {
            p2Segments.push({ x: x1 - i, y: y1 }); // p2 faces RIGHT (1, 0)
        }
    }

    room.snakes = {
        p1: {
            segments: p1Segments,
            dir: { ...p1Dir },
            nextDir: { ...p1Dir },
            grow: 0,
            score: 0,
            foodCount: 0,
            powerEnd: 0,
            slowEnd: 0,
            flashUntil: 0,
            flashColor: null,
            acc: 0,
            dashEndTime: 0,
            dashCooldown: 0
        },
        p2: {
            segments: p2Segments,
            dir: { ...p2Dir },
            nextDir: { ...p2Dir },
            grow: 0,
            score: 0,
            foodCount: 0,
            powerEnd: 0,
            slowEnd: 0,
            flashUntil: 0,
            flashColor: null,
            acc: 0,
            dashEndTime: 0,
            dashCooldown: 0
        }
    };

    room.foods = [];
    room.barriers = [];
    room.portals = [];
    room.teleportingOwner = null;
    room.teleportStepsRemaining = 0;
    room.attemptedPortalEntry = { p1: false, p2: false };

    if (room.mode === 'adventure') {
        const roundIndex = 1 + room.scores.p1 + room.scores.p2;
        spawnBarriers(room, 3 * roundIndex);
        spawnPortals(room);
    }

    spawnFood(room);
    room.state = 'countdown';
    room.countdownValue = 3;
    room.roundTimer = (room.mode === 'normal' || room.mode === 'selfArea51') ? 999999 : 180;

    io.to(room.id).emit('gameInit', {
        snakes: room.snakes,
        foods: room.foods,
        mode: room.mode,
        state: room.state,
        countdownValue: room.countdownValue,
        gridCols: cols,
        gridRows: rows,
        normalFoodsEaten: room.normalFoodsEaten,
        barriers: room.barriers,
        portals: room.portals,
        foodsVersion: room.worldVersions.foods,
        barriersVersion: room.worldVersions.barriers,
        portalsVersion: room.worldVersions.portals
    });
    clearWorldDirty(room);

    // Start tick loops
    if (room.gameTimeout) clearTimeout(room.gameTimeout);

    // Countdown interval
    let countdownInterval = setInterval(() => {
        if (!rooms[room.id]) {
            clearInterval(countdownInterval);
            return;
        }

        // Pause countdown if game is currently paused due to disconnects
        if (room.state === 'paused') {
            return;
        }

        room.countdownValue--;
        if (room.countdownValue <= 0) {
            clearInterval(countdownInterval);
            room.state = 'playing';

            if (room.mode === 'selfArea51') {
                const now = Date.now();
                room.selfArea51StartTime = now;
                room.selfArea51GreenSpawnAt = now + 15000;
                room.selfArea51GreenActive = false;
                room.selfArea51GreenLastMove = 0;
            }

            io.to(room.id).emit('gameStart', { state: room.state });
            
            // Start regular game loop. Clients interpolate between server states.
            startGameLoop(room);
        } else {
            io.to(room.id).emit('countdownTick', { countdownValue: room.countdownValue });
        }
    }, 1000);
}

function gameTick60FPS(room, dt) {
    const tickStartedAt = Date.now();
    const now = Date.now();

    // Decrement round timer
    if (room.mode !== 'normal' && room.mode !== 'selfArea51') {
        room.roundTimer -= dt / 1000;
        if (room.roundTimer <= 0) {
            room.roundTimer = 0;
            const l1 = room.snakes.p1.segments.length;
            const l2 = room.snakes.p2.segments.length;
            if (l1 > l2) {
                endRound(room, 'p1');
            } else if (l2 > l1) {
                endRound(room, 'p2');
            } else {
                endRound(room, 'draw');
            }
            return;
        }
    }

    // Adventure portal timer
    let adventureUpdated = false;
    if (room.mode === 'adventure' && room.portals && room.portals.length === 2) {
        room.portalTimer -= dt;
        if (room.portalTimer <= 0 && !room.teleportingOwner) {
            spawnPortals(room);
            adventureUpdated = true;
        }
    }

    // (room.teleportStepsRemaining is now handled within the snake's movement ticks)

    // Self Area 51 green diamonds spawning/relocation logic
    let self51Updated = false;
    if (room.mode === 'selfArea51') {
        self51Updated = maybeSpawnGreenDiamonds(room, now);
    }

    // Diamond relocation: move diamond to new cell every 3 seconds
    let anyMoved = self51Updated || adventureUpdated;
    room.foods.forEach(f => {
        if (f.type === 'diamond' && f.relocateTime && now >= f.relocateTime) {
            const cell = findFreeCell(room);
            if (cell) {
                f.x = cell.x;
                f.y = cell.y;
                markWorldDirty(room, 'foods');
            }
            f.relocateTime = now + 3000;
            markWorldDirty(room, 'foods');
            anyMoved = true;
        }
    });

    let roundEndedByShrink = false;
    let shrinkWinner = null;
    const players = ['p1', 'p2'];
    players.forEach(p => {
        if (roundEndedByShrink) return;
        const s = room.snakes[p];
        if (!s || s.segments.length === 0) return;

        // Calculate current effective speed
        let speed = BASE_TPS;
        if (room.mode === 'fastCompetitive') {
            const mult = 0.85; // Normal speed is 0.85x (12.07 TPS)
            speed = BASE_TPS * mult;
        }

        // Apply speed boosts/slowdowns
        if (now < s.powerEnd) {
            speed *= 1.45; // Beast mode speed boost
        }
        if (now < s.dashEndTime) {
            speed *= 2.5; // Fast Competitive dash boost
        }
        if (now < s.slowEnd) {
            speed *= 0.5; // Sapphire slow effect
        }

        s.acc += dt;
        const stepInterval = 1000 / speed;

        let moveGuard = 0;
        while (s.acc >= stepInterval && moveGuard++ < 3) {
            s.hitBarrier = false;
            anyMoved = true;
            // Lock and apply direction
            if (s.dir.x !== -s.nextDir.x || s.dir.y !== -s.nextDir.y) {
                s.dir = s.nextDir;
            }

            const head = s.segments[0];
            let nextX = head.x + s.dir.x;
            let nextY = head.y + s.dir.y;

            // Boundary wrapping
            if (room.mode === 'selfArea51') {
                const wrapped = selfArea51WrapForOwner(room, { x: nextX, y: nextY }, p);
                nextX = wrapped.x;
                nextY = wrapped.y;
            } else {
                const cols = room.gridCols || GRID_COLS;
                const rows = room.gridRows || GRID_ROWS;
                if (nextX < 0) nextX = cols - 1;
                else if (nextX >= cols) nextX = 0;
                if (nextY < 0) nextY = rows - 1;
                else if (nextY >= rows) nextY = 0;
            }

            // Adventure portal teleportation
            if (room.mode === 'adventure' && room.portals && room.portals.length === 2) {
                const isPortal = (x, y) => (room.portals[0].x === x && room.portals[0].y === y) || (room.portals[1].x === x && room.portals[1].y === y);
                const getOtherPortal = (x, y) => room.portals[0].x === x && room.portals[0].y === y ? room.portals[1] : room.portals[0];

                if (isPortal(nextX, nextY)) {
                    const otherP = p === 'p1' ? 'p2' : 'p1';
                    if (!room.teleportingOwner && room.attemptedPortalEntry[otherP]) {
                        endRound(room, 'draw');
                        return;
                    }
                    if (room.teleportingOwner && room.teleportingOwner !== p) {
                        endRound(room, otherP);
                        return;
                    }

                    room.attemptedPortalEntry[p] = true;
                    const op = getOtherPortal(nextX, nextY);
                    if (op) {
                        room.teleportingOwner = p;
                        room.teleportStepsRemaining = s.segments.length;
                        nextX = op.x;
                        nextY = op.y;
                    }
                }
            }

            // Adventure barrier collision check
            if (room.mode === 'adventure' && room.barriers) {
                let hitBarrier = false;
                room.barriers.forEach(b => {
                    if (b && b.cells) {
                        b.cells.forEach(c => {
                            if (c.x === nextX && c.y === nextY) {
                                hitBarrier = true;
                            }
                        });
                    }
                });
                if (hitBarrier) {
                    s.hitBarrier = true;
                }
            }

            // Add new head
            s.segments.unshift({ x: nextX, y: nextY });

            // Check food collision
            let ate = false;
            let pairIdToRemove = null;
            let eatenFood = null;

            for (const f of room.foods) {
                if (f.x === nextX && f.y === nextY) {
                    eatenFood = f;
                    break;
                }
            }

            if (eatenFood) {
                ate = true;
                if (eatenFood.pairId) pairIdToRemove = eatenFood.pairId;
                s.foodCount = (s.foodCount || 0) + 1;
                
                // Remove the eaten food
                room.foods = room.foods.filter(f => f !== eatenFood);
                markWorldDirty(room, 'foods');

                // Determine how much to grow and score
                if (room.mode === 'selfArea51') {
                    if (eatenFood.type === 'green') {
                        s.grow += 1;
                        s.score += 15;
                        room.normalFoodsEaten++;

                        // Shrink opponent by 1, but NEVER KILL (minimum length 1)
                        const otherRole = p === 'p1' ? 'p2' : 'p1';
                        const other = room.snakes[otherRole];
                        if (other && other.segments && other.segments.length > 1) {
                            other.segments.pop();
                            if (other.grow > 0) other.grow = Math.max(0, other.grow - 1);
                        }

                        s.flashUntil = now + 500;
                        s.flashColor = '#39ff7a';

                        clearGreenDiamonds(room);
                        room.selfArea51GreenSpawnAt = now + 15000;
                        room.selfArea51GreenLastMove = 0;
                    } else {
                        // normal food
                        s.grow += 1;
                        s.score += 10;
                        room.normalFoodsEaten++;
                    }
                } else if (eatenFood.type === 'diamond') {
                    s.grow += 3;
                    s.score += 30;
                    room.normalFoodsEaten++;
                    // Gold flash on the eater (matching local mode)
                    s.flashUntil = now + 500;
                    s.flashColor = '#ffd166';
                } else if (eatenFood.type === 'sapphire') {
                    s.grow += 1;
                    s.score += 10;
                    room.normalFoodsEaten++;
                    // Flash effect on the eater (matching local mode)
                    s.flashUntil = now + 500;
                    s.flashColor = '#00cfff';
                    // Slow down opponent (no flash — local mode only applies slow)
                    const otherP = p === 'p1' ? 'p2' : 'p1';
                    const otherS = room.snakes[otherP];
                    if (otherS) {
                        otherS.slowEnd = now + 4000;
                    }
                } else if (eatenFood.type === 'heart') {
                    // Activate Beast Mode (powerEnd) for 8 seconds
                    s.powerEnd = now + 8000;
                    s.flashUntil = s.powerEnd;
                    s.flashColor = '#ff1744';
                    s.score += 15;
                    room.normalFoodsEaten++;
                    // Spawn Ruby burst
                    spawnRubyBurstFoods(room);
                } else if (eatenFood.type === 'double') {
                    s.grow += 1;
                    s.score += 10;
                    room.normalFoodsEaten++;
                    // Shrink opponent by 1 (matching local shrinkOpponentBy)
                    if (shrinkOpponent(room, p, 1)) {
                        roundEndedByShrink = true;
                        shrinkWinner = p;
                    }
                } else {
                    // normal food — grow +2 in normal mode, +1 in other modes
                    if (room.mode === 'normal') {
                        s.grow += 2;
                    } else {
                        s.grow += 1;
                    }
                    s.score += 10;
                    room.normalFoodsEaten++;
                    
                    // Opponent shrink ONLY in Fast Competitive and Adventure modes!
                    if (room.mode === 'fastCompetitive' || room.mode === 'adventure') {
                        if (shrinkOpponent(room, p, 1)) {
                            roundEndedByShrink = true;
                            shrinkWinner = p;
                        }
                    }
                }
            }

            if (pairIdToRemove) {
                room.foods = room.foods.filter(f => f.pairId !== pairIdToRemove);
                markWorldDirty(room, 'foods');
            }

            if (ate) {
                // If it was a ruby burst food, or after beast mode ends, we spawn a new cycle food
                const isRubyBurstFood = room.foods.some(f => f.rubyBurst);
                if (!isRubyBurstFood) {
                    spawnFood(room);
                }
            }

            // Remove tail if not growing
            if (s.grow > 0) {
                s.grow--;
            } else {
                s.segments.pop();
            }

            // If this player is teleporting, decrement steps when they take a movement step
            if (room.mode === 'adventure' && room.teleportingOwner === p) {
                room.teleportStepsRemaining = Math.max(0, room.teleportStepsRemaining - 1);
                if (room.teleportStepsRemaining === 0) {
                    room.teleportingOwner = null;
                    room.attemptedPortalEntry = { p1: false, p2: false };
                    room.portalTimer = 15000;
                    anyMoved = true;
                }
            }

            s.acc -= stepInterval;
            if (s.acc > stepInterval) s.acc = stepInterval; // Prevent lag jump
        }
    });

    // Check if ruby burst foods expired (when beast mode ends)
    players.forEach(p => {
        const s = room.snakes[p];
        if (s && s.powerEnd > 0 && now > s.powerEnd) {
            s.powerEnd = 0;
            const hadRubyBurstFoods = room.foods.some(f => f.rubyBurst);
            if (hadRubyBurstFoods) {
                room.foods = room.foods.filter(f => !f.rubyBurst);
                markWorldDirty(room, 'foods');
                // Replenish standard food
                spawnFood(room);
            }
        }
    });

    // If a shrink killed someone, end round immediately
    if (roundEndedByShrink) {
        endRound(room, shrinkWinner);
        return;
    }

    // Check Self Area 51 win condition (length >= 51)
    if (room.mode === 'selfArea51') {
        const l1 = room.snakes.p1 ? room.snakes.p1.segments.length : 0;
        const l2 = room.snakes.p2 ? room.snakes.p2.segments.length : 0;
        if (l1 >= 51 && l2 >= 51) {
            endRound(room, 'draw');
            return;
        } else if (l1 >= 51) {
            endRound(room, 'p1');
            return;
        } else if (l2 >= 51) {
            endRound(room, 'p2');
            return;
        }
    }

    // Check collisions (Game Over / Round Over rules)
    let p1Dead = false;
    let p2Dead = false;

    const p1 = room.snakes.p1;
    const p2 = room.snakes.p2;

    if (p1 && p1.hitBarrier) p1Dead = true;
    if (p2 && p2.hitBarrier) p2Dead = true;

    const p1Head = p1.segments[0];
    const p2Head = p2.segments[0];

    const intangible1 = now < p1.powerEnd;
    const intangible2 = now < p2.powerEnd;

    // P1 self-collision (ignored if intangible)
    if (!intangible1) {
        for (let i = 1; i < p1.segments.length; i++) {
            if (p1Head.x === p1.segments[i].x && p1Head.y === p1.segments[i].y) {
                if (room.mode === 'selfArea51') {
                    p1.segments = p1.segments.slice(0, i);
                    break;
                } else {
                    p1Dead = true;
                }
            }
        }
    }
    // P2 self-collision (ignored if intangible)
    if (!intangible2) {
        for (let i = 1; i < p2.segments.length; i++) {
            if (p2Head.x === p2.segments[i].x && p2Head.y === p2.segments[i].y) {
                if (room.mode === 'selfArea51') {
                    p2.segments = p2.segments.slice(0, i);
                    break;
                } else {
                    p2Dead = true;
                }
            }
        }
    }

    // Cross-collision checks
    if (p1Head.x === p2Head.x && p1Head.y === p2Head.y) {
        if (!intangible1 && !intangible2) {
            const l1 = p1.segments.length;
            const l2 = p2.segments.length;
            if (l1 > l2) {
                p2Dead = true;
            } else if (l2 > l1) {
                p1Dead = true;
            } else {
                p1Dead = true;
                p2Dead = true;
            }
        }
    } else {
        // P1 colliding with P2 body (ignored if P1 is intangible)
        if (!intangible1) {
            for (let i = 0; i < p2.segments.length; i++) {
                if (p1Head.x === p2.segments[i].x && p1Head.y === p2.segments[i].y) {
                    p1Dead = true;
                }
            }
        }
        // P2 colliding with P1 body (ignored if P2 is intangible)
        if (!intangible2) {
            for (let i = 0; i < p1.segments.length; i++) {
                if (p2Head.x === p1.segments[i].x && p2Head.y === p1.segments[i].y) {
                    p2Dead = true;
                }
            }
        }
    }

    if (p1Dead && p2Dead) {
        endRound(room, 'draw');
    } else if (p1Dead) {
        endRound(room, 'p2');
    } else if (p2Dead) {
        endRound(room, 'p1');
    } else if (anyMoved) {
        // Only sync when state actually changed. Static world data is sent only when dirty.
        const payload = buildGameUpdatePayload(room, now);
        emitGameUpdate(room, payload, Date.now() - tickStartedAt);
    }
}

function endRound(room, winner) {
    room.state = 'roundOver';
    if (room.gameTimeout) {
        clearTimeout(room.gameTimeout);
        room.gameTimeout = null;
    }

    if (winner === 'p1') {
        room.scores.p1++;
    } else if (winner === 'p2') {
        room.scores.p2++;
    }

    // Matches end when a player reaches 5 round wins (matching local mode)
    const maxWins = (room.mode === 'selfArea51') ? 1 : 5;
    const isGameOver = room.scores.p1 >= maxWins || room.scores.p2 >= maxWins;

    io.to(room.id).emit('roundOver', {
        winner,
        scores: room.scores,
        isGameOver
    });

    if (isGameOver) {
        room.state = 'postGame';
        room.rematchVotes = {};
        room.rematchReadys = {};
        if (room.nextRoundTimer) clearTimeout(room.nextRoundTimer);
        schedulePostGameCleanup(room);
    } else {
        // Automatically start the next round in 4 seconds
        if (room.nextRoundTimer) clearTimeout(room.nextRoundTimer);
        room.nextRoundTimer = setTimeout(() => {
            if (rooms[room.id] && rooms[room.id].state === 'roundOver') {
                rooms[room.id].nextRoundTimer = null;
                initGameInRoom(rooms[room.id]);
            }
        }, 4000);
    }
}

function autoResumeRoom(room) {
    if (room.state !== 'paused') return;
    
    if (room.pauseTimer) clearInterval(room.pauseTimer);

    if (room.pauseStartTime) {
        const pauseDuration = Date.now() - room.pauseStartTime;
        if (room.selfArea51GreenSpawnAt) room.selfArea51GreenSpawnAt += pauseDuration;
        if (room.selfArea51GreenLastMove) room.selfArea51GreenLastMove += pauseDuration;
    }
    
    room.state = 'countdown';
    room.countdownValue = 3;
    io.to(room.id).emit('gameResumeCountdown', { countdownValue: room.countdownValue });

    let resumeCountdownInterval = setInterval(() => {
        if (!rooms[room.id]) {
            clearInterval(resumeCountdownInterval);
            return;
        }
        
        if (room.state !== 'countdown') {
            clearInterval(resumeCountdownInterval);
            return;
        }

        room.countdownValue--;
        if (room.countdownValue > 0) {
            io.to(room.id).emit('gameResumeCountdown', { countdownValue: room.countdownValue });
        } else {
            clearInterval(resumeCountdownInterval);
            room.state = 'playing';
            room.lastTickTime = Date.now();
            io.to(room.id).emit('gameStart');
            
            startGameLoop(room);
        }
    }, 1000);
}

function handleDisconnect(socket) {
    // 1. Check if user was in matchmaking
    matchmakingQueue.mobile = matchmakingQueue.mobile.filter(s => s.id !== socket.id);
    matchmakingQueue.pc = matchmakingQueue.pc.filter(s => s.id !== socket.id);

    // 2. Check if user was in a live game room
    for (const roomId in rooms) {
        const room = rooms[roomId];
        const isP1 = room.p1 && room.p1.id === socket.id;
        const isP2 = room.p2 && room.p2.id === socket.id;

        if (isP1 || isP2) {
            const remainingPlayer = isP1 ? room.p2 : room.p1;
            const disconnectedRole = isP1 ? 'p1' : 'p2';

            if (room.state === 'countdown' || room.state === 'playing' || room.state === 'roundOver' || room.state === 'paused') {
                // Trigger 15-second grace period
                room.previousState = room.state === 'paused' ? (room.previousState || 'playing') : room.state;
                room.state = 'paused';
                room.pauseStartTime = Date.now();
                if (room.gameTimeout) {
                    clearTimeout(room.gameTimeout);
                    room.gameTimeout = null;
                }
                if (room.pauseTimer) clearInterval(room.pauseTimer);
                if (room.nextRoundTimer) {
                    clearTimeout(room.nextRoundTimer);
                    room.nextRoundTimer = null;
                }

                io.to(room.id).emit('playerDisconnected', {
                    role: disconnectedRole,
                    gracePeriod: 15
                });

                // Set grace period timer
                room.graceTimer = setTimeout(() => {
                    if (rooms[roomId]) {
                        // Declare remaining player as winner
                        io.to(room.id).emit('gameOver', {
                            winner: isP1 ? 'p2' : 'p1',
                            reason: 'forfeit'
                        });
                        delete rooms[roomId];
                    }
                }, 15000);
            } else {
                // Simple lobby disconnect
                io.to(room.id).emit(room.state === 'postGame' || room.state === 'rematchWaiting' ? 'rematchOpponentLeft' : 'lobbyPartnerLeft');
                clearRoomTimers(room);
                delete rooms[roomId];
            }
            break;
        }
    }
}

// Socket.io listeners
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Dynamic Connection Ping
    socket.on('ping', () => {
        socket.emit('pong');
    });

    // Custom Room: Create
    socket.on('createRoom', (data) => {
        const platform = data.platform || 'mobile';
        const roomId = generateRoomId();
        const p1Name = normalizePlayerName(data.name, 'P1');
        const sessionToken = Math.random().toString(36).substring(2, 10);
        rooms[roomId] = {
            id: roomId,
            platform: platform,
            gridCols: platform === 'pc' ? 64 : 24,
            gridRows: data.requestedRows || 36,
            p1: { id: socket.id, name: p1Name, requestedRows: data.requestedRows, sessionToken },
            p2: null,
            mode: data.mode || 'normal',
            state: 'lobby',
            scores: { p1: 0, p2: 0 },
            pauseUsed: { p1: 0, p2: 0 },
            foods: [],
            snakes: {}
        };
        socket.join(roomId);
        socket.emit('roomCreated', { roomId, mode: data.mode, sessionToken });
    });

    // Custom Room: Join
    socket.on('joinRoom', (data) => {
        const platform = data.platform || 'mobile';
        const room = rooms[data.roomId];
        if (!room) {
            socket.emit('errorMsg', { message: 'Oda bulunamadı!' });
            return;
        }
        if (room.platform !== platform) {
            socket.emit('errorMsg', { message: 'Bu oda başka bir platformda (PC/Mobil) kurulmuş!' });
            return;
        }
        if (room.p2) {
            socket.emit('errorMsg', { message: 'Oda zaten dolu!' });
            return;
        }

        const p2Name = normalizePlayerName(data.name, 'P2');
        const sessionToken = Math.random().toString(36).substring(2, 10);
        room.p2 = { id: socket.id, name: p2Name, requestedRows: data.requestedRows, sessionToken };

        // Negotiate gridRows based on both players' requestedRows
        let negotiatedRows = 36;
        if (room.p1 && room.p1.requestedRows) {
            negotiatedRows = room.p1.requestedRows;
        }
        if (room.p2 && room.p2.requestedRows) {
            negotiatedRows = Math.min(negotiatedRows, room.p2.requestedRows);
        }
        room.gridRows = negotiatedRows;

        socket.join(room.id);
        socket.emit('roomJoined', { roomId: room.id, mode: room.mode, partnerName: room.p1.name, sessionToken });
        io.to(room.id).emit('partnerJoined', { partnerName: room.p2.name });

        // Automatically initialize game once partner enters custom lobi
        initGameInRoom(room);
    });

    // Matchmaking Request
    socket.on('joinMatchmaking', (data) => {
        const platform = data.platform || 'mobile';
        // Prevent double entries across all queues
        matchmakingQueue.mobile = matchmakingQueue.mobile.filter(s => s.id !== socket.id);
        matchmakingQueue.pc = matchmakingQueue.pc.filter(s => s.id !== socket.id);

        const cleanName = normalizePlayerName(data.name);
        matchmakingQueue[platform].push({ id: socket.id, socket, name: cleanName, requestedRows: data.requestedRows });

        if (matchmakingQueue[platform].length >= 2) {
            const p1Data = matchmakingQueue[platform].shift();
            const p2Data = matchmakingQueue[platform].shift();

            const p1Name = p1Data.name ? p1Data.name : 'P1';
            const p2Name = p2Data.name ? p2Data.name : 'P2';

            let negotiatedRows = 36;
            if (p1Data.requestedRows) {
                negotiatedRows = p1Data.requestedRows;
            }
            if (p2Data.requestedRows) {
                negotiatedRows = Math.min(negotiatedRows, p2Data.requestedRows);
            }

            const p1SessionToken = Math.random().toString(36).substring(2, 10);
            const p2SessionToken = Math.random().toString(36).substring(2, 10);
            const roomId = generateRoomId();
            rooms[roomId] = {
                id: roomId,
                platform: platform,
                gridCols: platform === 'pc' ? 64 : 24,
                gridRows: negotiatedRows,
                p1: { id: p1Data.id, name: p1Name, requestedRows: p1Data.requestedRows, sessionToken: p1SessionToken },
                p2: { id: p2Data.id, name: p2Name, requestedRows: p2Data.requestedRows, sessionToken: p2SessionToken },
                mode: 'fastCompetitive', // Random matchmaking is locked to Fast Competitive
                state: 'lobby',
                scores: { p1: 0, p2: 0 },
                pauseUsed: { p1: 0, p2: 0 },
                foods: [],
                snakes: {}
            };

            p1Data.socket.join(roomId);
            p2Data.socket.join(roomId);

            p1Data.socket.emit('matchFound', { roomId, role: 'p1', partnerName: p2Name, sessionToken: p1SessionToken });
            p2Data.socket.emit('matchFound', { roomId, role: 'p2', partnerName: p1Name, sessionToken: p2SessionToken });

            // Initialize game
            initGameInRoom(rooms[roomId]);
        }
    });

    // Cancel Matchmaking
    socket.on('leaveMatchmaking', () => {
        matchmakingQueue.mobile = matchmakingQueue.mobile.filter(s => s.id !== socket.id);
        matchmakingQueue.pc = matchmakingQueue.pc.filter(s => s.id !== socket.id);
    });

    socket.on('leaveRoom', (data) => {
        const room = rooms[data.roomId];
        if (!room) return;

        const isPostGame = room.state === 'postGame' || room.state === 'rematchWaiting';
        clearRoomTimers(room);
        socket.leave(room.id);
        io.to(room.id).emit(isPostGame ? 'rematchOpponentLeft' : 'lobbyPartnerLeft');
        delete rooms[room.id];
    });

    socket.on('rematchIntent', (data) => {
        const room = rooms[data.roomId];
        if (!room || (room.state !== 'postGame' && room.state !== 'rematchWaiting')) {
            socket.emit('rematchFailed');
            return;
        }

        const role = getRoomRole(room, socket);
        if (!role) {
            socket.emit('rematchFailed');
            return;
        }

        room.state = 'rematchWaiting';
        room.rematchVotes = room.rematchVotes || {};
        room.rematchVotes[role] = true;

        const otherRole = role === 'p1' ? 'p2' : 'p1';
        const otherPlayer = room[otherRole];
        if (otherPlayer) {
            io.to(otherPlayer.id).emit('opponentRematchIntent', { role: role });
        }

        if (room.rematchTimer) clearTimeout(room.rematchTimer);
        room.rematchTimer = setTimeout(() => {
            const currentRoom = rooms[data.roomId];
            if (!currentRoom || currentRoom.state !== 'rematchWaiting') return;

            const waitingRoles = Object.keys(currentRoom.rematchVotes || {}).filter(r => currentRoom.rematchVotes[r]);
            waitingRoles.forEach(waitingRole => {
                const player = currentRoom[waitingRole];
                if (player) io.to(player.id).emit('rematchTimeout');
            });

            currentRoom.rematchVotes = {};
            currentRoom.rematchReadys = {};
            currentRoom.state = 'postGame';
            currentRoom.rematchTimer = null;
            schedulePostGameCleanup(currentRoom);
        }, REMATCH_WAIT_SECONDS * 1000);
    });

    socket.on('rematchReady', (data) => {
        const room = rooms[data.roomId];
        if (!room || (room.state !== 'postGame' && room.state !== 'rematchWaiting')) {
            socket.emit('rematchFailed');
            return;
        }

        const role = getRoomRole(room, socket);
        if (!role) {
            socket.emit('rematchFailed');
            return;
        }

        room.rematchReadys = room.rematchReadys || {};
        room.rematchReadys[role] = true;

        // Ensure votes map is also updated
        room.rematchVotes = room.rematchVotes || {};
        room.rematchVotes[role] = true;

        if (room.rematchReadys.p1 && room.rematchReadys.p2) {
            if (room.rematchTimer) clearTimeout(room.rematchTimer);
            room.rematchTimer = null;
            io.to(room.id).emit('rematchStart');
            resetRoomForRematch(room);
            initGameInRoom(room);
            return;
        }

        socket.emit('waitingForPartnerReady', { seconds: REMATCH_WAIT_SECONDS });
    });

    socket.on('cancelRematch', (data) => {
        const room = rooms[data.roomId];
        if (!room || (room.state !== 'postGame' && room.state !== 'rematchWaiting')) return;

        const role = getRoomRole(room, socket);
        if (!role) return;

        if (room.rematchVotes) room.rematchVotes[role] = false;
        if (room.rematchReadys) room.rematchReadys[role] = false;

        if (!room.rematchVotes || (!room.rematchVotes.p1 && !room.rematchVotes.p2)) {
            if (room.rematchTimer) clearTimeout(room.rematchTimer);
            room.rematchTimer = null;
            room.state = 'postGame';
            schedulePostGameCleanup(room);
        }
    });

    // Direction input handler
    socket.on('directionChange', (data) => {
        const room = rooms[data.roomId];
        if (!room || room.state !== 'playing') return;

        const role = room.p1.id === socket.id ? 'p1' : (room.p2 && room.p2.id === socket.id ? 'p2' : null);
        if (!role) return;

        const s = room.snakes[role];
        const newDir = data.direction; // 'up', 'down', 'left', 'right'
        
        let targetVector;
        if (newDir === 'up') targetVector = { x: 0, y: -1 };
        else if (newDir === 'down') targetVector = { x: 0, y: 1 };
        else if (newDir === 'left') targetVector = { x: -1, y: 0 };
        else if (newDir === 'right') targetVector = { x: 1, y: 0 };

        // Prevent reversing into oneself
        if (targetVector && !oppositeDirection(targetVector, s.dir)) {
            s.nextDir = targetVector;
        }
    });

    // Fast Competitive dash/boost request
    socket.on('requestDash', (data) => {
        const room = rooms[data.roomId];
        if (!room || room.state !== 'playing' || room.mode !== 'fastCompetitive') return;

        const role = room.p1.id === socket.id ? 'p1' : (room.p2 && room.p2.id === socket.id ? 'p2' : null);
        if (!role) return;

        const s = room.snakes[role];
        if (!s || !s.segments || s.segments.length <= 1) return;

        const now = Date.now();
        if (now < (s.dashCooldown || 0)) return;

        s.dashEndTime = now + 250;
        s.dashCooldown = now + 3000;
        s.segments.pop();
        s.flashUntil = now + 250;
        s.flashColor = '#ffffff';
        io.to(room.id).emit('soundEffect', { effect: 'whoosh' });
    });

    // Handle manual pause request
    socket.on('requestPause', (data) => {
        const room = rooms[data.roomId];
        if (!room || room.state !== 'playing') return;

        const role = room.p1.id === socket.id ? 'p1' : (room.p2 && room.p2.id === socket.id ? 'p2' : null);
        if (!role) return;

        // Check limit: max 2 pauses per player per match
        if (room.pauseUsed[role] >= 2) {
            socket.emit('errorMsg', { message: 'Tüm duraklatma haklarınızı kullandınız!' });
            return;
        }

        // Apply pause
        room.pauseUsed[role]++;
        room.previousState = room.state;
        room.state = 'paused';
        room.pausedBy = role;
        room.pauseStartTime = Date.now();
        room.pauseTimeLeft = 15;
        if (room.gameTimeout) {
            clearTimeout(room.gameTimeout);
            room.gameTimeout = null;
        }

        io.to(room.id).emit('gamePaused', {
            pausedBy: role,
            timeLeft: room.pauseTimeLeft,
            pauseUsed: room.pauseUsed
        });

        if (room.pauseTimer) clearInterval(room.pauseTimer);
        room.pauseTimer = setInterval(() => {
            if (!rooms[room.id] || room.state !== 'paused' || room.pausedBy !== role) {
                clearInterval(room.pauseTimer);
                return;
            }
            room.pauseTimeLeft--;
            io.to(room.id).emit('gamePauseTick', { timeLeft: room.pauseTimeLeft });

            if (room.pauseTimeLeft <= 0) {
                clearInterval(room.pauseTimer);
                autoResumeRoom(room);
            }
        }, 1000);
    });

    // Handle manual resume request (only pauser can resume early)
    socket.on('requestResume', (data) => {
        const room = rooms[data.roomId];
        if (!room || room.state !== 'paused') return;

        const role = room.p1.id === socket.id ? 'p1' : (room.p2 && room.p2.id === socket.id ? 'p2' : null);
        if (!role) return;

        if (room.pausedBy !== role) {
            socket.emit('errorMsg', { message: 'Oyunu sadece duraklatan oyuncu başlatabilir!' });
            return;
        }

        autoResumeRoom(room);
    });

    // Handle game forfeit (exit during pause or play)
    socket.on('forfeitGame', (data) => {
        const room = rooms[data.roomId];
        if (!room) return;

        const role = room.p1.id === socket.id ? 'p1' : (room.p2 && room.p2.id === socket.id ? 'p2' : null);
        if (!role) return;

        const opponent = role === 'p1' ? 'p2' : 'p1';

        // Clear intervals
        if (room.gameTimeout) {
            clearTimeout(room.gameTimeout);
            room.gameTimeout = null;
        }
        if (room.pauseTimer) clearInterval(room.pauseTimer);
        if (room.graceTimer) clearTimeout(room.graceTimer);
        if (room.nextRoundTimer) clearTimeout(room.nextRoundTimer);

        // Instantly award maxWins to opponent (adjusting for endRound increment)
        const maxWins = (room.mode === 'selfArea51') ? 1 : 5;
        room.scores[opponent] = maxWins - 1;

        endRound(room, opponent);
    });

    // Handle Client Pause / Reconnection triggers
    socket.on('reconnectToGame', (data) => {
        const room = rooms[data.roomId];
        if (!room) {
            socket.emit('errorMsg', { message: 'Oyun odası bulunamadı veya süre doldu.' });
            socket.emit('gameOver', { winner: null, reason: 'timeout' });
            return;
        }

        let isP1 = room.p1 && room.p1.id === socket.id;
        let isP2 = room.p2 && room.p2.id === socket.id;

        // Support new socket connection associating with existing role (validated via sessionToken)
        if (!isP1 && !isP2 && data.role && data.sessionToken) {
            if (data.role === 'p1' && room.p1 && room.p1.sessionToken === data.sessionToken) {
                room.p1.id = socket.id;
                isP1 = true;
            } else if (data.role === 'p2' && room.p2 && room.p2.sessionToken === data.sessionToken) {
                room.p2.id = socket.id;
                isP2 = true;
            }
        }

        if (isP1 || isP2) {
            clearTimeout(room.graceTimer); // Stop disconnect countdown
            socket.join(room.id);
            
            // Restore state
            const stateToRestore = room.previousState || 'playing';
            
            io.to(room.id).emit('playerReconnected', { role: isP1 ? 'p1' : 'p2', restoredState: stateToRestore });
            
            // Restart game loop or trigger resume countdown if we restored to playing state
            if (stateToRestore === 'playing') {
                room.state = 'paused'; // Temporarily pause to let autoResumeRoom trigger countdown
                autoResumeRoom(room);
            } else {
                room.state = stateToRestore;
                if (stateToRestore === 'roundOver') {
                    if (room.nextRoundTimer) clearTimeout(room.nextRoundTimer);
                    room.nextRoundTimer = setTimeout(() => {
                        if (rooms[room.id] && rooms[room.id].state === 'roundOver') {
                            rooms[room.id].nextRoundTimer = null;
                            initGameInRoom(rooms[room.id]);
                        }
                    }, 1200);
                }
            }
        } else {
            socket.emit('errorMsg', { message: 'Bağlantı doğrulanamadı (geçersiz kimlik bilgisi).' });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        handleDisconnect(socket);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
