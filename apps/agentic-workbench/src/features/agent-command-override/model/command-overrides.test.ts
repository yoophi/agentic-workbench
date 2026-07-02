import { describe, expect, it } from "vitest";

import type { AgentDescriptor } from "@/entities/agent-run/model/types";
import { normalizeCommandOverrides, resolveAgentCommand } from "./command-overrides";

const agents: AgentDescriptor[] = [
  { id: "codex", label: "Codex", command: "codex-default" },
  { id: "claude-code", label: "Claude Code", command: "claude-default" },
];

describe("command override helpers", () => {
  it("normalizes blank commands and trims preserved commands", () => {
    expect(
      normalizeCommandOverrides({
        globalCommand: "  custom-acp  ",
        agentCommands: {
          " codex ": "  codex-acp  ",
          "claude-code": "   ",
          " ": "ignored",
        },
      }),
    ).toEqual({
      globalCommand: "custom-acp",
      agentCommands: {
        codex: "codex-acp",
      },
    });
  });

  it("resolves agent override before global override and default command", () => {
    expect(
      resolveAgentCommand({
        agentId: "codex",
        agents,
        overrides: {
          globalCommand: "global-acp",
          agentCommands: { codex: "codex-acp" },
        },
      }),
    ).toEqual({
      agentId: "codex",
      command: "codex-acp",
      source: "agentOverride",
    });
  });

  it("falls back from global override to default command", () => {
    expect(
      resolveAgentCommand({
        agentId: "claude-code",
        agents,
        overrides: { globalCommand: "global-acp" },
      })?.source,
    ).toBe("globalOverride");

    expect(
      resolveAgentCommand({
        agentId: "claude-code",
        agents,
        overrides: {},
      }),
    ).toEqual({
      agentId: "claude-code",
      command: "claude-default",
      source: "defaultCommand",
    });
  });
});
