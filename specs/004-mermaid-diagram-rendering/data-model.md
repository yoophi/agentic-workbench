# Data Model: Mermaid Diagram Rendering

## MarkdownBlock

기존 Markdown parser가 반환하는 문서 block이다.

**Fields**:
- `id`: viewer와 annotation anchor가 참조하는 block identifier
- `type`: 기존 block type. Mermaid block도 `code`를 유지한다.
- `content`: fenced code 내부 source
- `rawContent`: fence line을 포함한 원본 Markdown
- `language`: fenced code language marker
- `startLine`, `endLine`: 원본 문서 line range
- `mermaid`: optional Mermaid metadata

**Validation rules**:
- `type !== "code"`이면 `mermaid` metadata를 갖지 않는다.
- `type === "code"`이고 language marker가 `mermaid`로 정규화되면 Mermaid block이다.
- language marker가 없거나 Mermaid가 아니어도 첫 유효 content line이 priority start token list의 token이면 Mermaid block이다.

## MermaidBlockMetadata

Mermaid로 감지된 code block의 normalized metadata다.

**Fields**:
- `detected`: `true`
- `reason`: `language-marker` 또는 `leading-declaration`
- `declaration`: priority start token list에서 감지된 Mermaid 시작 token
- `source`: Mermaid renderer에 전달할 source text

**Validation rules**:
- `source`는 block `content`와 동일한 user-authored source를 보존한다.
- `declaration`은 첫 유효 content line 또는 language marker에서 파생된다. 시작 token 판정은 feature contract의 priority start token list를 따른다.
- 빈 source는 render 시도 대신 block-local fallback 대상이다.

## MermaidRenderState

viewer에서 각 Mermaid block의 rendering lifecycle을 표현한다.

**States**:
- `idle`: 아직 render가 시작되지 않음
- `loading`: renderer dependency load 또는 render 진행 중
- `rendered`: diagram output이 준비됨
- `failed`: source 또는 renderer 오류로 fallback 표시 필요

**Fields**:
- `blockId`: 대상 Markdown block id
- `sourceHash`: reload 또는 source 변경 감지를 위한 source identity
- `svg`: rendered 상태에서 표시할 diagram markup
- `failureReason`: failed 상태에서 사용자에게 보여줄 실패 이유
- `failureCategory`: 가능한 경우 `empty-source`, `syntax-or-parse-error`, `renderer-runtime-error` 중 하나

**Transitions**:
- `idle -> loading`: Mermaid block이 viewport/render tree에 들어와 render 준비가 시작됨
- `loading -> rendered`: source가 정상 rendering됨
- `loading -> failed`: parser/rendering 오류가 발생함
- `rendered|failed -> loading`: auto reload 또는 source 변경으로 `sourceHash`가 바뀜

## MermaidFallback

오류 또는 빈 diagram source를 사용자에게 보여주는 block-local fallback 표현이다.

**Fields**:
- `title`: 실패 요약
- `message`: 사용자가 이해할 수 있는 실패 이유
- `category`: 가능한 경우 실패 유형
- `source`: 원본 Mermaid code
- `canInspectSource`: 항상 true

**Validation rules**:
- fallback은 affected block 안에서만 표시된다.
- fallback source는 Markdown 전체가 아니라 해당 fenced code block content만 표시한다.
- fallback은 renderer가 제공한 세부 오류가 없더라도 일반적인 실패 이유를 표시해야 한다.
- fallback 표시 중에도 주변 Markdown block과 annotation UI는 렌더링되어야 한다.
