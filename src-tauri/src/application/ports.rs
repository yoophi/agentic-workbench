use crate::domain::{branch::GitBranch, repository::Repository, worktree::GitWorktree};

pub trait GitRepositoryValidator {
    fn validate_repository(&self, path: &str) -> Result<String, String>;
}

pub trait RepositoryStore {
    fn list(&self) -> Result<Vec<Repository>, String>;
    fn save_all(&self, repositories: &[Repository]) -> Result<(), String>;
}

pub trait GitWorktreeReader {
    fn list_worktrees(&self, repository_path: &str) -> Result<Vec<GitWorktree>, String>;
}

pub trait GitBranchReader {
    fn list_branches(&self, repository_path: &str) -> Result<Vec<GitBranch>, String>;
}
