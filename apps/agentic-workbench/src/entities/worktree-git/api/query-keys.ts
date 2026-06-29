export const worktreeGitQueryKeys = {
  all: ["worktree-git"] as const,
  history: (workingDirectory: string) =>
    ["worktree-git", "history", workingDirectory] as const,
  graph: (workingDirectory: string) =>
    ["worktree-git", "graph", workingDirectory] as const,
  commitDetail: (workingDirectory: string, commitHash: string) =>
    ["worktree-git", "commit-detail", workingDirectory, commitHash] as const,
  fileDiff: (workingDirectory: string, commitHash: string, path: string) =>
    ["worktree-git", "file-diff", workingDirectory, commitHash, path] as const,
};
