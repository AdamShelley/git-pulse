mod check_auth;
mod github;
mod obsidian;
mod recents;
mod settings;

use std::env;

use dotenvy::dotenv;

use github::issues::check_cache_status;
use github::issues::fetch_issues;
use github::issues::fetch_repos;
use github::issues::get_cached_issue;
use github::issues::IssuesCache;

use obsidian::save::save_to_obsidian;

use settings::settings::load_settings;
use settings::settings::save_settings;

use recents::recents::add_recent_item;
use recents::recents::clear_recents;
use recents::recents::load_recents;
use recents::recents::save_recents;

use github::interactions::add_issue_comment;

use github::oauth::initiate_device_login;
use github::oauth::poll_for_token;

use tauri_plugin_store::StoreExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    dotenv().expect("Failed to load .env file");

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
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
            save_recents,
            get_cached_issue,
            add_issue_comment,
            initiate_device_login,
            poll_for_token,
            check_auth::check_auth
        ])
        .setup(|app| {
            // Initialize the store
            let store = app.store("auth.json")?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
