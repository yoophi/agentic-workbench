# 계약: 설정 UI

## Route

- 설정 페이지는 앱 내부 route로 접근 가능해야 한다.
- 기존 project/worktree session 화면에서 사용자가 설정 페이지로 이동할 수 있는 진입점을 제공해야 한다.
- 설정 저장 또는 실행 실패 후 사용자가 원래 작업 흐름으로 돌아갈 수 있어야 한다.

## Required Controls

- 전역 ACP agent command override 입력
- 등록된 agent별 command override 입력 목록
- 각 override 입력의 저장 상태 표시
- 각 override 입력의 초기화 control
- agent별 현재 적용 출처 표시: agent override, global override, default command
- 저장/로드 실패 메시지

## Interaction Rules

- 사용자가 전역 override를 입력하고 저장하면 agent별 override가 없는 agent의 effective command source는 global override가 된다.
- 사용자가 agent별 override를 입력하고 저장하면 해당 agent의 effective command source는 agent override가 된다.
- 사용자가 agent별 override를 초기화하면 전역 override가 있을 때 global override로, 없을 때 default command로 되돌아간다.
- 사용자가 전역 override를 초기화하면 agent별 override가 없는 agent는 default command로 되돌아간다.
- 저장 실패 시 입력 draft는 사라지지 않아야 하며 오류 메시지가 표시되어야 한다.
- 로드 실패 시 설정값이 신뢰할 수 없는 상태임을 표시하고 저장 동작은 명시적 사용자 조작 전까지 자동 실행하지 않는다.

## Display Rules

- 기본 명령은 읽기 전용 참고값으로 표시한다.
- override 입력값은 사용자가 입력한 quoting과 내부 공백을 보존해 표시한다.
- 비어 있는 override는 "override 없음" 상태로 표시한다.
- 긴 명령 문자열은 화면 너비를 깨지 않고 확인 및 편집 가능해야 한다.

## Storybook States

reusable override editor component를 만들 경우 다음 상태를 Storybook에 등록한다.

- Empty/default: override 없음, 기본 명령 사용
- Global override active
- Agent override active
- Save error
- Long command string
