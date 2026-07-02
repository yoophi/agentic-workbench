# 기능 명세: ACP Agent 실행 명령 Override

**기능 브랜치**: `[099-issue]`

**작성일**: 2026-07-02

**상태**: 초안

**입력**: GitHub issue #099 "설정 페이지에서 ACP agent 실행 명령 override 지원"

## 사용자 시나리오 및 테스트 *(필수)*

### 사용자 스토리 1 - 실행 명령 override 설정 (우선순위: P1)

사용자는 `agentic-workbench` 설정 페이지에서 ACP agent 실행에 사용할 명령 override 값을 입력하고 저장할 수 있다.

**우선순위 근거**: 프로젝트나 사용자 환경에 따라 agent 실행 명령이 달라지는 문제를 해결하는 핵심 흐름이다.

**독립 테스트**: 설정 페이지에서 override 값을 입력하고 저장한 뒤, 다시 설정 페이지를 열어 같은 값이 표시되는지 확인한다.

**인수 시나리오**:

1. **Given** 사용자가 `agentic-workbench`를 실행 중임, **When** 설정 페이지를 엶, **Then** ACP agent 실행 명령 override 입력 영역을 볼 수 있다.
2. **Given** 사용자가 override 값을 입력했음, **When** 설정을 저장함, **Then** 저장 완료 상태가 표시되고 입력한 값이 현재 설정으로 유지된다.
3. **Given** 사용자가 저장된 override 값을 보유함, **When** 앱을 재시작하고 설정 페이지를 다시 엶, **Then** 이전에 저장한 override 값이 표시된다.

---

### 사용자 스토리 2 - override 우선 적용으로 agent 실행 (우선순위: P1)

사용자는 override 값을 저장한 뒤 ACP agent를 실행하면 기존 기본 실행 명령 대신 저장된 override 명령이 우선 적용되는 것을 기대할 수 있다.

**우선순위 근거**: 설정값이 실제 agent 실행에 반영되지 않으면 설정 페이지의 사용자 가치가 없다.

**독립 테스트**: override 값을 저장한 상태에서 agent 실행을 시작하고, 실행 시 선택된 명령이 저장된 override 값과 일치하는지 검증한다.

**인수 시나리오**:

1. **Given** 사용자가 특정 agent에 대한 override 값을 저장했음, **When** 해당 agent 실행을 시작함, **Then** 저장된 override 명령이 실행 명령으로 사용된다.
2. **Given** 사용자가 override 값을 저장하지 않았음, **When** agent 실행을 시작함, **Then** 기존 기본 실행 명령이 그대로 사용된다.
3. **Given** 사용자가 override 값을 삭제했음, **When** 같은 agent 실행을 다시 시작함, **Then** 기존 기본 실행 명령이 사용된다.

---

### 사용자 스토리 3 - 잘못된 명령어 실행 실패 확인 (우선순위: P2)

사용자는 잘못된 override 값을 저장했더라도 agent 실행 실패 이유를 명확히 확인하고 설정을 수정할 수 있다.

**우선순위 근거**: 명령 override는 환경 의존성이 높으므로 실패가 모호하면 사용자가 문제를 스스로 해결하기 어렵다.

**독립 테스트**: 존재하지 않거나 실행할 수 없는 명령을 override로 저장하고 agent 실행을 시도해 사용자에게 실패 원인과 수정 경로가 표시되는지 확인한다.

**인수 시나리오**:

1. **Given** 사용자가 실행할 수 없는 override 값을 저장했음, **When** agent 실행을 시작함, **Then** 실행 실패가 명확한 오류 상태로 표시된다.
2. **Given** 실행 실패가 표시됨, **When** 사용자가 오류 내용을 확인함, **Then** 실패한 명령 설정을 수정해야 함을 이해할 수 있다.
3. **Given** 사용자가 실패한 override 값을 올바른 값으로 수정했음, **When** agent 실행을 다시 시작함, **Then** 수정된 override 값으로 실행이 재시도된다.

### 예외 상황

- override 값이 비어 있거나 초기화된 경우 기존 기본 실행 명령을 사용해야 한다.
- 저장된 override 값이 앱 재시작 후에도 손실되지 않아야 한다.
- 지원되는 agent가 여러 종류인 경우 사용자는 agent 종류별 override 값을 구분해 설정할 수 있어야 한다.
- agent 종류별 override가 없는 경우 전역 override가 있으면 전역 override를 적용하고, 전역 override도 없으면 기존 기본 실행 명령을 적용해야 한다.
- 전역 override와 agent 종류별 override가 모두 있는 경우 agent 종류별 override가 우선 적용되어야 한다.
- 설정 저장 또는 로드에 실패한 경우 사용자는 현재 설정 상태를 신뢰할 수 없음을 알 수 있어야 한다.
- 잘못된 명령어 때문에 agent 실행이 실패하더라도 기존 세션 목록, worktree 정보, 다른 설정값은 훼손되지 않아야 한다.
- override 값은 사용자가 입력한 의도를 보존해야 하며, 표시 과정에서 임의로 숨기거나 재작성하지 않아야 한다.

## 요구사항 *(필수)*

### 기능 요구사항

- **FR-001**: 시스템은 `agentic-workbench`에서 사용자가 접근할 수 있는 설정 페이지를 제공해야 한다.
- **FR-002**: 설정 페이지는 ACP agent 실행 명령 override 값을 입력, 수정, 저장할 수 있는 영역을 제공해야 한다.
- **FR-003**: 사용자는 저장된 ACP agent 실행 명령 override 값을 초기화할 수 있어야 한다.
- **FR-004**: 시스템은 override 값이 없을 때 기존 기본 ACP agent 실행 명령을 그대로 사용해야 한다.
- **FR-005**: 시스템은 override 값이 있을 때 ACP agent 실행 시 해당 override 값을 기존 기본 실행 명령보다 우선 적용해야 한다.
- **FR-006**: 시스템은 저장된 override 값을 앱 재시작 후에도 유지해야 한다.
- **FR-007**: 시스템은 지원되는 agent 종류별 override 값을 구분해 저장하고 적용할 수 있어야 한다.
- **FR-008**: 시스템은 agent 종류별 override, 전역 override, 기존 기본 실행 명령 순서로 실행 명령 우선순위를 결정해야 한다.
- **FR-009**: 설정 페이지는 agent 종류별 override와 전역 override의 현재 적용 상태를 사용자가 구분할 수 있게 표시해야 한다.
- **FR-010**: 시스템은 override 저장 또는 로드 실패 시 사용자에게 설정 반영 여부를 명확히 알려야 한다.
- **FR-011**: 시스템은 잘못된 override 값으로 agent 실행이 실패하면 실패 상태와 원인을 사용자가 이해할 수 있는 메시지로 표시해야 한다.
- **FR-012**: 사용자는 실행 실패 후 설정 페이지로 돌아가 override 값을 수정하고 다시 실행을 시도할 수 있어야 한다.
- **FR-013**: override 설정 변경은 기존 agent 실행 기록, 세션 정보, worktree 정보, 다른 사용자 설정을 변경하지 않아야 한다.
- **FR-014**: 시스템은 override 설정의 저장, 로드, 초기화, 실행 명령 우선순위, 실행 실패 표시를 검증할 수 있어야 한다.

### 핵심 개체

- **Agent Command Override**: ACP agent 실행 시 기본 명령 대신 사용할 사용자 지정 명령 설정. 전역 값과 agent 종류별 값을 포함할 수 있다.
- **Agent Type**: override 적용 대상을 구분하는 agent 범주. 특정 agent 실행에 가장 구체적인 override를 선택하는 기준이다.
- **Settings Page**: 사용자가 override 값을 입력, 저장, 초기화하고 현재 적용 상태를 확인하는 화면이다.
- **Command Resolution Result**: agent 실행 전에 선택된 실행 명령과 그 출처를 나타내는 결과. agent 종류별 override, 전역 override, 기본 명령 중 하나를 가리킨다.
- **Execution Failure Notice**: 잘못된 override 값 또는 실행 불가 상태를 사용자에게 알리는 오류 표시다.

## 헌법 정렬 *(필수)*

- **Monorepo boundary**: 범위는 `apps/agentic-workbench`에 한정한다. 다른 앱으로 기능을 확장하지 않으며, cross-app 공유 모듈은 현재 범위에서 만들지 않는다.
- **Frontend layering**: 설정 화면은 `pages`에 두고, override 저장/초기화/적용 상태 표시 같은 사용자 행동은 `features`로 분리한다. agent 설정 모델과 표시용 helper는 필요 시 `entities`에 둔다. 범용 UI primitive가 아닌 shadcn/ui 생성 컴포넌트는 `components/ui`에서만 가져온다.
- **Backend boundary**: Tauri backend 변경이 필요한 경우 명령 입력 검증과 호출 경계는 `inbound`, 설정 저장/로드 사용 사례는 `application`, 설정 저장소 port와 모델은 `domain`, 실제 영속 저장 adapter는 `infrastructure` 책임으로 분리한다. agent 실행 경로는 설정 해석 결과를 통해 실행 명령을 선택해야 한다.
- **Shared core vs UI**: 요구사항은 단일 앱의 설정과 실행 흐름에 국한되므로 shared UI 패키지 추출은 피한다. 재사용이 필요한 경우에도 우선 앱 내부의 순수 설정 해석 규칙과 테스트로 한정한다.
- **Persistence and safety**: override 설정은 기존 설정 저장 구조와 충돌하지 않아야 하며 저장/로드 실패를 사용자에게 표시해야 한다. 설정 접근은 앱 설정 범위 안에서만 이뤄져야 하고, agent session, worktree, permission, exchange 상태를 임의로 변경하지 않아야 한다.
- **Documentation and Storybook**: 설정 페이지 또는 관련 reusable component가 추가되면 Storybook에 대표 상태를 등록한다. 사용자 설정 우선순위와 실행 실패 동작은 필요 시 `docs/*.md`에 한국어로 문서화한다.

## 성공 기준 *(필수)*

### 측정 가능한 결과

- **SC-001**: 사용자는 설정 페이지에서 ACP agent 실행 명령 override 값을 30초 이내에 입력하고 저장할 수 있다.
- **SC-002**: 저장된 override 값은 앱 재시작 후 100% 동일하게 다시 표시된다.
- **SC-003**: override 값이 저장된 agent 실행의 100%에서 저장된 override 값이 기존 기본 실행 명령보다 우선 적용된다.
- **SC-004**: override 값이 없는 agent 실행의 100%에서 기존 기본 실행 명령이 유지된다.
- **SC-005**: 전역 override와 agent 종류별 override가 모두 있는 경우, agent 종류별 override가 100% 우선 적용된다.
- **SC-006**: 잘못된 override 값으로 인한 실행 실패 시 사용자는 5초 이내에 실패 상태와 설정 수정 필요성을 확인할 수 있다.
- **SC-007**: override 저장, 로드, 초기화, 우선순위 결정, 실패 표시를 포함한 검증 항목이 완료 전 모두 통과한다.

## 가정

- 이번 기능의 대상 앱은 `agentic-workbench`다.
- 설정 페이지는 기존 작업 화면에서 접근 가능한 앱 내부 설정 화면을 의미한다.
- override 값은 사용자가 로컬 실행 환경에 맞게 입력하는 명령 문자열이며, 시스템은 비어 있는 값을 override 없음으로 처리한다.
- agent 종류별 override는 지원되는 agent 범주가 둘 이상일 때 의미가 있으며, 단일 agent만 있는 환경에서도 전역 override 흐름은 동일하게 동작한다.
- 프로젝트 또는 worktree별 override는 이번 범위에 포함하지 않고, 전역 override와 agent 종류별 override의 우선순위까지만 정의한다.
- 기존 기본 실행 명령은 현재 앱이 override 없이 사용하던 동작을 의미한다.
