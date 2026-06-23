# PR #7 Review TODO

## 개요

현재 PR은 worktree session을 현재 창, 별도 Tauri window, macOS native tab으로 열 수 있게 하고, ACP agent 실행 흐름에 permission mode와 permission 응답 UI를 연결한다.

핵심 변경 범위는 다음과 같다.

- worktree 목록의 실행 버튼을 dropdown으로 바꿔 `새 창`, `새 탭`, `현재 창` 진입 경로를 제공한다.
- standalone session route를 추가해 새 window/tab에서 navigation shell 없이 작업 화면만 표시한다.
- Tauri backend에 deterministic session window label과 window/tab 생성 adapter를 추가한다.
- agent run event를 target window label로 emit해 session window 간 이벤트 섞임을 줄인다.
- run request에 permission mode를 추가하고 ACP `session/request_permission`을 dialog 응답으로 왕복시킨다.
- GUI 실행 환경에서도 agent/terminal command가 login shell PATH를 반영하도록 command resolution을 보강한다.
- Tauri bundle/icon 설정을 추가하고 debug DevTools 자동 open을 opt-in으로 바꾼다.

## 리뷰 결과

현재까지 확인한 범위에서 merge를 막을 만한 기능 결함은 발견하지 못했다.

잘 된 점:

- window routing 책임이 backend event sink와 window manager 쪽에 있어 frontend 상태 필터만으로 multi-window isolation을 떠안지 않는다.
- session route는 `worktreePath`를 query string으로 넘겨 `/`, 공백, 한글, `#`, `%` 같은 path 문자를 안정적으로 다룬다.
- permission 응답은 run id와 owner window를 함께 확인해 다른 run/window의 waiter를 잘못 해제하지 않도록 좁혀져 있다.
- `dangerouslySkipAllPermissions`는 확인 dialog를 거치도록 되어 있어 실수로 높은 권한 mode를 선택하는 위험이 줄었다.
- smoke 검증용 ACP agent가 opt-in catalog로 추가되어 실제 permission dialog round-trip을 재현할 수 있다.

주의할 점:

- `ACP_AGENT_CATALOG_PATH` smoke catalog는 root `pnpm run tauri:dev`의 Turborepo 경유 실행에서는 Rust 앱까지 전달되지 않았다. smoke 검증 시에는 `apps/desktop`에서 직접 `ACP_AGENT_CATALOG_PATH=... pnpm tauri dev`로 실행해야 했다.
- smoke catalog command는 repo root worktree에서 실행하는 검증용이다. 다른 worktree에서 해당 catalog를 쓰면 상대 경로 때문에 script를 찾지 못할 수 있다.
- packaged 앱을 Finder/Launchpad에서 실행했을 때 login shell PATH 보강이 실제 `codex`, `node`, `npx` resolution까지 해결하는지는 아직 별도 수동 검증이 필요하다.

## 완료한 검증

- `pnpm run check-types` 통과.
- `pnpm run test` 통과.
- `pnpm run build` 통과.
- `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml` 통과.
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml -- --nocapture` 통과.
- `node --check apps/desktop/scripts/acp-permission-smoke-agent.mjs` 통과.
- permission smoke agent JSON-RPC harness 통과: `initialize`, `session/new`, `session/prompt`, `session/request_permission` 응답까지 완료.
- Tauri dev 앱을 native rebuild와 함께 재실행했다.
- `ACP_OPEN_DEVTOOLS` 미설정 dev 실행에서 DevTools가 자동으로 열리지 않는 것을 확인했다.
- worktree dropdown에 `새 창에서 열기`, `새 탭에서 열기`, `현재 창에서 열기`가 표시되는 것을 확인했다.
- `현재 창에서 열기`가 main window를 session 화면으로 전환하고 선택 worktree cwd를 표시하는 것을 확인했다.
- `새 창에서 열기`가 `ACP Worktree Session` window를 추가하고 session 화면을 표시하는 것을 확인했다.
- `/private/tmp/작업 tree/a#b%c` 임시 worktree를 새 window로 열어 cwd가 정확히 복원되는 것을 확인했다.
- `새 탭에서 열기`가 macOS native tab bar에 session tab을 추가하는 것을 확인했다.
- 같은 worktree를 다시 `새 창에서 열기`로 호출했을 때 session window count가 증가하지 않아 중복 window가 생성되지 않는 것을 확인했다.
- 실제 Codex ACP run에서 `pwd` tool call이 완료되고 usage bar가 갱신되는 것을 확인했다.
- 실제 Codex ACP run에서 `/tmp/acp-permission-roundtrip-test.txt` 생성 tool call이 완료되는 것을 확인했고, 검증 후 임시 파일은 제거했다.
- `Permission Smoke` catalog로 실제 Tauri 앱을 실행해 permission dialog 표시를 확인했다.
- 실제 permission dialog에서 `Allow once` 선택 시 dialog가 닫히고 agent message에 `optionId: "allow-once"` 응답이 전달되는 것을 확인했다.
- 실제 permission dialog에서 `Reject` 선택 시 dialog가 닫히고 agent message에 `optionId: "reject"` 응답이 전달되는 것을 확인했다.

## 남은 작업

- packaged 앱을 만든 뒤 Finder/Launchpad에서 실행해 login shell PATH 기반 command resolution을 확인한다.
- 서로 다른 두 session window에서 agent run을 동시에 시작해 event, usage, permission dialog, cancel 상태가 서로 섞이지 않는지 최종 수동 검증한다.
- 같은 worktree re-open 시 중복 window가 생기지 않는 것은 확인했지만, 기존 session window가 foreground focus까지 받는지는 눈으로 한 번 더 확인한다.
- 완료된 run의 permission waiter 정리는 allow/reject E2E로 확인했다. 취소된 run의 waiter 정리는 unit test 범위 외 실제 UI smoke가 아직 남아 있다.

## 재검증 명령

```bash
pnpm run check-types
pnpm run test
pnpm run build
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml -- --nocapture
node --check apps/desktop/scripts/acp-permission-smoke-agent.mjs
```

Permission smoke catalog로 앱을 실행할 때:

```bash
cd apps/desktop
ACP_AGENT_CATALOG_PATH=/Users/yoophi/project/acp-minimal-app/apps/desktop/scripts/acp-smoke-agents.json pnpm tauri dev
```

## 참고 파일

- `apps/desktop/src-tauri/src/infrastructure/window_manager.rs`
- `apps/desktop/src-tauri/src/infrastructure/acp/runner.rs`
- `apps/desktop/src-tauri/src/infrastructure/acp/permission_flow.rs`
- `apps/desktop/src-tauri/src/infrastructure/permission_broker.rs`
- `apps/desktop/src-tauri/src/infrastructure/tauri_run_event_sink.rs`
- `apps/desktop/src-tauri/src/infrastructure/acp/util.rs`
- `apps/desktop/src/app/App.tsx`
- `apps/desktop/src/app/model/session-route.ts`
- `apps/desktop/src/features/project-worktree/ui/project-worktree-card.tsx`
- `apps/desktop/src/features/agent-run/ui/agent-run-panel.tsx`
- `apps/desktop/scripts/acp-permission-smoke-agent.mjs`
