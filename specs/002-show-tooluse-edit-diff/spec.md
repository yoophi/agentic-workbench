# Feature Specification: Tool Use File Change Display

**Feature Branch**: `002-show-tooluse-edit-diff`

**Created**: 2026-07-01

**Status**: Draft

**Input**: User description: "agent-run 표시시, edit tool use, write tool use 시 파일의 변경사항을 화면에 표시해주어야 합니다. https://github.com/openai/codex/ 내 codex-rs 의 구현을 참고하여 반영합니다"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 파일 변경사항 확인 (Priority: P1)

사용자는 agent-run 화면에서 에이전트가 edit 또는 write 도구를 사용해 파일을 변경할 때, 어떤 파일이 어떻게 바뀌었는지 즉시 확인할 수 있다.

**Why this priority**: 파일 변경 내역을 볼 수 없으면 사용자는 에이전트 작업을 신뢰하거나 검토할 수 없으며, 변경 승인과 디버깅의 핵심 흐름이 막힌다.

**Independent Test**: edit 도구 또는 write 도구가 단일 파일을 변경하는 agent-run을 실행하고, 해당 tool use 항목에서 파일 경로와 추가/삭제/수정 라인이 보이는지 확인한다.

**Acceptance Scenarios**:

1. **Given** agent-run 화면에 edit tool use 항목이 표시되어 있고 파일이 수정됨, **When** 사용자가 해당 항목을 확인함, **Then** 변경된 파일 경로와 변경 diff가 함께 표시된다
2. **Given** agent-run 화면에 write tool use 항목이 표시되어 있고 새 파일이 작성됨, **When** 사용자가 해당 항목을 확인함, **Then** 새 파일 경로와 작성된 내용의 diff가 함께 표시된다
3. **Given** tool use가 여러 파일을 변경함, **When** 사용자가 해당 항목을 확인함, **Then** 각 파일별 변경사항이 구분되어 표시된다

---

### User Story 2 - 변경 상태 파악 (Priority: P2)

사용자는 파일 변경 diff와 함께 변경 작업의 진행 상태와 결과를 확인하여, 변경이 진행 중인지, 완료되었는지, 실패했는지 알 수 있다.

**Why this priority**: 동일한 diff라도 작업 상태에 따라 사용자가 취해야 할 행동이 다르며, 실패한 변경을 완료된 변경으로 오해하면 후속 작업 판단이 틀릴 수 있다.

**Independent Test**: 성공한 tool use와 실패한 tool use를 각각 표시하고, 각 항목에서 상태와 변경사항 표시가 일관되게 구분되는지 확인한다.

**Acceptance Scenarios**:

1. **Given** 파일 변경 tool use가 진행 중임, **When** 사용자가 agent-run 화면을 봄, **Then** 변경사항 영역은 진행 중 상태임을 표시한다
2. **Given** 파일 변경 tool use가 완료됨, **When** 사용자가 해당 항목을 확인함, **Then** 완료 상태와 최종 변경 diff가 표시된다
3. **Given** 파일 변경 tool use가 실패함, **When** 사용자가 해당 항목을 확인함, **Then** 실패 상태와 가능한 경우 시도된 변경사항 또는 실패 사유가 표시된다

---

### User Story 3 - 긴 변경사항 탐색 (Priority: P3)

사용자는 긴 파일 변경사항을 화면 안에서 부담 없이 탐색하고, 필요한 파일 또는 변경 묶음에 집중할 수 있다.

**Why this priority**: 실제 agent-run은 여러 파일과 긴 diff를 포함할 수 있으므로, 화면이 과도하게 길어지거나 핵심 정보가 묻히면 검토 효율이 떨어진다.

**Independent Test**: 여러 파일과 긴 diff를 포함한 agent-run을 표시하고, 사용자가 파일별로 변경 내용을 식별하고 필요한 부분을 탐색할 수 있는지 확인한다.

**Acceptance Scenarios**:

1. **Given** tool use가 3개 이상의 파일을 변경함, **When** 사용자가 변경사항을 확인함, **Then** 파일별 변경 묶음이 명확하게 구분된다
2. **Given** 변경 diff가 긴 내용을 포함함, **When** 사용자가 agent-run 화면을 탐색함, **Then** 전체 run의 다른 항목을 가리지 않고 변경사항을 확인할 수 있다

### Edge Cases

- tool use 결과에 파일 경로는 있으나 diff 내용이 비어 있거나 제공되지 않는 경우, 화면은 변경 내용을 사용할 수 없다는 상태를 명확히 표시해야 한다.
- 파일이 새로 생성, 수정, 삭제되는 경우 각각 사용자가 구분할 수 있어야 한다.
- 바이너리 파일, 매우 큰 파일, UTF-8로 표시할 수 없는 파일은 깨진 텍스트 대신 안전한 대체 메시지와 파일 경로를 표시해야 한다.
- 같은 agent-run 안에서 동일 파일이 여러 번 변경되는 경우, tool use 항목별 변경사항이 섞이지 않아야 한다.
- 파일 경로가 길거나 공백을 포함해도 화면 레이아웃이 깨지지 않아야 한다.
- 변경사항 수집 또는 표시 중 오류가 발생해도 agent-run 전체 화면은 계속 사용할 수 있어야 한다.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display file change details inside the corresponding agent-run tool use item when an edit tool changes files.
- **FR-002**: System MUST display file change details inside the corresponding agent-run tool use item when a write tool creates or overwrites files.
- **FR-003**: System MUST show each changed file as a separate, identifiable change group with its path and change type.
- **FR-004**: System MUST show line-level additions and deletions for text file changes whenever diff content is available.
- **FR-005**: System MUST distinguish created, modified, and deleted file changes in the displayed change details.
- **FR-006**: System MUST display the file-change status for each tool use, including in-progress, completed, and failed outcomes when those states are available.
- **FR-007**: System MUST keep file changes associated with the exact tool use that produced them, even when multiple tool uses occur in the same agent-run.
- **FR-008**: System MUST provide a clear fallback state when a file path is known but diff content cannot be displayed.
- **FR-009**: System MUST prevent long paths, long lines, and large diffs from breaking the agent-run layout or obscuring unrelated run items.
- **FR-010**: System MUST preserve the chronological relationship between tool use execution and file-change display so users can understand when each change occurred.
- **FR-011**: System MUST handle multiple changed files in a single tool use without merging their diffs into one ambiguous block.
- **FR-012**: System MUST make file-change display available for existing agent-run records when the stored run data contains sufficient file-change information.
- **FR-013**: System MUST align the visible behavior with the referenced Codex file-change experience: users can see changed paths, change kinds, diff content, and final change status in the run timeline.

### Key Entities

- **Agent Run**: A single visible execution session containing messages, reasoning, tool uses, and results in chronological order.
- **Tool Use**: An agent action shown in the run timeline, including edit and write actions that may produce file changes.
- **File Change**: A user-visible record of a changed file, including path, change type, diff content when available, and display status.
- **Diff Hunk**: A line-level group of additions, deletions, and unchanged context used to explain how a text file changed.

## Constitution Alignment *(mandatory)*

- **Monorepo boundary**: Scope is limited to `apps/agentic-workbench` for the agent-run UI and its app-local session data adapters. Cross-app sharing is not required unless existing shared packages already expose suitable diff display primitives.
- **Frontend layering**: Screen-level composition belongs in `pages`; tool-use interactions and file-change presentation behavior belong in `features`; run/session data models and adapters belong in `entities`; reusable diff UI primitives may live in `shared` or an existing package only if they are app-independent.
- **Backend boundary**: If Tauri/Rust changes are needed to expose stored file-change data, command handlers remain inbound adapters, session/run retrieval belongs in application services, and filesystem or session persistence details remain behind infrastructure adapters and ports.
- **Shared core vs UI**: Prefer existing pure diff parsing/rendering helpers where available. New shared core is justified only if more than one app or package needs the same file-change model or fixtures.
- **Persistence and safety**: File-change display must respect run/session ownership, workspace root boundaries, safe path rendering, size limits for large changes, and UTF-8/binary fallback handling.
- **Documentation and Storybook**: Add or update Storybook coverage for reusable file-change/diff display components. If workflow or architecture is documented, create or update Korean documentation under `docs/*.md` with Mermaid diagrams when a flow is described.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In 95% of agent-run tool use items that include text file changes, users can identify the changed file path and whether lines were added, removed, or modified within 5 seconds.
- **SC-002**: 100% of edit and write tool use items with available file-change data display a visible file-change section in the agent-run timeline.
- **SC-003**: For a tool use that changes up to 10 text files, users can distinguish every changed file and its change type without leaving the agent-run screen.
- **SC-004**: Long file paths and diff lines do not cause horizontal page overflow or overlap with neighboring timeline items in desktop and narrow viewport checks.
- **SC-005**: When diff content is unavailable, 100% of affected file-change entries show a fallback message instead of silently omitting the change.
- **SC-006**: Existing agent-run records with stored file-change data remain viewable, and their file-change sections render without requiring a new run.

## Assumptions

- The first release focuses on displaying file changes, not approving, rejecting, reverting, or editing individual hunks.
- The target screen is the existing `agentic-workbench` agent-run view.
- The referenced Codex Rust implementation is treated as a behavioral reference for user-visible file-change presentation, especially changed paths, change kinds, diff content, and lifecycle status.
- Text diffs are the primary supported format; binary or oversized content may use a safe summary fallback.
- If historical run data lacks diff content, the UI should not reconstruct changes from the current filesystem state because that could misrepresent what happened during the original run.
