// Injected ONLY by the loopback test preview into the game's closure.
window.layoutTest = {
    start(kind, roomId) {
        socket = io(window.__layoutServer, { transports: ['websocket'] });
        setupSocketListeners();
        socket.on('gameInit', () => {
            window.layoutTest.firstFrame = window.layoutTest.snapshot();
        });
        socket.on('gameStart', () => {
            window.layoutTest.starts = (window.layoutTest.starts || 0) + 1;
            if (myRole === 'p1') socket.emit('requestPause', { roomId: onlineRoomId });
        });
        socket.on('gamePaused', () => { window.layoutTest.pauses = (window.layoutTest.pauses || 0) + 1; });
        socket.on('gameResumeCountdown', () => { window.layoutTest.resuming = true; });
        socket.on('playerReconnected', () => { window.layoutTest.reconnected = true; });
        socket.on('connect', () => {
            const requestedRows = getLocalOptimalRows();
            if (kind === 'create') socket.emit('createRoom', { name: 'Layout P1', mode: 'normal', platform: 'mobile', requestedRows });
            else if (kind === 'join') socket.emit('joinRoom', { roomId, name: 'Layout P2', platform: 'mobile', requestedRows });
            else socket.emit('joinMatchmaking', { name: 'Layout Player', platform: 'mobile', requestedRows });
        });
    },
    snapshot() {
        const r = document.getElementById('stage').getBoundingClientRect();
        const control = document.getElementById('p1-controls').getBoundingClientRect();
        const first = getCellCoords(0, 0), last = getCellCoords(GRID_COLS, GRID_ROWS);
        return { online: isOnlineMode, rows: GRID_ROWS, cols: GRID_COLS, room: onlineRoomId,
            role: myRole, requested: getLocalOptimalRows(),
            area: onlineViewport && { ...onlineViewport },
            board: { left: first.x, top: first.y, right: last.x, bottom: last.y, cellX: first.szX, cellY: first.szY },
            stage: { x: r.x, y: r.y, width: r.width, height: r.height },
            controls: { top: control.top, bottom: control.bottom, height: control.height },
            hudItems: [...document.querySelectorAll('#p1-controls .player-stat-panel > *, #p1-controls .dpad-btn')]
                .filter(el => el.getClientRects().length && getComputedStyle(el).display !== 'none')
                .map(el => { const r = el.getBoundingClientRect(); const p = (el.closest('.player-stat-panel') || document.getElementById('p1-controls')).getBoundingClientRect();
                    return { id: el.id || el.className, top: r.top, bottom: r.bottom, left: r.left, right: r.right, height: r.height,
                        container: { top: p.top, bottom: p.bottom, left: p.left, right: p.right } }; }),
            buffer: { width: canvas.width, height: canvas.height }, layout: p1ControlLayout };
    },
    measureRestore() {
        const before = document.getElementById('p1-controls').outerHTML + document.getElementById('p2-controls').outerHTML;
        const rows = getLocalOptimalRows();
        const after = document.getElementById('p1-controls').outerHTML + document.getElementById('p2-controls').outerHTML;
        return { same: before === after, rows };
    },
    setLayout(layout) { applyPlayerControlLayout('p1', layout); },
    pauseUI() {
        const modal = document.getElementById('controlsModalOverlay');
        const bounds = el => { const r = el.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, height: r.height }; };
        return { active: modal.classList.contains('active'), tabs: getComputedStyle(document.getElementById('ctrlPlayerTabs')).display,
            swipe: getComputedStyle(document.getElementById('ctrlSwipeRow')).display, role: myRole,
            exit: !!document.getElementById('btnOnlineForfeit'), controls: !!document.getElementById('btnOnlineControls'),
            resume: !!document.getElementById('btnOnlineResume'), time: onlinePauseState?.timeLeft,
            layout: p1ControlLayout, banner: banner.className, opacity: getComputedStyle(banner).opacity, inert: banner.inert,
            main: !!document.getElementById('menuPlay'), online: isOnlineMode,
            bannerBounds: bounds(banner), stageBounds: bounds(document.getElementById('stage')),
            modalBounds: bounds(modal.querySelector('.controls-modal-card')), viewportHeight: innerHeight };
    },
    openControls() { document.getElementById('btnOnlineControls').click(); },
    chooseControls(layout) { document.getElementById(layout === 'dpad' ? 'ctrlOptDpad' : 'ctrlOptTwoBtn').click(); },
    closeControls() { document.getElementById('ctrlModalConfirmBtn').click(); },
    leave() { document.getElementById('btnOnlineForfeit').click(); },
    menuForward() { document.getElementById('menuPlay').click(); },
    menuBack() { document.getElementById('btnPlaySplitBack').click(); },
    samplePanels(text) {
        for (const id of ['p1PanelName', 'p1OpponentName']) document.getElementById(id).textContent = text;
        for (const id of ['p1PanelLen', 'p1OpponentLen']) {
            const element = document.getElementById(id); if (element) element.textContent = '999';
        }
        scheduleCanvasResize();
    },
    resume() { socket.emit('requestResume', { roomId: onlineRoomId }); },
    reconnect() {
        socket.disconnect();
        socket.once('connect', () => socket.emit('reconnectToGame', {
            roomId: onlineRoomId, role: myRole, sessionToken: onlineSessionToken
        }));
        socket.connect();
    },
    edges() {
        // Freeze only this test client so server packets cannot overwrite the edge sample.
        socket.removeAllListeners();
        socket.disconnect();
        paused = true; inCountdown = false; intermission = true;
        hideBanner();
        document.getElementById('canvasWrap').classList.remove('paused-blur');
        const p1 = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }];
        const p2 = [{ x: 23, y: GRID_ROWS - 1 }, { x: 22, y: GRID_ROWS - 1 }, { x: 21, y: GRID_ROWS - 1 }, { x: 20, y: GRID_ROWS - 1 }];
        snakes.p1.segments = p1; snakes.p1.prev = p1;
        snakes.p2.segments = p2; snakes.p2.prev = p2;
        render(1, 1);
    }
};
