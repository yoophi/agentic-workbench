import { describe, expect, it } from "vitest";

import {
  createAgentRunMermaidBlockId,
  extractCodeLanguage,
  getAgentRunCodeBlockRenderKind,
  normalizeStreamingMarkdown,
} from "./agent-run-markdown";

describe("agent run markdown", () => {
  it("closes unmatched streaming fences without changing complete markdown", () => {
    expect(normalizeStreamingMarkdown("```ts\nconst ready = true;")).toBe(
      "```ts\nconst ready = true;\n```",
    );
    expect(normalizeStreamingMarkdown("```ts\nconst ready = true;\n```")).toBe(
      "```ts\nconst ready = true;\n```",
    );
  });

  it("extracts code languages from react-markdown class names", () => {
    expect(extractCodeLanguage("language-ts")).toBe("ts");
    expect(extractCodeLanguage("foo language-mermaid bar")).toBe("mermaid");
    expect(extractCodeLanguage(undefined)).toBeUndefined();
  });

  it("detects mermaid language markers while preserving ordinary code", () => {
    expect(
      getAgentRunCodeBlockRenderKind({
        language: " Mermaid ",
        source: "not yet valid",
      }),
    ).toBe("mermaid-diagram");
    expect(
      getAgentRunCodeBlockRenderKind({
        language: "ts",
        source: "const graph = true;",
      }),
    ).toBe("ordinary-code");
  });

  it("can detect shared leading Mermaid declarations without changing ordinary code", () => {
    expect(
      getAgentRunCodeBlockRenderKind({
        source: "flowchart TD\n  A --> B",
      }),
    ).toBe("mermaid-diagram");
    expect(
      getAgentRunCodeBlockRenderKind({
        source: "flowchartFactory()",
      }),
    ).toBe("ordinary-code");
  });

  it("creates ids that change when Mermaid source updates", () => {
    expect(createAgentRunMermaidBlockId({ source: "flowchart TD", startLine: 1 })).not.toBe(
      createAgentRunMermaidBlockId({ source: "sequenceDiagram", startLine: 1 }),
    );
  });
});
