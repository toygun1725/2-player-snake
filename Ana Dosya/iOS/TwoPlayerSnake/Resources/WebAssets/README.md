# Bundled web resources (iOS Build 36)

Used by both the HTTPS game and the offline fallback. `bootstrapScript()` supplies
Socket.IO through WKUserScript and font CSS with data-URL fonts, because HTTPS pages
block active custom-scheme resources as mixed content. The `snake-asset://bundle/`
handler serves the logo from a fixed whitelist. The logo remains
the existing `Resources/Offline/offline_logo.png`; it is not duplicated here.

Sources retrieved 2026-09-15:

- Orbitron variable TTF: Google Fonts `google/fonts`, `ofl/orbitron/Orbitron[wght].ttf`.
- VT323 TTF: Google Fonts `google/fonts`, `ofl/vt323/VT323-Regular.ttf`.
- Both fonts: SIL Open Font License, see `Orbitron-OFL.txt` and `VT323-OFL.txt`.
- Font Awesome Free 6.5.1: cdnjs `font-awesome/6.5.1/css/all.min.css` and its three
  WOFF2 fonts (solid, regular, brands). Upstream `FortAwesome/Font-Awesome` tag 6.5.1,
  see `FontAwesome-LICENSE.txt` (fonts: OFL; CSS: MIT).
- Socket.IO client 4.7.5: `https://cdn.socket.io/4.7.5/socket.io.min.js`.
  Upstream `socketio/socket.io-client` tag 4.7.5, see `SocketIO-LICENSE.txt` (MIT).
- `fonts.css` is the project's local font-face declaration, not a downloaded file.

The original web/Android URLs remain in the online HTML's non-native branch.
The offline HTML still uses its offline Socket.IO stub and does not connect to servers.
Changing a dependency here requires matching its license/version and rerunning
`bash tools/test-ios-runtime.sh` on macOS.
