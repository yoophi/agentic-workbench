# Research: Mermaid Diagram Rendering

## Decision: Mermaid 감지는 shared core helper로 분리한다

**Rationale**: 현재 Markdown block parsing은 `packages/markdown-annotation-core`의 `parseMarkdownToBlocks`가 담당하고, markdown annotator와 agentic workbench가 같은 block model을 소비한다. Mermaid 여부를 app UI에서만 판정하면 두 앱의 viewer 동작이 갈라지고 fixture 검증도 어려워진다. 따라서 언어 표기와 시작 선언 감지는 core의 pure helper로 둔다.

**Alternatives considered**:
- 앱별 Markdown viewer에서 직접 판정: 빠르지만 공유 viewer 소비 앱 간 동작 차이가 생긴다.
- parser가 `type: "mermaid"`를 새로 반환: 의미는 명확하지만 기존 `code` block 계약과 annotation 로직에 더 큰 변경을 만든다.

## Decision: 시작 문자열 감지는 priority start token list를 기준으로 한다

**Rationale**: feature owner가 Mermaid chart 시작 예약어의 우선 목록을 제공했다. 이 목록에는 stable diagram type뿐 아니라 `sankey-beta`, `xychart-beta`, `architecture-beta` 같은 beta token과 `info` 같은 utility token도 포함된다. 구현과 테스트가 같은 목록을 공유해야 문서별 오탐/누락을 줄일 수 있다.

**Alternatives considered**:
- Mermaid 공식 stable diagram 일부만 감지: 구현 범위는 작지만 사용자가 제공한 노트/문서의 beta diagram을 놓칠 수 있다.
- Mermaid renderer에 먼저 parse를 시도해 모든 code block을 판정: 일반 code block에도 renderer 비용과 오류 noise를 만든다.

## Decision: block type은 `code`로 유지하고 Mermaid metadata를 추가한다

**Rationale**: Mermaid block도 fenced code block이며, 실패 fallback에서 원본 코드를 표시해야 한다. 기존 annotation anchor, raw content, line number 흐름을 유지하려면 `code` type을 유지하고 `language`, `content`, `rawContent` 위에 Mermaid detection result를 얹는 편이 안전하다.

**Alternatives considered**:
- `MarkdownBlockType`에 `mermaid` 추가: renderer 분기는 단순해지지만 기존 code block assumption과 annotation formatting 영향이 커진다.
- render 시마다 문자열을 재검사: model 변경은 줄지만 테스트와 app 간 일관성이 약해진다.

## Decision: official Mermaid renderer를 lazy-load하고 `startOnLoad: false`로 직접 render한다

**Rationale**: Mermaid 공식 문서는 app startup 또는 rendering 전에 `initialize()`로 설정하고, diagram description을 수정해 재렌더링할 수 있다고 설명한다. React viewer에서는 page-load 자동 스캔보다 block별 source 변경에 맞춘 직접 render가 자동 reload와 오류 격리에 적합하다. Mermaid는 bundle size가 작지 않으므로 Mermaid block이 있을 때만 동적으로 불러오는 방식이 Mermaid가 없는 일반 문서의 초기 경로를 보호한다.

**Alternatives considered**:
- 정적 import: 구현은 단순하지만 Mermaid가 없는 문서에도 renderer 비용을 지불한다.
- CDN script: desktop/offline 환경과 reproducible build에 부적합하다.
- server-side/static SVG 생성: Tauri backend와 별도 rendering pipeline이 필요해 scope가 커진다.

## Decision: Mermaid security level은 strict 계열을 기본으로 유지한다

**Rationale**: Mermaid 공식 config 문서는 `securityLevel` 기본값이 `strict`이며 HTML tags encoding과 click disabling을 제공한다고 설명한다. 이 feature의 요구는 문서 검토용 diagram 표시이지 diagram 내부 HTML/클릭 실행이 아니다. 따라서 unsafe behavior를 막기 위해 strict 기본을 유지하고, diagram-specific directive로 보안 설정을 완화하지 않도록 구현 단계에서 검토한다.

**Alternatives considered**:
- `loose`: HTML labels와 click 기능은 넓어지지만 untrusted Markdown에서 안전 요구와 충돌한다.
- `sandbox`: 보안 격리는 강하지만 iframe 기반 제약과 style/interaction 차이가 커질 수 있어 v1 기본값으로는 과하다.

## Decision: fallback은 block-local error panel로 표시한다

**Rationale**: spec은 문법 오류가 있어도 화면 전체가 깨지지 않고 원본 코드와 렌더링 실패 이유를 확인할 수 있어야 한다. block-local panel은 정상 diagram과 오류 diagram을 한 문서에서 독립적으로 표시할 수 있고, 기존 annotation block shell도 유지할 수 있다.

**Alternatives considered**:
- 일반 code block으로 조용히 fallback: 문서가 깨지지는 않지만 사용자가 Mermaid 오류를 알기 어렵다.
- toast/global error: 오류 위치와 원본 코드 확인 요구를 만족하기 어렵다.

## Decision: large diagram은 contained overflow와 optional zoom 후속 여지를 둔다

**Rationale**: v1 완료 기준은 주변 문서 레이아웃을 깨뜨리지 않고 diagram 전체를 확인하는 것이다. horizontal/vertical scroll containment가 가장 단순하고 검증 가능하다. zoom control은 후속 개선으로 열어두되 v1 필수로 두지 않는다.

**Alternatives considered**:
- viewport에 강제 scale-down: 전체는 보이나 작은 텍스트가 읽히지 않을 수 있다.
- full-screen viewer: 유용하지만 annotation selection과 document flow 영향이 커져 scope가 커진다.

## References

- Mermaid Usage documentation: Mermaid is a JavaScript tool for Markdown-based diagrams and diagrams can be re-rendered by modifying descriptions.
- Mermaid Configuration documentation: `initialize()` is the standard configuration method and should be called before rendering.
- Mermaid Config Schema: `securityLevel` default is `strict`; `startOnLoad` default is `true`.
