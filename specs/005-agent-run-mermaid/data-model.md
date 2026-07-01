# Data Model: Agent Run Mermaid Rendering

## AgentRunOutput

Agent-run timeline에 표시되는 agent 응답 본문이다.

**Fields**:
- `itemId`: timeline item identity
- `body`: Markdown text emitted by the agent
- `streamingState`: output may be partial while the run is active, or complete after the event settles
- `renderBlocks`: Markdown parser가 해석하는 paragraph, list, code block, table 등 rendered units

**Validation rules**:
- `body`는 untrusted agent-generated text로 취급한다.
- partial body는 닫히지 않은 fenced code block을 포함할 수 있다.
- ordinary Markdown rendering은 Mermaid 여부와 관계없이 유지되어야 한다.

## MarkdownCodeBlock

Agent-run Markdown 안의 fenced code block이다.

**Fields**:
- `language`: fence language marker parsed from Markdown class name, if present
- `source`: fenced code block content
- `isInline`: inline code 여부
- `renderKind`: `ordinary-code` 또는 `mermaid-diagram`

**Validation rules**:
- inline code는 Mermaid diagram으로 렌더링하지 않는다.
- `language`가 trim/case normalization 후 `mermaid`이면 `renderKind`는 `mermaid-diagram`이다.
- shared Mermaid detection helper를 사용할 경우 first-line Mermaid declaration detection도 허용된다.
- `renderKind`가 `ordinary-code`이면 기존 code block display를 유지한다.

## MermaidDiagramBlock

Mermaid로 분기된 agent-run code block의 표시 모델이다.

**Fields**:
- `blockId`: render identity; timeline item, Markdown block order, source hash 등으로 안정적으로 구분된다
- `source`: Mermaid source text
- `status`: `loading`, `rendered`, `failed`
- `diagramOutput`: rendered 상태에서 표시되는 diagram output
- `fallback`: failed 상태에서 표시되는 source/error state
- `canOpenExpandedView`: rendered 상태에서 전체 화면 크기 modal을 열 수 있는지 여부

**Validation rules**:
- empty or whitespace-only source는 diagram render attempt 대신 failed/fallback 상태가 될 수 있다.
- `canOpenExpandedView`는 rendered 상태에서만 true가 될 수 있다.
- source 변경 시 previous rendered output을 stale 상태로 유지하지 않고 새 render lifecycle로 전환한다.
- multiple Mermaid blocks in one output must keep independent `blockId` values.

**State transitions**:
- `loading -> rendered`: Mermaid source가 정상 렌더링됨
- `loading -> failed`: syntax/parser/runtime failure 또는 empty source 발생
- `rendered -> loading`: streaming update나 source change로 source identity가 바뀜
- `failed -> loading`: incomplete source가 후속 streaming update로 변경됨

## MermaidExpandedView

렌더링된 Mermaid diagram을 전체 화면 크기의 modal에서 확인하는 표현이다.

**Fields**:
- `blockId`: 확대 대상 Mermaid diagram block id
- `source`: 확대 대상 Mermaid source text
- `isOpen`: modal open state
- `viewportSize`: 현재 화면 크기에 맞춘 modal viewing area
- `overflowMode`: diagram content가 viewport보다 클 때 내부 탐색 방식

**Validation rules**:
- rendered 상태의 Mermaid diagram만 expanded view를 열 수 있다.
- modal은 현재 viewport에 맞는 크기로 표시되어야 하며 agent-run panel layout을 변경하지 않는다.
- modal을 닫으면 사용자는 기존 agent-run 출력 context로 돌아간다.
- modal 내부 source/rendered content도 untrusted agent output safety constraints를 따른다.

## RenderFallback

Mermaid 렌더링 실패 시 해당 block 안에서 표시되는 회복 가능한 상태다.

**Fields**:
- `category`: `empty-source`, `syntax-or-parse-error`, or `renderer-runtime-error` when available
- `reason`: user-readable failure reason
- `source`: original Mermaid source
- `canInspectSource`: source inspection availability

**Validation rules**:
- fallback은 affected Mermaid block 안에만 표시된다.
- fallback source는 전체 agent output이 아니라 해당 code block source만 표시한다.
- fallback이 표시되어도 surrounding Markdown and later timeline items remain readable.
- fallback must not expose unsafe HTML/script behavior from untrusted source.

## AgentRunMarkdownRenderer

Agent-run body를 rendered React tree로 바꾸는 UI boundary다.

**Fields**:
- `content`: raw agent-run Markdown body
- `normalizedContent`: streaming-safe Markdown content after temporary fence normalization
- `components`: Markdown render component mapping
- `codeRenderer`: inline, ordinary block, Mermaid block branch selector

**Validation rules**:
- normalization must avoid parser-breaking unmatched fences during streaming.
- `codeRenderer` must preserve ordinary inline code and ordinary fenced code behavior.
- Mermaid branch must remain scoped to agent-run output and not alter unrelated Markdown viewers.
