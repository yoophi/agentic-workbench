/** Unified diff 한 줄의 종류에 따른 Tailwind 색상 클래스. */
export function diffLineClassName(line: string) {
  if (line.startsWith("+++") || line.startsWith("---")) {
    return "bg-muted/70 text-muted-foreground";
  }

  if (line.startsWith("@@")) {
    return "bg-blue-500/10 text-blue-700 dark:text-blue-300";
  }

  if (line.startsWith("+")) {
    return "bg-green-500/15 text-green-800 dark:text-green-200";
  }

  if (line.startsWith("-")) {
    return "bg-red-500/15 text-red-800 dark:text-red-200";
  }

  if (line.startsWith("diff --git") || line.startsWith("index ")) {
    return "bg-muted/40 text-muted-foreground";
  }

  return "text-foreground";
}

/**
 * 변경된 파일의 상태 코드(A/M/D/R/C…)에 따른 배지 색상 클래스.
 * A=added(green), M=modified(yellow), D=deleted(red), R=renamed(blue), C=copied(purple).
 */
export function fileStatusClassName(status: string) {
  const normalizedStatus = status.charAt(0).toUpperCase();

  if (normalizedStatus === "A") {
    return "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300";
  }

  if (normalizedStatus === "M") {
    return "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300";
  }

  if (normalizedStatus === "D") {
    return "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300";
  }

  if (normalizedStatus === "R") {
    return "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300";
  }

  if (normalizedStatus === "C") {
    return "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300";
  }

  return "border-border bg-background text-muted-foreground";
}
