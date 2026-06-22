export const projectQueryKeys = {
  all: ["projects"] as const,
  gitRemotes: (workingDirectory: string) =>
    ["projects", "git-remotes", workingDirectory] as const,
  gitBranches: (workingDirectory: string) =>
    ["projects", "git-branches", workingDirectory] as const,
  gitWorktrees: (workingDirectory: string) =>
    ["projects", "git-worktrees", workingDirectory] as const,
};
