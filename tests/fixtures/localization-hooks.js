// Injected only into the loopback preview, within the actual game closure.
window.localizationPreview = {
  locales: langCycle,
  show(locale, screen) {
    cleanupOnlineGame();
    for (const id of ['onlineAlertOverlay', 'onlineDialogOverlay', 'onlinePauseOverlay']) document.getElementById(id)?.remove();
    lang = locale;
    applyLang();
    if (typeof injectOnlineStyles === 'function') injectOnlineStyles();
    isOnlineMode = true; myRole = 'p1'; paused = true; gameMode = '2P';
    if (typeof isDemoMode !== 'undefined') isDemoMode = false;
    updateUIVisibility();
    if (typeof scheduleCanvasResize === 'function') scheduleCanvasResize();
    if (screen === 'pause' || screen === 'opponent' || screen === 'controls') {
      showOnlinePauseMenu(screen === 'opponent' ? 'p2' : 'p1', 7);
      if (screen === 'controls' && typeof openControlsModal === 'function') openControlsModal('p1', 'online-pause');
    } else if (screen === 'error') {
      showOnlineAlert(t('onlineRoomNotFound'));
    } else if (screen === 'disconnect') {
      showBanner(`<h2>${t('onlineOpponentDisconnectedTitle')}</h2><p>${t('onlineOpponentDisconnectedText', { seconds: 8 })}</p>`, true, 'winner-glass-banner');
    } else if (screen === 'reconnect') {
      showBanner(`<h2>${t('onlineReconnectTitle')}</h2><p>${t('onlineReconnectText')}</p>`, true, 'winner-glass-banner');
    } else if (screen === 'rematch' || screen === 'ad') {
      showOnlineRematchWaiting(20, screen === 'ad');
    } else if (screen === 'menu') openOnlineMenu();
    return this.snapshot();
  },
  snapshot() {
    const controls = document.querySelector('.controls-modal-overlay.active .controls-modal-card');
    const root = controls || document.querySelector('.online-alert-card, #onlineDialogOverlay > div, .online-pause-card') || document.getElementById('banner');
    const rect = root.getBoundingClientRect();
    return { lang, dir: document.documentElement.dir, text: root.innerText, width: innerWidth, height: innerHeight,
      scrollWidth: root.scrollWidth, clientWidth: root.clientWidth,
      bounds: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom },
      controls: [...root.querySelectorAll('button')].filter(el => el.getClientRects().length).map(el => (() => {
        const bounds=el.getBoundingClientRect(), walker=document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        const rects=[];let node;
        while((node=walker.nextNode())) if(node.textContent.trim()){
          const range=document.createRange();range.selectNodeContents(node);
          rects.push(...range.getClientRects());
        }
        return { text: el.innerText, textFits: rects.every(r=>r.left>=bounds.left-1&&r.right<=bounds.right+1&&r.top>=bounds.top-1&&r.bottom<=bounds.bottom+1) };
      })()) };
  }
};
