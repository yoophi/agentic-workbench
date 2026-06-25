use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitCommitSummary {
    pub hash: String,
    pub message: String,
    pub author: String,
    pub date: String,
}

impl GitCommitSummary {
    pub fn new(hash: String, message: String, author: String, date: String) -> Self {
        Self {
            hash,
            message,
            author,
            date,
        }
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitCommitFileChange {
    pub path: String,
    pub status: String,
}

impl GitCommitFileChange {
    pub fn new(path: String, status: String) -> Self {
        Self { path, status }
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitCommitDetail {
    pub hash: String,
    pub message: String,
    pub author: String,
    pub date: String,
    pub files: Vec<GitCommitFileChange>,
}

impl GitCommitDetail {
    pub fn new(
        hash: String,
        message: String,
        author: String,
        date: String,
        files: Vec<GitCommitFileChange>,
    ) -> Self {
        Self {
            hash,
            message,
            author,
            date,
            files,
        }
    }
}
