use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

fn default_theme() -> String {
    "system".to_string()
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Settings {
    #[serde(default = "default_theme")]
    pub theme: String,
    #[serde(default)]
    pub notifications: bool,
    #[serde(default)]
    pub font_size: String,
    #[serde(default)]
    pub file_directory: String,
    #[serde(default)]
    pub recently_viewed_option: bool,
    #[serde(default)]
    pub api_key: Option<String>,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            theme: "system".to_string(),
            notifications: true,
            font_size: "medium".to_string(),
            file_directory: "".to_string(),
            recently_viewed_option: false,
            api_key: None,
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

    let current_settings = match fs::read_to_string(&settings_path) {
        Ok(data) => serde_json::from_str(&data).unwrap_or_default(),
        Err(_) => Settings::default(),
    };

    let new_settings = Settings {
        theme: if settings.theme.is_empty() {
            current_settings.theme
        } else {
            settings.theme
        },
        notifications: settings.notifications,
        font_size: if settings.font_size.is_empty() {
            current_settings.font_size
        } else {
            settings.font_size
        },
        file_directory: if settings.file_directory.is_empty() {
            current_settings.file_directory
        } else {
            settings.file_directory
        },
        recently_viewed_option: settings.recently_viewed_option,
        api_key: if settings.api_key.is_none() {
            current_settings.api_key
        } else {
            settings.api_key
        },
    };

    let json = serde_json::to_string_pretty(&new_settings)
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

pub fn get_api_key(app: &AppHandle) -> Result<String, String> {
    let settings_path = get_settings_path(app)?;

    let settings = match fs::read_to_string(&settings_path) {
        Ok(data) => serde_json::from_str::<Settings>(&data)
            .map_err(|e| format!("Failed to parse settings: {}", e))?,
        Err(_) => return Err("No settings file found".to_string()),
    };

    settings
        .api_key
        .ok_or_else(|| "No API key found".to_string())
}
