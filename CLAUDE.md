# Link Fichajes — Widget macOS

macOS menu bar app for check-in/check-out on the Link Vacaciones platform.
Built with Tauri 2.x + Svelte 5 + TypeScript.

## Prerequisites

- **Rust** (stable): `curl https://sh.rustup.rs | sh`
- **Xcode Command Line Tools**: `xcode-select --install`
- **Node.js 20+**: `brew install node` or https://nodejs.org
- **macOS 13 (Ventura)+** for development and distribution

## Development

```bash
npm install
npm run tauri dev
```

The app opens in dev mode. Deep link (`linkfichajes://`) won't work without a signed .app bundle — use the token paste section (only visible in dev) to authenticate.

## Build

### Debug (fast, for testing)
```bash
npm run tauri build -- --debug
open "src-tauri/target/debug/bundle/macos/Link Fichajes.app"
```

### Release DMG (universal binary)
```bash
./distribute.sh
# Outputs: LinkFichajes-v0.1.0.dmg
```

## Architecture

- **Auth**: Deep link `linkfichajes://auth?token=...` from web (`/api/auth/widget-callback`)
- **Token storage**: macOS Keychain via `security-framework` crate
- **API**: `tauri-plugin-http` routes requests through Rust/reqwest with `Authorization: Bearer <token>`
- **Tray icon**: 3 states — clocked out (default), clocked in (green), closed (grey)
- **Notifications**: Local, scheduled via `setTimeout`, respects 30-min cooldown

## Environment

```
VITE_API_BASE_URL=https://vacaciones.smartcity.link   # production (default)
VITE_API_BASE_URL=http://localhost:3000                # local dev
```

## Key files

| Path | Purpose |
|------|---------|
| `src-tauri/src/lib.rs` | App bootstrap, tray, deep link, sleep listener |
| `src-tauri/src/commands.rs` | Tauri commands exposed to frontend |
| `src-tauri/src/auth.rs` | Keychain read/write |
| `src-tauri/src/tray.rs` | Tray icon state updates |
| `src/App.svelte` | Router + polling + notifications |
| `src/lib/api.ts` | All API calls |
| `src/lib/notifications.ts` | Notification scheduling logic |
| `src/stores/` | Svelte stores for auth, checkin, settings |
