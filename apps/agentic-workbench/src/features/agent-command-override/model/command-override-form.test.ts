import { describe, expect, it } from "vitest";

import type { AgentDescriptor } from "@/entities/agent-run/model/types";
import {
  commandOverridePayload,
  createCommandOverrideDraft,
  preserveDraftOnSaveError,
  resetAgentCommandDraft,
  resetGlobalCommandDraft,
  updateAgentCommandDraft,
} from "./command-override-form";

const agents: AgentDescriptor[] = [
  { id: "codex", label: "Codex", command: "codex-default" },
  { id: "claude-code", label: "Claude Code", command: "claude-default" },
];

describe("command override form", () => {
  it("creates drafts for every registered agent", () => {
    expect(
      createCommandOverrideDraft(
        {
          globalCommand: "global-acp",
          agentCommands: { codex: "codex-acp" },
        },
        agents,
      ),
    ).toEqual({
      globalCommand: "global-acp",
      agentCommands: {
        codex: "codex-acp",
        "claude-code": "",
      },
    });
  });

  it("resets only the requested override value", () => {
    const draft = {
      globalCommand: "global-acp",
      agentCommands: { codex: "codex-acp", "claude-code": "claude-acp" },
    };

    expect(resetAgentCommandDraft(draft, "codex")).toEqual({
      globalCommand: "global-acp",
      agentCommands: { codex: "", "claude-code": "claude-acp" },
    });
    expect(resetGlobalCommandDraft(draft)).toEqual({
      globalCommand: "",
      agentCommands: { codex: "codex-acp", "claude-code": "claude-acp" },
    });
  });

  it("trims payload while preserving draft on save errors", () => {
    const draft = updateAgentCommandDraft(
      { globalCommand: "  global-acp  ", agentCommands: {} },
      " codex ",
      "  codex-acp  ",
    );

    expect(commandOverridePayload(draft)).toEqual({
      globalCommand: "global-acp",
      agentCommands: {
        codex: "codex-acp",
      },
    });
    expect(preserveDraftOnSaveError(draft)).toEqual(draft);
    expect(preserveDraftOnSaveError(draft)).not.toBe(draft);
  });
});
