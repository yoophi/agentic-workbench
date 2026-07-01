# Research: Tool Use File Change Display

## Decision: Represent file changes on the existing tool run event

**Rationale**: The current timeline already merges `tool` events by `toolCallId`. Adding a `fileChanges` array to `RunEvent.Tool` keeps file changes attached to the exact tool use that produced them and avoids a second event stream that could drift out of order. This matches the referenced Codex behavior where file-change items carry changed paths, change kinds, diff content, and status in the run lifecycle.

**Alternatives considered**:

- Separate `fileChange` run event: easier to emit independently, but harder to visually associate with edit/write tool use and could create duplicated timeline items.
- Recompute diff from Git after each tool use: unreliable for historical runs and for repeated edits to the same file because the current filesystem may no longer match the tool's moment in time.

## Decision: Capture write diffs at the filesystem write boundary

**Rationale**: `fs/write_text_file` currently resolves paths inside the workspace, writes content, and emits a generic file system event. That boundary has both the target path and new content, and can read the prior file content before writing. Capturing a bounded text diff there preserves safety checks and produces a truthful per-tool write change.

**Alternatives considered**:

- Capture only after write via Git diff: misses untracked-file intent and can conflate multiple tool writes.
- Capture in frontend: impossible because the frontend does not have the before/after file content and should not read arbitrary workspace files.

## Decision: Parse provider tool update payloads for Codex-style file changes when present

**Rationale**: Codex app-server documents `fileChange` items with `changes` containing path, kind, and diff plus status lifecycle. ACP tool updates may carry provider-specific metadata. Mapping known file-change fields into the normalized `fileChanges` array lets the UI show richer data without hard-coding provider payloads in React.

**Alternatives considered**:

- Show raw JSON payloads only: preserves data but fails the user requirement because changes are not readable in the agent-run view.
- Provider-specific frontend parsing: couples UI rendering to transport details and makes tests more brittle.

## Decision: Reuse `@yoophi/git-ui` diff viewer for unified diff rendering

**Rationale**: `packages/git-ui` already contains `parseDiffLines` and a bounded `DiffViewer` with line numbers and diff line styling. Reusing it avoids a duplicate parser and follows the constitution's shared-core-first guidance.

**Alternatives considered**:

- New app-local diff renderer: smaller import surface but duplicates existing parser behavior.
- Raw `<pre>` diff output only: simpler but weaker readability and less aligned with existing Git UI.

## Decision: Bound oversized, binary, and unavailable changes with explicit fallback states

**Rationale**: The spec requires the timeline layout to remain usable for large diffs and unsafe text. Each file change should indicate whether content is unavailable, binary, truncated, or still in progress so users are not left guessing.

**Alternatives considered**:

- Render every diff fully: risks timeline performance and layout overflow.
- Omit unavailable changes: hides important file activity and violates fallback requirements.

## Decision: Do not add approval/revert workflow in this feature

**Rationale**: The spec explicitly scopes v1 to display only. Approval, rejection, and hunk-level revert would require new permission and workspace mutation flows and should be planned separately.

**Alternatives considered**:

- Add accept/reject buttons now: higher risk and not required for file-change visibility.
