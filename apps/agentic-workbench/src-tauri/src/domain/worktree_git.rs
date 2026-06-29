use serde::Serialize;

#[derive(Clone, Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitCommitSummary {
    pub hash: String,
    pub message: String,
    pub author: String,
    pub date: String,
}

#[derive(Clone, Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitCommitHistory {
    pub commits: Vec<GitCommitSummary>,
    pub page: GitCommitPage,
}

#[derive(Clone, Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitCommitPage {
    pub offset: usize,
    pub limit: usize,
    pub total_count: usize,
    pub has_more: bool,
}

impl GitCommitPage {
    pub fn new(offset: usize, limit: usize, total_count: usize, loaded_count: usize) -> Self {
        Self {
            offset,
            limit,
            total_count,
            has_more: offset.saturating_add(loaded_count) < total_count,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitCommitGraph {
    pub commits: Vec<GitGraphCommit>,
    pub refs: Vec<GitGraphRef>,
    pub page: GitCommitPage,
    pub layout_hints: GitGraphLayoutHints,
}

#[derive(Clone, Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitGraphCommit {
    pub hash: String,
    pub short_hash: String,
    pub parents: Vec<String>,
    pub message: String,
    pub author: String,
    pub date: String,
    pub is_head: bool,
    pub is_merge: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitGraphLayoutHints {
    pub row_height: u16,
    pub max_initial_lanes: u16,
}

impl GitGraphLayoutHints {
    pub fn default_row_layout() -> Self {
        Self {
            row_height: 32,
            max_initial_lanes: 10,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitGraphRef {
    pub name: String,
    pub target: String,
    pub kind: GitGraphRefKind,
}

#[derive(Clone, Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum GitGraphRefKind {
    LocalBranch,
    RemoteBranch,
    Tag,
}

#[derive(Clone, Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitCommitFileChange {
    pub path: String,
    pub status: String,
}

#[derive(Clone, Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitCommitDetail {
    pub hash: String,
    pub message: String,
    pub author: String,
    pub date: String,
    pub files: Vec<GitCommitFileChange>,
}

#[derive(Clone, Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitFileDiff {
    pub commit_hash: String,
    pub path: String,
    pub content: String,
    pub is_binary: bool,
    pub is_truncated: bool,
}
