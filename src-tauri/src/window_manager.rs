use serde::{Deserialize, Serialize};
use std::fs;
use tauri::Manager;

#[derive(Serialize, Deserialize)]
struct WindowPosition {
    x: i32,
    y: i32,
}

pub fn save_window_position(window: &tauri::WebviewWindow) {
    if let Ok(position) = window.outer_position() {
        let window_pos = WindowPosition {
            x: position.x,
            y: position.y,
        };

        if let Ok(path) = window.app_handle().path().app_data_dir() {
            let config_path = path.join("window-position.json");
            let _ = fs::write(config_path, serde_json::to_string(&window_pos).unwrap());
        }
    }
}

pub fn restore_window_position(window: &tauri::WebviewWindow) {
    if let Ok(path) = window.app_handle().path().app_data_dir() {
        let config_path = path.join("window-position.json");
        if let Ok(position_str) = fs::read_to_string(config_path) {
            if let Ok(position) = serde_json::from_str::<WindowPosition>(&position_str) {
                if position.x >= 0 && position.y >= 0 {
                    let _ = window.set_position(tauri::Position::Physical(
                        tauri::PhysicalPosition::new(position.x, position.y),
                    ));
                }
            }
        }
    }
}

pub fn setup_window_management(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let window = app.get_webview_window("main").unwrap();

    restore_window_position(&window);

    let window_clone = window.clone();
    window.on_window_event(move |event| {
        if let tauri::WindowEvent::Destroyed = event {
            save_window_position(&window_clone);
        }
    });

    Ok(())
}
