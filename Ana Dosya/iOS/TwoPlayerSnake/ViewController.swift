import UIKit
import WebKit
import AVFoundation

final class ViewController: UIViewController, WKNavigationDelegate, WKUIDelegate {

    // MARK: - UI Bileşenleri
    private var webView: WKWebView!
    private var messageHandler: GameScriptMessageHandler!

    // Teaser Video Açılış Ekranı (Android ile Birebir)
    private let teaserContainer = UIView()
    private var player: AVPlayer?
    private var playerLayer: AVPlayerLayer?
    private let teaserGlassPanel = UIView()
    private let teaserTitleLabel = UILabel()
    private let teaserSubtitleLabel = UILabel()
    private let teaserProgressBar = UIProgressView(progressViewStyle: .default)
    private let teaserPercentLabel = UILabel()
    private let teaserStartButton = UIButton(type: .custom)
    private var glassPanelHeightConstraint: NSLayoutConstraint?
    private var glassPanelWidthConstraint: NSLayoutConstraint?
    private var isStartButtonShown = false
    private var isTeaserDismissed = false
    private var playerLoopObserver: Any?

    // Native Çevrimdışı (Offline) Ekranı
    private let offlineContainer = UIView()
    private let offlineTitleLabel = UILabel()
    private let offlineSubtitleLabel = UILabel()
    private let retryButton = UIButton(type: .system)

    // MARK: - Yapılandırma ve Durum
    private let baseGameUrl = "https://2playersnake.com/wp-content/uploads/game-mobile/index.html"
    private var progressObservation: NSKeyValueObservation?
    private var isGameLoaded = false
    private var isShowingOfflineGame = false
    private var hasOfferedOnlineReload = false
    private var lastInjectedSafeAreaInsets: UIEdgeInsets?
    private var coldStartWatchdogTimer: Timer?

    override var prefersStatusBarHidden: Bool {
        return true
    }

    override var prefersHomeIndicatorAutoHidden: Bool {
        return true
    }

    override var supportedInterfaceOrientations: UIInterfaceOrientationMask {
        return .portrait
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black

        setupWebView()
        setupTeaserVideo()
        setupOfflineOverlay()
        setupNetworkMonitoring()
        setupKeyboardHandling()

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handlePremiumStatusChanged),
            name: IAPManager.premiumStatusDidChangeNotification,
            object: nil
        )

        loadGame()
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        // view.bounds kullan — teaserContainer.bounds değil
        // Böylece video Home Indicator alanı dahil tam ekranı kaplar, alt siyah bant olmaz
        playerLayer?.frame = view.bounds
        injectSafeAreaVariables()
    }

    // MARK: - WebView Kurulumu
    private func setupWebView() {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        // Script Message Handler kurulumu
        messageHandler = GameScriptMessageHandler(viewController: self)
        config.userContentController.add(messageHandler, name: "iOS")

        // Bootstrap JS köprüsü enjeksiyonu
        if let bootstrapPath = Bundle.main.path(forResource: "ios_bridge_bootstrap", ofType: "js", inDirectory: "Bridge"),
           let bootstrapCode = try? String(contentsOfFile: bootstrapPath, encoding: .utf8) {
            let script = WKUserScript(source: bootstrapCode, injectionTime: .atDocumentStart, forMainFrameOnly: true)
            config.userContentController.addUserScript(script)
        } else if let localBootstrapPath = Bundle.main.path(forResource: "ios_bridge_bootstrap", ofType: "js"),
                  let bootstrapCode = try? String(contentsOfFile: localBootstrapPath, encoding: .utf8) {
            let script = WKUserScript(source: bootstrapCode, injectionTime: .atDocumentStart, forMainFrameOnly: true)
            config.userContentController.addUserScript(script)
        }

        webView = WKWebView(frame: .zero, configuration: config)
        webView.translatesAutoresizingMaskIntoConstraints = false
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.backgroundColor = .black
        webView.isOpaque = true
        webView.scrollView.bounces = false
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never

        view.addSubview(webView)
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])

        // Sayfa yüklenme ilerlemesi takibi (KVO)
        progressObservation = webView.observe(\.estimatedProgress, options: [.new]) { [weak self] _, change in
            guard let self = self, let progress = change.newValue else { return }
            let clamped = max(0.08, min(1.0, Float(progress)))
            self.teaserProgressBar.setProgress(clamped, animated: true)
            self.teaserPercentLabel.text = "%\(Int(clamped * 100)) hazır"
            if progress >= 1.0 {
                self.showStartButton()
            }
        }
    }

    // MARK: - Safe Area CSS Değişkenleri Enjeksiyonu
    private func injectSafeAreaVariables(force: Bool = false) {
        let topInset = view.safeAreaInsets.top
        let bottomInset = view.safeAreaInsets.bottom
        let currentInsets = UIEdgeInsets(top: topInset, left: 0, bottom: bottomInset, right: 0)

        // viewDidLayoutSubviews can be called repeatedly during WebKit menu
        // animations. Avoid evaluating JavaScript unless the native safe area
        // has actually changed.
        guard force || lastInjectedSafeAreaInsets != currentInsets else { return }
        lastInjectedSafeAreaInsets = currentInsets

        let css = """
        (function() {
            var root = document.documentElement;
            if (root) {
                root.style.setProperty('--safe-area-top', '\(topInset)px');
                root.style.setProperty('--safe-area-bottom', '\(bottomInset)px');
            }
        })();
        """
        webView.evaluateJavaScript(css, completionHandler: nil)
    }

    // MARK: - Teaser Video Açılış Sistemi (Android ile Birebir)
    private func setupTeaserVideo() {
        teaserContainer.translatesAutoresizingMaskIntoConstraints = false
        teaserContainer.backgroundColor = .black
        view.addSubview(teaserContainer)

        NSLayoutConstraint.activate([
            teaserContainer.topAnchor.constraint(equalTo: view.topAnchor),
            teaserContainer.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            teaserContainer.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            teaserContainer.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])

        // loading_video.mp4 dosyasını bul
        let videoUrl = Bundle.main.url(forResource: "loading_video", withExtension: "mp4", subdirectory: "Resources")
            ?? Bundle.main.url(forResource: "loading_video", withExtension: "mp4")

        if let url = videoUrl {
            // Ses ayarını yapılandır
            try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [.mixWithOthers])
            try? AVAudioSession.sharedInstance().setActive(true)

            let playerItem = AVPlayerItem(url: url)
            player = AVPlayer(playerItem: playerItem)
            playerLayer = AVPlayerLayer(player: player)
            playerLayer?.videoGravity = .resizeAspectFill
            playerLayer?.frame = view.bounds
            if let layer = playerLayer {
                teaserContainer.layer.addSublayer(layer)
            }

            // Döngüsel oynatma (Loop)
            playerLoopObserver = NotificationCenter.default.addObserver(
                forName: .AVPlayerItemDidPlayToEndTime,
                object: playerItem,
                queue: .main
            ) { [weak self] _ in
                self?.player?.seek(to: .zero)
                self?.player?.play()
            }

            player?.play()
        }

        // Alt Cam Panel — Android ile birebir aynı (#7A101A28, cornerRadius 22dp, border #33FFFFFF, NO BLUR)
        teaserGlassPanel.translatesAutoresizingMaskIntoConstraints = false
        teaserGlassPanel.backgroundColor = UIColor(red: 16/255.0, green: 26/255.0, blue: 40/255.0, alpha: 0.48)
        teaserGlassPanel.layer.cornerRadius = 22
        teaserGlassPanel.layer.borderWidth = 1
        teaserGlassPanel.layer.borderColor = UIColor(white: 1.0, alpha: 0.20).cgColor
        teaserGlassPanel.clipsToBounds = true

        teaserTitleLabel.translatesAutoresizingMaskIntoConstraints = false
        teaserTitleLabel.text = "İKİ OYUNCU. TEK ARENA. HAZIR OL..."
        teaserTitleLabel.font = .systemFont(ofSize: 15, weight: .black)
        teaserTitleLabel.textColor = .white
        teaserTitleLabel.textAlignment = .center

        teaserSubtitleLabel.translatesAutoresizingMaskIntoConstraints = false
        teaserSubtitleLabel.text = "Kontroller, ses ve performans ayarlanıyor..."
        teaserSubtitleLabel.font = .systemFont(ofSize: 12, weight: .semibold)
        teaserSubtitleLabel.textColor = UIColor(white: 0.82, alpha: 1.0)
        teaserSubtitleLabel.textAlignment = .center

        teaserProgressBar.translatesAutoresizingMaskIntoConstraints = false
        teaserProgressBar.progressTintColor = UIColor(red: 0.0, green: 0.898, blue: 1.0, alpha: 1.0) // Neon Cyan #00E5FF
        teaserProgressBar.trackTintColor = UIColor(white: 1.0, alpha: 0.2)
        teaserProgressBar.layer.cornerRadius = 3
        teaserProgressBar.clipsToBounds = true
        teaserProgressBar.setProgress(0.08, animated: false)

        teaserPercentLabel.translatesAutoresizingMaskIntoConstraints = false
        teaserPercentLabel.text = "%8 hazır"
        teaserPercentLabel.font = .systemFont(ofSize: 12, weight: .bold)
        teaserPercentLabel.textColor = .white
        teaserPercentLabel.textAlignment = .center

        // Android parity: sadece büyük neon glow metin, kutu/border yok
        teaserStartButton.translatesAutoresizingMaskIntoConstraints = false
        teaserStartButton.setTitle("START", for: .normal)  // Android gibi ">" yok
        teaserStartButton.setTitleColor(UIColor(red: 0.0, green: 0.898, blue: 1.0, alpha: 1.0), for: .normal)
        // Orbitron-Bold 46pt — Android ile birebir (android:textSize="46sp", android:fontFamily="@font/orbitron")
        let orbitronFont = UIFont(name: "Orbitron-Bold", size: 46)
        teaserStartButton.titleLabel?.font = orbitronFont ?? .systemFont(ofSize: 42, weight: .heavy)
        teaserStartButton.backgroundColor = .clear             // kutu yok
        teaserStartButton.layer.cornerRadius = 0               // köşe yuvarlama yok
        teaserStartButton.layer.borderWidth = 0                // kenarlık yok
        // Neon glow shadow — Android shadowRadius:20 + #00E5FF
        teaserStartButton.layer.shadowColor = UIColor(red: 0.0, green: 0.898, blue: 1.0, alpha: 1.0).cgColor
        teaserStartButton.layer.shadowOffset = .zero
        teaserStartButton.layer.shadowRadius = 20
        teaserStartButton.layer.shadowOpacity = 1.0
        teaserStartButton.contentEdgeInsets = UIEdgeInsets(top: 10, left: 32, bottom: 10, right: 32)
        teaserStartButton.isHidden = true
        teaserStartButton.addTarget(self, action: #selector(startButtonTapped), for: .touchUpInside)

        teaserGlassPanel.addSubview(teaserTitleLabel)
        teaserGlassPanel.addSubview(teaserSubtitleLabel)
        teaserGlassPanel.addSubview(teaserProgressBar)
        teaserGlassPanel.addSubview(teaserPercentLabel)
        teaserGlassPanel.addSubview(teaserStartButton)
        teaserContainer.addSubview(teaserGlassPanel)

        let initialHeight = teaserGlassPanel.heightAnchor.constraint(equalToConstant: 130)
        let initialWidth = teaserGlassPanel.widthAnchor.constraint(equalTo: teaserContainer.widthAnchor, multiplier: 0.88)
        self.glassPanelHeightConstraint = initialHeight
        self.glassPanelWidthConstraint = initialWidth

        NSLayoutConstraint.activate([
            teaserGlassPanel.centerXAnchor.constraint(equalTo: teaserContainer.centerXAnchor),
            teaserGlassPanel.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -28),
            initialWidth,
            initialHeight,

            teaserTitleLabel.topAnchor.constraint(equalTo: teaserGlassPanel.topAnchor, constant: 14),
            teaserTitleLabel.centerXAnchor.constraint(equalTo: teaserGlassPanel.centerXAnchor),

            teaserSubtitleLabel.topAnchor.constraint(equalTo: teaserTitleLabel.bottomAnchor, constant: 4),
            teaserSubtitleLabel.centerXAnchor.constraint(equalTo: teaserGlassPanel.centerXAnchor),

            teaserProgressBar.topAnchor.constraint(equalTo: teaserSubtitleLabel.bottomAnchor, constant: 16),
            teaserProgressBar.leadingAnchor.constraint(equalTo: teaserGlassPanel.leadingAnchor, constant: 24),
            teaserProgressBar.trailingAnchor.constraint(equalTo: teaserGlassPanel.trailingAnchor, constant: -24),
            teaserProgressBar.heightAnchor.constraint(equalToConstant: 6),

            teaserPercentLabel.topAnchor.constraint(equalTo: teaserProgressBar.bottomAnchor, constant: 8),
            teaserPercentLabel.centerXAnchor.constraint(equalTo: teaserGlassPanel.centerXAnchor),

            // Buton: intrinsicContentSize kullan, panel ortasına sabitle
            teaserStartButton.centerXAnchor.constraint(equalTo: teaserGlassPanel.centerXAnchor),
            teaserStartButton.centerYAnchor.constraint(equalTo: teaserGlassPanel.centerYAnchor)
        ])
    }

    private func showStartButton() {
        guard !isStartButtonShown && !isTeaserDismissed else { return }
        isStartButtonShown = true

        UIView.animate(withDuration: 0.25, animations: {
            self.teaserTitleLabel.alpha = 0.0
            self.teaserSubtitleLabel.alpha = 0.0
            self.teaserProgressBar.alpha = 0.0
            self.teaserPercentLabel.alpha = 0.0
        }) { _ in
            self.teaserTitleLabel.isHidden = true
            self.teaserSubtitleLabel.isHidden = true
            self.teaserProgressBar.isHidden = true
            self.teaserPercentLabel.isHidden = true

            self.teaserStartButton.alpha = 0.0
            self.teaserStartButton.isHidden = false
            self.teaserStartButton.transform = CGAffineTransform(scaleX: 0.85, y: 0.85)

            // Android parity: Yükleme bittiğinde cam panel START butonunu saracak boyuta küçülür
            self.glassPanelHeightConstraint?.constant = 84
            self.glassPanelWidthConstraint?.isActive = false
            let compactWidth = self.teaserGlassPanel.widthAnchor.constraint(equalTo: self.teaserStartButton.widthAnchor, constant: 24)
            compactWidth.isActive = true
            self.glassPanelWidthConstraint = compactWidth

            UIView.animate(withDuration: 0.35, delay: 0.0, usingSpringWithDamping: 0.7, initialSpringVelocity: 0.5, options: .curveEaseOut, animations: {
                self.teaserContainer.layoutIfNeeded()
                self.teaserStartButton.alpha = 1.0
                self.teaserStartButton.transform = .identity
            }) { _ in
                let pulse = CABasicAnimation(keyPath: "transform.scale")
                pulse.duration = 0.75
                pulse.fromValue = 1.0
                pulse.toValue = 1.06
                pulse.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
                pulse.autoreverses = true
                pulse.repeatCount = .infinity
                self.teaserStartButton.layer.add(pulse, forKey: "pulse")
            }
        }
    }

    @objc private func startButtonTapped() {
        HapticManager.shared.playFoodHaptic()
        dismissTeaserVideo()
    }

    private func dismissTeaserVideo() {
        guard !isTeaserDismissed else { return }
        isTeaserDismissed = true
        isGameLoaded = true

        if let observer = playerLoopObserver {
            NotificationCenter.default.removeObserver(observer)
            playerLoopObserver = nil
        }

        // Oyun JS ortamına hazır sinyali gönder (race condition önlemi)
        let readyPing = """
        (function() {
            if (typeof window.__iosAppReady === 'function') {
                try { window.__iosAppReady(); } catch(e) {}
            }
            // Oyun HTML'i data-ios-shell attribute'unu kontrol edebilir
            document.documentElement.setAttribute('data-ios-ready', 'true');
        })();
        """
        webView.evaluateJavaScript(readyPing, completionHandler: nil)

        UIView.animate(withDuration: 0.35, delay: 0.05, options: .curveEaseOut, animations: {
            self.teaserContainer.alpha = 0.0
        }) { [weak self] _ in
            guard let self = self else { return }
            self.player?.pause()
            self.player = nil
            self.playerLayer?.removeFromSuperlayer()
            self.teaserContainer.removeFromSuperview()

            // Offline fallback oyununda reklam isteği veya ATT akışı başlatılmaz.
            if !self.isShowingOfflineGame {
                AdManager.shared.requestTrackingAuthorization()
            }
        }
    }

    // MARK: - Oyun URL'i Oluşturma & Yükleme
    private func loadGame() {
        coldStartWatchdogTimer?.invalidate()
        coldStartWatchdogTimer = nil

        guard NetworkMonitor.shared.isOnline() else {
            loadOfflineFallbackGame()
            return
        }

        isShowingOfflineGame = false
        hasOfferedOnlineReload = false
        hideOfflineOverlay()

        guard var components = URLComponents(string: baseGameUrl) else { return }

        let queryItems = [
            URLQueryItem(name: "app", value: "ios"),
            URLQueryItem(name: "app_ver", value: Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "3.3.5"),
            URLQueryItem(name: "app_code", value: Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "32"),
            URLQueryItem(name: "app_device", value: "mobile"),
            URLQueryItem(name: "__ts", value: String(Int(Date().timeIntervalSince1970 * 1000)))
        ]

        components.queryItems = queryItems

        if let finalUrl = components.url {
            let request = URLRequest(url: finalUrl, cachePolicy: .useProtocolCachePolicy, timeoutInterval: 15)
            webView.load(request)

            // Soğuk açılış emniyet zamanlayıcısı (Cold-Start Watchdog - 2.5s):
            // Uçak modu veya zayıf ağda WebKit'in askıda kalıp %8'de kilitlenmesini engelle
            coldStartWatchdogTimer = Timer.scheduledTimer(withTimeInterval: 2.5, repeats: false) { [weak self] _ in
                guard let self = self, !self.isGameLoaded, !self.isShowingOfflineGame else { return }
                print("[ViewController] Soğuk açılış zaman aşımı (2.5s). Yerel çevrimdışı fallback'e geçiliyor.")
                self.loadOfflineFallbackGame()
            }
        }
    }

    private func loadOfflineFallbackGame() {
        coldStartWatchdogTimer?.invalidate()
        coldStartWatchdogTimer = nil

        guard let fallbackUrl = Bundle.main.url(forResource: "mobile_offline_fallback", withExtension: "html", subdirectory: "Offline")
                ?? Bundle.main.url(forResource: "mobile_offline_fallback", withExtension: "html") else {
            showOfflineOverlay()
            return
        }

        isShowingOfflineGame = true
        hideOfflineOverlay()
        webView.stopLoading()
        webView.loadFileURL(fallbackUrl, allowingReadAccessTo: Bundle.main.bundleURL)
    }


    private func offerOnlineGameReload() {
        guard isShowingOfflineGame, !hasOfferedOnlineReload else { return }
        hasOfferedOnlineReload = true

        let alert = UIAlertController(
            title: "Bağlantı Geri Geldi",
            message: "Çevrimiçi mod, reklamlar ve en güncel oyun sürümü için oyun yeniden yüklenecek. Mevcut yerel maçın kaybolur.",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "Şimdi Yükle", style: .default) { [weak self] _ in
            guard let self = self else { return }
            self.isGameLoaded = false
            self.loadGame()
        })
        alert.addAction(UIAlertAction(title: "Offline Devam Et", style: .cancel))
        present(alert, animated: true)
    }

    // MARK: - Native Çevrimdışı (Offline) Arayüzü
    private func setupOfflineOverlay() {
        offlineContainer.translatesAutoresizingMaskIntoConstraints = false
        offlineContainer.backgroundColor = .black
        offlineContainer.isHidden = true
        view.addSubview(offlineContainer)

        offlineTitleLabel.translatesAutoresizingMaskIntoConstraints = false
        offlineTitleLabel.text = "Bağlantı Yok"
        offlineTitleLabel.font = .systemFont(ofSize: 24, weight: .bold)
        offlineTitleLabel.textColor = .white
        offlineTitleLabel.textAlignment = .center
        offlineContainer.addSubview(offlineTitleLabel)

        offlineSubtitleLabel.translatesAutoresizingMaskIntoConstraints = false
        offlineSubtitleLabel.text = "2 Player Snake oynamak için internet bağlantısı gereklidir."
        offlineSubtitleLabel.font = .systemFont(ofSize: 15, weight: .regular)
        offlineSubtitleLabel.textColor = .lightGray
        offlineSubtitleLabel.textAlignment = .center
        offlineSubtitleLabel.numberOfLines = 0
        offlineContainer.addSubview(offlineSubtitleLabel)

        retryButton.translatesAutoresizingMaskIntoConstraints = false
        retryButton.setTitle("Tekrar Dene", for: .normal)
        retryButton.titleLabel?.font = .systemFont(ofSize: 16, weight: .bold)
        retryButton.backgroundColor = UIColor(red: 0.133, green: 0.773, blue: 0.369, alpha: 1.0)
        retryButton.setTitleColor(.black, for: .normal)
        retryButton.layer.cornerRadius = 24
        retryButton.addTarget(self, action: #selector(retryButtonTapped), for: .touchUpInside)
        offlineContainer.addSubview(retryButton)

        NSLayoutConstraint.activate([
            offlineContainer.topAnchor.constraint(equalTo: view.topAnchor),
            offlineContainer.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            offlineContainer.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            offlineContainer.bottomAnchor.constraint(equalTo: view.bottomAnchor),

            offlineTitleLabel.centerXAnchor.constraint(equalTo: offlineContainer.centerXAnchor),
            offlineTitleLabel.centerYAnchor.constraint(equalTo: offlineContainer.centerYAnchor, constant: -40),

            offlineSubtitleLabel.topAnchor.constraint(equalTo: offlineTitleLabel.bottomAnchor, constant: 12),
            offlineSubtitleLabel.leadingAnchor.constraint(equalTo: offlineContainer.leadingAnchor, constant: 32),
            offlineSubtitleLabel.trailingAnchor.constraint(equalTo: offlineContainer.trailingAnchor, constant: -32),

            retryButton.topAnchor.constraint(equalTo: offlineSubtitleLabel.bottomAnchor, constant: 30),
            retryButton.centerXAnchor.constraint(equalTo: offlineContainer.centerXAnchor),
            retryButton.widthAnchor.constraint(equalToConstant: 180),
            retryButton.heightAnchor.constraint(equalToConstant: 48)
        ])
    }

    private func showOfflineOverlay() {
        offlineContainer.isHidden = false
        teaserContainer.isHidden = true
    }

    private func hideOfflineOverlay() {
        offlineContainer.isHidden = true
    }

    @objc private func retryButtonTapped() {
        HapticManager.shared.playFoodHaptic()
        loadGame()
    }

    // MARK: - Klavye Takibi ve Scroll Sıfırlama
    private func setupKeyboardHandling() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(keyboardWillHide),
            name: UIResponder.keyboardWillHideNotification,
            object: nil
        )
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(keyboardDidHide),
            name: UIResponder.keyboardDidHideNotification,
            object: nil
        )
    }

    @objc private func keyboardWillHide(_ notification: Notification) {
        webView.scrollView.setContentOffset(.zero, animated: true)
    }

    @objc private func keyboardDidHide(_ notification: Notification) {
        webView.scrollView.setContentOffset(.zero, animated: false)
        webView.evaluateJavaScript("window.scrollTo(0, 0); document.body.scrollTop = 0; document.documentElement.scrollTop = 0;", completionHandler: nil)
    }

    // MARK: - Ağ Durumu Takibi
    private func setupNetworkMonitoring() {
        NetworkMonitor.shared.onStatusChange = { [weak self] isConnected in
            guard let self = self else { return }
            if isConnected {
                if self.isShowingOfflineGame {
                    self.offerOnlineGameReload()
                } else if !self.isGameLoaded {
                    self.loadGame()
                }
            } else if !self.isGameLoaded && !self.isShowingOfflineGame {
                self.loadOfflineFallbackGame()
            }
        }
    }

    // MARK: - WKNavigationDelegate
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.cancel)
            return
        }

        // Oyunun versiyon kontrol reload'unu engelle:
        // Web oyunu ana menüde scheduleVersionCheck() çağırır → sunucudan HTML çeker
        // → yeni sürüm varsa window.location.replace() → WebView'i reload → JS state sıfırlanır → deadlock
        // Bu URL'leri iptal ederek mid-session reload önlenir.
        if let query = url.query, query.contains("__versionCheck") {
            decisionHandler(.cancel)
            return
        }

        // Güvenli alan: 2playersnake.com rotaları WebView içinde açılır
        if isTrustedGameUrl(url) {
            decisionHandler(.allow)
        } else if navigationAction.targetFrame == nil || !navigationAction.targetFrame!.isMainFrame {
            // İframe veya alt kaynak isteklerine izin ver
            decisionHandler(.allow)
        } else {
            // Harici bağlantıları cihazın varsayılan tarayıcısında (Safari) aç
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
            decisionHandler(.cancel)
        }
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        coldStartWatchdogTimer?.invalidate()
        coldStartWatchdogTimer = nil
        injectSafeAreaVariables(force: true)
        publishSettingsToGame()
        // Sayfa yüklendiğinde START butonunu göster (videoyu kullanıcı START'a basana kadar döngüde tut)
        showStartButton()
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        coldStartWatchdogTimer?.invalidate()
        coldStartWatchdogTimer = nil
        let nsError = error as NSError
        if nsError.code != NSURLErrorCancelled && !isShowingOfflineGame {
            loadOfflineFallbackGame()
        }
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        coldStartWatchdogTimer?.invalidate()
        coldStartWatchdogTimer = nil
        let nsError = error as NSError
        if nsError.code != NSURLErrorCancelled && !isShowingOfflineGame {
            loadOfflineFallbackGame()
        }
    }


    private func isTrustedGameUrl(_ url: URL) -> Bool {
        guard let host = url.host?.lowercased() else { return false }
        let allowedHosts = ["2playersnake.com", "www.2playersnake.com"]
        guard allowedHosts.contains(host) else { return false }

        let path = url.path
        let allowedPrefixes = ["/mobile", "/wp-content/uploads/game-mobile/", "/wp-content/uploads/game/"]
        return allowedPrefixes.anySatisfy { path.hasPrefix($0) }
    }

    // MARK: - JavaScript Helper
    func evaluateJavaScript(_ script: String, completionHandler: ((Any?, Error?) -> Void)? = nil) {
        webView.evaluateJavaScript(script, completionHandler: completionHandler)
    }

    @objc private func handlePremiumStatusChanged() {
        DispatchQueue.main.async { [weak self] in
            self?.publishSettingsToGame()
        }
    }

    func publishSettingsToGame() {
        let isPremium = IAPManager.shared.isAdsRemoved
        let js = """
        (function() {
            var settings = {
                vibrationEnabled: \(HapticManager.shared.isHapticsEnabled),
                soundEnabled: true,
                adsRemoved: \(isPremium)
            };
            if (typeof window.dispatchNativeSettings === "function") {
                window.dispatchNativeSettings(settings);
            }
            if (typeof window.onAndroidSettings === "function") {
                try { window.onAndroidSettings(settings); } catch(e) {}
            }
        })();
        """
        evaluateJavaScript(js)
    }

    func showAlert(title: String, message: String, buttonTitle: String = "Tamam") {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: buttonTitle, style: .default, handler: nil))
            self.present(alert, animated: true, completion: nil)
        }
    }
}

// Sequence helper
private extension Sequence {
    func anySatisfy(_ predicate: (Element) -> Bool) -> Bool {
        for element in self {
            if predicate(element) { return true }
        }
        return false
    }
}
