use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Settings {
    theme: String,
    notifications: bool,
    font_size: String,
    file_directory: String,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            theme: "system".to_string(),
            notifications: true,
            font_size: "medium".to_string(),
            file_directory: "".to_string(),
        }
    }
}

#[tauri::command]
pub async fn load_settings(app: AppHandle) -> Result<Settings, String> {
    let settings_path = get_settings_path(&app)?;

    match fs::read_to_string(&settings_path) {
        Ok(contents) => {
            serde_json::from_str(&contents).map_err(|e| format!("Failed to parse settings: {}", e))
        }
        Err(_) => Ok(Settings::default()),
    }
}

#[tauri::command]
pub async fn save_settings(app: AppHandle, settings: Settings) -> Result<(), String> {
    let settings_path = get_settings_path(&app)?;

    let json = serde_json::to_string_pretty(&settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;

    fs::write(&settings_path, json).map_err(|e| format!("Failed to write settings: {}", e))
}

fn get_settings_path(app: &AppHandle) -> Result<PathBuf, String> {
    let config_dir = app
        .path()
        .app_config_dir()
        .expect("Failed to get config directory");

    // Create directory if it doesn't exist
    fs::create_dir_all(&config_dir)
        .map_err(|e| format!("Failed to create config directory: {}", e))?;

    Ok(config_dir.join("settings.json"))
}
