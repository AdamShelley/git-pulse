use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{command, AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RecentItem {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Recents {
    items: Vec<RecentItem>,
}

impl Default for Recents {
    fn default() -> Self {
        Self { items: Vec::new() }
    }
}

impl Recents {
    pub fn add_item(&mut self, item: RecentItem) {
        self.items.retain(|x| x.id != item.id);

        self.items.insert(0, item);

        if self.items.len() > 5 {
            self.items.truncate(10);
        }
    }
}

fn get_recents_path(app: &AppHandle) -> Result<PathBuf, String> {
    let config_dir = app
        .path()
        .app_config_dir()
        .expect("Failed to get config directory");

    // Create directory if it doesn't exist
    fs::create_dir_all(&config_dir)
        .map_err(|e| format!("Failed to create config directory: {}", e))?;

    Ok(config_dir.join("recents.json"))
}

#[command]
pub async fn load_recents(app: AppHandle) -> Result<Recents, String> {
    let recents_path = get_recents_path(&app)?;

    match fs::read_to_string(&recents_path) {
        Ok(contents) => {
            serde_json::from_str(&contents).map_err(|e| format!("Failed to parse settings: {}", e))
        }
        Err(_) => Ok(Recents::default()),
    }
}

#[command]
pub async fn save_recents(app: AppHandle, recents: Recents) -> Result<(), String> {
    let recents_path = get_recents_path(&app)?;

    let json = serde_json::to_string_pretty(&recents)
        .map_err(|e| format!("Failed to serialize recents: {}", e))?;

    fs::write(&recents_path, json).map_err(|e| format!("Failed to write recents to file: {}", e))
}

#[command]
pub async fn add_recent_item(app: AppHandle, id: String, name: String) -> Result<Recents, String> {
    let mut recents = load_recents(app.clone()).await?;
    recents.add_item(RecentItem { id, name });
    save_recents(app.clone(), recents.clone()).await?;
    Ok(recents)
}

#[tauri::command]
pub async fn clear_recents(app: AppHandle) -> Result<(), String> {
    save_recents(app, Recents::default()).await
}
