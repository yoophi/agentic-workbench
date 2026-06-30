/**
 * git-explorer(정본)와 agentic-workbench가 공유하는 Git 데이터 타입.
 * Rust(git-core) 출력의 TypeScript 미러이며, history / commit-graph /
 * commit-detail / file-diff 응답 shape를 단일 소스로 정의한다.
 */

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

export type GitCommitQueryOptions = {
  maxCount?: number;
  offset?: number;
  includedRefs?: string[];
  excludedRefs?: string[];
};
