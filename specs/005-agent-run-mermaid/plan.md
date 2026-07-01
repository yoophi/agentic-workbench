# Implementation Plan: Agent Run Mermaid Rendering

**Branch**: `112-issue` | **Date**: 2026-07-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-agent-run-mermaid/spec.md`

**Note**: `.specify/scripts/bash/setup-plan.sh --json` returned an empty `BRANCH` value in this worktree, but `git branch --show-current` reports `112-issue`.

## Summary

Agentic Workbench의 agent-run streaming Markdown 렌더러에서 `mermaid` fenced code block을 Mermaid 다이어그램으로 표시한다. 기존 agent-run Markdown/code block 표시 흐름은 유지하고, Mermaid 렌더링은 블록 단위로 실패 격리한다. 렌더링된 다이어그램은 agent-run 패널 안에서 contained overflow로 표시되며, 사용자는 전체 화면 크기의 modal에서 viewport 크기에 맞춘 expanded view로 다이어그램을 확인할 수 있다. 이미 workspace package로 존재하는 `@yoophi/markdown-annotation-react`의 Mermaid 렌더링 컴포넌트와 `@yoophi/markdown-annotation-core`의 감지 helper를 재사용해 중복 renderer를 만들지 않되, 적용 범위는 `apps/agentic-workbench/src/features/agent-run`의 agent-run 출력 렌더러로 제한한다.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Vite 7, pnpm 9.10.0

**Primary Dependencies**: `react-markdown`, `remark-gfm`, `@yoophi/markdown-annotation-core`, `@yoophi/markdown-annotation-react`, existing `mermaid` dependency through the shared React package

**Storage**: N/A. Feature displays existing in-memory agent-run output; no new persistence, filesystem, or backend storage behavior.

**Testing**: Vitest, TypeScript `tsc --noEmit`, Storybook state/manual visual validation for agent-run output

**Target Platform**: Agentic Workbench Tauri desktop frontend and browser Storybook environment

**Project Type**: pnpm/Turbo monorepo desktop-app frontend with shared TypeScript packages

**Performance Goals**: Mermaid renderer is loaded only for Mermaid code blocks. Non-Mermaid agent output should keep the existing perceived rendering path. Mermaid render failures must remain block-local. Opening and closing expanded diagram view should not reflow the surrounding agent-run timeline.

**Constraints**: Streaming output may contain incomplete Markdown fences. Rendered diagrams must be contained in the agent-run panel and optionally viewable in a viewport-sized modal. Untrusted agent output must not gain unsafe behavior. Existing ordinary Markdown, ordinary code block, timeline, and message rendering must not regress.

**Scale/Scope**: One workbench feature surface: `apps/agentic-workbench/src/features/agent-run/ui/agent-run-panel.tsx`. Shared package verification is required if existing shared Mermaid helpers/components are changed; otherwise package tests are run as regression checks only.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Monorepo Boundary First**: PASS. App-specific integration stays under `apps/agentic-workbench/src/features/agent-run`. Reused Mermaid logic comes from existing `packages/*`; no app-to-app imports are planned.
- **Feature-Sliced Frontend Architecture**: PASS. The user-facing change belongs to the `features/agent-run` UI. Any reusable workbench-only helper should stay in `features/agent-run/model` or `shared` only if it is cross-domain within the app.
- **Hexagonal Tauri Backend Architecture**: N/A. No Tauri command, Rust, filesystem, persistence, or backend port changes are required.
- **Shared Core Before Shared UI**: PASS. Existing pure detection in `@yoophi/markdown-annotation-core` and existing renderer in `@yoophi/markdown-annotation-react` are reused. New shared UI is not planned unless implementation finds the current exported component contract insufficient.
- **Atomic Cross-App Verification**: PASS. If `packages/*` changes are made, package tests and consuming app checks are required. If no package changes are made, package tests remain regression checks because agentic workbench consumes the shared packages.
- **Documentation and Storybook**: PASS. Storybook coverage is planned for agent-run Mermaid success, fallback, streaming/incomplete, large diagram containment, and expanded modal states. `docs/*.md` is not required because no new architecture document is introduced.
- **Testing and Safety**: PASS. Unit tests cover language extraction/Mermaid branching and streaming normalization. UI/Storybook states cover containment and fallback. No root/path/session-owner validation changes are required.

## Project Structure

### Documentation (this feature)

```text
specs/005-agent-run-mermaid/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── agent-run-mermaid-rendering.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/agentic-workbench/src/features/agent-run/
├── model/
│   └── streaming-markdown.test.ts        # if renderer logic is extracted for unit tests
└── ui/
    └── agent-run-panel.tsx               # agent-run Markdown code block renderer integration

apps/agentic-workbench/src/stories/
└── organisms.stories.tsx                 # agent-run Mermaid visual states if component seams permit

packages/markdown-annotation-core/src/
└── mermaid/detect-mermaid-block.ts       # existing pure helper; reuse or adjust only if needed

packages/markdown-annotation-react/src/
└── MermaidDiagram.tsx                    # existing shared renderer; reuse or adjust only if needed
```

**Structure Decision**: Primary implementation remains local to `apps/agentic-workbench/src/features/agent-run`. Existing shared packages are consumed through their public exports. Any package edits must be justified by a contract gap and verified against both markdown annotator and agentic workbench consumers.

## Complexity Tracking

Constitution violations: none.

## Phase 0: Research

Research complete: [research.md](./research.md)

## Phase 1: Design & Contracts

- Data model: [data-model.md](./data-model.md)
- UI contract: [contracts/agent-run-mermaid-rendering.md](./contracts/agent-run-mermaid-rendering.md)
- Validation quickstart: [quickstart.md](./quickstart.md)
- Agent context update: N/A. No executable agent context update script exists under `.specify/scripts/bash` in this repository.

## Post-Design Constitution Check

- **Monorepo Boundary First**: PASS. `data-model.md` and the contract keep agent-run integration in `apps/agentic-workbench` and shared logic in `packages/*`.
- **Feature-Sliced Frontend Architecture**: PASS. The contract targets `features/agent-run` and avoids app-level routing or page ownership changes.
- **Hexagonal Tauri Backend Architecture**: N/A. No backend design artifact is produced because the feature is display-only.
- **Shared Core Before Shared UI**: PASS. Reuse starts with existing pure detection helper and existing package renderer; no new shared UI package is introduced.
- **Atomic Cross-App Verification**: PASS. `quickstart.md` lists package checks when package code changes and agentic workbench checks for all implementations.
- **Documentation and Storybook**: PASS. Storybook/visual validation is identified for reusable or inspectable agent-run states; project docs are not required.
- **Testing and Safety**: PASS. Tests cover streaming normalization, Mermaid branch selection, fallback isolation, ordinary code preservation, expanded modal behavior, and unsafe output constraints through the shared renderer contract.
