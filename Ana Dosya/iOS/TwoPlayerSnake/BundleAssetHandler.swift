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

    /// HTTPS documents reject active content from custom schemes as mixed content.
    /// Inject the packaged Socket.IO client as a WKUserScript and supply CSS with
    /// data-URL fonts. This keeps the page's HTTPS origin, storage and security policy.
    static func bootstrapScript(resourceDirectory: URL? = nil) throws -> String {
        func resource(_ name: String) throws -> Data {
            guard let url = resourceDirectory?.appendingPathComponent("WebAssets/" + name)
                ?? Bundle.main.url(forResource: "WebAssets/" + name, withExtension: nil) else {
                throw URLError(.fileDoesNotExist)
            }
            return try Data(contentsOf: url)
        }
        var css = String(decoding: try resource("fonts.css"), as: UTF8.self)
        for name in ["orbitron.ttf", "vt323.ttf"] {
            let dataURL = "data:font/ttf;base64," + (try resource(name)).base64EncodedString()
            css = css.replacingOccurrences(of: name, with: dataURL)
        }
        var icons = String(decoding: try resource("fontawesome.css"), as: UTF8.self)
        for name in ["fa-solid-900.woff2", "fa-regular-400.woff2", "fa-brands-400.woff2"] {
            let dataURL = "data:font/woff2;base64," + (try resource(name)).base64EncodedString()
            icons = icons.replacingOccurrences(of: "../webfonts/" + name, with: dataURL)
        }
        let json = try JSONSerialization.data(withJSONObject: [css + "\n" + icons])
        let cssLiteral = String(decoding: json, as: UTF8.self)
        let socket = String(decoding: try resource("socket.io.min.js"), as: UTF8.self)
        return socket + "\n;window.__twoPlayerSnakeNativeAssetCss = \(cssLiteral)[0];\n" +
            "window.__twoPlayerSnakeAssetBaseUrl = 'snake-asset://bundle/';"
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
        #if DEBUG
        print("WEBKIT bundle request: \(urlSchemeTask.request.url?.absoluteString ?? "nil")")
        #endif
        guard let url = urlSchemeTask.request.url,
              url.host == "bundle",
              let (path, mimeType) = resources[url.path],
              let fileURL = resourceDirectory?.appendingPathComponent(path)
                ?? Bundle.main.url(forResource: path, withExtension: nil),
              let data = try? Data(contentsOf: fileURL) else {
            urlSchemeTask.didFailWithError(URLError(.fileDoesNotExist))
            #if DEBUG
            print("WEBKIT bundle missing: \(urlSchemeTask.request.url?.absoluteString ?? "nil")")
            #endif
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
