# Contract: Markdown Viewer Mermaid Rendering

## Scope

이 contract는 shared Markdown viewer가 Mermaid code block을 감지하고 렌더링하거나 fallback으로 표시하는 사용자-visible 동작을 정의한다. 외부 HTTP API는 없다.

## Input Contract

`MarkdownViewer`는 기존처럼 `blocks: MarkdownBlock[]`를 받는다.

Mermaid 후보 block:
- `block.type === "code"`
- `block.language`를 trim/lowercase한 값이 `mermaid`
- 또는 `block.content`의 첫 유효 line이 recognized Mermaid declaration으로 시작

Recognized declarations:
- `graph`
- `flowchart`
- `sequenceDiagram`
- `classDiagram`
- `stateDiagram`
- `stateDiagram-v2`
- `erDiagram`
- `journey`
- `gantt`
- `pie`
- `quadrantChart`
- `requirementDiagram`
- `gitGraph`
- `mindmap`
- `timeline`
- `zenuml`
- `sankey-beta`
- `xychart-beta`
- `block-beta`
- `packet-beta`
- `kanban`
- `architecture-beta`
- `radar-beta`
- `eventModel`
- `treemap-beta`
- `venn`
- `ishikawa`
- `wardley`
- `tree`
- `info`

## Render Contract

For each Mermaid candidate block:
1. Viewer displays the block inside the existing block shell so block actions and notes remain available.
2. Viewer renders the diagram from `block.content`.
3. Viewer uses a contained diagram region that does not expand outside the document reading area.
4. Viewer re-renders when the block id or source content changes.

For non-Mermaid code blocks:
1. Viewer keeps the existing ordinary code block rendering.
2. No Mermaid dependency load is required for documents with no Mermaid candidates.

## Fallback Contract

If rendering fails:
1. Only the affected block displays a fallback panel.
2. The fallback panel includes a readable failure reason.
3. The fallback panel includes the original Mermaid source.
4. The fallback panel distinguishes empty source, Mermaid syntax/parsing failure, and renderer/runtime failure when that information is available.
5. The rest of the Markdown document remains readable and interactive.

If the Mermaid source is empty:
1. Viewer does not render an empty diagram.
2. Viewer displays a block-local fallback or source panel explaining that the diagram source is empty.

## Safety Contract

1. Diagram rendering must not enable arbitrary script execution from Markdown content.
2. Diagram rendering must not enable unsafe HTML behavior beyond the renderer's strict safe default.
3. App-specific UI primitive adapters must not expose Tauri or app shell APIs to shared viewer rendering.

## Annotation Contract

1. `data-block-id`, `data-start-line`, and `data-end-line` remain on the block shell.
2. Block-level comment/delete controls remain available for Mermaid blocks.
3. Text selection and inline annotation for surrounding Markdown text continue to behave as before.
4. Fallback source text is selectable for inspection, but annotation semantics remain tied to the original Markdown block.
