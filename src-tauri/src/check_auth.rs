use tauri::{command, AppHandle};
use tauri_plugin_store::StoreExt;

pub fn get_stored_token(app: &tauri::AppHandle) -> Result<String, String> {
    let store = app
        .store("auth.json")
        .map_err(|e| format!("Failed to access store: {}", e))?;

    store
        .get("github_token")
        .ok_or("No token found".to_string())?
        .as_str()
        .ok_or("Token is not a string".to_string())
        .map(String::from)
}

#[command]
pub async fn check_auth(app: AppHandle) -> Result<bool, String> {
    // First check if we have a token
    let token = match get_stored_token(&app) {
        Ok(token) => token,
        Err(_) => return Ok(false),
    };

    // Verify token is valid by making a test request
    let octocrab = octocrab::OctocrabBuilder::new()
        .personal_token(token)
        .build()
        .map_err(|_| "Failed to create client".to_string())?;

    // Try to get user info - this will fail if token is invalid
    match octocrab.current().user().await {
        Ok(_) => Ok(true),
        Err(_) => Ok(false),
    }
}
