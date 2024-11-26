use super::issues::CommentData;
use dotenvy::dotenv;
use std::env;
use tauri::command;

#[command]
pub async fn add_issue_comment(
    owner: String,
    repo: String,
    issue_number: i64,
    body: String,
) -> Result<CommentData, String> {
    let token =
        env::var("GITHUB_TOKEN").map_err(|_| "Github token not found in env".to_string())?;

    let octocrab = octocrab::OctocrabBuilder::new()
        .personal_token(token)
        .build()
        .map_err(|e| e.to_string())?;

    let comment = octocrab
        .issues(&owner, &repo)
        .create_comment(issue_number as u64, body)
        .await
        .map_err(|e| e.to_string())?;

    Ok(CommentData {
        id: comment.id.0.try_into().unwrap_or_default(),
        body: comment.body.unwrap_or_default(),
        created_at: comment.created_at.to_rfc3339(),
        updated_at: comment.updated_at.map(|t| t.to_rfc3339()),
        author: comment.user.login,
    })
}
