mod github;
mod obsidian;
mod recents;
mod settings;

use github::issues::check_cache_status;
use github::issues::fetch_issues;
use github::issues::fetch_repos;
use github::issues::IssuesCache;

use obsidian::save::save_to_obsidian;

use settings::settings::load_settings;
use settings::settings::save_settings;

use recents::recents::add_recent_item;
use recents::recents::clear_recents;
use recents::recents::load_recents;
use recents::recents::save_recents;

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
            fetch_repos,
            clear_recents,
            add_recent_item,
            load_recents,
            save_recents
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
