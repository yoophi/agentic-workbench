import { FolderGit2Icon } from "lucide-react";

import type { GitWorktree } from "@/entities/project/model/git-worktree";
import type { Project } from "@/entities/project/model/types";
import { AgentRunPanel } from "@/features/agent-run/ui/agent-run-panel";
import { Badge } from "@/components/ui/badge";
import { EllipsisPopoverText } from "@/shared/ui/ellipsis-popover-text";

type ProjectWorktreeSessionPageProps = {
  project: Project;
  worktree: GitWorktree;
  onBack?: () => void;
};

export function ProjectWorktreeSessionPage({
  worktree,
}: ProjectWorktreeSessionPageProps) {
  return (
    <div className="flex h-[calc(100svh-3rem)] min-h-0 flex-col gap-4 overflow-hidden">
      <div className="min-h-0 flex-1">
        <AgentRunPanel
          workingDirectory={worktree.path}
          scrollHeader={
            <div className="sticky top-0 z-20 flex min-w-0 items-center gap-2 border-b bg-background/95 px-3 py-2 backdrop-blur">
              <FolderGit2Icon className="size-4 shrink-0 text-muted-foreground" />
              <EllipsisPopoverText
                value={worktree.path}
                className="min-w-0 flex-1 font-mono text-xs text-muted-foreground"
                contentClassName="font-mono text-xs"
              />
              <Badge variant="outline" className="max-w-44 shrink-0 truncate font-mono">
                {worktree.branch || "-"}
              </Badge>
              <Badge
                variant={worktree.status === "dirty" ? "destructive" : "secondary"}
                className="shrink-0"
              >
                {worktree.status}
              </Badge>
            </div>
          }
        />
      </div>
    </div>
  );
}
