import {
  sampleAppInfo,
  sampleBranches,
  sampleCommitDetail,
  sampleCommitGraph,
  sampleFileDiffs,
  sampleHistory,
  sampleRepositories,
  sampleWorktrees,
} from "../../src/shared/storybook/sample-data";
import type { Repository } from "../../src/entities/repository";

let storybookRepositories: Repository[] = [...sampleRepositories];

export async function invoke<T>(command: string, args?: Record<string, unknown>) {
  switch (command) {
    case "app_info":
      return sampleAppInfo as T;
    case "list_repositories":
      return storybookRepositories as T;
    case "create_repository": {
      const request = args?.request as { path?: string } | undefined;
      const path = request?.path ?? "/Users/yoophi/project/tauri-git-explorer";
      const repository = {
        id: `storybook-repository-${storybookRepositories.length + 1}`,
        name: path.split("/").filter(Boolean).at(-1) ?? "repository",
        path,
      };
      storybookRepositories = [...storybookRepositories, repository];
      return repository as T;
    }
    case "rename_repository": {
      const request = args?.request as { repositoryId?: string; name?: string } | undefined;
      const repositoryId = request?.repositoryId ?? "";
      const renamedRepository = storybookRepositories.find(
        (repository) => repository.id === repositoryId,
      );

      if (!renamedRepository) {
        throw new Error(`Repository not found: ${repositoryId}`);
      }

      const nextRepository = {
        ...renamedRepository,
        name: request?.name ?? renamedRepository.name,
      };
      storybookRepositories = storybookRepositories.map((repository) =>
        repository.id === repositoryId ? nextRepository : repository,
      );
      return nextRepository as T;
    }
    case "delete_repository": {
      const request = args?.request as { repositoryId?: string } | undefined;
      storybookRepositories = storybookRepositories.filter(
        (repository) => repository.id !== request?.repositoryId,
      );
      return undefined as T;
    }
    case "list_worktrees":
      return sampleWorktrees as T;
    case "list_branches":
      return sampleBranches as T;
    case "list_history":
      return sampleHistory as T;
    case "get_commit_graph":
      return sampleCommitGraph as T;
    case "get_commit_detail":
      return sampleCommitDetail as T;
    case "get_file_diff": {
      const request = args?.request as { filePath?: string } | undefined;
      return (sampleFileDiffs[request?.filePath ?? ""] ?? sampleFileDiffs.default) as T;
    }
    case "start_repository_watchers":
    case "stop_repository_watchers":
      return undefined as T;
    default:
      throw new Error(`Unhandled Storybook Tauri command: ${command}`);
  }
}
