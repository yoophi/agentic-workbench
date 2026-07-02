# 구현 계획: ACP Agent 실행 명령 Override

**브랜치**: `[099-issue]` | **작성일**: 2026-07-02 | **명세**: [spec.md](./spec.md)

**입력**: `/specs/005-acp-command-override/spec.md`의 기능 명세

## 요약

`agentic-workbench`에 설정 화면을 추가하고, ACP agent 실행 명령 override를 전역 및 agent 종류별로 저장한다. 기존 `AgentRunSettings` 저장 흐름과 Tauri command를 확장해 설정을 영속화하고, agent 실행 요청 생성 시 우선순위에 따라 `agentCommand`를 채워 기존 runner의 명령 우선 적용 경로를 사용한다. 잘못된 명령으로 실행이 실패하면 기존 run event 오류 표시를 통해 사용자가 설정 수정 필요성을 알 수 있게 한다.

## 기술 컨텍스트

**Language/Version**: TypeScript 5.6, React 19, Rust 2024 edition, rustc 1.95.0, Node 22.22.0, pnpm 9.10.0

**Primary Dependencies**: Tauri 2, `@tauri-apps/api`, TanStack Query 5, Zustand 5, shadcn/ui local components, `serde`, `serde_json`, `tokio`, `shell-words`, `agent-client-protocol`

**Storage**: Tauri app data directory의 JSON 설정 파일. 기존 `agent-run-settings.json` 구조를 후방 호환 방식으로 확장한다.

**Testing**: Vitest 및 TypeScript `check-types` for frontend, Rust `cargo test` for Tauri backend, Storybook story for reusable/settings UI state if componentized.

**Target Platform**: Tauri desktop app for macOS/Windows/Linux with local ACP agent subprocess execution.

**Project Type**: Monorepo desktop app. 범위는 `apps/agentic-workbench`에 한정한다.

**Performance Goals**: 설정 화면 열기와 저장된 override 표시가 일반 설정 조회 수준으로 체감 지연 없이 완료되어야 한다. agent 실행 전 명령 해석은 run 시작 흐름에 눈에 띄는 지연을 추가하지 않아야 한다.

**Constraints**: 기존 override 미설정 실행 동작을 유지해야 한다. 저장 설정은 앱 재시작 후 유지되어야 한다. 실행 실패는 세션, worktree, permission, exchange 상태를 훼손하지 않아야 한다.

**Scale/Scope**: 단일 앱의 설정 화면 1개, 기존 agent 실행 패널 연동, 전역 override 1개와 등록된 agent 종류별 override 목록. project/worktree별 override는 범위 밖이다.

## 헌법 점검

*GATE: Phase 0 연구 전 통과 필요. Phase 1 설계 후 재점검.*

- **Monorepo Boundary First**: PASS. 모든 변경은 `apps/agentic-workbench`와 `specs/005-acp-command-override`에 한정한다. `packages/*`, `crates/*`, 다른 앱 변경은 계획하지 않는다.
- **Feature-Sliced Frontend Architecture**: PASS. 설정 라우팅/조합은 `apps/agentic-workbench/src/app`, 화면은 `pages/settings`, 저장/초기화 상호작용은 `features/agent-command-override`, 타입/API adapter는 `entities/agent-run`에 둔다.
- **Hexagonal Tauri Backend Architecture**: PASS. 설정 모델과 repository port는 `domain`, 저장/정규화/명령 해석 use case는 `application`, Tauri command는 `inbound`, JSON 저장소는 `infrastructure`가 맡는다.
- **Shared Core Before Shared UI**: PASS. cross-app 공유를 만들지 않는다. 순수 명령 해석 규칙은 앱 내부 domain/application 테스트로 검증한다.
- **Atomic Cross-App Verification**: N/A. `packages/*` 또는 `crates/*` 변경이 없다.
- **Documentation and Storybook**: PASS. 설정 화면/컨트롤이 reusable component로 분리되면 `src/stories/*`에 상태를 등록한다. 사용자 설정 우선순위와 실패 동작은 `docs/acp-agent-command-override.md`에 한국어로 문서화한다.
- **Testing and Safety**: PASS. 명령 우선순위와 설정 정규화는 Rust unit test, 프론트엔드 설정 form/해석 helper는 Vitest로 검증한다. 설정 저장은 앱 data directory의 기존 JSON 저장소 경계만 사용하며 worktree/session/permission/exchange 상태를 변경하지 않는다.

## 프로젝트 구조

### 문서화 (이 기능)

```text
specs/005-acp-command-override/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── tauri-commands.md
│   └── settings-ui.md
└── tasks.md              # /speckit-tasks 단계에서 생성
```

### 소스 코드 (repository root)

```text
apps/agentic-workbench/src/
├── app/
│   └── App.tsx                         # settings route and navigation entry
├── pages/
│   └── settings/
│       └── ui/settings-page.tsx         # screen-level settings page
├── features/
│   └── agent-command-override/
│       ├── model/                       # form state, command resolution helpers
│       └── ui/                          # override editor controls
├── entities/
│   └── agent-run/
│       ├── api/agent-run-repository.ts  # Tauri command adapters
│       └── model/types.ts               # settings and command override types
├── components/ui/                       # use existing shadcn/ui primitives
└── stories/                             # Storybook states if reusable UI is added

apps/agentic-workbench/src-tauri/src/
├── domain/
│   ├── agent_run_settings.rs            # extend settings model
│   └── agent_run_settings_repository.rs # existing settings port
├── application/
│   └── agent_run_settings_service.rs    # normalize, save/load, resolve command
├── inbound/
│   └── tauri_commands.rs                # get/save settings and start run boundary
├── infrastructure/
│   ├── json_agent_run_settings_repository.rs
│   └── acp/runner.rs                    # existing agentCommand-first execution path
└── ports/
    └── agent_catalog.rs                 # existing default command lookup

docs/
└── acp-agent-command-override.md
```

**구조 결정**: 새 기능은 단일 앱의 설정과 실행 흐름이므로 `apps/agentic-workbench` 내부에 둔다. 기존 `AgentRunSettings` JSON 저장소를 확장하고, runner에는 이미 존재하는 `AgentRunRequest.agent_command` 우선 실행 계약을 유지한다. 설정 화면은 별도 page로 두되, override 편집 UI와 명령 해석 helper는 `features/agent-command-override`에 둔다.

## Phase 0: 연구 결과

연구 결과는 [research.md](./research.md)에 정리했다. 모든 기술 컨텍스트 unknown은 기존 코드 확인으로 해소되었고 미해결 clarification marker는 없다.

## Phase 1: 설계 산출물

- 데이터 모델: [data-model.md](./data-model.md)
- Tauri command 계약: [contracts/tauri-commands.md](./contracts/tauri-commands.md)
- 설정 UI 계약: [contracts/settings-ui.md](./contracts/settings-ui.md)
- 검증 가이드: [quickstart.md](./quickstart.md)

## Phase 1 이후 헌법 재점검

- **Monorepo Boundary First**: PASS. 산출물과 계획 모두 `apps/agentic-workbench` 범위다.
- **Feature-Sliced Frontend Architecture**: PASS. 라우트, page, feature, entity 경계를 명확히 분리했다.
- **Hexagonal Tauri Backend Architecture**: PASS. 모델/port/use case/inbound adapter/infrastructure adapter 책임을 분리했다.
- **Shared Core Before Shared UI**: PASS. 공유 패키지나 공유 UI 추출은 없다.
- **Atomic Cross-App Verification**: N/A. cross-app 변경이 없다.
- **Documentation and Storybook**: PASS. Korean docs와 Storybook 조건을 tasks 단계에서 반영할 수 있게 구조화했다.
- **Testing and Safety**: PASS. 저장/로드/우선순위/실패 표시 검증을 quickstart와 계약에 포함했다.

## Complexity Tracking

헌법 위반이 없으므로 해당 사항 없음.
