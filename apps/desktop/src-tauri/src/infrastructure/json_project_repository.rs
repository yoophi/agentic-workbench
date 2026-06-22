use std::{fs, path::PathBuf};

use tauri::{AppHandle, Manager};

use crate::domain::{project::Project, project_repository::ProjectRepository};

pub struct JsonProjectRepository {
    store_path: PathBuf,
}

impl JsonProjectRepository {
    pub fn from_app(app: &AppHandle) -> Result<Self, String> {
        let dir = app
            .path()
            .app_data_dir()
            .map_err(|error| format!("Failed to resolve app data directory: {error}"))?;

        fs::create_dir_all(&dir)
            .map_err(|error| format!("Failed to create app data directory: {error}"))?;

        Ok(Self {
            store_path: dir.join("projects.json"),
        })
    }
}

impl ProjectRepository for JsonProjectRepository {
    fn load_projects(&self) -> Result<Vec<Project>, String> {
        if !self.store_path.exists() {
            return Ok(Vec::new());
        }

        let contents = fs::read_to_string(&self.store_path)
            .map_err(|error| format!("Failed to read projects store: {error}"))?;

        serde_json::from_str(&contents)
            .map_err(|error| format!("Failed to parse projects store: {error}"))
    }

    fn save_projects(&self, projects: &[Project]) -> Result<(), String> {
        let contents = serde_json::to_string_pretty(projects)
            .map_err(|error| format!("Failed to serialize projects: {error}"))?;

        fs::write(&self.store_path, contents)
            .map_err(|error| format!("Failed to write projects store: {error}"))
    }
}
