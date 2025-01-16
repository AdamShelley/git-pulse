use super::issues::{CommentData, IssueData, IssuesCache};
use super::oauth::get_token;
use crate::github::get_username;
use chrono::Utc;
use tauri::{command, AppHandle, State};

#[command]
pub async fn add_issue_comment(
    app: AppHandle,
    owner: String,
    repo: String,
    issue_number: i64,
    body: String,
    cache: State<'_, IssuesCache>,
) -> Result<IssueData, String> {
    let token = get_token(&app)?;

    let octocrab = octocrab::OctocrabBuilder::new()
        .personal_token(token)
        .build()
        .map_err(|e| e.to_string())?;

    octocrab
        .issues(&owner, &repo)
        .create_comment(issue_number as u64, body)
        .await
        .map_err(|e| e.to_string())?;

    fetch_single_issue(app, owner, repo, issue_number, cache).await
}

#[command]
pub async fn fetch_single_issue(
    app: AppHandle,
    owner: String,
    repo: String,
    issue_number: i64,
    cache: State<'_, IssuesCache>,
) -> Result<IssueData, String> {
    let token = get_token(&app)?;

    let octocrab = octocrab::OctocrabBuilder::new()
        .personal_token(token)
        .build()
        .map_err(|e| e.to_string())?;

    let issue = octocrab
        .issues(&owner, &repo)
        .get(issue_number as u64)
        .await
        .map_err(|e| e.to_string())?;

    let mut issue_data = IssueData::from(issue);

    let comments = octocrab
        .issues(&owner, &repo)
        .list_comments(issue_number as u64)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    issue_data.comments = comments
        .items
        .into_iter()
        .map(|comment| CommentData {
            id: comment.id.0.try_into().unwrap_or_default(),
            body: comment.body.unwrap_or_default(),
            created_at: comment.created_at.to_rfc3339(),
            updated_at: comment.updated_at.map(|t| t.to_rfc3339()),
            author: comment.user.login,
        })
        .collect();

    // Update cache with new issue data
    let cache_key = format!("{}/{}", owner, repo);
    let mut cache_guard = cache.get_cache().lock().map_err(|e| e.to_string())?;

    if let Some((cached_issues, _last_updated)) = cache_guard.get_mut(&cache_key) {
        if let Some(existing_issue) = cached_issues.iter_mut().find(|i| i.number == issue_number) {
            *existing_issue = issue_data.clone();
        } else {
            cached_issues.push(issue_data.clone());
        }
    } else {
        cache_guard.insert(cache_key, (vec![issue_data.clone()], Utc::now()));
    }

    Ok(issue_data)
}

#[tauri::command]
pub async fn delete_issue_comment(
    app: AppHandle,
    repo: String,
    comment_number: i64,
    issue_number: i64,
    cache: State<'_, IssuesCache>,
) -> Result<IssueData, String> {
    let token = get_token(&app)?;
    let owner = get_username(app.clone())?;

    let octocrab = octocrab::OctocrabBuilder::new()
        .personal_token(token)
        .build()
        .map_err(|e| e.to_string())?;

    octocrab
        .issues(&owner, &repo)
        .delete_comment(octocrab::models::CommentId(comment_number as u64))
        .await
        .map_err(|e| e.to_string())?;

    println!("Comment deleted");
    fetch_single_issue(app, owner.clone(), repo, issue_number, cache).await
}

#[tauri::command]
pub async fn edit_issue_comment(
    app: AppHandle,
    repo: String,
    comment_number: i64,
    issue_number: i64,
    body: String,
    cache: State<'_, IssuesCache>,
) -> Result<IssueData, String> {
    let token = get_token(&app)?;
    let owner = get_username(app.clone())?;

    let octocrab = octocrab::OctocrabBuilder::new()
        .personal_token(token)
        .build()
        .map_err(|e| e.to_string())?;

    octocrab
        .issues(&owner, &repo)
        .update_comment(octocrab::models::CommentId(comment_number as u64), body)
        .await
        .map_err(|e| e.to_string())?;

    fetch_single_issue(app, owner.clone(), repo, issue_number, cache).await
}
