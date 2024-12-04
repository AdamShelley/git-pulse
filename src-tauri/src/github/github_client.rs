use super::oauth::get_stored_token;
use octocrab::Octocrab;
use std::sync::OnceLock;
use tauri::AppHandle;

static GITHUB_CLIENT: OnceLock<Octocrab> = OnceLock::new();

pub fn init_github_client(app: &AppHandle) -> Result<(), String> {
    let token = get_stored_token(app).map_err(|e| e.to_string())?;

    let octocrab = octocrab::OctocrabBuilder::new()
        .personal_token(token)
        .build()
        .map_err(|e| e.to_string())?;

    GITHUB_CLIENT
        .set(octocrab)
        .map_err(|_| "Failed to set GitHub client".to_string())?;
    Ok(())
}

pub fn get_client() -> &'static Octocrab {
    GITHUB_CLIENT.get().expect("GitHub client not initialized")
}
