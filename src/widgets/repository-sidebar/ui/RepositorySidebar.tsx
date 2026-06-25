import { GitBranch, History, Search } from "lucide-react";
import { Input } from "@yoophi/ui/components/input";

const repositories = [
  { name: "tauri-git-explorer", branch: "main", status: "Clean" },
  { name: "worktrees", branch: "feat-setup-project", status: "Draft" },
];

export function RepositorySidebar() {
  return (
    <aside className="flex h-full min-h-0 flex-col border-r bg-sidebar">
      <header className="border-b px-3 py-3">
        <div className="flex items-center gap-2">
          <GitBranch className="size-4 text-muted-foreground" />
          <h1 className="text-sm font-medium">Git Explorer</h1>
        </div>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-7" placeholder="Search repositories" />
        </div>
      </header>
      <nav className="min-h-0 flex-1 overflow-auto p-2">
        {repositories.map((repository) => (
          <button
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
            key={repository.name}
            type="button"
          >
            <History className="size-4 text-muted-foreground" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{repository.name}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {repository.branch} · {repository.status}
              </span>
            </span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
