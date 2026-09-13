const { io } = require('socket.io-client');

const SERVER_URL = 'http://localhost:3000';

console.log('Connecting simulated players to:', SERVER_URL);

const client1 = io(SERVER_URL, { forceNew: true, transports: ['websocket'] });
const client2 = io(SERVER_URL, { forceNew: true, transports: ['websocket'] });

let room = null;
let c1Role = null;
let c2Role = null;

function setupClient(client, name) {
    client.on('connect', () => {
        console.log(`[${name}] Connected to server as ID:`, client.id);
    });

    client.on('matchFound', (data) => {
        console.log(`[${name}] Match Found! Room ID: ${data.roomId}, Role: ${data.role}, Partner: ${data.partnerName}`);
        room = data.roomId;
        if (name === 'Player 1') c1Role = data.role;
        else c2Role = data.role;
    });

    client.on('gameInit', (data) => {
        console.log(`[${name}] gameInit received. State: ${data.state}, Mode: ${data.mode}, Countdown: ${data.countdownValue}`);
    });

    client.on('countdownTick', (data) => {
        console.log(`[${name}] countdownTick received. Countdown: ${data.countdownValue}`);
    });

    client.on('gameStart', (data) => {
        console.log(`[${name}] gameStart received. State: ${data.state}`);
    });

    client.on('gameUpdate', (data) => {
        console.log(`[${name}] gameUpdate received. Timer: ${data.roundTimer.toFixed(2)}, Snakes P1 segments: ${data.snakes.p1.segments.length}, P2 segments: ${data.snakes.p2.segments.length}`);
    });

    client.on('roundOver', (data) => {
        console.log(`[${name}] roundOver received! Winner: ${data.winner}, Scores: P1 [${data.scores.p1}] - P2 [${data.scores.p2}], isGameOver: ${data.isGameOver}`);
    });

    client.on('gameOver', (data) => {
        console.log(`[${name}] gameOver received! Winner: ${data.winner}, Reason: ${data.reason}`);
    });

    client.on('errorMsg', (data) => {
        console.log(`[${name}] errorMsg received:`, data.message);
    });

    client.on('disconnect', () => {
        console.log(`[${name}] Disconnected.`);
    });
}

setupClient(client1, 'Player 1');
setupClient(client2, 'Player 2');

setTimeout(() => {
    console.log('\n--- Joining Matchmaking ---');
    client1.emit('joinMatchmaking', { name: 'Ahmet' });
    client2.emit('joinMatchmaking', { name: 'Mehmet' });
}, 1000);

// Stop test after 15 seconds
setTimeout(() => {
    console.log('\n--- Stopping Test ---');
    client1.disconnect();
    client2.disconnect();
    process.exit(0);
}, 15000);
