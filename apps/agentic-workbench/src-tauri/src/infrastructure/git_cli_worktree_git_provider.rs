use std::process::Command;

use crate::domain::{
    worktree_git::{
        GitCommitDetail, GitCommitFileChange, GitCommitGraph, GitCommitHistory, GitCommitPage,
        GitCommitSummary, GitFileDiff, GitGraphCommit, GitGraphLayoutHints, GitGraphRef,
        GitGraphRefKind,
    },
    worktree_git_provider::WorktreeGitProvider,
};

const MAX_DIFF_BYTES: usize = 120_000;

pub struct GitCliWorktreeGitProvider;

impl WorktreeGitProvider for GitCliWorktreeGitProvider {
    fn list_history(
        &self,
        working_directory: &str,
        limit: usize,
        offset: usize,
    ) -> Result<GitCommitHistory, String> {
        let revisions = vec!["HEAD".to_string()];
        let total_count = git_revision_count(working_directory, &revisions)?;
        if total_count == 0 {
            return Ok(GitCommitHistory {
                commits: Vec::new(),
                page: GitCommitPage::new(offset, limit, total_count, 0),
            });
        }

        let output = Command::new("git")
            .args([
                "-C",
                working_directory,
                "log",
                "--pretty=format:%H%x00%s%x00%an%x00%cI%x1e",
                &format!("--skip={offset}"),
                "-n",
                &limit.to_string(),
            ])
            .args(&revisions)
            .output()
            .map_err(|error| format!("Failed to run git: {error}"))?;

        if !output.status.success() {
            return Err(git_error_message(
                &output.stderr,
                "Failed to list Git history.",
            ));
        }

        let stdout = String::from_utf8(output.stdout)
            .map_err(|error| format!("Git returned invalid UTF-8: {error}"))?;
        let commits = parse_commit_history(&stdout)?;
        let loaded_count = commits.len();

        Ok(GitCommitHistory {
            commits,
            page: GitCommitPage::new(offset, limit, total_count, loaded_count),
        })
    }

    fn get_commit_graph(
        &self,
        working_directory: &str,
        limit: usize,
        offset: usize,
    ) -> Result<GitCommitGraph, String> {
        let revisions = vec!["--all".to_string()];
        let total_count = git_revision_count(working_directory, &revisions)?;
        if total_count == 0 {
            return Ok(GitCommitGraph {
                commits: Vec::new(),
                refs: Vec::new(),
                page: GitCommitPage::new(offset, limit, total_count, 0),
                layout_hints: GitGraphLayoutHints::default_row_layout(),
            });
        }

        let head_hash = git_head_hash(working_directory)?;
        let log_output = Command::new("git")
            .args([
                "-C",
                working_directory,
                "log",
                "--exclude=refs/stash",
                "--topo-order",
                "--date=iso-strict",
                "--pretty=format:%H%x00%h%x00%P%x00%s%x00%an%x00%cI%x1e",
                &format!("--skip={offset}"),
                "-n",
                &limit.to_string(),
            ])
            .args(&revisions)
            .output()
            .map_err(|error| format!("Failed to run git: {error}"))?;

        if !log_output.status.success() {
            return Err(git_error_message(
                &log_output.stderr,
                "Failed to read Git commit graph.",
            ));
        }

        let refs_output = Command::new("git")
            .args([
                "-C",
                working_directory,
                "for-each-ref",
                "--format=%(objectname)%00%(*objectname)%00%(refname)%00%(refname:short)",
                "refs/heads",
                "refs/remotes",
                "refs/tags",
            ])
            .output()
            .map_err(|error| format!("Failed to run git: {error}"))?;

        if !refs_output.status.success() {
            return Err(git_error_message(
                &refs_output.stderr,
                "Failed to read Git refs.",
            ));
        }

        let log_stdout = String::from_utf8(log_output.stdout)
            .map_err(|error| format!("Git returned invalid UTF-8: {error}"))?;
        let refs_stdout = String::from_utf8(refs_output.stdout)
            .map_err(|error| format!("Git returned invalid UTF-8: {error}"))?;
        let commits = parse_commit_graph_history(&log_stdout, &head_hash)?;
        let refs = parse_graph_refs(&refs_stdout)?;
        let loaded_count = commits.len();

        Ok(GitCommitGraph {
            commits,
            refs,
            page: GitCommitPage::new(offset, limit, total_count, loaded_count),
            layout_hints: GitGraphLayoutHints::default_row_layout(),
        })
    }

    fn get_commit_detail(
        &self,
        working_directory: &str,
        commit_hash: &str,
    ) -> Result<GitCommitDetail, String> {
        let metadata_output = Command::new("git")
            .args([
                "-C",
                working_directory,
                "show",
                "-s",
                "--format=%H%x00%s%x00%an%x00%cI",
                commit_hash,
            ])
            .output()
            .map_err(|error| format!("Failed to run git: {error}"))?;

        if !metadata_output.status.success() {
            return Err(git_error_message(
                &metadata_output.stderr,
                "Failed to read Git commit detail.",
            ));
        }

        let metadata = String::from_utf8(metadata_output.stdout)
            .map_err(|error| format!("Git returned invalid UTF-8: {error}"))?;
        let file_output = Command::new("git")
            .args([
                "-C",
                working_directory,
                "diff-tree",
                "--root",
                "--no-commit-id",
                "--name-status",
                "-r",
                commit_hash,
            ])
            .output()
            .map_err(|error| format!("Failed to run git: {error}"))?;

        if !file_output.status.success() {
            return Err(git_error_message(
                &file_output.stderr,
                "Failed to read Git commit files.",
            ));
        }

        let files = String::from_utf8(file_output.stdout)
            .map_err(|error| format!("Git returned invalid UTF-8: {error}"))?;
        parse_commit_detail(&metadata, &files)
    }

    fn get_file_diff(
        &self,
        working_directory: &str,
        commit_hash: &str,
        file_path: &str,
    ) -> Result<GitFileDiff, String> {
        let output = Command::new("git")
            .args([
                "-C",
                working_directory,
                "show",
                "--format=",
                "--find-renames",
                commit_hash,
                "--",
                file_path,
            ])
            .output()
            .map_err(|error| format!("Failed to run git: {error}"))?;

        if !output.status.success() {
            return Err(git_error_message(
                &output.stderr,
                "Failed to read Git file diff.",
            ));
        }

        Ok(file_diff_from_output(
            commit_hash,
            file_path,
            &output.stdout,
        ))
    }
}

fn git_revision_count(repository_path: &str, revisions: &[String]) -> Result<usize, String> {
    let output = Command::new("git")
        .args([
            "-C",
            repository_path,
            "rev-list",
            "--exclude=refs/stash",
            "--count",
        ])
        .args(revisions)
        .output()
        .map_err(|error| format!("Failed to run git: {error}"))?;

    if !output.status.success() {
        return Err(git_error_message(
            &output.stderr,
            "Failed to count Git commits.",
        ));
    }

    let stdout = String::from_utf8(output.stdout)
        .map_err(|error| format!("Git returned invalid UTF-8: {error}"))?;
    stdout
        .trim()
        .parse::<usize>()
        .map_err(|error| format!("Git commit count is invalid: {error}"))
}

fn git_head_hash(repository_path: &str) -> Result<String, String> {
    let output = Command::new("git")
        .args(["-C", repository_path, "rev-parse", "HEAD"])
        .output()
        .map_err(|error| format!("Failed to run git: {error}"))?;

    if !output.status.success() {
        return Err(git_error_message(
            &output.stderr,
            "Failed to read Git HEAD.",
        ));
    }

    let stdout = String::from_utf8(output.stdout)
        .map_err(|error| format!("Git returned invalid UTF-8: {error}"))?;
    Ok(stdout.trim().to_string())
}

fn parse_commit_history(output: &str) -> Result<Vec<GitCommitSummary>, String> {
    output
        .split('\x1e')
        .filter(|record| !record.trim().is_empty())
        .map(|record| {
            let fields = record
                .trim_start_matches('\n')
                .split('\0')
                .collect::<Vec<_>>();
            if fields.len() != 4 {
                return Err(format!("Git history output is invalid: {record}"));
            }
            Ok(GitCommitSummary {
                hash: fields[0].to_string(),
                message: fields[1].to_string(),
                author: fields[2].to_string(),
                date: fields[3].to_string(),
            })
        })
        .collect()
}

fn parse_commit_graph_history(
    output: &str,
    head_hash: &str,
) -> Result<Vec<GitGraphCommit>, String> {
    output
        .split('\x1e')
        .filter(|record| !record.trim().is_empty())
        .map(|record| {
            let fields = record
                .trim_start_matches('\n')
                .split('\0')
                .collect::<Vec<_>>();
            if fields.len() != 6 {
                return Err(format!("Git graph output is invalid: {record}"));
            }
            let parents = fields[2]
                .split_whitespace()
                .map(ToString::to_string)
                .collect::<Vec<_>>();
            Ok(GitGraphCommit {
                hash: fields[0].to_string(),
                short_hash: fields[1].to_string(),
                parents: parents.clone(),
                message: fields[3].to_string(),
                author: fields[4].to_string(),
                date: fields[5].to_string(),
                is_head: fields[0] == head_hash,
                is_merge: parents.len() > 1,
            })
        })
        .collect()
}

fn parse_graph_refs(output: &str) -> Result<Vec<GitGraphRef>, String> {
    output
        .lines()
        .filter(|line| !line.trim().is_empty())
        .filter_map(|line| {
            let fields = line.split('\0').collect::<Vec<_>>();
            if fields.len() != 4 {
                return Some(Err(format!("Git ref output is invalid: {line}")));
            }
            let full_name = fields[2];
            if full_name.starts_with("refs/remotes/") && full_name.ends_with("/HEAD") {
                return None;
            }
            let kind = if full_name.starts_with("refs/heads/") {
                GitGraphRefKind::LocalBranch
            } else if full_name.starts_with("refs/remotes/") {
                GitGraphRefKind::RemoteBranch
            } else if full_name.starts_with("refs/tags/") {
                GitGraphRefKind::Tag
            } else {
                return None;
            };
            let target = if fields[1].is_empty() {
                fields[0]
            } else {
                fields[1]
            };
            Some(Ok(GitGraphRef {
                name: fields[3].to_string(),
                target: target.to_string(),
                kind,
            }))
        })
        .collect()
}

fn parse_commit_detail(metadata: &str, files: &str) -> Result<GitCommitDetail, String> {
    let fields = metadata.trim_end().split('\0').collect::<Vec<_>>();
    if fields.len() != 4 {
        return Err(format!("Git commit detail output is invalid: {metadata}"));
    }
    Ok(GitCommitDetail {
        hash: fields[0].to_string(),
        message: fields[1].to_string(),
        author: fields[2].to_string(),
        date: fields[3].to_string(),
        files: parse_commit_files(files)?,
    })
}

fn parse_commit_files(output: &str) -> Result<Vec<GitCommitFileChange>, String> {
    output
        .lines()
        .filter(|line| !line.trim().is_empty())
        .map(|line| {
            let fields = line.splitn(2, '\t').collect::<Vec<_>>();
            if fields.len() != 2 {
                return Err(format!("Git commit file output is invalid: {line}"));
            }
            Ok(GitCommitFileChange {
                path: fields[1].to_string(),
                status: fields[0].to_string(),
            })
        })
        .collect()
}

fn file_diff_from_output(commit_hash: &str, file_path: &str, output: &[u8]) -> GitFileDiff {
    let is_truncated = output.len() > MAX_DIFF_BYTES;
    let bytes = if is_truncated {
        &output[..MAX_DIFF_BYTES]
    } else {
        output
    };
    let mut content = String::from_utf8_lossy(bytes).to_string();
    let is_binary = content.contains("Binary files") || content.contains("GIT binary patch");
    if is_truncated {
        content.push_str("\n\n[diff truncated]\n");
    }
    GitFileDiff {
        commit_hash: commit_hash.to_string(),
        path: file_path.to_string(),
        content,
        is_binary,
        is_truncated,
    }
}

fn git_error_message(stderr: &[u8], fallback: &str) -> String {
    let message = String::from_utf8_lossy(stderr).trim().to_string();
    if message.is_empty() {
        fallback.to_string()
    } else {
        format!("{fallback}: {message}")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_commit_history_records() {
        let commits = parse_commit_history("abc\0subject\0Author\02026-01-01T00:00:00Z\x1e")
            .expect("history should parse");

        assert_eq!(commits[0].hash, "abc");
        assert_eq!(commits[0].message, "subject");
    }

    #[test]
    fn parses_commit_files() {
        let files = parse_commit_files("M\tREADME.md\nA\tsrc/main.ts\n").expect("files parse");

        assert_eq!(files.len(), 2);
        assert_eq!(files[0].status, "M");
        assert_eq!(files[1].path, "src/main.ts");
    }
}
