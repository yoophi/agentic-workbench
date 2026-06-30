import { describe, expect, it } from "vitest";

import type { GitCommitFileChange } from "@yoophi/git-graph";

import { buildFileTreeRows, getFileFolderPaths } from "./file-tree";

function file(path: string, status = "M"): GitCommitFileChange {
  return { path, status } as GitCommitFileChange;
}

describe("buildFileTreeRows", () => {
  it("nests files under folders and compresses single-child chains", () => {
    const files = [file("src/app/main.ts"), file("src/app/util.ts"), file("README.md")];
    const expanded = getFileFolderPaths(files);

    const rows = buildFileTreeRows(files, expanded);

    // "src/app" 체인은 하나의 폴더 행으로 압축된다.
    const folderRows = rows.filter((row) => row.type === "folder");
    expect(folderRows).toHaveLength(1);
    expect(folderRows[0]).toMatchObject({ name: "src/app", path: "src/app" });

    const fileRows = rows.filter((row) => row.type === "file");
    expect(fileRows.map((row) => row.name)).toEqual(["main.ts", "util.ts", "README.md"]);
  });

  it("hides files under collapsed folders", () => {
    const files = [file("src/a.ts"), file("docs/b.md")];

    const rows = buildFileTreeRows(files, new Set());

    expect(rows.every((row) => row.type === "folder")).toBe(true);
    expect(rows).toHaveLength(2);
  });
});
