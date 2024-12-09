use serde::{Deserialize, Serialize};
use serde_json::{self, json};
use tauri::{command, AppHandle};
use tauri_plugin_store::{Store, StoreExt};

use super::github_client::get_client;

#[derive(Serialize, Deserialize)]
pub struct DeviceCodeResponse {
    pub device_code: String,
    pub user_code: String,
    pub verification_uri: String,
    pub expires_in: u32,
    pub interval: u32,
}

#[derive(Serialize, Deserialize)]
struct TokenResponse {
    access_token: String,
    token_type: String,
    scope: String,
}

#[derive(Deserialize)]
#[serde(untagged)]
enum TokenOrError {
    Token(TokenResponse),
    Error {
        error: String,
        error_description: Option<String>,
        interval: Option<u32>,
    },
}

#[derive(serde::Serialize, serde::Deserialize, Clone)]
pub struct AuthState {
    token: String,
}

#[command]
pub async fn initiate_device_login() -> Result<DeviceCodeResponse, String> {
    let client = reqwest::Client::new();

    let response = client
        .post("https://github.com/login/device/code")
        .header("Accept", "application/json")
        .form(&[
            ("client_id", std::env::var("GITHUB_CLIENT_ID").unwrap()),
            ("scope", "repo user".to_string()),
        ])
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    // Debug the raw response
    let text = response
        .text()
        .await
        .map_err(|e| format!("Failed to get response text: {}", e))?;

    println!("Raw response: {}", text);

    // Try to parse the response text
    serde_json::from_str(&text).map_err(|e| format!("Failed to parse JSON: {}", e))
}

#[command]
pub async fn poll_for_token(app: tauri::AppHandle, device_code: String) -> Result<String, String> {
    let client = reqwest::Client::new();

    let response = client
        .post("https://github.com/login/oauth/access_token")
        .header("Accept", "application/json")
        .form(&[
            ("client_id", std::env::var("GITHUB_CLIENT_ID").unwrap()),
            ("device_code", device_code),
            ("client_secret", std::env::var("GITHUB_SECRET").unwrap()),
            (
                "grant_type",
                "urn:ietf:params:oauth:grant-type:device_code".to_string(),
            ),
        ])
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?
        .json::<TokenOrError>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    match response {
        TokenOrError::Token(token) => {
            let store = app
                .store("auth.json")
                .map_err(|e| format!("Failed to access store: {}", e))?;

            store.set("github_token", json!(token.access_token.clone()));

            store
                .save()
                .map_err(|e| format!("Failed to save token: {}", e))?;

            Ok(token.access_token)
        }
        TokenOrError::Error {
            error,
            error_description,
            interval,
        } => {
            if error == "slow_down" {
                Err("still waiting for authorization".to_string())
            } else {
                Err(error_description.unwrap_or(error))
            }
        }
    }
}

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

pub async fn save_github_username(app: &AppHandle) -> Result<(), String> {
    let octocrab = get_client();

    let current_user = octocrab
        .current()
        .user()
        .await
        .map_err(|e| format!("Failed to get user: {}", e))?;

    let path = app
        .path()
        .app_config_dir()
        .ok_or("Failed to get config dir")?
        .join("github_user.json");

    let user_data = serde_json::json!({
        "username": current_user.login,
    });

    std::fs::write(
        path,
        serde_json::to_string_pretty(&user_data).map_err(|e| e.to_string())?,
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

pub async fn get_stored_username(app: &AppHandle) -> Result<String, String> {
    let path = app.path_resolver().app_data_dir()?.join("github_user.json");

    let data = std::fs::read_to_string(path).map_err(|e| e.to_string())?;
}
