import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const host = process.env.TAURI_DEV_HOST;
// Each platform uses a different port so all three can run simultaneously:
//   macOS  → 1420  (cargo tauri dev)
//   iOS    → 1421  (cargo tauri ios dev)
//   Android→ 1422  (cargo tauri android dev)
const port = Number(process.env.VITE_PORT) || 1420;

export default defineConfig({
  plugins: [svelte()],
  clearScreen: false,
  server: {
    port,
    strictPort: true,
    host: host || false,
    // HMR websocket uses port+1 when binding to an external host (Android physical device)
    hmr: host ? { protocol: 'ws', host, port: port + 1 } : undefined,
    watch: { ignored: ['**/src-tauri/**'] },
  },
  build: {
    target: ['es2021', 'safari13'],
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
  envPrefix: ['VITE_', 'TAURI_ENV_'],
});
