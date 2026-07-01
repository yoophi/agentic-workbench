# Quickstart: 프롬프트 히스토리 탐색 검증

## 전제 조건

- 의존성이 설치되어 있어야 한다.
- 검증 대상 app은 `@yoophi/agentic-workbench`다.

## 자동 검증

```bash
pnpm --filter @yoophi/agentic-workbench test
pnpm --filter @yoophi/agentic-workbench check-types
```

## 수동 검증 시나리오

### 1. 최근 프롬프트 불러오기

1. agent run prompt 입력창에서 서로 다른 prompt 3개를 전송한다.
2. 입력창을 비운 상태에서 `ArrowUp`을 누른다.
3. 가장 최근에 전송한 prompt가 표시되는지 확인한다.
4. `ArrowUp`을 반복해서 더 오래된 prompt가 역순으로 표시되는지 확인한다.

**예상 결과**: 최근 prompt부터 오래된 prompt 순서로 입력창에 표시된다.

### 2. 더 최근 프롬프트와 draft 복원

1. 입력창에 새 draft를 작성한다.
2. `ArrowUp`으로 history 탐색을 시작한다.
3. `ArrowDown`을 눌러 더 최근 항목으로 이동한다.
4. 가장 최근 항목 다음에서 `ArrowDown`을 다시 누른다.

**예상 결과**: 탐색 시작 전에 작성하던 draft가 그대로 복원된다.

### 3. 여러 줄 입력 경계 처리

1. 입력창에 여러 줄 prompt를 작성한다.
2. 커서를 중간 줄에 둔 뒤 `ArrowUp`과 `ArrowDown`을 누른다.
3. 커서를 첫 줄에 둔 뒤 `ArrowUp`을 누른다.
4. 커서를 마지막 줄에 둔 뒤 `ArrowDown`을 누른다.

**예상 결과**: 중간 줄에서는 일반 커서 이동이 유지되고, 첫 줄/마지막 줄 경계에서만 history 탐색이 동작한다.

### 4. modifier key 충돌 방지

1. 입력창에서 `Shift+ArrowUp`, `Option/Alt+ArrowUp`, `Ctrl+ArrowDown`, `Meta+ArrowDown`을 눌러 본다.

**예상 결과**: history 탐색으로 처리되지 않고 플랫폼/textarea 기본 편집 동작이 유지된다.

## 관련 산출물

- 데이터 모델: [data-model.md](./data-model.md)
- UI 계약: [contracts/prompt-history-ui.md](./contracts/prompt-history-ui.md)
