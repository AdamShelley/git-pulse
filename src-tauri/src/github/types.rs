use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct GitHubApiIssue {
    pub id: i32,
    pub title: String,
    pub body: String,
    pub state: String,
    pub created_at: String,
    pub html_url: String,
    #[serde(rename = "labels")]
    pub tags: Vec<Label>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Label {
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub login: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Comment {
    pub id: i32,
    pub user: User,
    pub body: String,
}
