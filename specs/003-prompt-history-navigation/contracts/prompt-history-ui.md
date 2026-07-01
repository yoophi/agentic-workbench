# UI 계약: Prompt History Navigation

## 대상

`agent-run` prompt 입력창의 키보드 상호작용.

## 입력 조건

- prompt 입력창에 focus가 있다.
- 사용자가 `ArrowUp` 또는 `ArrowDown`을 누른다.
- `Ctrl`, `Meta`, `Alt`, `Shift` modifier가 함께 눌리지 않았다.

## 동작 계약

### ArrowUp

- 히스토리가 비어 있으면 입력값을 변경하지 않고 textarea 기본 동작을 유지한다.
- 단일 줄 입력 또는 커서가 첫 줄에 있는 여러 줄 입력에서만 history 탐색을 처리한다.
- 탐색 중이 아니면 현재 입력값을 draft로 보존하고 가장 최근 history 항목을 표시한다.
- 이미 history 항목을 보고 있으면 한 단계 더 오래된 history 항목을 표시한다.
- 가장 오래된 항목에서 추가 `ArrowUp`을 눌러도 가장 오래된 항목을 유지한다.

### ArrowDown

- 히스토리가 비어 있으면 입력값을 변경하지 않고 textarea 기본 동작을 유지한다.
- 단일 줄 입력 또는 커서가 마지막 줄에 있는 여러 줄 입력에서만 history 탐색을 처리한다.
- history 항목을 보고 있으면 한 단계 더 최근 history 항목을 표시한다.
- 가장 최근 history 항목에서 추가 `ArrowDown`을 누르면 보존된 draft를 복원한다.
- 탐색 중이 아닌 상태에서 `ArrowDown`을 누르면 입력값을 변경하지 않고 textarea 기본 동작을 유지한다.

### Draft 보존

- draft는 history 탐색을 처음 시작할 때 한 번 저장한다.
- 사용자가 history 항목을 불러온 뒤 내용을 수정할 수 있어야 한다.
- 수정 중 다시 history 탐색을 시작하면 현재 입력값을 새 draft로 취급한다.

### History 기록

- 실제 전송된 prompt만 history에 추가한다.
- 공백만 있는 prompt는 history에 추가하지 않는다.
- 같은 prompt가 여러 번 전송되면 전송 횟수만큼 별도 항목으로 탐색 가능해야 한다.

## 비목표

- 앱 재시작 후 prompt history 복원
- 전체 저장된 prompt 검색 UI
- history 목록 표시 또는 삭제 UI
- backend 저장소 또는 Tauri command 추가
