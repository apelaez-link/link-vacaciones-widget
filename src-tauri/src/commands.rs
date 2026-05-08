use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

use crate::auth;
#[cfg(desktop)]
use crate::tray;

// ── Token management ──────────────────────────────────────────────────────

#[tauri::command]
pub fn load_token() -> Result<Option<String>, String> {
    auth::load_token()
}

#[tauri::command]
pub fn delete_token() -> Result<(), String> {
    auth::delete_token()
}

#[tauri::command]
pub fn save_token(token: String) -> Result<(), String> {
    auth::save_token(&token)
}

// ── Tray icon control (no-op on mobile) ───────────────────────────────────

#[tauri::command]
pub fn set_tray_state(
    #[allow(unused_variables)] app: AppHandle,
    #[allow(unused_variables)] state: String,
    #[allow(unused_variables)] label: Option<String>,
) -> Result<(), String> {
    #[cfg(desktop)]
    return tray::update_icon(&app, &state, label.as_deref());
    #[cfg(not(desktop))]
    Ok(())
}

// ── Settings persistence (via tauri-plugin-store) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WidgetSettings {
    pub ref_in: String,
    pub ref_out: String,
    pub notify_checkin: bool,
    pub notify_checkout: bool,
    pub grace_minutes: i64,
}

impl Default for WidgetSettings {
    fn default() -> Self {
        Self {
            ref_in: "09:00".into(),
            ref_out: "18:00".into(),
            notify_checkin: true,
            notify_checkout: true,
            grace_minutes: 15,
        }
    }
}

const STORE_FILE: &str = "settings.json";
const SETTINGS_KEY: &str = "widget_settings";

#[tauri::command]
pub fn get_settings(app: AppHandle) -> Result<WidgetSettings, String> {
    let store = app.store(STORE_FILE).map_err(|e| e.to_string())?;
    let val = store.get(SETTINGS_KEY);
    match val {
        Some(v) => serde_json::from_value(v.clone()).map_err(|e| e.to_string()),
        None => Ok(WidgetSettings::default()),
    }
}

#[tauri::command]
pub fn save_settings(app: AppHandle, settings: WidgetSettings) -> Result<(), String> {
    let store = app.store(STORE_FILE).map_err(|e| e.to_string())?;
    store.set(
        SETTINGS_KEY,
        serde_json::to_value(&settings).map_err(|e| e.to_string())?,
    );
    store.save().map_err(|e| e.to_string())
}
