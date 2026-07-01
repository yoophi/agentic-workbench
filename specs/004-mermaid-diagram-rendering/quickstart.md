# Quickstart: Mermaid Diagram Rendering

## Prerequisites

- pnpm 9.10.0
- Node environment used by the existing monorepo
- Current branch: `108-mermaid-chart-rendering`

## Setup

```bash
pnpm install
```

## Validation Scenario 1: Core detection

Run shared core tests:

```bash
pnpm --filter @yoophi/markdown-annotation-core test
```

Expected:
- ` ```mermaid ` fenced code blocks are detected as Mermaid.
- Fenced code blocks starting with any priority start token, including `graph`, `flowchart`, `requirementDiagram`, `kanban`, or `info`, are detected as Mermaid.
- Non-Mermaid code blocks remain ordinary code blocks.

## Validation Scenario 2: Shared viewer rendering and fallback

Run shared React package tests:

```bash
pnpm --filter @yoophi/markdown-annotation-react test
pnpm --filter @yoophi/markdown-annotation-react check-types
```

Expected:
- Valid Mermaid blocks render as diagrams.
- Invalid Mermaid source shows block-local fallback with source and a readable failure reason.
- Ordinary code blocks render unchanged.

## Validation Scenario 3: Markdown annotator app

Run app checks:

```bash
pnpm --filter @yoophi/markdown-annotator test
pnpm --filter @yoophi/markdown-annotator check-types
pnpm --filter @yoophi/markdown-annotator build-storybook
```

Expected:
- MarkdownViewer Storybook includes Mermaid success, error fallback, and large diagram states.
- Existing auto reload test remains green.
- Existing annotation and selection behavior remains available in the viewer story or app verification.

## Validation Scenario 4: Agentic workbench consumer regression

Because agentic workbench consumes the shared Markdown viewer packages, run:

```bash
pnpm --filter @yoophi/agentic-workbench test
pnpm --filter @yoophi/agentic-workbench check-types
```

Expected:
- Shared viewer changes do not break worktree Markdown preview compilation or tests.

## Manual Smoke Scenario

1. Start markdown annotator:

   ```bash
   pnpm dev:annotator
   ```

2. Open a Markdown document containing:

   ````markdown
   ```mermaid
   flowchart TD
     A[Open document] --> B[Render diagram]
   ```
   ````

3. Confirm the diagram appears in the document view.
4. Change the file source to a different valid diagram and confirm auto reload updates the visible diagram.
5. Change the source to invalid Mermaid syntax and confirm only that block shows fallback with source and a readable failure reason.

## Completion Criteria

- All package/app tests above pass or any environment-specific failure is documented.
- Storybook covers success, failure, and large diagram states.
- No direct app-to-app imports are introduced.
