import { detectMermaidBlock } from "@yoophi/markdown-annotation-core";

export type AgentRunCodeBlockRenderKind = "ordinary-code" | "mermaid-diagram";

export function normalizeStreamingMarkdown(content: string) {
  const fenceMatches = content.match(/```/g);
  if (fenceMatches && fenceMatches.length % 2 === 1) {
    const suffix = content.endsWith("\n") ? "```" : "\n```";
    return `${content}${suffix}`;
  }
  return content;
}

export function extractCodeLanguage(className?: string) {
  if (!className) return undefined;
  const match = className.match(/(?:^|\s)language-([^\s]+)/);
  return match?.[1];
}

export function getAgentRunCodeBlockRenderKind({
  language,
  source,
}: {
  language?: string;
  source: string;
}): AgentRunCodeBlockRenderKind {
  return detectMermaidBlock({ content: source, language }) ? "mermaid-diagram" : "ordinary-code";
}

export function createAgentRunMermaidBlockId({
  source,
  startLine,
}: {
  source: string;
  startLine?: number;
}) {
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = Math.imul(31, hash) + source.charCodeAt(index);
  }

  return `agent-run-mermaid-${startLine ?? "unknown"}-${Math.abs(hash).toString(36)}`;
}
