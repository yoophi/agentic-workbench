import type {
  AgentCommandOverrides,
  AgentDescriptor,
} from "@/entities/agent-run/model/types";
import { normalizeCommandOverrides } from "./command-overrides";

export type CommandOverrideDraft = {
  globalCommand: string;
  agentCommands: Record<string, string>;
};

export function createCommandOverrideDraft(
  overrides: AgentCommandOverrides | null | undefined,
  agents: AgentDescriptor[],
): CommandOverrideDraft {
  const normalized = normalizeCommandOverrides(overrides);
  return {
    globalCommand: normalized.globalCommand ?? "",
    agentCommands: Object.fromEntries(
      agents.map((agent) => [
        agent.id,
        normalized.agentCommands?.[agent.id] ?? "",
      ]),
    ),
  };
}

export function updateAgentCommandDraft(
  draft: CommandOverrideDraft,
  agentId: string,
  command: string,
): CommandOverrideDraft {
  return {
    ...draft,
    agentCommands: {
      ...draft.agentCommands,
      [agentId]: command,
    },
  };
}

export function resetAgentCommandDraft(
  draft: CommandOverrideDraft,
  agentId: string,
): CommandOverrideDraft {
  return updateAgentCommandDraft(draft, agentId, "");
}

export function resetGlobalCommandDraft(
  draft: CommandOverrideDraft,
): CommandOverrideDraft {
  return {
    ...draft,
    globalCommand: "",
  };
}

export function commandOverridePayload(
  draft: CommandOverrideDraft,
): AgentCommandOverrides {
  return normalizeCommandOverrides({
    globalCommand: draft.globalCommand,
    agentCommands: draft.agentCommands,
  });
}

export function preserveDraftOnSaveError(
  draft: CommandOverrideDraft,
): CommandOverrideDraft {
  return {
    globalCommand: draft.globalCommand,
    agentCommands: { ...draft.agentCommands },
  };
}
