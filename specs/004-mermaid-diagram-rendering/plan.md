# Implementation Plan: Mermaid Diagram Rendering

**Branch**: `108-mermaid-chart-rendering` | **Date**: 2026-07-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-mermaid-diagram-rendering/spec.md`

## Summary

Markdown annotator에서 Mermaid fenced code block과 Mermaid 시작 선언으로 시작하는 fenced code block을 다이어그램으로 표시한다. 현재 Markdown viewer는 `packages/markdown-annotation-core`와 `packages/markdown-annotation-react`로 이미 공유되어 있고 markdown annotator와 agentic workbench가 모두 소비하므로, Mermaid 감지와 viewer 렌더링 상태는 공유 패키지에서 처리하고 앱은 기존 UI primitive 어댑터와 Storybook 상태만 확장한다.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Vite 7, pnpm 9.10.0

**Primary Dependencies**: `@yoophi/markdown-annotation-core`, `@yoophi/markdown-annotation-react`, `react-markdown`, `remark-gfm`, Mermaid renderer dependency to be added during implementation

**Storage**: N/A. 기존 Markdown 파일 읽기 및 자동 reload 흐름을 사용하며 새 persistence는 없다.

**Testing**: Vitest, TypeScript `tsc --noEmit`, Storybook state for visual validation

**Target Platform**: Tauri desktop app frontend and browser Storybook environment

**Project Type**: pnpm/Turbo monorepo desktop-app frontend with shared TypeScript packages

**Performance Goals**: 일반 문서에서 Mermaid가 없는 기존 Markdown 렌더링 경로에 체감 지연을 추가하지 않는다. Mermaid 포함 문서는 블록 단위 실패 격리와 contained overflow를 보장한다.

**Constraints**: untrusted Markdown content에서 unsafe behavior를 만들지 않는다. 다이어그램은 문서 reading area 안에 containment되어야 한다. 일반 code block, annotation, selection, auto reload 흐름을 유지한다.

**Scale/Scope**: `apps/markdown-annotator`의 Markdown viewer가 1차 대상이며, 이미 공유 viewer를 사용하는 `apps/agentic-workbench` 소비 경로도 회귀 검증 대상이다.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Monorepo Boundary First**: PASS. 앱 간 직접 import 없이 공유 변경은 `packages/markdown-annotation-core`와 `packages/markdown-annotation-react`에 둔다. 앱별 Storybook/adapter 변경은 `apps/markdown-annotator`와 필요 시 `apps/agentic-workbench` 내부에 둔다.
- **Feature-Sliced Frontend Architecture**: PASS. markdown annotator 앱 변경은 `src/shared/ui`와 `src/stories`에 한정한다. screen-level 변경이 필요하면 `src/pages/annotator`에 둔다.
- **Hexagonal Tauri Backend Architecture**: N/A. backend, command, persistence 변경은 계획하지 않는다.
- **Shared Core Before Shared UI**: PASS. Mermaid 감지 규칙은 core pure helper로, rendering state/component는 shared React package로 둔다. 앱 shell이나 Tauri API에 의존하는 shared UI를 만들지 않는다.
- **Atomic Cross-App Verification**: PASS. `packages/*` 변경이 있으므로 core/react package tests와 markdown annotator, agentic workbench type/test 검증을 포함한다.
- **Documentation and Storybook**: PASS. reusable viewer state는 markdown annotator Storybook `Molecules/MarkdownViewer`에 success/error/large 상태를 추가한다. `docs/*.md` 문서는 필요하지 않다.
- **Testing and Safety**: PASS. Mermaid block detection은 fixture-based unit test로 검증하고, rendering failure/safety/selection regression은 package/app tests와 Storybook 상태로 검증한다. 새 filesystem/persistence/session-owner scope는 없다.

## Project Structure

### Documentation (this feature)

```text
specs/004-mermaid-diagram-rendering/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── markdown-viewer-mermaid.md
└── tasks.md
```

### Source Code (repository root)

```text
packages/markdown-annotation-core/src/
├── parse/
│   ├── parse-markdown-to-blocks.ts
│   └── parse-markdown-to-blocks.test.ts
├── mermaid/
│   ├── detect-mermaid-block.ts
│   └── detect-mermaid-block.test.ts
└── types/
    └── markdown-block.ts

packages/markdown-annotation-react/src/
├── MarkdownViewer.tsx
├── MermaidDiagram.tsx
├── styles.css
└── types.ts

apps/markdown-annotator/src/
├── shared/ui/markdown-viewer-components.tsx
└── stories/molecules/MarkdownViewer.stories.tsx

apps/agentic-workbench/src/
└── features/worktree-workspace/ui/markdown-viewer-components.tsx
```

**Structure Decision**: Mermaid 감지와 block metadata는 core package에서 처리한다. 실제 rendering component와 fallback UI는 shared React viewer package에 둔다. markdown annotator는 요구사항의 주요 UX 검증을 Storybook으로 추가하고, agentic workbench는 같은 shared viewer 소비자로 type/test 회귀를 검증한다.

## Complexity Tracking

Constitution 위반 없음.

## Phase 0: Research

Research complete: [research.md](./research.md)

## Phase 1: Design & Contracts

- Data model: [data-model.md](./data-model.md)
- UI/shared package contract: [contracts/markdown-viewer-mermaid.md](./contracts/markdown-viewer-mermaid.md)
- Validation quickstart: [quickstart.md](./quickstart.md)
- Agent context update: N/A. This repository has no executable agent context update script under `.specify/scripts/bash`; `.specify/integration.json` only records the initialized integration.

## Post-Design Constitution Check

- **Monorepo Boundary First**: PASS. design artifacts keep shared behavior under `packages/*` and app-specific stories/adapters under `apps/*`.
- **Feature-Sliced Frontend Architecture**: PASS. no app-to-app imports or screen-coupled reusable code are introduced.
- **Hexagonal Tauri Backend Architecture**: N/A. no backend changes.
- **Shared Core Before Shared UI**: PASS. `data-model.md` defines pure detection before viewer rendering.
- **Atomic Cross-App Verification**: PASS. `quickstart.md` lists package checks and both consuming app checks.
- **Documentation and Storybook**: PASS. Storybook state additions are specified; project docs are not required.
- **Testing and Safety**: PASS. fixture tests, fallback tests, and strict Mermaid safety configuration are planned.
