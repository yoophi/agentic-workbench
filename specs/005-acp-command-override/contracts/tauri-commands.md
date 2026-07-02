# 계약: Tauri Commands

## get_agent_run_settings

저장된 agent run 설정과 command override를 조회한다.

### Request

```json
{
  "workingDirectory": "/absolute/worktree/path"
}
```

### Response

설정이 있으면 `AgentRunSettings`, 없으면 `null`.

```json
{
  "workingDirectory": "/absolute/worktree/path",
  "agentId": "codex",
  "permissionMode": "plan",
  "modelId": "providerDefault",
  "contextSize": "default",
  "sessionMode": "new",
  "ralphLoop": {
    "enabled": false,
    "maxIterations": 5,
    "delayMs": 0,
    "stopOnError": true,
    "stopOnPermission": false,
    "promptTemplate": ""
  },
  "commandOverrides": {
    "globalCommand": "npx -y @agentclientprotocol/codex-acp",
    "agentCommands": {
      "claude-code": "npx -y @agentclientprotocol/claude-agent-acp"
    }
  }
}
```

### Errors

- app data directory를 찾거나 생성할 수 없으면 사용자 표시 가능한 오류 문자열을 반환한다.
- JSON 설정 파일을 읽을 수 없으면 사용자 표시 가능한 오류 문자열을 반환한다.

## save_agent_run_settings

agent run 설정과 command override를 저장한다.

### Request

```json
{
  "settings": {
    "workingDirectory": "/absolute/worktree/path",
    "agentId": "codex",
    "permissionMode": "plan",
    "modelId": "providerDefault",
    "contextSize": "default",
    "sessionMode": "new",
    "ralphLoop": {
      "enabled": false,
      "maxIterations": 5,
      "delayMs": 0,
      "stopOnError": true,
      "stopOnPermission": false,
      "promptTemplate": ""
    },
    "commandOverrides": {
      "globalCommand": "custom-acp",
      "agentCommands": {
        "codex": "custom-codex-acp"
      }
    }
  }
}
```

### Response

정규화된 `AgentRunSettings`.

### Normalization

- `workingDirectory`는 trim 후 빈 값이면 오류다.
- `agentId`와 override map key는 trim한다.
- command override value는 trim한다.
- trim 후 빈 command override value는 제거한다.
- 빈 `agentCommands` map과 빈 `globalCommand`는 override 없음으로 처리한다.

### Errors

- 필수 working directory가 비어 있으면 오류를 반환한다.
- 설정 저장 실패 시 사용자 표시 가능한 오류 문자열을 반환한다.

## start_agent_run

agent 실행 요청을 시작한다. 이 기능은 실행 요청에 확정된 `agentCommand`를 포함시키는 흐름을 검증한다.

### Request Fragment

```json
{
  "request": {
    "runId": "uuid",
    "goal": "사용자 prompt",
    "agentId": "codex",
    "cwd": "/absolute/worktree/path",
    "agentCommand": "custom-codex-acp"
  }
}
```

### Contract

- `agentCommand`가 non-empty이면 runner는 agent catalog 기본 명령보다 이를 우선 사용한다.
- `agentCommand`가 없거나 empty이면 runner는 agent catalog 기본 명령을 사용한다.
- 명령 파싱 실패, empty command, spawn 실패는 run error event 또는 command 오류로 사용자에게 표시되어야 한다.

## list_agents

설정 화면은 등록된 agent 목록과 기본 명령 표시를 위해 기존 `list_agents`를 사용한다.

### Response Fragment

```json
[
  {
    "id": "codex",
    "label": "Codex",
    "command": "npx -y @agentclientprotocol/codex-acp"
  }
]
```

### Contract

- 설정 화면은 agent별 override editor를 이 목록 기준으로 표시한다.
- 기본 명령 출처는 override가 없을 때의 fallback으로 표시한다.
