mod github;
mod obsidian;

use obsidian::save::save_to_obsidian;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![save_to_obsidian])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
