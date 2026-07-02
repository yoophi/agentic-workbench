# Quickstart: ACP Agent 실행 명령 Override 검증

## 전제 조건

- repository root에서 실행한다.
- `apps/agentic-workbench` 의존성이 설치되어 있어야 한다.
- 테스트용 worktree 또는 project가 하나 이상 있어야 한다.

## 정적 검증

```bash
pnpm --filter @yoophi/agentic-workbench check-types
pnpm --filter @yoophi/agentic-workbench test
cargo test -p agentic-workbench
```

예상 결과:

- TypeScript type check가 통과한다.
- 설정 UI/helper 테스트가 통과한다.
- Rust 설정 저장/로드/정규화/명령 우선순위 테스트가 통과한다.

## Storybook 검증

reusable override editor component가 추가된 경우:

```bash
pnpm --filter @yoophi/agentic-workbench storybook
```

예상 결과:

- Empty/default 상태가 기본 명령 출처를 표시한다.
- Global override 상태가 agent별 fallback으로 표시된다.
- Agent override 상태가 global override보다 우선 표시된다.
- Save error와 long command 상태에서 텍스트가 겹치거나 잘리지 않는다.

## 앱 수동 검증

```bash
pnpm --filter @yoophi/agentic-workbench tauri:dev
```

### 시나리오 1: 전역 override 저장과 재시작 유지

1. 설정 페이지를 연다.
2. 전역 ACP agent command override에 테스트 명령을 입력한다.
3. 저장 완료 상태를 확인한다.
4. 앱을 종료한 뒤 다시 실행한다.
5. 설정 페이지를 다시 연다.

예상 결과:

- 입력한 전역 override가 동일하게 표시된다.
- agent별 override가 없는 agent의 적용 출처가 global override로 표시된다.

### 시나리오 2: agent별 override 우선순위

1. 전역 override를 저장한다.
2. Codex 또는 Claude Code agent별 override를 별도로 저장한다.
3. 해당 agent의 적용 출처를 확인한다.
4. agent별 override를 초기화한다.

예상 결과:

- agent별 override가 있을 때는 agent override가 적용 출처로 표시된다.
- agent별 override를 초기화하면 전역 override가 적용 출처로 표시된다.
- 전역 override도 초기화하면 기본 명령이 적용 출처로 표시된다.

### 시나리오 3: 실행 요청 반영

1. 특정 agent별 override에 실행 가능한 테스트 ACP 명령을 저장한다.
2. worktree session 화면에서 같은 agent로 run을 시작한다.
3. run 시작 lifecycle 또는 저장된 session record의 agent command를 확인한다.

예상 결과:

- 실행 명령이 저장된 agent별 override와 일치한다.
- override를 제거하고 같은 agent로 다시 실행하면 기존 기본 명령이 사용된다.

### 시나리오 4: 잘못된 명령어 실패 표시

1. agent별 override에 존재하지 않는 명령을 저장한다.
2. 해당 agent로 run을 시작한다.
3. 오류 표시를 확인한다.

예상 결과:

- 실행 실패가 사용자에게 명확히 표시된다.
- 실패 메시지를 통해 command 설정을 수정해야 함을 이해할 수 있다.
- 기존 세션 목록, worktree 정보, 다른 설정값은 변경되지 않는다.

## 문서 검증

- `docs/acp-agent-command-override.md`가 생성되면 전역 override, agent별 override, 기본 명령의 우선순위를 한국어로 설명해야 한다.
- 문서에는 실행 실패 시 사용자가 설정을 수정하는 흐름이 포함되어야 한다.

## 검증 기록

- 2026-07-02: `pnpm --filter @yoophi/agentic-workbench check-types` 통과.
- 2026-07-02: `pnpm --filter @yoophi/agentic-workbench test` 통과. 12 files, 57 tests passed.
- 2026-07-02: `cargo test -p agentic-workbench` 통과. 119 tests passed. 기존 dead code warning 2건은 goal usage 관련 기존 코드에서 발생했다.
- 2026-07-02: `apps/agentic-workbench/src` import 검사 완료. 새 cross-app import 또는 shared package 변경 없음.
- 2026-07-02: GUI 수동 시나리오는 이 세션에서 실행하지 못했다. 정적 검증과 단위 테스트만 완료했다.
