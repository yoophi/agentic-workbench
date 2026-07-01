# Contract: Agent Run Mermaid Rendering

## Scope

이 contract는 Agentic Workbench의 agent-run output Markdown 렌더러가 Mermaid fenced code block을 표시하는 user-visible 동작을 정의한다. 외부 HTTP API, Tauri command, persistence contract는 없다.

## Input Contract

Agent-run renderer receives:

- `content`: agent-generated Markdown text
- `content` may be partial during streaming
- code blocks are parsed through the existing Markdown renderer component mapping

Mermaid candidate:

- The Markdown node is a fenced code block, not inline code.
- The language marker normalizes to `mermaid` after trimming and case normalization.
- If shared Mermaid detection helper is used, a first non-empty line matching a supported Mermaid declaration may also be treated as Mermaid.

Non-candidate:

- Inline code remains inline code.
- Fenced code blocks with non-Mermaid languages remain ordinary code blocks.
- Ordinary Markdown paragraphs, lists, links, tables, blockquotes, and images keep existing rendering behavior.

## Render Contract

For each Mermaid candidate block:

1. The renderer displays a diagram region in the same position where the code block would appear.
2. The diagram region is contained within the agent-run output/message area.
3. Wide or tall diagrams provide local overflow navigation and do not push adjacent timeline UI outside its layout.
4. Multiple Mermaid blocks in one output render independently.
5. Mermaid renderer loading is lazy or otherwise limited so non-Mermaid output does not pay unnecessary rendering cost.
6. Rendered diagrams expose an action to open the diagram in a full-screen-sized modal.

For ordinary code blocks:

1. Existing visual treatment and language display behavior are preserved.
2. No Mermaid fallback, loading, or diagram UI is shown.

## Streaming Contract

During streaming:

1. Unmatched fenced code blocks are tolerated without application errors.
2. Incomplete Mermaid source may show a loading or block-local fallback state.
3. Subsequent content updates may retry rendering with the latest source.
4. When the final content is valid Mermaid, the block settles into a rendered diagram.
5. When the final content is invalid Mermaid, the block settles into a fallback state.

## Fallback Contract

If Mermaid rendering fails:

1. Only the affected block displays fallback UI.
2. The fallback includes either the original Mermaid source, a readable error state, or both.
3. Empty source is distinguishable from syntax/parser failure and renderer/runtime failure when that information is available.
4. The rest of the agent-run output remains readable.
5. Later timeline items and user interactions remain available.

## Expanded View Contract

When a rendered Mermaid diagram is opened in expanded view:

1. The app displays a modal sized to the current viewport.
2. The diagram viewing area fits within the modal and uses the available full-screen space.
3. If the diagram is still wider or taller than the modal viewing area, overflow is local to the modal.
4. Closing the modal returns the user to the same agent-run output context.
5. Expanded view is available only for successfully rendered Mermaid diagrams, not empty or failed fallback states.

## Safety Contract

1. Mermaid-rendered output must use strict/safe rendering defaults.
2. Agent-generated Mermaid source must not enable arbitrary script execution.
3. Fallback source display must escape source text as text, not inject it as HTML.
4. The implementation must not introduce app-to-app imports or Tauri/backend dependencies into shared renderer code.

## Verification Contract

The implementation is complete only when the following cases are covered by automated tests, Storybook/manual visual validation, or both:

- valid `mermaid` fenced block renders as a diagram
- malformed Mermaid block shows block-local fallback
- non-Mermaid code block remains ordinary code
- streaming unmatched fence does not break the output renderer
- completed streaming Mermaid source re-renders from latest content
- large/wide diagram remains contained in the agent-run panel
- rendered Mermaid diagram opens in a viewport-sized modal and closes back to agent-run output
