# Story 5.5: Quiz Builder

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an admin,
I want to create Questions and Answers for Quiz-type lessons,
so that students can test their knowledge with scored multiple-choice questions.

## Acceptance Criteria

1. **Given** I am viewing a Quiz-type Lesson row in the admin Course Editor
   **When** I look at the lesson's expanded section
   **Then** I see a "Manage Quiz Questions" link/button (replacing the Story 5.4 placeholder note "Quiz questions are managed in the Quiz Builder") that navigates me to a dedicated quiz builder page at `/admin/courses/[courseId]/lessons/[lessonId]/quiz` (FR24)

2. **Given** I am on the Quiz Builder page for a Quiz-type lesson
   **When** the page loads
   **Then** I see all existing quiz questions listed for that lesson, with each question card displaying: question text, 4 options (A-D), correct answer indicator, and point value (FR24)

3. **Given** I am on the Quiz Builder page
   **When** I click "Add Question"
   **Then** a new question is created in the database with a default question and empty options, and a new editable question card appears at the bottom of the list (FR24)

4. **Given** I am editing a question card
   **When** I fill in the question text, option A, option B, option C, option D inline
   **Then** each field auto-saves to the database after 500ms debounce (on-blur) with a Toast "Question saved" — no Save button required (FR24, Admin auto-save pattern)

5. **Given** I am editing a question card
   **When** I click one of the radio buttons next to the 4 options to mark it as correct
   **Then** the `correctAnswer` field is immediately saved to the database and the selected option is visually highlighted (FR24)

6. **Given** I am editing a question card
   **When** I change the points value (integer input, default 10)
   **Then** the value is immediately saved to the database on-blur (FR24)

7. **Given** I am viewing a question card
   **When** I click the "Delete" button and confirm via `AlertDialog`
   **Then** the question is permanently removed from the database and the card disappears from the list (FR24)

8. **Given** there are no quiz questions for this lesson
   **When** the Quiz Builder page loads
   **Then** an empty state with an illustration and "Add First Question" CTA is displayed (UX: no blank screens)

9. **Given** any quiz question mutation (create/update/delete) completes
   **When** in background
   **Then** a non-blocking Toast notification appears with clear text (NFR-U3)

10. **Given** I am on any screen width
    **When** using the Quiz Builder
    **Then** all interactive elements (question inputs, radio buttons, delete button) meet the 44×44px touch target minimum (WCAG AA, NFR-U1)

## Tasks / Subtasks

- [x] **Create Zod validation schemas for quizzes** (AC: 3, 4, 5, 6)
  - [x] Create `project-e-course/src/lib/validations/quiz.ts`
  - [x] `quizCreateSchema`: `{ lessonId: z.number().int().positive() }`
  - [x] `quizUpdateSchema`: `{ question: z.string().min(1).max(2000), optionA: z.string().min(1).max(500), optionB: z.string().min(1).max(500), optionC: z.string().min(1).max(500), optionD: z.string().min(1).max(500), correctAnswer: z.enum(['A','B','C','D']), points: z.number().int().min(1).max(1000) }`
  - [x] Export inferred types: `QuizUpdateInput`, `QuizCreateInput`

- [x] **Create database query functions for quizzes — `quizzes.ts` + `quizzes.shared.ts` split** (AC: 2, 3)
  - [x] Create `project-e-course/src/server/queries/quizzes.shared.ts` — pure query logic, injected dep, testable
  - [x] Define `QuizRow` type via `InferSelectModel<typeof quizzes>` from `~/server/db/schema`
  - [x] Create `project-e-course/src/server/queries/quizzes.ts` — `import "server-only"` as first import
  - [x] `getQuizzesByLessonId(lessonId: number): Promise<QuizRow[]>` — ordered by `id` ASC
  - [x] Export `QuizRow` type from `quizzes.shared.ts`

- [x] **Create Quiz query test file**
  - [x] Create `project-e-course/src/server/queries/quizzes.test.ts`
  - [x] Use `node:test` + `node:assert/strict`
  - [x] Test: invalid lessonId (negative, zero, non-integer) returns empty array
  - [x] Test: valid lessonId calls query with correct argument

- [x] **Create Quiz Server Actions — `index.ts` + `shared.ts` split** (AC: 3, 4, 5, 6, 7)
  - [x] Create `project-e-course/src/server/actions/quizzes/shared.ts` — pure business logic, deps-injected (NO direct db/auth imports)
  - [x] Create `project-e-course/src/server/actions/quizzes/index.ts` — `"use server"` as absolute first line, wires real infra
  - [x] `createQuizQuestion(lessonId: string)` — inserts with default question/options, returns `{ quizId: number }`
  - [x] `updateQuizQuestion(quizId: string, data: QuizUpdateInput)` — validates schema, updates DB
  - [x] `deleteQuizQuestion(quizId: string)` — deletes quiz row
  - [x] All return `ActionResponse<T>` from `~/types/index.ts` — NEVER throw, always `{ success: false, error: string }`
  - [x] Revalidate `revalidatePath('/admin/courses/[courseId]/lessons/[lessonId]/quiz')` after mutations

- [x] **Create Quiz Server Actions test file** (AC: 3, 4, 5, 6, 7)
  - [x] Create `project-e-course/src/server/actions/quizzes/shared.test.ts`
  - [x] Use **`node:test` + `node:assert/strict`** — NOT vitest (matches all other action tests)
  - [x] Test: unauthorized requests rejected (non-admin role, missing session)
  - [x] Test: `createQuizQuestionWithDependencies` inserts with correct defaults and returns quizId
  - [x] Test: `updateQuizQuestionWithDependencies` rejects invalid correctAnswer (not A/B/C/D)
  - [x] Test: `updateQuizQuestionWithDependencies` rejects empty question text
  - [x] Test: `deleteQuizQuestionWithDependencies` calls delete and revalidates path

- [x] **Create Quiz Builder page (RSC)** (AC: 1, 2, 8)
  - [x] Create `project-e-course/src/app/(admin)/admin/courses/[courseId]/lessons/[lessonId]/quiz/page.tsx`
  - [x] This is a **React Server Component** (no `'use client'`)
  - [x] Params: `{ courseId: string, lessonId: string }` — both are Promises in Next.js 15 (must `await params`)
  - [x] Fetch `course` via `getCourseById(courseId)` — needed for breadcrumb title; if null call `notFound()`
  - [x] Validate `lessonId` is integer and lesson exists AND `type === 'quiz'` — if not, call `notFound()`
  - [x] Fetch `quizzes = await getQuizzesByLessonId(lessonId)` server-side
  - [x] Render breadcrumb nav: Admin → Courses → [Course Title] → Quiz Builder
  - [x] Render page header: `<h1>Quiz Builder</h1>` + lesson title subtitle + question count badge
  - [x] Pass `initialQuizzes` and `lessonId` to `<QuizQuestionList />` client component

- [x] **Update `LessonList.tsx` to link Quiz-type lessons** (AC: 1)
  - [x] Open `project-e-course/src/components/admin/LessonList.tsx`
  - [x] In the Quiz type conditional section (currently shows placeholder note), replace with a `Link` to `/admin/courses/[courseId]/lessons/[lessonId]/quiz`
  - [x] `LessonList` needs to receive `courseId: number` as a prop (add it)
  - [x] Update `ChapterList.tsx` to pass `courseId` down to each `<LessonList>` it renders
  - [x] Use Next.js `Link` component from `next/link` — NOT `<a>` tag

- [x] **Create `QuizQuestionList` client component** (AC: 2, 3, 4, 5, 6, 7, 8, 9, 10)
  - [x] Create `project-e-course/src/components/admin/QuizQuestionList.tsx` as `'use client'`
  - [x] Accept props: `lessonId: number`, `initialQuizzes: QuizRow[]`
  - [x] Manage local `quizzes` state with `useState(initialQuizzes)`
  - [x] "Add Question" button calls `createQuizQuestion(String(lessonId))` Server Action
  - [x] Show empty state (illustration + "Add First Question" CTA) when `quizzes.length === 0`
  - [x] Show skeleton loaders while creating (3 rows `h-[120px]`)
  - [x] Each question renders `<QuizQuestionCard>` component

- [x] **Create `QuizQuestionCard` component** (AC: 4, 5, 6, 7, 10)
  - [x] Create `project-e-course/src/components/admin/QuizQuestionCard.tsx` as `'use client'`
  - [x] Accept props: `quiz: QuizRow`
  - [x] Inline-editable fields: **Question text** (textarea, 500ms debounce), **Options A-D** (inputs, 500ms debounce each), **Points** (number input, on-blur), **Correct Answer** (radio group A/B/C/D, immediate save on change)
  - [x] Delete button → `AlertDialog` confirmation → calls `deleteQuizQuestion(String(quiz.id))`
  - [x] All auto-save uses the established `window.setTimeout` + `form.getValues()` + `safeParse` pattern
  - [x] On failed save: fire `toast.error(...)` AND set transient `saveError` state to turn affected input border red for 3s
  - [x] Correct answer option row gets `bg-indigo-50` highlight with `transition-colors duration-150`

- [x] **Create `QuizQuestionList` test file**
  - [x] Create `project-e-course/src/components/admin/QuizQuestionList.test.tsx`
  - [x] Use vitest + `@testing-library/react`
  - [x] Test: renders empty state when no quizzes
  - [x] Test: renders question cards when quizzes exist
  - [x] Test: "Add Question" button calls `createQuizQuestion` action

## Dev Notes

### 🔴 Critical: Physical Project Root

**ALL source files live under `project-e-course/`**. The `package.json` is at `project-e-course/package.json`. Always prefix ALL paths with `project-e-course/`. The outer `hiring-seefluencer/` directory is the monorepo shell. Never create files at the `hiring-seefluencer/src/` level.

### 🔴 Critical: Admin Zone Is ALWAYS Light Mode

Admin CMS does **NOT** use dark mode. Per UX spec: _"Admin: Pure SaaS minimal — white, 1px borders `#E5E7EB`, no decorations."_ Do **NOT** apply `dark:` Tailwind variants inside any admin component. Do **NOT** add `shadow-*` classes — use border-only design.

### 🔴 Critical: Actual `quizzes` Schema

The `quizzes` table is **already defined** in `project-e-course/src/server/db/schema.ts`. Do **NOT** recreate or modify it:

```ts
// project-e-course/src/server/db/schema.ts — ALREADY DEFINED
export const quizzes = pgTable('quizzes', {
	id: serial('id').primaryKey(),
	lessonId: integer('lesson_id')
		.references(() => lessons.id, { onDelete: 'cascade' })
		.notNull(),
	question: text('question').notNull(),
	optionA: text('option_a').notNull(),
	optionB: text('option_b').notNull(),
	optionC: text('option_c').notNull(),
	optionD: text('option_d').notNull(),
	correctAnswer: varchar('correct_answer', { length: 1 }).notNull(), // 'A' | 'B' | 'C' | 'D'
	points: integer('points').default(10).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

> **Key facts:**
>
> - `id` is `serial` (integer, NOT UUID). Always use `number`.
> - `lessonId` is an integer FK → `lessons.id` with cascade delete.
> - `correctAnswer` is a `varchar(1)` — valid values: `'A'`, `'B'`, `'C'`, `'D'` ONLY.
> - `points` is integer (default 10, NOT NULL) — minimum 1.
> - `question`, `optionA`, `optionB`, `optionC`, `optionD` are all `text` — NOT NULL.
> - **No `updatedAt` column** on quizzes — do NOT try to set it.
> - Cascade Delete configured: deleting a lesson automatically deletes all its quizzes (already handled by the FK).
> - **No `order` column** on quizzes — questions render by `id` ASC.

### 🔴 Critical: Server Actions File Architecture — `index.ts` + `shared.ts` Split

**This is the established codebase pattern** — same as `lessons/`, `courses/`, `chapters/`. Quizzes MUST follow identically:

```
src/server/actions/quizzes/
├── shared.ts       ← Pure business logic, injected dependencies, no direct DB/auth imports
├── index.ts        ← "use server" FIRST LINE (absolute first, no comments before it), wires real infra
└── shared.test.ts  ← Unit tests with node:test (NOT vitest)
```

**`shared.ts` dependency type pattern (mirror from lessons):**

```ts
export type QuizActionDependencies = {
	getSession: () => Promise<{ user?: { id?: string; role?: string } } | null>;
	insertQuiz: (values: {
		lessonId: number;
		question: string;
		optionA: string;
		optionB: string;
		optionC: string;
		optionD: string;
		correctAnswer: string;
		points: number;
	}) => Promise<number | undefined>;
	updateQuiz: (
		quizId: number,
		data: Partial<{
			question: string;
			optionA: string;
			optionB: string;
			optionC: string;
			optionD: string;
			correctAnswer: string;
			points: number;
		}>,
	) => Promise<void>;
	deleteQuiz: (quizId: number) => Promise<void>;
	getLessonCourseId: (lessonId: number) => Promise<{ courseId: number; lessonId: number } | null>;
	getQuizLessonId: (quizId: number) => Promise<number | null>;
	revalidatePaths: (paths: string[]) => void;
};
```

**`index.ts` must have `"use server"` as the absolute first line** — no comments, no imports before it.

### 🔴 Critical: Query Files Architecture — `quizzes.ts` + `quizzes.shared.ts` Split

Same pattern as `queries/lessons.ts` + `queries/lessons.shared.ts`:

```
src/server/queries/
├── quizzes.shared.ts  ← Pure query logic, injected query fn, testable
├── quizzes.ts         ← import "server-only" as FIRST import, real Drizzle wiring
└── quizzes.test.ts    ← node:test tests
```

```ts
// quizzes.shared.ts
import type { InferSelectModel } from 'drizzle-orm';
import type { quizzes } from '~/server/db/schema';

export type QuizRow = InferSelectModel<typeof quizzes>;
```

```ts
// quizzes.ts
import 'server-only'; // ← MUST be first import

import { asc, eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { quizzes } from '~/server/db/schema';
export type { QuizRow } from './quizzes.shared';

export async function getQuizzesByLessonId(lessonId: number): Promise<QuizRow[]> {
	return db.select().from(quizzes).where(eq(quizzes.lessonId, lessonId)).orderBy(asc(quizzes.id));
}
```

### 🔴 Critical: New Route — Quiz Builder Page

The Quiz Builder is a **dedicated page** (not an inline accordion on the course editor):

```
Route: /admin/courses/[courseId]/lessons/[lessonId]/quiz
File:  project-e-course/src/app/(admin)/admin/courses/[courseId]/lessons/[lessonId]/quiz/page.tsx
```

> This is inside the `(admin)` route group, so Admin middleware protection is automatic. The `(admin)` layout in `src/app/(admin)/admin/layout.tsx` applies — no new layout needed.

**RSC Page pattern (Next.js 15 async params):**

```tsx
// page.tsx — React Server Component, NO 'use client'
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCourseById } from '~/server/queries/courses'; // already exists
import { getLessonById } from '~/server/queries/lessons'; // add if missing (see note below)
import { getQuizzesByLessonId } from '~/server/queries/quizzes';
import { QuizQuestionList } from '~/components/admin/QuizQuestionList';

type QuizBuilderPageProps = {
	params: Promise<{ courseId: string; lessonId: string }>;
};

export default async function QuizBuilderPage({ params }: QuizBuilderPageProps) {
	const { courseId, lessonId } = await params; // ← MUST await params in Next.js 15

	const parsedLessonId = Number(lessonId);
	if (!Number.isInteger(parsedLessonId) || parsedLessonId <= 0) notFound();

	// Fetch course — needed for breadcrumb title
	const course = await getCourseById(courseId);
	if (!course) notFound();

	// Fetch lesson — validate it exists AND is type 'quiz'
	const lesson = await getLessonById(parsedLessonId);
	if (!lesson || lesson.type !== 'quiz') notFound();

	const quizzes = await getQuizzesByLessonId(parsedLessonId);

	return (
		<div className="min-h-screen flex-1 bg-white p-6">
			{/* Breadcrumb */}
			<nav className="mb-6 flex items-center gap-2 text-xs text-gray-500">
				<Link href="/admin" className="transition-colors hover:text-gray-900">
					Admin
				</Link>
				<span className="text-gray-300">/</span>
				<Link href="/admin/courses" className="transition-colors hover:text-gray-900">
					Courses
				</Link>
				<span className="text-gray-300">/</span>
				<Link href={`/admin/courses/${courseId}`} className="transition-colors hover:text-gray-900">
					{course.title || 'Untitled Course'}
				</Link>
				<span className="text-gray-300">/</span>
				<span className="font-medium text-gray-900">Quiz Builder</span>
			</nav>

			{/* Page header */}
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-lg font-semibold text-gray-900">Quiz Builder</h1>
					<p className="mt-0.5 text-xs text-gray-500">{lesson.title}</p>
				</div>
				<span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500">
					{quizzes.length} {quizzes.length === 1 ? 'question' : 'questions'}
				</span>
			</div>

			<QuizQuestionList lessonId={parsedLessonId} initialQuizzes={quizzes} />
		</div>
	);
}
```

> **Note:** `getLessonById(lessonId: number)` may not exist yet. If not, add it to `queries/lessons.ts` following the existing query patterns. Use `eq(lessons.id, lessonId)` + `.limit(1)` + return `result[0] ?? null`.

### 🔴 Critical: `ActionResponse<T>` Return Type

All Server Actions **MUST** use `ActionResponse<T>` from `~/types/index.ts`:

```ts
import type { ActionResponse } from '~/types';
// type ActionResponse<T = undefined> = { success: true; data: T } | { success: false; error: string };
```

- `createQuizQuestion` returns `ActionResponse<{ quizId: number }>`
- `updateQuizQuestion` returns `ActionResponse<void>` — return `{ success: true, data: undefined }`
- `deleteQuizQuestion` returns `ActionResponse<void>`

### 🔴 Critical: Parse IDs From String Params

When receiving `quizId` or `lessonId` as string (URL param or form input), always parse and validate:

```ts
const parsedId = Number(id);
if (!Number.isInteger(parsedId) || parsedId <= 0) {
	return { success: false, error: 'Invalid id.' };
}
```

This mirrors the exact pattern in `lessons/shared.ts`, `chapters/shared.ts`, and `courses/shared.ts`.

### 🔴 Critical: `correctAnswer` Enum Validation

`correctAnswer` field must ONLY accept `'A'`, `'B'`, `'C'`, `'D'`. Enforce in Zod schema and never let arbitrary strings reach the DB:

```ts
// In quizUpdateSchema:
correctAnswer: z.enum(['A', 'B', 'C', 'D']);
```

The `quizzes.correctAnswer` column is `varchar(1)` — inserting values longer than 1 character will fail at the DB level.

### 🔴 Critical: `LessonList.tsx` Must Receive `courseId` Prop

Currently `LessonList` only receives `chapterId` and `initialLessons`. To generate the Quiz Builder link, it also needs `courseId`. The update chain is:

1. `CourseEditorPage` (already has `course.id`) → passes `courseId` to `ChapterList`
2. `ChapterList` (already receives `courseId: string`) → passes `courseId` to each `<LessonList>`
3. `LessonList` → uses `courseId` in the `Link` href for Quiz-type lessons

**Do NOT use `courseId` from a global store or context** — pass it as a prop.

### 🔴 Critical: No Schema Migrations Needed

The `quizzes` table already exists in production schema (`schema.ts`). **Do NOT generate or run any Drizzle migrations** for this story. Do NOT add `updatedAt` or any new columns — use the schema exactly as defined.

### 🔵 Quiz Builder Page — Full Page Layout Spec

The Quiz Builder page follows the **same outer shell** as the Course Editor page (`/admin/courses/[courseId]/page.tsx`). Use the exact same container:

```tsx
<div className="min-h-screen flex-1 bg-white p-6">
	{/* breadcrumb */}
	{/* page header */}
	{/* QuizQuestionList */}
</div>
```

> **No `max-w-*` constraint** — The admin layout already handles container width. The inner content flows full-width within `p-6` padding, matching the course editor exactly.

### 🔵 Quiz Builder Page — Breadcrumb Pattern (Admin Zone)

The breadcrumb must follow the **exact same pattern** as `/admin/courses/[courseId]/page.tsx` (line 30–36 of that file):

```tsx
<nav className="mb-6 flex items-center gap-2 text-xs text-gray-500">
	<Link href="/admin" className="transition-colors hover:text-gray-900">
		Admin
	</Link>
	<span className="text-gray-300">/</span>
	<Link href="/admin/courses" className="transition-colors hover:text-gray-900">
		Courses
	</Link>
	<span className="text-gray-300">/</span>
	<Link href={`/admin/courses/${courseId}`} className="transition-colors hover:text-gray-900">
		{course.title || 'Untitled Course'}
	</Link>
	<span className="text-gray-300">/</span>
	<span className="font-medium text-gray-900">Quiz Builder</span>
</nav>
```

> **⚠️ Fix vs original story draft:** The third breadcrumb segment links back to the **Course** editor and shows `course.title` — NOT `lesson.title`. To render this, the RSC page must also fetch the course: `const course = await getCourseById(courseId)` (already available in `~/server/queries/courses`). If `course` is null, call `notFound()`.

### 🔵 Quiz Builder Page — Page Header

Below the breadcrumb, render a page header section that mirrors the course editor's `<h1>` + action button row (line 38–41 of `CourseEditorPage`):

```tsx
<div className="mb-6 flex items-center justify-between">
	<div>
		<h1 className="text-lg font-semibold text-gray-900">Quiz Builder</h1>
		<p className="mt-0.5 text-xs text-gray-500">{lesson.title}</p>
	</div>
	{/* question count badge — renders once QuizQuestionList mounts */}
	<span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500">
		{quizzes.length} {quizzes.length === 1 ? 'question' : 'questions'}
	</span>
</div>
```

> This gives the admin immediate orientation: they know which lesson they are editing and how many questions already exist before they scroll.

### 🔵 Auto-Save Pattern — Mirror `LessonTitleInput.tsx` Exactly

Each editable field in `QuizQuestionCard` must follow the **exact same debounce/autosave pattern** established in `LessonTitleInput.tsx` and `ChapterTitleInput.tsx`:

```tsx
'use client';
// Key points:
// 1. useRef lastSavedValueRef — prevents double-save on re-render
// 2. window.setTimeout — NOT bare setTimeout (prevents Node.js vs browser type mismatch)
// 3. form.getValues() + safeParse — validates before sending
// 4. mode: 'onBlur' — validation only fires when field loses focus

useEffect(() => {
	if (Object.keys(form.formState.errors).length > 0) return;
	const timeoutId = window.setTimeout(() => {
		const currentValues = form.getValues();
		const parsed = quizFieldSchema.safeParse(currentValues);
		if (parsed.success) void autoSave(parsed.data);
	}, 500);
	return () => window.clearTimeout(timeoutId);
}, [autoSave, form, form.formState.errors, watchedValues]);
```

> **Exception:** `correctAnswer` radio and `points` number use **on-change** (immediate save, no debounce) since they are discrete actions, not streaming text.

### 🔵 `QuizQuestionCard` — Layout Spec (Admin Zone)

Each question card is a distinct bordered container (NOT inline like lesson rows):

```tsx
// Question card — bordered card with internal grid
<div className="rounded-md border border-gray-200 bg-white p-4 mb-3">
  {/* Header row: Question number + Delete button */}
  <div className="mb-3 flex items-center justify-between">
    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
      Question {index + 1}
    </span>
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
          <Trash2 size={14} />
        </button>
      </AlertDialogTrigger>
      {/* ... AlertDialog content ... */}
    </AlertDialog>
  </div>

  {/* Question text */}
  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-600">
    Question
  </label>
  <textarea className="min-h-[80px] w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />

  {/* Options A-D with radio for correct answer */}
  <div className="mt-3 space-y-2">
    {['A', 'B', 'C', 'D'].map((letter) => (
      <div key={letter} className="flex items-center gap-2 min-h-[44px]">
        <input
          type="radio"
          name={`correct-${quiz.id}`}
          value={letter}
          checked={quiz.correctAnswer === letter}
          onChange={() => void handleCorrectAnswerSave(letter)}
          className="h-4 w-4 min-h-[44px] min-w-[44px] ... accent-indigo-600"
          aria-label={`Mark option ${letter} as correct`}
        />
        <label className="text-[10px] font-semibold text-gray-600 w-5 shrink-0">{letter}</label>
        <input
          type="text"
          defaultValue={quiz[`option${letter}` as keyof QuizRow] as string}
          className="flex-1 rounded-md border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          onBlur={...}
          aria-label={`Option ${letter}`}
        />
      </div>
    ))}
  </div>

  {/* Points */}
  <div className="mt-3 flex items-center gap-3">
    <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
      Points
    </label>
    <input
      type="number"
      min={1}
      max={1000}
      defaultValue={quiz.points}
      className="w-20 rounded-md border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
      onBlur={...}
      aria-label="Question points"
    />
  </div>
</div>
```

> **Correct answer radio:** The selected option should have a subtle visual accent. Use CSS `accent-indigo-600` on the radio input (Tailwind `accent-indigo-600`). The correct answer option row can also get `bg-indigo-50 rounded-md` background to make it visually distinct.

### 🔵 `LessonList.tsx` Quiz Link — Replacing the Placeholder

In Story 5.4, the `type === 'quiz'` conditional renders:

```tsx
{
	lesson.type === 'quiz' ? (
		<p className="mt-2 text-xs text-gray-500">
			Quiz questions are managed in the Quiz Builder (next feature).
		</p>
	) : null;
}
```

Replace this with:

```tsx
{
	lesson.type === 'quiz' ? (
		<div className="mt-2 px-3 pb-3">
			<Link
				href={`/admin/courses/${courseId}/lessons/${lesson.id}/quiz`}
				className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-indigo-200 px-3 py-2 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
			>
				<HelpCircle size={12} />
				Manage Quiz Questions
			</Link>
		</div>
	) : null;
}
```

`HelpCircle` from `lucide-react` is already imported in `LessonList.tsx`.

### 🔵 Testing Pattern for Quiz Actions (node:test)

```ts
// src/server/actions/quizzes/shared.test.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { createQuizQuestionWithDependencies, type QuizActionDependencies } from './shared.ts';

function createDependencies(
	overrides: Partial<QuizActionDependencies> = {},
): QuizActionDependencies {
	return {
		getSession: async () => ({ user: { id: 'admin-1', role: 'admin' } }),
		insertQuiz: async () => 42,
		updateQuiz: async () => undefined,
		deleteQuiz: async () => undefined,
		getLessonCourseId: async () => ({ courseId: 1, lessonId: 5 }),
		getQuizLessonId: async () => 5,
		revalidatePaths: () => undefined,
		...overrides,
	};
}

void test('createQuizQuestionWithDependencies rejects unauthorized requests', async () => {
	const result = await createQuizQuestionWithDependencies(
		'5',
		createDependencies({ getSession: async () => null }),
	);
	assert.deepEqual(result, { success: false, error: 'Unauthorized.' });
});
```

**For component tests** use vitest + `@testing-library/react` (same as `LessonList.test.tsx`, `ChapterList.test.tsx`).

### 🔵 Empty State for Quiz Builder

Per UX anti-pattern rule ("No empty states = confusion"):

```tsx
{
	quizzes.length === 0 && (
		<div className="flex flex-col items-center py-12 text-center">
			<svg
				className="mb-3 h-10 w-10 text-gray-300"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1}
					d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<p className="mb-1 text-sm font-medium text-gray-700">No questions yet</p>
			<p className="mb-4 text-xs text-gray-400">Add your first question to build this quiz.</p>
			<Button
				onClick={handleAddQuestion}
				variant="outline"
				size="sm"
				className="min-h-[44px] border-indigo-200 text-indigo-600 hover:bg-indigo-50"
			>
				+ Add First Question
			</Button>
		</div>
	);
}
```

### 🔵 Skeleton Loaders — Quiz Builder Loading State

Per UX spec (NFR-U2): Skeleton Loaders mandatory:

```tsx
{
	isCreating && (
		<div className="space-y-3 mt-3">
			{[1, 2].map((i) => (
				<Skeleton key={i} className="h-[180px] w-full rounded-md" />
			))}
		</div>
	);
}
```

`Skeleton` component: already installed at `~/components/ui/skeleton`.

### 🔵 "Add Question" Button Style

The "Add Question" button (non-empty state, at bottom of list) follows the same dashed-border pattern as "Add Lesson":

```tsx
<Button
	type="button"
	onClick={() => void handleAddQuestion()}
	variant="ghost"
	size="sm"
	disabled={isCreating}
	className="mt-4 h-[36px] w-full border border-dashed border-gray-300 text-xs font-medium text-gray-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50"
>
	{isCreating ? 'Adding...' : '+ Add Question'}
</Button>
```

### 🔵 Toast Notification Spec — Exact Text & Variants

All toasts use **`sonner`** (already installed — see `import { toast } from 'sonner'` in `LessonList.tsx`). Position is always `bottom-right`, matching the established pattern.

| Trigger                       | Call                                                         | Text                       |
| ----------------------------- | ------------------------------------------------------------ | -------------------------- |
| Question created successfully | `toast.success(...)`                                         | `"Question added"`         |
| Question field auto-saved     | `toast.success(...)`                                         | `"Question saved"`         |
| Correct answer saved          | `toast.success(...)`                                         | `"Answer saved"`           |
| Points saved                  | `toast.success(...)`                                         | `"Question saved"`         |
| Question deleted              | _(no success toast — card disappears, that IS the feedback)_ | —                          |
| Any mutation fails            | `toast.error(...)`                                           | `"Save failed: {error}"`   |
| Delete fails                  | `toast.error(...)`                                           | `"Delete failed: {error}"` |

```ts
// Success pattern (duration 2000ms — matches LessonList.tsx exactly)
toast.success('Question saved', { duration: 2000, position: 'bottom-right' });

// Error pattern (duration 4000ms — matches LessonList.tsx exactly)
toast.error(`Save failed: ${result.error}`, { duration: 4000, position: 'bottom-right' });
```

> **Delete has no success toast** — the card vanishing from the list is sufficient visual feedback (confirmed against LessonList.tsx pattern where delete also has no success toast, only error).

### 🔵 Field-Level Error State Visual

Per UX spec: _"highlight input merah + pesan solutif"_. When an auto-save returns `success: false`:

1. The **toast error** fires (see table above) — primary feedback
2. The **input border turns red** via a transient `isError` state:

```tsx
// In QuizQuestionCard — field error state pattern
const [saveError, setSaveError] = useState<string | null>(null);

// On failed save:
setSaveError("question"); // or "optionA", "points", etc.
setTimeout(() => setSaveError(null), 3000); // auto-clear after 3s

// In JSX — apply error border when saveError matches this field:
className={`... ${saveError === "question" ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"}`}
```

> **No inline error message text below the field** — the toast is sufficient for admin CMS context. This avoids layout shift in the card.

### 🔵 Correct Answer Row — Highlight Transition

When a correct answer radio changes, the **entire option row** transitions to `bg-indigo-50`:

```tsx
<div
  key={letter}
  className={`flex items-center gap-2 rounded-md px-2 min-h-[44px] transition-colors duration-150 ${
    correctAnswer === letter ? "bg-indigo-50" : "bg-white"
  }`}
>
  <input type="radio" ... className="h-4 w-4 accent-indigo-600 cursor-pointer" />
  <label className="w-5 shrink-0 text-[10px] font-semibold text-gray-600">{letter}</label>
  <input type="text" ... />
</div>
```

> `transition-colors duration-150` gives a subtle 150ms fade when user clicks a different correct answer. This is within the 300ms motion limit from the UX spec accessibility section.

### 🔵 "Add Question" Button — Placement & Sticky Behavior

The "Add Question" dashed button is placed **at the bottom of the question list**, flowing naturally (NOT sticky/fixed). This matches the "Add Lesson" button in `LessonList.tsx` (line 357–369):

```
[ QuizQuestionCard 1 ]
[ QuizQuestionCard 2 ]
[ QuizQuestionCard 3 ]
[ + Add Question     ]  ← flows below the last card, mt-4
```

For very long lists (many questions), the user scrolls down naturally. No sticky behavior — admin CMS is desktop-first and scrolling is acceptable per UX spec.

### 🔵 Admin Zone Color Tokens (Identical to Story 5.4)

| Token             | Value                                | Usage                    |
| ----------------- | ------------------------------------ | ------------------------ |
| Card bg           | `bg-white`                           | Question card background |
| Card border       | `border-gray-200`                    | Question card border     |
| Input border      | `border-gray-200`                    | All text inputs          |
| Focus border      | `focus:border-indigo-500`            | Focus state              |
| Focus ring        | `focus:ring-1 focus:ring-indigo-500` | Subtle 1px ring          |
| Primary accent    | `indigo-600` / `#4F46E5`             | Radio, links, CTAs       |
| Correct answer bg | `bg-indigo-50`                       | Correct option row bg    |
| Destructive idle  | `text-gray-400`                      | Subtle delete            |
| Destructive hover | `text-red-600` + `bg-red-50`         | Full destructive         |

### 🔵 Typography Scale Reference — Admin Zone (Same as Story 5.4)

| Element          | Class                                                              |
| ---------------- | ------------------------------------------------------------------ |
| Section headings | `text-sm font-semibold text-gray-900`                              |
| Form labels      | `text-[10px] font-semibold text-gray-600 uppercase tracking-wider` |
| Input text       | `text-sm text-gray-900`                                            |
| Placeholder      | `placeholder:text-gray-400`                                        |
| Helper text      | `text-[11px] text-gray-400`                                        |
| Error messages   | `text-[11px] text-red-500`                                         |
| Question number  | `text-[10px] font-semibold uppercase tracking-wider text-gray-500` |

### 🟢 What Already Exists (DO NOT Recreate)

```
project-e-course/src/server/db/schema.ts              — `quizzes` table (already defined, DO NOT modify)
project-e-course/src/server/db/index.ts               — `db` Drizzle instance
project-e-course/src/server/auth.ts                   — NextAuth with role in JWT
project-e-course/src/middleware.ts                    — /admin/* protection (Edge)
project-e-course/src/types/index.ts                   — ActionResponse<T> (use as-is)
project-e-course/src/components/ui/alert-dialog.tsx   — Already installed (Story 5.2)
project-e-course/src/components/ui/skeleton.tsx       — Already installed
project-e-course/src/components/ui/button.tsx         — Use for all buttons
project-e-course/src/components/admin/LessonList.tsx  — EXTEND (add courseId prop, update quiz link)
project-e-course/src/components/admin/ChapterList.tsx — EXTEND (pass courseId to LessonList)
project-e-course/src/server/actions/lessons/shared.ts — Mirror pattern exactly for quizzes
project-e-course/src/server/actions/progress/submit-quiz.shared.ts — Existing student quiz submit (DO NOT modify)
project-e-course/src/app/(admin)/admin/layout.tsx     — Admin layout already applies to new route group
```

> **IMPORTANT:** `submit-quiz` in `server/actions/progress/` is the **student-facing** quiz grader. The new `server/actions/quizzes/` is the **admin-facing** quiz builder. They are separate concerns. Do NOT modify the student quiz submit action.

### 🟢 New Files to Create

```
project-e-course/src/lib/validations/quiz.ts
project-e-course/src/server/queries/quizzes.shared.ts
project-e-course/src/server/queries/quizzes.ts
project-e-course/src/server/queries/quizzes.test.ts
project-e-course/src/server/actions/quizzes/shared.ts
project-e-course/src/server/actions/quizzes/index.ts
project-e-course/src/server/actions/quizzes/shared.test.ts
project-e-course/src/components/admin/QuizQuestionList.tsx
project-e-course/src/components/admin/QuizQuestionList.test.tsx
project-e-course/src/components/admin/QuizQuestionCard.tsx
project-e-course/src/app/(admin)/admin/courses/[courseId]/lessons/[lessonId]/quiz/page.tsx
```

### 🟢 Files to Edit (Not Recreate)

```
project-e-course/src/components/admin/LessonList.tsx
  → Add courseId: number prop
  → Replace quiz placeholder text with <Link> to /admin/courses/[courseId]/lessons/[lesson.id]/quiz
  → Import Link from 'next/link'

project-e-course/src/components/admin/ChapterList.tsx
  → Forward courseId prop to each <LessonList courseId={Number(courseId)} ...>
  → (ChapterList already receives courseId: string — parse it as Number when passing to LessonList)

project-e-course/src/server/queries/lessons.ts
  → Add getLessonById(lessonId: number): Promise<LessonRow | null> function
  → Use: db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1), return result[0] ?? null
```

### 🟢 TypeScript Conventions (Same as All Previous Stories)

- **No `any` types** — Use `QuizRow` (inferred `InferSelectModel<typeof quizzes>`) throughout
- **File naming:** `kebab-case` for files, `PascalCase` for components
- **Import alias:** `~` maps to `src/`
- **Server Action return:** Always `ActionResponse<T>` from `~/types/index.ts`
- **Error handling:** `try/catch` in Server Actions, return `{ success: false, error: message }` — do NOT throw
- **strict mode:** Zero tolerance for `any` types (NFR-M1)

### Project Structure Notes

- New route: `(admin)/admin/courses/[courseId]/lessons/[lessonId]/quiz/page.tsx` — nested under existing admin layout
- Feature-sliced actions: `src/server/actions/quizzes/` (separate from `progress/` domain)
- NFR-M2: **No schema migrations needed** — `quizzes` table already exists in `schema.ts`
- The Quiz Builder page is a dedicated route, NOT an inline component on the course editor — keeps the course editor page lightweight
- The `[courseId]` and `[lessonId]` dynamic segments in the route file path MUST be wrapped in `await params` before use (Next.js 15 async params requirement)

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — FR24: Admin creates quiz questions and correct answer keys for quiz lessons; Epic 5 overview; Story 5.5 acceptance criteria]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — Feature-Sliced Actions (`server/actions/quizzes/`), Admin Zone route group `(admin)`, Middleware `/admin/*` protection, `ActionResponse<T>` standard, Zod dual-layer validation, TypeScript strict mode, `revalidatePath` for cache busting, RSC + Server Actions pattern, Drizzle ORM, index.ts+shared.ts split pattern, Next.js 15 async params]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — Admin Zone always light (white bg + 1px `#E5E7EB` borders, no shadow, no decorations); Auto-save first (no Save button for text/content fields); Desktop-First CMS; AlertDialog for destructive; Toast feedback (NFR-U3); Empty states with illustration + CTA; Skeleton loaders mandatory (NFR-U2); Touch target 44×44px (WCAG AA); Admin emotional goal: Confident & In Control]
- [Source: `_bmad-output/implementation-artifacts/5-4-lesson-content-management.md` — Physical project root `project-e-course/`, Admin Zone is ALWAYS Light Mode, established `LessonTitleInput` debounce auto-save pattern with `useRef`+`window.setTimeout`+`form.getValues()+safeParse`, `ActionResponse<T>` at `~/types/index.ts`, `alert-dialog.tsx` installed, Feature-Sliced index.ts+shared.ts architecture, dependency injection for testability, Node.js test runner pattern, vitest component test pattern, quiz placeholder note to replace, `HelpCircle` lucide icon already imported in LessonList]
- [Source: `project-e-course/src/server/db/schema.ts` — Actual `quizzes` table definition: serial id, integer lessonId (cascade), text question/optionA/B/C/D (NOT NULL), varchar correctAnswer 1 (NOT NULL), integer points (default 10, NOT NULL), timestamp createdAt (no updatedAt, no order)]
- [Source: `project-e-course/src/server/actions/lessons/shared.ts` — Exact pattern to mirror for quiz actions: parseEntityId, requireAdminSession, getValidationErrorMessage, dependency injection types]
- [Source: `project-e-course/src/server/queries/lessons.shared.ts` — InferSelectModel pattern for QuizRow type definition]
- [Source: `project-e-course/src/components/admin/LessonList.tsx` — courseId prop gap identified; HelpCircle already imported; quiz placeholder note location at lesson.type === 'quiz' conditional block]

## Dev Agent Record

### Agent Model Used

cliproxy/gpt-5.4

### Debug Log References

- Added quiz validation/query/action/component/page implementations under `project-e-course/src/...`.
- Added `getLessonById` query helper in `project-e-course/src/server/queries/lessons.ts` and shared/test coverage.
- Validation executed: `npm test -- src/lib/validations/quiz.test.ts src/server/queries/quizzes.test.ts src/server/queries/lessons.test.ts src/server/actions/quizzes/shared.test.ts`
- Validation executed: `npx vitest run "src/components/admin/LessonList.test.tsx" "src/components/admin/ChapterList.test.tsx" "src/components/admin/QuizQuestionList.test.tsx" "src/app/(admin)/admin/courses/[courseId]/page.test.tsx" "src/app/(admin)/admin/courses/[courseId]/lessons/[lessonId]/quiz/page.test.tsx"`
- Validation executed: `npm run check`
- Full regression blocker: `npx vitest run` fails in pre-existing suites importing `src/server/auth.ts` via `next-auth/adapters` resolution (`src/app/(admin)/admin/courses/page.test.tsx`, `src/app/(student)/courses/[slug]/lessons/[lessonId]/page.integration.test.tsx`, `src/app/(student)/courses/[slug]/lessons/[lessonId]/page.test.tsx`, `src/components/student/quiz-engine.test.tsx`).

### Completion Notes List

- Implemented FR24 admin quiz builder route, query layer, and server actions with `ActionResponse<T>` contracts and revalidation.
- Implemented admin quiz UI: list, card editing, add/delete flows, empty state, skeletons, toast feedback, correct-answer highlighting, and touch-target compliant controls.
- Replaced quiz placeholder in `LessonList.tsx` with navigable Quiz Builder link and threaded `courseId` through `ChapterList`.
- Added node:test coverage for validation/query/action logic and vitest coverage for admin list/page flows.
- Story implementation is functionally complete, but workflow cannot advance to review until repo-wide regression suite passes.

### File List

- project-e-course/src/lib/validations/quiz.ts
- project-e-course/src/lib/validations/quiz.test.ts
- project-e-course/src/server/queries/quizzes.shared.ts
- project-e-course/src/server/queries/quizzes.ts
- project-e-course/src/server/queries/quizzes.test.ts
- project-e-course/src/server/queries/lessons.shared.ts
- project-e-course/src/server/queries/lessons.ts
- project-e-course/src/server/queries/lessons.test.ts
- project-e-course/src/server/actions/quizzes/shared.ts
- project-e-course/src/server/actions/quizzes/index.ts
- project-e-course/src/server/actions/quizzes/shared.test.ts
- project-e-course/src/components/admin/LessonList.tsx
- project-e-course/src/components/admin/LessonList.test.tsx
- project-e-course/src/components/admin/ChapterList.tsx
- project-e-course/src/components/admin/ChapterList.test.tsx
- project-e-course/src/components/admin/QuizQuestionCard.tsx
- project-e-course/src/components/admin/QuizQuestionList.tsx
- project-e-course/src/components/admin/QuizQuestionList.test.tsx
- project-e-course/src/app/(admin)/admin/courses/[courseId]/lessons/[lessonId]/quiz/page.tsx
- project-e-course/src/app/(admin)/admin/courses/[courseId]/lessons/[lessonId]/quiz/page.test.tsx
