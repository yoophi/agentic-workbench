import type { GitCommitFileChange } from "@yoophi/git-graph";

export type FileTreeFolderNode = {
  files: GitCommitFileChange[];
  folders: Map<string, FileTreeFolderNode>;
  name: string;
  path: string;
};

export type FileTreeRow =
  | {
      depth: number;
      id: string;
      isExpanded: boolean;
      name: string;
      path: string;
      type: "folder";
    }
  | {
      depth: number;
      file: GitCommitFileChange;
      id: string;
      name: string;
      type: "file";
    };

/** 변경 파일들이 속한 모든 폴더 경로 집합(트리 펼침 기본값 계산용). */
export function getFileFolderPaths(files: GitCommitFileChange[]) {
  const folders = new Set<string>();

  for (const file of files) {
    const segments = file.path.split("/").filter(Boolean);
    let folderPath = "";

    for (const segment of segments.slice(0, -1)) {
      folderPath = folderPath ? `${folderPath}/${segment}` : segment;
      folders.add(folderPath);
    }
  }

  return folders;
}

function createFileTreeFolderNode(name: string, path: string): FileTreeFolderNode {
  return {
    files: [],
    folders: new Map(),
    name,
    path,
  };
}

export function buildFileTree(files: GitCommitFileChange[]) {
  const root = createFileTreeFolderNode("", "");

  for (const file of [...files].sort((a, b) => a.path.localeCompare(b.path))) {
    const segments = file.path.split("/").filter(Boolean);

    if (segments.length === 0) {
      continue;
    }

    let current = root;

    for (const segment of segments.slice(0, -1)) {
      const folderPath = current.path ? `${current.path}/${segment}` : segment;
      let child = current.folders.get(segment);

      if (!child) {
        child = createFileTreeFolderNode(segment, folderPath);
        current.folders.set(segment, child);
      }

      current = child;
    }

    current.files.push(file);
  }

  return root;
}

/** 파일 없이 단일 하위 폴더만 가진 폴더 체인을 "foo/bar"처럼 한 줄로 압축한다. */
function compressFileTreeFolder(node: FileTreeFolderNode) {
  const names = [node.name];
  let current = node;

  while (current.files.length === 0 && current.folders.size === 1) {
    const [next] = current.folders.values();

    if (!next) {
      break;
    }

    names.push(next.name);
    current = next;
  }

  return {
    name: names.join("/"),
    node: current,
  };
}

function appendFileTreeRows(
  node: FileTreeFolderNode,
  depth: number,
  expandedFolders: ReadonlySet<string>,
  rows: FileTreeRow[],
) {
  const folderNodes = [...node.folders.values()].sort((a, b) => a.name.localeCompare(b.name));

  for (const folderNode of folderNodes) {
    const compressedFolder = compressFileTreeFolder(folderNode);
    const isExpanded = expandedFolders.has(compressedFolder.node.path);

    rows.push({
      depth,
      id: `folder:${compressedFolder.node.path}`,
      isExpanded,
      name: compressedFolder.name,
      path: compressedFolder.node.path,
      type: "folder",
    });

    if (isExpanded) {
      appendFileTreeRows(compressedFolder.node, depth + 1, expandedFolders, rows);
    }
  }

  for (const file of [...node.files].sort((a, b) => a.path.localeCompare(b.path))) {
    const segments = file.path.split("/").filter(Boolean);

    rows.push({
      depth,
      file,
      id: `file:${file.status}:${file.path}`,
      name: segments[segments.length - 1] ?? file.path,
      type: "file",
    });
  }
}

/** 변경 파일 목록을 펼침 상태에 따라 평탄화된 트리 행 배열로 변환한다. */
export function buildFileTreeRows(
  files: GitCommitFileChange[],
  expandedFolders: ReadonlySet<string>,
): FileTreeRow[] {
  const rows: FileTreeRow[] = [];
  appendFileTreeRows(buildFileTree(files), 0, expandedFolders, rows);

  return rows;
}
