use super::oauth::get_token;
use octocrab::Octocrab;
use std::sync::OnceLock;
use tauri::AppHandle;

static GITHUB_CLIENT: OnceLock<Octocrab> = OnceLock::new();

pub fn init_github_client(app: &AppHandle) -> Result<(), String> {
    let token = get_token(app)?;

    // Create new client
    let octocrab = octocrab::OctocrabBuilder::new()
        .personal_token(token)
        .build()
        .map_err(|e| e.to_string())?;

    // Try to set the client, but handle if it's already set
    match GITHUB_CLIENT.set(octocrab) {
        Ok(_) => Ok(()),
        Err(_) => {
            // If it's already set, that's fine
            // You might want to log this for debugging
            println!("GitHub client was already initialized");
            Ok(())
        }
    }
}

pub fn get_client() -> Result<Octocrab, String> {
    GITHUB_CLIENT
        .get()
        .ok_or("GitHub client not initialized".to_string())
        .map(|client| client.clone())
}
