# 구현 계획: Tool Use 파일 변경사항 표시

**브랜치**: `feat/show-tooluse-edit-diff` | **작성일**: 2026-07-01 | **명세**: [spec.md](./spec.md)

**입력**: `specs/002-show-tooluse-edit-diff/spec.md`의 기능 명세

**참고**: 이 문서는 `/speckit-plan` 명령으로 생성한 구현 계획이다. 실행 흐름은 `.specify/templates/plan-template.md`를 따른다.

## 요약

`agentic-workbench`의 agent-run timeline에서 edit/write tool use가 만든 파일 변경사항을 해당 tool 항목 안에 표시한다. 현재 run event는 tool의 `locations`만 전달하고 UI도 경로 목록만 렌더링하므로, backend run event 계약에 파일 변경 목록을 추가하고 frontend timeline 모델과 tool step UI가 파일별 change kind, diff/content, 상태, fallback을 렌더링하도록 확장한다. Codex `codex-rs`의 app-server fileChange 흐름처럼 changed path, kind, diff, status를 timeline 항목에 연결하는 사용자 경험을 기준으로 삼는다.

## 기술 컨텍스트

**언어/버전**: TypeScript 5.x, React 19, Rust 2024 edition

**주요 의존성**: Tauri 2, Vite, TanStack Query, lucide-react, 기존 `@yoophi/git-ui` diff parser/viewer, ACP client infrastructure

**저장소**: v1에서는 새 영속 저장소를 추가하지 않는다. Live run event는 Tauri를 통해 emit하고, raw ACP JSONL은 기존 diagnostic storage로 유지한다. 이후 persisted replay가 필요해지면 같은 event shape를 기존 run event envelope로 직렬화할 수 있다.

**테스트**: frontend model/rendering logic은 Vitest로 검증하고, UI 상태는 Storybook stories로 검증한다. event serialization과 ACP/write mapping은 Rust unit test로 검증한다. 실행 대상은 `pnpm --filter @yoophi/agentic-workbench check-types`, `pnpm --filter @yoophi/agentic-workbench test`, `pnpm --filter @yoophi/git-ui test`, `cargo test -p agentic-workbench`이다.

**대상 플랫폼**: macOS/Linux 개발 workspaces에서 실행되는 Tauri desktop app

**프로젝트 유형**: React frontend와 Rust/Tauri backend를 가진 desktop app

**성능 목표**: 최대 10개의 text file 변경사항을 포함한 tool use entry에서도 timeline이 반응성을 유지한다. 긴 diff가 timeline 전체를 과도하게 확장하지 않도록 diff block은 bounded 영역으로 표시한다.

**제약 조건**: file write에는 workspace path containment check를 유지한다. historical diff를 현재 filesystem 상태에서 재구성하지 않는다. 누락, binary, invalid UTF-8, oversized diff/content에는 안전한 fallback을 제공한다. app-specific code는 `apps/agentic-workbench` 안에 둔다.

**규모/범위**: agent-run timeline 화면 1개, edit/write tool use events, file-change display에 한정한다. hunk-level approval/reject/revert action은 제외한다.

## 헌법 준수 확인

*GATE: Phase 0 research 전에 통과해야 한다. Phase 1 design 이후 다시 확인한다.*

- **Monorepo Boundary First**: PASS. App-specific event와 UI 변경은 `apps/agentic-workbench` 안에 둔다. 기존 reusable diff UI는 `agentic-workbench`가 이미 소비하는 `packages/git-ui`에 있으므로 export-only 변경이 가능하다.
- **Feature-Sliced Frontend Architecture**: PASS. Run event types/adapters는 `entities/agent-run`에 둔다. Timeline rendering은 `features/agent-run/ui`에 둔다. Reusable display helper는 `shared` 또는 기존 `@yoophi/git-ui` package에 둔다.
- **Hexagonal Tauri Backend Architecture**: PASS. Domain event shape 변경은 `domain/events.rs`에 둔다. ACP/write mapping은 infrastructure에 남긴다. Event emission은 기존 `RunEventSink` port 뒤에 유지한다.
- **Shared Core Before Shared UI**: PASS. App-specific parser를 새로 만들지 않고 기존 `@yoophi/git-ui` diff parsing/rendering을 재사용한다. Shared UI export는 app shell에 의존하지 않는다.
- **Atomic Cross-App Verification**: PASS. `packages/git-ui`가 변경될 수 있으므로 package test와 `agentic-workbench` typecheck/test를 함께 수행한다.
- **Documentation and Storybook**: PASS. File-change tool 상태를 다루는 Storybook coverage를 `apps/agentic-workbench/src/stories/organisms.stories.tsx` 또는 관련 atomic category에 추가한다. 구현 중 새 event flow diagram이 필요해지지 않는 한 새 `docs/*.md` 문서는 필수로 만들지 않는다.
- **Testing and Safety**: PASS. Rust test는 serialization과 workspace-safe write diff capture를 검증한다. Frontend test는 event merge behavior와 fallback states를 검증한다. ACP write의 기존 path validation은 유지한다.

## 프로젝트 구조

### 문서 산출물

```text
specs/002-show-tooluse-edit-diff/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── run-event-file-changes.md
└── tasks.md
```

### 소스 코드

```text
apps/agentic-workbench/src/
├── entities/agent-run/
│   ├── model/types.ts        # RunEvent.Tool fileChanges model
│   └── model/format.ts       # file changes를 위한 timeline merge/body behavior
├── features/agent-run/
│   └── ui/agent-run-panel.tsx # ToolStep file-change rendering
├── shared/storybook/
│   └── sample-data.ts        # sample tool file changes
└── stories/
    └── organisms.stories.tsx # agent-run tool diff states

apps/agentic-workbench/src-tauri/src/
├── domain/
│   └── events.rs             # FileChange domain event structs
├── infrastructure/acp/
│   ├── client.rs             # fs/write_text_file diff capture and tool update mapping
│   └── util.rs               # 필요 시 bounded text/diff helpers
└── infrastructure/
    └── tauri_run_event_sink.rs # 기존 sink contract consumer 유지

packages/git-ui/src/
├── index.ts                  # workbench가 재사용할 경우 DiffViewer export
├── model/diff.ts             # existing parser
└── ui/diff-viewer.tsx        # existing bounded diff renderer
```

**구조 결정**: Run event는 app-specific contract이므로 `apps/agentic-workbench`에서 구현한다. Unified diff viewer는 이미 일반화되어 있는 `packages/git-ui`를 재사용한다. 새 shared package를 만들거나 app-to-app import를 추가하지 않는다.

## 복잡도 추적

헌법 위반 사항 없음.

## Phase 0: Research

[research.md](./research.md)를 참고한다. 모든 기술적 미확정 사항은 해소되었다.

## Phase 1: Design & Contracts

[data-model.md](./data-model.md), [contracts/run-event-file-changes.md](./contracts/run-event-file-changes.md), [quickstart.md](./quickstart.md)를 참고한다.

## 설계 후 헌법 준수 재확인

- **Monorepo Boundary First**: PASS. 설계는 app event contract를 `apps/agentic-workbench` 안에 유지하고, 기존 `packages/git-ui`는 reusable diff UI dependency로만 사용한다.
- **Feature-Sliced Frontend Architecture**: PASS. Entity model, feature UI, shared Storybook data, stories의 대상 경로가 구체적으로 지정되었다.
- **Hexagonal Tauri Backend Architecture**: PASS. Domain event 추가는 pure serializable type이다. ACP mapping은 infrastructure에 남기며, persistence logic을 Tauri command로 이동하지 않는다.
- **Shared Core Before Shared UI**: PASS. 기존 pure diff parser와 UI component를 재사용한다. Shared UI는 Tauri에 의존하지 않는다.
- **Atomic Cross-App Verification**: PASS. Verification에는 `@yoophi/git-ui` test/check와 `@yoophi/agentic-workbench` check/test가 포함된다.
- **Documentation and Storybook**: PASS. Storybook states는 필수다. 새 architecture flow가 spec artifacts 밖에 추가되지 않으므로 project docs는 선택 사항이다.
- **Testing and Safety**: PASS. Contracts에는 size/binary fallback, path containment, `toolCallId` 기반 event association, missing historical diff를 재구성하지 않는 원칙이 포함된다.
