use crate::{
    application::ports::{GitRepositoryValidator, RepositoryStore},
    domain::repository::Repository,
};

pub struct RepositoryService<S, V>
where
    S: RepositoryStore,
    V: GitRepositoryValidator,
{
    store: S,
    validator: V,
}

impl<S, V> RepositoryService<S, V>
where
    S: RepositoryStore,
    V: GitRepositoryValidator,
{
    pub fn new(store: S, validator: V) -> Self {
        Self { store, validator }
    }

    pub fn list_repositories(&self) -> Result<Vec<Repository>, String> {
        self.store.list()
    }

    pub fn create_repository(&self, path: String) -> Result<Repository, String> {
        let requested_path = path.trim();

        if requested_path.is_empty() {
            return Err("Repository path is required.".to_string());
        }

        let git_root = self.validator.validate_repository(requested_path)?;
        let repository = Repository::new(
            git_root.clone(),
            repository_name_from_root(&git_root),
            requested_path.to_string(),
        );
        let mut repositories = self.store.list()?;

        if repositories.iter().any(|item| item.id == repository.id) {
            return Err("Repository is already registered.".to_string());
        }

        repositories.push(repository.clone());
        self.store.save_all(&repositories)?;

        Ok(repository)
    }
}

fn repository_name_from_root(git_root: &str) -> String {
    git_root
        .trim_end_matches(['/', '\\'])
        .rsplit(['/', '\\'])
        .find(|segment| !segment.is_empty())
        .unwrap_or(git_root)
        .to_string()
}

#[cfg(test)]
mod tests {
    use std::{cell::RefCell, rc::Rc};

    use crate::application::ports::{GitRepositoryValidator, RepositoryStore};

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

    struct StaticValidator {
        root: String,
    }

    impl GitRepositoryValidator for StaticValidator {
        fn validate_repository(&self, _path: &str) -> Result<String, String> {
            Ok(self.root.clone())
        }
    }

    #[test]
    fn rejects_empty_repository_path() {
        let service = RepositoryService::new(
            MemoryStore::default(),
            StaticValidator {
                root: "/tmp/repo".to_string(),
            },
        );

        let result = service.create_repository("  ".to_string());

        assert_eq!(result.unwrap_err(), "Repository path is required.");
    }

    #[test]
    fn saves_valid_repository() {
        let store = MemoryStore::default();
        let service = RepositoryService::new(
            store.clone(),
            StaticValidator {
                root: "/tmp/repo".to_string(),
            },
        );

        let repository = service
            .create_repository("/tmp/repo".to_string())
            .expect("repository should be saved");

        assert_eq!(repository.id, "/tmp/repo");
        assert_eq!(repository.name, "repo");
        assert_eq!(store.list().expect("stored repositories").len(), 1);
    }

    #[test]
    fn rejects_duplicate_repository() {
        let store = MemoryStore::default();
        let service = RepositoryService::new(
            store,
            StaticValidator {
                root: "/tmp/repo".to_string(),
            },
        );

        service
            .create_repository("/tmp/repo".to_string())
            .expect("first registration should succeed");
        let result = service.create_repository("/tmp/repo".to_string());

        assert_eq!(result.unwrap_err(), "Repository is already registered.");
    }

    #[test]
    fn derives_repository_name_from_windows_style_root() {
        assert_eq!(
            repository_name_from_root(r"C:\Users\yoophi\project\repo"),
            "repo"
        );
    }
}
