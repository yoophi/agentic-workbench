import { useEffect, useState } from "react";
import type { Layout } from "react-resizable-panels";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  FolderGit2,
  GitBranch as GitBranchIcon,
  GitCommit,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@yoophi/ui/components/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@yoophi/ui/components/resizable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@yoophi/ui/components/table";
import {
  getAppInfo,
  getCommitDetail,
  getCommitGraph,
  getFileDiff,
  listBranches,
  listHistory,
  listWorktrees,
  repositoryKeys,
  type GitBranch,
  type GitCommitGraph,
  type GitGraphCommit,
  type GitGraphRef,
  type GitWorktree,
  type Repository,
} from "@/entities/repository";
import {
  computeGitGraphRows,
  getMaxGraphLane,
  type GitGraphRow,
  type GitGraphSegment,
} from "@/features/history-tree/model/graph-layout";

type ChangesPanelProps = {
  selectedRepository?: Repository;
};

type HistoryView = "list" | "graph";

const CHANGES_LAYOUT_STORAGE_KEY = "repository-detail-columns-layout";

type BranchTreeRow =
  | {
      id: string;
      depth: number;
      name: string;
      type: "folder";
    }
  | {
      branch: GitBranch;
      depth: number;
      id: string;
      name: string;
      type: "branch";
    };

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function getShortHash(hash: string) {
  return hash.slice(0, 8);
}

function getWorktreeKind(worktree: GitWorktree) {
  if (worktree.isBare) {
    return "Bare";
  }

  return worktree.isMain ? "Main" : "Linked";
}

function getShortCommit(commit: string) {
  return commit.slice(0, 8);
}

function loadColumnLayout(): Layout | undefined {
  try {
    return JSON.parse(localStorage.getItem(CHANGES_LAYOUT_STORAGE_KEY) ?? "");
  } catch {
    return undefined;
  }
}

function saveColumnLayout(layout: Layout) {
  localStorage.setItem(CHANGES_LAYOUT_STORAGE_KEY, JSON.stringify(layout));
}

function laneX(lane: number) {
  return 10 + lane * 20;
}

function graphSegmentPath(segment: GitGraphSegment, rowHeight: number) {
  const fromX = laneX(segment.fromLane);
  const toX = laneX(segment.toLane);
  const centerY = rowHeight / 2;

  if (segment.type === "vertical") {
    return `M ${fromX} 0 L ${toX} ${rowHeight}`;
  }

  if (segment.type === "vertical-top") {
    return `M ${fromX} 0 L ${fromX} ${centerY}`;
  }

  if (segment.type === "vertical-bottom") {
    return `M ${fromX} ${centerY} L ${fromX} ${rowHeight}`;
  }

  return `M ${fromX} ${centerY} C ${fromX} ${rowHeight}, ${toX} ${rowHeight}, ${toX} ${rowHeight}`;
}

function GraphCell({
  maxLane,
  row,
  rowHeight,
}: {
  maxLane: number;
  row?: GitGraphRow;
  rowHeight: number;
}) {
  const width = 20 + (maxLane + 1) * 20;
  const nodeX = row ? laneX(row.lane) : 10;
  const centerY = rowHeight / 2;

  return (
    <svg aria-hidden className="block shrink-0" height={rowHeight} width={width}>
      {row?.connections.map((segment, index) => (
        <path
          d={graphSegmentPath(segment, rowHeight)}
          fill="none"
          key={`${segment.type}:${segment.fromLane}:${segment.toLane}:${index}`}
          stroke={segment.color}
          strokeDasharray={segment.type.startsWith("merge") ? "4 3" : undefined}
          strokeWidth="2"
        />
      ))}
      {row ? (
        row.nodeType === "head" ? (
          <>
            <circle cx={nodeX} cy={centerY} fill="none" r="6" stroke="currentColor" strokeWidth="2" />
            <circle cx={nodeX} cy={centerY} fill={row.color} r="4" />
          </>
        ) : row.nodeType === "merge" ? (
          <>
            <circle cx={nodeX} cy={centerY} fill="none" r="5" stroke={row.color} strokeWidth="1.5" />
            <circle cx={nodeX} cy={centerY} fill={row.color} r="3" />
          </>
        ) : (
          <circle cx={nodeX} cy={centerY} fill={row.color} r="4" />
        )
      ) : null}
    </svg>
  );
}

function refsByTarget(refs: GitGraphRef[]) {
  const result = new Map<string, GitGraphRef[]>();

  for (const ref of refs) {
    const existing = result.get(ref.target) ?? [];
    existing.push(ref);
    result.set(ref.target, existing);
  }

  return result;
}

function HistoryGraphView({
  graph,
  graphRefs,
  graphRows,
  maxGraphLane,
  onSelectCommit,
  selectedCommitHash,
}: {
  graph: GitCommitGraph;
  graphRefs: Map<string, GitGraphRef[]>;
  graphRows: Map<string, GitGraphRow>;
  maxGraphLane: number;
  onSelectCommit: (commitHash: string) => void;
  selectedCommitHash?: string;
}) {
  const rowHeight = graph.layoutHints.rowHeight || 32;

  return (
    <div className="overflow-hidden rounded-md border">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_9rem_12rem] border-b bg-muted/40 px-2 py-2 text-xs font-medium text-muted-foreground">
        <span>Graph</span>
        <span>Commit</span>
        <span>Author</span>
        <span>Date</span>
      </div>
      <div>
        {graph.commits.map((commit) => (
          <HistoryGraphRow
            commit={commit}
            graphRefs={graphRefs.get(commit.hash) ?? []}
            graphRow={graphRows.get(commit.hash)}
            isSelected={commit.hash === selectedCommitHash}
            key={commit.hash}
            maxGraphLane={maxGraphLane}
            onSelectCommit={onSelectCommit}
            rowHeight={rowHeight}
          />
        ))}
      </div>
      <div className="border-t px-3 py-2 text-xs text-muted-foreground">
        {graph.commits.length} / {graph.page.totalCount} commits loaded
        {graph.page.hasMore ? " · more commits available" : ""}
      </div>
    </div>
  );
}

function HistoryGraphRow({
  commit,
  graphRefs,
  graphRow,
  isSelected,
  maxGraphLane,
  onSelectCommit,
  rowHeight,
}: {
  commit: GitGraphCommit;
  graphRefs: GitGraphRef[];
  graphRow?: GitGraphRow;
  isSelected: boolean;
  maxGraphLane: number;
  onSelectCommit: (commitHash: string) => void;
  rowHeight: number;
}) {
  return (
    <button
      aria-label={`Commit ${commit.shortHash} by ${commit.author}: ${commit.message}`}
      className="grid w-full grid-cols-[auto_minmax(0,1fr)_9rem_12rem] items-center border-b px-2 text-left text-sm last:border-b-0 hover:bg-muted/50 data-[selected=true]:bg-muted"
      data-selected={isSelected}
      onClick={() => onSelectCommit(commit.hash)}
      style={{ minHeight: rowHeight }}
      type="button"
    >
      <GraphCell maxLane={maxGraphLane} row={graphRow} rowHeight={rowHeight} />
      <span className="flex min-w-0 items-center gap-2 pr-2">
        <span className="font-mono text-xs text-muted-foreground">{commit.shortHash}</span>
        {graphRefs.map((ref) => (
          <span
            className="max-w-40 truncate rounded-sm border bg-background px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground"
            key={`${ref.kind}:${ref.name}`}
            title={ref.name}
          >
            {ref.kind === "tag" ? "tag:" : ""}
            {ref.name}
          </span>
        ))}
        <span className="min-w-0 truncate">{commit.message}</span>
      </span>
      <span className="truncate pr-2 text-xs text-muted-foreground">{commit.author}</span>
      <span className="truncate font-mono text-xs text-muted-foreground">{commit.date}</span>
    </button>
  );
}

function buildBranchTreeRows(branches: GitBranch[]): BranchTreeRow[] {
  const rows: BranchTreeRow[] = [];
  const folders = new Set<string>();

  for (const branch of [...branches].sort((a, b) => a.name.localeCompare(b.name))) {
    const segments = branch.name.split("/").filter(Boolean);
    let folderPath = "";

    for (const [index, segment] of segments.slice(0, -1).entries()) {
      folderPath = folderPath ? `${folderPath}/${segment}` : segment;

      if (!folders.has(folderPath)) {
        folders.add(folderPath);
        rows.push({
          id: `folder:${folderPath}`,
          depth: index,
          name: segment,
          type: "folder",
        });
      }
    }

    rows.push({
      branch,
      depth: Math.max(segments.length - 1, 0),
      id: branch.fullName,
      name: segments[segments.length - 1] ?? branch.name,
      type: "branch",
    });
  }

  return rows;
}

export function ChangesPanel({ selectedRepository }: ChangesPanelProps) {
  const [selectedCommitHash, setSelectedCommitHash] = useState<string>();
  const [selectedFilePath, setSelectedFilePath] = useState<string>();
  const [historyView, setHistoryView] = useState<HistoryView>("list");
  const appInfo = useQuery({
    queryKey: ["app-info"],
    queryFn: getAppInfo,
  });
  const worktreesQuery = useQuery({
    enabled: Boolean(selectedRepository),
    queryKey: selectedRepository
      ? repositoryKeys.worktrees(selectedRepository.id)
      : ["repositories", "unselected", "worktrees"],
    queryFn: () => listWorktrees(selectedRepository?.id ?? ""),
  });
  const branchesQuery = useQuery({
    enabled: Boolean(selectedRepository),
    queryKey: selectedRepository
      ? repositoryKeys.branches(selectedRepository.id)
      : ["repositories", "unselected", "branches"],
    queryFn: () => listBranches(selectedRepository?.id ?? ""),
  });
  const historyQuery = useQuery({
    enabled: Boolean(selectedRepository),
    queryKey: selectedRepository
      ? repositoryKeys.history(selectedRepository.id)
      : ["repositories", "unselected", "history"],
    queryFn: () => listHistory(selectedRepository?.id ?? ""),
  });
  const graphQuery = useQuery({
    enabled: Boolean(selectedRepository),
    queryKey: selectedRepository
      ? repositoryKeys.commitGraph(selectedRepository.id, { maxCount: 300, offset: 0 })
      : ["repositories", "unselected", "commitGraph"],
    queryFn: () => getCommitGraph(selectedRepository?.id ?? "", { maxCount: 300, offset: 0 }),
  });
  const commitDetailQuery = useQuery({
    enabled: Boolean(selectedRepository && selectedCommitHash),
    queryKey:
      selectedRepository && selectedCommitHash
        ? repositoryKeys.commitDetail(selectedRepository.id, selectedCommitHash)
        : ["repositories", "unselected", "commits", "unselected"],
    queryFn: () => getCommitDetail(selectedRepository?.id ?? "", selectedCommitHash ?? ""),
  });
  const fileDiffQuery = useQuery({
    enabled: Boolean(selectedRepository && selectedCommitHash && selectedFilePath),
    queryKey:
      selectedRepository && selectedCommitHash && selectedFilePath
        ? repositoryKeys.fileDiff(selectedRepository.id, selectedCommitHash, selectedFilePath)
        : ["repositories", "unselected", "commits", "unselected", "files", "unselected", "diff"],
    queryFn: () =>
      getFileDiff(selectedRepository?.id ?? "", selectedCommitHash ?? "", selectedFilePath ?? ""),
  });
  const branchRows = buildBranchTreeRows(branchesQuery.data ?? []);
  const graphData = graphQuery.data;
  const graphRows = graphData ? computeGitGraphRows(graphData.commits) : new Map<string, GitGraphRow>();
  const maxGraphLane = getMaxGraphLane(graphRows);
  const graphRefs = graphData ? refsByTarget(graphData.refs) : new Map<string, GitGraphRef[]>();
  const isRefreshing =
    worktreesQuery.isFetching ||
    branchesQuery.isFetching ||
    historyQuery.isFetching ||
    graphQuery.isFetching ||
    commitDetailQuery.isFetching ||
    fileDiffQuery.isFetching;

  useEffect(() => {
    setSelectedCommitHash(undefined);
    setSelectedFilePath(undefined);
  }, [selectedRepository?.id]);

  useEffect(() => {
    setSelectedFilePath(undefined);
  }, [selectedCommitHash]);

  const repositoryInfo = (
    <section className="flex h-full min-h-0 flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <FolderGit2 className="size-4 text-muted-foreground" />
          <div className="min-w-0">
            <h2 className="truncate text-sm font-medium">
              {selectedRepository?.name ?? "Repository info"}
            </h2>
            <p className="truncate text-xs text-muted-foreground">
              {selectedRepository?.path ??
                (appInfo.data
                  ? `${appInfo.data.name} ${appInfo.data.version}`
                  : "Select a repository")}
            </p>
          </div>
        </div>
        <Button
          aria-label="Refresh repository data"
          disabled={!selectedRepository || isRefreshing}
          size="icon-sm"
          variant="outline"
          onClick={() => {
            void worktreesQuery.refetch();
            void branchesQuery.refetch();
            void historyQuery.refetch();
            void graphQuery.refetch();
            if (selectedCommitHash) {
              void commitDetailQuery.refetch();
            }
            if (selectedFilePath) {
              void fileDiffQuery.refetch();
            }
          }}
        >
          {isRefreshing ? <Loader2 className="animate-spin" /> : <RefreshCw />}
        </Button>
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        {!selectedRepository ? (
          <div className="flex h-full min-h-80 items-center justify-center">
            <div className="max-w-xs text-center">
              <FolderGit2 className="mx-auto size-10 text-muted-foreground" />
              <h2 className="mt-3 text-sm font-medium">No repository selected</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Add a local Git repository from the sidebar, then select it.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="grid gap-2">
              <h3 className="text-sm font-medium">Info</h3>
              <div className="grid gap-2 rounded-md border p-3 text-sm">
                <div className="grid gap-1">
                  <span className="text-xs text-muted-foreground">Name</span>
                  <span className="truncate">{selectedRepository.name}</span>
                </div>
                <div className="grid gap-1">
                  <span className="text-xs text-muted-foreground">Path</span>
                  <span className="truncate font-mono text-xs">{selectedRepository.path}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <FolderGit2 className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Worktrees</h3>
              </div>
              {worktreesQuery.isLoading ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Loading worktrees
                </p>
              ) : worktreesQuery.isError ? (
                <p className="flex items-start gap-1.5 text-sm leading-5 text-red-600">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{getErrorMessage(worktreesQuery.error)}</span>
                </p>
              ) : worktreesQuery.data?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No worktrees found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Path</TableHead>
                      <TableHead className="w-28">Branch</TableHead>
                      <TableHead className="w-20">Kind</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {worktreesQuery.data?.map((worktree) => (
                      <TableRow key={worktree.path}>
                        <TableCell className="max-w-0 truncate font-mono text-xs">
                          {worktree.path}
                        </TableCell>
                        <TableCell className="max-w-0 truncate">
                          {worktree.branch ?? getShortCommit(worktree.commit)}
                        </TableCell>
                        <TableCell>{getWorktreeKind(worktree)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <GitBranchIcon className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Branches</h3>
              </div>
              {branchesQuery.isLoading ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Loading branches
                </p>
              ) : branchesQuery.isError ? (
                <p className="flex items-start gap-1.5 text-sm leading-5 text-red-600">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{getErrorMessage(branchesQuery.error)}</span>
                </p>
              ) : branchRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">No branches found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="w-20">Scope</TableHead>
                      <TableHead className="w-20">State</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branchRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell
                          className="max-w-0 truncate"
                          style={{ paddingLeft: `${12 + row.depth * 18}px` }}
                        >
                          {row.type === "folder" ? (
                            <span className="text-muted-foreground">{row.name}</span>
                          ) : (
                            row.name
                          )}
                        </TableCell>
                        <TableCell>
                          {row.type === "branch" ? (row.branch.isRemote ? "Remote" : "Local") : ""}
                        </TableCell>
                        <TableCell>
                          {row.type === "branch" && row.branch.isCurrent ? "Current" : ""}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );

  const commitLog = (
    <section className="flex h-full min-h-0 flex-col">
      <header className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <GitCommit className="size-4 text-muted-foreground" />
          <div className="min-w-0">
            <h2 className="truncate text-sm font-medium">Commit log</h2>
            <p className="truncate text-xs text-muted-foreground">
              {historyView === "graph" ? "Graph view" : "List view"}
            </p>
          </div>
        </div>
        <div className="flex rounded-md border p-0.5">
          <Button
            size="sm"
            variant={historyView === "list" ? "secondary" : "ghost"}
            onClick={() => setHistoryView("list")}
          >
            List
          </Button>
          <Button
            size="sm"
            variant={historyView === "graph" ? "secondary" : "ghost"}
            onClick={() => setHistoryView("graph")}
          >
            Graph
          </Button>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        {!selectedRepository ? (
          <p className="text-sm text-muted-foreground">Select a repository to view commits.</p>
        ) : historyView === "list" && historyQuery.isLoading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading history
          </p>
        ) : historyView === "list" && historyQuery.isError ? (
          <p className="flex items-start gap-1.5 text-sm leading-5 text-red-600">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{getErrorMessage(historyQuery.error)}</span>
          </p>
        ) : historyView === "graph" && graphQuery.isLoading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading graph
          </p>
        ) : historyView === "graph" && graphQuery.isError ? (
          <p className="flex items-start gap-1.5 text-sm leading-5 text-red-600">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{getErrorMessage(graphQuery.error)}</span>
          </p>
        ) : historyView === "list" && historyQuery.data?.length === 0 ? (
          <p className="text-sm text-muted-foreground">No commits found.</p>
        ) : historyView === "graph" && graphData?.commits.length === 0 ? (
          <p className="text-sm text-muted-foreground">No commits found.</p>
        ) : historyView === "graph" && graphData ? (
          <HistoryGraphView
            graph={graphData}
            graphRefs={graphRefs}
            graphRows={graphRows}
            maxGraphLane={maxGraphLane}
            onSelectCommit={setSelectedCommitHash}
            selectedCommitHash={selectedCommitHash}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Hash</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="w-40">Author</TableHead>
                <TableHead className="w-48">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyQuery.data?.map((commit) => {
                const isSelected = commit.hash === selectedCommitHash;

                return (
                  <TableRow
                    className="cursor-pointer data-[selected=true]:bg-muted"
                    data-selected={isSelected}
                    key={commit.hash}
                    onClick={() => setSelectedCommitHash(commit.hash)}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {getShortHash(commit.hash)}
                    </TableCell>
                    <TableCell className="max-w-0 truncate">{commit.message}</TableCell>
                    <TableCell className="max-w-0 truncate text-muted-foreground">
                      {commit.author}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {commit.date}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );

  const commitDetail = (
    <section className="flex h-full min-h-0 flex-col">
      <header className="border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <GitCommit className="size-4 text-muted-foreground" />
          <div className="min-w-0">
            <h2 className="truncate text-sm font-medium">Selected commit</h2>
            <p className="truncate text-xs text-muted-foreground">
              {selectedCommitHash ? getShortHash(selectedCommitHash) : "No commit selected"}
            </p>
          </div>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        {!selectedRepository || !selectedCommitHash ? (
          <div className="flex min-h-60 items-center justify-center">
            <div className="max-w-xs text-center">
              <GitCommit className="mx-auto size-8 text-muted-foreground" />
              <h3 className="mt-3 text-sm font-medium">No commit selected</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Select a commit from the log to inspect changed files and diff.
              </p>
            </div>
          </div>
        ) : commitDetailQuery.isLoading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading commit detail
          </p>
        ) : commitDetailQuery.isError ? (
          <p className="flex items-start gap-1.5 text-sm leading-5 text-red-600">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{getErrorMessage(commitDetailQuery.error)}</span>
          </p>
        ) : commitDetailQuery.data ? (
          <div className="grid gap-4">
            <div className="grid gap-1">
              <p className="font-mono text-xs text-muted-foreground">
                {commitDetailQuery.data.hash}
              </p>
              <h3 className="break-words text-sm font-medium">{commitDetailQuery.data.message}</h3>
              <p className="text-sm text-muted-foreground">
                {commitDetailQuery.data.author} · {commitDetailQuery.data.date}
              </p>
            </div>
            <div className="grid gap-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Status</TableHead>
                    <TableHead>File</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commitDetailQuery.data.files.map((file) => {
                    const isSelected = file.path === selectedFilePath;

                    return (
                      <TableRow
                        className="cursor-pointer data-[selected=true]:bg-muted"
                        data-selected={isSelected}
                        key={`${file.status}:${file.path}`}
                        onClick={() => setSelectedFilePath(file.path)}
                      >
                        <TableCell className="font-mono text-xs">{file.status}</TableCell>
                        <TableCell className="max-w-0 truncate font-mono text-xs">
                          {file.path}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {!selectedFilePath ? (
                <p className="text-sm text-muted-foreground">
                  Select a changed file to inspect its diff.
                </p>
              ) : fileDiffQuery.isLoading ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Loading diff
                </p>
              ) : fileDiffQuery.isError ? (
                <p className="flex items-start gap-1.5 text-sm leading-5 text-red-600">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{getErrorMessage(fileDiffQuery.error)}</span>
                </p>
              ) : fileDiffQuery.data?.isBinary ? (
                <p className="text-sm text-muted-foreground">
                  This file is binary and cannot be displayed as text diff.
                </p>
              ) : fileDiffQuery.data ? (
                <div className="grid gap-2">
                  {fileDiffQuery.data.isTruncated ? (
                    <p className="text-xs text-muted-foreground">Large diff truncated for display.</p>
                  ) : null}
                  <pre className="max-h-96 overflow-auto rounded-md border bg-muted/40 p-3 font-mono text-xs leading-5">
                    {fileDiffQuery.data.content || "No text diff available."}
                  </pre>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );

  return (
    <ResizablePanelGroup defaultLayout={loadColumnLayout()} onLayoutChanged={saveColumnLayout}>
      <ResizablePanel id="repository-info" defaultSize="28%" minSize="240px" maxSize="38%">
        {repositoryInfo}
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel id="commit-log" defaultSize="42%" minSize="340px">
        {commitLog}
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel id="commit-detail" defaultSize="30%" minSize="320px" maxSize="45%">
        {commitDetail}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
