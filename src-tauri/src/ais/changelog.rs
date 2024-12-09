use anthropic::client::Client;
use anthropic::config::AnthropicConfig;
use anthropic::types::{ContentBlock, Message, MessagesRequestBuilder, Role};
use chrono::Local;
use serde::{Deserialize, Serialize};
use std::fs;
use std::io::{Seek, Write};
use std::path::PathBuf;
use tauri::command;

#[derive(Debug, Deserialize)]
pub struct FrontendIssue {
    pub number: i32,
    pub title: String,
    pub body: Option<String>,
    pub state: String,
    pub created_at: String,
    pub labels: Vec<String>,
    pub creator: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IssueInput {
    pub number: u32,
    pub title: String,
    pub body: String,
    pub labels: Vec<String>,
}

#[command]
pub async fn generate_and_save_changelog(
    issue: FrontendIssue,
    vault_path: String,
) -> Result<String, String> {
    let cfg = AnthropicConfig::new().map_err(|e| e.to_string())?;
    let client = Client::try_from(cfg).map_err(|e| e.to_string())?;
    let mut markdown = String::new();
    
    let today = Local::now().format("%Y-%m-%d").to_string();
    
    // Generate AI summary
    let prompt = format!(
        "Generate a concise changelog entry for this issue. Focus on the changes made and their impact:\n\nIssue #{}: {}\n{}",
        issue.number, 
        issue.title, 
        issue.body.as_deref().unwrap_or("No description provided")
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

    let response = client.messages(request)
        .await
        .map_err(|e| e.to_string())?;
    
    let summary = response
        .content
        .first()
        .and_then(|block| {
            if let ContentBlock::Text { text } = block {
                Some(text.clone())
            } else {
                None
            }
        })
        .unwrap_or_else(|| "No summary available".to_string());

    // Determine category
    let category = if issue.labels.contains(&"bug".to_string()) {
        "### 🐛 Bug Fixes"
    } else if issue.labels.contains(&"feature".to_string()) {
        "### ✨ New Features"
    } else {
        "### 🔄 Other Changes"
    };

    // Format the entry
    markdown.push_str(&format!("## Changes {}\n\n", today));
    markdown.push_str(&format!("{}\n\n", category));
    markdown.push_str(&format!("- #{} {}\n  {}\n\n", issue.number, issue.title, summary));
    markdown.push_str("---\n\n");

    let mut path = PathBuf::from(vault_path);
    path.push("CHANGELOG.md");

    if path.exists() {
        let mut file = fs::OpenOptions::new()
            .read(true)
            .write(true)
            .open(&path)
            .map_err(|e| format!("Failed to open changelog: {}", e))?;

        let mut existing_content = String::new();
        std::io::Read::read_to_string(&mut file, &mut existing_content)
            .map_err(|e| format!("Failed to read changelog: {}", e))?;

        let updated_content = format!("{}{}", markdown, existing_content);
        
        file.set_len(0)
            .map_err(|e| format!("Failed to truncate file: {}", e))?;
        file.rewind()
            .map_err(|e| format!("Failed to rewind file: {}", e))?;
        file.write_all(updated_content.as_bytes())
            .map_err(|e| format!("Failed to write to changelog: {}", e))?;
    } else {
        fs::write(&path, markdown)
            .map_err(|e| format!("Failed to create changelog: {}", e))?;
    }

    Ok(format!("Successfully updated changelog at {}", path.display()))
}