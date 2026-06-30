export type DiffLine = {
  content: string;
  newLineNumber?: number;
  oldLineNumber?: number;
};

export function parseHunkHeader(line: string) {
  const match = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);

  if (!match) {
    return null;
  }

  return {
    oldLineNumber: Number.parseInt(match[1], 10),
    newLineNumber: Number.parseInt(match[2], 10),
  };
}

/** Unified diff 텍스트를 줄 단위로 파싱하고 각 줄의 old/new 라인 번호를 계산한다. */
export function parseDiffLines(content: string): DiffLine[] {
  const lines = content ? content.split("\n") : ["No text diff available."];
  let oldLineNumber = 0;
  let newLineNumber = 0;

  return lines.map((line) => {
    const hunk = parseHunkHeader(line);

    if (hunk) {
      oldLineNumber = hunk.oldLineNumber;
      newLineNumber = hunk.newLineNumber;
      return { content: line };
    }

    if (line.startsWith("+++") || line.startsWith("---")) {
      return { content: line };
    }

    if (line.startsWith("+")) {
      const currentNewLineNumber = newLineNumber;
      newLineNumber += 1;

      return {
        content: line,
        newLineNumber: currentNewLineNumber,
      };
    }

    if (line.startsWith("-")) {
      const currentOldLineNumber = oldLineNumber;
      oldLineNumber += 1;

      return {
        content: line,
        oldLineNumber: currentOldLineNumber,
      };
    }

    if (
      line.startsWith("diff --git") ||
      line.startsWith("index ") ||
      line.startsWith("new file mode ") ||
      line.startsWith("deleted file mode ")
    ) {
      return { content: line };
    }

    const currentOldLineNumber = oldLineNumber;
    const currentNewLineNumber = newLineNumber;
    oldLineNumber += 1;
    newLineNumber += 1;

    return {
      content: line,
      oldLineNumber: currentOldLineNumber,
      newLineNumber: currentNewLineNumber,
    };
  });
}
