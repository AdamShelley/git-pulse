use super::github_client::get_client;
use chrono::{DateTime, Duration, Utc};
use octocrab::models::issues::Issue;
use octocrab::params;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::{collections::HashMap, sync::Arc};
use tauri::{command, AppHandle, State};

#[derive(Debug, Default)]
pub struct IssuesCache {
    cache: Arc<Mutex<HashMap<String, (Vec<IssueData>, DateTime<Utc>)>>>,
}

impl IssuesCache {
    pub fn get_cache(&self) -> &Arc<Mutex<HashMap<String, (Vec<IssueData>, DateTime<Utc>)>>> {
        &self.cache
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct CommentData {
    pub id: i64,
    pub body: String,
    pub created_at: String,
    pub updated_at: Option<String>,
    pub author: String,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct IssueData {
    pub number: i64,
    pub title: String,
    pub state: String,
    pub created_at: String,
    pub body: Option<String>,
    pub labels: Vec<String>,
    pub assignees: Vec<String>,
    pub comments: Vec<CommentData>,
    pub creator: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CacheStatus {
    cached: bool,
    last_updated: Option<String>,
    etag: Option<String>,
}

impl From<Issue> for IssueData {
    fn from(issue: Issue) -> Self {
        IssueData {
            number: issue.number as i64,
            title: issue.title,
            state: match issue.state {
                octocrab::models::IssueState::Open => String::from("open"),
                octocrab::models::IssueState::Closed => String::from("closed"),
                _ => String::from("unknown"),
            },
            created_at: issue.created_at.to_rfc3339(),
            body: issue.body,
            labels: issue.labels.into_iter().map(|label| label.name).collect(),
            assignees: issue.assignees.into_iter().map(|user| user.login).collect(),
            comments: Vec::new(),
            creator: issue.user.login,
        }
    }
}

#[command]
pub async fn check_cache_status<'a>(
    owner: String,
    repo: String,
    cache: State<'a, IssuesCache>,
) -> Result<CacheStatus, String> {
    let cache_key = format!("{}/{}", owner, repo);
    let cache_guard = cache.cache.lock().map_err(|e| e.to_string())?;

    if let Some((_, last_updated)) = cache_guard.get(&cache_key) {
        Ok(CacheStatus {
            cached: true,
            last_updated: Some(last_updated.to_string()),
            etag: None,
        })
    } else {
        Ok(CacheStatus {
            cached: false,
            last_updated: None,
            etag: None,
        })
    }
}

#[command]
pub async fn fetch_issues(
    owner: String,
    repo: String,
    cache: State<'_, IssuesCache>,
    force_refresh: bool,
) -> Result<Vec<IssueData>, String> {
    let cache_key = format!("{}/{}", owner, repo);

    // Check cache
    if !force_refresh {
        let cache_guard = cache.cache.lock().map_err(|e| e.to_string())?;
        if let Some((cached_issues, last_updated)) = cache_guard.get(&cache_key) {
            if Utc::now() - *last_updated < Duration::minutes(5) {
                return Ok(cached_issues.clone());
            }
        }
    }

    let octocrab = get_client();

    let mut all_issues = Vec::new();
    let page = octocrab
        .issues(&owner, &repo)
        .list()
        .state(params::State::All)
        .per_page(100)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let mut processed_issues: Vec<IssueData> =
        page.items.into_iter().map(IssueData::from).collect();

    for issue in &mut processed_issues {
        let comments = octocrab
            .issues(&owner, &repo)
            .list_comments(issue.number as u64)
            .send()
            .await
            .map_err(|e| e.to_string())?;

        issue.comments = comments
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
    }

    all_issues.extend(processed_issues.clone());

    // Update cache
    let mut cache_guard = cache.cache.lock().map_err(|e| e.to_string())?;
    cache_guard.insert(cache_key, (processed_issues, Utc::now()));

    println!("{:#?}", all_issues);

    Ok(all_issues)
}

#[command]
pub async fn get_cached_issue(
    owner: String,
    repo: String,
    issue_number: i64,
    cache: State<'_, IssuesCache>,
) -> Result<Option<IssueData>, String> {
    let cache_key = format!("{}/{}", owner, repo);

    let cache_guard = cache.cache.lock().map_err(|e| e.to_string())?;

    if let Some((cached_issues, _)) = cache_guard.get(&cache_key) {
        return Ok(cached_issues
            .iter()
            .find(|issue| issue.number == issue_number)
            .cloned());
    }

    Ok(None)
}
