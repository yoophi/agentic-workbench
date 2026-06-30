import { useCallback, type RefObject } from "react";
import type { AnnotationAnchor } from "@yoophi/markdown-annotation-core/types";

function containsNode(parent: HTMLElement, node: Node) {
  return parent === node || parent.contains(node);
}

/**
 * 현재 브라우저 선택 영역을 블록별 AnnotationAnchor 배열로 변환한다.
 *
 * offset 기준은 **렌더 텍스트**다: prefixRange(`Range.toString().length`)로 계산하므로
 * MarkdownViewer의 inline `<mark>` 분할 기준(segmentTextByAnnotations)과 일치한다.
 * 선택이 여러 블록에 걸치면 블록마다 하나의 anchor를 만든다.
 */
export function getSelectionAnchors(root: HTMLElement | null): AnnotationAnchor[] {
  const selection = typeof window !== "undefined" ? window.getSelection() : null;
  const selectedText = selection?.toString().trim();
  if (!root || !selection || !selectedText || selection.rangeCount === 0) {
    return [];
  }

  const range = selection.getRangeAt(0);
  const blockContentElements = Array.from(
    root.querySelectorAll<HTMLElement>("[data-block-content]"),
  );

  return blockContentElements.flatMap((blockContentElement) => {
    const annotatedElement = blockContentElement.closest<HTMLElement>("[data-block-id]");
    if (!annotatedElement || !range.intersectsNode(blockContentElement)) {
      return [];
    }

    const segmentRange = range.cloneRange();
    segmentRange.selectNodeContents(blockContentElement);

    if (containsNode(blockContentElement, range.startContainer)) {
      segmentRange.setStart(range.startContainer, range.startOffset);
    }

    if (containsNode(blockContentElement, range.endContainer)) {
      segmentRange.setEnd(range.endContainer, range.endOffset);
    }

    const segmentText = segmentRange.toString();
    if (!segmentText.trim()) {
      return [];
    }

    const prefixRange = document.createRange();
    prefixRange.selectNodeContents(blockContentElement);
    prefixRange.setEnd(segmentRange.startContainer, segmentRange.startOffset);
    const startOffset = prefixRange.toString().length;

    return [
      {
        blockId: annotatedElement.dataset.blockId ?? "unknown-block",
        startOffset,
        endOffset: startOffset + segmentText.length,
        selectedText: segmentText,
        startLine: Number(annotatedElement.dataset.startLine) || undefined,
        endLine: Number(annotatedElement.dataset.endLine) || undefined,
      },
    ];
  });
}

/**
 * getSelectionAnchors를 root ref에 묶은 헬퍼 훅. capture()는 호출 시점의
 * 선택 영역을 anchor 배열로 반환한다(없으면 빈 배열).
 */
export function useSelectionAnchors(rootRef: RefObject<HTMLElement | null>) {
  const capture = useCallback(() => getSelectionAnchors(rootRef.current), [rootRef]);
  return { capture };
}
