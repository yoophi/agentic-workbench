import type {
  AgentCommandOverrides,
  AgentCommandSource,
  AgentDescriptor,
  CommandResolutionResult,
} from "@/entities/agent-run/model/types";

export const APP_COMMAND_OVERRIDE_SETTINGS_KEY = "__app_agent_command_overrides__";

export function normalizeCommandOverrides(
  overrides: AgentCommandOverrides | null | undefined,
): AgentCommandOverrides {
  const globalCommand = normalizeOptionalCommand(overrides?.globalCommand ?? null);
  const agentCommands = Object.fromEntries(
    Object.entries(overrides?.agentCommands ?? {})
      .map(([agentId, command]) => [agentId.trim(), command.trim()] as const)
      .filter(([agentId, command]) => agentId.length > 0 && command.length > 0),
  );

  return {
    ...(globalCommand ? { globalCommand } : {}),
    ...(Object.keys(agentCommands).length > 0 ? { agentCommands } : {}),
  };
}

export function resolveAgentCommand({
  agentId,
  agents,
  overrides,
}: {
  agentId: string;
  agents: AgentDescriptor[];
  overrides: AgentCommandOverrides | null | undefined;
}): CommandResolutionResult | null {
  const normalizedAgentId = agentId.trim();
  const normalizedOverrides = normalizeCommandOverrides(overrides);
  const agentCommand = normalizedOverrides.agentCommands?.[normalizedAgentId];
  if (agentCommand) {
    return {
      agentId: normalizedAgentId,
      command: agentCommand,
      source: "agentOverride",
    };
  }

  if (normalizedOverrides.globalCommand) {
    return {
      agentId: normalizedAgentId,
      command: normalizedOverrides.globalCommand,
      source: "globalOverride",
    };
  }

  const defaultCommand = agents.find((agent) => agent.id === normalizedAgentId)?.command.trim();
  if (!defaultCommand) {
    return null;
  }

  return {
    agentId: normalizedAgentId,
    command: defaultCommand,
    source: "defaultCommand",
  };
}

export function sourceLabel(source: AgentCommandSource) {
  switch (source) {
    case "agentOverride":
      return "Agent override";
    case "globalOverride":
      return "Global override";
    case "defaultCommand":
      return "Default command";
  }
}

function normalizeOptionalCommand(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : undefined;
}
