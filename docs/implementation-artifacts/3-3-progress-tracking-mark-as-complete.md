# Story 3.3: Progress Tracking (Mark as Complete)

Status: done

## Story

As a student,
I want to mark a lesson as completed manually,
so that my overall course progress percentage updates immediately.

## Acceptance Criteria

1. **Given** I finish watching/reading a lesson (type `"video"` or `"text"`),
   **When** I click "Mark as Complete",
   **Then** a `user_progress` row is inserted for `(userId, lessonId)` in the database — or silently skipped if one already exists (idempotent).

2. **Given** the lesson is marked as complete,
   **When** the action succeeds,
   **Then** the progress bar in the sidebar immediately increases with a visual glow animation via **optimistic UI** (no page reload required),
   **And** the sidebar checkmark for this lesson appears,
   **And** a `sonner` toast displays "Lesson marked as complete!".

3. **Given** the lesson type is `"quiz"`,
   **When** the lesson page renders,
   **Then** the "Mark as Complete" button is **NOT rendered** (quiz completion is handled by Story 3.5).

4. **Given** the lesson is already marked as complete,
   **When** the "Mark as Complete" button renders,
   **Then** it displays a completed state (e.g., checkmark icon + "Completed" label, disabled) to indicate the lesson is already done.

5. **Given** the auto-navigation countdown from Story 3.2 is active,
   **When** the lesson is marked as complete,
   **Then** the auto-nav countdown fires normally after 3 seconds (the two features are independent).

## Tasks / Subtasks

- [x] **Add unique constraint migration** (AC: 1 — prerequisite for idempotent insert)
  - [x] Create a new Drizzle migration that adds a `UNIQUE (user_id, lesson_id)` constraint on the `user_progress` table
  - [x] Run `npm run db:push` or apply migration via `npm run db:migrate` to update the database
  - [x] Verify no existing duplicate rows before applying (if seeded data exists)

- [x] **Create Server Action `markLessonComplete`** (AC: 1, 2)
  - [x] Create `src/server/actions/progress/mark-lesson-complete.ts`
  - [x] Add `"use server"` directive at the top
  - [x] Import and call `getServerAuthSession()` — return `{ success: false, error: "Unauthorized." }` if no session
  - [x] Accept `(lessonId: number, courseSlug: string)` as arguments
  - [x] Validate `lessonId` is a positive integer (zod: `z.number().int().positive()`)
  - [x] Insert into `userProgress` using `db.insert(userProgress).values({ userId, lessonId }).onConflictDoNothing()`
  - [x] Call `revalidatePath(\`/courses/${courseSlug}/lessons/${lessonId}\`)` to trigger RSC re-render of sidebar data
  - [x] Return `ActionResponse<{ lessonId: number }>` — `{ success: true, data: { lessonId } }` on success
  - [x] Wrap DB insert in try/catch — return `{ success: false, error: "..." }` on unexpected error

- [x] **Create `MarkCompleteButton` Client Component** (AC: 1, 2, 3, 4)
  - [x] Create `src/components/student/mark-complete-button.tsx` as a Client Component (`'use client'`)
  - [x] Props: `lessonId: number`, `courseSlug: string`, `lessonType: string`, `isAlreadyCompleted: boolean`
  - [x] If `lessonType === 'quiz'`: return `null` (do NOT render)
  - [x] Use `useOptimistic` (React 19) to track optimistic completed state: `const [optimisticCompleted, setOptimisticCompleted] = useOptimistic(isAlreadyCompleted)`
  - [x] On click: call `startTransition` → `setOptimisticCompleted(true)` → invoke `markLessonComplete(lessonId, courseSlug)` Server Action
  - [x] On action success: call `toast.success("Lesson marked as complete!")` from `sonner`
  - [x] On action failure: revert optimistic state (React 19 handles this automatically when action throws/returns error) and call `toast.error(result.error)`
  - [x] Button states:
    - Idle (not completed): solid Indigo `bg-indigo-600 text-white`, label "Mark as Complete"
    - Optimistic/loading: show spinner + "Marking..." label, disabled
    - Completed (`optimisticCompleted === true`): `CheckCircle2` icon + "Completed" label, disabled, muted/success styling

- [x] **Integrate `MarkCompleteButton` into lesson page** (AC: 1, 2, 3, 4)
  - [x] In `src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx`:
    - Import `MarkCompleteButton` from `~/components/student/mark-complete-button`
    - Determine `isAlreadyCompleted`: check if `lesson.id` is in `completedLessonIds` array — `completedLessonIds.includes(lesson.id)`
    - Render `<MarkCompleteButton>` **after** the lesson content and **before** `<AutoNavCountdown>`, inside a sticky-bottom wrapper
    - Pass props: `lessonId={lesson.id}`, `courseSlug={slug}`, `lessonType={lesson.type}`, `isAlreadyCompleted={isAlreadyCompleted}`
  - [x] Sticky wrapper: `<div className="sticky bottom-0 py-4 bg-background/80 backdrop-blur-sm border-t border-border">` — ensures button is always visible without scrolling for long content

- [x] **Write unit tests for Server Action** (AC: 1)
  - [x] Create `src/server/actions/progress/mark-lesson-complete.test.ts` using `node:test`
  - [x] Test: unauthenticated call → returns `{ success: false, error: "Unauthorized." }`
  - [x] Test: invalid `lessonId` (0 or negative) → returns `{ success: false, error: ... }` (zod validation)
  - [x] Note: DB-layer tests not required (DB side of `onConflictDoNothing` is tested implicitly via integration)

## Dev Notes

### Critical Architecture Notes

- **`userProgress` has NO unique constraint yet** — the current `schema.ts` has no `UNIQUE (user_id, lesson_id)` constraint. `onConflictDoNothing()` requires this constraint to work correctly. **The migration task MUST be done first**. Without it, duplicate rows will be inserted silently.
- **Server Action pattern** — follow `update-profile.ts` exactly: `"use server"` directive, `getServerAuthSession()` auth guard, try/catch with `console.error`, return `ActionResponse<T>`. [Source: `src/server/actions/auth/update-profile.ts`]
- **`revalidatePath` triggers sidebar update automatically** — Story 3.2 already set up `getCourseSidebarData` in the RSC. When `revalidatePath` is called, Next.js re-fetches `getCourseSidebarData` server-side. The updated `completedLessonIds` and `progressPercent` flow through `LessonLayout` → `CourseSidebarNav` automatically. **Story 3.3 does NOT modify `CourseSidebarNav`, `LessonLayout`, or `lesson-navigation.ts`.**
- **Quiz lessons must NOT get the button** — `renderLessonContent` for `"quiz"` type renders a placeholder div. The button also guards itself via `if (lessonType === 'quiz') return null`. Double guard = safety.
- **`sonner` toast** — import `{ toast }` from `"sonner"`. The `<Toaster>` component is already rendered in the app layout from Story 3.1 setup (`src/components/ui/sonner.tsx` exists). No additional provider setup needed.
- **`useOptimistic` is React 19** — `project-e-course/package.json` has `react: "^19.0.0"`. Import `useOptimistic` directly from `"react"`. No polyfill needed.
- **No new shadcn installs needed** — all required UI components are already in `src/components/ui/`: `button`, `badge`, `sonner`. `lucide-react` icons (`CheckCircle2`, `Loader2`) are already installed.

### `onConflictDoNothing` Drizzle Syntax

```ts
await db.insert(userProgress).values({ userId, lessonId }).onConflictDoNothing();
```

This requires a UNIQUE constraint on `(user_id, lesson_id)` in PostgreSQL. The migration to add this:

```sql
ALTER TABLE "user_progress"
ADD CONSTRAINT "user_progress_user_id_lesson_id_unique"
UNIQUE ("user_id", "lesson_id");
```

In Drizzle schema, the table definition update:

```ts
export const userProgress = pgTable(
	'user_progress',
	{
		id: serial('id').primaryKey(),
		userId: text('user_id')
			.references(() => users.id, { onDelete: 'cascade' })
			.notNull(),
		lessonId: integer('lesson_id')
			.references(() => lessons.id, { onDelete: 'cascade' })
			.notNull(),
		completedAt: timestamp('completed_at').defaultNow().notNull(),
	},
	(t) => [unique('user_progress_user_id_lesson_id_unique').on(t.userId, t.lessonId)],
);
```

Import `unique` from `"drizzle-orm/pg-core"`.

### `useOptimistic` Pattern (React 19)

```tsx
'use client';
import { useOptimistic, useTransition } from 'react';
import { markLessonComplete } from '~/server/actions/progress/mark-lesson-complete';
import { toast } from 'sonner';

export function MarkCompleteButton({ lessonId, courseSlug, lessonType, isAlreadyCompleted }) {
	if (lessonType === 'quiz') return null;

	const [isPending, startTransition] = useTransition();
	const [optimisticCompleted, setOptimisticCompleted] = useOptimistic(isAlreadyCompleted);

	const handleClick = () => {
		startTransition(async () => {
			setOptimisticCompleted(true);
			const result = await markLessonComplete(lessonId, courseSlug);
			if (!result.success) {
				// useOptimistic auto-reverts on transition end when optimistic differs from real state
				toast.error(result.error);
			} else {
				toast.success('Lesson marked as complete!');
			}
		});
	};

	// render based on optimisticCompleted / isPending state
}
```

### Server Action Signature

```ts
// src/server/actions/progress/mark-lesson-complete.ts
"use server";

import { z } from "zod";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { userProgress } from "~/server/db/schema";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "~/types";

const schema = z.object({ lessonId: z.number().int().positive() });

export async function markLessonComplete(
  lessonId: number,
  courseSlug: string,
): Promise<ActionResponse<{ lessonId: number }>> { ... }
```

### Sticky Button Placement in `page.tsx`

The "Mark as Complete" button must be sticky at the bottom of the lesson content area for long content — students should not scroll up to find it. Place it inside a sticky wrapper after lesson content, before `AutoNavCountdown`:

```tsx
{/* After lesson content */}
<div className="sticky bottom-0 py-4 bg-background/80 backdrop-blur-sm border-t border-border">
  <MarkCompleteButton
    lessonId={lesson.id}
    courseSlug={slug}
    lessonType={lesson.type}
    isAlreadyCompleted={isAlreadyCompleted}
  />
</div>

<AutoNavCountdown
  key={lesson.id}
  nextLesson={adjacentLessons.nextLesson}
  courseSlug={slug}
  currentLessonType={lesson.type}
/>
```

### `isAlreadyCompleted` Derivation in RSC

`completedLessonIds` is already fetched as `number[]` from `getCourseSidebarData` in `page.tsx`. Derive `isAlreadyCompleted` as:

```ts
const isAlreadyCompleted = completedLessonIds.includes(lesson.id);
```

No new DB query needed — reuse the existing sidebar data.

### Project Structure Notes

- **All `src/` paths resolve to `project-e-course/src/`** — confirmed from Story 3.1 dev notes.
- **New files to create:**
  ```
  src/server/actions/progress/mark-lesson-complete.ts   — Server Action
  src/server/actions/progress/mark-lesson-complete.test.ts — node:test unit tests
  src/components/student/mark-complete-button.tsx        — Client Component
  ```
- **Files to modify:**
  ```
  src/server/db/schema.ts                                — Add unique constraint to userProgress table
  src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx — Add MarkCompleteButton + isAlreadyCompleted
  ```
- **Files to create (migration):**
  ```
  drizzle/migrations/<timestamp>_add_user_progress_unique_constraint.sql
  ```
- **Do NOT modify:**
  - `src/components/student/course-sidebar-nav.tsx` — Story 3.2 set up the data flow; revalidatePath handles refresh
  - `src/components/student/lesson-layout.tsx` — no changes needed
  - `src/components/student/auto-nav-countdown.tsx` — independent, no changes needed
  - `src/server/courses/lesson-navigation.ts` / `lesson-navigation.shared.ts` — read-only
  - `src/app/(student)/courses/[slug]/lessons/[lessonId]/page.helpers.ts` — stable, read-only

### Testing Requirements

- **Testing framework:** `node:test` (no Jest/Vitest). Run with `npm test` → `node --test`.
- **Unit tests for Server Action** — mock `getServerAuthSession` and `db`:
  - Unauthenticated → `{ success: false, error: "Unauthorized." }`
  - Invalid `lessonId` (0) → `{ success: false }` with zod error
  - Note: happy path (successful insert) is better verified via integration/manual testing
- **Manual verification checklist:**
  - [ ] Click "Mark as Complete" on a `video` lesson → button immediately shows "Completed" (optimistic), toast appears, sidebar checkmark + progress bar update after RSC re-render
  - [ ] Reload the lesson page → button renders in "Completed" (disabled) state
  - [ ] Click "Mark as Complete" a second time → no duplicate row inserted (check DB), no error
  - [ ] Navigate to a `quiz` lesson → "Mark as Complete" button is NOT visible
  - [ ] `AutoNavCountdown` still fires normally 3 seconds after page load regardless of complete state
  - [ ] On action failure (simulate network error) → toast shows error, button reverts to "Mark as Complete"

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 3, Story 3.3 (FR10, FR11, NFR-U3)]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — "Mark as Complete" flow, sticky button, glow animation, sonner toast, 3s auto-navigate after complete]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — Server Actions in `src/server/actions/[feature]/`, `ActionResponse<T>` type, no Redux/Zustand, URL params as state]
- [Source: `_bmad-output/implementation-artifacts/3-2-course-sidebar-and-auto-navigation.md` — RSC data flow for `completedLessonIds`, `revalidatePath` triggers sidebar update, `CourseSidebarNav` do-not-touch]
- [Source: `project-e-course/src/server/db/schema.ts` — `userProgress` table definition, no unique constraint currently]
- [Source: `project-e-course/src/server/actions/auth/update-profile.ts` — canonical Server Action pattern: `"use server"`, `getServerAuthSession`, try/catch, `ActionResponse<T>`, `revalidatePath`]
- [Source: `project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx` — current page structure, `completedLessonIds`, `renderLessonContent` quiz guard]
- [Source: `project-e-course/src/types/index.ts` — `ActionResponse<T>` type]

## Dev Agent Record

### Agent Model Used

github-copilot/claude-sonnet-4.6

### Debug Log References

- Verified duplicate safety before migration: `node` query against `user_progress` returned no duplicate `(user_id, lesson_id)` rows.
- Updated `project-e-course/src/server/db/schema.ts` to declare `user_progress_user_id_lesson_id_unique` on `(userId, lessonId)`.
- Generated Drizzle artifacts: `project-e-course/drizzle/0000_military_abomination.sql`, `project-e-course/drizzle/0001_real_aqueduct.sql`, `project-e-course/drizzle/meta/0000_snapshot.json`, `project-e-course/drizzle/meta/0001_snapshot.json`, `project-e-course/drizzle/meta/_journal.json`.
- `npm run db:migrate` failed because baseline table `account` already exists in the target database; applied schema change successfully with `npm run db:push` per story allowance.
- Verified database state via `information_schema.table_constraints`: `user_progress_user_id_lesson_id_unique` present.
- Added `project-e-course/src/server/actions/progress/mark-lesson-complete.ts` with auth guard, zod validation, idempotent insert, `revalidatePath`, and `ActionResponse<{ lessonId: number }>` contract.
- Extracted dependency-driven core logic to `project-e-course/src/server/actions/progress/mark-lesson-complete.shared.ts` so `node:test` can verify auth and validation paths without Next runtime imports.
- Added `project-e-course/src/server/actions/progress/mark-lesson-complete.test.ts` covering unauthorized and invalid `lessonId` failure paths.
- Added `project-e-course/src/components/student/mark-complete-button.tsx` with quiz guard, `useOptimistic`, transition-driven server action call, success/error `sonner` toasts, and idle/loading/completed button states.
- Added `project-e-course/src/components/student/mark-complete-button.test.ts` to lock client-component structure and optimistic UX contract.
- Updated `project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx` to derive `isAlreadyCompleted`, render `MarkCompleteButton` in the required sticky wrapper, and preserve `AutoNavCountdown` ordering.
- Added `project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/page.integration.test.ts` to verify sticky placement and prop wiring.
- Explicitly satisfied the workflow's standalone server-action test task using the already-created `mark-lesson-complete.test.ts` cases for unauthenticated and invalid-input paths.

### Completion Notes List

- Completed AC1 prerequisite by enforcing unique `(user_id, lesson_id)` at schema + database level for idempotent progress inserts.
- Validation run after task: `npm test` ✅ (46/46), `npm run check` ✅.
- Implemented `markLessonComplete` server action for AC1/AC2 with idempotent `onConflictDoNothing()` insert and sidebar refresh via `revalidatePath`.
- Added unit coverage for unauthorized access and invalid `lessonId`; validation run after task: `npm test` ✅ (48/48), `npm run check` ✅.
- Implemented `MarkCompleteButton` client UX for AC2–AC4 including optimistic completion state, spinner, completed badge styling, and quiz suppression.
- Added component contract tests; validation run after task: `npm test` ✅ (50/50), `npm run check` ✅.
- Integrated the completion CTA into the lesson page between content and auto-navigation, reusing existing `completedLessonIds` data without extra queries.
- Added page integration coverage; validation run after task: `npm test` ✅ (51/51), `npm run check` ✅.
- Server action unit-test step required no additional source changes because the mandated test file and scenarios were already present and passing.

### File List

- project-e-course/drizzle/0000_military_abomination.sql
- project-e-course/drizzle/0001_real_aqueduct.sql
- project-e-course/drizzle/meta/0000_snapshot.json
- project-e-course/drizzle/meta/0001_snapshot.json
- project-e-course/drizzle/meta/\_journal.json
- project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/page.integration.test.ts
- project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx
- project-e-course/src/components/student/mark-complete-button.test.ts
- project-e-course/src/components/student/mark-complete-button.tsx
- project-e-course/src/server/actions/progress/mark-lesson-complete.shared.ts
- project-e-course/src/server/actions/progress/mark-lesson-complete.test.ts
- project-e-course/src/server/actions/progress/mark-lesson-complete.ts
- project-e-course/src/server/db/schema.ts
