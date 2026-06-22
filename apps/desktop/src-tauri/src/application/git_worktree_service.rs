use std::{
    path::Path,
    time::{SystemTime, UNIX_EPOCH},
};

use crate::domain::{
    git_worktree::{GitWorktree, GitWorktreeCreateDraft},
    git_worktree_provider::GitWorktreeProvider,
};

pub fn list_git_worktrees(
    provider: &impl GitWorktreeProvider,
    working_directory: String,
) -> Result<Vec<GitWorktree>, String> {
    let working_directory = normalize_required_path(working_directory, "Working directory")?;
    provider.list_worktrees(&working_directory)
}

pub fn create_git_worktree(
    provider: &impl GitWorktreeProvider,
    working_directory: String,
    draft: GitWorktreeCreateDraft,
) -> Result<(), String> {
    let working_directory = normalize_required_path(working_directory, "Working directory")?;
    let branch = normalize_optional(draft.branch)
        .map(Ok)
        .unwrap_or_else(new_worktree_name)?;
    let path = normalize_optional(Some(draft.path))
        .map(Ok)
        .unwrap_or_else(|| default_worktree_path(&working_directory, Some(&branch)))?;
    let reference = normalize_optional(draft.reference);

    provider.create_worktree(
        &working_directory,
        GitWorktreeCreateDraft {
            path,
            branch: Some(branch),
            reference,
        },
    )
}

pub fn delete_git_worktree(
    provider: &impl GitWorktreeProvider,
    working_directory: String,
    path: String,
) -> Result<(), String> {
    let working_directory = normalize_required_path(working_directory, "Working directory")?;
    let path = normalize_required_path(path, "Worktree path")?;
    provider.delete_worktree(&working_directory, &path)
}

fn normalize_required_path(value: String, field_name: &str) -> Result<String, String> {
    let value = value.trim().to_owned();

    if value.is_empty() {
        return Err(format!("{field_name} is required."));
    }

    Ok(value)
}

fn normalize_optional(value: Option<String>) -> Option<String> {
    value.and_then(|value| {
        let trimmed = value.trim().to_owned();
        (!trimmed.is_empty()).then_some(trimmed)
    })
}

fn default_worktree_path(
    working_directory: &str,
    branch_name: Option<&str>,
) -> Result<String, String> {
    let project_dir = Path::new(working_directory);
    let project_name = project_dir
        .file_name()
        .and_then(|name| name.to_str())
        .ok_or_else(|| "Failed to resolve project directory name.".to_owned())?;
    let parent = project_dir
        .parent()
        .ok_or_else(|| "Failed to resolve project parent directory.".to_owned())?;
    let worktree_name = branch_name
        .map(sanitize_path_segment)
        .filter(|name| !name.is_empty())
        .map(Ok)
        .unwrap_or_else(new_worktree_name)?;

    Ok(parent
        .join("worktrees")
        .join(project_name)
        .join(worktree_name)
        .to_string_lossy()
        .into_owned())
}

fn new_worktree_name() -> Result<String, String> {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|error| format!("Failed to generate worktree name: {error}"))?
        .as_nanos();

    Ok(format!("worktree-{nanos:x}"))
}

fn sanitize_path_segment(value: &str) -> String {
    let mut sanitized = String::new();
    let mut last_was_separator = false;

    for character in value.chars() {
        if character.is_ascii_alphanumeric() || matches!(character, '.' | '_' | '-') {
            sanitized.push(character);
            last_was_separator = false;
        } else if !last_was_separator {
            sanitized.push('-');
            last_was_separator = true;
        }
    }

    sanitized
        .trim_matches(|character| character == '-' || character == '.')
        .to_owned()
}
