use crate::github::types::GitHubApiIssue;
use std::fs;
use std::path::PathBuf;
use tauri::command;

#[command]
pub async fn save_to_obsidian(
    issues: Vec<GitHubApiIssue>,
    vault_path: String,
    filename: String,
) -> Result<String, String> {
    let mut markdown = String::new();

    for issue in issues {
        let tags = issue
            .tags
            .iter()
            .map(|t| t.name.as_str())
            .collect::<Vec<&str>>()
            .join(", ");

        markdown.push_str(&format!(
            "- [ ] {}\n  - Created: {}\n  - Tags: {}\n  - URL: {}\n  - Author: {}\n  - State: {}\n  - Description: {}\n\n",
            issue.title,
            issue.created_at,
            if tags.is_empty() { "none" } else { &tags },
            issue.html_url,
            issue.user.login,
            issue.state,
            issue.body.lines().next().unwrap_or("No description")
        ));
    }

    let mut path = PathBuf::from(vault_path);
    path.push(filename);

    fs::write(&path, markdown).map_err(|e| format!("Failed to write file: {}", e))?;

    Ok(format!("Successfully saved to {}", path.display()))
}
