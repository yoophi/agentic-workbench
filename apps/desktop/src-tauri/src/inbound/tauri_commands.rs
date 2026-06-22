use serde::Deserialize;
use tauri::AppHandle;

use crate::{
    application::{git_branch_service, git_remote_service, git_worktree_service, project_service},
    domain::{
        git_branch::GitBranch,
        git_remote::GitRemote,
        git_worktree::{GitWorktree, GitWorktreeCreateDraft},
        project::{Project, ProjectDraft},
    },
    infrastructure::{
        git_cli_branch_provider::GitCliBranchProvider,
        git_cli_remote_provider::GitCliRemoteProvider,
        git_cli_worktree_provider::GitCliWorktreeProvider,
        json_project_repository::JsonProjectRepository,
    },
};

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectInput {
    name: String,
    working_directory: String,
    description: Option<String>,
}

impl From<ProjectInput> for ProjectDraft {
    fn from(input: ProjectInput) -> Self {
        Self {
            name: input.name,
            working_directory: input.working_directory,
            description: input.description,
        }
    }
}

#[tauri::command]
pub fn list_projects(app: AppHandle) -> Result<Vec<Project>, String> {
    let repository = JsonProjectRepository::from_app(&app)?;
    project_service::list_projects(&repository)
}

#[tauri::command]
pub fn create_project(app: AppHandle, input: ProjectInput) -> Result<Project, String> {
    let repository = JsonProjectRepository::from_app(&app)?;
    project_service::create_project(&repository, input.into())
}

#[tauri::command]
pub fn update_project(app: AppHandle, id: String, input: ProjectInput) -> Result<Project, String> {
    let repository = JsonProjectRepository::from_app(&app)?;
    project_service::update_project(&repository, id, input.into())
}

#[tauri::command]
pub fn delete_project(app: AppHandle, id: String) -> Result<(), String> {
    let repository = JsonProjectRepository::from_app(&app)?;
    project_service::delete_project(&repository, id)
}

#[tauri::command]
pub fn list_git_remotes(working_directory: String) -> Result<Vec<GitRemote>, String> {
    git_remote_service::list_git_remotes(&GitCliRemoteProvider, working_directory)
}

#[tauri::command]
pub fn list_git_branches(working_directory: String) -> Result<Vec<GitBranch>, String> {
    git_branch_service::list_git_branches(&GitCliBranchProvider, working_directory)
}

#[tauri::command]
pub fn list_git_worktrees(working_directory: String) -> Result<Vec<GitWorktree>, String> {
    git_worktree_service::list_git_worktrees(&GitCliWorktreeProvider, working_directory)
}

#[tauri::command]
pub fn create_git_worktree(
    working_directory: String,
    input: GitWorktreeCreateDraft,
) -> Result<(), String> {
    git_worktree_service::create_git_worktree(&GitCliWorktreeProvider, working_directory, input)
}

#[tauri::command]
pub fn delete_git_worktree(working_directory: String, path: String) -> Result<(), String> {
    git_worktree_service::delete_git_worktree(&GitCliWorktreeProvider, working_directory, path)
}
