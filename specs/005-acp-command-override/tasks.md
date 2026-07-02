# Tasks: ACP Agent 실행 명령 Override

**Input**: Design documents from `/specs/005-acp-command-override/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Feature specification and constitution require verification for settings persistence, command resolution, UI state, and execution failure handling. Test tasks are included before implementation tasks where the logic is pure or contract-sensitive.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create feature directories and placeholders that later story tasks can fill.

- [X] T001 Create settings page and command override feature directories in `apps/agentic-workbench/src/pages/settings/ui`, `apps/agentic-workbench/src/features/agent-command-override/model`, and `apps/agentic-workbench/src/features/agent-command-override/ui`
- [X] T002 [P] Create command override documentation placeholder in `docs/acp-agent-command-override.md`
- [X] T003 [P] Create command override Storybook placeholder section in `apps/agentic-workbench/src/stories/organisms.stories.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend shared settings contracts and pure helpers that all user stories depend on.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Add `AgentCommandOverrides` and command source types to `apps/agentic-workbench/src-tauri/src/domain/agent_run_settings.rs`
- [X] T005 [P] Add matching `AgentCommandOverrides` and command source TypeScript types to `apps/agentic-workbench/src/entities/agent-run/model/types.ts`
- [X] T006 Add failing Rust tests for command override normalization and backward-compatible missing `commandOverrides` deserialization in `apps/agentic-workbench/src-tauri/src/application/agent_run_settings_service.rs`
- [X] T007 Implement command override normalization in `apps/agentic-workbench/src-tauri/src/application/agent_run_settings_service.rs`
- [X] T008 Add failing TypeScript tests for command source calculation in `apps/agentic-workbench/src/features/agent-command-override/model/command-overrides.test.ts`
- [X] T009 Implement command source calculation helper in `apps/agentic-workbench/src/features/agent-command-override/model/command-overrides.ts`

**Checkpoint**: Settings model, normalization, and command source helpers are ready for user story work.

---

## Phase 3: User Story 1 - 실행 명령 override 설정 (Priority: P1) MVP

**Goal**: 사용자가 설정 페이지에서 ACP agent 실행 명령 override를 입력, 저장, 초기화하고 앱 재시작 후에도 다시 확인할 수 있다.

**Independent Test**: 설정 페이지에서 전역 및 agent별 override를 저장한 뒤 다시 열었을 때 같은 값과 적용 출처가 표시된다.

### Tests for User Story 1

- [X] T010 [P] [US1] Add failing Rust save/load tests for persisted `commandOverrides` in `apps/agentic-workbench/src-tauri/src/application/agent_run_settings_service.rs`
- [X] T011 [P] [US1] Add failing UI model tests for draft reset and save-error retention in `apps/agentic-workbench/src/features/agent-command-override/model/command-override-form.test.ts`

### Implementation for User Story 1

- [X] T012 [US1] Update `save_settings` and `get_settings` behavior to preserve normalized command override values in `apps/agentic-workbench/src-tauri/src/application/agent_run_settings_service.rs`
- [X] T013 [P] [US1] Add command override form state helpers in `apps/agentic-workbench/src/features/agent-command-override/model/command-override-form.ts`
- [X] T014 [P] [US1] Extend Tauri settings adapter type usage for `commandOverrides` in `apps/agentic-workbench/src/entities/agent-run/api/agent-run-repository.ts`
- [X] T015 [US1] Implement reusable override editor controls in `apps/agentic-workbench/src/features/agent-command-override/ui/agent-command-override-editor.tsx`
- [X] T016 [US1] Implement settings page that loads agents and settings in `apps/agentic-workbench/src/pages/settings/ui/settings-page.tsx`
- [X] T017 [US1] Add settings route and navigation entry in `apps/agentic-workbench/src/app/App.tsx`
- [X] T018 [US1] Add settings UI states for empty, global override, agent override, save error, and long command in `apps/agentic-workbench/src/stories/organisms.stories.tsx`

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - override 우선 적용으로 agent 실행 (Priority: P1)

**Goal**: 저장된 override가 agent 실행 시 agent별 override, 전역 override, 기본 명령 순서로 적용된다.

**Independent Test**: 저장된 override 상태별로 run을 시작했을 때 실행 요청의 `agentCommand`가 기대 값과 일치하고, override가 없으면 기존 기본 명령 흐름이 유지된다.

### Tests for User Story 2

- [X] T019 [P] [US2] Add failing Rust tests for agent command resolution priority in `apps/agentic-workbench/src-tauri/src/application/agent_run_settings_service.rs`
- [X] T020 [P] [US2] Add failing frontend run request tests for injecting resolved `agentCommand` in `apps/agentic-workbench/src/features/agent-run/model/run-panel-state.test.ts`

### Implementation for User Story 2

- [X] T021 [US2] Implement command resolution result helper using agent-specific override, global override, and catalog default in `apps/agentic-workbench/src-tauri/src/application/agent_run_settings_service.rs`
- [X] T022 [US2] Ensure `start_agent_run` preserves non-empty `request.agent_command` during normalization in `apps/agentic-workbench/src-tauri/src/inbound/tauri_commands.rs`
- [X] T023 [US2] Load saved command overrides into the agent run panel state in `apps/agentic-workbench/src/features/agent-run/ui/agent-run-panel.tsx`
- [X] T024 [US2] Inject the resolved override command into `startAgentRun` requests in `apps/agentic-workbench/src/features/agent-run/ui/agent-run-panel.tsx`
- [X] T025 [US2] Preserve default-command behavior when no override exists in `apps/agentic-workbench/src/features/agent-run/ui/agent-run-panel.tsx`

**Checkpoint**: User Stories 1 and 2 work independently and together.

---

## Phase 5: User Story 3 - 잘못된 명령어 실행 실패 확인 (Priority: P2)

**Goal**: 잘못된 override로 agent 실행이 실패하면 사용자가 원인과 설정 수정 경로를 명확히 확인할 수 있다.

**Independent Test**: 존재하지 않는 override 명령으로 run을 시작하면 오류 상태가 표시되고 설정 수정 경로가 제공되며 기존 세션과 worktree 상태는 유지된다.

### Tests for User Story 3

- [X] T026 [P] [US3] Add failing Rust runner test for spawn failure message including command context in `apps/agentic-workbench/src-tauri/src/infrastructure/acp/runner.rs`
- [X] T027 [P] [US3] Add failing frontend error display test for override command failures in `apps/agentic-workbench/src/features/agent-run/model/run-panel-state.test.ts`

### Implementation for User Story 3

- [X] T028 [US3] Improve ACP runner spawn and parse failure messages with command context in `apps/agentic-workbench/src-tauri/src/infrastructure/acp/runner.rs`
- [X] T029 [US3] Surface override-related run errors with a settings navigation action in `apps/agentic-workbench/src/features/agent-run/ui/agent-run-panel.tsx`
- [X] T030 [US3] Add route handling so the error action opens settings without losing current worktree context in `apps/agentic-workbench/src/app/App.tsx`

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, final verification, and cleanup across all user stories.

- [X] T031 [P] Document override priority, persistence, and failure recovery in Korean in `docs/acp-agent-command-override.md`
- [X] T032 [P] Update quickstart validation notes if implementation changes verification commands in `specs/005-acp-command-override/quickstart.md`
- [X] T033 [P] Run `pnpm --filter @yoophi/agentic-workbench check-types` and record result in `specs/005-acp-command-override/quickstart.md`
- [X] T034 [P] Run `pnpm --filter @yoophi/agentic-workbench test` and record result in `specs/005-acp-command-override/quickstart.md`
- [X] T035 [P] Run `cargo test -p agentic-workbench` and record result in `specs/005-acp-command-override/quickstart.md`
- [X] T036 Verify no cross-app imports or shared package changes were introduced in `apps/agentic-workbench/src`
- [ ] T037 Run manual quickstart scenarios for settings persistence, priority, execution request reflection, and bad command failure using `specs/005-acp-command-override/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational. This is the MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational and can start after command helper contracts exist; it integrates most naturally after US1 persistence is available.
- **User Story 3 (Phase 5)**: Depends on Foundational and can start after US2 run request integration defines override command context.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: No dependency on other user stories. Delivers settings page save/load/reset.
- **US2 (P1)**: Depends on command override data being available from settings; validates execution application.
- **US3 (P2)**: Depends on execution application path from US2; validates failure clarity and settings recovery path.

### Within Each User Story

- Constitution-required tests are written before implementation.
- Domain/application logic before inbound Tauri wiring.
- Entity/model types before feature UI.
- Feature UI before page route integration.
- Run request resolution before error display enhancements.

### Parallel Opportunities

- T002 and T003 can run in parallel after T001 starts.
- T004 and T005 touch backend/frontend types separately; T005 can run in parallel with T004 after the shape is agreed.
- T010 and T011 can run in parallel for US1.
- T013 and T014 can run in parallel for US1 after T012 contract is clear.
- T019 and T020 can run in parallel for US2.
- T026 and T027 can run in parallel for US3.
- T031 through T035 can run in parallel after implementation stabilizes.

---

## Parallel Example: User Story 1

```text
Task: "T010 [P] [US1] Add failing Rust save/load tests for persisted commandOverrides in apps/agentic-workbench/src-tauri/src/application/agent_run_settings_service.rs"
Task: "T011 [P] [US1] Add failing UI model tests for draft reset and save-error retention in apps/agentic-workbench/src/features/agent-command-override/model/command-override-form.test.ts"
Task: "T013 [P] [US1] Add command override form state helpers in apps/agentic-workbench/src/features/agent-command-override/model/command-override-form.ts"
Task: "T014 [P] [US1] Extend Tauri settings adapter type usage for commandOverrides in apps/agentic-workbench/src/entities/agent-run/api/agent-run-repository.ts"
```

## Parallel Example: User Story 2

```text
Task: "T019 [P] [US2] Add failing Rust tests for agent command resolution priority in apps/agentic-workbench/src-tauri/src/application/agent_run_settings_service.rs"
Task: "T020 [P] [US2] Add failing frontend run request tests for injecting resolved agentCommand in apps/agentic-workbench/src/features/agent-run/model/run-panel-state.test.ts"
```

## Parallel Example: User Story 3

```text
Task: "T026 [P] [US3] Add failing Rust runner test for spawn failure message including command context in apps/agentic-workbench/src-tauri/src/infrastructure/acp/runner.rs"
Task: "T027 [P] [US3] Add failing frontend error display test for override command failures in apps/agentic-workbench/src/features/agent-run/model/run-panel-state.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundational model, normalization, and helper tests.
3. Complete Phase 3 settings page save/load/reset.
4. Stop and validate US1 independently through the settings page and tests.

### Incremental Delivery

1. Deliver US1 to make override settings visible and persistent.
2. Deliver US2 to apply saved override settings during agent execution.
3. Deliver US3 to make bad command failures actionable.
4. Complete documentation, Storybook, static checks, Rust tests, and quickstart scenarios.

### Parallel Team Strategy

1. One developer completes backend settings model and normalization.
2. One developer builds frontend form helpers and settings UI.
3. After foundational tasks, frontend and backend tests for each user story can proceed in parallel where marked.

## Notes

- [P] tasks use separate files or independent test scopes.
- [US1], [US2], and [US3] labels map to user stories in `spec.md`.
- Every task includes an exact file path for direct execution.
