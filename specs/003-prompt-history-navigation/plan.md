# 구현 계획: 프롬프트 히스토리 탐색

**브랜치**: `[087-prompt-history-navigation]` | **날짜**: 2026-07-01 | **명세**: [spec.md](./spec.md)

**입력**: `specs/003-prompt-history-navigation/spec.md`의 기능 명세

## 요약

agent run prompt 입력창에서 사용자가 이전에 전송한 프롬프트를 `ArrowUp`/`ArrowDown`으로 탐색할 수 있게 한다. 구현은 `apps/agentic-workbench` 내부의 feature layer에 한정하며, 프롬프트 히스토리와 탐색 커서의 순수 상태 전이를 `features/agent-run/model`에 추가하고, `AgentRunPanel`의 prompt textarea 키보드 이벤트에서 이를 호출한다. 영속 저장, backend 변경, cross-app 공유는 범위 밖이다.

## 기술 컨텍스트

**언어/버전**: TypeScript 5.6, React 19

**주요 의존성**: Vite, Vitest, React, 기존 shadcn/ui 기반 prompt input 컴포넌트

**저장소**: 영속 저장 없음. 현재 `AgentRunPanel` instance/runtime 범위의 프론트엔드 상태만 사용

**테스트**: Vitest unit test, `pnpm --filter @yoophi/agentic-workbench test`, `pnpm --filter @yoophi/agentic-workbench check-types`

**대상 플랫폼**: Tauri desktop app의 `agentic-workbench` frontend

**프로젝트 유형**: Desktop app frontend feature

**성능 목표**: 일반 prompt history 길이에서 키 입력 즉시 탐색 결과가 반영되어야 하며, 각 탐색은 현재 히스토리 배열 길이에 선형 이하의 단순 상태 계산으로 제한한다.

**제약**: 여러 줄 textarea의 기본 커서 이동을 방해하지 않아야 한다. modifier key와 함께 누른 화살표 입력은 기본 편집 동작을 우선한다. backend, persistence, shared package 변경은 하지 않는다.

**규모/범위**: `apps/agentic-workbench/src/features/agent-run`의 prompt 입력 상호작용 1개 기능. source 변경 예상 파일은 model, model test, panel UI 3개 이내다.

## 헌법 체크

*GATE: Phase 0 research 전에 통과해야 한다. Phase 1 design 뒤 다시 확인한다.*

- **Monorepo Boundary First**: PASS. 변경 범위는 `apps/agentic-workbench` app 내부이며 app-to-app import가 없다.
- **Feature-Sliced Frontend Architecture**: PASS. prompt 입력은 `features/agent-run`의 사용자 상호작용이고, 순수 상태 전이는 `features/agent-run/model`, UI 연결은 `features/agent-run/ui`에 둔다.
- **Hexagonal Tauri Backend Architecture**: 해당 없음. backend/Tauri command 변경이 없다.
- **Shared Core Before Shared UI**: PASS. cross-app 공유가 필요하지 않으며 shared UI/package 추출을 하지 않는다.
- **Atomic Cross-App Verification**: 해당 없음. `packages/*` 또는 `crates/*` 변경이 없다.
- **Documentation and Storybook**: PASS. 재사용 UI 컴포넌트 추가가 아니므로 Storybook 필수 등록 대상이 아니다. feature spec/plan 산출물로 문서화한다.
- **Testing and Safety**: PASS. 순수 히스토리 상태 전이 unit test를 계획한다. 파일/세션/권한/교환 persistence 변경이 없어 root/path/session-owner 검증은 해당 없음이다.

## 프로젝트 구조

### 문서 (이번 기능)

```text
specs/003-prompt-history-navigation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── prompt-history-ui.md
└── tasks.md
```

### 소스 코드 (저장소 루트)

```text
apps/agentic-workbench/src/
├── features/
│   └── agent-run/
│       ├── model/
│       │   ├── run-panel-state.ts
│       │   └── run-panel-state.test.ts
│       └── ui/
│           └── agent-run-panel.tsx
└── components/ui/
    └── prompt-input.tsx
```

**구조 결정**: 히스토리 탐색은 `agent-run` 기능의 prompt 입력 행동에 한정한다. 순수 탐색 상태와 경계 계산은 `features/agent-run/model/run-panel-state.ts`에 추가하고 기존 unit test 파일에서 검증한다. `AgentRunPanel`은 prompt 전송 성공 경로에서 history를 기록하고 textarea `onKeyDown`에서 탐색 결과를 입력 상태에 반영한다. `components/ui/prompt-input.tsx`는 공통 UI primitive이므로 기능별 히스토리 상태를 넣지 않는다.

## 복잡도 추적

헌법 위반 사항 없음.

## Phase 0: 조사 결과

[research.md](./research.md)에 결정 사항을 기록했다. 남은 미해결 명확화 항목은 없다.

## Phase 1: 설계 산출물

- [data-model.md](./data-model.md): Prompt History Entry, Prompt Draft, History Cursor, Navigation Request/Result 정의
- [contracts/prompt-history-ui.md](./contracts/prompt-history-ui.md): prompt 입력 UI 동작 계약
- [quickstart.md](./quickstart.md): 수동/자동 검증 절차

## Phase 1 후 헌법 재점검

- **Monorepo Boundary First**: PASS. 산출물은 app 내부 변경만 지시한다.
- **Feature-Sliced Frontend Architecture**: PASS. model/UI 경계가 feature layer 안에서 분리되어 있다.
- **Hexagonal Tauri Backend Architecture**: 해당 없음. backend 변경 없음.
- **Shared Core Before Shared UI**: PASS. 공유 추출 없음.
- **Atomic Cross-App Verification**: 해당 없음. workspace package/crate 변경 없음.
- **Documentation and Storybook**: PASS. 재사용 UI 추가 없음. 명세/계획/quickstart로 문서화한다.
- **Testing and Safety**: PASS. unit test와 app typecheck/test 검증을 계획했다.

## Agent Context 업데이트

이 저장소의 `.specify/scripts`에는 plan 단계용 agent context 업데이트 스크립트가 없다. 별도 실행 없이 산출물에 구현 컨텍스트를 기록한다.
