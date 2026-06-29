use crate::domain::worktree_git::{GitCommitDetail, GitCommitGraph, GitCommitHistory, GitFileDiff};

pub trait WorktreeGitProvider {
    fn list_history(
        &self,
        working_directory: &str,
        limit: usize,
        offset: usize,
    ) -> Result<GitCommitHistory, String>;
    fn get_commit_graph(
        &self,
        working_directory: &str,
        limit: usize,
        offset: usize,
    ) -> Result<GitCommitGraph, String>;
    fn get_commit_detail(
        &self,
        working_directory: &str,
        commit_hash: &str,
    ) -> Result<GitCommitDetail, String>;
    fn get_file_diff(
        &self,
        working_directory: &str,
        commit_hash: &str,
        file_path: &str,
    ) -> Result<GitFileDiff, String>;
}
