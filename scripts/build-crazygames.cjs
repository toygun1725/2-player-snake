const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcPath = path.resolve(__dirname, '../Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.5.3.html');
const outDir = path.resolve(__dirname, '../Ana Dosya/CrazyGames');
const outHtmlPath = path.join(outDir, 'index.html');
const outZipPath = path.join(outDir, '2playersnake-crazygames.zip');
const logoSrcPath = path.resolve(__dirname, '../Görsel/Logo/v3/2 Player Snake Logo v3 no bg 500px web.webp');
const logoOutPath = path.join(outDir, 'logo.webp');

console.log('Reading source PC file:', srcPath);
let content = fs.readFileSync(srcPath, 'utf8');

// Ensure outDir exists
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Ensure logo.webp is copied
if (fs.existsSync(logoSrcPath)) {
  fs.copyFileSync(logoSrcPath, logoOutPath);
  console.log('Copied logo.webp to CrazyGames dir.');
}

// 1. Replace AdSense H5 Games script with CrazyGames SDK v3 & iframe defenses
const adBlockOld = `  <!-- Google AdSense for Games (H5 Games Ads) -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4114535776207741"
    crossorigin="anonymous" data-ad-frequency-hint="30s"></script>
  <script>
    window.adsbygoogle = window.adsbygoogle || [];
    window.__h5GamesAdsReady = false;
    var adBreak = adConfig = function (o) { adsbygoogle.push(o); }
    // Initialize H5 Games Ads
    adConfig({
      preloadAdBreaks: 'on',
      sound: 'on',
      onReady: () => {
        window.__h5GamesAdsReady = true;
        console.log('AdSense H5 Games Ads ready.');
      }
    });
  </script>`;

const crazyGamesSdkHeader = `  <!-- CrazyGames SDK v3 & Sandboxed Iframe Resilience -->
  <script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>
  <script>
    // 1. Safe localStorage wrapper to prevent iframe SecurityError in restrictive sandboxes
    (function() {
      var isAvailable = false;
      try {
        var testKey = '__cg_test__';
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
        isAvailable = true;
      } catch (e) {
        isAvailable = false;
      }
      if (!isAvailable) {
        var memoryStorage = {};
        var mockStorage = {
          getItem: function(k) { return Object.prototype.hasOwnProperty.call(memoryStorage, k) ? memoryStorage[k] : null; },
          setItem: function(k, v) { memoryStorage[k] = String(v); },
          removeItem: function(k) { delete memoryStorage[k]; },
          clear: function() { Object.keys(memoryStorage).forEach(function(k) { delete memoryStorage[k]; }); }
        };
        try {
          Object.defineProperty(window, 'localStorage', { value: mockStorage, configurable: true, writable: true });
        } catch (e) {}
      }
    })();

    // 2. Ensure iframe grabs keyboard focus immediately upon interaction
    window.addEventListener('pointerdown', function() {
      try { window.focus(); } catch (e) {}
    }, { passive: true });

    // 3. CrazyGames SDK v3 Initialization and Adblock detection
    window.__crazyGamesReady = false;
    window.__crazyGamesInitPromise = null;
    window.__crazyGamesAdblockActive = false;

    async function initCrazyGames() {
      if (!window.CrazyGames || !window.CrazyGames.SDK) {
        console.warn('CrazyGames SDK not found.');
        return false;
      }
      if (window.__crazyGamesInitPromise) return window.__crazyGamesInitPromise;
      window.__crazyGamesInitPromise = window.CrazyGames.SDK.init()
        .then(async () => {
          window.__crazyGamesReady = true;
          console.log('CrazyGames SDK v3 initialized successfully.');
          try {
            if (window.CrazyGames.SDK.ad && typeof window.CrazyGames.SDK.ad.hasAdblock === 'function') {
              window.__crazyGamesAdblockActive = await window.CrazyGames.SDK.ad.hasAdblock();
            }
          } catch (e) {
            window.__crazyGamesAdblockActive = false;
          }
          return true;
        })
        .catch((err) => {
          console.warn('CrazyGames SDK init failed:', err);
          return false;
        });
      return window.__crazyGamesInitPromise;
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => { initCrazyGames(); });
    } else {
      initCrazyGames();
    }
    window.addEventListener('load', () => {
      if (!window.__crazyGamesReady) initCrazyGames();
    });
  </script>`;

if (!content.includes(adBlockOld)) {
  console.error('ERROR: Could not find exact AdSense header block!');
  process.exit(1);
}
content = content.replace(adBlockOld, crazyGamesSdkHeader);

// 2. Update page title
content = content.replace('<title>2 Player Snake | v3.5.3</title>', '<title>2 Player Snake</title>');

// 3. Update image sources to use bundled logo.webp with fallback
content = content.replace(
  /<img class="splash-logo"[^>]*>/,
  '<img class="splash-logo" src="logo.webp" alt="2 Player Snake" onerror="this.onerror=null;this.src=\'https://2playersnake.com/wp-content/uploads/2026/04/2-Player-Snake-Logo-v3-no-bg-500px-web.webp\';">'
);

content = content.replace(
  /<img class="main-menu-logo"[^>]*>/g,
  '<img class="main-menu-logo" src="logo.webp" alt="2 Player Snake logo" onerror="this.onerror=null;this.src=\'https://2playersnake.com/wp-content/uploads/2026/04/2-Player-Snake-Logo-v3-no-bg-500px-web.webp\';">'
);

// 4. Tone function - add adAudioMuted check
const oldToneCheck = `function tone(freq, dur, { type = 'square', gain = 0.06, attack = 0.004, release = 0.06, sweep = 0, force = false } = {}) {
        if (muted) return; if (!force && typeof isDemoMode !== 'undefined' && isDemoMode) return; try {`;

const newToneCheck = `function tone(freq, dur, { type = 'square', gain = 0.06, attack = 0.004, release = 0.06, sweep = 0, force = false } = {}) {
        if (muted || (typeof adAudioMuted !== 'undefined' && adAudioMuted)) return; if (!force && typeof isDemoMode !== 'undefined' && isDemoMode) return; try {`;

if (!content.includes(oldToneCheck)) {
  console.error('ERROR: Could not find tone function check!');
  process.exit(1);
}
content = content.replace(oldToneCheck, newToneCheck);

// 5. CrazyGames gameplay and audio helper functions + syncAdSoundConfig
const oldSyncSound = `      function syncAdSoundConfig() {
        if (typeof adConfig !== 'function') return;
        try {
          adConfig({ sound: muted ? 'off' : 'on' });
        } catch (err) {
          console.warn('Ad sound sync failed:', err);
        }
      }`;

const newSyncSound = `      function crazyGamesGameplayStart() {
        try {
          if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.game) {
            window.CrazyGames.SDK.game.gameplayStart();
          }
        } catch (err) {
          console.warn('CrazyGames gameplayStart error:', err);
        }
      }

      function crazyGamesGameplayStop() {
        try {
          if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.game) {
            window.CrazyGames.SDK.game.gameplayStop();
          }
        } catch (err) {
          console.warn('CrazyGames gameplayStop error:', err);
        }
      }

      let adAudioMuted = false;
      function muteGameAudioForAd() {
        adAudioMuted = true;
        try {
          if (audioCtx && audioCtx.state === 'running') {
            audioCtx.suspend().catch(() => {});
          }
        } catch (e) {}
      }

      function unmuteGameAudioAfterAd() {
        adAudioMuted = false;
        window._adJustFinished = true;
        resumeAudioContext();
        setTimeout(resumeAudioContext, 150);
        setTimeout(resumeAudioContext, 400);
      }

      function syncAdSoundConfig() {
        // No-op for CrazyGames: audio muting is managed via muteGameAudioForAd / unmuteGameAudioAfterAd
      }`;

if (!content.includes(oldSyncSound)) {
  console.error('ERROR: Could not find syncAdSoundConfig block!');
  process.exit(1);
}
content = content.replace(oldSyncSound, newSyncSound);

// 6. AdManager.isSdkReady
const oldIsSdkReady = `        isSdkReady() {
          return !!window.__h5GamesAdsReady && typeof adBreak === 'function';
        },`;

const newIsSdkReady = `        isSdkReady() {
          return !!(window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.ad);
        },`;

if (!content.includes(oldIsSdkReady)) {
  console.error('ERROR: Could not find isSdkReady block!');
  process.exit(1);
}
content = content.replace(oldIsSdkReady, newIsSdkReady);

// 7. AdManager.showInterstitial with safety timer and await init
const oldShowInterstitial = `        showInterstitial({ type, name, recordKind, onDone }) {
          if (!this.isSdkReady() || this.adInProgress || this.isGlobalCooldownActive()) {
            if (onDone) onDone();
            return;
          }

          this.adInProgress = true;
          let adShown = false;
          let finished = false;

          const finish = () => {
            if (finished) return;
            finished = true;
            this.adInProgress = false;
            if (onDone) onDone();
          };

          try {
            adBreak({
              type,
              name,
              beforeAd: () => {
                adShown = true;
                paused = true;
                intermission = true;
                syncAdSoundConfig();
              },
              afterAd: () => {
                if (adShown) this.recordAdShown(recordKind);
                syncAdSoundConfig();
                window._adJustFinished = true;
                resumeAudioContext();
              },
              adBreakDone: () => {
                window._adJustFinished = true;
                resumeAudioContext();
                setTimeout(resumeAudioContext, 150);
                setTimeout(resumeAudioContext, 400);
                finish();
              }
            });
          } catch (err) {
            console.warn('Interstitial ad failed:', err);
            resumeAudioContext();
            finish();
          }
        },`;

const newShowInterstitial = `        async showInterstitial({ type, name, recordKind, onDone }) {
          if (!this.isSdkReady() || this.adInProgress || this.isGlobalCooldownActive()) {
            if (onDone) onDone();
            return;
          }

          this.adInProgress = true;
          let adShown = false;
          let finished = false;
          let safetyTimer = null;

          const finish = () => {
            if (finished) return;
            finished = true;
            if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
            this.adInProgress = false;
            unmuteGameAudioAfterAd();
            if (onDone) onDone();
          };

          // 8.5s fallback safety timer in case SDK or network hangs
          safetyTimer = setTimeout(() => {
            if (!adShown && !finished) {
              console.warn('CrazyGames midgame ad request timeout.');
              finish();
            }
          }, 8500);

          if (window.__crazyGamesInitPromise) {
            try {
              await Promise.race([
                window.__crazyGamesInitPromise,
                new Promise(resolve => setTimeout(resolve, 3000))
              ]);
            } catch (e) {}
          }

          crazyGamesGameplayStop();
          muteGameAudioForAd();

          const callbacks = {
            adStarted: () => {
              adShown = true;
              paused = true;
              intermission = true;
              muteGameAudioForAd();
              if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
            },
            adFinished: () => {
              if (adShown) this.recordAdShown(recordKind);
              finish();
            },
            adError: (error) => {
              console.warn('CrazyGames midgame ad error:', error);
              finish();
            }
          };

          try {
            window.CrazyGames.SDK.ad.requestAd("midgame", callbacks);
          } catch (err) {
            console.warn('CrazyGames requestAd exception:', err);
            finish();
          }
        },`;

if (!content.includes(oldShowInterstitial)) {
  console.error('ERROR: Could not find showInterstitial block!');
  process.exit(1);
}
content = content.replace(oldShowInterstitial, newShowInterstitial);

// 8. AdManager.canOfferRewardedContinue with resolved adblock flag
const oldCanOfferRewarded = `        canOfferRewardedContinue() {
          return gameMode === '1P' &&
            aiSnakeEnabled &&
            !this.rewardedUsedThisMatch &&
            !this.adInProgress &&
            !this.isGlobalCooldownActive() &&
            this.isSdkReady() &&
            this.rewardSnapshots.length > 0;
        },`;

const newCanOfferRewarded = `        canOfferRewardedContinue() {
          const adblockActive = !!window.__crazyGamesAdblockActive;
          return gameMode === '1P' &&
            aiSnakeEnabled &&
            !this.rewardedUsedThisMatch &&
            !this.adInProgress &&
            !this.isGlobalCooldownActive() &&
            this.isSdkReady() &&
            !adblockActive &&
            this.rewardSnapshots.length > 0;
        },`;

if (!content.includes(oldCanOfferRewarded)) {
  console.error('ERROR: Could not find canOfferRewardedContinue block!');
  process.exit(1);
}
content = content.replace(oldCanOfferRewarded, newCanOfferRewarded);

// 9. AdManager.requestRewardedContinue with safety timer and await init
const oldRequestRewarded = `        requestRewardedContinue() {
          if (!this.canOfferRewardedContinue()) return;

          this.adInProgress = true;
          let rewardFlowAvailable = false;
          let rewardSettled = false;

          const failReward = (message) => {
            this.adInProgress = false;
            this.finalizePendingLoss(message);
          };

          try {
            adBreak({
              type: 'reward',
              name: 'ai_continue',
              beforeAd: () => { paused = true; intermission = true; syncAdSoundConfig('off'); },
              afterAd: () => {
                syncAdSoundConfig();
                window._adJustFinished = true;
                resumeAudioContext();
              },
              beforeReward: (showAdFn) => {
                rewardFlowAvailable = true;
                showAdFn();
              },
              adViewed: () => {
                rewardSettled = true;
                this.adInProgress = false;
                this.rewardedUsedThisMatch = true;
                this.recordAdShown('reward');
                this.closeRewardedOverlay();
                window._adJustFinished = true;
                resumeAudioContext();
                setTimeout(resumeAudioContext, 150);
                this.restoreRewardSnapshot();
              },
              adDismissed: () => {
                rewardSettled = true;
                window._adJustFinished = true;
                resumeAudioContext();
                failReward(t('rewardedDeclined'));
              },
              adBreakDone: () => {
                window._adJustFinished = true;
                resumeAudioContext();
                setTimeout(resumeAudioContext, 150);
                setTimeout(resumeAudioContext, 400);
                if (!rewardFlowAvailable && !rewardSettled) {
                  failReward(t('rewardedUnavailable'));
                } else if (!rewardSettled) {
                  this.adInProgress = false;
                }
              }
            });
          } catch (err) {
            console.warn('Rewarded ad failed:', err);
            resumeAudioContext();
            failReward(t('rewardedUnavailable'));
          }
        },`;

const newRequestRewarded = `        async requestRewardedContinue() {
          if (!this.canOfferRewardedContinue()) return;

          this.adInProgress = true;
          let rewardSettled = false;
          let safetyTimer = null;

          const failReward = (message) => {
            if (rewardSettled) return;
            rewardSettled = true;
            if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
            this.adInProgress = false;
            unmuteGameAudioAfterAd();
            this.finalizePendingLoss(message);
          };

          // 8.5s fallback safety timer
          safetyTimer = setTimeout(() => {
            if (!rewardSettled) {
              console.warn('CrazyGames rewarded ad request timeout.');
              failReward(t('rewardedUnavailable'));
            }
          }, 8500);

          if (window.__crazyGamesInitPromise) {
            try {
              await Promise.race([
                window.__crazyGamesInitPromise,
                new Promise(resolve => setTimeout(resolve, 3000))
              ]);
            } catch (e) {}
          }

          crazyGamesGameplayStop();
          muteGameAudioForAd();

          const callbacks = {
            adStarted: () => {
              paused = true;
              intermission = true;
              muteGameAudioForAd();
              if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
            },
            adFinished: () => {
              rewardSettled = true;
              if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
              this.adInProgress = false;
              this.rewardedUsedThisMatch = true;
              this.recordAdShown('reward');
              this.closeRewardedOverlay();
              unmuteGameAudioAfterAd();
              this.restoreRewardSnapshot();
            },
            adError: (error) => {
              console.warn('CrazyGames rewarded ad error:', error);
              failReward(t('rewardedUnavailable'));
            }
          };

          try {
            window.CrazyGames.SDK.ad.requestAd("rewarded", callbacks);
          } catch (err) {
            console.warn('CrazyGames rewarded requestAd exception:', err);
            failReward(t('rewardedUnavailable'));
          }
        },`;

if (!content.includes(oldRequestRewarded)) {
  console.error('ERROR: Could not find requestRewardedContinue block!');
  process.exit(1);
}
content = content.replace(oldRequestRewarded, newRequestRewarded);

// 10. Gameplay lifecycle hooks:
// A. Space bar pause
const oldSpacePause = `        if (e.key === ' ') {
          paused = !paused;
          SFX.pause();
          updatePauseButtonUI();
          if (paused) {
            showBanner(\`<h1>\${t('paused')}</h1><p class="small-text">\${t('pressSpaceToResume') || 'Press SPACE to resume'}</p>\`);
          } else {
            hideBanner();
          }
        }`;

const newSpacePause = `        if (e.key === ' ') {
          paused = !paused;
          SFX.pause();
          updatePauseButtonUI();
          if (paused) {
            crazyGamesGameplayStop();
            showBanner(\`<h1>\${t('paused')}</h1><p class="small-text">\${t('pressSpaceToResume') || 'Press SPACE to resume'}</p>\`);
          } else {
            crazyGamesGameplayStart();
            hideBanner();
          }
        }`;

if (!content.includes(oldSpacePause)) {
  console.error('ERROR: Could not find Space pause handler!');
  process.exit(1);
}
content = content.replace(oldSpacePause, newSpacePause);

// B. Pause button onclick
const oldPauseBtnClick = `      document.getElementById('pauseBtn').onclick = () => {
        SFX.menuClick();
        if (isOnlineMode) {
          if (socket) socket.emit('requestPause', { roomId: onlineRoomId });
          return;
        }
        paused = !paused;
        SFX.pause();
        updatePauseButtonUI();
        if (paused) {
          showBanner(\`<h1>\${t('paused')}</h1><p class="small-text">\${t('pressSpaceToResume') || 'Press SPACE to resume'}</p>\`);
        } else {
          hideBanner();
        }
      };`;

const newPauseBtnClick = `      document.getElementById('pauseBtn').onclick = () => {
        SFX.menuClick();
        if (isOnlineMode) {
          if (socket) socket.emit('requestPause', { roomId: onlineRoomId });
          return;
        }
        paused = !paused;
        SFX.pause();
        updatePauseButtonUI();
        if (paused) {
          crazyGamesGameplayStop();
          showBanner(\`<h1>\${t('paused')}</h1><p class="small-text">\${t('pressSpaceToResume') || 'Press SPACE to resume'}</p>\`);
        } else {
          crazyGamesGameplayStart();
          hideBanner();
        }
      };`;

if (!content.includes(oldPauseBtnClick)) {
  console.error('ERROR: Could not find pauseBtn.onclick block!');
  process.exit(1);
}
content = content.replace(oldPauseBtnClick, newPauseBtnClick);

// C. countdown finish -> crazyGamesGameplayStart
const oldCountdownFinish = `        inCountdown = false; intermission = false; // Kontrolü burada aç`;
const newCountdownFinish = `        inCountdown = false; intermission = false; // Kontrolü burada aç
        crazyGamesGameplayStart();`;

if (!content.includes(oldCountdownFinish)) {
  console.error('ERROR: Could not find countdown finish line!');
  process.exit(1);
}
content = content.replace(oldCountdownFinish, newCountdownFinish);

// D. openMainMenu -> crazyGamesGameplayStop
const oldOpenMainMenu = `      function openMainMenu(resetNames = false) {
          invalidateGameFlow(true);`;

const newOpenMainMenu = `      function openMainMenu(resetNames = false) {
          crazyGamesGameplayStop();
          invalidateGameFlow(true);`;

if (!content.includes(oldOpenMainMenu)) {
  console.error('ERROR: Could not find openMainMenu block!');
  process.exit(1);
}
content = content.replace(oldOpenMainMenu, newOpenMainMenu);

// E. endGame -> crazyGamesGameplayStop
const oldEndGame = `      function endGame(result) {
        if (typeof isDemoMode !== 'undefined' && isDemoMode) {`;

const newEndGame = `      function endGame(result) {
        crazyGamesGameplayStop();
        if (typeof isDemoMode !== 'undefined' && isDemoMode) {`;

if (!content.includes(oldEndGame)) {
  console.error('ERROR: Could not find endGame block!');
  process.exit(1);
}
content = content.replace(oldEndGame, newEndGame);

// F. showGameEndStats -> crazyGamesGameplayStop
const oldGameEndStats = `      function showGameEndStats(winner) {
        // Remove any existing overlay`;

const newGameEndStats = `      function showGameEndStats(winner) {
        crazyGamesGameplayStop();
        // Remove any existing overlay`;

if (!content.includes(oldGameEndStats)) {
  console.error('ERROR: Could not find showGameEndStats block!');
  process.exit(1);
}
content = content.replace(oldGameEndStats, newGameEndStats);

// G. show1PGameOver -> crazyGamesGameplayStop
const oldShow1PGameOver = `      function show1PGameOver() {
        intermission = true;`;

const newShow1PGameOver = `      function show1PGameOver() {
        crazyGamesGameplayStop();
        intermission = true;`;

if (!content.includes(oldShow1PGameOver)) {
  console.error('ERROR: Could not find show1PGameOver block!');
  process.exit(1);
}
content = content.replace(oldShow1PGameOver, newShow1PGameOver);

// 11. AI Duel Collision Fixes for CrazyGames:
// In 1P AI Duels, human and AI can NEVER phase through each other under any condition (even in Beast Mode),
// and head-on collision is strictly a draw.
const oldHeadOnCheck = `        if (head1.x === head2.x && head1.y === head2.y) {
          if (beast1 || beast2) return { result: null, eater: null };
          if (isAiDuel) return { result: 'draw', eater: null };
          return { result: 'draw', eater: null };
        }`;

const newHeadOnCheck = `        if (head1.x === head2.x && head1.y === head2.y) {
          if (isAiDuel) return { result: 'draw', eater: null };
          if (beast1 || beast2) return { result: null, eater: null };
          return { result: 'draw', eater: null };
        }`;

if (!content.includes(oldHeadOnCheck)) {
  console.error('ERROR: Could not find head-on collision check block!');
  process.exit(1);
}
content = content.replace(oldHeadOnCheck, newHeadOnCheck);

const oldP1PhaseCheck = `const p1CanPhaseThroughOpponent = isAiDuel ? (beast1 && !beast2) : beast1;`;
const newP1PhaseCheck = `const p1CanPhaseThroughOpponent = isAiDuel ? false : beast1;`;
if (!content.includes(oldP1PhaseCheck)) {
  console.error('ERROR: Could not find p1CanPhaseThroughOpponent line!');
  process.exit(1);
}
content = content.replace(oldP1PhaseCheck, newP1PhaseCheck);

const oldP2PhaseCheck = `const p2CanPhaseThroughOpponent = beast2;`;
const newP2PhaseCheck = `const p2CanPhaseThroughOpponent = isAiDuel ? false : beast2;`;
if (!content.includes(oldP2PhaseCheck)) {
  console.error('ERROR: Could not find p2CanPhaseThroughOpponent line!');
  process.exit(1);
}
content = content.replace(oldP2PhaseCheck, newP2PhaseCheck);

// 12. Red Food (Heart) Growth & Bug Fix
const oldHeartBlock = `          } else if (f.type === 'heart') {
            if (ownerKey === 'p1') { stats.p1Food++; } else { stats.p2Food++; }`;

const newHeartBlock = `          } else if (f.type === 'heart') {
            s.grow += 1;
            if (ownerKey === 'p1') { stats.p1Food++; } else { stats.p2Food++; }`;

if (!content.includes(oldHeartBlock)) {
  console.error('ERROR: Could not find heart food block!');
  process.exit(1);
}
content = content.replace(oldHeartBlock, newHeartBlock);

// 13. Ruby Burst Optimization (prevent AI BFS freeze on 13 simultaneous items)
const oldRubyBurst = `      function spawnRubyBurstFoods() {
        foods = [];
        diamondActive = false;
        doubleActive = false;
        redFoodPresent = false;
        spawnBulkNormals(12, { rubyBurst: true });
        spawnStandaloneSapphire({ rubyBurst: true });
      }`;

const newRubyBurst = `      function spawnRubyBurstFoods() {
        foods = [];
        diamondActive = false;
        doubleActive = false;
        redFoodPresent = false;
        if (typeof _aiCache !== 'undefined') _aiCache = null;
        const burstCount = (gameMode === '1P' && aiSnakeEnabled) ? 6 : 12;
        spawnBulkNormals(burstCount, { rubyBurst: true });
        spawnStandaloneSapphire({ rubyBurst: true });
      }`;

if (!content.includes(oldRubyBurst)) {
  console.error('ERROR: Could not find spawnRubyBurstFoods function!');
  process.exit(1);
}
content = content.replace(oldRubyBurst, newRubyBurst);

// Write output HTML
fs.writeFileSync(outHtmlPath, content, 'utf8');
console.log('Successfully wrote CrazyGames index.html to:', outHtmlPath);

// Create ZIP file with index.html and logo.webp at root
console.log('Packaging ZIP:', outZipPath);
try {
  execSync(
    `powershell -Command "Compress-Archive -Path '${outHtmlPath}', '${logoOutPath}' -DestinationPath '${outZipPath}' -Force"`,
    { stdio: 'inherit' }
  );
  console.log('Successfully created CrazyGames ZIP package.');
} catch (e) {
  console.error('Failed to create ZIP package:', e);
  process.exit(1);
}
