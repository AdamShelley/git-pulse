mod github;
mod obsidian;

use github::issues::fetch_issues;
use obsidian::save::save_to_obsidian;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .invoke_handler(tauri::generate_handler![save_to_obsidian, fetch_issues])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
