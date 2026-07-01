# 기능 명세: 프롬프트 히스토리 탐색

**기능 브랜치**: `[087-prompt-history-navigation]`

**작성일**: 2026-07-01

**상태**: 초안

**입력**: GitHub Issue #87 - "Prompt history navigation with arrow keys"

## 사용자 시나리오 및 테스트 *(필수)*

### 사용자 스토리 1 - 이전 프롬프트 다시 불러오기 (우선순위: P1)

사용자는 agent run prompt 입력창에 focus가 있을 때 위쪽 화살표 키를 눌러 이전에 전송한 프롬프트를 다시 불러올 수 있다.

**우선순위 근거**: 반복 작업과 steering 흐름에서 과거 프롬프트를 재사용하는 것이 핵심 가치다.

**독립 테스트**: 여러 프롬프트를 전송한 뒤 입력창에서 `ArrowUp`을 눌러 직전 프롬프트가 입력창에 표시되는지 확인한다.

**인수 시나리오**:

1. **Given** 사용자가 이전에 프롬프트를 1개 이상 전송했음, **When** prompt 입력창에서 `ArrowUp`을 누름, **Then** 가장 최근 전송 프롬프트가 입력창에 표시된다.
2. **Given** 사용자가 이전 프롬프트를 불러왔음, **When** 입력창 내용을 수정함, **Then** 수정된 내용이 일반 prompt draft처럼 편집 가능하다.

---

### 사용자 스토리 2 - 히스토리 앞뒤 탐색 (우선순위: P1)

사용자는 위/아래 화살표 키로 과거 프롬프트와 더 최근 프롬프트 사이를 이동할 수 있다.

**우선순위 근거**: 단일 프롬프트 재사용뿐 아니라 여러 후보를 빠르게 훑어보는 흐름이 필요하다.

**독립 테스트**: 세 개 이상의 프롬프트를 전송한 뒤 `ArrowUp`과 `ArrowDown`으로 순서대로 이동되는지 확인한다.

**인수 시나리오**:

1. **Given** 프롬프트 히스토리에 A, B, C가 시간순으로 저장되어 있음, **When** 사용자가 `ArrowUp`을 반복해서 누름, **Then** C, B, A 순서로 입력창에 표시된다.
2. **Given** 사용자가 과거 프롬프트 B를 보고 있음, **When** `ArrowDown`을 누름, **Then** 더 최근 프롬프트 C가 입력창에 표시된다.

---

### 사용자 스토리 3 - 작성 중 draft 보존 (우선순위: P2)

사용자가 새 프롬프트를 작성하던 중 히스토리를 탐색하더라도, 가장 최근 위치로 돌아오면 작성 중이던 draft가 복원된다.

**우선순위 근거**: 히스토리 확인 때문에 작성 중인 내용을 잃으면 사용성이 크게 나빠진다.

**독립 테스트**: 새 draft를 입력한 뒤 히스토리 탐색 후 `ArrowDown`으로 최신 위치까지 돌아와 draft가 복원되는지 확인한다.

**인수 시나리오**:

1. **Given** 사용자가 입력창에 새 draft를 작성 중임, **When** `ArrowUp`으로 히스토리를 탐색함, **Then** 탐색 시작 전 draft가 보존된다.
2. **Given** 사용자가 히스토리 항목을 보고 있음, **When** 가장 최근 위치에서 `ArrowDown`을 누름, **Then** 탐색 시작 전 draft가 입력창에 복원된다.

---

### 사용자 스토리 4 - 여러 줄 입력과 충돌 방지 (우선순위: P2)

여러 줄 입력 중에는 일반 커서 이동이 우선되고, 커서가 첫 줄 또는 마지막 줄 경계에 있을 때만 히스토리 탐색이 동작한다.

**우선순위 근거**: prompt 입력창은 여러 줄 입력을 지원하므로 화살표 키의 기본 편집 경험을 해치면 안 된다.

**독립 테스트**: 여러 줄 prompt에서 중간 줄과 경계 줄에 커서를 두고 `ArrowUp`/`ArrowDown` 동작을 확인한다.

**인수 시나리오**:

1. **Given** 입력창에 여러 줄 텍스트가 있고 커서가 중간 줄에 있음, **When** `ArrowUp` 또는 `ArrowDown`을 누름, **Then** 히스토리 탐색 대신 일반 커서 이동이 유지된다.
2. **Given** 커서가 첫 줄에 있음, **When** `ArrowUp`을 누름, **Then** 이전 프롬프트 히스토리를 탐색한다.
3. **Given** 커서가 마지막 줄에 있음, **When** `ArrowDown`을 누름, **Then** 더 최근 히스토리 또는 보존된 draft로 이동한다.

### 예외 상황

- 히스토리가 비어 있으면 `ArrowUp`/`ArrowDown`은 입력 내용을 변경하지 않는다.
- 가장 오래된 히스토리에서 `ArrowUp`을 추가로 눌러도 같은 항목을 유지한다.
- 가장 최근 위치에서 `ArrowDown`을 누르면 draft를 복원하고, 추가 입력 변경은 없다.
- 공백만 있는 프롬프트는 히스토리 항목으로 저장하지 않는다.
- 같은 내용의 프롬프트가 여러 번 전송된 경우에도 전송 순서 기준으로 탐색한다.
- 히스토리 탐색 중 사용자가 내용을 직접 수정하면, 이후 탐색 동작은 현재 draft 보존 규칙을 일관되게 따른다.

## 요구사항 *(필수)*

### 기능 요구사항

- **FR-001**: 시스템은 사용자가 전송한 prompt 텍스트를 prompt history로 유지해야 한다.
- **FR-002**: 시스템은 prompt 입력창에 focus가 있을 때 `ArrowUp`으로 더 오래된 prompt history 항목을 불러와야 한다.
- **FR-003**: 시스템은 prompt 입력창에 focus가 있을 때 `ArrowDown`으로 더 최근 prompt history 항목을 불러와야 한다.
- **FR-004**: 사용자는 history에서 불러온 prompt를 입력창에서 자유롭게 수정할 수 있어야 한다.
- **FR-005**: 시스템은 history 탐색 시작 시점의 작성 중 draft를 보존해야 한다.
- **FR-006**: 시스템은 history의 가장 최근 위치에서 `ArrowDown`을 누르면 보존된 draft를 복원해야 한다.
- **FR-007**: 시스템은 여러 줄 입력에서 커서가 중간 줄에 있을 때 기본 커서 이동을 우선해야 한다.
- **FR-008**: 시스템은 여러 줄 입력에서 커서가 첫 줄에 있고 `ArrowUp`을 누른 경우에만 이전 history 탐색을 수행해야 한다.
- **FR-009**: 시스템은 여러 줄 입력에서 커서가 마지막 줄에 있고 `ArrowDown`을 누른 경우에만 다음 history 또는 draft 복원을 수행해야 한다.
- **FR-010**: 시스템은 비어 있거나 공백만 있는 prompt를 history에 추가하지 않아야 한다.

### 핵심 개체

- **Prompt History Entry**: 사용자가 전송한 prompt 텍스트와 전송 순서를 나타내는 항목.
- **Prompt Draft**: 사용자가 아직 전송하지 않은 현재 입력창 내용.
- **History Cursor**: 현재 사용자가 prompt history의 어느 위치를 보고 있는지 나타내는 탐색 상태.

## 헌법 정렬 *(필수)*

- **Monorepo boundary**: 범위는 `apps/agentic-workbench`에 한정한다. cross-app 공유는 필요하지 않다.
- **Frontend layering**: prompt 입력 동작은 `features/agent-run`의 사용자 상호작용으로 다룬다. 순수 상태 계산은 feature model에 둘 수 있다.
- **Backend boundary**: Tauri/Rust backend 변경은 필요하지 않다.
- **Shared core vs UI**: cross-app 공유 UI 또는 package 추출은 범위 밖이다.
- **Persistence and safety**: prompt history는 현재 화면/session의 입력 편의 기능으로 다룬다. 앱 재시작 후 영속 보존은 범위 밖이다.
- **Documentation and Storybook**: 순수 로직 단위 테스트를 우선한다. UI 상태가 분리 가능하면 Storybook interaction 또는 상태 사례를 추가할 수 있다.

## 성공 기준 *(필수)*

### 측정 가능한 결과

- **SC-001**: 사용자는 전송된 prompt가 3개 이상 있을 때 `ArrowUp`만으로 최근 prompt 3개를 역순으로 탐색할 수 있다.
- **SC-002**: 사용자는 history 탐색 후 `ArrowDown`으로 탐색 시작 전 draft를 100% 복원할 수 있다.
- **SC-003**: 여러 줄 prompt에서 중간 줄 커서 이동은 history 탐색으로 오작동하지 않는다.
- **SC-004**: prompt history 탐색 관련 핵심 상태 전이는 자동화 테스트로 검증된다.
- **SC-005**: 히스토리가 비어 있거나 경계 위치에 도달한 상태에서도 입력창 내용이 예기치 않게 삭제되지 않는다.

## 가정

- prompt history는 현재 app runtime 또는 현재 agent run panel instance 범위에서 유지한다.
- prompt history의 영속 저장은 이번 기능 범위에 포함하지 않는다.
- history에는 사용자가 실제 전송한 prompt만 포함하며, queue 편집 중인 임시 텍스트는 포함하지 않는다.
- 중복 prompt도 사용자가 여러 번 전송했다면 별도 history 항목으로 취급한다.
- keyboard shortcut 충돌 방지를 위해 modifier key가 함께 눌린 화살표 입력은 기본 동작을 우선한다.
