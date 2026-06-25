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
