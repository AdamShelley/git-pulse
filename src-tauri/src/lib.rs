mod github;
mod obsidian;
mod settings;

use github::issues::check_cache_status;
use github::issues::fetch_issues;
use github::issues::fetch_repos;

use github::issues::IssuesCache;
use obsidian::save::save_to_obsidian;
use settings::settings::load_settings;
use settings::settings::save_settings;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(IssuesCache::default())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            save_to_obsidian,
            check_cache_status,
            fetch_issues,
            load_settings,
            save_settings,
            fetch_repos
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
