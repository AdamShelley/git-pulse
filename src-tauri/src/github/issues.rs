use octocrab::models::issues::Issue;
use octocrab::params;
use serde::{Deserialize, Serialize};
use tauri::command;

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

// #[derive(Debug, Deserialize)]
// pub struct IssueFilter {
//     pub creator: Option<String>,
//     pub state: Option<String>,
//     pub labels: Option<Vec<String>>,
// }

#[command]
pub async fn fetch_issues(owner: String, repo: String) -> Result<Vec<IssueData>, String> {
    let octocrab = octocrab::instance();

    let mut all_issues = Vec::new();
    let page = octocrab
        .issues(&owner, &repo)
        .list()
        .state(params::State::All)
        .per_page(100)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    // First, collect initial issue data
    // let mut issue_numbers: Vec<i64> = page.items.iter().map(|issue| issue.number as i64).collect();

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

    all_issues.extend(processed_issues);

    println!("{:#?}", all_issues);

    // while let Some(next_page) = octocrab
    //     .get_page(&page.next)
    //     .await
    //     .map_err(|e| e.to_string())?
    // {
    //     page = next_page;

    //     // Collect issue numbers and initial data
    //     let mut current_issues: Vec<IssueData> =
    //         page.items.into_iter().map(IssueData::from).collect();

    //     // Fetch comments for each issue
    //     for issue in &mut current_issues {
    //         let comments = octocrab
    //             .issues(&owner, &repo)
    //             .list_comments(issue.number as u64)
    //             .send()
    //             .await
    //             .map_err(|e| e.to_string())?;

    //         issue.comments = comments
    //             .items
    //             .into_iter()
    //             .map(|comment| CommentData {
    //                 id: comment.id.0.try_into().unwrap_or_default(),
    //                 body: comment.body.unwrap_or_default(),
    //                 created_at: comment.created_at.to_rfc3339(),
    //                 updated_at: comment.updated_at.map(|t| t.to_rfc3339()),
    //                 author: comment.user.login,
    //             })
    //             .collect();
    //     }

    //     all_issues.extend(current_issues);
    // }

    Ok(all_issues)
}
