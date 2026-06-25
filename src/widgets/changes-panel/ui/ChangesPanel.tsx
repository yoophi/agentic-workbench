import { useQuery } from "@tanstack/react-query";
import { FolderGit2, GitCommit, RefreshCw } from "lucide-react";
import { Button } from "@yoophi/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@yoophi/ui/components/table";
import { getAppInfo, type Repository } from "@/entities/repository";

type ChangesPanelProps = {
  selectedRepository?: Repository;
};

const changes = [
  { path: "apps/desktop/src/main.tsx", state: "Added", detail: "React entry point" },
  { path: "apps/desktop/src-tauri/src/lib.rs", state: "Added", detail: "Tauri commands" },
  { path: "packages/ui/src", state: "Added", detail: "Shared UI primitives" },
];

export function ChangesPanel({ selectedRepository }: ChangesPanelProps) {
  const appInfo = useQuery({
    queryKey: ["app-info"],
    queryFn: getAppInfo,
  });

  return (
    <section className="flex h-full min-h-0 flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <GitCommit className="size-4 text-muted-foreground" />
          <div className="min-w-0">
            <h2 className="truncate text-sm font-medium">
              {selectedRepository?.name ?? "Working Tree"}
            </h2>
            <p className="truncate text-xs text-muted-foreground">
              {selectedRepository?.path ??
                (appInfo.data
                  ? `${appInfo.data.name} ${appInfo.data.version}`
                  : "Loading app info")}
            </p>
          </div>
        </div>
        <Button size="icon-sm" variant="outline" aria-label="Refresh">
          <RefreshCw />
        </Button>
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        {!selectedRepository ? (
          <div className="flex h-full min-h-80 items-center justify-center">
            <div className="max-w-sm text-center">
              <FolderGit2 className="mx-auto size-10 text-muted-foreground" />
              <h2 className="mt-3 text-sm font-medium">No repository selected</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Add a local Git repository from the sidebar, then select it to inspect its state.
              </p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Path</TableHead>
                <TableHead className="w-24">State</TableHead>
                <TableHead>Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {changes.map((change) => (
                <TableRow key={change.path}>
                  <TableCell className="font-mono text-xs">{change.path}</TableCell>
                  <TableCell>{change.state}</TableCell>
                  <TableCell className="text-muted-foreground">{change.detail}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
}
