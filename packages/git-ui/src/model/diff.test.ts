import { describe, expect, it } from "vitest";

import { parseDiffLines } from "./diff";

describe("parseDiffLines", () => {
  it("tracks old/new line numbers across a hunk", () => {
    const diff = ["@@ -1,2 +1,3 @@", " context", "-removed", "+added", " tail"].join("\n");

    const lines = parseDiffLines(diff);

    // 헤더 줄에는 번호가 없다.
    expect(lines[0]).toEqual({ content: "@@ -1,2 +1,3 @@" });
    // context: old/new 둘 다 증가
    expect(lines[1]).toMatchObject({ oldLineNumber: 1, newLineNumber: 1 });
    // 삭제: old만
    expect(lines[2]).toMatchObject({ oldLineNumber: 2 });
    expect(lines[2].newLineNumber).toBeUndefined();
    // 추가: new만
    expect(lines[3]).toMatchObject({ newLineNumber: 2 });
    expect(lines[3].oldLineNumber).toBeUndefined();
  });

  it("returns a placeholder line for empty content", () => {
    // 빈 diff는 안내 문구 한 줄로 대체되며, 일반 줄과 동일하게 0/0 번호가 매겨진다.
    expect(parseDiffLines("")).toEqual([
      { content: "No text diff available.", oldLineNumber: 0, newLineNumber: 0 },
    ]);
  });
});
