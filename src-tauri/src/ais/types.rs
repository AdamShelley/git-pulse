use serde::{Deserialize, Serialize};

#[derive(Debug, Hash, Eq, PartialEq)]
pub struct CacheKey {
    // Added pub
    pub repo_name: String,
    pub issue_number: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileRecommendation {
    // Added pub
    pub path: String,
    pub reason: String,
    pub confidence: f32,
}
