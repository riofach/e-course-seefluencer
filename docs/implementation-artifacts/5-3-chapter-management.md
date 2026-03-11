# Story 5.3: Chapter Management

Status: done

## Story

As an admin,
I want to create, reorder, and delete Chapters within a specific Course,
so that I can structure the learning material logically and control the chapter sequence.

## Acceptance Criteria

1. **Given** I am on the Course Editor page at `/admin/courses/[courseId]`
   **When** the page loads
   **Then** I see the "Chapters" section below the course form, listing all existing chapters in their correct order (FR22).

2. **Given** I am in the Chapters section
   **When** I click "Add Chapter"
   **Then** a new Chapter is created in the database with a title placeholder and appended to the bottom of the list with the next `order` value. The button shows a loading state while the action is pending.

3. **Given** I am viewing a Chapter row in the list
   **When** I click the inline title area and update it
   **Then** the title is auto-saved to the database (debounced 500ms, no Save button) (FR22).

4. **Given** I have multiple chapters
   **When** I drag a chapter row to a new position
   **Then** the `order` values of all affected chapters are updated in the database to reflect the new sequence (FR22).

5. **Given** I am viewing a Chapter row
   **When** I click the "Delete" button and confirm in the AlertDialog
   **Then** the chapter and all its child Lessons are deleted from the database (Cascade Delete) and the list refreshes.

6. **Given** any chapter creation or update operation completes successfully
   **When** in the background
   **Then** a non-blocking Toast notification appears (e.g., "Chapter saved") (NFR-U3).

7. **Given** no chapters exist for the course
   **When** the Chapters section loads
   **Then** an empty state with an illustration and "Add Chapter" CTA is shown (per UX spec empty state rules).

## Tasks / Subtasks

- [x] **Replace "Chapters placeholder" with real `ChapterList` component** (AC: 1, 7)
  - [x] Open `project-e-course/src/app/(admin)/admin/courses/[courseId]/page.tsx`
  - [x] Import `getChaptersByCourseId` from `~/server/queries/chapters`
  - [x] Fetch initial chapters server-side: `const chapters = await getChaptersByCourseId(course.id)`
  - [x] Replace the `border-dashed` placeholder `<div>` with `<ChapterList courseId={String(course.id)} initialChapters={chapters} />`

- [x] **Create `ChapterList` client component** (AC: 1, 2, 4, 5, 7)
  - [x] Create `project-e-course/src/components/admin/ChapterList.tsx` as `'use client'`
  - [x] Accept props: `courseId: string`, `initialChapters: ChapterRow[]`
  - [x] Manage local `chapters` state with `useState(initialChapters)`
  - [x] Manage `isCreating: boolean` state for Add Chapter loading state
  - [x] Render each chapter as a draggable row using `@hello-pangea/dnd` (`DragDropContext`, `Droppable`, `Draggable`)
  - [x] Each row: drag handle icon (`GripVertical`), inline-editable title (`ChapterTitleInput`), order badge, lesson count placeholder, Delete button
  - [x] On reorder drop: optimistic UI update → call `reorderChapters` server action → rollback on failure
  - [x] Show skeleton loader (3 rows) while `isCreating` is true after "Add Chapter" click
  - [x] Show empty state (illustration + "Add Chapter" CTA) when `chapters.length === 0`
  - [x] "Add Chapter" button at bottom of list calls `createChapter(courseId)` Server Action

- [x] **Create `ChapterTitleInput` inline-edit component** (AC: 3, 6)
  - [x] Create `project-e-course/src/components/admin/ChapterTitleInput.tsx` as `'use client'`
  - [x] Use `react-hook-form` + `@hookform/resolvers/zod` with `chapterUpdateSchema`
  - [x] Use `useRef` to track `lastSavedValueRef` — prevent double-save if value unchanged (mirrors `CourseEditForm` pattern exactly)
  - [x] Use `window.setTimeout` (not bare `setTimeout`) for debounce
  - [x] Use `form.getValues()` + `safeParse` before calling server action (mirrors `CourseEditForm` pattern)
  - [x] Show Toast `"Chapter saved"` on success; `"Save failed: ..."` on error
  - [x] On-blur validation: show inline red error message below input if title is empty

- [x] **Create Zod validation schemas for chapters** (AC: 3)
  - [x] Create `project-e-course/src/lib/validations/chapter.ts`
  - [x] `chapterCreateSchema`: `{ courseId: z.number().int().positive() }`
  - [x] `chapterUpdateSchema`: `{ title: z.string().min(1, "Title is required").max(255) }`
  - [x] Export inferred types: `ChapterUpdateInput`

- [x] **Create Chapter Server Actions — `index.ts` + `shared.ts` split** (AC: 2, 3, 4, 5)
  - [x] Create `project-e-course/src/server/actions/chapters/shared.ts` — pure business logic with injected dependencies (no direct DB/auth imports; testable in isolation)
  - [x] Create `project-e-course/src/server/actions/chapters/index.ts` — `"use server"` directive at top, wire real infra (db, auth, revalidatePath) to shared functions
  - [x] Implement in `shared.ts`: `createChapterWithDependencies`, `updateChapterWithDependencies`, `deleteChapterWithDependencies`, `reorderChaptersWithDependencies`
  - [x] Export from `index.ts`: `createChapter`, `updateChapter`, `deleteChapter`, `reorderChapters` (each calls corresponding `WithDependencies` function)
  - [x] `createChapter(courseId: string)` — calculates `order = max(existing) + 1`, inserts with title `"New Chapter"`, returns `{ chapterId: number }`
  - [x] `updateChapter(chapterId: string, data: ChapterUpdateInput)` — validates with `chapterUpdateSchema`, updates DB
  - [x] `deleteChapter(chapterId: string)` — deletes chapter (Cascade Delete handles lessons automatically)
  - [x] `reorderChapters(courseId: string, orderedIds: number[])` — wraps all updates in a single Drizzle transaction

- [x] **Create Chapter Server Actions test file** (AC: 2, 3, 4, 5)
  - [x] Create `project-e-course/src/server/actions/chapters/shared.test.ts`
  - [x] Use Node.js built-in `node:test` + `node:assert/strict` (same as `courses/shared.test.ts` pattern — NOT vitest)
  - [x] Test: unauthorized requests rejected for all actions
  - [x] Test: `createChapterWithDependencies` inserts with correct order and returns chapterId
  - [x] Test: `updateChapterWithDependencies` validates empty title and rejects
  - [x] Test: `deleteChapterWithDependencies` calls delete and revalidates paths
  - [x] Test: `reorderChaptersWithDependencies` calls update for each id in correct order

- [x] **Create database query functions for chapters — `chapters.ts` + `shared.ts` split** (AC: 1)
  - [x] Create `project-e-course/src/server/queries/chapters.shared.ts` — pure query functions with injected query dependency (testable in isolation)
  - [x] Create `project-e-course/src/server/queries/chapters.ts` — `import "server-only"` at top, wire real Drizzle db to shared functions
  - [x] `getChaptersByCourseId(courseId: number): Promise<ChapterRow[]>` — fetch chapters ordered by `order` ASC
  - [x] Export `ChapterRow` type from `chapters.shared.ts` (inferred from Drizzle schema)

- [x] **Create chapter queries test file**
  - [x] Create `project-e-course/src/server/queries/chapters.test.ts`
  - [x] Use Node.js built-in `node:test` + `node:assert/strict`
  - [x] Test: invalid courseId returns empty array
  - [x] Test: valid courseId calls query with parsed integer

- [x] **Install and configure drag-and-drop library** (AC: 4)
  - [x] Run `npm install @hello-pangea/dnd` in `project-e-course/` directory
  - [x] Library ships its own TypeScript types — no `@types/` package needed

- [x] **Create `ChapterList` component test file**
  - [x] Create `project-e-course/src/components/admin/ChapterList.test.tsx`
  - [x] Use vitest + `@testing-library/react` (same as `CourseEditForm.test.tsx`)
  - [x] Test: renders empty state when no chapters
  - [x] Test: renders chapter rows when chapters exist
  - [x] Test: "Add Chapter" button calls `createChapter` action

## Dev Notes

### 🔴 Critical: Physical Project Root

**ALL source files live under `project-e-course/`**. The `package.json` is at `project-e-course/package.json`. Always prefix all paths with `project-e-course/`. The outer `hiring-seefluencer/` directory is the monorepo shell.

### 🔴 Critical: Admin Zone Is ALWAYS Light Mode

Admin CMS does **NOT** use dark mode. Per UX spec: _"Admin: Pure SaaS minimal — white, 1px borders `#E5E7EB`, no decorations."_ Do **NOT** apply `dark:` Tailwind variants inside any admin component. Do **NOT** add `shadow-*` classes — use border-only design (Admin zone: `border-only tanpa shadow untuk kesan utility`).

### 🔴 Critical: Route Group for Admin Pages

Admin pages use the `(admin)` route group:

- File: `src/app/(admin)/admin/courses/[courseId]/page.tsx` → URL: `/admin/courses/[courseId]`

The `(admin)` directory and the course editor page **already exist** from Story 5.2. **DO NOT create a new route group or a new page file** — only edit the existing `[courseId]/page.tsx` to replace the placeholder with the real `ChapterList` component.

### 🔴 Critical: Actual Schema — `chapters` Table

The real `chapters` table in `project-e-course/src/server/db/schema.ts` is:

```ts
// project-e-course/src/server/db/schema.ts — ALREADY DEFINED, do NOT recreate
export const chapters = pgTable('chapters', {
	id: serial('id').primaryKey(),
	courseId: integer('course_id')
		.references(() => courses.id, { onDelete: 'cascade' })
		.notNull(),
	title: varchar('title', { length: 255 }).notNull(),
	description: text('description'),
	order: integer('order').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

**Key facts:**

- `id` is a `serial` (integer auto-increment) — **NOT** a UUID/cuid. Always use `number` type.
- `courseId` is an `integer` FK referencing `courses.id` (which is also `serial`/`integer`).
- `order` is a required `integer` — must be set on creation, cannot be null.
- **No `updatedAt` column** on chapters — do NOT try to set it.
- Cascade Delete configured: deleting a chapter automatically deletes all child `lessons`.

### 🔴 Critical: `courses.id` Is `serial` (Integer), Not UUID

When receiving `courseId` as URL param (string from `params`), always parse:

```ts
const parsedCourseId = Number(courseId);
if (!Number.isInteger(parsedCourseId) || parsedCourseId <= 0) {
	return { success: false, error: 'Invalid course id.' };
}
```

Use `Number()` + `Number.isInteger()` check — same pattern as `courses/shared.ts` `parseCourseId()`. Similarly for `chapterId`.

### 🔴 Critical: Server Actions File Architecture — `index.ts` + `shared.ts` Split

**This is the established codebase pattern** (see `courses/index.ts` + `courses/shared.ts`). Chapter actions MUST follow the same split:

```
src/server/actions/chapters/
├── shared.ts    ← Pure business logic, injected dependencies, no direct DB/auth imports
├── index.ts     ← "use server" directive, wires real infra, calls shared functions
└── shared.test.ts ← Tests against shared.ts only (no mocking of infra needed)
```

**Why this matters:** `shared.ts` functions accept a `deps` object instead of calling `db`/`auth` directly. This makes them 100% unit-testable without mocking Next.js internals.

**Pattern for `shared.ts`:**

```ts
// src/server/actions/chapters/shared.ts
import { chapterUpdateSchema, type ChapterUpdateInput } from '../../../lib/validations/chapter.ts';
import type { ActionResponse } from '../../../types/index.ts';

export type ChapterActionDependencies = {
	getSession: () => Promise<{ user?: { id?: string; role?: string } } | null>;
	insertChapter: (values: {
		courseId: number;
		title: string;
		order: number;
	}) => Promise<number | undefined>;
	updateChapter: (chapterId: number, data: { title: string }) => Promise<void>;
	deleteChapter: (chapterId: number) => Promise<void>;
	getMaxOrder: (courseId: number) => Promise<number | null>;
	updateChapterOrder: (chapterId: number, order: number) => Promise<void>;
	revalidatePaths: (paths: string[]) => void;
};

export async function createChapterWithDependencies(
	courseId: string,
	deps: ChapterActionDependencies,
): Promise<ActionResponse<{ chapterId: number }>> {
	const session = await deps.getSession();
	if (!session?.user?.id || session.user.role !== 'admin') {
		return { success: false, error: 'Unauthorized.' };
	}
	const parsedCourseId = Number(courseId);
	if (!Number.isInteger(parsedCourseId) || parsedCourseId <= 0) {
		return { success: false, error: 'Invalid course id.' };
	}
	try {
		const maxOrder = await deps.getMaxOrder(parsedCourseId);
		const nextOrder = (maxOrder ?? 0) + 1;
		const chapterId = await deps.insertChapter({
			courseId: parsedCourseId,
			title: 'New Chapter',
			order: nextOrder,
		});
		if (chapterId === undefined) return { success: false, error: 'Failed to create chapter.' };
		deps.revalidatePaths([`/admin/courses/${parsedCourseId}`]);
		return { success: true, data: { chapterId } };
	} catch (error) {
		console.error('Failed to create chapter', error);
		return { success: false, error: 'Failed to create chapter.' };
	}
}
// ... same pattern for updateChapter, deleteChapter, reorderChapters
```

**Pattern for `index.ts`:**

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { desc, eq } from 'drizzle-orm';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';
import { chapters } from '~/server/db/schema';
import type { ChapterUpdateInput } from '~/lib/validations/chapter';
import type { ActionResponse } from '~/types';
import {
	createChapterWithDependencies,
	updateChapterWithDependencies,
	deleteChapterWithDependencies,
	reorderChaptersWithDependencies,
} from './shared';

const dependencies = {
	getSession: getServerAuthSession,
	insertChapter: async (values: { courseId: number; title: string; order: number }) => {
		const result = await db.insert(chapters).values(values).returning({ id: chapters.id });
		return result[0]?.id;
	},
	updateChapter: async (chapterId: number, data: { title: string }) => {
		await db.update(chapters).set(data).where(eq(chapters.id, chapterId));
	},
	deleteChapter: async (chapterId: number) => {
		await db.delete(chapters).where(eq(chapters.id, chapterId));
	},
	getMaxOrder: async (courseId: number) => {
		const result = await db
			.select({ order: chapters.order })
			.from(chapters)
			.where(eq(chapters.courseId, courseId))
			.orderBy(desc(chapters.order))
			.limit(1);
		return result[0]?.order ?? null;
	},
	updateChapterOrder: async (chapterId: number, order: number) => {
		await db.update(chapters).set({ order }).where(eq(chapters.id, chapterId));
	},
	revalidatePaths: (paths: string[]) => {
		for (const path of paths) revalidatePath(path);
	},
};

export async function createChapter(
	courseId: string,
): Promise<ActionResponse<{ chapterId: number }>> {
	return createChapterWithDependencies(courseId, dependencies);
}
export async function updateChapter(
	chapterId: string,
	data: ChapterUpdateInput,
): Promise<ActionResponse<void>> {
	return updateChapterWithDependencies(chapterId, data, dependencies);
}
export async function deleteChapter(chapterId: string): Promise<ActionResponse<void>> {
	return deleteChapterWithDependencies(chapterId, dependencies);
}
export async function reorderChapters(
	courseId: string,
	orderedIds: number[],
): Promise<ActionResponse<void>> {
	return reorderChaptersWithDependencies(courseId, orderedIds, dependencies);
}
```

### 🔴 Critical: `reorderChapters` Must Use a Drizzle Transaction

The reorder action updates multiple rows — wrap in a single transaction to prevent partial failures:

```ts
// Inside reorderChaptersWithDependencies in shared.ts
// deps should have a runTransaction function for testability:
export type ChapterActionDependencies = {
  // ...
  runTransaction: (fn: (updates: Array<{ id: number; order: number }>) => Promise<void>) => Promise<void>;
};

// In index.ts dependencies:
runTransaction: async (fn) => {
  await db.transaction(async (tx) => {
    // fn receives the updates array
  });
},
```

Simpler alternative — loop with single `updateChapterOrder` calls (acceptable for MVP, no concurrent writes expected):

```ts
for (let i = 0; i < orderedIds.length; i++) {
	await deps.updateChapterOrder(orderedIds[i]!, i + 1); // 1-indexed order
}
deps.revalidatePaths([`/admin/courses/${courseId}`]);
```

### 🔴 Critical: Query Files Architecture — `chapters.ts` + `chapters.shared.ts` Split

**Follow the same pattern as `queries/courses.ts` + `queries/courses.shared.ts`:**

```
src/server/queries/
├── chapters.shared.ts  ← Pure query logic, injected query fn, testable
├── chapters.ts         ← "server-only" import + real Drizzle wiring
└── chapters.test.ts    ← Tests against shared functions
```

```ts
// src/server/queries/chapters.shared.ts
import type { chapters } from '../db/schema';
import type { InferSelectModel } from 'drizzle-orm';

export type ChapterRow = InferSelectModel<typeof chapters>;

export async function getChaptersByCourseIdFromQuery(
	courseId: number,
	query: (courseId: number) => Promise<ChapterRow[]>,
): Promise<ChapterRow[]> {
	return query(courseId);
}
```

```ts
// src/server/queries/chapters.ts
import 'server-only';

import { asc, eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { chapters } from '~/server/db/schema';
import { getChaptersByCourseIdFromQuery, type ChapterRow } from './chapters.shared';

export type { ChapterRow } from './chapters.shared';

export async function getChaptersByCourseId(courseId: number): Promise<ChapterRow[]> {
	return getChaptersByCourseIdFromQuery(courseId, (id) =>
		db.select().from(chapters).where(eq(chapters.courseId, id)).orderBy(asc(chapters.order)),
	);
}
```

> **Note the `asc` import** — must be imported from `drizzle-orm` alongside `eq`.

### 🔴 Critical: `"use server"` and `"server-only"` Directives

- **`"use server"`** — MUST be the **first line** of every Server Actions file (`chapters/index.ts`). Without it, Next.js will not register the functions as Server Actions and calls will silently fail.
- **`import "server-only"`** — MUST be the **first import** in every query file (`queries/chapters.ts`). Without it, query code can accidentally leak into client bundles.

### 🔴 Critical: Server Action Return Type

All Server Actions **MUST** use `ActionResponse<T>` from `~/types/index.ts`:

```ts
// Already defined — import, do NOT redefine
import type { ActionResponse } from '~/types';

// The actual type (for reference):
type ActionResponse<T = undefined> = { success: true; data: T } | { success: false; error: string };
```

Note: `ActionResponse` has a **default generic** `T = undefined`. For void actions, use `ActionResponse<void>` — return `{ success: true, data: undefined }`.

### 🔴 Critical: `revalidatePath` for Chapter Mutations

After any chapter mutation (create, update, delete, reorder), revalidate:

```ts
revalidatePath(`/admin/courses/${courseId}`);
```

This triggers the RSC page to re-fetch `getChaptersByCourseId` automatically — no manual state sync needed.

### 🔵 Auto-Save Pattern — Mirror `CourseEditForm.tsx` Exactly

The `ChapterTitleInput` auto-save must follow the **exact same implementation** as `CourseEditForm.tsx` (not a simplified version). Key details from the actual file:

```tsx
// project-e-course/src/components/admin/ChapterTitleInput.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { updateChapter } from '~/server/actions/chapters';
import { chapterUpdateSchema, type ChapterUpdateInput } from '~/lib/validations/chapter';
import type { ChapterRow } from '~/server/queries/chapters';

export function ChapterTitleInput({ chapter }: { chapter: ChapterRow }) {
	// Track last saved value to prevent redundant saves
	const lastSavedValueRef = useRef<string>(JSON.stringify({ title: chapter.title }));

	const form = useForm<ChapterUpdateInput>({
		resolver: zodResolver(chapterUpdateSchema),
		mode: 'onBlur',
		defaultValues: { title: chapter.title },
	});

	const watchedValues = useWatch({ control: form.control });

	const autoSave = useCallback(
		async (data: ChapterUpdateInput) => {
			const serialized = JSON.stringify(data);
			if (serialized === lastSavedValueRef.current) return; // no-op if unchanged

			const result = await updateChapter(String(chapter.id), data);
			if (!result.success) {
				toast.error(`Save failed: ${result.error}`, { duration: 4000, position: 'bottom-right' });
				return;
			}
			lastSavedValueRef.current = serialized;
			toast.success('Chapter saved', { duration: 2000, position: 'bottom-right' });
		},
		[chapter.id],
	);

	useEffect(() => {
		const hasErrors = Object.keys(form.formState.errors).length > 0;
		if (hasErrors) return;

		const timeoutId = window.setTimeout(() => {
			// ← window.setTimeout, not bare setTimeout
			const currentValues = form.getValues(); // ← form.getValues(), not watchedValues directly
			const parsed = chapterUpdateSchema.safeParse(currentValues);
			if (parsed.success) {
				void autoSave(parsed.data);
			}
		}, 500);

		return () => window.clearTimeout(timeoutId);
	}, [autoSave, form, form.formState.errors, watchedValues]);

	return (
		<input
			{...form.register('title')}
			className="flex-1 border-0 bg-transparent text-sm font-medium text-gray-900 outline-none focus:border-b focus:border-indigo-500 min-h-[44px] px-1"
			placeholder="Chapter title..."
		/>
	);
	// Inline error (shown on blur if invalid):
	// {form.formState.errors.title && (
	//   <p className="mt-0.5 text-[11px] text-red-500">{form.formState.errors.title.message}</p>
	// )}
}
```

> **Critical differences from a naive implementation:**
>
> 1. Uses `useRef` for `lastSavedValueRef` — prevents double-save
> 2. Uses `window.setTimeout` (not `setTimeout`) — consistent with `CourseEditForm`
> 3. Checks `form.getValues()` + `safeParse` — validates before sending
> 4. `mode: "onBlur"` on form — validation fires on blur, not on every keystroke

### 🔵 Drag-and-Drop: `@hello-pangea/dnd` Pattern

```bash
# Run in project-e-course/ directory
npm install @hello-pangea/dnd
```

Library ships its own TypeScript types — no separate `@types/` install needed.

**DnD pattern with optimistic UI + rollback:**

```tsx
'use client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';

async function handleDragEnd(result: DropResult) {
	if (!result.destination) return;
	if (result.destination.index === result.source.index) return;

	const reordered = Array.from(chapters);
	const [removed] = reordered.splice(result.source.index, 1);
	reordered.splice(result.destination.index, 0, removed!);

	setChapters(reordered); // Optimistic UI — instant visual feedback

	const orderedIds = reordered.map((c) => c.id);
	const res = await reorderChapters(courseId, orderedIds);
	if (!res.success) {
		setChapters(initialChapters); // Rollback on error (NFR-P2: Zero-flicker)
		toast.error(`Reorder failed: ${res.error}`);
	}
}
```

> `@hello-pangea/dnd` is a drop-in replacement for `react-beautiful-dnd`, compatible with React 18/19 + Next.js 15 Server Components. **Requires `'use client'` boundary** — all DnD components must be client components.

### 🔵 Testing Pattern for Chapter Actions

Use **Node.js built-in test runner** (same as `courses/shared.test.ts`) — NOT vitest:

```ts
// src/server/actions/chapters/shared.test.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { createChapterWithDependencies, type ChapterActionDependencies } from './shared.ts';

function createDependencies(
	overrides: Partial<ChapterActionDependencies> = {},
): ChapterActionDependencies {
	return {
		getSession: async () => ({ user: { id: 'admin-1', role: 'admin' } }),
		insertChapter: async () => 10,
		updateChapter: async () => undefined,
		deleteChapter: async () => undefined,
		getMaxOrder: async () => 2,
		updateChapterOrder: async () => undefined,
		revalidatePaths: () => undefined,
		...overrides,
	};
}

void test('createChapterWithDependencies rejects unauthorized requests', async () => {
	const result = await createChapterWithDependencies(
		'5',
		createDependencies({ getSession: async () => null }),
	);
	assert.deepEqual(result, { success: false, error: 'Unauthorized.' });
});

void test('createChapterWithDependencies inserts with order max+1 and returns chapterId', async () => {
	let receivedValues: unknown;
	const result = await createChapterWithDependencies(
		'5',
		createDependencies({
			getMaxOrder: async () => 3,
			insertChapter: async (values) => {
				receivedValues = values;
				return 10;
			},
		}),
	);
	assert.deepEqual(result, { success: true, data: { chapterId: 10 } });
	assert.deepEqual(receivedValues, { courseId: 5, title: 'New Chapter', order: 4 });
});
```

**For component tests** use vitest + `@testing-library/react` (same as `CourseEditForm.test.tsx`).

### 🔵 `ChapterList` — Skeleton Loader for Loading States

Per UX spec (NFR-U2): _"Skeleton Loaders wajib menggantikan semua spinner konvensional di loading states."_ Use `Skeleton` from `~/components/ui/skeleton` (already installed):

```tsx
// Show while isCreating === true (after "Add Chapter" click, before revalidatePath refreshes)
{
	isCreating && (
		<div className="space-y-2">
			{[1, 2, 3].map((i) => (
				<Skeleton key={i} className="h-[44px] w-full rounded-md" />
			))}
		</div>
	);
}
```

Also show skeleton on the initial delete action (disable the delete button + show spinner mini):

```tsx
<Button
	variant="ghost"
	size="sm"
	disabled={isDeletingId === chapter.id}
	className="ml-auto min-h-[44px] min-w-[44px] text-xs text-red-400 hover:text-red-600"
>
	{isDeletingId === chapter.id ? '...' : 'Delete'}
</Button>
```

### 🔵 UX: Touch Targets Minimum 44×44px (WCAG AA)

Per UX spec (Accessibility): _"Touch target minimum 44×44px agar menghindari fat-finger errors."_

Every interactive element in `ChapterList` must meet this requirement:

```tsx
// Drag handle — must be tappable on mobile
<div
  {...provided.dragHandleProps}
  className="cursor-grab text-gray-300 group-hover:text-gray-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
>
  <GripVertical size={16} />
</div>

// Delete button — must be tappable
<Button
  variant="ghost"
  size="sm"
  className="ml-auto min-h-[44px] min-w-[44px] text-xs text-red-400 hover:text-red-600"
>
  Delete
</Button>

// Title input — min height for touch
<input
  className="... min-h-[44px] px-1"
/>
```

### 🔵 Admin UX: Chapter Section Layout & Typography

The chapter section lives below the Course Edit form. Follow **Admin Zone typography** pattern from `CourseEditForm.tsx` and `ux-design-directions.html`:

```tsx
// Section header — matches CourseEditForm label style
<div className="mb-4 flex items-center justify-between">
  <h2 className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
    Chapters
  </h2>
  <Button
    onClick={handleAddChapter}
    variant="outline"
    size="sm"
    disabled={isCreating}
    className="text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50 min-h-[44px]"
  >
    {isCreating ? "Adding..." : "+ Add Chapter"}
  </Button>
</div>

// Chapter row — border-only, no shadow (Admin Zone rule)
<div
  ref={provided.innerRef}
  {...provided.draggableProps}
  className="group mb-2 flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 min-h-[44px]"
>
```

**Border radius:** Use `rounded-md` (8px) for chapter rows — Admin Zone uses 8px–12px, NOT `rounded-lg` (which is 12px+) or `rounded-xl` (16px). Consistent with existing admin component styling.

**Color tokens (Admin Zone):**

| Token               | Value                                                              | Usage                    |
| ------------------- | ------------------------------------------------------------------ | ------------------------ |
| Background (page)   | `bg-white`                                                         | Page and row background  |
| Border              | `border-gray-200`                                                  | All borders              |
| Section label       | `text-[10px] font-semibold uppercase tracking-wider text-gray-600` | Section headers          |
| Row text            | `text-sm font-medium text-gray-900`                                | Chapter title            |
| Order badge         | `text-[11px] text-gray-400`                                        | `#N` order indicator     |
| Lesson count        | `text-[10px] text-gray-400`                                        | `0 lessons` placeholder  |
| Primary accent      | `indigo-500` / `#6366F1`                                           | Focus rings, add button  |
| Drag handle (idle)  | `text-gray-300`                                                    | Subtle, not distracting  |
| Drag handle (hover) | `text-gray-400`                                                    | Visible on `group-hover` |
| Destructive (idle)  | `text-red-400`                                                     | Softer, not alarming     |
| Destructive (hover) | `text-red-600`                                                     | Full destructive red     |

### 🔵 Empty State for Chapters

Per UX spec anti-pattern rule: _"No empty states = confusion; every empty state must have illustration + CTA."_

```tsx
{
	chapters.length === 0 && (
		<div className="flex flex-col items-center justify-center py-12 text-center">
			<svg
				className="mb-3 h-12 w-12 text-gray-300"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1}
					d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
				/>
			</svg>
			<p className="text-xs text-gray-500 mb-3">
				No chapters yet. Start building your course structure.
			</p>
			<Button
				onClick={handleAddChapter}
				variant="outline"
				size="sm"
				className="text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50 min-h-[44px]"
			>
				+ Add First Chapter
			</Button>
		</div>
	);
}
```

### 🔵 Delete Chapter: AlertDialog Pattern

Reuse `AlertDialog` from `src/components/ui/alert-dialog.tsx` (already installed from Story 5.2):

```tsx
<AlertDialog>
	<AlertDialogTrigger asChild>
		<Button
			variant="ghost"
			size="sm"
			className="ml-auto min-h-[44px] min-w-[44px] text-xs text-red-400 hover:text-red-600"
		>
			Delete
		</Button>
	</AlertDialogTrigger>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Delete Chapter?</AlertDialogTitle>
			<AlertDialogDescription>
				This will permanently delete this chapter and all its Lessons. This action cannot be undone.
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel>Cancel</AlertDialogCancel>
			<AlertDialogAction
				onClick={() => handleDeleteChapter(chapter.id)}
				className="bg-red-600 hover:bg-red-700 text-white"
			>
				Yes, delete chapter
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
```

### 🔵 Server Actions Domain Slice Location

Per architecture's Feature-Sliced Actions pattern:

```
project-e-course/src/server/actions/chapters/index.ts     ← "use server" + real infra wiring
project-e-course/src/server/actions/chapters/shared.ts    ← Pure business logic, deps-injected
project-e-course/src/server/actions/chapters/shared.test.ts ← Unit tests
```

Do **NOT** add chapter actions to `server/actions/courses/index.ts` — chapters are a separate domain.

### 🔵 `ChapterList` Component — Passing Initial Data

The Course Editor page (`[courseId]/page.tsx`) is an RSC. Fetch chapters server-side:

```tsx
// project-e-course/src/app/(admin)/admin/courses/[courseId]/page.tsx
import { getChaptersByCourseId } from '~/server/queries/chapters';
import { ChapterList } from '~/components/admin/ChapterList';

// Add before the return statement:
const chapters = await getChaptersByCourseId(course.id); // course.id is already a number

// Replace the placeholder <div> in the JSX:
<div className="mt-10 border-t border-gray-200 pt-6">
	<ChapterList courseId={String(course.id)} initialChapters={chapters} />
</div>;
```

> `course.id` is already `number` (from `CourseAdminListItem` type) — pass directly to `getChaptersByCourseId(course.id)` without parsing.

### 🔵 Forward Compatibility: Lesson Count Badge (Story 5.4)

Each chapter row should show a lesson count badge. For Story 5.3, static `0 lessons` placeholder. When Story 5.4 lands, this will be populated dynamically:

```tsx
<span className="ml-2 text-[10px] text-gray-400">0 lessons</span>
```

### 🟡 UX: Admin Loop — This Story's Scope

From UX Spec Journey 2 (Publishing Pipeline):

```
Admin Dashboard → Create Course → Draft Course Editor
  → Add Chapter (this story) → Add Lesson (Story 5.4) → Publish
```

This story (5.3) covers **Chapter level only** within the Course editor page. Story 5.4 handles Lessons within Chapters.

### 🟡 Optimistic UI for Drag-and-Drop

Reorder uses **optimistic UI** (Architecture NFR-P2: Zero-flicker routing / instant interactions):

1. `setChapters(reordered)` immediately for instant visual feedback
2. Call `reorderChapters` server action in background
3. If server fails → `setChapters(previousChapters)` to rollback + show error toast

### 🟢 What Already Exists (DO NOT Recreate)

```
project-e-course/src/server/db/schema.ts                  — `chapters` table (already defined)
project-e-course/src/server/db/index.ts                   — `db` Drizzle instance
project-e-course/src/server/auth.ts                       — NextAuth with role in JWT
project-e-course/src/middleware.ts                        — /admin/* protection
project-e-course/src/types/index.ts                       — ActionResponse<T>
project-e-course/src/components/ui/                       — All shadcn primitives
project-e-course/src/components/ui/alert-dialog.tsx       — From Story 5.2, use it
project-e-course/src/components/ui/skeleton.tsx           — Use for loading states
project-e-course/src/components/ui/button.tsx             — Use for all buttons
project-e-course/src/components/admin/AdminSidebar.tsx    — From Story 5.1
project-e-course/src/components/admin/AdminHeader.tsx     — From Story 5.1
project-e-course/src/app/(admin)/admin/layout.tsx         — Admin layout with sidebar
project-e-course/src/app/(admin)/admin/courses/[courseId]/page.tsx  — Has chapters placeholder to replace
project-e-course/src/lib/validations/course.ts            — Zod schemas for course (extend pattern)
project-e-course/src/server/actions/courses/index.ts      — Course Server Actions (pattern reference)
project-e-course/src/server/actions/courses/shared.ts     — Course shared logic (pattern reference)
project-e-course/src/server/queries/courses.ts            — Course queries (pattern reference)
project-e-course/src/server/queries/courses.shared.ts     — Course shared queries (pattern reference)
```

### 🟢 New Files to Create

```
project-e-course/src/components/admin/ChapterList.tsx         — Draggable chapter list ('use client')
project-e-course/src/components/admin/ChapterList.test.tsx    — Component tests (vitest)
project-e-course/src/components/admin/ChapterTitleInput.tsx   — Inline auto-save input ('use client')
project-e-course/src/lib/validations/chapter.ts               — Zod schemas for chapter
project-e-course/src/server/actions/chapters/index.ts         — "use server" + infra wiring
project-e-course/src/server/actions/chapters/shared.ts        — Pure business logic (testable)
project-e-course/src/server/actions/chapters/shared.test.ts   — Unit tests (node:test)
project-e-course/src/server/queries/chapters.ts               — "server-only" + real DB queries
project-e-course/src/server/queries/chapters.shared.ts        — Pure query logic (testable)
project-e-course/src/server/queries/chapters.test.ts          — Unit tests (node:test)
```

### 🟢 Files to Edit (Not Recreate)

```
project-e-course/src/app/(admin)/admin/courses/[courseId]/page.tsx
  → Add import: getChaptersByCourseId from ~/server/queries/chapters
  → Add import: ChapterList from ~/components/admin/ChapterList
  → Add: const chapters = await getChaptersByCourseId(course.id)
  → Replace placeholder <div> with: <ChapterList courseId={String(course.id)} initialChapters={chapters} />

project-e-course/package.json
  → Add: "@hello-pangea/dnd": "^2.0.0" (or latest stable, via npm install)
```

### 🟢 TypeScript Conventions

- **No `any` types** — Use `ChapterRow` (from `typeof chapters.$inferSelect` or `InferSelectModel`) for Drizzle inferred type
- **File naming:** `kebab-case` for files, `PascalCase` for components
- **Import alias:** `~` maps to `src/`
- **Server Action return:** Always `ActionResponse<T>` from `~/types/index.ts`
- **Error handling:** `try/catch` in Server Actions, return `{ success: false, error: message }` — do NOT throw
- **strict mode:** Zero tolerance for `any` types (NFR-M1)

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — FR22: Admin manages chapters: create, order within a course; Epic 5 overview; Admin Publishing Pipeline Journey 2]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — Feature-Sliced Actions (`server/actions/chapters/`), Admin Zone route group `(admin)`, Middleware `/admin/*` protection, `ActionResponse<T>` standard, Zod dual-layer validation, TypeScript strict mode, `revalidatePath` for cache busting, RSC + Server Actions pattern, Drizzle ORM, Drizzle transaction for batch updates]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — Admin Zone always light (white bg + 1px `#E5E7EB` borders, no shadow, no decorations); Auto-save first (no Save button); Desktop-First CMS; AlertDialog for destructive; Toast feedback (NFR-U3); Empty states with illustration + CTA (Anti-pattern: No empty states); Skeleton loaders mandatory (NFR-U2); Touch target 44×44px (WCAG AA Accessibility); Admin emotional goal: Confident & In Control; Publishing Pipeline Journey 2; Border radius App/Admin zone 8px–12px `rounded-md`; Typography: section labels `text-[10px] font-semibold uppercase tracking-wider text-gray-600`; Indigo `#6366F1` as primary accent]
- [Source: `_bmad-output/planning-artifacts/ux-design-directions.html` — Admin CMS mockup: label pattern `text-[10px] font-semibold uppercase tracking-wider`, input `border border-gray-200 rounded-md`, focus `focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500`, Admin sidebar always-light utility style]
- [Source: `_bmad-output/implementation-artifacts/5-2-course-management-crud.md` — Physical project root `project-e-course/`, serial integer IDs pattern, `isPublished` boolean, established `CourseEditForm` debounce auto-save pattern with `useRef`+`window.setTimeout`+`form.getValues()+safeParse`, `ActionResponse<T>` at `~/types/index.ts`, `alert-dialog.tsx` installed, Feature-Sliced actions pattern]
- [Source: `project-e-course/src/server/db/schema.ts` — Actual `chapters` table definition confirmed: serial id, integer courseId (cascade), varchar title 255, text description, integer order (NOT NULL), timestamp createdAt (no updatedAt)]
- [Source: `project-e-course/src/server/actions/courses/index.ts` + `shared.ts` — index.ts+shared.ts split pattern, `"use server"` directive, dependency injection, `parseCourseId` with `Number.isInteger` check, `requireAdminSession` pattern, `revalidatePaths` array loop]
- [Source: `project-e-course/src/server/queries/courses.ts` + `courses.shared.ts` — `import "server-only"`, queries split pattern, `CourseAdminListItem` type from shared file]
- [Source: `project-e-course/src/server/actions/courses/shared.test.ts` — `node:test` + `node:assert/strict` pattern, `createDependencies` factory with overrides, `void test(...)` pattern]
- [Source: `project-e-course/src/components/admin/CourseEditForm.tsx` — Exact auto-save implementation: `useRef` lastSavedValueRef, `window.setTimeout`, `form.getValues()` + `safeParse`, `mode: "onBlur"`, toast positions]
- [Source: `project-e-course/src/components/admin/CourseEditForm.test.tsx` — vitest + `@testing-library/react` pattern for component tests, `vi.hoisted`, `vi.mock` for server actions]
- [Source: `project-e-course/src/app/(admin)/admin/courses/[courseId]/page.tsx` — Exact placeholder location: `border-dashed` div; `course.id` is already `number` from `CourseAdminListItem`]

## Dev Agent Record

### Agent Model Used

cliproxy/gpt-5.4

### Debug Log References

- `npm install @hello-pangea/dnd`
- `npm test`
- `npm run check`
- `npx vitest run src/components/admin/ChapterList.test.tsx src/components/admin/CourseEditForm.test.tsx`
- `npx vitest run` _(existing repo-wide Vitest suite still has pre-existing unrelated failures: Node `node:test` files are picked up by Vitest and some server-auth imports are incompatible in that runner)_

### Completion Notes List

- Implemented chapter validation, server queries, and server actions under `project-e-course/src/server/{queries,actions}/chapters/` with dependency-injected shared logic and Node test coverage.
- Replaced the course editor chapter placeholder with live server-fetched chapter data and rendered `ChapterList` on `/admin/courses/[courseId]`.
- Built `ChapterList` and `ChapterTitleInput` client components with optimistic reorder, inline auto-save, empty state, skeleton loading, drag-and-drop, and destructive delete confirmation.
- Added targeted component coverage for `ChapterList` and confirmed admin component regression tests still pass.
- Verified `npm test` and `npm run check` pass. Repo-wide `npx vitest run` remains red due to unrelated existing cross-runner configuration issues outside this story's scope.
- Approved scope change by user: replaced skeleton-first add flow with inline draft-row creation, requiring admins to type a chapter title before persisting.
- Extracted `CoursesTableSection` into `src/app/(admin)/admin/courses/courses-table-section.tsx` to preserve page testability without exporting unsupported App Router symbols from `page.tsx`.

### File List

- `project-e-course/package.json`
- `project-e-course/package-lock.json`
- `project-e-course/src/app/(admin)/admin/courses/[courseId]/page.tsx`
- `project-e-course/src/app/(admin)/admin/courses/courses-table-section.tsx`
- `project-e-course/src/app/(admin)/admin/courses/page.tsx`
- `project-e-course/src/app/(admin)/admin/courses/page.test.tsx`
- `project-e-course/src/components/admin/ChapterList.tsx`
- `project-e-course/src/components/admin/ChapterList.test.tsx`
- `project-e-course/src/components/admin/ChapterTitleInput.tsx`
- `project-e-course/src/lib/validations/chapter.ts`
- `project-e-course/src/server/actions/chapters/index.ts`
- `project-e-course/src/server/actions/chapters/shared.ts`
- `project-e-course/src/server/actions/chapters/shared.test.ts`
- `project-e-course/src/server/queries/chapters.ts`
- `project-e-course/src/server/queries/chapters.shared.ts`
- `project-e-course/src/server/queries/chapters.test.ts`
