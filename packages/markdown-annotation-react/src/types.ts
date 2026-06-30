import type { ButtonHTMLAttributes, ComponentType, ReactElement, ReactNode } from "react";
import type { AnnotationType } from "@yoophi/markdown-annotation-core/types";

/**
 * Viewer 전용 inline annotation 표현. core의 AnnotationDraft에서 viewer 렌더에
 * 필요한 필드만 평탄화한 형태다(렌더 텍스트 offset 기준).
 */
export type MarkdownViewerInlineAnnotation = {
  id: string;
  comment: string;
  endOffset: number;
  startOffset: number;
  type: AnnotationType;
};

export type MarkdownViewerBlockNote = {
  id: string;
  comment: string;
};

/**
 * 주입되는 Button. MA(base-ui)·AW(radix) 양쪽 shadcn Button이 그대로 만족하는
 * 최소 계약이다(variant/size는 두 앱이 동일한 cva 토큰을 공유).
 */
export type ViewerButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
};

/**
 * 주입되는 Tooltip. trigger(children)와 content를 받는 통합 계약으로,
 * MA는 base-ui(`render`), AW는 radix(`asChild`) 어댑터로 각각 구현한다.
 * Tooltip 합성 API가 키트마다 다르므로 viewer는 이 계약에만 의존한다.
 */
export type ViewerTooltipProps = {
  content: ReactNode;
  align?: "start" | "center" | "end";
  children: ReactElement;
};

/**
 * 키트 비종속화를 위해 주입하는 UI primitive 모음.
 */
export type MarkdownViewerComponents = {
  Button: ComponentType<ViewerButtonProps>;
  Tooltip: ComponentType<ViewerTooltipProps>;
};
