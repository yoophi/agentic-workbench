import { describe, expect, it } from "vitest";
import { segmentTextByAnnotations } from "./segment-text";
import type { MarkdownViewerInlineAnnotation } from "./types";

function annotation(
  partial: Partial<MarkdownViewerInlineAnnotation> & Pick<MarkdownViewerInlineAnnotation, "startOffset" | "endOffset">,
): MarkdownViewerInlineAnnotation {
  return {
    id: `a-${partial.startOffset}-${partial.endOffset}`,
    comment: "",
    type: "note",
    ...partial,
  };
}

describe("segmentTextByAnnotations (acceptance fixture)", () => {
  it("returns a single text segment when there are no annotations", () => {
    expect(segmentTextByAnnotations("bold text", [])).toEqual([
      { kind: "text", text: "bold text" },
    ]);
  });

  it("marks a partial selection inside rendered text of **bold**", () => {
    // ReactMarkdown renders "**bold**" as the rendered text "bold".
    const segments = segmentTextByAnnotations("bold", [annotation({ startOffset: 0, endOffset: 2 })]);
    expect(segments).toEqual([
      { kind: "mark", text: "bo", annotation: expect.objectContaining({ startOffset: 0, endOffset: 2 }) },
      { kind: "text", text: "ld" },
    ]);
  });

  it("marks a boundary selection across `code` rendered text", () => {
    // "`code` here" renders to "code here"; select the trailing word.
    const segments = segmentTextByAnnotations("code here", [annotation({ startOffset: 5, endOffset: 9 })]);
    expect(segments).toEqual([
      { kind: "text", text: "code " },
      { kind: "mark", text: "here", annotation: expect.objectContaining({ startOffset: 5, endOffset: 9 }) },
    ]);
  });

  it("marks part of a [link] label's rendered text", () => {
    // "[Anthropic](https://x)" renders to "Anthropic"; select a slice.
    const segments = segmentTextByAnnotations("Anthropic", [annotation({ startOffset: 0, endOffset: 4 })]);
    expect(segments).toEqual([
      { kind: "mark", text: "Anth", annotation: expect.objectContaining({ startOffset: 0, endOffset: 4 }) },
      { kind: "text", text: "ropic" },
    ]);
  });

  it("keeps the first of overlapping annotations and skips the rest (nested)", () => {
    const segments = segmentTextByAnnotations("abcdefgh", [
      annotation({ startOffset: 0, endOffset: 4 }),
      annotation({ startOffset: 2, endOffset: 6 }), // overlaps -> skipped
      annotation({ startOffset: 4, endOffset: 6 }), // resumes after first
    ]);
    expect(segments).toEqual([
      { kind: "mark", text: "abcd", annotation: expect.objectContaining({ startOffset: 0, endOffset: 4 }) },
      { kind: "mark", text: "ef", annotation: expect.objectContaining({ startOffset: 4, endOffset: 6 }) },
      { kind: "text", text: "gh" },
    ]);
  });

  it("clamps offsets that exceed the text length and drops empty ranges", () => {
    const segments = segmentTextByAnnotations("abc", [
      annotation({ startOffset: 1, endOffset: 99 }),
      annotation({ startOffset: 2, endOffset: 2 }), // empty -> dropped
    ]);
    expect(segments).toEqual([
      { kind: "text", text: "a" },
      { kind: "mark", text: "bc", annotation: expect.objectContaining({ startOffset: 1, endOffset: 99 }) },
    ]);
  });
});
