use std::collections::HashMap;
use std::sync::Mutex;

use crate::github::{get_token, get_username};
use anthropic::client::Client;
use anthropic::config::AnthropicConfig;
use anthropic::types::{ContentBlock, Message, MessagesRequestBuilder, Role};
use octocrab::Octocrab;
use serde::{Deserialize, Serialize};
use tauri::{command, AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileRecommendation {
    path: String,
    reason: String,
    confidence: f32,
}
#[derive(Debug, Hash, Eq, PartialEq)]
struct CacheKey {
    repo_name: String,
    issue_number: u64,
}

// Define the state structure
#[derive(Default)]
pub struct RecommendationsState {
    cache: Mutex<HashMap<CacheKey, Vec<FileRecommendation>>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IssueInput {
    repo_name: String,
    issue_number: u64,
}

#[command]
pub async fn get_relevant_files(
    app: AppHandle,
    input: IssueInput,
) -> Result<Vec<FileRecommendation>, String> {
    // Check cache first
    // let cache_key = CacheKey {
    //     repo_name: input.repo_name.clone(),
    //     issue_number: input.issue_number,
    // };

    // // Try to get recommendations from cache
    // if let Some(cached) = app
    //     .state::<RecommendationsState>()
    //     .cache
    //     .lock()
    //     .map_err(|e| e.to_string())?
    //     .get(&cache_key)
    // {
    //     return Ok(cached.clone());
    // }

    // If not in cache, proceed with API calls
    let recommendations = fetch_recommendations(app.clone(), input).await?;

    // Store in cache
    // app.state::<RecommendationsState>()
    //     .cache
    //     .lock()
    //     .map_err(|e| e.to_string())?
    //     .insert(cache_key, recommendations.clone());

    Ok(recommendations)
}

#[command]
pub async fn fetch_recommendations(
    app: AppHandle,
    input: IssueInput,
) -> Result<Vec<FileRecommendation>, String> {
    // Get GitHub token
    let github_token = get_token(&app)?;

    let username = get_username(app.clone())?;

    // Initialize GitHub client
    let octocrab = Octocrab::builder()
        .personal_token(github_token)
        .build()
        .map_err(|e| e.to_string())?;

    // Get issue details from GitHub
    let issue = octocrab
        .issues(username.clone(), input.repo_name.clone())
        .get(input.issue_number as u64)
        .await
        .map_err(|e| e.to_string())?;

    // Get repository file tree
    let tree = octocrab
        .repos(username, input.repo_name)
        .get_content()
        .send()
        .await
        .map_err(|e| e.to_string())?;

    // Create file list for context
    let file_paths: Vec<String> = tree
        .items
        .iter()
        .filter_map(|item| Some(item.path.clone()))
        .collect();

    // Initialize Claude client
    let cfg = AnthropicConfig::new().map_err(|e| e.to_string())?;
    let client = Client::try_from(cfg).map_err(|e| e.to_string())?;

    // Create prompt for Claude
    let prompt = format!(
        r#"Based on this GitHub issue, analyze which files might need changes. 
        Respond in JSON format with an array of objects containing 'path', 'reason', and 'confidence' (0.0-1.0).
        Only suggest files from the provided file list.

        Issue Title: {}
        Description: {}
        Labels: {:?}

        Available files:
        {}

        Respond with JSON like:
        [
            {{"path": "src/main.rs", "reason": "Contains main application logic", "confidence": 0.9}},
            {{"path": "src/utils.rs", "reason": "Helper functions used", "confidence": 0.7}}
        ]"#,
        issue.title,
        issue.body.unwrap_or_default(),
        issue.labels,
        file_paths.join("\n")
    );

    let messages = vec![Message {
        role: Role::User,
        content: vec![ContentBlock::Text { text: prompt }],
    }];

    let request = MessagesRequestBuilder::default()
        .messages(messages)
        .model("claude-3-sonnet-20240229".to_string())
        .max_tokens(1024_usize)
        .build()
        .map_err(|e| e.to_string())?;

    // Get Claude's response
    let response = client.messages(request).await.map_err(|e| e.to_string())?;

    // Parse JSON response into FileRecommendation vec
    let text = match &response.content[0] {
        ContentBlock::Text { text } => text,
        _ => return Err("Unexpected response format".to_string()),
    };
    let recommendations: Vec<FileRecommendation> =
        serde_json::from_str(text).map_err(|e| e.to_string())?;

    // Filter out any recommendations for files that don't exist
    let valid_recommendations: Vec<FileRecommendation> = recommendations
        .into_iter()
        .filter(|rec| file_paths.contains(&rec.path))
        .collect();

    Ok(valid_recommendations)
}
