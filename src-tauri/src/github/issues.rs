use super::github_client::get_client;
use chrono::{DateTime, Duration, Utc};
use octocrab::models::issues::Issue;
use octocrab::params;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::{collections::HashMap, fs, path::PathBuf, sync::Arc};
use tauri::{command, AppHandle, Manager, State};

#[derive(Debug, Default)]
pub struct IssuesCache {
    cache: Arc<Mutex<HashMap<String, (Vec<IssueData>, DateTime<Utc>)>>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PinnedRepos {
    repos: Vec<String>,
}

impl Default for PinnedRepos {
    fn default() -> Self {
        Self { repos: Vec::new() }
    }
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
    println!("Checking cache status for {}/{}", owner, repo);
    let cache_key = format!("{}/{}", owner, repo);
    let cache_guard = cache.cache.lock().map_err(|e| e.to_string())?;

    if let Some((_, last_updated)) = cache_guard.get(&cache_key) {
        println!("Cache found with last update: {}", last_updated);
        Ok(CacheStatus {
            cached: true,
            last_updated: Some(last_updated.to_string()),
            etag: None,
        })
    } else {
        println!("No cache found for {}/{}", owner, repo);
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
    println!("Fetching issues for {}/{}", owner, repo);

    let cache_key = format!("{}/{}", owner, repo);

    // Check cache
    if !force_refresh {
        let cache_guard = cache.cache.lock().map_err(|e| e.to_string())?;
        if let Some((cached_issues, last_updated)) = cache_guard.get(&cache_key) {
            if Utc::now() - *last_updated < Duration::minutes(5) {
                println!("Returning cached issues");
                return Ok(cached_issues.clone());
            }
        }
    }

    println!("Getting GitHub client...");
    let octocrab = get_client()?;

    println!("Fetching issues from GitHub API...");
    let mut all_issues = Vec::new();
    let page = match octocrab
        .issues(&owner, &repo)
        .list()
        .state(params::State::All)
        .per_page(100)
        .send()
        .await
    {
        Ok(page) => {
            // println!("Got {} issues", page.items.len());
            page
        }
        Err(e) => {
            println!("Error fetching issues: {}", e);
            return Err(e.to_string());
        }
    };

    println!("Processing issues...");
    let mut processed_issues: Vec<IssueData> =
        page.items.into_iter().map(IssueData::from).collect();

    // println!("Fetching comments for {} issues...", processed_issues.len());
    for issue in &mut processed_issues {
        // println!("Fetching comments for issue #{}", issue.number);
        match octocrab
            .issues(&owner, &repo)
            .list_comments(issue.number as u64)
            .send()
            .await
        {
            Ok(comments) => {
                // println!(
                //     "Got {} comments for issue #{}",
                //     comments.items.len(),
                //     issue.number
                // );
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
            Err(e) => {
                println!("Error fetching comments for issue #{}: {}", issue.number, e);
                return Err(e.to_string());
            }
        }
    }

    all_issues.extend(processed_issues.clone());

    // Update cache
    let mut cache_guard = cache.cache.lock().map_err(|e| e.to_string())?;
    cache_guard.insert(cache_key, (processed_issues, Utc::now()));

    println!("Returning {} issues", all_issues.len());
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

fn get_pinned_path(app: &AppHandle) -> Result<PathBuf, String> {
    let config_dir = app
        .path()
        .app_config_dir()
        .expect("failed to get config dir");

    fs::create_dir_all(&config_dir).map_err(|e| e.to_string())?;

    Ok(config_dir.join("pinned.json"))
}

#[command]
pub async fn get_pinned_repos(app: AppHandle) -> Result<Vec<String>, String> {
    let pinned_path = get_pinned_path(&app)?;

    match fs::read_to_string(&pinned_path) {
        Ok(contents) => {
            let pinned: PinnedRepos = serde_json::from_str(&contents)
                .map_err(|e| format!("Failed to parse pinned repos: {}", e))?;
            Ok(pinned.repos)
        }
        Err(_) => Ok(Vec::new()),
    }
}

#[command]
pub async fn save_pinned_repos(app: AppHandle, repos: Vec<String>) -> Result<(), String> {
    let pinned_path = get_pinned_path(&app)?;
    let pinned = PinnedRepos { repos };

    let json = serde_json::to_string_pretty(&pinned)
        .map_err(|e| format!("Failed to serialize pinned repos: {}", e))?;

    fs::write(&pinned_path, json).map_err(|e| e.to_string())
}

#[command]
pub async fn create_new_issue(
    owner: &str,
    repo: &str,
    title: &str,
    body: &str,
) -> Result<octocrab::models::issues::Issue, String> {
    let octocrab = get_client()?;
    let issue = octocrab
        .issues(owner, repo)
        .create(title)
        .body(body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    Ok(issue)
}
