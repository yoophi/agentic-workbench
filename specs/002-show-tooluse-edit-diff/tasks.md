# 작업 목록: Tool Use 파일 변경사항 표시

**입력**: `specs/002-show-tooluse-edit-diff/`의 설계 문서

**선행 문서**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/run-event-file-changes.md](./contracts/run-event-file-changes.md), [quickstart.md](./quickstart.md)

**테스트**: 사용자 여정 테스트는 선택 사항이지만, 헌법상 pure logic, shared package, Tauri safety boundary 테스트는 필수다. 따라서 event serialization, tool event merge, diff display helper, workspace-safe write diff capture는 테스트 작업을 포함한다.

**구성 방식**: 각 작업은 user story별로 묶어 독립 구현과 검증이 가능하도록 구성한다.

## 형식: `[ID] [P?] [Story] 설명`

- **[P]**: 서로 다른 파일을 다루며 미완료 작업에 직접 의존하지 않아 병렬 실행 가능
- **[Story]**: user story phase에만 사용하며 `[US1]`, `[US2]`, `[US3]` 형식
- 모든 작업 설명에는 실제 파일 경로를 포함

## Phase 1: Setup (공유 기반)

**목적**: 기존 구조와 재사용 가능한 diff rendering 진입점을 정리한다.

- [X] T001 현재 agent-run event, timeline, ACP write, diff viewer 구조를 apps/agentic-workbench/src/entities/agent-run/model/types.ts, apps/agentic-workbench/src/entities/agent-run/model/format.ts, apps/agentic-workbench/src/features/agent-run/ui/agent-run-panel.tsx, apps/agentic-workbench/src-tauri/src/infrastructure/acp/client.rs, packages/git-ui/src/ui/diff-viewer.tsx에서 확인한다
- [X] T002 [P] DiffViewer와 관련 diff type을 packages/git-ui/src/index.ts에서 export한다
- [X] T003 [P] Storybook과 model test에서 사용할 file-change fixture를 apps/agentic-workbench/src/shared/storybook/sample-data.ts에 추가한다

---

## Phase 2: Foundational (차단 선행 작업)

**목적**: 모든 user story가 의존하는 event contract와 merge 기반을 만든다.

**중요**: 이 phase가 끝나기 전에는 user story 구현을 시작하지 않는다.

- [X] T004 ToolFileChange와 ToolFileChangeKind/Status domain struct를 apps/agentic-workbench/src-tauri/src/domain/events.rs에 추가하고 RunEvent::Tool에서 직렬화되도록 만든다
- [X] T005 ToolFileChange TypeScript type과 RunEvent tool fileChanges field를 apps/agentic-workbench/src/entities/agent-run/model/types.ts에 추가한다
- [X] T006 [P] RunEvent::Tool.fileChanges camelCase 출력 Rust serialization test를 apps/agentic-workbench/src-tauri/src/domain/events.rs에 추가한다
- [X] T007 [P] toolCallId merge 중 tool fileChanges 보존과 교체를 검증하는 frontend format test를 apps/agentic-workbench/src/entities/agent-run/model/format.test.ts에 추가한다
- [X] T008 tool timeline item의 fileChanges merge와 body summary 보존 로직을 apps/agentic-workbench/src/entities/agent-run/model/format.ts에 구현한다
- [X] T009 ACP file-change capture를 위한 bounded text/diff 상수와 helper function skeleton을 apps/agentic-workbench/src-tauri/src/infrastructure/acp/util.rs에 추가한다

**Checkpoint**: Event contract, frontend model, backend helper surface가 준비된다.

---

## Phase 3: User Story 1 - 파일 변경사항 확인 (Priority: P1) MVP

**목표**: edit/write tool use 항목 안에서 변경된 파일 경로, change kind, diff/content를 파일별로 표시한다.

**독립 검증**: edit 도구 또는 write 도구가 단일 파일과 여러 파일을 변경하는 agent-run을 실행하고, 해당 tool use 항목에서 파일 경로와 추가/삭제/수정 라인이 보이는지 확인한다.

### User Story 1 테스트

- [X] T010 [P] [US1] fs/write_text_file이 added/modified text file change를 capture하는 Rust test를 apps/agentic-workbench/src-tauri/src/infrastructure/acp/client.rs에 추가한다
- [X] T011 [P] [US1] Codex-style provider path/kind/diff payload가 ToolFileChange로 mapping되는지 검증하는 Rust test를 apps/agentic-workbench/src-tauri/src/infrastructure/acp/client.rs에 추가한다
- [X] T012 [P] [US1] 단일/다중 파일의 tool item body와 fileChanges merge를 검증하는 frontend test를 apps/agentic-workbench/src/entities/agent-run/model/format.test.ts에 추가한다

### User Story 1 구현

- [X] T013 [US1] fs/write_text_file이 파일을 쓰기 전에 bounded unified diff/content를 생성하도록 apps/agentic-workbench/src-tauri/src/infrastructure/acp/client.rs에 구현한다
- [X] T014 [US1] tool_call/tool_call_update payload에서 Codex-style provider file-change를 추출하도록 apps/agentic-workbench/src-tauri/src/infrastructure/acp/client.rs에 구현한다
- [X] T015 [US1] RunEvent::Tool emit 시 captured ToolFileChange entries를 포함하도록 apps/agentic-workbench/src-tauri/src/infrastructure/acp/client.rs를 수정한다
- [X] T016 [US1] kind label, diff/content 선택, fallback text를 위한 file-change rendering helper를 apps/agentic-workbench/src/features/agent-run/ui/agent-run-panel.tsx에 추가한다
- [X] T017 [US1] DiffViewer 또는 bounded content block을 사용해 fileChanges를 tool path row 아래에 렌더링하도록 apps/agentic-workbench/src/features/agent-run/ui/agent-run-panel.tsx를 수정한다
- [X] T018 [US1] write-only fileSystem event가 같은 file-change details를 중복 표시하지 않도록 apps/agentic-workbench/src/entities/agent-run/model/format.ts를 정리한다
- [X] T019 [US1] added, modified, multi-file changes를 포함한 completed tool use Storybook sample state를 apps/agentic-workbench/src/stories/organisms.stories.tsx에 추가한다

**Checkpoint**: User Story 1이 독립적으로 동작하며 MVP가 된다.

---

## Phase 4: User Story 2 - 변경 상태 파악 (Priority: P2)

**목표**: 파일 변경 diff와 함께 in-progress, completed, failed, unavailable 상태를 명확히 표시한다.

**독립 검증**: 성공한 tool use와 실패한 tool use를 각각 표시하고, 각 항목에서 상태와 변경사항 표시가 일관되게 구분되는지 확인한다.

### User Story 2 테스트

- [X] T020 [P] [US2] tool status transition이 fileChanges를 보존하고 display status를 갱신하는지 검증하는 frontend test를 apps/agentic-workbench/src/entities/agent-run/model/format.test.ts에 추가한다
- [X] T021 [P] [US2] failed/unavailable file-change status serialization Rust test를 apps/agentic-workbench/src-tauri/src/domain/events.rs에 추가한다

### User Story 2 구현

- [X] T022 [US2] provider/write 실패를 ToolFileChange status와 message field로 mapping하도록 apps/agentic-workbench/src-tauri/src/infrastructure/acp/client.rs를 수정한다
- [X] T023 [US2] failed/unavailable state를 덮어쓰지 않고 tool status transition을 fileChanges에 반영하도록 apps/agentic-workbench/src/entities/agent-run/model/format.ts를 수정한다
- [X] T024 [US2] file-change row의 status badge/icon을 apps/agentic-workbench/src/features/agent-run/ui/agent-run-panel.tsx에 추가한다
- [X] T025 [US2] in-progress, completed, failed, unavailable file changes Storybook sample state를 apps/agentic-workbench/src/stories/organisms.stories.tsx에 추가한다

**Checkpoint**: User Story 1과 2가 독립적으로 동작한다.

---

## Phase 5: User Story 3 - 긴 변경사항 탐색 (Priority: P3)

**목표**: 여러 파일과 긴 diff를 포함한 tool use에서도 사용자가 파일별 변경 묶음을 식별하고 timeline을 계속 탐색할 수 있다.

**독립 검증**: 여러 파일과 긴 diff를 포함한 agent-run을 표시하고, 파일별 변경 내용을 식별하며 전체 run의 다른 항목을 가리지 않는지 확인한다.

### User Story 3 테스트

- [X] T026 [P] [US3] long path와 unavailable diff fallback formatting을 검증하는 frontend test를 apps/agentic-workbench/src/entities/agent-run/model/format.test.ts에 추가한다
- [X] T027 [P] [US3] 필요하면 empty/long diff input에 대한 git-ui diff viewer test coverage를 packages/git-ui/src/model/diff.test.ts에 추가한다

### User Story 3 구현

- [X] T028 [US3] 긴 fileChanges를 위한 per-file collapsible 또는 bounded container를 apps/agentic-workbench/src/features/agent-run/ui/agent-run-panel.tsx에 추가한다
- [X] T029 [US3] 긴 file path가 horizontal overflow를 만들지 않도록 EllipsisPopoverText 사용을 apps/agentic-workbench/src/features/agent-run/ui/agent-run-panel.tsx에서 보장한다
- [X] T030 [US3] binary, invalid UTF-8, oversized, truncated fallback message를 apps/agentic-workbench/src-tauri/src/infrastructure/acp/client.rs에 적용한다
- [X] T031 [US3] long path, long line, binary, truncated file-change Storybook example을 apps/agentic-workbench/src/stories/organisms.stories.tsx에 추가한다

**Checkpoint**: 모든 user story가 독립적으로 동작하고 긴 변경사항에서도 timeline 사용성이 유지된다.

---

## Phase 6: Polish & Cross-Cutting Concerns

**목적**: 전체 기능 검증, 회귀 방지, 헌법 준수 확인을 마무리한다.

- [X] T032 [P] packages/git-ui 검증을 위해 pnpm --filter @yoophi/git-ui test 및 pnpm --filter @yoophi/git-ui check-types를 실행한다
- [X] T033 [P] apps/agentic-workbench 검증을 위해 pnpm --filter @yoophi/agentic-workbench test 및 pnpm --filter @yoophi/agentic-workbench check-types를 실행한다
- [X] T034 [P] apps/agentic-workbench/src-tauri 검증을 위해 cargo test -p agentic-workbench를 실행한다
- [X] T035 specs/002-show-tooluse-edit-diff/quickstart.md의 quickstart scenarios를 수동 검증한다
- [X] T036 packages/git-ui/src/index.ts 및 packages/git-ui/src/ui/diff-viewer.tsx에 app-to-app import 또는 Tauri dependency가 추가되지 않았는지 확인한다
- [X] T037 contracts/run-event-file-changes.md 기준으로 최종 구현을 검토하고 specs/002-show-tooluse-edit-diff/tasks.md의 task status를 completed로 갱신한다

---

## 의존성과 실행 순서

### Phase 의존성

- **Setup (Phase 1)**: 즉시 시작 가능
- **Foundational (Phase 2)**: Setup 완료 후 진행하며 모든 user story를 block
- **User Stories (Phase 3+)**: Foundational 완료 후 시작 가능
- **Polish (Phase 6)**: 구현하려는 모든 user story 완료 후 진행

### User Story 의존성

- **User Story 1 (P1)**: Foundational 이후 시작 가능하며 MVP 범위
- **User Story 2 (P2)**: Foundational 이후 시작 가능하지만 상태 UI는 US1의 fileChanges rendering 위에 얹는 것이 가장 단순함
- **User Story 3 (P3)**: Foundational 이후 시작 가능하지만 긴 diff 탐색 UI는 US1의 fileChanges rendering을 전제로 함

### 각 User Story 내부 순서

- Constitution-required tests는 구현 전에 작성하고 실패를 확인한다.
- Domain/event model 변경 후 infrastructure mapping을 구현한다.
- Backend event contract 변경 후 frontend type과 merge logic을 연결한다.
- Rendering helper를 만든 뒤 UI에 통합한다.
- Storybook 상태는 해당 story의 UI가 동작한 뒤 추가한다.

## 병렬 실행 기회

- T002와 T003은 서로 다른 파일이라 병렬 가능
- T006, T007, T009는 서로 다른 Rust/TS 파일이라 병렬 가능
- US1의 T010, T011, T012는 테스트 대상이 달라 병렬 가능
- US2의 T020, T021은 frontend/backend 테스트라 병렬 가능
- US3의 T026, T027은 app model과 shared package 테스트라 병렬 가능
- T032, T033, T034는 독립 검증 명령이라 병렬 가능

## 병렬 실행 예시: User Story 1

```text
Task: "T010 [US1] fs/write_text_file이 added/modified text file change를 capture하는 Rust test를 apps/agentic-workbench/src-tauri/src/infrastructure/acp/client.rs에 추가한다"
Task: "T011 [US1] Codex-style provider path/kind/diff payload가 ToolFileChange로 mapping되는지 검증하는 Rust test를 apps/agentic-workbench/src-tauri/src/infrastructure/acp/client.rs에 추가한다"
Task: "T012 [US1] 단일/다중 파일의 tool item body와 fileChanges merge를 검증하는 frontend test를 apps/agentic-workbench/src/entities/agent-run/model/format.test.ts에 추가한다"
```

## 병렬 실행 예시: User Story 2

```text
Task: "T020 [US2] tool status transition이 fileChanges를 보존하고 display status를 갱신하는지 검증하는 frontend test를 apps/agentic-workbench/src/entities/agent-run/model/format.test.ts에 추가한다"
Task: "T021 [US2] failed/unavailable file-change status serialization Rust test를 apps/agentic-workbench/src-tauri/src/domain/events.rs에 추가한다"
```

## 병렬 실행 예시: User Story 3

```text
Task: "T026 [US3] long path와 unavailable diff fallback formatting을 검증하는 frontend test를 apps/agentic-workbench/src/entities/agent-run/model/format.test.ts에 추가한다"
Task: "T027 [US3] 필요하면 empty/long diff input에 대한 git-ui diff viewer test coverage를 packages/git-ui/src/model/diff.test.ts에 추가한다"
```

## 구현 전략

### MVP 우선

User Story 1만 구현하면 MVP가 된다. 이 범위는 backend가 fileChanges를 생성하고, frontend가 해당 변경사항을 tool item 안에 표시하며, 단일/다중 text file diff를 볼 수 있게 만드는 것이다.

### 점진적 제공

1. Phase 1과 Phase 2로 event contract와 merge 기반을 확정한다.
2. Phase 3으로 파일 경로, kind, diff/content 표시를 완성한다.
3. Phase 4로 진행/완료/실패/불가 상태를 명확히 한다.
4. Phase 5로 긴 diff, long path, binary/oversized fallback을 다듬는다.
5. Phase 6으로 package/app/Rust 검증과 quickstart 수동 검증을 완료한다.

### 품질 게이트

- 모든 task는 checklist format을 따른다.
- Story phase task는 `[US1]`, `[US2]`, `[US3]` label을 포함한다.
- Setup/Foundation/Polish task에는 story label을 붙이지 않는다.
- 모든 implementation task는 실제 파일 경로를 포함한다.
