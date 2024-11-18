use crate::github::types::GitHubApiIssue;
use chrono::Local;
use std::fs;
use std::io::Write;
use std::path::PathBuf;
use tauri::command;

#[command]
pub async fn save_to_obsidian(
    issues: Vec<GitHubApiIssue>,
    vault_path: String,
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

    let today = Local::now().format("%d-%m-%Y").to_string();
    let filename = format!("{}.md", today);

    let mut path = PathBuf::from(vault_path);
    path.push(&filename);

    if path.exists() {
        let mut file = fs::OpenOptions::new()
            .append(true)
            .open(&path)
            .map_err(|e| format!("Failed to open fiole: {}", e))?;

        let existing_content =
            fs::read_to_string(&path).map_err(|e| format!("Failed to read file: {}", e))?;

        if !existing_content.ends_with("\n\n") {
            writeln!(file).map_err(|e| format!("Failed to write newline: {}", e))?;
            writeln!(file).map_err(|e| format!("Failed to write newline: {}", e))?;
        }

        file.write_all(markdown.as_bytes())
            .map_err(|e| format!("Failed to append: {}", e))?;

        Ok(format!("Successfully appended to {}", path.display()))
    } else {
        fs::write(&path, markdown).map_err(|e| format!("Failed to write file: {}", e))?;
        Ok(format!("Successfully created at {}", path.display()))
    }
}
