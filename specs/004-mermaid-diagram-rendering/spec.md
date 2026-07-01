# Feature Specification: Mermaid Diagram Rendering

**Feature Branch**: `108-mermaid-chart-rendering`

**Created**: 2026-07-01

**Status**: Draft

**Input**: User description: "markdown annotator에서 Mermaid 코드 블록을 다이어그램으로 렌더링한다. fenced code block의 mermaid 언어 표기와 Mermaid chart 시작 문자열을 감지한다. 실패 시 원본 코드와 렌더링 실패 이유를 확인할 수 있어야 하며, 일반 코드 블록 렌더링과 Markdown 주석/선택 기능 및 자동 reload를 깨뜨리지 않아야 한다."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mermaid blocks render as diagrams (Priority: P1)

Markdown 문서를 검토하는 사용자는 Mermaid로 작성된 흐름도, 상태도, 구조도를 문서 안에서 바로 시각적으로 확인할 수 있다.

**Why this priority**: 핵심 가치가 별도 도구 이동 없이 문서 검토 흐름을 유지하는 것이므로, Mermaid 블록의 기본 렌더링이 가장 먼저 동작해야 한다.

**Independent Test**: Mermaid 언어가 지정된 fenced code block을 포함한 문서를 열고, 해당 블록이 원본 코드 대신 다이어그램으로 표시되는지 확인한다.

**Acceptance Scenarios**:

1. **Given** Mermaid 언어가 지정된 fenced code block이 있는 Markdown 문서, **When** 사용자가 markdown annotator에서 문서를 연다, **Then** 해당 블록은 다이어그램으로 표시된다.
2. **Given** 같은 문서에 Mermaid 블록과 일반 코드 블록이 함께 있다, **When** 사용자가 문서를 본다, **Then** Mermaid 블록만 다이어그램으로 표시되고 일반 코드 블록은 기존 코드 표시 방식으로 유지된다.
3. **Given** fenced code block의 언어가 명시되지 않았지만 첫 유효 내용이 우선 지원 Mermaid 시작 토큰 중 하나로 시작한다, **When** 사용자가 문서를 연다, **Then** 해당 블록은 Mermaid 다이어그램 후보로 감지되어 다이어그램으로 표시된다.

---

### User Story 2 - Failed Mermaid rendering remains inspectable (Priority: P2)

Mermaid 문법 오류가 있는 문서를 검토하는 사용자는 화면 전체가 깨지지 않은 상태에서 문제가 된 원본 코드와 렌더링 실패 이유를 확인할 수 있다.

**Why this priority**: 프로젝트 문서와 노트에는 작성 중인 다이어그램이 포함될 수 있으므로, 실패 상태에서도 문서 검토와 수정 판단이 가능해야 한다.

**Independent Test**: 잘못된 Mermaid 문법을 포함한 문서를 열고, fallback 영역에서 원본 코드와 실패 이유가 확인되는지 검증한다.

**Acceptance Scenarios**:

1. **Given** Mermaid 문법 오류가 있는 fenced code block, **When** 사용자가 문서를 연다, **Then** 해당 블록 위치에는 실패 fallback이 표시된다.
2. **Given** Mermaid 렌더링이 실패한 블록, **When** 사용자가 실패 영역을 확인한다, **Then** 원본 Mermaid 코드와 사람이 읽을 수 있는 실패 이유를 볼 수 있다.
3. **Given** 한 문서에 정상 Mermaid 블록과 오류 Mermaid 블록이 함께 있다, **When** 문서를 렌더링한다, **Then** 정상 블록은 다이어그램으로 표시되고 오류 블록만 fallback으로 표시된다.

---

### User Story 3 - Annotation and reload workflows remain intact (Priority: P3)

Markdown 문서에 주석을 달거나 선택 기반 프롬프트 작업을 하는 사용자는 Mermaid 다이어그램이 포함된 문서에서도 기존 주석, 선택, 자동 갱신 흐름을 계속 사용할 수 있다.

**Why this priority**: Mermaid 렌더링은 문서 검토 경험을 개선하는 기능이며, 기존 annotator의 핵심 작업인 주석과 선택 기능을 방해해서는 안 된다.

**Independent Test**: Mermaid 다이어그램이 포함된 문서에서 텍스트 선택, 주석 작성, 문서 변경 후 자동 reload를 각각 수행하고 기존 동작과 다이어그램 갱신을 확인한다.

**Acceptance Scenarios**:

1. **Given** Mermaid 다이어그램 주변에 일반 Markdown 문단이 있는 문서, **When** 사용자가 문단 텍스트를 선택하고 주석을 작성한다, **Then** 기존 선택 및 주석 작업이 정상 완료된다.
2. **Given** 열려 있는 문서의 Mermaid 코드가 외부에서 변경된다, **When** markdown annotator가 자동 reload를 수행한다, **Then** 다이어그램은 최신 Mermaid 내용으로 갱신된다.
3. **Given** 큰 Mermaid 다이어그램이 포함된 문서, **When** 사용자가 문서를 검토한다, **Then** 다이어그램은 주변 문서 내용을 가리지 않고 사용자가 전체 내용을 확인할 수 있는 방식으로 표시된다.

### Edge Cases

- Mermaid 언어 표기가 대소문자 또는 앞뒤 공백을 포함해도 Mermaid 블록으로 감지되어야 한다.
- fenced code block의 언어가 Mermaid가 아니고 Mermaid 시작 문자열도 없으면 기존 일반 코드 블록으로 표시되어야 한다.
- Mermaid 시작 문자열이 일반 문장이나 코드의 일부로 나타나지만 블록 첫 유효 내용이 아니면 Mermaid로 오인하지 않아야 한다.
- Mermaid 블록이 비어 있거나 공백만 있으면 전체 화면 오류 없이 빈 다이어그램 fallback 또는 원본 코드 표시 상태가 제공되어야 한다.
- 매우 긴 다이어그램 또는 넓은 다이어그램은 문서 레이아웃을 깨뜨리지 않고 사용자가 내용을 탐색할 수 있어야 한다.
- 자동 reload 중 이전 렌더링 결과가 남아 잘못된 다이어그램을 보여주지 않아야 한다.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: markdown annotator MUST render fenced code blocks whose language marker is `mermaid` as diagrams.
- **FR-002**: markdown annotator MUST detect Mermaid diagrams when a fenced code block starts with a recognized Mermaid chart declaration from the priority start token list, even when the language marker is absent.
- **FR-002a**: The priority start token list MUST include `graph`, `flowchart`, `sequenceDiagram`, `classDiagram`, `stateDiagram`, `stateDiagram-v2`, `erDiagram`, `journey`, `gantt`, `pie`, `quadrantChart`, `requirementDiagram`, `gitGraph`, `mindmap`, `timeline`, `zenuml`, `sankey-beta`, `xychart-beta`, `block-beta`, `packet-beta`, `kanban`, `architecture-beta`, `radar-beta`, `eventModel`, `treemap-beta`, `venn`, `ishikawa`, `wardley`, `tree`, and `info`.
- **FR-003**: markdown annotator MUST preserve existing rendering behavior for non-Mermaid code blocks.
- **FR-004**: Users MUST be able to inspect the original Mermaid source when a diagram fails to render.
- **FR-005**: Users MUST be able to inspect a readable rendering failure reason when a Mermaid diagram fails to render.
- **FR-005a**: The failure reason MUST distinguish at least empty source, Mermaid syntax/parsing failure, and renderer/runtime failure when that information is available.
- **FR-006**: A Mermaid rendering failure MUST be isolated to the affected block and MUST NOT break the rest of the Markdown document view.
- **FR-007**: Markdown annotation, text selection, and prompt-related interactions MUST continue to work in documents that contain Mermaid diagrams.
- **FR-008**: When a loaded Markdown document changes and automatic reload refreshes the document, Mermaid diagrams MUST reflect the latest document contents.
- **FR-009**: Rendered diagrams MUST remain contained within the document reading area and provide a usable way to inspect diagrams wider or taller than the visible area.
- **FR-010**: Rendered diagram content MUST NOT introduce executable or unsafe document behavior from untrusted Markdown content.
- **FR-011**: The feature MUST include representative verification for successful Mermaid rendering, failed Mermaid rendering, non-Mermaid code blocks, and reload-driven updates.
- **FR-012**: If the same Markdown viewing behavior is duplicated across markdown annotator and agentic workbench, the feature scope MUST explicitly decide whether to keep the behavior app-local for this release or extract shared non-UI behavior before implementation.

### Key Entities

- **Markdown Document**: The currently loaded document being reviewed and annotated; contains Markdown blocks and reload state.
- **Code Block**: A fenced block with optional language marker and raw text content; may be rendered as ordinary code or detected as a Mermaid diagram.
- **Mermaid Diagram Block**: A code block recognized as Mermaid by language marker or starting declaration; has source text, render status, and visual output or fallback state.
- **Render Error**: A user-visible failure state associated with a Mermaid diagram block; includes a readable failure reason, failure category when available, and access to the original source.

## Constitution Alignment *(mandatory)*

- **Monorepo boundary**: Primary scope is `apps/markdown-annotator`. If reusable Mermaid detection or Markdown rendering logic is needed by both markdown annotator and agentic workbench, shared pure logic belongs under `packages/*`; direct imports between apps are out of scope.
- **Frontend layering**: UI changes belong in the markdown annotator frontend under its existing app/page/shared/component boundaries. Reusable rendering helpers, if introduced, should be separated from screen-specific UI.
- **Backend boundary**: No Tauri backend behavior is required for the core user experience. Existing file reading and auto reload boundaries remain unchanged.
- **Shared core vs UI**: Shared pure detection, parsing, or rendering-state helpers should be considered before shared UI. Shared UI is only appropriate if both apps require the same interaction and visual contract.
- **Persistence and safety**: The feature reads existing Markdown document content only. It must preserve current file safety behavior and prevent rendered diagram content from adding unsafe document behavior.
- **Documentation and Storybook**: Add or update a representative rendering test or Storybook state covering success, fallback, and large diagram display. Project documentation is not required unless planning identifies shared Markdown viewer behavior that needs architectural documentation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of valid Mermaid fenced blocks in the primary acceptance fixture are visible as diagrams in the document view without using another tool.
- **SC-002**: At least 95% of supported Mermaid blocks in a representative fixture set render or show a block-local fallback without disrupting the rest of the document.
- **SC-003**: 100% of malformed Mermaid blocks in the error fixture display source and a readable failure reason within the affected block while the remaining document remains readable.
- **SC-004**: After a document file changes, the visible Mermaid diagram updates to match the latest content on the next automatic reload cycle in at least one reload verification scenario.
- **SC-005**: Existing non-Mermaid code block, text selection, and annotation workflows pass their current verification with no regressions after the feature is added.

## Assumptions

- The first release targets markdown annotator as requested; agentic workbench support is considered only when shared Markdown viewer behavior is already coupled or duplicated enough to justify shared logic.
- Mermaid detection by starting string applies only inside fenced code blocks, not arbitrary Markdown paragraphs.
- Recognized starting declarations use the priority start token list supplied for this feature; additional Mermaid types can be added later without changing the user-facing contract.
- Large diagrams may use scrolling or similar contained navigation; full interactive editing of diagrams is out of scope.
- Users need readable failure reasons for troubleshooting, but they do not need the app to repair invalid Mermaid syntax.
