import { useQuery } from "@tanstack/react-query";
import { GitCommit, RefreshCw } from "lucide-react";
import { Button } from "@yoophi/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@yoophi/ui/components/table";
import { getAppInfo } from "@/entities/repository";

const changes = [
  { path: "apps/desktop/src/main.tsx", state: "Added", detail: "React entry point" },
  { path: "apps/desktop/src-tauri/src/lib.rs", state: "Added", detail: "Tauri commands" },
  { path: "packages/ui/src", state: "Added", detail: "Shared UI primitives" },
];

export function ChangesPanel() {
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
            <h2 className="truncate text-sm font-medium">Working Tree</h2>
            <p className="truncate text-xs text-muted-foreground">
              {appInfo.data ? `${appInfo.data.name} ${appInfo.data.version}` : "Loading app info"}
            </p>
          </div>
        </div>
        <Button size="icon-sm" variant="outline" aria-label="Refresh">
          <RefreshCw />
        </Button>
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-4">
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
      </div>
    </section>
  );
}
