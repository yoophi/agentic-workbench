# Tasks: 프롬프트 히스토리 탐색

**Input**: Design documents from `specs/003-prompt-history-navigation/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/prompt-history-ui.md](./contracts/prompt-history-ui.md), [quickstart.md](./quickstart.md)

**Tests**: 순수 히스토리 상태 전이가 추가되므로 constitution-required unit test가 필수다. 구현 task 전에 관련 테스트 task를 먼저 수행한다.

**Organization**: 사용자 스토리별로 독립 구현/검증할 수 있게 구성한다.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 기존 agent-run prompt 입력 구조와 검증 명령을 확인한다.

- [X] T001 Inspect current prompt submission paths in apps/agentic-workbench/src/features/agent-run/ui/agent-run-panel.tsx
- [X] T002 Inspect existing run panel model tests in apps/agentic-workbench/src/features/agent-run/model/run-panel-state.test.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 사용자 스토리가 공유할 히스토리 상태 모델과 기록 규칙을 준비한다.

**Critical**: 이 phase가 끝나야 사용자 스토리별 키보드 동작을 안정적으로 붙일 수 있다.

- [X] T003 Add PromptHistoryEntry, PromptHistoryCursor, and PromptHistoryState types in apps/agentic-workbench/src/features/agent-run/model/run-panel-state.ts
- [X] T004 Add appendPromptHistory helper that trims text and skips blank prompts in apps/agentic-workbench/src/features/agent-run/model/run-panel-state.ts
- [X] T005 [P] Add unit tests for appendPromptHistory blank, duplicate, and ordering rules in apps/agentic-workbench/src/features/agent-run/model/run-panel-state.test.ts

**Checkpoint**: 히스토리 항목을 안전하게 기록할 수 있고, 공백/중복/순서 규칙이 테스트로 고정된다.

---

## Phase 3: User Story 1 - 이전 프롬프트 다시 불러오기 (Priority: P1) MVP

**Goal**: prompt 입력창에서 `ArrowUp`으로 가장 최근 전송 프롬프트를 불러온다.

**Independent Test**: 프롬프트를 1개 이상 전송한 뒤 입력창 focus 상태에서 `ArrowUp`을 눌렀을 때 최근 prompt가 표시된다.

### Tests for User Story 1

- [X] T006 [P] [US1] Add unit tests for ArrowUp from idle selecting the newest prompt history entry in apps/agentic-workbench/src/features/agent-run/model/run-panel-state.test.ts

### Implementation for User Story 1

- [X] T007 [US1] Implement navigatePromptHistory previous-from-idle behavior in apps/agentic-workbench/src/features/agent-run/model/run-panel-state.ts
- [X] T008 [US1] Add prompt history state and reset/update wiring to AgentRunPanel in apps/agentic-workbench/src/features/agent-run/ui/agent-run-panel.tsx
- [X] T009 [US1] Record successful start run prompt submissions into history in apps/agentic-workbench/src/features/agent-run/ui/agent-run-panel.tsx
- [X] T010 [US1] Handle ArrowUp keydown for prompt mode and apply newest history value in apps/agentic-workbench/src/features/agent-run/ui/agent-run-panel.tsx

**Checkpoint**: User Story 1은 독립적으로 동작하며 MVP로 검증 가능하다.

---

## Phase 4: User Story 2 - 히스토리 앞뒤 탐색 (Priority: P1)

**Goal**: `ArrowUp`/`ArrowDown`으로 오래된 prompt와 더 최근 prompt 사이를 이동한다.

**Independent Test**: A, B, C를 전송한 뒤 `ArrowUp` 반복으로 C, B, A를 보고, `ArrowDown`으로 B, C를 볼 수 있다.

### Tests for User Story 2

- [X] T011 [P] [US2] Add unit tests for previous and next cursor movement across three history entries in apps/agentic-workbench/src/features/agent-run/model/run-panel-state.test.ts
- [X] T012 [P] [US2] Add unit tests for oldest and newest boundary behavior in apps/agentic-workbench/src/features/agent-run/model/run-panel-state.test.ts

### Implementation for User Story 2

- [X] T013 [US2] Extend navigatePromptHistory to move backward and forward through existing viewing cursor state in apps/agentic-workbench/src/features/agent-run/model/run-panel-state.ts
- [X] T014 [US2] Add ArrowDown keydown handling that applies newer history entries in apps/agentic-workbench/src/features/agent-run/ui/agent-run-panel.tsx
- [X] T015 [US2] Record successful direct follow-up prompt submissions into history in apps/agentic-workbench/src/features/agent-run/ui/agent-run-panel.tsx
- [X] T016 [US2] Record successful queued and saved prompt submissions into history in apps/agentic-workbench/src/features/agent-run/ui/agent-run-panel.tsx

**Checkpoint**: User Story 1과 User Story 2가 모두 독립적으로 검증 가능하다.

---

## Phase 5: User Story 3 - 작성 중 draft 보존 (Priority: P2)

**Goal**: history 탐색을 시작하기 전 작성 중이던 draft를 보존하고 최신 위치에서 복원한다.

**Independent Test**: 새 draft를 입력한 뒤 `ArrowUp`으로 history를 보고 `ArrowDown`으로 최신 위치까지 돌아오면 원래 draft가 복원된다.

### Tests for User Story 3

- [X] T017 [P] [US3] Add unit tests for preserving draft on first ArrowUp navigation in apps/agentic-workbench/src/features/agent-run/model/run-panel-state.test.ts
- [X] T018 [P] [US3] Add unit tests for restoring preserved draft when ArrowDown exits newest history entry in apps/agentic-workbench/src/features/agent-run/model/run-panel-state.test.ts
- [X] T019 [P] [US3] Add unit tests for treating edited history text as the next draft when navigation restarts in apps/agentic-workbench/src/features/agent-run/model/run-panel-state.test.ts

### Implementation for User Story 3

- [X] T020 [US3] Extend PromptHistoryState to store preserved draft during active navigation in apps/agentic-workbench/src/features/agent-run/model/run-panel-state.ts
- [X] T021 [US3] Implement ArrowDown exit-to-draft behavior in navigatePromptHistory in apps/agentic-workbench/src/features/agent-run/model/run-panel-state.ts
- [X] T022 [US3] Reset history cursor while preserving normal prompt edits after textarea onValueChange in apps/agentic-workbench/src/features/agent-run/ui/agent-run-panel.tsx

**Checkpoint**: User Story 3은 draft 손실 없이 독립 검증 가능하다.

---

## Phase 6: User Story 4 - 여러 줄 입력과 충돌 방지 (Priority: P2)

**Goal**: 여러 줄 입력 중 중간 줄에서는 기본 커서 이동을 유지하고, 첫 줄/마지막 줄 경계에서만 history 탐색한다.

**Independent Test**: 여러 줄 prompt의 중간 줄에서는 `ArrowUp`/`ArrowDown`이 입력값을 바꾸지 않고, 첫 줄/마지막 줄에서는 history 탐색이 동작한다.

### Tests for User Story 4

- [X] T023 [P] [US4] Add unit tests for textarea cursor boundary detection in apps/agentic-workbench/src/features/agent-run/model/run-panel-state.test.ts
- [X] T024 [P] [US4] Add unit tests that modifier-key arrow events are not handled by history navigation in apps/agentic-workbench/src/features/agent-run/model/run-panel-state.test.ts

### Implementation for User Story 4

- [X] T025 [US4] Implement isPromptHistoryNavigationBoundary helper for first-line and last-line cursor checks in apps/agentic-workbench/src/features/agent-run/model/run-panel-state.ts
- [X] T026 [US4] Integrate multiline boundary and modifier-key guards into PromptInputTextarea onKeyDown in apps/agentic-workbench/src/features/agent-run/ui/agent-run-panel.tsx

**Checkpoint**: 모든 사용자 스토리가 독립적으로 동작하고 여러 줄 편집 경험을 유지한다.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 전체 기능 검증과 정리.

- [X] T027 Run agentic-workbench unit tests with pnpm --filter @yoophi/agentic-workbench test
- [X] T028 Run agentic-workbench type check with pnpm --filter @yoophi/agentic-workbench check-types
- [ ] T029 Execute quickstart manual scenarios from specs/003-prompt-history-navigation/quickstart.md
- [X] T030 Verify no changes were made outside apps/agentic-workbench/src/features/agent-run and specs/003-prompt-history-navigation unless required by implementation in git diff

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational. MVP scope.
- **User Story 2 (Phase 4)**: Depends on Foundational and can reuse US1 wiring when implemented sequentially.
- **User Story 3 (Phase 5)**: Depends on Foundational and can reuse navigation cursor behavior.
- **User Story 4 (Phase 6)**: Depends on Foundational and can be implemented after navigation behavior exists.
- **Polish (Phase 7)**: Depends on selected user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2. No dependency on other stories.
- **US2 (P1)**: Can start after Phase 2. Sequential implementation after US1 is recommended because both touch `agent-run-panel.tsx`.
- **US3 (P2)**: Can start after Phase 2. Sequential implementation after US2 is recommended for cursor state clarity.
- **US4 (P2)**: Can start after Phase 2. Sequential implementation after US1/US2 is recommended because it guards the same keydown path.

### Within Each User Story

- Unit tests for model behavior should be written before implementation and should fail first.
- Model state helpers in `run-panel-state.ts` should be implemented before UI wiring in `agent-run-panel.tsx`.
- `agent-run-panel.tsx` tasks should be sequenced because they touch the same file.

## Parallel Opportunities

- T005 can be implemented in parallel with T003/T004 only after the intended helper names are agreed, but it should fail until implementation is complete.
- T006 can be written in parallel with T007 because it targets the test file while implementation targets the model file.
- T011 and T012 can be written together because both target distinct behavior cases in the same test file, but coordinate edits to avoid conflicts.
- T017, T018, and T019 can be split by behavior case if coordinating the same test file.
- T023 and T024 can be split by behavior case if coordinating the same test file.
- Polish verification tasks T027 and T028 can run in parallel after implementation is complete.

## Parallel Example: User Story 1

```bash
Task: "T006 [P] [US1] Add unit tests for ArrowUp from idle selecting the newest prompt history entry in apps/agentic-workbench/src/features/agent-run/model/run-panel-state.test.ts"
Task: "T007 [US1] Implement navigatePromptHistory previous-from-idle behavior in apps/agentic-workbench/src/features/agent-run/model/run-panel-state.ts"
```

## Parallel Example: User Story 2

```bash
Task: "T011 [P] [US2] Add unit tests for previous and next cursor movement across three history entries in apps/agentic-workbench/src/features/agent-run/model/run-panel-state.test.ts"
Task: "T012 [P] [US2] Add unit tests for oldest and newest boundary behavior in apps/agentic-workbench/src/features/agent-run/model/run-panel-state.test.ts"
```

## Parallel Example: User Story 3

```bash
Task: "T017 [P] [US3] Add unit tests for preserving draft on first ArrowUp navigation in apps/agentic-workbench/src/features/agent-run/model/run-panel-state.test.ts"
Task: "T018 [P] [US3] Add unit tests for restoring preserved draft when ArrowDown exits newest history entry in apps/agentic-workbench/src/features/agent-run/model/run-panel-state.test.ts"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 for US1.
3. Run `pnpm --filter @yoophi/agentic-workbench test`.
4. Manually verify that `ArrowUp` loads the most recent prompt.

### Incremental Delivery

1. US1: recent prompt recall.
2. US2: full previous/next traversal.
3. US3: draft preservation and restoration.
4. US4: multiline boundary and modifier-key safeguards.
5. Run full quickstart validation.

### Parallel Team Strategy

Because several implementation tasks touch `agent-run-panel.tsx`, parallelism should focus on writing model tests for separate behavior cases while one implementer handles UI wiring. Avoid simultaneous edits to the same file without coordination.

## Notes

- `[P]` tasks are parallelizable only when file edit conflicts are coordinated.
- Every user story phase includes a constitution-required model test task.
- No backend, persistence, shared package, or Storybook task is required for this feature.
