# Contract: Agent Run Tool File Changes

## Purpose

Normalize file-change details from edit/write tool use events so the agent-run timeline can display changed files, change kinds, diff content, and lifecycle status inside the corresponding tool item.

## Producer

`apps/agentic-workbench/src-tauri/src/infrastructure/acp/client.rs`

## Consumer

`apps/agentic-workbench/src/entities/agent-run/model/types.ts` and `apps/agentic-workbench/src/features/agent-run/ui/agent-run-panel.tsx`

## Event Shape

```ts
type RunEvent =
  | {
      type: "tool";
      toolCallId?: string;
      status: string;
      title: string;
      locations: string[];
      fileChanges?: ToolFileChange[];
    };

type ToolFileChange = {
  path: string;
  oldPath: string | null;
  kind: "added" | "modified" | "deleted" | "renamed" | "unknown";
  status: "inProgress" | "completed" | "failed" | "unavailable";
  diff: string | null;
  content: string | null;
  binary: boolean;
  truncated: boolean;
  message: string | null;
};
```

## Serialization Rules

- Rust structs use `serde(rename_all = "camelCase")`.
- `RunEvent.Tool.file_changes` serializes as `fileChanges`.
- `ToolFileChange.old_path` serializes as `oldPath`.
- `null` is used when optional text fields are unavailable.

## Merge Rules

- Timeline items merge by `toolCallId` when present.
- Incoming `fileChanges` replace entries with the same `path` and `kind`.
- Incoming tool updates with no `fileChanges` preserve already captured file changes.
- Tool status transitions update the visible status for all file changes that do not carry a more specific failed/unavailable state.

## Write Tool Mapping Rules

- Before `fs/write_text_file` writes content, backend reads existing text content if the file exists and is valid UTF-8 within display limits.
- New file writes produce `kind: "added"` and either a unified diff or bounded content.
- Existing text file writes produce `kind: "modified"` and a unified diff.
- Binary, invalid UTF-8, oversized, or unreadable prior content produces `status: "unavailable"` with `message`.
- Existing workspace path containment checks remain mandatory before file access.

## Codex-Style Provider Mapping Rules

- If a provider tool update contains file-change payloads equivalent to path/kind/diff/status, map them into `fileChanges`.
- Preserve provider status as `inProgress`, `completed`, `failed`, or `unavailable` using the closest local status.
- Unknown change kind maps to `unknown`, not to `modified`.

## UI Contract

- A tool item with `fileChanges.length > 0` displays a file-change section below path rows.
- Each file change displays path, kind, status, and either diff/content or fallback message.
- Diff rendering is bounded and must not cause full-page horizontal overflow.
- Binary/unavailable/truncated states are visible.
- The raw JSON view remains available through existing raw events for diagnostics but is not the primary file-change UI.

## Non-Goals

- No hunk-level accept/reject.
- No automatic revert.
- No reconstruction of missing historical diffs from current workspace files.
