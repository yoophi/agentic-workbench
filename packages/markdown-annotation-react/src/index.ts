export { MarkdownViewer, type MarkdownViewerProps } from "./MarkdownViewer";
export {
  buildViewerAnnotationMaps,
  type ViewerAnnotationMaps,
} from "./build-viewer-annotation-maps";
export {
  getSelectionAnchors,
  getSelectionRects,
  useSelectionAnchors,
  type SelectionRect,
} from "./use-selection-anchors";
export { segmentTextByAnnotations, type TextSegment } from "./segment-text";
export type {
  MarkdownViewerBlockNote,
  MarkdownViewerComponents,
  MarkdownViewerInlineAnnotation,
  ViewerButtonProps,
  ViewerTooltipProps,
} from "./types";
