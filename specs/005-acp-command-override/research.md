# 연구: ACP Agent 실행 명령 Override

## Decision: 기존 AgentRunSettings 저장소 확장

**Rationale**: `apps/agentic-workbench/src-tauri/src/domain/agent_run_settings.rs`와 `json_agent_run_settings_repository.rs`가 이미 workbench의 agent 실행 설정을 앱 data directory JSON 파일로 저장한다. override는 agent 실행 설정의 일부이므로 같은 저장소에 후방 호환 필드를 추가하는 편이 사용자 기대와 기존 저장/로드 흐름에 맞다.

**Alternatives considered**:

- 별도 `agent-command-overrides.json` 파일 생성: 설정 관심사가 분리되지만 settings page가 두 저장소를 조합해야 하고 저장 실패 처리도 복잡해진다.
- 프론트엔드 local storage 사용: Tauri 앱의 기존 설정 영속 방식과 충돌하고 backend 실행 경로 검증이 어려워진다.

## Decision: 전역 override와 agent 종류별 override를 같은 설정 모델에 둔다

**Rationale**: 명세는 agent 종류별 override 검토를 요구하고, 최종 스펙은 우선순위를 agent별 override > 전역 override > 기본 명령으로 확정했다. 같은 모델에 두면 설정 화면에서 현재 적용 상태를 설명하기 쉽고, 실행 전 명령 해석도 순수 함수로 검증할 수 있다.

**Alternatives considered**:

- 전역 override만 제공: 요구사항 FR-007, FR-008을 만족하지 못한다.
- 프로젝트/worktree별 override 포함: 이슈의 고려사항 중 하나지만 스펙에서 범위 밖으로 정리했다. 지금 포함하면 설정 우선순위와 UX 복잡도가 커진다.

## Decision: 기존 AgentRunRequest.agentCommand 우선 실행 경로 사용

**Rationale**: 프론트엔드 타입에는 이미 `AgentRunRequest.agentCommand?: string`이 있고, `AcpAgentRunner`는 request의 `agent_command`가 비어 있지 않으면 catalog 기본 명령보다 먼저 사용한다. 따라서 실행 경로의 핵심 계약은 이미 존재하며, 새 기능은 저장된 override를 run 요청에 안전하게 반영하는 계획으로 충분하다.

**Alternatives considered**:

- runner가 직접 설정 저장소를 읽게 하기: 실행 adapter가 app 설정 저장소에 결합되고 테스트가 어려워진다.
- agent catalog 자체를 override 값으로 변경하기: 기본 catalog와 사용자 설정 출처가 섞여 현재 적용 상태 설명이 어려워진다.

## Decision: 명령 문자열은 저장 시 trim하되 파싱 검증은 실행 시 유지

**Rationale**: 명령 문자열은 shell-style argv로 파싱되며, runner가 `shell_words::split` 실패와 empty command를 오류로 표시한다. 설정 저장 시에는 앞뒤 공백을 제거하고 빈 값은 override 없음으로 정규화하되, 사용자가 입력한 quoting 의도는 보존한다.

**Alternatives considered**:

- 저장 시 명령 실행 가능 여부까지 검증: 사용자의 PATH, shell 환경, agent 설치 상태가 변할 수 있어 저장 시점 검증이 불안정하다.
- command/args를 분리 입력하게 하기: 파싱 오류는 줄지만 사용자가 기존 명령 문자열을 그대로 복사해 넣는 흐름이 불편해진다.

## Decision: 설정 화면은 app route로 추가하고 편집 기능은 feature로 분리

**Rationale**: constitution은 screen-level UI를 `pages`, 사용자 행동과 business interaction을 `features`, 타입/API adapter를 `entities`에 두도록 요구한다. 설정 화면은 앱 공통 진입점이므로 route는 `app`, 화면은 `pages/settings`, override form은 `features/agent-command-override`로 나눈다.

**Alternatives considered**:

- 기존 agent-run panel 안에 설정을 직접 추가: 설정이 run 화면에 묶여 독립적인 설정 페이지 요구사항을 만족하기 어렵다.
- 모든 UI를 `app/App.tsx`에 구현: 라우팅과 화면 책임이 섞이고 재사용/Storybook 검증이 어렵다.

## Decision: 실행 실패 표시는 기존 run event 오류 흐름을 사용하고 설정 수정 경로를 추가한다

**Rationale**: runner launch 실패는 `RunEvent::Error`로 emit되고 프론트엔드 panel은 오류 상태를 이미 표시한다. 잘못된 override 명령도 같은 실패 흐름을 사용하되, 메시지에 override 명령 출처 또는 설정 수정 안내를 표시할 수 있게 계약을 확장한다.

**Alternatives considered**:

- 별도 modal로 모든 실행 실패 표시: 기존 run timeline 오류 표시와 중복된다.
- 실행 실패를 설정 화면에서만 표시: 사용자가 run을 시작한 맥락에서 즉시 원인을 보기 어렵다.
