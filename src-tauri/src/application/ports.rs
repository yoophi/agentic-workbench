use crate::domain::repository::Repository;

pub trait GitRepositoryValidator {
    fn validate_repository(&self, path: &str) -> Result<String, String>;
}

pub trait RepositoryStore {
    fn list(&self) -> Result<Vec<Repository>, String>;
    fn save_all(&self, repositories: &[Repository]) -> Result<(), String>;
}
