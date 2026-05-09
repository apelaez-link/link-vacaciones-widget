mod auth;
mod commands;
#[cfg(desktop)]
mod tray;

use tauri::{Emitter, Manager, RunEvent};
use tauri_plugin_deep_link::DeepLinkExt;

#[cfg(desktop)]
use tauri::{
    tray::{TrayIconBuilder, TrayIconEvent},
    WindowEvent,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[allow(unused_mut)]
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            commands::load_token,
            commands::delete_token,
            commands::save_token,
            commands::set_tray_state,
            commands::get_settings,
            commands::save_settings,
        ]);

    // shell plugin (needed on all platforms for open() — opens URLs in system browser)
    builder = builder.plugin(tauri_plugin_shell::init());

    // Desktop-only plugins
    #[cfg(not(mobile))]
    {
        builder = builder.plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec![]),
        ));
    }

    builder
        .setup(|app| {
            // Register URL scheme at runtime (macOS dev mode)
            #[cfg(target_os = "macos")]
            if let Err(e) = app.deep_link().register("linkfichajes") {
                eprintln!("[widget] deep_link register: {e}");
            }

            // Listen for deep link URL scheme events: linkfichajes://auth?token=...
            let handle_for_deeplink = app.handle().clone();
            app.deep_link().on_open_url(move |event| {
                for url in event.urls() {
                    handle_deep_link(&handle_for_deeplink, url.as_str());
                }
            });

            // ── Desktop only: tray icon + sleep listener ──
            #[cfg(desktop)]
            {
                let handle = app.handle().clone();

                TrayIconBuilder::with_id("main")
                    .icon(app.default_window_icon().unwrap().clone())
                    .tooltip("Link Fichajes")
                    .on_tray_icon_event(move |_tray, event| {
                        if let TrayIconEvent::Click {
                            button: tauri::tray::MouseButton::Left,
                            button_state: tauri::tray::MouseButtonState::Up,
                            rect,
                            ..
                        } = event
                        {
                            let app = &handle;
                            if let Some(window) = app.get_webview_window("popover") {
                                if window.is_visible().unwrap_or(false) {
                                    let _ = window.hide();
                                } else {
                                    let win_width = 320.0_f64;
                                    let (ix, iy, iw, ih) = rect_to_f64(&rect);
                                    let x = ix + iw / 2.0 - win_width / 2.0;
                                    let y = iy + ih + 4.0;
                                    let _ = window
                                        .set_position(tauri::PhysicalPosition::new(x, y));
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                    let _ = window.emit("widget-focused", ());
                                }
                            }
                        }
                    })
                    .build(app)?;

                register_sleep_listener(app.handle().clone());
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            // Auto-hide popover on focus loss (macOS only)
            #[cfg(desktop)]
            if let WindowEvent::Focused(false) = event {
                if window.label() == "popover" {
                    let _ = window.hide();
                }
            }
            let _ = (window, event);
        })
        .build(tauri::generate_context!())
        .expect("error building tauri application")
        .run(|_app, event| {
            // RunEvent::Opened is a fallback for when the app is launched via URL scheme
            #[cfg(any(target_os = "macos", target_os = "ios"))]
            if let RunEvent::Opened { ref urls } = event {
                for url in urls {
                    handle_deep_link(_app, url.as_str());
                }
            }
            let _ = (_app, &event);
        });
}

#[cfg(desktop)]
fn rect_to_f64(rect: &tauri::Rect) -> (f64, f64, f64, f64) {
    let (x, y) = match rect.position {
        tauri::Position::Physical(ref p) => (p.x as f64, p.y as f64),
        tauri::Position::Logical(ref p) => (p.x, p.y),
    };
    let (w, h) = match rect.size {
        tauri::Size::Physical(ref s) => (s.width as f64, s.height as f64),
        tauri::Size::Logical(ref s) => (s.width, s.height),
    };
    (x, y, w, h)
}

fn save_token_cross_platform(app: &tauri::AppHandle, token: &str) -> Result<(), String> {
    #[cfg(not(desktop))]
    {
        use tauri_plugin_store::StoreExt;
        let store = app.store("auth.json").map_err(|e| e.to_string())?;
        store.set("session-token", token.to_string());
        store.save().map_err(|e| e.to_string())
    }
    #[cfg(desktop)]
    {
        let _ = app;
        auth::save_token(token)
    }
}

fn handle_deep_link(app: &tauri::AppHandle, url: &str) {
    if !url.starts_with("linkfichajes://") {
        return;
    }
    if let Some(query) = url.split('?').nth(1) {
        for pair in query.split('&') {
            let mut parts = pair.splitn(2, '=');
            if parts.next() == Some("token") {
                if let Some(token) = parts.next() {
                    let decoded = percent_decode(token);
                    if let Err(e) = save_token_cross_platform(app, &decoded) {
                        eprintln!("[widget] Failed to save token: {}", e);
                        return;
                    }
                    let _ = app.emit("auth:token-received", decoded);
                    // On desktop: bring window to front
                    #[cfg(desktop)]
                    if let Some(window) = app.get_webview_window("popover") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
            }
        }
    }
}

fn percent_decode(s: &str) -> String {
    let mut result = String::with_capacity(s.len());
    let bytes = s.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'%' && i + 2 < bytes.len() {
            let hex = &bytes[i + 1..i + 3];
            if hex.iter().all(|b| b.is_ascii_hexdigit()) {
                if let Ok(s) = std::str::from_utf8(hex) {
                    if let Ok(b) = u8::from_str_radix(s, 16) {
                        result.push(b as char);
                        i += 3;
                        continue;
                    }
                }
            }
        } else if bytes[i] == b'+' {
            result.push(' ');
            i += 1;
            continue;
        }
        result.push(bytes[i] as char);
        i += 1;
    }
    result
}

#[cfg(desktop)]
fn register_sleep_listener(app: tauri::AppHandle) {
    std::thread::spawn(move || {
        let mut last = std::time::Instant::now();
        loop {
            std::thread::sleep(std::time::Duration::from_secs(5));
            if last.elapsed() > std::time::Duration::from_secs(30) {
                let _ = app.emit("system:will-sleep", ());
            }
            last = std::time::Instant::now();
        }
    });
}
