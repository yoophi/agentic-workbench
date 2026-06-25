import { invoke } from "@tauri-apps/api/core";

export type AppInfo = {
  name: string;
  version: string;
};

export type Repository = {
  id: string;
  name: string;
  path: string;
};

export type GitWorktree = {
  path: string;
  branch?: string | null;
  commit: string;
  isBare: boolean;
  isMain: boolean;
};

export type GitBranch = {
  name: string;
  fullName: string;
  isRemote: boolean;
  isCurrent: boolean;
  worktreePath?: string | null;
};

export type GitCommitSummary = {
  hash: string;
  message: string;
  author: string;
  date: string;
};

export const repositoryKeys = {
  all: ["repositories"] as const,
  worktrees: (repositoryId: string) => ["repositories", repositoryId, "worktrees"] as const,
  branches: (repositoryId: string) => ["repositories", repositoryId, "branches"] as const,
  history: (repositoryId: string) => ["repositories", repositoryId, "history"] as const,
};

export function getAppInfo() {
  return invoke<AppInfo>("app_info");
}

export function listRepositories() {
  return invoke<Repository[]>("list_repositories");
}

export function createRepository(path: string) {
  return invoke<Repository>("create_repository", {
    request: {
      path,
    },
  });
}

export function listWorktrees(repositoryId: string) {
  return invoke<GitWorktree[]>("list_worktrees", {
    request: {
      repositoryId,
    },
  });
}

export function listBranches(repositoryId: string) {
  return invoke<GitBranch[]>("list_branches", {
    request: {
      repositoryId,
    },
  });
}

export function listHistory(repositoryId: string) {
  return invoke<GitCommitSummary[]>("list_history", {
    request: {
      repositoryId,
    },
  });
}
