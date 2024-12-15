mod ais;
mod check_auth;
mod github;
mod obsidian;
mod recents;
mod settings;
mod window_manager;

use dotenvy::dotenv;
use std::env;
use tauri::Manager;
use window_vibrancy::{apply_blur, apply_vibrancy, NSVisualEffectMaterial};

use github::github_client::init_github_client;
use github::issues::check_cache_status;
use github::issues::create_new_issue;
use github::issues::fetch_issues;
use github::issues::get_cached_issue;
use github::issues::get_pinned_repos;
use github::issues::save_pinned_repos;
use github::issues::IssuesCache;

use github::oauth::get_stored_auth;
use obsidian::save::save_to_obsidian;

use settings::settings::load_settings;
use settings::settings::save_settings;

use recents::recents::add_recent_item;
use recents::recents::clear_recents;
use recents::recents::load_recents;
use recents::recents::save_recents;

use github::interactions::add_issue_comment;

use github::oauth::get_username;
use github::oauth::initiate_device_login;
use github::oauth::poll_for_token;

use github::repos::add_repos_to_store;
use github::repos::fetch_repos;
use github::repos::get_repos_from_store;

use ais::changelog::generate_and_save_changelog;

use tauri_plugin_store::StoreExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    dotenv().expect("Failed to load .env file");

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .manage(IssuesCache::default())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
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
            check_auth::check_auth,
            add_repos_to_store,
            get_repos_from_store,
            get_pinned_repos,
            save_pinned_repos,
            create_new_issue,
            generate_and_save_changelog,
            get_username
        ])
        .setup(|app| {
            // Initialize the store
            let _store = app.store("auth.json")?;
            let _repo_store = app.store("repos.json")?;

            let app_handle = app.handle();
            let main_window = app_handle.get_webview_window("main").unwrap();

            // Window management
            window_manager::setup_window_management(app)?;

            // Vibrancy
            #[cfg(target_os = "macos")]
            apply_vibrancy(
                &main_window,
                NSVisualEffectMaterial::HudWindow,
                None,
                Some(8_f64),
            )
            .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

            tauri::async_runtime::block_on(async move {
                match get_stored_auth(&app_handle) {
                    Ok(Some(_)) => {
                        init_github_client(&app_handle)?;
                    }
                    Ok(None) => {
                        // Do nothing
                    }
                    Err(e) => {
                        println!("Error: {}", e);
                    }
                }
                Ok::<(), String>(())
            })
            .expect("Runtime error during setup");

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
