use std::process::Command;

use crate::application::ports::GitRepositoryValidator;

pub struct GitCliRepositoryValidator;

impl GitRepositoryValidator for GitCliRepositoryValidator {
    fn validate_repository(&self, path: &str) -> Result<String, String> {
        let output = Command::new("git")
            .args(["-C", path, "rev-parse", "--show-toplevel"])
            .output()
            .map_err(|error| format!("Failed to run git: {error}"))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
            return Err(if stderr.is_empty() {
                "Path is not a Git repository.".to_string()
            } else {
                stderr
            });
        }

        let git_root = String::from_utf8(output.stdout)
            .map_err(|error| format!("Git returned invalid UTF-8: {error}"))?
            .trim()
            .to_string();

        if git_root.is_empty() {
            return Err("Git repository root could not be resolved.".to_string());
        }

        Ok(git_root)
    }
}
