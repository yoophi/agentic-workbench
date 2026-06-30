import type { MarkdownViewerInlineAnnotation } from "./types";

export type TextSegment =
  | { kind: "text"; text: string }
  | { kind: "mark"; text: string; annotation: MarkdownViewerInlineAnnotation };

/**
 * 렌더 텍스트를 inline annotation offset 기준으로 분할한다.
 *
 * - offset 기준은 **렌더 텍스트**(getSelectionAnchors와 동일)다.
 * - 겹치는 annotation은 먼저 시작한 것을 우선하고 나머지는 건너뛴다(overlap skip).
 * - offset은 [0, text.length]로 clamp한다.
 *
 * 순수 함수이므로 DOM 없이 단위 테스트 가능하다(PR3 acceptance fixture).
 */
export function segmentTextByAnnotations(
  text: string,
  annotations: MarkdownViewerInlineAnnotation[],
): TextSegment[] {
  const sorted = [...annotations]
    .filter((annotation) => annotation.endOffset > annotation.startOffset)
    .sort((a, b) => a.startOffset - b.startOffset);

  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const annotation of sorted) {
    const startOffset = Math.max(0, Math.min(annotation.startOffset, text.length));
    const endOffset = Math.max(startOffset, Math.min(annotation.endOffset, text.length));

    if (startOffset < cursor || startOffset === endOffset) {
      continue;
    }

    if (cursor < startOffset) {
      segments.push({ kind: "text", text: text.slice(cursor, startOffset) });
    }

    segments.push({
      kind: "mark",
      text: text.slice(startOffset, endOffset),
      annotation,
    });
    cursor = endOffset;
  }

  if (cursor < text.length) {
    segments.push({ kind: "text", text: text.slice(cursor) });
  }

  return segments;
}
