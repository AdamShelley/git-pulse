use serde::{Deserialize, Serialize};
use std::fs;
use tauri::Manager;

#[derive(Serialize, Deserialize, Debug)]
struct WindowPosition {
    x: i32,
    y: i32,
}

fn get_config_file_path(window: &tauri::WebviewWindow) -> Option<std::path::PathBuf> {
    match window.app_handle().path().app_data_dir() {
        Ok(mut path) => {
            path.push("window-position.json");
            Some(path)
        }
        Err(e) => {
            println!("Failed to get app data directory: {:?}", e);
            None
        }
    }
}

pub fn save_window_position(window: &tauri::WebviewWindow) {
    if let Ok(position) = window.outer_position() {
        let window_pos = WindowPosition {
            x: position.x,
            y: position.y,
        };

        if let Some(config_path) = get_config_file_path(window) {
            // Ensure directory exists
            if let Some(parent) = config_path.parent() {
                if let Err(e) = fs::create_dir_all(parent) {
                    println!("Failed to create directory: {:?}", e);
                    return;
                }
            }

            match fs::write(
                &config_path,
                serde_json::to_string_pretty(&window_pos).unwrap(),
            ) {
                Ok(_) => println!("Successfully saved window position to {:?}", config_path),
                Err(e) => println!("Failed to save window position: {:?}", e),
            }
        }
    }
}

pub fn restore_window_position(window: &tauri::WebviewWindow) {
    if let Some(config_path) = get_config_file_path(window) {
        if !config_path.exists() {
            return;
        }

        match fs::read_to_string(&config_path) {
            Ok(content) => match serde_json::from_str::<WindowPosition>(&content) {
                Ok(position) => {
                    if position.x >= 0 && position.y >= 0 {
                        let _ = window.set_position(tauri::Position::Physical(
                            tauri::PhysicalPosition::new(position.x, position.y),
                        ));
                    }
                }
                Err(e) => println!("Failed to parse position data: {:?}", e),
            },
            Err(e) => println!("Failed to read config file: {:?}", e),
        }
    }
}

pub fn setup_window_management(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let window = app.get_webview_window("main").unwrap();

    restore_window_position(&window);

    let window_clone = window.clone();
    window.on_window_event(move |event| match event {
        tauri::WindowEvent::CloseRequested { .. } => {
            save_window_position(&window_clone);
        }
        _ => {}
    });

    Ok(())
}
