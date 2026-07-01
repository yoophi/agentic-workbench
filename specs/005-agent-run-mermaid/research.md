# Research: Agent Run Mermaid Rendering

## Decision: agent-run Markdown renderer에서 Mermaid branch를 추가한다

**Rationale**: 현재 agent-run 출력은 `apps/agentic-workbench/src/features/agent-run/ui/agent-run-panel.tsx`의 `StreamingMarkdown`에서 `ReactMarkdown`을 직접 사용한다. Worktree Markdown viewer와는 별도 경로이므로, agent-run 요구사항을 만족하려면 이 렌더러의 fenced code block 처리에 Mermaid 분기를 추가해야 한다.

**Alternatives considered**:
- `components/ui/markdown.tsx`를 전역 수정: agent-run이 해당 컴포넌트를 사용하지 않아 요구사항을 직접 만족하지 못한다.
- `MarkdownViewer` 전체를 agent-run에 도입: annotation block model과 agent timeline Markdown은 목적이 달라 범위가 커진다.

## Decision: existing shared Mermaid renderer를 우선 재사용한다

**Rationale**: `@yoophi/markdown-annotation-react`는 이미 `MermaidDiagram`을 export하고 있고, `apps/agentic-workbench/src/index.css`는 해당 패키지의 styles를 import하며 Tailwind source scan도 포함한다. 이 컴포넌트는 lazy Mermaid import, strict security 설정, empty source fallback, parser/runtime failure mapping, source hash 기반 render id를 이미 제공한다. 중복 renderer를 만들면 안전 설정과 fallback 동작이 갈라질 수 있다.

**Alternatives considered**:
- agent-run 전용 Mermaid 컴포넌트 작성: UI 문구와 class를 더 잘 맞출 수 있지만 renderer/safety/fallback 로직이 중복된다.
- Mermaid를 `agentic-workbench`에 직접 dependency로 추가: package boundary가 단순해 보이지만 기존 shared renderer와 중복되고 검증 표면이 늘어난다.

## Decision: Mermaid 감지는 language marker 중심으로 하고 existing core helper를 사용한다

**Rationale**: feature spec의 1차 범위는 fenced code block language marker가 `mermaid`인 경우다. 동시에 edge case는 대소문자와 공백 정규화를 요구한다. `@yoophi/markdown-annotation-core`의 `detectMermaidBlock`은 language marker 정규화와 Mermaid 시작 선언 감지를 이미 제공하므로, agent-run에서 직접 문자열 판정을 재작성하지 않고 이 pure helper를 재사용할 수 있다. 시작 선언 감지는 spec의 기본 범위를 넘지만 helper가 이미 지원하는 보수적 확장으로, 일반 code block은 첫 유효 줄 token 조건을 통과해야 하므로 오탐을 제한한다.

**Alternatives considered**:
- `className === "language-mermaid"`만 확인: 구현은 작지만 `Mermaid`, ` mermaid ` 같은 표기와 공유 동작이 갈라진다.
- 시작 선언 감지를 명시적으로 비활성화: spec의 assumption에는 맞지만 기존 shared helper를 일부러 우회해야 하고 향후 Markdown surfaces 간 동작 차이를 만든다.

## Decision: streaming normalization은 유지하되 incomplete Mermaid는 block-local fallback으로 격리한다

**Rationale**: 현재 `normalizeStreamingMarkdown`은 닫히지 않은 fence를 임시로 닫아 streaming 중에도 Markdown parser가 UI를 깨뜨리지 않도록 한다. Mermaid source가 아직 불완전한 동안 renderer가 실패할 수 있지만, shared `MermaidDiagram` fallback은 실패를 해당 블록으로 격리한다. 응답이 계속 갱신되면 source hash가 바뀌고 완성된 Mermaid는 재렌더링된다.

**Alternatives considered**:
- streaming 중 Mermaid 렌더링을 완료 전까지 완전히 지연: 깜빡임과 오류 상태를 줄일 수 있지만 completed 상태을 별도로 전달해야 해서 현재 `StreamingMarkdown` 계약을 키운다.
- partial source를 일반 code block으로 표시하다가 완성 후 diagram 전환: 안정적이지만 branch 상태 관리가 복잡하고 사용자가 streaming 중 Mermaid 후보임을 알기 어렵다.

## Decision: containment는 shared Mermaid styles와 agent-run wrapper 양쪽에서 검증한다

**Rationale**: shared Mermaid styles는 `max-w-full`, `max-h`, `overflow-auto`를 제공한다. Agent-run panel에는 자체 message/timeline layout이 있으므로, renderer를 감싸는 코드 block branch도 `min-w-0`와 overflow containment를 유지해야 한다. 검증은 큰 diagram fixture와 좁은 viewport Storybook/manual smoke로 확인한다.

**Alternatives considered**:
- SVG를 panel 너비에 맞춰 항상 축소: 넓은 diagram의 세부 내용을 읽기 어렵다.
- agent-run panel 전체를 horizontal scroll로 전환: 한 블록 때문에 전체 timeline layout이 흔들릴 수 있다.

## Decision: 전체 화면 크기 modal은 agent-run 렌더러 boundary에서 제공한다

**Rationale**: Expanded view는 agent-run 출력 안에서 사용자가 특정 다이어그램을 더 크게 보는 상호작용이다. `@yoophi/markdown-annotation-react`의 shared Mermaid renderer는 diagram rendering과 fallback safety를 담당하고, modal open/close와 agent-run context 복귀는 workbench agent-run UI의 책임으로 두는 것이 app shell 결합을 shared package로 밀어 넣지 않는다. Modal은 viewport-sized layout과 local overflow를 제공해야 하며, failed/empty fallback 상태에는 expanded action을 노출하지 않는다.

**Alternatives considered**:
- shared `MermaidDiagram` 안에 modal 기능 추가: 여러 소비자에게 일괄 제공할 수 있지만 app별 modal primitive, focus/close 정책, layout 요구가 달라 shared UI 결합이 커진다.
- agent-run 패널 안에서만 더 크게 확대: layout 안정성은 유지하기 어렵고 전체 화면 크기 modal 요구를 충족하지 못한다.

## Decision: verification은 agent-run focused tests와 package regression checks로 나눈다

**Rationale**: 구현이 agent-run에만 머물면 핵심 검증은 `@yoophi/agentic-workbench` 테스트와 Storybook이다. 기존 shared helper/renderer를 수정하는 경우에는 constitution에 따라 `@yoophi/markdown-annotation-core`, `@yoophi/markdown-annotation-react`, 그리고 소비 앱 검증을 추가해야 한다.

**Alternatives considered**:
- 전체 monorepo test만 실행: 충분하지만 느리고 실패 원인 분리가 어렵다.
- 수동 확인만 수행: streaming/fallback/ordinary code regression을 놓치기 쉽다.
