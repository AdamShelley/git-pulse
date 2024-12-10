use tauri::{command, AppHandle};

use super::github::github_client::init_github_client;
use super::github::oauth::get_stored_auth;

#[command]
pub async fn check_auth(app: AppHandle) -> Result<bool, String> {
    let auth_state = match get_stored_auth(&app) {
        Ok(Some(auth)) => auth,
        Ok(None) => return Ok(false),
        Err(_) => return Ok(false),
    };

    let octocrab = octocrab::OctocrabBuilder::new()
        .personal_token(auth_state.token)
        .build()
        .map_err(|_| "Failed to create client".to_string())?;

    match octocrab.current().user().await {
        Ok(_) => {
            // Try to initialize, but don't fail if it doesn't work
            if let Err(e) = init_github_client(&app) {
                println!("Warning: Failed to initialize GitHub client: {}", e);
            }
            Ok(true)
        }
        Err(_) => Ok(false),
    }
}
