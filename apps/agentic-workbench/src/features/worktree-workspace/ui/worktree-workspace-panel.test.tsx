import { describe, expect, it } from "vitest";
import { buildSelectionQuickPromptContext } from "@yoophi/markdown-annotation-core";
import {
  createWorkbenchQuickPromptPayload,
  createWorkbenchQuickPromptTarget,
} from "../model/quick-prompt-delivery";

const selectionContext = buildSelectionQuickPromptContext({
  sourceLabel: "docs/review.md",
  documentPath: "/workspace/docs/review.md",
  documentRevisionLabel: "docs/review.md:120:8",
  selectedText: "selected markdown",
  anchors: [
    {
      blockId: "paragraph-1",
      startLine: 4,
      endLine: 4,
      startOffset: 0,
      endOffset: 17,
      selectedText: "selected markdown",
    },
  ],
});

describe("worktree workspace quick annotate delivery", () => {
  it("formats the dialog-entered prompt text with selected Markdown context", () => {
    const payload = createWorkbenchQuickPromptPayload({
      promptText: "사용자가 입력한 요청",
      context: selectionContext,
      target: createWorkbenchQuickPromptTarget(true),
    });

    expect(payload).toContain("사용자가 입력한 요청");
    expect(payload).toContain("selected markdown");
    expect(payload).toContain("선택 영역");
    expect(payload).not.toContain("이 Markdown 블럭을 검토하고 필요한 작업을 제안하세요.");
  });

  it("blocks selection quick annotate delivery when no agent prompt target exists", () => {
    expect(() =>
      createWorkbenchQuickPromptPayload({
        promptText: "Review this",
        context: selectionContext,
        target: createWorkbenchQuickPromptTarget(false),
      }),
    ).toThrow("연결된 agent prompt 대상이 없습니다.");
  });
});
