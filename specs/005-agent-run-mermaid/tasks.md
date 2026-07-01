# Tasks: Agent Run Mermaid Rendering

**Input**: Design documents from `specs/005-agent-run-mermaid/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/agent-run-mermaid-rendering.md, quickstart.md

**Tests**: Required. The feature spec requires representative verification for successful rendering, fallback, ordinary code preservation, streaming partial content, large diagram containment, and expanded modal behavior. Constitution-required checks also apply to pure helpers and shared package regressions.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **App frontend**: `apps/agentic-workbench/src/{app,pages,features,entities,shared,components/ui}`
- **Reusable TypeScript**: `packages/[package]/src`
- **Documentation**: `specs/005-agent-run-mermaid/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the existing shared Mermaid package surface and agent-run Markdown entry points before editing.

- [X] T001 Inspect existing Mermaid exports in `packages/markdown-annotation-core/src/index.ts` and `packages/markdown-annotation-react/src/index.ts`
- [X] T002 Inspect agent-run Markdown rendering usage in `apps/agentic-workbench/src/features/agent-run/ui/agent-run-panel.tsx`
- [X] T003 [P] Verify workbench imports shared Mermaid styles through `apps/agentic-workbench/src/index.css`
- [X] T004 [P] Verify no new Mermaid dependency is needed in `apps/agentic-workbench/package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create a testable agent-run Markdown boundary without changing user-visible behavior yet.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 Extract `normalizeStreamingMarkdown` and code language normalization helpers into `apps/agentic-workbench/src/features/agent-run/model/agent-run-markdown.ts`
- [X] T006 Create behavior-preserving tests for unmatched fence normalization and language extraction in `apps/agentic-workbench/src/features/agent-run/model/agent-run-markdown.test.ts`
- [X] T007 Move the existing `StreamingMarkdown` renderer into `apps/agentic-workbench/src/features/agent-run/ui/agent-run-markdown.tsx`
- [X] T008 Update `apps/agentic-workbench/src/features/agent-run/ui/agent-run-panel.tsx` to import and use `StreamingMarkdown` from `apps/agentic-workbench/src/features/agent-run/ui/agent-run-markdown.tsx`

**Checkpoint**: Agent-run Markdown rendering is isolated and existing behavior is preserved.

---

## Phase 3: User Story 1 - Agent output diagrams render inline (Priority: P1) MVP

**Goal**: Agent-run output renders `mermaid` fenced code blocks as Mermaid diagrams while preserving ordinary code blocks.

**Independent Test**: Render agent-run Markdown containing one valid `mermaid` fenced block and one ordinary code block; confirm only the Mermaid block uses diagram rendering and surrounding output remains visible.

### Tests for User Story 1

- [X] T009 [P] [US1] Add failing tests for Mermaid language marker detection and ordinary code preservation in `apps/agentic-workbench/src/features/agent-run/model/agent-run-markdown.test.ts`
- [X] T010 [P] [US1] Add failing renderer tests for valid Mermaid blocks, multiple Mermaid blocks, and ordinary code blocks in `apps/agentic-workbench/src/features/agent-run/ui/agent-run-markdown.test.tsx`

### Implementation for User Story 1

- [X] T011 [US1] Implement agent-run code block render kind detection using `detectMermaidBlock` in `apps/agentic-workbench/src/features/agent-run/model/agent-run-markdown.ts`
- [X] T012 [US1] Import `MermaidDiagram` and render Mermaid block code nodes in `apps/agentic-workbench/src/features/agent-run/ui/agent-run-markdown.tsx`
- [X] T013 [US1] Preserve existing inline code and non-Mermaid fenced code rendering in `apps/agentic-workbench/src/features/agent-run/ui/agent-run-markdown.tsx`
- [X] T014 [US1] Add an agent-run Mermaid success Storybook state in `apps/agentic-workbench/src/stories/organisms.stories.tsx`

**Checkpoint**: User Story 1 is fully functional and independently testable.

---

## Phase 4: User Story 2 - Rendering failures remain recoverable (Priority: P2)

**Goal**: Invalid, empty, or unrenderable Mermaid blocks fail inside the affected block and expose source or an understandable error state.

**Independent Test**: Render agent-run Markdown with one invalid Mermaid block, one valid Mermaid block, and surrounding text; confirm the invalid block shows fallback while the valid block and surrounding output remain visible.

### Tests for User Story 2

- [X] T015 [P] [US2] Add renderer tests for empty Mermaid source and malformed Mermaid fallback visibility in `apps/agentic-workbench/src/features/agent-run/ui/agent-run-markdown-fallback.test.tsx`
- [X] T016 [P] [US2] Add renderer tests proving one Mermaid failure does not hide ordinary Markdown or adjacent code blocks in `apps/agentic-workbench/src/features/agent-run/ui/agent-run-markdown-isolation.test.tsx`

### Implementation for User Story 2

- [X] T017 [US2] Ensure Mermaid fallback source/error state from the shared renderer is reachable in agent-run output in `apps/agentic-workbench/src/features/agent-run/ui/agent-run-markdown.tsx`
- [X] T018 [US2] Add agent-run wrapper classes for block-local fallback containment in `apps/agentic-workbench/src/features/agent-run/ui/agent-run-markdown.tsx`
- [X] T019 [US2] Add an agent-run Mermaid fallback Storybook state in `apps/agentic-workbench/src/stories/organisms.stories.tsx`

**Checkpoint**: User Stories 1 and 2 work independently.

---

## Phase 5: User Story 3 - Streaming and large diagrams stay stable (Priority: P3)

**Goal**: Streaming partial Mermaid and large diagrams do not break the agent-run layout and settle to rendered or fallback states when content completes.

**Independent Test**: Render partial streaming Mermaid content, then completed Mermaid content, and separately render a wide diagram; confirm no app error, no stale output, and contained overflow in the agent-run panel.

### Tests for User Story 3

- [X] T020 [P] [US3] Add streaming partial Mermaid normalization tests in `apps/agentic-workbench/src/features/agent-run/model/agent-run-markdown.test.ts`
- [X] T021 [P] [US3] Add renderer tests for source-update rerender identity and latest Mermaid source usage in `apps/agentic-workbench/src/features/agent-run/ui/agent-run-markdown.test.tsx`

### Implementation for User Story 3

- [X] T022 [US3] Generate stable per-block Mermaid ids from render order and source identity in `apps/agentic-workbench/src/features/agent-run/model/agent-run-markdown.ts`
- [X] T023 [US3] Pass stable block ids to `MermaidDiagram` for multiple and updating Mermaid blocks in `apps/agentic-workbench/src/features/agent-run/ui/agent-run-markdown.tsx`
- [X] T024 [US3] Add `min-w-0`, max-width, and overflow containment around Mermaid regions in `apps/agentic-workbench/src/features/agent-run/ui/agent-run-markdown.tsx`
- [X] T025 [US3] Add an agent-run large Mermaid diagram Storybook state in `apps/agentic-workbench/src/stories/organisms.stories.tsx`
- [X] T026 [US3] Add an agent-run streaming/incomplete Mermaid Storybook state in `apps/agentic-workbench/src/stories/organisms.stories.tsx`

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify package boundaries, regression coverage, and quickstart outcomes.

- [X] T027 [P] Run `pnpm --filter @yoophi/agentic-workbench test` and record outcome against `specs/005-agent-run-mermaid/quickstart.md`
- [X] T028 [P] Run `pnpm --filter @yoophi/agentic-workbench check-types` and record outcome against `specs/005-agent-run-mermaid/quickstart.md`
- [X] T029 [P] Run `pnpm --filter @yoophi/markdown-annotation-core test` and `pnpm --filter @yoophi/markdown-annotation-core check-types` if `packages/markdown-annotation-core/src` changed
- [X] T030 [P] Run `pnpm --filter @yoophi/markdown-annotation-react test` and `pnpm --filter @yoophi/markdown-annotation-react check-types` if `packages/markdown-annotation-react/src` changed
- [X] T031 Verify no app-to-app imports were introduced by searching `apps/agentic-workbench/src` for imports from `apps/markdown-annotator`
- [X] T032 Validate manual or Storybook scenarios for success, fallback, streaming, ordinary code, and large diagram containment using `specs/005-agent-run-mermaid/quickstart.md`

---

## Phase 7: User Story 3 Addendum - Full-screen Mermaid Modal

**Goal**: Rendered Mermaid diagrams can be opened from agent-run output in a full-screen-sized modal that fits the current viewport and returns cleanly to the same output context.

**Independent Test**: Render a valid wide Mermaid diagram, open it in expanded view, confirm the modal uses viewport-sized space with local overflow/navigation, then close it and confirm the original agent-run output remains visible.

### Tests for Full-screen Modal

- [ ] T033 [P] [US3] Add renderer tests for opening and closing Mermaid expanded view in `apps/agentic-workbench/src/features/agent-run/ui/agent-run-markdown-expanded.test.tsx`
- [ ] T034 [P] [US3] Add renderer tests that failed or empty Mermaid fallback states do not expose expanded view in `apps/agentic-workbench/src/features/agent-run/ui/agent-run-markdown-expanded-fallback.test.tsx`

### Implementation for Full-screen Modal

- [ ] T035 [US3] Add a reusable agent-run Mermaid expanded view control using `Button`, `Tooltip`, and `Dialog` primitives in `apps/agentic-workbench/src/features/agent-run/ui/agent-run-markdown.tsx`
- [ ] T036 [US3] Manage Mermaid expanded modal state and style the modal to use viewport-sized layout with local overflow in `apps/agentic-workbench/src/features/agent-run/ui/agent-run-markdown.tsx`
- [ ] T037 [US3] Add an expanded Mermaid modal Storybook state that shows the trigger and open modal behavior in `apps/agentic-workbench/src/stories/organisms.stories.tsx`
- [ ] T038 [US3] Re-run `pnpm --filter @yoophi/agentic-workbench test`, `pnpm --filter @yoophi/agentic-workbench check-types`, and `pnpm --filter @yoophi/agentic-workbench build-storybook`

**Checkpoint**: The expanded Mermaid modal requirement is implemented and independently verifiable.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational; MVP scope.
- **User Story 2 (Phase 4)**: Depends on Foundational and shared renderer availability; can be implemented after or alongside US1 but validates best after US1.
- **User Story 3 (Phase 5)**: Depends on Foundational; can be implemented after US1 branch selection exists.
- **Polish (Phase 6)**: Depends on desired user stories being complete.
- **Full-screen Mermaid Modal (Phase 7)**: Depends on US3 diagram rendering and containment behavior.

### User Story Dependencies

- **US1 (P1)**: No dependency on other user stories after Foundational.
- **US2 (P2)**: Uses the same Mermaid branch as US1; independently validates fallback behavior.
- **US3 (P3)**: Uses the same Mermaid branch as US1; independently validates streaming and containment.
- **US3 Addendum**: Extends US3 with full-screen modal viewing for successfully rendered diagrams.

### Within Each User Story

- Write tests before implementation.
- Model helper tests before UI renderer tests when both are needed.
- Pure detection/identity helpers before React renderer integration.
- Storybook states after functional behavior exists.
- Story complete before moving to the next priority when working sequentially.

## Parallel Opportunities

- T003 and T004 can run in parallel during Setup.
- T009 and T010 can run in parallel for US1.
- T020 and T021 can run in parallel for US3.
- T027, T028, T029, and T030 can run in parallel during final verification when their affected files are stable.
- T033 and T034 can run in parallel for the full-screen modal addendum.

## Parallel Example: User Story 1

```bash
Task: "T009 [P] [US1] Add failing tests for Mermaid language marker detection and ordinary code preservation in apps/agentic-workbench/src/features/agent-run/model/agent-run-markdown.test.ts"
Task: "T010 [P] [US1] Add failing renderer tests for valid Mermaid blocks, multiple Mermaid blocks, and ordinary code blocks in apps/agentic-workbench/src/features/agent-run/ui/agent-run-markdown.test.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "T015 [P] [US2] Add renderer tests for empty Mermaid source and malformed Mermaid fallback visibility in apps/agentic-workbench/src/features/agent-run/ui/agent-run-markdown-fallback.test.tsx"
Task: "T016 [P] [US2] Add renderer tests proving one Mermaid failure does not hide ordinary Markdown or adjacent code blocks in apps/agentic-workbench/src/features/agent-run/ui/agent-run-markdown-isolation.test.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "T020 [P] [US3] Add streaming partial Mermaid normalization tests in apps/agentic-workbench/src/features/agent-run/model/agent-run-markdown.test.ts"
Task: "T021 [P] [US3] Add renderer tests for source-update rerender identity and latest Mermaid source usage in apps/agentic-workbench/src/features/agent-run/ui/agent-run-markdown.test.tsx"
```

## Parallel Example: User Story 3 Addendum

```bash
Task: "T033 [P] [US3] Add renderer tests for opening and closing Mermaid expanded view in apps/agentic-workbench/src/features/agent-run/ui/agent-run-markdown-expanded.test.tsx"
Task: "T034 [P] [US3] Add renderer tests that failed or empty Mermaid fallback states do not expose expanded view in apps/agentic-workbench/src/features/agent-run/ui/agent-run-markdown-expanded-fallback.test.tsx"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational extraction.
3. Complete Phase 3: User Story 1.
4. Stop and validate with `pnpm --filter @yoophi/agentic-workbench test` and `pnpm --filter @yoophi/agentic-workbench check-types`.

### Incremental Delivery

1. Setup + Foundational: isolate agent-run Markdown rendering without behavior change.
2. US1: render valid Mermaid blocks while preserving ordinary code.
3. US2: add fallback verification and block-local containment for failures.
4. US3: add streaming and large diagram stability.
5. US3 Addendum: add expanded modal trigger, viewport-sized modal, fallback-state exclusion, and Storybook state.
6. Polish: run package/app checks and quickstart scenarios.

### Parallel Team Strategy

1. Complete Setup and Foundational together.
2. Once Foundational is done, split US1 tests and implementation between model/helper and UI renderer work.
3. US2 and US3 can then proceed in parallel because both extend the same renderer boundary but focus on different states.
4. The full-screen modal addendum can start after US3 containment is complete; T033 and T034 can be assigned separately before T035/T036 implementation.

## Notes

- [P] tasks use different files or can be completed without depending on incomplete task output.
- [US1], [US2], and [US3] labels map directly to spec.md user stories.
- Avoid changing `apps/agentic-workbench/src/components/ui/markdown.tsx` unless implementation discovers a separate consumer requirement; the scoped feature target is agent-run output.
- Avoid adding direct imports from another app. Reuse must go through `packages/*`.
