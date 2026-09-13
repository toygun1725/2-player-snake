import UIKit
import WebKit

final class ViewController: UIViewController, WKNavigationDelegate, WKUIDelegate {

    // MARK: - UI Bileşenleri
    private var webView: WKWebView!
    private var messageHandler: GameScriptMessageHandler!

    // Native Yükleme Ekranı (Splash / Loading Overlay)
    private let loadingContainer = UIView()
    private let logoLabel = UILabel()
    private let progressBar = UIProgressView(progressViewStyle: .default)
    private let loadingLabel = UILabel()

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
        setupLoadingOverlay()
        setupOfflineOverlay()
        setupNetworkMonitoring()

        loadGame()
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
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
            self.progressBar.setProgress(Float(progress), animated: true)
            if progress >= 1.0 {
                self.hideLoadingOverlay()
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

    // MARK: - Oyun URL'i Oluşturma & Yükleme
    private func loadGame() {
        guard NetworkMonitor.shared.isOnline() else {
            showOfflineOverlay()
            return
        }

        hideOfflineOverlay()
        showLoadingOverlay()

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

    // MARK: - Native Splash / Loading Arayüzü
    private func setupLoadingOverlay() {
        loadingContainer.translatesAutoresizingMaskIntoConstraints = false
        loadingContainer.backgroundColor = .black
        view.addSubview(loadingContainer)

        logoLabel.translatesAutoresizingMaskIntoConstraints = false
        logoLabel.text = "2 PLAYER SNAKE"
        logoLabel.font = .systemFont(ofSize: 28, weight: .black)
        logoLabel.textColor = UIColor(red: 0.133, green: 0.773, blue: 0.369, alpha: 1.0)
        logoLabel.textAlignment = .center
        loadingContainer.addSubview(logoLabel)

        progressBar.translatesAutoresizingMaskIntoConstraints = false
        progressBar.progressTintColor = UIColor(red: 0.133, green: 0.773, blue: 0.369, alpha: 1.0)
        progressBar.trackTintColor = UIColor.darkGray.withAlphaComponent(0.4)
        progressBar.layer.cornerRadius = 3
        progressBar.clipsToBounds = true
        loadingContainer.addSubview(progressBar)

        loadingLabel.translatesAutoresizingMaskIntoConstraints = false
        loadingLabel.text = "Yükleniyor..."
        loadingLabel.font = .systemFont(ofSize: 14, weight: .medium)
        loadingLabel.textColor = .lightGray
        loadingLabel.textAlignment = .center
        loadingContainer.addSubview(loadingLabel)

        NSLayoutConstraint.activate([
            loadingContainer.topAnchor.constraint(equalTo: view.topAnchor),
            loadingContainer.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            loadingContainer.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            loadingContainer.bottomAnchor.constraint(equalTo: view.bottomAnchor),

            logoLabel.centerXAnchor.constraint(equalTo: loadingContainer.centerXAnchor),
            logoLabel.centerYAnchor.constraint(equalTo: loadingContainer.centerYAnchor, constant: -30),

            progressBar.centerXAnchor.constraint(equalTo: loadingContainer.centerXAnchor),
            progressBar.topAnchor.constraint(equalTo: logoLabel.bottomAnchor, constant: 25),
            progressBar.widthAnchor.constraint(equalToConstant: 220),
            progressBar.heightAnchor.constraint(equalToConstant: 6),

            loadingLabel.centerXAnchor.constraint(equalTo: loadingContainer.centerXAnchor),
            loadingLabel.topAnchor.constraint(equalTo: progressBar.bottomAnchor, constant: 12)
        ])
    }

    private func showLoadingOverlay() {
        loadingContainer.alpha = 1.0
        loadingContainer.isHidden = false
        progressBar.setProgress(0.1, animated: false)
    }

    private func hideLoadingOverlay() {
        UIView.animate(withDuration: 0.4, delay: 0.2, options: .curveEaseOut, animations: {
            self.loadingContainer.alpha = 0.0
        }) { _ in
            self.loadingContainer.isHidden = true
            self.isGameLoaded = true
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
        loadingContainer.isHidden = true
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
        // Sayfa yüklendiğinde ayarları gönder
        publishSettingsToGame()
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
    func evaluateJavaScript(_ script: String) {
        webView.evaluateJavaScript(script, completionHandler: nil)
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
