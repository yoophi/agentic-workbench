use crate::domain::{
    branch::GitBranch, repository::Repository, repository_event::RepositoryChangeEvent,
    worktree::GitWorktree,
};

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

pub trait RepositoryWatcher {
    type WatchHandle;

    fn watch_repositories(
        &self,
        repositories: &[Repository],
        notify: Box<dyn Fn(RepositoryChangeEvent) + Send + Sync + 'static>,
    ) -> Result<Self::WatchHandle, String>;
}
