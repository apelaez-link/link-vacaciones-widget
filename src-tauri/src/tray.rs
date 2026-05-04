use tauri::AppHandle;

pub fn update_icon(app: &AppHandle, state: &str, label: Option<&str>) -> Result<(), String> {
    let tray = app.tray_by_id("main").ok_or("tray not found")?;

    let icon_bytes: &[u8] = match state {
        "clocked_in" => include_bytes!("../icons/tray-in.png"),
        "clocked_out" => include_bytes!("../icons/tray-out.png"),
        _ => include_bytes!("../icons/tray-default.png"),
    };

    let icon = tauri::image::Image::from_bytes(icon_bytes).map_err(|e| e.to_string())?;
    tray.set_icon(Some(icon)).map_err(|e| e.to_string())?;

    let tooltip = match (state, label) {
        ("clocked_in", Some(l)) => format!("Link Fichajes · {}", l),
        ("clocked_in", None) => "Link Fichajes · Fichado".into(),
        ("clocked_out", _) => "Link Fichajes · Sin fichar".into(),
        _ => "Link Fichajes".into(),
    };
    tray.set_tooltip(Some(&tooltip)).map_err(|e| e.to_string())?;

    Ok(())
}
