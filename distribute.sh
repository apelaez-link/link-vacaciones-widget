#!/usr/bin/env bash
# distribute.sh — Build universal macOS DMG for Link Fichajes widget
# Usage: ./distribute.sh [version]
# Requires: Rust targets aarch64-apple-darwin + x86_64-apple-darwin, Node 20, Xcode CLT

set -euo pipefail

VERSION="${1:-$(grep '^version' src-tauri/tauri.conf.json | head -1 | sed 's/.*"\([0-9.]*\)".*/\1/')}"
echo "🔨 Building Link Fichajes v${VERSION} (universal)"

# Ensure targets are installed
rustup target add aarch64-apple-darwin x86_64-apple-darwin 2>/dev/null || true

# Install JS deps
npm ci

# Build universal binary
npm run tauri build -- --target universal-apple-darwin

DMG_SRC="src-tauri/target/universal-apple-darwin/release/bundle/dmg"
DMG_FILE=$(ls "${DMG_SRC}"/*.dmg 2>/dev/null | head -1)

if [ -z "$DMG_FILE" ]; then
  echo "❌ No DMG found in ${DMG_SRC}"
  exit 1
fi

DEST="LinkFichajes-v${VERSION}.dmg"
cp "$DMG_FILE" "$DEST"

echo ""
echo "✅ Done: ${DEST}"
echo "   $(du -sh "$DEST" | cut -f1)  —  ready to distribute"
