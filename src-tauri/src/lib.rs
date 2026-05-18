mod auth;
mod commands;
#[cfg(desktop)]
mod tray;

use tauri::{Emitter, Manager, RunEvent};
use tauri_plugin_deep_link::DeepLinkExt;

#[cfg(desktop)]
use tauri::tray::{TrayIconBuilder, TrayIconEvent};

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
            // macOS: forzar accessory policy en runtime. LSUIElement=true en Info.plist no basta —
            // el runtime de Tauri arranca con Regular y eso hace aparecer el icono en Dock/Cmd+Tab.
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            // Register URL scheme at runtime (macOS dev mode)
            #[cfg(target_os = "macos")]
            if let Err(e) = app.deep_link().register("linkfichajes") {
                eprintln!("[widget] deep_link register: {e}");
            }

            // Listen for deep link URL scheme events: linkfichajes://auth?token=...
            let handle_for_deeplink = app.handle().clone();
            app.deep_link().on_open_url(move |event| {
                let urls: Vec<String> = event.urls().iter().map(|u| u.to_string()).collect();
                let handle = handle_for_deeplink.clone();
                // Spawn a background thread so store I/O never blocks the main thread
                // (avoids ANR on Android when the deep link arrives on cold start)
                std::thread::spawn(move || {
                    for url in urls {
                        handle_deep_link(&handle, &url);
                    }
                });
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
                                    // Reaplicar config nativa ANTES del show: el level/collectionBehavior
                                    // puede haberse perdido tras hide() o set_position().
                                    #[cfg(target_os = "macos")]
                                    configure_popover_for_fullscreen(&window);
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                    // Y también DESPUÉS — algunos parámetros (especialmente level)
                                    // los reescribe Tauri en orderFront a NSFloatingWindowLevel.
                                    #[cfg(target_os = "macos")]
                                    {
                                        configure_popover_for_fullscreen(&window);
                                        // makeKeyWindow explícito: Tauri usa makeKeyAndOrderFront
                                        // pero ese path puede saltarse el makeKey si la ventana
                                        // antes era NSWindow y se ha re-clasificado en runtime.
                                        make_popover_key(&window);
                                        // Asegurar que la WKWebView reciba los keyDown.
                                        force_webview_first_responder(&window);
                                    }
                                    let _ = window.emit("widget-focused", ());
                                }
                            }
                        }
                    })
                    .build(app)?;

                // Popover debe aparecer sobre apps en pantalla completa (Chrome, Teams, …).
                // Sin esto, NSWindow vive en el Space del escritorio y al hacer show()
                // desde un Space fullscreen macOS no la muestra.
                #[cfg(target_os = "macos")]
                if let Some(popover) = app.get_webview_window("popover") {
                    configure_popover_for_fullscreen(&popover);
                }

                // Cerrar popover al clicar fuera (compensa que NonactivatingPanel impide
                // que el panel se vuelva key window y dispare el evento Focused(false)).
                #[cfg(target_os = "macos")]
                install_global_click_monitor(app.handle());

                register_sleep_listener(app.handle().clone());
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            // No ocultamos el popover en Focused(false): en pantalla completa, mover el ratón
            // muestra la menu bar y el sistema le quita el foco a la panel, lo que dispararía
            // este evento y cerraría el popover en cuanto el usuario mueve el cursor.
            // El cierre por "clic fuera" lo gestiona install_global_click_monitor.
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
                    // On mobile, the WebView may not have loaded yet on cold start.
                    // The token is already in the store so initAuth() will pick it up.
                    // A short delay ensures the auth:token-received listener is registered.
                    #[cfg(not(desktop))]
                    std::thread::sleep(std::time::Duration::from_millis(2500));
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

/// Subclase dinámica de NSPanel que sobrescribe `canBecomeKeyWindow` para devolver YES
/// incluso con NonactivatingPanel. Con el mask por defecto NSPanel devuelve NO y los inputs
/// (login, ajustes) no reciben teclado. Forzando YES, el panel sí recibe input — y como
/// mantenemos NonactivatingPanel, activarse como key no activa la app ni la saca del
/// Space fullscreen donde apareció.
#[cfg(target_os = "macos")]
fn link_panel_class() -> &'static objc2::runtime::AnyClass {
    use objc2::declare::ClassBuilder;
    use objc2::runtime::{AnyObject, Bool, Sel};
    use objc2::{sel, ClassType};
    use objc2_app_kit::NSPanel;
    use std::sync::OnceLock;

    static CLASS: OnceLock<&'static objc2::runtime::AnyClass> = OnceLock::new();
    CLASS.get_or_init(|| {
        let mut builder = ClassBuilder::new(c"LinkPanel", NSPanel::class())
            .expect("LinkPanel class already registered");

        extern "C" fn can_become_key_window(_: *mut AnyObject, _: Sel) -> Bool {
            Bool::YES
        }

        unsafe {
            builder.add_method(
                sel!(canBecomeKeyWindow),
                can_become_key_window as extern "C" fn(*mut AnyObject, Sel) -> Bool,
            );
        }

        builder.register()
    })
}

#[cfg(target_os = "macos")]
fn configure_popover_for_fullscreen(window: &tauri::WebviewWindow) {
    use objc2::runtime::AnyObject;
    use objc2_app_kit::{NSWindow, NSWindowCollectionBehavior, NSWindowStyleMask};

    let ns_window_ptr = match window.ns_window() {
        Ok(ptr) if !ptr.is_null() => ptr as *mut NSWindow,
        Ok(_) => {
            eprintln!("[widget] configure_popover_for_fullscreen: ns_window() devolvió null");
            return;
        }
        Err(e) => {
            eprintln!("[widget] configure_popover_for_fullscreen: ns_window() error: {e}");
            return;
        }
    };

    let behavior = NSWindowCollectionBehavior::CanJoinAllSpaces
        | NSWindowCollectionBehavior::FullScreenAuxiliary
        | NSWindowCollectionBehavior::Stationary;

    // NSStatusWindowLevel = 25 — por encima de la menu bar (24), debajo de los pop-up menus (101).
    const NS_STATUS_WINDOW_LEVEL: isize = 25;

    unsafe {
        // macOS solo permite que aparezcan sobre apps fullscreen las ventanas que son NSPanel
        // (NSWindow normal no sirve, ni siquiera con fullScreenAuxiliary). Reescribimos la clase
        // a una subclase de NSPanel que también acepta volverse key window (para los inputs).
        let obj_ptr: *mut AnyObject = ns_window_ptr as *mut AnyObject;
        let _ = AnyObject::set_class(&*obj_ptr, link_panel_class());

        let win: &NSWindow = &*ns_window_ptr;

        // NonactivatingPanel es necesario: sin él el panel no aparece sobre apps fullscreen.
        // Como contrapartida, el panel nunca se vuelve key window y por tanto el evento
        // `Focused(false)` no se dispara — el auto-hide al clicar fuera lo resolvemos con un
        // global mouse monitor (ver install_global_click_monitor).
        let style = NSWindowStyleMask::Borderless | NSWindowStyleMask::NonactivatingPanel;
        win.setStyleMask(style);

        win.setCollectionBehavior(behavior);
        win.setLevel(NS_STATUS_WINDOW_LEVEL);
    }
}

#[cfg(target_os = "macos")]
fn make_popover_key(window: &tauri::WebviewWindow) {
    use objc2_app_kit::NSWindow;

    let Ok(ptr) = window.ns_window() else { return };
    if ptr.is_null() {
        return;
    }
    unsafe {
        let win: &NSWindow = &*(ptr as *const NSWindow);
        win.makeKeyWindow();
    }
}

/// Aunque la NSPanel sea key window, los keyDown van a su firstResponder. Tras
/// re-clasificar la ventana a LinkPanel/NSPanel, la WKWebView interna deja de ser
/// firstResponder y los inputs no reciben teclado. Forzamos que vuelva a serlo.
#[cfg(target_os = "macos")]
fn force_webview_first_responder(window: &tauri::WebviewWindow) {
    let _ = window.with_webview(|webview| {
        use objc2::msg_send;
        use objc2::runtime::AnyObject;

        let ns_window_ptr: *mut AnyObject = webview.ns_window() as *mut AnyObject;
        let wk_webview_ptr: *mut AnyObject = webview.inner() as *mut AnyObject;

        if ns_window_ptr.is_null() || wk_webview_ptr.is_null() {
            eprintln!("[widget] force_webview_first_responder: punteros nulos");
            return;
        }

        unsafe {
            let _: bool = msg_send![ns_window_ptr, makeFirstResponder: wk_webview_ptr];
        }
    });
}

#[cfg(target_os = "macos")]
fn install_global_click_monitor(app: &tauri::AppHandle) {
    use block2::RcBlock;
    use objc2_app_kit::{NSEvent, NSEventMask};
    use std::ptr::NonNull;

    let handle = app.clone();
    let block = RcBlock::new(move |_event: NonNull<NSEvent>| {
        // El global monitor solo recibe eventos de OTRAS apps. Si llega un mouse-down,
        // el clic fue fuera del popover → ocultamos.
        if let Some(window) = handle.get_webview_window("popover") {
            if window.is_visible().unwrap_or(false) {
                let _ = window.hide();
            }
        }
    });

    let mask = NSEventMask::LeftMouseDown
        | NSEventMask::RightMouseDown
        | NSEventMask::OtherMouseDown;
    let monitor = NSEvent::addGlobalMonitorForEventsMatchingMask_handler(mask, &block);
    // El monitor debe permanecer vivo durante toda la vida de la app. Filtrarlo es OK:
    // se libera cuando el proceso termina.
    std::mem::forget(monitor);
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
