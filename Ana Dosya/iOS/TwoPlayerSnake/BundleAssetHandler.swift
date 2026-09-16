import Foundation
import WebKit

/// Serves only the game's packaged, immutable resources to the HTTPS game page.
/// No filesystem path supplied by JavaScript is opened directly.
final class BundleAssetHandler: NSObject, WKURLSchemeHandler {
    private let resourceDirectory: URL?

    init(resourceDirectory: URL? = nil) {
        self.resourceDirectory = resourceDirectory
        super.init()
    }

    private let resources: [String: (String, String)] = [
        "/fonts.css": ("WebAssets/fonts.css", "text/css"),
        "/fontawesome.css": ("WebAssets/fontawesome.css", "text/css"),
        "/orbitron.ttf": ("WebAssets/orbitron.ttf", "font/ttf"),
        "/vt323.ttf": ("WebAssets/vt323.ttf", "font/ttf"),
        "/webfonts/fa-solid-900.woff2": ("WebAssets/fa-solid-900.woff2", "font/woff2"),
        "/webfonts/fa-regular-400.woff2": ("WebAssets/fa-regular-400.woff2", "font/woff2"),
        "/webfonts/fa-brands-400.woff2": ("WebAssets/fa-brands-400.woff2", "font/woff2"),
        "/socket.io.min.js": ("WebAssets/socket.io.min.js", "application/javascript"),
        "/logo.png": ("offline_logo.png", "image/png")
    ]

    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        guard let url = urlSchemeTask.request.url,
              url.host == "bundle",
              let (path, mimeType) = resources[url.path],
              let fileURL = resourceDirectory?.appendingPathComponent(path)
                ?? Bundle.main.url(forResource: path, withExtension: nil),
              let data = try? Data(contentsOf: fileURL) else {
            urlSchemeTask.didFailWithError(URLError(.fileDoesNotExist))
            return
        }
        guard let response = HTTPURLResponse(url: url, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: [
            "Content-Type": mimeType,
            "Content-Length": String(data.count),
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=31536000, immutable"
        ]) else {
            urlSchemeTask.didFailWithError(URLError(.badServerResponse))
            return
        }
        urlSchemeTask.didReceive(response)
        urlSchemeTask.didReceive(data)
        urlSchemeTask.didFinish()
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {
        // Each response completes synchronously; there is no outstanding async work.
    }
}
