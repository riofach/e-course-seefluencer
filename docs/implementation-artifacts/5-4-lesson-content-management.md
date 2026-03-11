# Story 5.4: Lesson Content Management

Status: done

## Story

As an admin,
I want to add, edit, and delete Lessons within a Chapter,
so that I can attach actual learning content (Video, Text, or Quiz) to the course structure.

## Acceptance Criteria

1. **Given** I am on the Course Editor page at `/admin/courses/[courseId]`
   **When** the page loads
   **Then** I see all existing chapters rendered by `ChapterList`, and each chapter row now shows a **lesson count badge** (replacing the `0 lessons` placeholder from Story 5.3) that reflects the actual number of lessons in that chapter.

2. **Given** I am viewing a Chapter row in `ChapterList`
   **When** I click "Add Lesson" (or expand the chapter accordion to reveal lessons)
   **Then** a new Lesson is created in the database with default type `'video'` and appended to the chapter with the next `order` value. A loading state prevents duplicate submissions. (FR23)

3. **Given** I am viewing a Lesson row under a Chapter
   **When** I click on the Lesson to expand/edit it
   **Then** I see inline-editable fields: **Title**, **Type** (select: Video / Text / Quiz), and **Content URL** (for Video type — YouTube URL) or **Text content** (for Text type) or a note "Quiz questions managed separately in Story 5.5" (for Quiz type) (FR23)

4. **Given** I update the Lesson title, type, or content URL inline
   **When** I stop typing (500ms debounce) or change the type select
   **Then** the changes are auto-saved to the database with a Toast "Lesson saved" — no Save button required (FR23, Admin auto-save pattern)

5. **Given** I am viewing a Lesson row
   **When** I click "Delete" and confirm via `AlertDialog`
   **Then** the lesson is removed from the database, the chapter's lesson count badge updates, and the lessons list re-renders (FR23)

6. **Given** a chapter has no lessons
   **When** the lesson list area renders under that chapter
   **Then** an empty state with a small illustration and "Add First Lesson" CTA is displayed (UX anti-pattern rule: no blank screens)

7. **Given** any lesson mutation (create/update/delete) completes
   **When** in background
   **Then** a non-blocking Toast notification appears with clear text ("Lesson saved" / "Lesson deleted") (NFR-U3)

8. **Given** I am on any screen width
   **When** using Admin CMS
   **Then** all interactive elements (lesson rows, type select, delete button) meet the 44×44px touch target minimum (WCAG AA, NFR-U1)

## Tasks / Subtasks

- [x] **Extend `ChapterList` to render `LessonList` per chapter** (AC: 1, 2, 6)
  - [x] Open `project-e-course/src/components/admin/ChapterList.tsx`
  - [x] Each chapter row: add expand/collapse toggle (chevron icon) to show/hide lesson sub-list
  - [x] Import `LessonList` and render `<LessonList chapterId={chapter.id} initialLessons={lessonsMap[chapter.id] ?? []} />` inside expanded area
  - [x] Replace `0 lessons` static badge with dynamic `{chapter.lessonCount}` prop (populated from server via updated query)

- [x] **Update `getChaptersByCourseId` query to include lesson counts** (AC: 1)
  - [x] Open `project-e-course/src/server/queries/chapters.shared.ts` and `chapters.ts`
  - [x] Extend the query to include a subquery / join that counts lessons per chapter
  - [x] Update `ChapterRow` type to include `lessonCount: number`
  - [x] Update `ChapterList` props to pass `lessonCount` to the badge

- [x] **Fetch lessons server-side on Course Editor page** (AC: 1, 3)
  - [x] Open `project-e-course/src/app/(admin)/admin/courses/[courseId]/page.tsx`
  - [x] Import `getLessonsByChapterId` (or a bulk `getLessonsByCourseId` returning a `Record<chapterId, LessonRow[]>`) from `~/server/queries/lessons`
  - [x] Pass `initialLessonsMap` prop down to `ChapterList` → forwarded to each `LessonList`

- [x] **Create Zod validation schemas for lessons** (AC: 3, 4)
  - [x] Create `project-e-course/src/lib/validations/lesson.ts`
  - [x] `lessonCreateSchema`: `{ chapterId: z.number().int().positive() }`
  - [x] `lessonUpdateSchema`: `{ title: z.string().min(1).max(255), type: z.enum(['video','text','quiz']), videoUrl: z.string().url().optional().or(z.literal('')), content: z.string().optional() }`
  - [x] Export inferred types: `LessonUpdateInput`

- [x] **Create Lesson Server Actions — `index.ts` + `shared.ts` split** (AC: 2, 4, 5)
  - [x] Create `project-e-course/src/server/actions/lessons/shared.ts` — pure business logic, deps-injected (NO direct db/auth imports)
  - [x] Create `project-e-course/src/server/actions/lessons/index.ts` — `"use server"` first line, wires real infra
  - [x] `createLesson(chapterId: string)` — calculates `order = max(existing) + 1`, inserts with `title: 'New Lesson'`, `type: 'video'`, returns `{ lessonId: number }`
  - [x] `updateLesson(lessonId: string, data: LessonUpdateInput)` — validates schema, updates DB
  - [x] `deleteLesson(lessonId: string)` — deletes lesson row (only the lesson, not chapter cascade needed)
  - [x] All return `ActionResponse<T>` from `~/types/index.ts` — NEVER throw, always return `{ success: false, error: string }`
  - [x] Revalidate `revalidatePath('/admin/courses/[courseId]')` after every mutation

- [x] **Create Lesson Server Actions test file** (AC: 2, 4, 5)
  - [x] Create `project-e-course/src/server/actions/lessons/shared.test.ts`
  - [x] Use **Node.js built-in `node:test` + `node:assert/strict`** — NOT vitest (same pattern as `chapters/shared.test.ts`)
  - [x] Test: unauthorized requests rejected for all actions
  - [x] Test: `createLessonWithDependencies` inserts with correct order and returns lessonId
  - [x] Test: `updateLessonWithDependencies` validates empty title and rejects
  - [x] Test: `deleteLessonWithDependencies` calls delete and revalidates path

- [x] **Create database query functions for lessons — `lessons.ts` + `lessons.shared.ts` split** (AC: 1, 3)
  - [x] Create `project-e-course/src/server/queries/lessons.shared.ts` — pure query logic, injected dep, testable
  - [x] Create `project-e-course/src/server/queries/lessons.ts` — `import "server-only"` as first import
  - [x] `getLessonsByChapterId(chapterId: number): Promise<LessonRow[]>` — ordered by `order` ASC
  - [x] `getLessonsByCourseId(courseId: number): Promise<Record<number, LessonRow[]>>` — bulk fetch all lessons for a course, grouped by chapterId (avoids N+1 per chapter)
  - [x] Export `LessonRow` type from `lessons.shared.ts` (inferred via `InferSelectModel<typeof lessons>`)

- [x] **Create Lesson query test file**
  - [x] Create `project-e-course/src/server/queries/lessons.test.ts`
  - [x] Use `node:test` + `node:assert/strict`
  - [x] Test: invalid chapterId returns empty array
  - [x] Test: valid chapterId calls query with parsed integer

- [x] **Create `LessonList` client component** (AC: 2, 3, 4, 5, 6, 8)
  - [x] Create `project-e-course/src/components/admin/LessonList.tsx` as `'use client'`
  - [x] Accept props: `chapterId: number`, `initialLessons: LessonRow[]`
  - [x] Manage local `lessons` state with `useState(initialLessons)`
  - [x] Each lesson row: type icon badge (`Video`/`Text`/`Quiz`), inline-editable title (`LessonTitleInput`), type select (`LessonTypeSelect`), URL input (conditional on `type === 'video'`), Delete button
  - [x] "Add Lesson" button calls `createLesson(String(chapterId))` Server Action
  - [x] Show empty state (small illustration + "Add First Lesson" CTA) when `lessons.length === 0`
  - [x] Show skeleton loaders (3 rows `h-[44px]`) while creating

- [x] **Create `LessonTitleInput` inline-edit component** (AC: 4, 7)
  - [x] Create `project-e-course/src/components/admin/LessonTitleInput.tsx` as `'use client'`
  - [x] Mirror `ChapterTitleInput.tsx` EXACTLY: `useRef` lastSavedValueRef, `window.setTimeout` (not `setTimeout`), `form.getValues()` + `safeParse`, `mode: 'onBlur'`, Sonner toast
  - [x] Use `lessonUpdateSchema` (partial, title only) — on-blur validation with inline red error

- [x] **Create `LessonTypeSelect` component** (AC: 3, 4)
  - [x] Create `project-e-course/src/components/admin/LessonTypeSelect.tsx` as `'use client'`
  - [x] Use shadcn `Select` component from `~/components/ui/select` (already installed)
  - [x] Options: `Video`, `Text`, `Quiz` — maps to `'video'`, `'text'`, `'quiz'`
  - [x] On change: immediately call `updateLesson(lessonId, { ...currentData, type: newType })` (no debounce — select is a discrete action)
  - [x] Show Toast "Lesson type updated" on success

- [x] **Create `LessonList` component test file**
  - [x] Create `project-e-course/src/components/admin/LessonList.test.tsx`
  - [x] Use vitest + `@testing-library/react` (same as `ChapterList.test.tsx`)
  - [x] Test: renders empty state when no lessons
  - [x] Test: renders lesson rows when lessons exist
  - [x] Test: "Add Lesson" button calls `createLesson` action

## Dev Notes

### 🔴 Critical: Physical Project Root

**ALL source files live under `project-e-course/`**. The `package.json` is at `project-e-course/package.json`. Always prefix all paths with `project-e-course/`. The outer `hiring-seefluencer/` directory is the monorepo shell.

### 🔴 Critical: Admin Zone Is ALWAYS Light Mode

Admin CMS does **NOT** use dark mode. Per UX spec: _"Admin: Pure SaaS minimal — white, 1px borders `#E5E7EB`, no decorations."_ Do **NOT** apply `dark:` Tailwind variants inside any admin component. Do **NOT** add `shadow-*` classes — use border-only design.

### 🔴 Critical: Actual `lessons` Schema

The `lessons` table is **already defined** in `project-e-course/src/server/db/schema.ts`. Do **NOT** recreate or modify it:

```ts
// project-e-course/src/server/db/schema.ts — ALREADY DEFINED
export const lessons = pgTable('lessons', {
	id: serial('id').primaryKey(),
	chapterId: integer('chapter_id')
		.references(() => chapters.id, { onDelete: 'cascade' })
		.notNull(),
	title: varchar('title', { length: 255 }).notNull(),
	type: varchar('type', { length: 20 }).notNull().default('video'), // 'video' | 'text' | 'quiz'
	videoUrl: varchar('video_url', { length: 500 }),
	content: text('content'),
	isFree: boolean('is_free').notNull().default(false),
	order: integer('order').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

> **Key facts:**
>
> - `id` is `serial` (integer, NOT UUID). Always use `number`.
> - `chapterId` is an integer FK → `chapters.id` with cascade delete.
> - `type` is a `varchar(20)` with default `'video'` — valid values: `'video'`, `'text'`, `'quiz'`.
> - `videoUrl` is **nullable** — only relevant for `type === 'video'`.
> - `content` is **nullable** text — only relevant for `type === 'text'`.
> - `isFree` boolean defaults to `false` — determines Paywall access (Epic 4).
> - `order` is required integer — must be set on creation.
> - **No `updatedAt` column** on lessons — do NOT try to set it.
> - Cascade Delete configured: deleting a chapter automatically deletes all its lessons (already handled by the FK).

### 🔴 Critical: Server Actions File Architecture — `index.ts` + `shared.ts` Split

**This is the established codebase pattern** — same as `courses/` and `chapters/`. Lessons MUST follow identically:

```
src/server/actions/lessons/
├── shared.ts       ← Pure business logic, injected dependencies, no direct DB/auth imports
├── index.ts        ← "use server" FIRST LINE, wires real infra, calls shared functions
└── shared.test.ts  ← Unit tests with node:test (NOT vitest)
```

**`shared.ts` dependency type pattern:**

```ts
export type LessonActionDependencies = {
	getSession: () => Promise<{ user?: { id?: string; role?: string } } | null>;
	insertLesson: (values: {
		chapterId: number;
		title: string;
		type: string;
		order: number;
	}) => Promise<number | undefined>;
	updateLesson: (
		lessonId: number,
		data: Partial<{ title: string; type: string; videoUrl: string | null; content: string | null }>,
	) => Promise<void>;
	deleteLesson: (lessonId: number) => Promise<void>;
	getMaxOrder: (chapterId: number) => Promise<number | null>;
	revalidatePaths: (paths: string[]) => void;
};
```

**`index.ts` must have `"use server"` as the absolute first line** — no comments, no imports before it.

### 🔴 Critical: Query Files Architecture — `lessons.ts` + `lessons.shared.ts` Split

Same pattern as `queries/chapters.ts` + `queries/chapters.shared.ts`:

```
src/server/queries/
├── lessons.shared.ts  ← Pure query logic, injected query fn, testable
├── lessons.ts         ← import "server-only" as FIRST import, real Drizzle wiring
└── lessons.test.ts    ← node:test tests
```

```ts
// lessons.shared.ts
import type { InferSelectModel } from 'drizzle-orm';
import type { lessons } from '../db/schema';

export type LessonRow = InferSelectModel<typeof lessons>;
```

```ts
// lessons.ts
import 'server-only'; // ← MUST be first import

import { asc, eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { lessons } from '~/server/db/schema';
export type { LessonRow } from './lessons.shared';

export async function getLessonsByChapterId(chapterId: number): Promise<LessonRow[]> {
	return db
		.select()
		.from(lessons)
		.where(eq(lessons.chapterId, chapterId))
		.orderBy(asc(lessons.order));
}
```

### 🔴 Critical: N+1 Prevention — Bulk Lesson Fetch for Course Editor

The Course Editor page already fetches ALL chapters for a course. If we fetch lessons per chapter separately, that is N+1. Use a bulk query and group client-side:

```ts
// Recommended approach in queries/lessons.ts
export async function getLessonsByCourseId(courseId: number): Promise<Record<number, LessonRow[]>> {
	// Join chapters → lessons for this course
	const rows = await db
		.select({ lesson: lessons })
		.from(lessons)
		.innerJoin(chapters, eq(lessons.chapterId, chapters.id))
		.where(eq(chapters.courseId, courseId))
		.orderBy(asc(lessons.chapterId), asc(lessons.order));

	// Group by chapterId
	const map: Record<number, LessonRow[]> = {};
	for (const row of rows) {
		const cId = row.lesson.chapterId;
		if (!map[cId]) map[cId] = [];
		map[cId]!.push(row.lesson);
	}
	return map;
}
```

Pass the resulting `map` as `initialLessonsMap` prop to `ChapterList`, then forward `initialLessonsMap[chapter.id] ?? []` to each `LessonList`.

### 🔴 Critical: `ActionResponse<T>` Return Type

All Server Actions **MUST** use `ActionResponse<T>` from `~/types/index.ts`:

```ts
import type { ActionResponse } from '~/types';
// type ActionResponse<T = undefined> = { success: true; data: T } | { success: false; error: string };
```

- `createLesson` returns `ActionResponse<{ lessonId: number }>`
- `updateLesson` returns `ActionResponse<void>` — return `{ success: true, data: undefined }`
- `deleteLesson` returns `ActionResponse<void>`

### 🔴 Critical: `revalidatePath` for Lesson Mutations

After any lesson mutation (create, update, delete), revalidate the course editor page:

```ts
// The courseId is NOT directly available in lesson actions — look it up via chapterId
// OR: Pass courseId as a parameter to lesson actions for simpler revalidation
// Recommended: pass courseId alongside chapterId to `createLesson` / deleteLesson
revalidatePath(`/admin/courses/${courseId}`);
```

> If courseId is not passed, query it: `SELECT course_id FROM chapters WHERE id = $chapterId`. Simpler: **accept courseId as a string parameter** in createLesson and deleteLesson to avoid extra DB round-trip.

### 🔴 Critical: Parse IDs From String URL Params

When receiving `lessonId` or `chapterId` as string (URL param), always parse and validate:

```ts
const parsedId = Number(id);
if (!Number.isInteger(parsedId) || parsedId <= 0) {
	return { success: false, error: 'Invalid id.' };
}
```

This mirrors the exact pattern in `chapters/shared.ts` and `courses/shared.ts`.

### 🔴 Critical: Type Enum Validation

`type` field must be validated against allowed values — do NOT let arbitrary strings reach the DB:

```ts
// In lessonUpdateSchema:
type: z.enum(['video', 'text', 'quiz']);
```

### 🔵 Auto-Save Pattern — Mirror `ChapterTitleInput.tsx` EXACTLY

`LessonTitleInput` must follow the **exact same debounce/autosave implementation**:

```tsx
'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { updateLesson } from '~/server/actions/lessons';
import { lessonUpdateSchema } from '~/lib/validations/lesson';

export function LessonTitleInput({ lesson }: { lesson: LessonRow }) {
	const lastSavedValueRef = useRef<string>(JSON.stringify({ title: lesson.title }));
	const form = useForm({
		resolver: zodResolver(lessonTitleSchema),
		mode: 'onBlur',
		defaultValues: { title: lesson.title },
	});
	const watchedValues = useWatch({ control: form.control });

	const autoSave = useCallback(
		async (data) => {
			const serialized = JSON.stringify(data);
			if (serialized === lastSavedValueRef.current) return; // no-op if unchanged
			const result = await updateLesson(String(lesson.id), data);
			if (!result.success) {
				toast.error(`Save failed: ${result.error}`, { duration: 4000, position: 'bottom-right' });
				return;
			}
			lastSavedValueRef.current = serialized;
			toast.success('Lesson saved', { duration: 2000, position: 'bottom-right' });
		},
		[lesson.id],
	);

	useEffect(() => {
		if (Object.keys(form.formState.errors).length > 0) return;
		const timeoutId = window.setTimeout(() => {
			// ← window.setTimeout, NOT bare setTimeout
			const currentValues = form.getValues(); // ← form.getValues(), NOT watchedValues directly
			const parsed = lessonTitleSchema.safeParse(currentValues);
			if (parsed.success) void autoSave(parsed.data);
		}, 500);
		return () => window.clearTimeout(timeoutId);
	}, [autoSave, form, form.formState.errors, watchedValues]);
	// ...
}
```

> **Critical differences from a naive implementation:**
>
> 1. `useRef` lastSavedValueRef — prevents double-save on re-render
> 2. `window.setTimeout` — NOT `setTimeout` (prevents Node.js vs browser type mismatch)
> 3. `form.getValues()` + `safeParse` — validates before sending
> 4. `mode: 'onBlur'` — validation only fires when field loses focus

### 🔵 `LessonTypeSelect` — shadcn `<Select>` (NOT `<select>` HTML)

Use shadcn `Select` primitive (already installed from previous stories):

```tsx
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select';

<Select
	value={lesson.type}
	onValueChange={async (newType) => {
		const result = await updateLesson(String(lesson.id), { ...currentData, type: newType });
		if (result.success)
			toast.success('Lesson type updated', { duration: 2000, position: 'bottom-right' });
		else toast.error(`Update failed: ${result.error}`);
	}}
>
	<SelectTrigger className="h-[44px] w-[120px] border-gray-200 text-xs">
		<SelectValue />
	</SelectTrigger>
	<SelectContent>
		<SelectItem value="video">Video</SelectItem>
		<SelectItem value="text">Text</SelectItem>
		<SelectItem value="quiz">Quiz</SelectItem>
	</SelectContent>
</Select>;
```

> No debounce on type select — it's a discrete action (not a streaming text change).

### 🔵 Delete Lesson: `AlertDialog` Pattern (Reuse from Story 5.3)

Use the same `AlertDialog` pattern from `ChapterList.tsx` (Story 5.3):

```tsx
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
// Already installed — do NOT reinstall
```

Destructive button style: `className="bg-red-600 hover:bg-red-700 text-white"`

### 🔵 Testing Pattern for Lesson Actions (node:test)

```ts
// src/server/actions/lessons/shared.test.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { createLessonWithDependencies, type LessonActionDependencies } from './shared.ts';

function createDependencies(
	overrides: Partial<LessonActionDependencies> = {},
): LessonActionDependencies {
	return {
		getSession: async () => ({ user: { id: 'admin-1', role: 'admin' } }),
		insertLesson: async () => 20,
		updateLesson: async () => undefined,
		deleteLesson: async () => undefined,
		getMaxOrder: async () => 1,
		revalidatePaths: () => undefined,
		...overrides,
	};
}

void test('createLessonWithDependencies rejects unauthorized requests', async () => {
	const result = await createLessonWithDependencies(
		'5',
		createDependencies({ getSession: async () => null }),
	);
	assert.deepEqual(result, { success: false, error: 'Unauthorized.' });
});
```

**For component tests** use vitest + `@testing-library/react` (same as `ChapterList.test.tsx`, `CourseEditForm.test.tsx`).

### 🔵 UX: Lesson Row Layout & Admin Zone Tokens

Every lesson row follows **Admin Zone** rules — NO dark mode, NO shadows, border-only:

```tsx
// Lesson row — indented under chapter, slightly smaller height
<div className="flex items-center gap-2 rounded-md border border-gray-100 bg-gray-50 px-3 py-1 min-h-[44px] mb-1">
	{/* Type badge */}
	<span className="w-14 shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-center text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
		{lesson.type}
	</span>
	{/* Inline title */}
	<LessonTitleInput lesson={lesson} />
	{/* Type select */}
	<LessonTypeSelect lesson={lesson} />
	{/* Delete button */}
	<AlertDialog>...</AlertDialog>
</div>
```

**Admin Zone color tokens (same as Story 5.3):**

| Token             | Value                       | Usage                 |
| ----------------- | --------------------------- | --------------------- |
| Row bg            | `bg-gray-50`                | Lesson rows (nested)  |
| Chapter row bg    | `bg-white`                  | Chapter rows          |
| Border            | `border-gray-100` (lighter) | Nested lesson borders |
| Type badge bg     | `bg-indigo-50`              | Lesson type pill      |
| Type badge text   | `text-indigo-600`           | Lesson type pill text |
| Primary accent    | `indigo-500` / `#6366F1`    | Focus, active states  |
| Destructive idle  | `text-red-400`              | Subtle delete         |
| Destructive hover | `text-red-600`              | Full destructive red  |

### 🔵 Skeleton Loaders for Create Loading State

Per UX spec (NFR-U2): Skeleton Loaders mandatory — no conventional spinners:

```tsx
// Show while isCreating === true (after "Add Lesson" click)
{
	isCreating && (
		<div className="space-y-1">
			{[1, 2].map((i) => (
				<Skeleton key={i} className="h-[44px] w-full rounded-md" />
			))}
		</div>
	);
}
```

`Skeleton` component: already installed at `~/components/ui/skeleton`.

### 🔵 Empty State for Lessons (Within Expanded Chapter)

Per UX anti-pattern rule ("No empty states = confusion"):

```tsx
{lessons.length === 0 && (
  <div className="flex flex-col items-center py-6 text-center">
    <svg className="mb-2 h-8 w-8 text-gray-300" ...> {/* simple document icon */} </svg>
    <p className="text-xs text-gray-400 mb-2">No lessons in this chapter yet.</p>
    <Button onClick={handleAddLesson} variant="outline" size="sm"
      className="text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50 min-h-[44px]">
      + Add First Lesson
    </Button>
  </div>
)}
```

### 🔵 Lesson Type-Conditional Fields

Show/hide fields based on `lesson.type`:

- `type === 'video'` → Show **YouTube URL input** (label: "Video URL")
- `type === 'text'` → Show **Textarea** for text content (label: "Content")
- `type === 'quiz'` → Show note: `"Quiz questions are managed in the Quiz Builder (next feature)"` — no additional input needed for this story

All inline auto-saved following the same debounce pattern.

### 🔵 Chapter Accordion — Expand/Collapse

Each chapter row in `ChapterList` needs a chevron toggle to show/hide its `LessonList`. Use `lucide-react` `ChevronDown` / `ChevronRight` icon (already installed via previous stories). State managed locally in `ChapterList` as `expandedChapterIds: Set<number>`.

```tsx
import { ChevronDown, ChevronRight } from 'lucide-react';

// In chapter row:
<button
	onClick={() => toggleExpand(chapter.id)}
	className="mr-1 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600"
	aria-label={isExpanded ? 'Collapse chapter' : 'Expand chapter'}
>
	{isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
</button>;
```

### 🔵 Form Label Style — Admin Zone Standard

Per `ux-design-directions.html` Admin CMS mockup, **all form labels** in the Admin Zone must use this exact style — NOT plain `text-sm`:

```tsx
<label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
	Title
</label>
```

| Property       | Value            |
| -------------- | ---------------- |
| Font size      | `text-[10px]`    |
| Weight         | `font-semibold`  |
| Color          | `text-gray-600`  |
| Transform      | `uppercase`      |
| Letter spacing | `tracking-wider` |
| Bottom margin  | `mb-1`           |
| Display        | `block`          |

Apply this label style to: Lesson Title, Video URL, Content, and any other field labels rendered inside `LessonList` / expanded lesson row.

---

### 🔵 Input & Textarea Style — Admin Zone Standard

Per `ux-design-directions.html` Admin CMS mockup, **all text inputs and textareas** must use:

```tsx
// Standard text input (e.g., YouTube URL field)
<input
  type="text"
  className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
/>

// Textarea (e.g., Text content field)
<textarea
  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none min-h-[100px]"
/>
```

| Property        | Value                                          | Notes                            |
| --------------- | ---------------------------------------------- | -------------------------------- |
| Border          | `border border-gray-200`                       | 1px `#E5E7EB` — Admin Zone rule  |
| Border radius   | `rounded-md`                                   | 8px, structured (not large)      |
| Padding         | `px-3 py-1.5` (input) / `px-3 py-2` (textarea) | Comfortable but compact          |
| Font size       | `text-sm` (14px)                               | Body font size                   |
| Focus border    | `focus:border-indigo-500`                      | Indigo `#6366F1` on focus        |
| Focus ring      | `focus:ring-1 focus:ring-indigo-500`           | Subtle 1px ring, NOT 2px default |
| Outline         | `outline-none`                                 | Remove browser default           |
| Textarea resize | `resize-none`                                  | Prevent layout-breaking resize   |
| Textarea height | `min-h-[100px]`                                | Minimum comfortable text area    |
| Width           | `w-full`                                       | Always full container width      |

> **Critical:** Do NOT use shadcn's `<Input>` component for these inline-edit fields inside lesson rows — use raw `<input>` / `<textarea>` HTML elements with these exact classes to maintain the flat, border-only Admin Zone aesthetic. The shadcn `<Input>` adds extra wrapper complexity that interferes with the inline layout.

---

### 🔵 "Add Lesson" Button Style — Non-Empty State

The "Add Lesson" button rendered **below the lesson list** (when lessons already exist) uses a different style from the empty-state CTA:

```tsx
// "Add Lesson" button — shown at bottom of lesson list (non-empty state)
<Button
	onClick={handleAddLesson}
	variant="ghost"
	size="sm"
	disabled={isCreating}
	className="mt-2 h-[36px] w-full border border-dashed border-gray-300 text-xs font-medium text-gray-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50"
>
	{isCreating ? 'Adding...' : '+ Add Lesson'}
</Button>
```

| State    | Border                          | Text              | Background     |
| -------- | ------------------------------- | ----------------- | -------------- |
| Default  | `border-dashed border-gray-300` | `text-gray-500`   | transparent    |
| Hover    | `border-indigo-300`             | `text-indigo-600` | `bg-indigo-50` |
| Disabled | —                               | `opacity-50`      | —              |

> The dashed border signals "add action" affordance — a standard SaaS pattern (used by Notion, Linear). This is distinct from the filled empty-state CTA.

---

### 🔵 Delete Button Style — Lesson Row

The delete button inside each lesson row should be subtle by default, becoming destructive-red on hover — NOT a full red button at idle state:

```tsx
// Delete button in lesson row — icon-only with tooltip
<AlertDialogTrigger asChild>
	<button
		className="ml-auto flex shrink-0 items-center justify-center rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 min-h-[44px] min-w-[44px]"
		aria-label="Delete lesson"
	>
		<Trash2 size={14} />
	</button>
</AlertDialogTrigger>
```

| State | Icon color      | Background  |
| ----- | --------------- | ----------- |
| Idle  | `text-gray-400` | transparent |
| Hover | `text-red-600`  | `bg-red-50` |

Import: `import { Trash2 } from 'lucide-react'` (already installed).

---

### 🔵 Lesson Count Badge — Chapter Row

The lesson count badge that replaces the `"0 lessons"` placeholder in `ChapterList` must match the Admin Zone badge style:

```tsx
// Lesson count badge on chapter row
<span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
	{chapter.lessonCount} {chapter.lessonCount === 1 ? 'lesson' : 'lessons'}
</span>
```

| Property   | Value           |
| ---------- | --------------- |
| Background | `bg-gray-100`   |
| Text color | `text-gray-500` |
| Font size  | `text-[10px]`   |
| Weight     | `font-medium`   |
| Radius     | `rounded-full`  |
| Padding    | `px-2 py-0.5`   |

---

### 🔵 Lesson Section Container — Spacing & Layout

The lesson list section rendered **inside an expanded chapter** must have consistent indentation to visually communicate the hierarchy (Chapter → Lesson):

```tsx
// Lesson section wrapper — rendered inside ChapterList per expanded chapter
<div className="ml-6 mt-1 space-y-1 border-l border-gray-100 pl-3 pb-2">
	{/* LessonList renders here */}
</div>
```

| Property       | Value                      | Purpose                                   |
| -------------- | -------------------------- | ----------------------------------------- |
| Left margin    | `ml-6`                     | Indent lessons under chapter header       |
| Left border    | `border-l border-gray-100` | Visual hierarchy line (tree structure)    |
| Left padding   | `pl-3`                     | Space between tree line and lesson rows   |
| Top margin     | `mt-1`                     | Small gap from chapter header             |
| Bottom padding | `pb-2`                     | Breathing room at bottom of chapter block |
| Vertical gap   | `space-y-1`                | 4px between lesson rows                   |

---

### 🔵 Lesson Type-Conditional Fields — Full Spec

Each conditional field must follow the label + input style defined above. Full layout per type:

**`type === 'video'`:**

```tsx
<div className="mt-2 px-3 pb-3">
	<label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
		Video URL (YouTube)
	</label>
	<input
		type="url"
		placeholder="https://youtube.com/watch?v=..."
		className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
	/>
	{/* error message (if invalid URL) */}
	<p className="mt-1 text-[11px] text-red-500">{error}</p>
</div>
```

**`type === 'text'`:**

```tsx
<div className="mt-2 px-3 pb-3">
	<label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
		Content
	</label>
	<textarea
		placeholder="Write lesson content here..."
		className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none min-h-[100px]"
	/>
</div>
```

**`type === 'quiz'`:**

```tsx
<div className="mt-2 px-3 pb-3">
	<p className="text-[11px] text-gray-400 italic">
		Quiz questions are managed in the Quiz Builder (next feature).
	</p>
</div>
```

---

### 🔵 Typography Scale Reference — Admin Zone

Per `ux-design-specification.md` body typeface spec (`Inter`, tight tracking `-0.02em`):

| Element                  | Class                                                              |
| ------------------------ | ------------------------------------------------------------------ |
| Section headings         | `text-sm font-semibold text-gray-900`                              |
| Form labels              | `text-[10px] font-semibold text-gray-600 uppercase tracking-wider` |
| Input text               | `text-sm text-gray-900`                                            |
| Placeholder text         | `placeholder:text-gray-400`                                        |
| Helper / sub-text        | `text-[11px] text-gray-400`                                        |
| Error messages           | `text-[11px] text-red-500`                                         |
| Badge / pill text        | `text-[10px] font-semibold uppercase tracking-wider`               |
| Lesson row title input   | `text-sm font-medium text-gray-800`                                |
| "Add Lesson" button text | `text-xs font-medium`                                              |
| Toast messages           | Sonner default (no override needed)                                |

Apply `tracking-tight` (`-0.015em`) to all body text elements inside Admin components to match the SaaS Productivity aesthetic.

---

### 🔵 Spacing System Reference — Admin Zone

Consistent 4px-base spacing (Tailwind standard per UX spec):

| Context                          | Class            | px value          |
| -------------------------------- | ---------------- | ----------------- |
| Gap between lesson row elements  | `gap-2`          | 8px               |
| Padding inside lesson row        | `px-3 py-1`      | 12px / 4px        |
| Gap between lesson rows          | `space-y-1`      | 4px               |
| Gap between label and input      | `mb-1`           | 4px               |
| Gap between form sections        | `space-y-4`      | 16px              |
| Left indent for lesson section   | `ml-6 pl-3`      | 24px + 12px       |
| Bottom padding after lesson list | `pb-2`           | 8px               |
| Top margin after chapter header  | `mt-1`           | 4px               |
| Empty state vertical padding     | `py-6`           | 24px              |
| Conditional field wrapper        | `mt-2 px-3 pb-3` | 8px + 12px + 12px |

---

### 🔵 Border Radius Reference — Admin Zone

Per UX spec: App/Admin Zone uses `8px–12px` (structured), NOT the large `24px–40px` of the Landing Zone:

| Element             | Class          | px value |
| ------------------- | -------------- | -------- |
| Lesson row          | `rounded-md`   | 6px      |
| Input / Textarea    | `rounded-md`   | 6px      |
| Type badge (pill)   | `rounded-full` | 9999px   |
| Lesson count badge  | `rounded-full` | 9999px   |
| Skeleton loaders    | `rounded-md`   | 6px      |
| Add Lesson button   | `rounded-md`   | 6px      |
| Delete button hover | `rounded-md`   | 6px      |

---

### 🔵 Forward Compatibility: `isFree` Lesson Flag

The `lessons` schema has an `isFree` boolean (default `false`). This controls Paywall access (Epic 4, FR15). For this story, you do **NOT** need to expose an `isFree` toggle in the UI — that's out of scope. However, when **inserting** a new lesson, be aware `isFree` defaults to `false`. This is correct behavior.

### 🟢 What Already Exists (DO NOT Recreate)

```
project-e-course/src/server/db/schema.ts              — `lessons` table (already defined)
project-e-course/src/server/db/index.ts               — `db` Drizzle instance
project-e-course/src/server/auth.ts                   — NextAuth with role in JWT
project-e-course/src/middleware.ts                    — /admin/* protection (Edge)
project-e-course/src/types/index.ts                   — ActionResponse<T> (use as-is)
project-e-course/src/components/ui/select.tsx         — shadcn Select (installed)
project-e-course/src/components/ui/alert-dialog.tsx   — From Story 5.2 (use it)
project-e-course/src/components/ui/skeleton.tsx       — From previous stories (use it)
project-e-course/src/components/ui/button.tsx         — Use for all buttons
project-e-course/src/components/admin/ChapterList.tsx — EXTEND, do not recreate
project-e-course/src/components/admin/ChapterTitleInput.tsx — Mirror pattern exactly
project-e-course/src/server/actions/chapters/         — Mirror pattern for lessons
project-e-course/src/server/queries/chapters.ts       — Mirror pattern for lessons
project-e-course/src/lib/validations/chapter.ts       — Mirror pattern for lesson.ts
```

### 🟢 New Files to Create

```
project-e-course/src/components/admin/LessonList.tsx           — Lessons under chapter ('use client')
project-e-course/src/components/admin/LessonList.test.tsx      — vitest + testing-library
project-e-course/src/components/admin/LessonTitleInput.tsx     — Inline auto-save title ('use client')
project-e-course/src/components/admin/LessonTypeSelect.tsx     — Type select ('use client')
project-e-course/src/lib/validations/lesson.ts                 — Zod schemas
project-e-course/src/server/actions/lessons/index.ts           — "use server" + infra wiring
project-e-course/src/server/actions/lessons/shared.ts          — Pure business logic (testable)
project-e-course/src/server/actions/lessons/shared.test.ts     — Unit tests (node:test)
project-e-course/src/server/queries/lessons.ts                 — "server-only" + real DB queries
project-e-course/src/server/queries/lessons.shared.ts          — Pure query logic (testable)
project-e-course/src/server/queries/lessons.test.ts            — Unit tests (node:test)
```

### 🟢 Files to Edit (Not Recreate)

```
project-e-course/src/components/admin/ChapterList.tsx
  → Add expand/collapse chevron toggle per chapter row
  → Import LessonList and render under each chapter when expanded
  → Accept initialLessonsMap prop (Record<number, LessonRow[]>)
  → Replace "0 lessons" static badge with dynamic chapter.lessonCount

project-e-course/src/server/queries/chapters.ts  (and chapters.shared.ts)
  → Update query to include lesson count per chapter (subquery or join)
  → Update ChapterRow type to include lessonCount: number

project-e-course/src/app/(admin)/admin/courses/[courseId]/page.tsx
  → Import getLessonsByCourseId from ~/server/queries/lessons
  → Fetch const lessonsMap = await getLessonsByCourseId(course.id)
  → Pass initialLessonsMap={lessonsMap} to ChapterList
```

### 🟢 TypeScript Conventions (Same as All Previous Stories)

- **No `any` types** — Use `LessonRow` (inferred `InferSelectModel<typeof lessons>`) throughout
- **File naming:** `kebab-case` for files, `PascalCase` for components
- **Import alias:** `~` maps to `src/`
- **Server Action return:** Always `ActionResponse<T>` from `~/types/index.ts`
- **Error handling:** `try/catch` in Server Actions, return `{ success: false, error: message }` — do NOT throw
- **strict mode:** Zero tolerance for `any` types (NFR-M1)

### Project Structure Notes

- Route group for this feature: `(admin)` — all admin pages under `src/app/(admin)/admin/`
- No new routes created in this story — all changes happen on the existing `/admin/courses/[courseId]` page
- The `LessonList` is rendered inside `ChapterList` which is rendered on the Course Editor page
- Feature-sliced actions: `src/server/actions/lessons/` (separate from `chapters/` domain)
- NFR-M2: No schema migrations needed — `lessons` table already exists

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — FR23: Admin manages lessons: create with type (video/text/quiz) in a chapter; Epic 5 overview; Admin Publishing Pipeline Journey 2 (story 5.4 is the "Add Lesson" step in the flow)]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — Feature-Sliced Actions (`server/actions/lessons/`), Admin Zone route group `(admin)`, Middleware `/admin/*` protection, `ActionResponse<T>` standard, Zod dual-layer validation, TypeScript strict mode, `revalidatePath` for cache busting, RSC + Server Actions pattern, Drizzle ORM, index.ts+shared.ts split pattern]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — Admin Zone always light (white bg + 1px `#E5E7EB` borders, no shadow, no decorations); Auto-save first (no Save button for text/content fields); Desktop-First CMS; AlertDialog for destructive; Toast feedback (NFR-U3); Empty states with illustration + CTA; Skeleton loaders mandatory (NFR-U2); Touch target 44×44px (WCAG AA); Admin emotional goal: Confident & In Control; Publishing Pipeline Journey 2; Content hierarchy: Course → Chapter → Lesson (this story implements the Lesson step)]
- [Source: `_bmad-output/implementation-artifacts/5-3-chapter-management.md` — Physical project root `project-e-course/`, established ChapterList patterns, serial integer IDs, `"0 lessons"` placeholder to replace, established `ChapterTitleInput` debounce auto-save pattern with `useRef`+`window.setTimeout`+`form.getValues()+safeParse`, `ActionResponse<T>` at `~/types/index.ts`, `alert-dialog.tsx` installed, `@hello-pangea/dnd` installed, Node.js test runner pattern, vitest component test pattern, Feature-Sliced index.ts+shared.ts architecture, dependency injection for testability]
- [Source: `project-e-course/src/server/db/schema.ts` — Actual `lessons` table definition: serial id, integer chapterId (cascade), varchar title 255, varchar type 20 (default 'video'), varchar videoUrl 500 (nullable), text content (nullable), boolean isFree (default false), integer order (NOT NULL), timestamp createdAt (no updatedAt)]

## Dev Agent Record

## Change Log

- 2026-03-10: Implemented lesson content management with bulk lesson loading, lesson server actions, admin lesson editing UI, tests, and validation updates.
- 2026-03-10: Post-review enhancement added `isFree` lesson management via admin premium toggle so lessons can be explicitly marked free preview vs premium.

### Agent Model Used

cliproxy/gpt-5.4

### Debug Log References

- Updated `ChapterList` accordion structure and lesson count badge rendering in `project-e-course/src/components/admin/ChapterList.tsx`
- Replaced the temporary `LessonList` scaffold with full lesson CRUD UI, inline field editing, skeleton loading, and empty states in `project-e-course/src/components/admin/LessonList.tsx`
- Extended chapter query typing + SQL aggregation for `lessonCount` in `project-e-course/src/server/queries/chapters.shared.ts` and `project-e-course/src/server/queries/chapters.ts`
- Verified red/green cycle with `npx vitest run src/components/admin/ChapterList.test.tsx` and `node --test src/server/queries/chapters.test.ts`
- Added `lessons.shared.ts` + `lessons.ts` bulk query flow and wired `getLessonsByCourseId` into the course editor page to avoid N+1 loading
- Added lesson Zod schemas plus feature-sliced lesson actions in `src/server/actions/lessons/{shared,index}.ts` with node:test coverage
- Added shadcn `select` primitive and admin lesson editing controls (`LessonTitleInput`, `LessonTypeSelect`) for inline lesson management
- Verified completion with targeted suite: `node --test src/server/queries/chapters.test.ts src/server/queries/lessons.test.ts src/server/actions/chapters/shared.test.ts src/server/actions/lessons/shared.test.ts && npx vitest run src/components/admin/ChapterList.test.tsx src/components/admin/LessonList.test.tsx src/app/'(admin)'/admin/courses/'[courseId]'/page.test.tsx`
- Extended lesson update payloads to include `isFree` and added admin premium/free toggle wiring using `~/components/ui/switch`
- Verified follow-up enhancement with `node --test src/server/actions/lessons/shared.test.ts src/server/queries/lessons.test.ts src/server/queries/chapters.test.ts && npx vitest run src/components/admin/ChapterList.test.tsx src/components/admin/LessonList.test.tsx src/app/'(admin)'/admin/courses/'[courseId]'/page.test.tsx && npm run lint && npm run typecheck`

### Completion Notes List

- ✅ AC1 groundwork complete: chapter rows now support expand/collapse and render dynamic lesson count badges.
- ✅ Course editor now bulk-loads lesson data per course and passes grouped records into `ChapterList` without N+1 queries.
- ✅ Lesson validation, server actions, query layer, and component tests implemented for lesson CRUD/admin editing workflow.
- ✅ Lesson rows now support title autosave, type changes, conditional content fields, create/delete flows, and admin empty/skeleton states.
- ✅ Follow-up enhancement: admins can now toggle lesson monetization state (`isFree`) directly from the lesson row to control free preview vs premium access.

### File List

- project-e-course/src/components/admin/ChapterList.tsx
- project-e-course/src/components/admin/ChapterList.test.tsx
- project-e-course/src/components/admin/LessonList.tsx
- project-e-course/src/components/admin/LessonList.test.tsx
- project-e-course/src/components/admin/LessonTitleInput.tsx
- project-e-course/src/components/admin/LessonTypeSelect.tsx
- project-e-course/src/components/ui/select.tsx
- project-e-course/src/components/ui/switch.tsx
- project-e-course/src/lib/validations/lesson.ts
- project-e-course/src/server/actions/lessons/index.ts
- project-e-course/src/server/actions/lessons/shared.test.ts
- project-e-course/src/server/actions/lessons/shared.ts
- project-e-course/src/server/queries/lessons.shared.ts
- project-e-course/src/server/queries/lessons.test.ts
- project-e-course/src/server/queries/lessons.ts
- project-e-course/src/app/(admin)/admin/courses/[courseId]/page.tsx
- project-e-course/src/app/(admin)/admin/courses/[courseId]/page.test.tsx
- project-e-course/src/server/queries/chapters.shared.ts
- project-e-course/src/server/queries/chapters.test.ts
- project-e-course/src/server/queries/chapters.ts

### Post-Implementation Notes

- Follow-up enhancement after story completion: `lessons.isFree` is now exposed in the admin lesson editor through a premium toggle (`Premium` ON = paid lesson, OFF = free preview).
- This was implemented as a small scope extension on top of Story 5.4 without altering the story status, and validated with targeted tests, lint, and typecheck.
