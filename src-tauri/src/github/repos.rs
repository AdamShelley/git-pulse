use super::github_client::get_client;
use serde::Serialize;
use tauri::{command, AppHandle};

#[derive(Debug, Clone, Serialize)]
pub struct RepoData {
    pub name: String,
    pub full_name: String,
    pub description: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub language: Option<String>,
    pub stargazers_count: u32,
    pub fork: bool,
    pub visibility: String,
}

#[command]
pub async fn fetch_repos(app: AppHandle) -> Result<Vec<RepoData>, String> {
    let octocrab = get_client();

    let mut all_repos = Vec::new();
    let mut page = octocrab
        .current()
        .list_repos_for_authenticated_user()
        .per_page(100)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    loop {
        let repos: Vec<RepoData> = page
            .items
            .into_iter()
            .map(|repo| RepoData {
                name: repo.name,
                full_name: repo.full_name.expect("Repository must have a full name"),
                description: repo.description,
                created_at: repo
                    .created_at
                    .expect("Repository must have a creation date")
                    .to_rfc3339(),
                updated_at: repo
                    .updated_at
                    .expect("Repository must have an update date")
                    .to_rfc3339(),
                language: repo.language.and_then(|v| v.as_str().map(String::from)),
                stargazers_count: repo
                    .stargazers_count
                    .expect("Repository must have a stargazers count"),
                fork: repo.fork.unwrap_or(false),
                visibility: repo.visibility.unwrap_or_else(|| "private".to_string()),
            })
            .collect();

        all_repos.extend(repos);

        match octocrab
            .get_page::<octocrab::models::Repository>(&page.next)
            .await
            .map_err(|e| e.to_string())?
        {
            Some(next_page) => page = next_page,
            None => break,
        }
    }
    Ok(all_repos)
}

#[command]
pub async fn add_repos(app: AppHandle, repos: Vec<RepoData>) -> Result<(), String> {
    let store = app.store("repos.json").map_err(|e| e.to_string())?;
    store.set("repos", repos).await.map_err(|e| e.to_string())?;
    Ok(())
}
