# Tasks: Mermaid Diagram Rendering

**Input**: Design documents from `specs/004-mermaid-diagram-rendering/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/markdown-viewer-mermaid.md, quickstart.md

**Tests**: Required. This feature changes shared parser/viewer behavior in `packages/*`, so constitution-required unit, fixture, and consumer verification tasks are included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare dependency and package boundaries before feature work

- [ ] T001 Add the Mermaid renderer dependency to `packages/markdown-annotation-react/package.json` and update `pnpm-lock.yaml`
- [ ] T002 [P] Review current Markdown viewer exports and app adapters in `packages/markdown-annotation-react/src/index.ts`, `apps/markdown-annotator/src/shared/ui/markdown-viewer-components.tsx`, and `apps/agentic-workbench/src/features/worktree-workspace/ui/markdown-viewer-components.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared core model and detection behavior that MUST be complete before any user story

**CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T003 [P] Add optional Mermaid metadata types to `packages/markdown-annotation-core/src/types/markdown-block.ts`
- [ ] T004 [P] Create failing fixture tests for language-marker and priority start token detection in `packages/markdown-annotation-core/src/mermaid/detect-mermaid-block.test.ts`
- [ ] T005 Implement priority start token detection helper in `packages/markdown-annotation-core/src/mermaid/detect-mermaid-block.ts`
- [ ] T006 Export Mermaid detection helper and types from `packages/markdown-annotation-core/src/index.ts` and `packages/markdown-annotation-core/src/types/index.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Mermaid blocks render as diagrams (Priority: P1) MVP

**Goal**: Mermaid fenced blocks and fenced blocks starting with priority Mermaid tokens render as diagrams while ordinary code blocks remain unchanged.

**Independent Test**: Open or render Markdown containing a valid Mermaid block and an ordinary code block; only the Mermaid block appears as a diagram.

### Tests for User Story 1

- [ ] T007 [P] [US1] Add parser fixture tests for `mermaid` language markers, priority start tokens, and non-Mermaid code blocks in `packages/markdown-annotation-core/src/parse/parse-markdown-to-blocks.test.ts`
- [ ] T008 [P] [US1] Add shared viewer tests with mocked Mermaid rendering for valid diagrams and ordinary code preservation in `packages/markdown-annotation-react/src/MermaidDiagram.test.tsx`

### Implementation for User Story 1

- [ ] T009 [US1] Attach Mermaid metadata while preserving `type: "code"` in `packages/markdown-annotation-core/src/parse/parse-markdown-to-blocks.ts`
- [ ] T010 [US1] Create lazy Mermaid rendering component with `startOnLoad: false` and strict security defaults in `packages/markdown-annotation-react/src/MermaidDiagram.tsx`
- [ ] T011 [US1] Render Mermaid code blocks through the new diagram component in `packages/markdown-annotation-react/src/MarkdownViewer.tsx`
- [ ] T012 [US1] Add contained diagram styling and ordinary code block preservation styles in `packages/markdown-annotation-react/src/styles.css`
- [ ] T013 [P] [US1] Add Mermaid success Storybook state to `apps/markdown-annotator/src/stories/molecules/MarkdownViewer.stories.tsx`

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Failed Mermaid rendering remains inspectable (Priority: P2)

**Goal**: Mermaid render failures are isolated to the affected block and display source plus a readable failure reason.

**Independent Test**: Render Markdown containing invalid Mermaid syntax; the affected block shows fallback with original source and failure reason while the rest of the document remains readable.

### Tests for User Story 2

- [ ] T014 [P] [US2] Add shared viewer tests for empty source, syntax/parse failure, and renderer/runtime failure categories in `packages/markdown-annotation-react/src/MermaidDiagram.test.tsx`
- [ ] T015 [P] [US2] Add contract-oriented fallback assertions for source visibility and block-local isolation in `packages/markdown-annotation-react/src/MarkdownViewer.test.tsx`

### Implementation for User Story 2

- [ ] T016 [US2] Add failure category and readable failure reason mapping in `packages/markdown-annotation-react/src/MermaidDiagram.tsx`
- [ ] T017 [US2] Add block-local fallback panel that shows failure reason and original Mermaid source in `packages/markdown-annotation-react/src/MermaidDiagram.tsx`
- [ ] T018 [US2] Style fallback, source panel, and long error text containment in `packages/markdown-annotation-react/src/styles.css`
- [ ] T019 [P] [US2] Add Mermaid failure fallback Storybook state to `apps/markdown-annotator/src/stories/molecules/MarkdownViewer.stories.tsx`

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Annotation and reload workflows remain intact (Priority: P3)

**Goal**: Existing annotation, text selection, large diagram containment, and auto reload flows continue to work with Mermaid diagrams.

**Independent Test**: Use a Markdown document with Mermaid diagrams and surrounding text; verify selection/annotation still works and changed Mermaid source updates after auto reload.

### Tests for User Story 3

- [ ] T020 [P] [US3] Add viewer regression tests for block shell data attributes and block actions on Mermaid blocks in `packages/markdown-annotation-react/src/MarkdownViewer.test.tsx`
- [ ] T021 [P] [US3] Extend auto reload integration coverage for Mermaid source updates in `apps/markdown-annotator/src/pages/annotator/annotator-auto-reload.test.tsx`

### Implementation for User Story 3

- [ ] T022 [US3] Ensure Mermaid blocks keep `data-block-id`, line range attributes, note controls, and block action controls in `packages/markdown-annotation-react/src/MarkdownViewer.tsx`
- [ ] T023 [US3] Re-render diagrams when block source changes by keying render state from block id and source hash in `packages/markdown-annotation-react/src/MermaidDiagram.tsx`
- [ ] T024 [US3] Add large diagram overflow containment to `packages/markdown-annotation-react/src/styles.css`
- [ ] T025 [P] [US3] Add large Mermaid diagram Storybook state to `apps/markdown-annotator/src/stories/molecules/MarkdownViewer.stories.tsx`
- [ ] T026 [P] [US3] Verify agentic workbench Markdown viewer adapter needs no app-shell coupling changes in `apps/agentic-workbench/src/features/worktree-workspace/ui/markdown-viewer-components.tsx`

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification, cleanup, and cross-app safety checks

- [ ] T027 [P] Run shared core tests with `pnpm --filter @yoophi/markdown-annotation-core test`
- [ ] T028 [P] Run shared React package tests and type checks with `pnpm --filter @yoophi/markdown-annotation-react test` and `pnpm --filter @yoophi/markdown-annotation-react check-types`
- [ ] T029 [P] Run markdown annotator tests, type checks, and Storybook build with `pnpm --filter @yoophi/markdown-annotator test`, `pnpm --filter @yoophi/markdown-annotator check-types`, and `pnpm --filter @yoophi/markdown-annotator build-storybook`
- [ ] T030 [P] Run agentic workbench consumer tests and type checks with `pnpm --filter @yoophi/agentic-workbench test` and `pnpm --filter @yoophi/agentic-workbench check-types`
- [ ] T031 Verify no app-to-app imports were introduced by searching `apps/markdown-annotator/src` and `apps/agentic-workbench/src`
- [ ] T032 Validate the manual smoke scenario in `specs/004-mermaid-diagram-rendering/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational completion.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Phase 2 and is the MVP.
- **User Story 2 (P2)**: Starts after Phase 2; can be developed after or alongside US1, but final fallback UI depends on `MermaidDiagram.tsx` from US1.
- **User Story 3 (P3)**: Starts after Phase 2; reload and annotation regression checks depend on the shared viewer paths touched by US1 and US2.

### Within Each User Story

- Write constitution-required tests first and confirm they fail before implementation.
- Shared core detection before shared React rendering.
- Rendering component before app Storybook states.
- Storybook visual states after shared package behavior is available.

## Parallel Opportunities

- T002 can run in parallel with T001.
- T003 and T004 can run in parallel during the foundational phase.
- T007 and T008 can run in parallel for US1.
- T014 and T015 can run in parallel for US2.
- T020 and T021 can run in parallel for US3.
- T027 through T030 can run in parallel after implementation.

## Parallel Example: User Story 1

```bash
Task: "T007 [P] [US1] Add parser fixture tests for Mermaid detection in packages/markdown-annotation-core/src/parse/parse-markdown-to-blocks.test.ts"
Task: "T008 [P] [US1] Add shared viewer tests with mocked Mermaid rendering in packages/markdown-annotation-react/src/MermaidDiagram.test.tsx"
Task: "T013 [P] [US1] Add Mermaid success Storybook state to apps/markdown-annotator/src/stories/molecules/MarkdownViewer.stories.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "T014 [P] [US2] Add failure category tests in packages/markdown-annotation-react/src/MermaidDiagram.test.tsx"
Task: "T015 [P] [US2] Add fallback isolation tests in packages/markdown-annotation-react/src/MarkdownViewer.test.tsx"
Task: "T019 [P] [US2] Add Mermaid failure fallback Storybook state to apps/markdown-annotator/src/stories/molecules/MarkdownViewer.stories.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "T020 [P] [US3] Add block shell regression tests in packages/markdown-annotation-react/src/MarkdownViewer.test.tsx"
Task: "T021 [P] [US3] Extend auto reload integration coverage in apps/markdown-annotator/src/pages/annotator/annotator-auto-reload.test.tsx"
Task: "T025 [P] [US3] Add large Mermaid diagram Storybook state to apps/markdown-annotator/src/stories/molecules/MarkdownViewer.stories.tsx"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 shared core detection.
3. Complete Phase 3 Mermaid success rendering.
4. Stop and validate with `pnpm --filter @yoophi/markdown-annotation-core test`, `pnpm --filter @yoophi/markdown-annotation-react test`, and the MarkdownViewer Storybook success state.

### Incremental Delivery

1. Add US1 to render valid Mermaid diagrams without changing ordinary code blocks.
2. Add US2 to provide block-local failure reasons and source inspection.
3. Add US3 to harden annotation, reload, and large diagram behavior.
4. Run the full quickstart validation after all selected stories are complete.

### Parallel Team Strategy

1. One developer handles shared core detection in `packages/markdown-annotation-core`.
2. One developer handles shared React rendering/fallback in `packages/markdown-annotation-react`.
3. One developer handles Storybook and app consumer verification in `apps/markdown-annotator` and `apps/agentic-workbench`.

## Notes

- All user-story tasks include `[US1]`, `[US2]`, or `[US3]` labels.
- `[P]` tasks touch different files or are validation commands and can run without depending on incomplete same-file edits.
- Shared package changes require both package-level verification and consuming app verification.
