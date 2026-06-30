import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind 클래스 병합 헬퍼 (조건부 클래스 + 충돌 정리). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
