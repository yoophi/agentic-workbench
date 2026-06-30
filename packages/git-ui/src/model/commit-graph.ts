import type { GitCommitGraph, GitGraphCommit } from "@yoophi/git-graph";

/**
 * 무한 스크롤로 누적된 graph 페이지들을 하나의 그래프로 합친다.
 * 중복 커밋은 제거하고, page는 마지막 페이지 메타에 offset=0을 적용한다.
 */
export function combineGitCommitGraphPages(pages: GitCommitGraph[]) {
  const [firstPage] = pages;

  if (!firstPage) {
    return undefined;
  }

  const commits: GitGraphCommit[] = [];
  const commitHashes = new Set<string>();

  for (const page of pages) {
    for (const commit of page.commits) {
      if (commitHashes.has(commit.hash)) {
        continue;
      }

      commitHashes.add(commit.hash);
      commits.push(commit);
    }
  }

  const lastPage = pages[pages.length - 1] ?? firstPage;

  return {
    ...firstPage,
    commits,
    page: {
      ...lastPage.page,
      offset: 0,
    },
  };
}
