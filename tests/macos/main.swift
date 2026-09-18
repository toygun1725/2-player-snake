// Exercises the production WKURLSchemeHandler and both actual game HTML files.
// No AdMob, StoreKit or external multiplayer requests are made by this test.
import AppKit
import WebKit

func fail(_ message: String) -> Never {
    print("WEBKIT FAIL: \(message)")
    exit(1)
}

final class SmokeTest: NSObject, WKScriptMessageHandler, WKNavigationDelegate {
    let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
    let resources: URL
    var webView: WKWebView!
    var window: NSWindow!
    var stage = -1
    var checking = false

    override init() {
        resources = FileManager.default.temporaryDirectory.appendingPathComponent("snake-webkit-\(UUID().uuidString)")
        super.init()
    }

    func start() throws {
        let source = root.appendingPathComponent("Ana Dosya/iOS/TwoPlayerSnake/Resources")
        try FileManager.default.createDirectory(at: resources, withIntermediateDirectories: true)
        try FileManager.default.copyItem(at: source.appendingPathComponent("WebAssets"), to: resources.appendingPathComponent("WebAssets"))
        try FileManager.default.copyItem(at: source.appendingPathComponent("Offline/offline_logo.png"), to: resources.appendingPathComponent("offline_logo.png"))
        window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 390, height: 844), styleMask: [.titled], backing: .buffered, defer: false)
        _ = Timer.scheduledTimer(withTimeInterval: 70, repeats: false) { _ in fail("gameReady did not arrive within 70s") }
        try loadStage()
    }

    func loadStage() throws {
        checking = false
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .nonPersistent()
        config.setURLSchemeHandler(BundleAssetHandler(resourceDirectory: resources), forURLScheme: "snake-asset")
        config.userContentController.add(self, name: "iOS")
        let assets = try BundleAssetHandler.bootstrapScript(resourceDirectory: resources)
        config.userContentController.addUserScript(WKUserScript(source: assets, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        let errors = """
        window.addEventListener('error', e => window.webkit.messageHandlers.iOS.postMessage({ action: 'smokeError', payload: { message: e.message || 'resource error', url: e.target && (e.target.src || e.target.href) } }), true);
        """
        config.userContentController.addUserScript(WKUserScript(source: errors, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        let bridge = try String(contentsOf: root.appendingPathComponent("Ana Dosya/iOS/TwoPlayerSnake/Bridge/ios_bridge_bootstrap.js"), encoding: .utf8)
        config.userContentController.addUserScript(WKUserScript(source: bridge, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        webView = WKWebView(frame: NSRect(x: 0, y: 0, width: 390, height: 844), configuration: config)
        webView.navigationDelegate = self
        window.contentView = webView
        window.makeKeyAndOrderFront(nil)
        if stage == -1 {
            webView.loadHTMLString("<!doctype html><html><body></body></html>", baseURL: URL(string: "https://2playersnake.com/"))
        } else if stage == 0 {
            let html = try String(contentsOf: root.appendingPathComponent("Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.3.6.html"), encoding: .utf8)
            // HTTPS origin is intentional: fonts must also work across the custom-scheme boundary.
            webView.loadHTMLString(html, baseURL: URL(string: "https://2playersnake.com/wp-content/uploads/game-mobile/index.html"))
        } else {
            webView.loadFileURL(root.appendingPathComponent("Ana Dosya/iOS/TwoPlayerSnake/Resources/Offline/mobile_offline_fallback.html"), allowingReadAccessTo: root)
        }
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        guard stage == -1 else { return }
        webView.evaluateJavaScript(GameWebRuntime.readinessProbe) { [self] value, error in
            guard error == nil, let state = value as? [String: Any], state["hasGameDOM"] as? Bool == false else {
                fail("blank page was accepted as a game")
            }
            print("WEBKIT PASS: blank HTTP-200 document rejected by production readiness probe")
            webView.configuration.userContentController.removeScriptMessageHandler(forName: "iOS")
            stage = 0
            do { try loadStage() } catch { fail(error.localizedDescription) }
        }
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any] else { return }
        if body["action"] as? String == "smokeError" {
            if let data = try? JSONSerialization.data(withJSONObject: body), let json = String(data: data, encoding: .utf8) {
                print("WEBKIT resource error: \(json)")
            }
            return
        }
        guard body["action"] as? String == "gameReady", !checking else { return }
        checking = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) { [self] in
            let script = """
            (() => {
                const logo = document.querySelector('.main-menu-logo');
                const loadedFonts = Array.from(document.fonts).filter(f => f.status === 'loaded').map(f => f.family.replace(/["']/g, ''));
                const expected = ['Orbitron', 'VT323', 'Font Awesome 6 Free', 'Font Awesome 6 Brands'];
                const style = document.getElementById('ios-fullscreen-and-safe-area-fix').textContent;
                return JSON.stringify({
                    revision: window.__twoPlayerSnakeRuntimeRevision,
                    logo: !!logo && logo.naturalWidth > 0 && logo.src.startsWith('snake-asset://'),
                    fonts: expected.every(f => loadedFonts.includes(f)), loadedFonts,
                    socket: typeof window.io === 'function',
                    offline: window.__twoPlayerSnakeOfflineMode === true,
                    blurRetained: !/backdrop-filter\\s*:\\s*none/.test(style),
                    menu: !!document.querySelector('#banner.show .main-menu-logo')
                });
            })()
            """
            webView.evaluateJavaScript(script) { [self] value, error in
                guard error == nil, let result = value as? String,
                      let data = result.data(using: .utf8),
                      let fields = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { fail("DOM verification failed: \(String(describing: error))") }
                print("WEBKIT stage=\(stage == 0 ? "https-origin" : "file-offline") \(result)")
                guard fields["revision"] as? Int == 36,
                      fields["logo"] as? Bool == true,
                      fields["fonts"] as? Bool == true,
                      fields["socket"] as? Bool == true,
                      fields["blurRetained"] as? Bool == true,
                      fields["menu"] as? Bool == true,
                      fields["offline"] as? Bool == (stage == 1) else { fail(result) }
                if stage == 1 { print("WEBKIT PASS: HTTPS-origin and offline game resources/init verified"); exit(0) }
                webView.configuration.userContentController.removeScriptMessageHandler(forName: "iOS")
                stage = 1
                do { try loadStage() } catch { fail(error.localizedDescription) }
            }
        }
    }
}

let application = NSApplication.shared
application.setActivationPolicy(.accessory)
let smoke = SmokeTest()
do { try smoke.start() } catch { fail(error.localizedDescription) }
application.run()
