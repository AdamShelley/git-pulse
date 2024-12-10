use octocrab::models::App;
use serde::{Deserialize, Serialize};
use serde_json::{self, json};
use tauri::{command, AppHandle, State};
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
#[derive(Serialize, Deserialize, Clone)]
pub struct AuthState {
    pub token: String,
    pub user: Option<UserDetails>,
}

#[derive(Serialize, Deserialize, Clone)]
struct UserDetails {
    pub login: String,
    pub avatar_url: String,
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
            let user_details = fetch_user_details(&token.access_token).await?;

            let store = app
                .store("auth.json")
                .map_err(|e| format!("Failed to access store: {}", e))?;

            store.set(
                "auth_state",
                json!(AuthState {
                    token: token.access_token.clone(),
                    user: Some(user_details),
                }),
            );

            store
                .save()
                .map_err(|e| format!("Failed to save auth state: {}", e))?;

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

async fn fetch_user_details(token: &str) -> Result<UserDetails, String> {
    let octocrab = octocrab::OctocrabBuilder::new()
        .personal_token(token.to_string())
        .build()
        .map_err(|e| e.to_string())?;

    let user = octocrab.current().user().await.map_err(|e| e.to_string())?;

    Ok(UserDetails {
        login: user.login,
        avatar_url: user.avatar_url.to_string(),
    })
}

pub fn get_token(app: &AppHandle) -> Result<String, String> {
    let auth = get_stored_auth(app)?.ok_or("not authenticated")?;
    Ok(auth.token)
}

pub fn get_stored_auth(app: &AppHandle) -> Result<Option<AuthState>, String> {
    let store = app.store("auth.json").map_err(|e| e.to_string())?;

    let auth_state: Option<AuthState> = match store.get("auth_state") {
        Some(value) => Some(serde_json::from_value(value.clone()).map_err(|e| e.to_string())?),
        None => None,
    };

    Ok(auth_state)
}

#[command]
pub fn get_username(app: State<AppHandle>) -> Result<String, String> {
    let auth = get_stored_auth(&app)?.ok_or("not authenticated")?;
    let username = auth.user.ok_or("no user details")?.login;
    Ok(username)
}
