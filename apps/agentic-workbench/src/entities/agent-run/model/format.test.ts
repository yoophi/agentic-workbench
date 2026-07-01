import { describe, expect, it } from "vitest";

import { appendOneTimelineItem, toTimelineItem } from "@/entities/agent-run/model/format";

describe("run event formatting", () => {
  it("shows Ralph loop iteration number and status", () => {
    const item = toTimelineItem("run-1", {
      type: "ralphLoop",
      iteration: 2,
      maxIterations: 5,
      status: "completed",
    });

    expect(item.group).toBe("lifecycle");
    expect(item.title).toBe("Ralph loop 2/5");
    expect(item.body).toBe("iteration 2/5: completed");
    expect(item.tone).toBe("success");
  });

  it("preserves tool file changes when a completion update has no file changes", () => {
    const started = toTimelineItem("run-1", {
      type: "tool",
      toolCallId: "tool-1",
      status: "in_progress",
      title: "Edit file",
      locations: ["src/app.ts"],
      fileChanges: [
        {
          path: "src/app.ts",
          oldPath: null,
          kind: "modified",
          status: "inProgress",
          diff: "@@ -1 +1 @@\n-old\n+new",
          content: null,
          binary: false,
          truncated: false,
          message: null,
        },
      ],
    });
    const completed = toTimelineItem("run-1", {
      type: "tool",
      toolCallId: "tool-1",
      status: "completed",
      title: "",
      locations: [],
    });

    const [merged] = appendOneTimelineItem([started], completed);

    expect(merged.event.type).toBe("tool");
    if (merged.event.type !== "tool") {
      return;
    }
    expect(merged.event.fileChanges).toHaveLength(1);
    expect(merged.event.fileChanges?.[0]).toMatchObject({
      path: "src/app.ts",
      status: "completed",
    });
  });

  it("replaces matching tool file changes during merge", () => {
    const initial = toTimelineItem("run-1", {
      type: "tool",
      toolCallId: "tool-1",
      status: "in_progress",
      title: "Write file",
      locations: ["src/app.ts"],
      fileChanges: [
        {
          path: "src/app.ts",
          oldPath: null,
          kind: "modified",
          status: "inProgress",
          diff: "@@ -1 +1 @@\n-old\n+new",
          content: null,
          binary: false,
          truncated: false,
          message: null,
        },
      ],
    });
    const update = toTimelineItem("run-1", {
      type: "tool",
      toolCallId: "tool-1",
      status: "completed",
      title: "Write file",
      locations: ["src/app.ts"],
      fileChanges: [
        {
          path: "src/app.ts",
          oldPath: null,
          kind: "modified",
          status: "completed",
          diff: "@@ -1 +1,2 @@\n old\n+new",
          content: null,
          binary: false,
          truncated: false,
          message: null,
        },
        {
          path: "src/other.ts",
          oldPath: null,
          kind: "added",
          status: "completed",
          diff: null,
          content: "export {};\n",
          binary: false,
          truncated: false,
          message: null,
        },
      ],
    });

    const [merged] = appendOneTimelineItem([initial], update);

    expect(merged.event.type).toBe("tool");
    if (merged.event.type !== "tool") {
      return;
    }
    expect(merged.event.fileChanges).toHaveLength(2);
    expect(merged.event.fileChanges?.[0].diff).toContain("+new");
    expect(merged.event.fileChanges?.[1]).toMatchObject({ path: "src/other.ts", kind: "added" });
  });

  it("does not overwrite unavailable file change status on later tool completion", () => {
    const initial = toTimelineItem("run-1", {
      type: "tool",
      toolCallId: "tool-1",
      status: "in_progress",
      title: "Write binary",
      locations: ["asset.bin"],
      fileChanges: [
        {
          path: "asset.bin",
          oldPath: null,
          kind: "modified",
          status: "unavailable",
          diff: null,
          content: null,
          binary: true,
          truncated: false,
          message: "Binary content cannot be displayed.",
        },
      ],
    });
    const completed = toTimelineItem("run-1", {
      type: "tool",
      toolCallId: "tool-1",
      status: "completed",
      title: "",
      locations: [],
    });

    const [merged] = appendOneTimelineItem([initial], completed);

    expect(merged.event.type).toBe("tool");
    if (merged.event.type !== "tool") {
      return;
    }
    expect(merged.event.fileChanges?.[0].status).toBe("unavailable");
  });

  it("deduplicates tool locations while merging updates", () => {
    const initial = toTimelineItem("run-1", {
      type: "tool",
      toolCallId: "tool-1",
      status: "in_progress",
      title: "Edit file",
      locations: ["src/app.ts", "src/app.ts"],
    });
    const update = toTimelineItem("run-1", {
      type: "tool",
      toolCallId: "tool-1",
      status: "completed",
      title: "Edit file",
      locations: ["src/app.ts", "src/app.ts"],
    });

    const [merged] = appendOneTimelineItem([initial], update);

    expect(merged.event.type).toBe("tool");
    if (merged.event.type !== "tool") {
      return;
    }
    expect(merged.event.locations).toEqual(["src/app.ts"]);
  });
});
