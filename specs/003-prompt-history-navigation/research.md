# 조사: 프롬프트 히스토리 탐색

## 결정 1: 히스토리는 현재 AgentRunPanel instance 범위의 메모리 상태로 유지한다

**결정**: prompt history는 앱 재시작 후 복원하지 않고, 현재 화면/runtime에서 사용자가 전송한 prompt만 보관한다.

**근거**: 기능 명세가 반복 입력 편의를 목표로 하며 영속 저장은 범위 밖으로 명시되어 있다. 저장소, backend, settings schema를 건드리지 않으면 구현 범위와 회귀 위험이 낮다.

**검토한 대안**:

- localStorage 저장: 앱 재시작 후 복원은 가능하지만 저장 scope, 개인정보 노출, 만료 정책 결정이 필요하다.
- backend settings 저장: Tauri persistence와 session owner scope를 설계해야 하므로 이번 기능에 비해 과하다.

## 결정 2: 히스토리 탐색 상태 전이는 순수 model 함수로 작성한다

**결정**: history 목록, 현재 draft, cursor를 입력받아 다음 prompt 값과 cursor를 반환하는 순수 함수를 `features/agent-run/model`에 둔다.

**근거**: 헌법상 순수 로직은 unit test를 우선해야 한다. React event handler에 탐색 규칙을 직접 넣으면 draft 보존과 경계 처리 테스트가 어려워진다.

**검토한 대안**:

- UI 컴포넌트 내부 state만으로 처리: 빠르지만 edge case 회귀를 잡기 어렵다.
- `components/ui/prompt-input.tsx`에 내장: 공통 UI primitive에 agent-run 전용 상태가 섞인다.

## 결정 3: prompt 전송 시점에 trim된 실제 전송 텍스트를 history에 추가한다

**결정**: 사용자가 start run, direct prompt, queued prompt, saved prompt 등으로 실제 전송한 텍스트를 history 항목으로 추가한다. 공백만 있는 입력은 기록하지 않는다.

**근거**: 명세는 "사용자가 전송한 prompt"를 history로 유지하도록 요구한다. 입력 중 draft나 queue 편집 중 임시 텍스트를 기록하면 사용자가 실제 수행하지 않은 작업까지 탐색에 나타난다.

**검토한 대안**:

- 키 입력마다 draft를 history에 저장: 탐색 목록이 노이즈로 오염된다.
- run 시작 prompt만 저장: running session에 보낸 follow-up prompt 재사용 요구를 놓친다.

## 결정 4: 여러 줄 입력에서는 cursor line boundary에서만 history 탐색한다

**결정**: `ArrowUp`은 커서가 첫 줄에 있을 때만 history 이전 항목으로 이동한다. `ArrowDown`은 커서가 마지막 줄에 있을 때만 더 최근 항목 또는 draft로 이동한다.

**근거**: textarea의 일반 편집 경험을 유지해야 하며, 명세가 중간 줄에서는 일반 커서 이동을 우선하도록 요구한다.

**검토한 대안**:

- 모든 `ArrowUp`/`ArrowDown`을 history 탐색으로 처리: 여러 줄 prompt 편집을 방해한다.
- `Ctrl+Arrow` 같은 별도 shortcut만 지원: 이슈의 핵심 요구인 화살표 탐색과 맞지 않는다.

## 결정 5: modifier key가 있는 화살표 입력은 기본 편집 동작을 우선한다

**결정**: meta/ctrl/alt/shift 중 하나라도 함께 눌린 화살표 입력은 history 탐색으로 처리하지 않는다.

**근거**: OS와 textarea의 단어/문단/선택 이동 shortcut과 충돌하지 않아야 한다. 명세의 가정과도 일치한다.

**검토한 대안**:

- modifier key와 무관하게 탐색: 텍스트 선택과 빠른 커서 이동을 방해한다.
- shift만 예외 처리: 플랫폼별 shortcut 차이를 충분히 보호하지 못한다.
