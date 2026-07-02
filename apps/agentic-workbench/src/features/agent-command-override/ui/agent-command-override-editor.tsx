import type { AgentDescriptor, AgentCommandOverrides } from "@/entities/agent-run/model/types";
import {
  resolveAgentCommand,
  sourceLabel,
} from "@/features/agent-command-override/model/command-overrides";
import type { CommandOverrideDraft } from "@/features/agent-command-override/model/command-override-form";
import {
  resetAgentCommandDraft,
  resetGlobalCommandDraft,
  updateAgentCommandDraft,
} from "@/features/agent-command-override/model/command-override-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AgentCommandOverrideEditorProps = {
  agents: AgentDescriptor[];
  draft: CommandOverrideDraft;
  savedOverrides: AgentCommandOverrides;
  isSaving?: boolean;
  saveError?: string | null;
  loadError?: string | null;
  onDraftChange: (draft: CommandOverrideDraft) => void;
  onSave: () => void;
};

export function AgentCommandOverrideEditor({
  agents,
  draft,
  savedOverrides,
  isSaving = false,
  saveError = null,
  loadError = null,
  onDraftChange,
  onSave,
}: AgentCommandOverrideEditorProps) {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-medium">Global override</h2>
            <p className="text-sm text-muted-foreground">
              Agent별 override가 없을 때 사용할 ACP 실행 명령입니다.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onDraftChange(resetGlobalCommandDraft(draft))}
          >
            초기화
          </Button>
        </div>
        <Input
          value={draft.globalCommand}
          placeholder="예: npx -y @agentclientprotocol/codex-acp"
          className="font-mono"
          onChange={(event) =>
            onDraftChange({ ...draft, globalCommand: event.target.value })
          }
        />
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-medium">Agent overrides</h2>
          <p className="text-sm text-muted-foreground">
            특정 agent에만 적용할 실행 명령입니다.
          </p>
        </div>

        <div className="grid gap-3">
          {agents.map((agent) => {
            const resolved = resolveAgentCommand({
              agentId: agent.id,
              agents,
              overrides: savedOverrides,
            });
            return (
              <div
                key={agent.id}
                className="grid gap-3 rounded-lg border bg-background p-3 md:grid-cols-[minmax(10rem,14rem)_1fr_auto]"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{agent.label}</div>
                  <div className="truncate font-mono text-xs text-muted-foreground">
                    {agent.command}
                  </div>
                </div>
                <Input
                  value={draft.agentCommands[agent.id] ?? ""}
                  placeholder="Override 없음"
                  className="min-w-0 font-mono"
                  onChange={(event) =>
                    onDraftChange(
                      updateAgentCommandDraft(draft, agent.id, event.target.value),
                    )
                  }
                />
                <div className="flex items-center gap-2 md:justify-end">
                  {resolved && (
                    <Badge
                      variant={resolved.source === "defaultCommand" ? "secondary" : "default"}
                      className={cn("shrink-0", resolved.source !== "defaultCommand" && "font-mono")}
                    >
                      {sourceLabel(resolved.source)}
                    </Badge>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onDraftChange(resetAgentCommandDraft(draft, agent.id))}
                  >
                    초기화
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {(loadError || saveError) && (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {loadError ?? saveError}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="button" onClick={onSave} disabled={isSaving || Boolean(loadError)}>
          {isSaving ? "저장 중" : "저장"}
        </Button>
      </div>
    </div>
  );
}
