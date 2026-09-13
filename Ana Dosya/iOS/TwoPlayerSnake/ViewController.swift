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
    private var isTeaserDismissed = false

    // Native Çevrimdışı (Offline) Ekranı
    private let offlineContainer = UIView()
    private let offlineTitleLabel = UILabel()
    private let offlineSubtitleLabel = UILabel()
    private let retryButton = UIButton(type: .system)

    // MARK: - Yapılandırma ve Durum
    private let baseGameUrl = "https://2playersnake.com/wp-content/uploads/game-mobile/index.html"
    private var progressObservation: NSKeyValueObservation?
    private var isGameLoaded = false

    override var prefersStatusBarHidden: Bool {
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

        loadGame()
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        playerLayer?.frame = teaserContainer.bounds
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
            self.teaserPercentLabel.text = "%\(Int(clamped * 100))"
            if progress >= 1.0 {
                self.dismissTeaserVideo()
            }
        }
    }

    // MARK: - Safe Area CSS Değişkenleri Enjeksiyonu
    private func injectSafeAreaVariables() {
        let topInset = view.safeAreaInsets.top
        let bottomInset = view.safeAreaInsets.bottom

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
            NotificationCenter.default.addObserver(
                forName: .AVPlayerItemDidPlayToEndTime,
                object: playerItem,
                queue: .main
            ) { [weak self] _ in
                self?.player?.seek(to: .zero)
                self?.player?.play()
            }

            player?.play()
        }

        // Alt Cam Panel (Android ile aynı tasarım)
        teaserGlassPanel.translatesAutoresizingMaskIntoConstraints = false
        teaserGlassPanel.backgroundColor = UIColor(white: 0.05, alpha: 0.65)
        teaserGlassPanel.layer.cornerRadius = 16
        teaserGlassPanel.layer.borderWidth = 1
        teaserGlassPanel.layer.borderColor = UIColor(white: 1.0, alpha: 0.15).cgColor
        teaserGlassPanel.clipsToBounds = true

        let blurEffect = UIBlurEffect(style: .dark)
        let blurView = UIVisualEffectView(effect: blurEffect)
        blurView.translatesAutoresizingMaskIntoConstraints = false
        teaserGlassPanel.addSubview(blurView)

        teaserTitleLabel.translatesAutoresizingMaskIntoConstraints = false
        teaserTitleLabel.text = "2 PLAYER SNAKE"
        teaserTitleLabel.font = .systemFont(ofSize: 18, weight: .black)
        teaserTitleLabel.textColor = .white
        teaserTitleLabel.textAlignment = .center

        teaserSubtitleLabel.translatesAutoresizingMaskIntoConstraints = false
        teaserSubtitleLabel.text = "HAZIRLANIYOR..."
        teaserSubtitleLabel.font = .systemFont(ofSize: 13, weight: .semibold)
        teaserSubtitleLabel.textColor = UIColor(white: 0.8, alpha: 1.0)
        teaserSubtitleLabel.textAlignment = .center

        teaserProgressBar.translatesAutoresizingMaskIntoConstraints = false
        teaserProgressBar.progressTintColor = UIColor(red: 0.208, green: 0.902, blue: 0.902, alpha: 1.0) // Neon Cyan
        teaserProgressBar.trackTintColor = UIColor(white: 1.0, alpha: 0.2)
        teaserProgressBar.layer.cornerRadius = 3
        teaserProgressBar.clipsToBounds = true
        teaserProgressBar.setProgress(0.08, animated: false)

        teaserPercentLabel.translatesAutoresizingMaskIntoConstraints = false
        teaserPercentLabel.text = "%8"
        teaserPercentLabel.font = .systemFont(ofSize: 12, weight: .bold)
        teaserPercentLabel.textColor = .white
        teaserPercentLabel.textAlignment = .center

        teaserGlassPanel.addSubview(teaserTitleLabel)
        teaserGlassPanel.addSubview(teaserSubtitleLabel)
        teaserGlassPanel.addSubview(teaserProgressBar)
        teaserGlassPanel.addSubview(teaserPercentLabel)
        teaserContainer.addSubview(teaserGlassPanel)

        NSLayoutConstraint.activate([
            blurView.topAnchor.constraint(equalTo: teaserGlassPanel.topAnchor),
            blurView.leadingAnchor.constraint(equalTo: teaserGlassPanel.leadingAnchor),
            blurView.trailingAnchor.constraint(equalTo: teaserGlassPanel.trailingAnchor),
            blurView.bottomAnchor.constraint(equalTo: teaserGlassPanel.bottomAnchor),

            teaserGlassPanel.centerXAnchor.constraint(equalTo: teaserContainer.centerXAnchor),
            teaserGlassPanel.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -28),
            teaserGlassPanel.widthAnchor.constraint(equalTo: teaserContainer.widthAnchor, multiplier: 0.88),
            teaserGlassPanel.heightAnchor.constraint(equalToConstant: 130),

            teaserTitleLabel.topAnchor.constraint(equalTo: teaserGlassPanel.topAnchor, constant: 14),
            teaserTitleLabel.centerXAnchor.constraint(equalTo: teaserGlassPanel.centerXAnchor),

            teaserSubtitleLabel.topAnchor.constraint(equalTo: teaserTitleLabel.bottomAnchor, constant: 4),
            teaserSubtitleLabel.centerXAnchor.constraint(equalTo: teaserGlassPanel.centerXAnchor),

            teaserProgressBar.topAnchor.constraint(equalTo: teaserSubtitleLabel.bottomAnchor, constant: 16),
            teaserProgressBar.leadingAnchor.constraint(equalTo: teaserGlassPanel.leadingAnchor, constant: 24),
            teaserProgressBar.trailingAnchor.constraint(equalTo: teaserGlassPanel.trailingAnchor, constant: -24),
            teaserProgressBar.heightAnchor.constraint(equalToConstant: 6),

            teaserPercentLabel.topAnchor.constraint(equalTo: teaserProgressBar.bottomAnchor, constant: 8),
            teaserPercentLabel.centerXAnchor.constraint(equalTo: teaserGlassPanel.centerXAnchor)
        ])
    }

    private func dismissTeaserVideo() {
        guard !isTeaserDismissed else { return }
        isTeaserDismissed = true
        isGameLoaded = true

        UIView.animate(withDuration: 0.35, delay: 0.1, options: .curveEaseOut, animations: {
            self.teaserContainer.alpha = 0.0
        }) { [weak self] _ in
            self?.player?.pause()
            self?.player = nil
            self?.playerLayer?.removeFromSuperlayer()
            self?.teaserContainer.removeFromSuperview()
        }
    }

    // MARK: - Oyun URL'i Oluşturma & Yükleme
    private func loadGame() {
        guard NetworkMonitor.shared.isOnline() else {
            showOfflineOverlay()
            return
        }

        hideOfflineOverlay()

        guard var components = URLComponents(string: baseGameUrl) else { return }

        let queryItems = [
            URLQueryItem(name: "app", value: "ios"),
            URLQueryItem(name: "app_ver", value: Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"),
            URLQueryItem(name: "app_code", value: Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"),
            URLQueryItem(name: "app_device", value: "mobile"),
            URLQueryItem(name: "__ts", value: String(Int(Date().timeIntervalSince1970 * 1000)))
        ]

        components.queryItems = queryItems

        if let finalUrl = components.url {
            let request = URLRequest(url: finalUrl, cachePolicy: .useProtocolCachePolicy, timeoutInterval: 30)
            webView.load(request)
        }
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

    // MARK: - Ağ Durumu Takibi
    private func setupNetworkMonitoring() {
        NetworkMonitor.shared.onStatusChange = { [weak self] isConnected in
            guard let self = self else { return }
            if isConnected && !self.isGameLoaded {
                self.loadGame()
            }
        }
    }

    // MARK: - WKNavigationDelegate
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else {
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
        injectSafeAreaVariables()
        publishSettingsToGame()
        // Sayfa bittiğinde videoyu kapat
        dismissTeaserVideo()
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        let nsError = error as NSError
        if nsError.code != NSURLErrorCancelled {
            showOfflineOverlay()
        }
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        let nsError = error as NSError
        if nsError.code != NSURLErrorCancelled {
            showOfflineOverlay()
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

    private func publishSettingsToGame() {
        let js = """
        (function() {
            var settings = {
                vibrationEnabled: \(HapticManager.shared.isHapticsEnabled),
                soundEnabled: true,
                adsRemoved: false
            };
            if (typeof window.dispatchNativeSettings === "function") {
                window.dispatchNativeSettings(settings);
            }
        })();
        """
        evaluateJavaScript(js)
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
