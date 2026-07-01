# Quickstart: Agent Run Mermaid Rendering

## Prerequisites

- pnpm 9.10.0
- Node environment used by the existing monorepo
- Current git branch: `112-issue`

## Setup

```bash
pnpm install
```

## Validation Scenario 1: Agent-run unit and type checks

Run the workbench tests and type checks:

```bash
pnpm --filter @yoophi/agentic-workbench test
pnpm --filter @yoophi/agentic-workbench check-types
```

Expected:

- Mermaid branch selection works for `mermaid` fenced code blocks.
- Ordinary code blocks remain ordinary code blocks.
- Streaming normalization continues to tolerate unmatched fences.
- Agent-run panel compiles without changing backend or persistence contracts.

## Validation Scenario 2: Shared package regression checks

If implementation changes `packages/markdown-annotation-core` or `packages/markdown-annotation-react`, run:

```bash
pnpm --filter @yoophi/markdown-annotation-core test
pnpm --filter @yoophi/markdown-annotation-core check-types
pnpm --filter @yoophi/markdown-annotation-react test
pnpm --filter @yoophi/markdown-annotation-react check-types
```

Expected:

- Existing Mermaid detection and renderer tests remain green.
- Shared renderer safety/fallback behavior remains intact.
- Markdown annotator consumer contract is not broken.

## Validation Scenario 3: Storybook or visual state inspection

Run workbench Storybook when agent-run visual states are added or changed:

```bash
pnpm --filter @yoophi/agentic-workbench storybook
```

Expected:

- Agent-run output with a valid Mermaid block displays a diagram.
- Agent-run output with invalid Mermaid displays block-local fallback.
- Agent-run output with a wide diagram remains contained.
- A rendered Mermaid diagram can be opened in a full-screen-sized modal and closed back to agent-run output.
- Narrow viewport inspection does not show overlap with adjacent UI.

## Manual Smoke Scenario

1. Start Agentic Workbench:

   ```bash
   pnpm dev:workbench
   ```

2. Use an agent prompt that produces:

   ````markdown
   ```mermaid
   flowchart TD
     A[Agent starts] --> B[Plan]
     B --> C[Implement]
   ```
   ````

3. Confirm the agent-run output displays the block as a diagram.
4. Prompt the agent to output malformed Mermaid and confirm only that block shows fallback/source/error state.
5. Prompt or fixture a very wide diagram and confirm the agent-run panel layout remains stable with local overflow.
6. Open the rendered Mermaid diagram in expanded view and confirm it appears in a viewport-sized modal with local overflow/navigation when needed.
7. Close the modal and confirm the same agent-run output remains visible.
8. Confirm a non-Mermaid code block such as `ts`, `bash`, or `json` still displays as code.

## Completion Criteria

- Workbench tests and type checks pass.
- Shared package checks pass if package code changed.
- Success, fallback, streaming, ordinary code, large diagram, and expanded modal scenarios are verified.
- No direct app-to-app imports are introduced.
