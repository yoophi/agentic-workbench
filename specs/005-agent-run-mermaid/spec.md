# Feature Specification: Agent Run Mermaid Rendering

**Feature Branch**: `112-issue`

**Created**: 2026-07-02

**Status**: Draft

**Input**: User description: "GitHub issue #112: Agent-run 출력 Markdown에서 fenced code block의 언어가 `mermaid`인 경우 Mermaid chart로 렌더링한다. 렌더링 실패 시 화면이 깨지지 않고 원본 코드 또는 오류 상태를 확인할 수 있어야 한다. 일반 코드 블록 렌더링 동작은 유지한다. streaming 중인 출력에서도 partial Mermaid 코드가 불완전할 수 있음을 고려해 안정적으로 동작해야 한다. 긴 다이어그램이나 넓은 다이어그램은 agent-run 영역 레이아웃을 깨지 않도록 overflow/scroll 처리를 제공한다. Mermaid 렌더링은 agent-run 출력 영역에 한정하고, 다른 Markdown 뷰어와 공유할 수 있는 구조라면 shared UI로 분리한다. Agent-run의 Mermaid 다이어그램은 전체 화면 크기의 modal에서 전체 화면 크기에 맞게 볼 수 있어야 한다."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Agent output diagrams render inline (Priority: P1)

Agentic Workbench에서 agent-run 출력을 읽는 사용자는 agent가 Mermaid로 작성한 설계 흐름, 상태 전이, 작업 계획을 일반 코드가 아니라 다이어그램으로 바로 확인할 수 있다.

**Why this priority**: 이 기능의 핵심 가치는 agent 응답 안의 시각 정보를 별도 도구 없이 이해하는 것이므로, 완성된 Mermaid 코드 블록의 기본 렌더링이 가장 중요한 사용자 가치이다.

**Independent Test**: agent-run 출력에 `mermaid` 언어가 지정된 fenced code block이 포함된 응답을 표시하고, 해당 블록이 다이어그램으로 표시되며 주변 출력이 정상적으로 유지되는지 확인한다.

**Acceptance Scenarios**:

1. **Given** agent 응답에 `mermaid` 언어가 지정된 fenced code block이 포함되어 있다, **When** 사용자가 agent-run 출력 영역에서 응답을 확인한다, **Then** 해당 코드 블록은 Mermaid 다이어그램으로 표시된다.
2. **Given** 같은 agent 응답에 Mermaid 코드 블록과 일반 코드 블록이 함께 있다, **When** 사용자가 agent-run 출력 영역을 확인한다, **Then** Mermaid 코드 블록만 다이어그램으로 표시되고 일반 코드 블록은 기존 코드 표시 방식으로 유지된다.
3. **Given** 하나의 agent-run 출력에 여러 Mermaid 코드 블록이 포함되어 있다, **When** 사용자가 출력을 확인한다, **Then** 각 Mermaid 코드 블록은 독립적인 다이어그램으로 표시된다.

---

### User Story 2 - Rendering failures remain recoverable (Priority: P2)

Agent 응답에 잘못된 Mermaid 문법이나 렌더링할 수 없는 다이어그램이 포함된 경우에도 사용자는 agent-run 화면 전체가 깨지지 않은 상태에서 문제가 된 블록의 원본 코드 또는 오류 상태를 확인할 수 있다.

**Why this priority**: agent 출력은 생성 중이거나 부정확할 수 있으므로, 실패가 전체 대화 흐름을 방해하지 않고 사용자가 원인을 파악할 수 있어야 한다.

**Independent Test**: Mermaid 문법 오류가 있는 agent 응답을 표시하고, 오류가 해당 블록 안에 격리되며 원본 코드 또는 읽을 수 있는 오류 상태가 제공되는지 확인한다.

**Acceptance Scenarios**:

1. **Given** agent 응답의 Mermaid 코드 블록에 문법 오류가 있다, **When** agent-run 출력 영역이 해당 응답을 표시한다, **Then** 앱 화면은 깨지지 않고 해당 블록에는 실패 상태가 표시된다.
2. **Given** Mermaid 렌더링에 실패한 블록이 있다, **When** 사용자가 실패 상태를 확인한다, **Then** 사용자는 원본 Mermaid 코드 또는 실패 이유를 확인할 수 있다.
3. **Given** 한 응답 안에 정상 Mermaid 블록과 오류 Mermaid 블록이 함께 있다, **When** 응답을 표시한다, **Then** 정상 블록은 다이어그램으로 표시되고 오류 블록만 실패 상태로 표시된다.

---

### User Story 3 - Streaming and large diagrams stay stable (Priority: P3)

Agent 응답이 streaming 중이거나 다이어그램이 매우 길고 넓은 경우에도 사용자는 agent-run 영역의 레이아웃이 깨지지 않는 상태로 출력을 계속 읽을 수 있다.

**Why this priority**: agent-run 출력은 응답 생성 중에 불완전한 Markdown과 Mermaid 내용을 자주 포함하므로, 렌더링 안정성과 레이아웃 보존이 실제 사용 흐름에 필수적이다.

**Independent Test**: Mermaid 코드 블록이 streaming 중에 점진적으로 완성되는 응답과 넓은 다이어그램이 포함된 응답을 표시하고, partial 상태와 완성 상태 모두에서 agent-run 레이아웃이 유지되며 다이어그램을 전체 화면 크기의 modal에서 확인할 수 있는지 확인한다.

**Acceptance Scenarios**:

1. **Given** agent 응답이 streaming 중이고 Mermaid 코드 블록이 아직 완성되지 않았다, **When** agent-run 출력 영역이 partial 내용을 표시한다, **Then** 사용자는 앱 오류나 레이아웃 붕괴 없이 진행 중인 내용을 계속 볼 수 있다.
2. **Given** streaming 중이던 Mermaid 코드 블록이 완성되었다, **When** 완성된 응답이 표시된다, **Then** 해당 블록은 안정적인 다이어그램 또는 블록 단위 fallback으로 전환된다.
3. **Given** agent-run 패널보다 넓거나 긴 Mermaid 다이어그램이 있다, **When** 사용자가 출력을 확인한다, **Then** 다이어그램은 주변 UI와 겹치지 않고 사용자가 내용을 탐색할 수 있는 contained overflow 상태로 표시된다.
4. **Given** 렌더링된 Mermaid 다이어그램이 있다, **When** 사용자가 확대 보기 동작을 실행한다, **Then** 다이어그램은 전체 화면 크기의 modal에서 viewport 크기에 맞춰 표시되고 사용자는 modal을 닫아 agent-run 출력으로 돌아갈 수 있다.

### Edge Cases

- Mermaid 언어 표기가 대소문자 또는 앞뒤 공백을 포함해도 Mermaid 코드 블록으로 감지되어야 한다.
- fenced code block의 언어가 `mermaid`가 아니면 기존 일반 코드 블록 표시 방식이 유지되어야 한다.
- 비어 있거나 공백만 포함한 Mermaid 코드 블록은 전체 화면 오류 없이 블록 단위의 빈 상태 또는 원본 코드 표시 상태를 제공해야 한다.
- streaming 중 닫히지 않은 fenced code block이나 불완전한 Mermaid 문법은 앱 오류를 발생시키지 않아야 한다.
- 같은 응답 안의 한 Mermaid 블록 렌더링 실패가 다른 코드 블록, 일반 Markdown, 후속 agent-run 출력 표시를 방해하지 않아야 한다.
- 긴 텍스트 라벨, 넓은 그래프, 세로로 긴 다이어그램은 agent-run 패널 밖으로 UI를 밀어내거나 다른 요소를 가리지 않아야 한다.
- 전체 화면 크기 modal에서 넓거나 긴 다이어그램이 화면보다 클 경우 modal 내부에서 탐색 가능해야 하며, modal 바깥 agent-run 레이아웃을 변경하지 않아야 한다.
- Mermaid 렌더링 실패 상태 또는 비어 있는 다이어그램에는 전체 화면 확대 동작이 불필요하게 노출되지 않아야 한다.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Agent-run 출력 영역 MUST render fenced code blocks whose language marker is `mermaid` as Mermaid diagrams.
- **FR-002**: Agent-run 출력 영역 MUST preserve existing rendering behavior for all non-Mermaid fenced code blocks.
- **FR-003**: Mermaid rendering MUST be scoped to agent-run output and MUST NOT change unrelated Markdown viewer behavior unless shared behavior is explicitly required by the implementation plan.
- **FR-004**: A Mermaid rendering failure MUST be isolated to the affected block and MUST NOT break the containing agent-run output, surrounding messages, or the application view.
- **FR-005**: Users MUST be able to inspect the original Mermaid source or an understandable error state when a Mermaid diagram cannot be rendered.
- **FR-006**: Streaming agent output MUST tolerate incomplete Mermaid code blocks without application errors or persistent broken UI states.
- **FR-007**: Once a streaming Mermaid code block becomes complete, the displayed block MUST settle into either a rendered diagram or a block-local fallback state.
- **FR-008**: Rendered Mermaid diagrams MUST remain contained within the agent-run output area and provide usable overflow handling for diagrams wider or taller than the visible panel.
- **FR-009**: Multiple Mermaid diagrams in a single agent-run output MUST render or fail independently.
- **FR-010**: Mermaid-rendered content MUST NOT enable unsafe behavior from untrusted agent output.
- **FR-011**: The feature MUST include representative verification for successful Mermaid rendering, failed Mermaid rendering, ordinary code block preservation, streaming partial content, and large diagram containment.
- **FR-012**: If equivalent Markdown rendering behavior is already shared or planned for reuse across app areas, reusable behavior MUST be separated at the appropriate shared boundary without making agent-run depend on another app.
- **FR-013**: Users MUST be able to open a rendered Mermaid diagram from agent-run output in a full-screen-sized modal.
- **FR-014**: The full-screen-sized Mermaid modal MUST fit the diagram viewing area to the current viewport and provide local navigation for diagram content larger than the viewport.
- **FR-015**: Users MUST be able to close the Mermaid modal and return to the same agent-run output context without losing scroll or output state.

### Key Entities

- **Agent Run Output**: The displayed agent response stream or completed response in the workbench; contains Markdown text, code blocks, and streaming state.
- **Markdown Code Block**: A fenced block with a language marker and source content; may remain ordinary code or become a Mermaid diagram candidate.
- **Mermaid Diagram Block**: A code block whose language marker identifies Mermaid content; has source text, render status, visual output, and fallback state.
- **Mermaid Expanded View**: A modal presentation of a rendered Mermaid diagram; preserves the source diagram identity, viewport-sized display area, close behavior, and local overflow/navigation state.
- **Render Fallback**: A block-local state shown when Mermaid content is empty, incomplete, invalid, or cannot be rendered; gives the user access to source or an understandable error state.

## Constitution Alignment *(mandatory)*

- **Monorepo boundary**: Primary scope is `apps/agentic-workbench`. Cross-app reuse must go through `packages/*` or an appropriate shared module; direct imports from another app are out of scope.
- **Frontend layering**: Agent-run screen behavior belongs under the existing frontend layers for workbench composition, pages, features, entities, and shared UI primitives as appropriate. Reusable components must not be coupled to a single screen unless the component is truly agent-run specific.
- **Backend boundary**: The core user experience is frontend display behavior. No new Tauri persistence or filesystem behavior is required for the feature as specified.
- **Shared core vs UI**: Shared pure Markdown or Mermaid detection/render-state behavior should be considered before shared UI. Shared UI is appropriate only if multiple workbench Markdown surfaces need the same interaction and visual contract.
- **Persistence and safety**: The feature displays existing agent output content and must preserve current session/output boundaries. Rendered diagram content must not introduce unsafe behavior from untrusted agent-generated Markdown.
- **Documentation and Storybook**: Reusable UI states for success, failure, streaming/incomplete content, and large diagrams should be represented in Storybook when a reusable component is introduced. Project documentation is optional unless planning introduces shared Markdown viewer architecture.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of valid `mermaid` fenced code blocks in the primary agent-run fixture are visible as diagrams without using an external viewer.
- **SC-002**: 100% of non-Mermaid code block fixture cases continue to display as ordinary code blocks after the feature is enabled.
- **SC-003**: 100% of malformed Mermaid fixture cases show a block-local fallback with source or readable error state while the rest of the agent-run output remains readable.
- **SC-004**: In at least one streaming verification scenario, incomplete Mermaid content remains stable during streaming and resolves to a rendered diagram or fallback after completion.
- **SC-005**: 100% of large diagram fixture cases remain contained within the agent-run panel without overlapping adjacent UI or forcing the panel layout to break.
- **SC-006**: Existing agent-run output verification for ordinary Markdown, code blocks, and message rendering passes with no regressions after the feature is added.
- **SC-007**: 100% of rendered Mermaid diagram fixture cases can be opened in a viewport-sized modal and closed back to the original agent-run output context.

## Assumptions

- The first release targets Mermaid code blocks identified by the fenced code block language marker `mermaid`; automatic detection from unlabelled code block content is out of scope unless existing shared Markdown behavior already supports it.
- The feature is for viewing diagrams in agent-run output, not editing Mermaid source or validating diagrams before an agent emits them.
- Block-local fallback may show the original source, an error label, or both, as long as the user can understand that rendering failed and inspect the source or error state.
- Contained overflow may use scrolling or equivalent navigation; fitting every diagram fully into the visible panel without scrolling is not required. The expanded modal should prioritize using the available viewport while still allowing local navigation when a diagram remains larger than the modal viewport.
- Security expectations follow the existing treatment of untrusted agent-generated Markdown and must not be weakened by diagram rendering.
