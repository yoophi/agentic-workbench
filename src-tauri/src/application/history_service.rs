use crate::{
    application::ports::{GitHistoryReader, RepositoryStore},
    domain::commit::GitCommitSummary,
};

pub struct HistoryService<S, R>
where
    S: RepositoryStore,
    R: GitHistoryReader,
{
    store: S,
    reader: R,
}

impl<S, R> HistoryService<S, R>
where
    S: RepositoryStore,
    R: GitHistoryReader,
{
    pub fn new(store: S, reader: R) -> Self {
        Self { store, reader }
    }

    pub fn list_history(&self, repository_id: String) -> Result<Vec<GitCommitSummary>, String> {
        let requested_id = repository_id.trim();

        if requested_id.is_empty() {
            return Err("Repository id is required.".to_string());
        }

        let repository = self
            .store
            .list()?
            .into_iter()
            .find(|repository| repository.id == requested_id)
            .ok_or_else(|| "Repository is not registered.".to_string())?;

        self.reader.list_history(&repository.path)
    }
}

#[cfg(test)]
mod tests {
    use std::{cell::RefCell, rc::Rc};

    use crate::{
        application::ports::{GitHistoryReader, RepositoryStore},
        domain::{commit::GitCommitSummary, repository::Repository},
    };

    use super::*;

    #[derive(Clone, Default)]
    struct MemoryStore {
        repositories: Rc<RefCell<Vec<Repository>>>,
    }

    impl RepositoryStore for MemoryStore {
        fn list(&self) -> Result<Vec<Repository>, String> {
            Ok(self.repositories.borrow().clone())
        }

        fn save_all(&self, repositories: &[Repository]) -> Result<(), String> {
            *self.repositories.borrow_mut() = repositories.to_vec();
            Ok(())
        }
    }

    struct StaticHistoryReader {
        commits: Vec<GitCommitSummary>,
    }

    impl GitHistoryReader for StaticHistoryReader {
        fn list_history(&self, _repository_path: &str) -> Result<Vec<GitCommitSummary>, String> {
            Ok(self.commits.clone())
        }
    }

    #[test]
    fn rejects_unregistered_repository() {
        let service = HistoryService::new(
            MemoryStore::default(),
            StaticHistoryReader {
                commits: Vec::new(),
            },
        );

        let result = service.list_history("/tmp/repo".to_string());

        assert_eq!(result.unwrap_err(), "Repository is not registered.");
    }

    #[test]
    fn returns_history_for_registered_repository() {
        let store = MemoryStore::default();
        store
            .save_all(&[Repository::new(
                "/tmp/repo".to_string(),
                "repo".to_string(),
                "/tmp/repo".to_string(),
            )])
            .expect("repository should be stored");
        let commits = vec![GitCommitSummary::new(
            "abc123".to_string(),
            "Initial commit".to_string(),
            "A Developer".to_string(),
            "2026-06-25T00:00:00+09:00".to_string(),
        )];
        let service = HistoryService::new(
            store,
            StaticHistoryReader {
                commits: commits.clone(),
            },
        );

        assert_eq!(
            service
                .list_history("/tmp/repo".to_string())
                .expect("history should be returned"),
            commits
        );
    }
}
