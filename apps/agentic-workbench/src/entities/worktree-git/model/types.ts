export type GitCommitSummary = {
  hash: string;
  message: string;
  author: string;
  date: string;
};

export type GitCommitPage = {
  offset: number;
  limit: number;
  totalCount: number;
  hasMore: boolean;
};

export type GitCommitHistory = {
  commits: GitCommitSummary[];
  page: GitCommitPage;
};

export type GitGraphCommit = {
  hash: string;
  shortHash: string;
  parents: string[];
  message: string;
  author: string;
  date: string;
  isHead: boolean;
  isMerge: boolean;
};

export type GitGraphRef = {
  name: string;
  target: string;
  kind: "localBranch" | "remoteBranch" | "tag";
};

export type GitGraphLayoutHints = {
  rowHeight: number;
  maxInitialLanes: number;
};

export type GitCommitGraph = {
  commits: GitGraphCommit[];
  refs: GitGraphRef[];
  page: GitCommitPage;
  layoutHints: GitGraphLayoutHints;
};

export type GitCommitFileChange = {
  path: string;
  status: string;
};

export type GitCommitDetail = GitCommitSummary & {
  files: GitCommitFileChange[];
};

export type GitFileDiff = {
  commitHash: string;
  path: string;
  content: string;
  isBinary: boolean;
  isTruncated: boolean;
};
