#!/usr/bin/env bash
set -euo pipefail
node --test tests/ios-runtime.test.cjs
smoke_dir="$(mktemp -d -t snake-webkit)"
xcrun swiftc -DDEBUG -swift-version 5 -framework AppKit -framework WebKit \
  "Ana Dosya/iOS/TwoPlayerSnake/BundleAssetHandler.swift" tests/macos/main.swift \
  -o "$smoke_dir/snake-webkit-smoke"
"$smoke_dir/snake-webkit-smoke"
