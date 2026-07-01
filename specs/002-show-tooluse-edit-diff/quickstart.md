# Quickstart: Tool Use File Change Display

## Prerequisites

- Install workspace dependencies with `pnpm install`.
- Ensure the Tauri workbench can run for the target workspace.
- Use an isolated Git worktree for manual validation because the feature intentionally displays real file writes.

## Validation Scenario 1: Write Tool Creates a File

1. Start the workbench:

   ```bash
   pnpm tauri:dev:workbench
   ```

2. Open an agent-run session in a disposable workspace.
3. Ask the agent to create a small text file.
4. Expected result:
   - The write tool item appears in the agent-run timeline.
   - The tool item shows the created file path.
   - The file-change section marks the change as added.
   - The created content is visible as diff/content.
   - The layout stays inside the timeline width.

## Validation Scenario 2: Edit Tool Modifies a File

1. In the same disposable workspace, create a simple tracked text file.
2. Ask the agent to edit one line and add one line.
3. Expected result:
   - The edit/write-related tool item shows the modified file path.
   - Added and removed lines are visible.
   - The tool status changes to completed when the run finishes.

## Validation Scenario 3: Multiple Files in One Tool Use

1. Ask the agent to update two small text files in one instruction.
2. Expected result:
   - Each changed file appears as a separate file-change group.
   - File paths and change kinds are not merged into one ambiguous diff block.

## Validation Scenario 4: Fallback State

1. Trigger a write or provider event where diff content is unavailable, oversized, binary, or invalid UTF-8.
2. Expected result:
   - The timeline still shows the affected path.
   - A fallback message explains that text diff content cannot be displayed.
   - The run timeline remains usable.

## Automated Checks

```bash
pnpm --filter @yoophi/git-ui test
pnpm --filter @yoophi/git-ui check-types
pnpm --filter @yoophi/agentic-workbench test
pnpm --filter @yoophi/agentic-workbench check-types
cargo test -p agentic-workbench
```

## Storybook Checks

Add or update organism-level stories for:

- completed tool use with one modified text diff
- completed tool use with a newly added file
- failed tool use with attempted file changes
- unavailable/binary/truncated file change
- long path and long diff line layout

Run the relevant Storybook target if available for `agentic-workbench`; otherwise validate through app-level component tests and the Tauri dev app.
