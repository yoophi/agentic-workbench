use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

use crate::{
    adapters::outbound::{
        git_cli::GitCliRepositoryValidator, json_repository_store::JsonRepositoryStore,
    },
    application::repository_service::RepositoryService,
    domain::repository::Repository,
};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppInfo {
    name: String,
    version: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateRepositoryRequest {
    path: String,
}

#[tauri::command]
pub fn app_info() -> AppInfo {
    AppInfo {
        name: env!("CARGO_PKG_NAME").to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    }
}

#[tauri::command]
pub fn list_repositories(app: AppHandle) -> Result<Vec<Repository>, String> {
    repository_service(app)?.list_repositories()
}

#[tauri::command]
pub fn create_repository(
    app: AppHandle,
    request: CreateRepositoryRequest,
) -> Result<Repository, String> {
    repository_service(app)?.create_repository(request.path)
}

fn repository_service(
    app: AppHandle,
) -> Result<RepositoryService<JsonRepositoryStore, GitCliRepositoryValidator>, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Failed to resolve app data directory: {error}"))?;
    let store = JsonRepositoryStore::new(app_data_dir.join("repositories.json"));
    let validator = GitCliRepositoryValidator;

    Ok(RepositoryService::new(store, validator))
}
