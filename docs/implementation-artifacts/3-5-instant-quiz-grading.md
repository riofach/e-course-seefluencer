# Story 3.5: Instant Quiz Grading

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a student,
I want to see my quiz score immediately after submission,
so that I know if I passed the material or need to retake it.

## Acceptance Criteria

1. **Given** I submit my quiz answers via the "Submit Quiz" button in `QuizEngine`,
   **When** the `submitQuiz` server action runs,
   **Then** the server fetches the `correctAnswer` and `points` for every quiz in that lesson from the `quizzes` table,
   **And** calculates the total earned points vs. total possible points.

2. **Given** the score is calculated server-side,
   **When** `score / totalPoints >= 0.70`,
   **Then** the action returns `{ success: true, data: { score, totalPoints, passed: true } }`,
   **And** a new row is inserted into `quiz_attempts` (fields: `userId`, `lessonId`, `score`, `totalPoints`, `passed: true`).

3. **Given** the score is calculated server-side,
   **When** `score / totalPoints < 0.70`,
   **Then** the action returns `{ success: true, data: { score, totalPoints, passed: false } }`,
   **And** a new row is inserted into `quiz_attempts` (fields: `userId`, `lessonId`, `score`, `totalPoints`, `passed: false`).

4. **Given** the grading action returns a result,
   **When** `passed === true`,
   **Then** the `QuizEngine` UI transitions to a **"Passed" result state** — displays an animated ring-chart showing the score percentage, a green "Passed" badge, the score (e.g., "8 / 10"), and a "Continue" or "Next Lesson" CTA.

5. **Given** the grading action returns a result,
   **When** `passed === false`,
   **Then** the `QuizEngine` UI transitions to a **"Failed" result state** — displays an animated ring-chart showing the score percentage, a red "Failed" badge, the score (e.g., "5 / 10"), and a "Retake Quiz" button that resets the quiz state.

6. **Given** the quiz is passed,
   **When** the result UI renders,
   **Then** a Toast notification fires: "Quiz Passed! 🎉" (Success variant).

7. **Given** the quiz is failed,
   **When** the result UI renders,
   **Then** a Toast notification fires: "Quiz Failed. Try again." (Destructive variant).

8. **Given** the quiz was already previously passed (a `quiz_attempts` row with `passed: true` for that `userId` + `lessonId` exists),
   **When** the student retakes the quiz,
   **Then** the action still records a new attempt (do not block retakes), but only marks `user_progress` as complete on the FIRST pass (idempotent — do not duplicate `user_progress` entries).

9. **Given** passing the quiz for the first time,
   **When** `passed === true` and no prior `user_progress` record for this lesson exists,
   **Then** a row is inserted into `user_progress` (`userId`, `lessonId`, `completed: true`) — this updates the course sidebar progress bar (identical behavior to Story 3.3 "Mark as Complete").

10. **Given** the grading action encounters an unauthorized request (no session),
    **When** the action runs,
    **Then** it returns `{ success: false, error: "Unauthorized." }` (identical to Story 3.4's auth guard pattern — do not change this).

## Tasks / Subtasks

- [x] **Replace `submitQuiz` stub body with real grading logic** (AC: 1, 2, 3, 8, 9, 10)
  - [x] In `src/server/actions/progress/submit-quiz.ts`, keep the existing auth guard + Zod validation from Story 3.4 — do NOT remove them
  - [x] After validation, fetch correct answers and points: `db.select({ id: quizzes.id, correctAnswer: quizzes.correctAnswer, points: quizzes.points }).from(quizzes).where(eq(quizzes.lessonId, lessonId))`
  - [x] Calculate: `score = sum of quiz.points where answers[quiz.id] === quiz.correctAnswer`
  - [x] Calculate: `totalPoints = sum of all quiz.points for that lessonId`
  - [x] Determine: `passed = score / totalPoints >= 0.70`
  - [x] Insert into `quizAttempts`: `db.insert(quizAttempts).values({ userId: session.user.id, lessonId, score, totalPoints, passed })`
  - [x] Conditionally insert into `userProgress` (AC: 8, 9): check `db.select().from(userProgress).where(and(eq(userProgress.userId, ...), eq(userProgress.lessonId, ...)))` — only insert if no existing row
  - [x] Call `revalidatePath(\`/courses/${courseSlug}/lessons/${lessonId}\`)` after DB operations
  - [x] Return `{ success: true, data: { score, totalPoints, passed } }`
  - [x] Wrap DB operations in try/catch — return `{ success: false, error: "Failed to grade quiz." }` on error

- [x] **Update `QuizEngine` to handle result state** (AC: 4, 5, 6, 7)
  - [x] In `src/components/student/quiz-engine.tsx`, add result state: `const [result, setResult] = useState<{ score: number; totalPoints: number; passed: boolean } | null>(null)`
  - [x] In `handleSubmit`, after `await submitQuiz(...)`, check response — if `response.success`, call `setResult(response.data)` and trigger toast
  - [x] If `result !== null`, render the `QuizResultDisplay` component (or inline result UI) instead of the question list
  - [x] Pass `onRetake={() => setResult(null)}` to reset back to quiz form for failed state
  - [x] Result UI must show: animated ring-chart (SVG or CSS conic-gradient), score text (`${score} / ${totalPoints}`), pass/fail badge, and CTA button

- [x] **Build `QuizResultDisplay` component** (AC: 4, 5)
  - [x] Create `src/components/student/quiz-result-display.tsx` as a Client Component (`'use client'`)
  - [x] Props: `score: number`, `totalPoints: number`, `passed: boolean`, `onRetake: () => void`, `courseSlug: string`, `nextLessonId?: number`
  - [x] Render animated score ring using CSS `conic-gradient` via inline style: `background: conic-gradient(var(--color-indigo) {percentage}%, var(--muted) 0)`
  - [x] Passed state: green badge ("Passed ✓"), score text, and a link/button to `nextLessonId` (or course page if last lesson)
  - [x] Failed state: red badge ("Failed ✗"), score text, and "Retake Quiz" button that calls `onRetake()`
  - [x] Animate ring entrance: use `transition-all duration-700` on a wrapper with `transform: scale(0) → scale(1)` or equivalent Tailwind animate class
  - [x] Apply Toast inside `QuizEngine` (not inside `QuizResultDisplay`) to avoid duplicate toasts on re-render

- [x] **Wire toast notifications** (AC: 6, 7)
  - [x] Use `sonner` toast (the project uses Sonner via shadcn): `import { toast } from "sonner"`
  - [x] On passed: `toast.success("Quiz Passed! 🎉")`
  - [x] On failed: `toast.error("Quiz Failed. Try again.")`
  - [x] Fire toast ONCE per submission — inside `handleSubmit` after receiving the result, before `setResult`

- [x] **Pass `nextLessonId` (optional) to `QuizEngine`** from lesson `page.tsx` (AC: 4)
  - [x] In `src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx`, determine the next lesson id (already available as a sibling query or from the sidebar data loaded in Stories 3.1/3.2)
  - [x] Pass `nextLessonId` prop down: `<QuizEngine ... nextLessonId={nextLessonId} />`
  - [x] If this requires a new query, add it to the existing lesson page RSC body — do NOT add a new client-side fetch

- [x] **Write unit tests** (testing requirement)
  - [x] Create `src/server/actions/progress/submit-quiz.test.ts` (update existing if already created in 3.4)
  - [x] Test: correct answers all → `passed: true`, score equals sum of all points
  - [x] Test: all wrong answers → `passed: false`, score = 0
  - [x] Test: exactly 70% threshold → `passed: true`
  - [x] Test: 69.9% → `passed: false`
  - [x] Test: empty `quizzes` array for lessonId → `totalPoints = 0`, `passed = false` (edge case)
  - [x] Extract pure grading logic to `src/server/actions/progress/submit-quiz.shared.ts` for testability

## Dev Notes

### 🔴 Critical Architecture Notes

**1. `submitQuiz` Action — Replace Stub Body (Do NOT Delete Existing Guards)**

Story 3.4 created a stub at `src/server/actions/progress/submit-quiz.ts` with:

- `"use server"` directive ✅ — keep it
- `getServerAuthSession()` auth guard ✅ — keep it
- Zod `answerSchema` validation ✅ — keep it

**Story 3.5 ONLY replaces the code AFTER the `parsed.success` validation check** — the grading logic goes in place of the `return { success: true, data: { score: 0 ... } }` placeholder.

```ts
// Story 3.5: Replace placeholder body with real grading logic
'use server';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { quizzes, quizAttempts, userProgress } from '~/server/db/schema';
import { getServerAuthSession } from '~/server/auth';
import { revalidatePath } from 'next/cache';
import type { ActionResponse } from '~/types';

const answerSchema = z.record(z.coerce.number().int().positive(), z.enum(['A', 'B', 'C', 'D']));

export async function submitQuiz(
	lessonId: number,
	courseSlug: string,
	answers: Record<number, string>,
): Promise<ActionResponse<{ score: number; totalPoints: number; passed: boolean }>> {
	const session = await getServerAuthSession();
	if (!session?.user?.id) return { success: false, error: 'Unauthorized.' };

	const parsed = answerSchema.safeParse(answers);
	if (!parsed.success) return { success: false, error: 'Invalid answers format.' };

	try {
		// 1. Fetch correct answers + points from server (NEVER exposed to client)
		const quizData = await db
			.select({ id: quizzes.id, correctAnswer: quizzes.correctAnswer, points: quizzes.points })
			.from(quizzes)
			.where(eq(quizzes.lessonId, lessonId));

		// 2. Grade
		const { score, totalPoints } = calculateScore(quizData, parsed.data);
		const passed = totalPoints > 0 && score / totalPoints >= 0.7;

		// 3. Insert quiz_attempt (always, even retakes)
		await db.insert(quizAttempts).values({
			userId: session.user.id,
			lessonId,
			score,
			totalPoints,
			passed,
		});

		// 4. Idempotent user_progress insert (only on first pass)
		if (passed) {
			const existing = await db
				.select({ id: userProgress.id })
				.from(userProgress)
				.where(and(eq(userProgress.userId, session.user.id), eq(userProgress.lessonId, lessonId)))
				.limit(1);

			if (existing.length === 0) {
				await db.insert(userProgress).values({
					userId: session.user.id,
					lessonId,
					completed: true,
				});
			}
		}

		revalidatePath(`/courses/${courseSlug}/lessons/${lessonId}`);
		return { success: true, data: { score, totalPoints, passed } };
	} catch {
		return { success: false, error: 'Failed to grade quiz.' };
	}
}
```

**2. Extract Pure Grading Logic for Testability**

```ts
// src/server/actions/progress/submit-quiz.shared.ts
export type QuizGradeInput = { id: number; correctAnswer: string; points: number };
export type AnswerMap = Record<number, string>;

export function calculateScore(
	quizData: QuizGradeInput[],
	answers: AnswerMap,
): { score: number; totalPoints: number } {
	let score = 0;
	let totalPoints = 0;
	for (const q of quizData) {
		totalPoints += q.points;
		if (answers[q.id] === q.correctAnswer) {
			score += q.points;
		}
	}
	return { score, totalPoints };
}
```

**3. `QuizEngine` Result State Flow**

```tsx
// src/components/student/quiz-engine.tsx — additions for 3.5
'use client';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { submitQuiz } from '~/server/actions/progress/submit-quiz';
import { QuizResultDisplay } from './quiz-result-display';

// ... existing props type + add:
type Props = {
	questions: ClientQuizQuestion[];
	lessonId: number;
	courseSlug: string;
	nextLessonId?: number; // NEW — optional, for CTA after passing
};

export function QuizEngine({ questions, lessonId, courseSlug, nextLessonId }: Props) {
	const [answers, setAnswers] = useState<Record<number, string>>({});
	const [isPending, startTransition] = useTransition();
	const [result, setResult] = useState<{
		score: number;
		totalPoints: number;
		passed: boolean;
	} | null>(null);

	// If result state is set → show result UI
	if (result !== null) {
		return (
			<QuizResultDisplay
				score={result.score}
				totalPoints={result.totalPoints}
				passed={result.passed}
				onRetake={() => setResult(null)}
				courseSlug={courseSlug}
				nextLessonId={nextLessonId}
			/>
		);
	}

	const allAnswered = Object.keys(answers).length === questions.length;

	const handleSubmit = () => {
		startTransition(async () => {
			const response = await submitQuiz(lessonId, courseSlug, answers);
			if (response.success) {
				if (response.data.passed) {
					toast.success('Quiz Passed! 🎉');
				} else {
					toast.error('Quiz Failed. Try again.');
				}
				setResult(response.data);
			} else {
				toast.error(response.error ?? 'Something went wrong.');
			}
		});
	};

	// ... rest of existing render (radio buttons, submit button)
}
```

**4. `QuizResultDisplay` Component — Animated Ring-Chart**

```tsx
// src/components/student/quiz-result-display.tsx
'use client';
import Link from 'next/link';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';

type Props = {
	score: number;
	totalPoints: number;
	passed: boolean;
	onRetake: () => void;
	courseSlug: string;
	nextLessonId?: number;
};

export function QuizResultDisplay({
	score,
	totalPoints,
	passed,
	onRetake,
	courseSlug,
	nextLessonId,
}: Props) {
	const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
	const ringColor = passed ? '#22C55E' : '#EF4444'; // Success green or Destructive red

	return (
		<div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6 py-12 text-center animate-in fade-in duration-500">
			{/* Animated ring-chart via CSS conic-gradient */}
			<div
				className="relative flex h-40 w-40 items-center justify-center rounded-full transition-all duration-700"
				style={{
					background: `conic-gradient(${ringColor} ${percentage}%, var(--muted) 0)`,
				}}
			>
				<div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-background">
					<span className="text-3xl font-bold">{percentage}%</span>
					<span className="text-xs text-muted-foreground">
						{score} / {totalPoints} pts
					</span>
				</div>
			</div>

			<Badge variant={passed ? 'default' : 'destructive'} className="text-base px-4 py-1">
				{passed ? 'Passed ✓' : 'Failed ✗'}
			</Badge>

			<p className="text-muted-foreground text-sm">
				{passed
					? 'Great job! You cleared this quiz.'
					: 'You need 70% or more to pass. Review the material and try again.'}
			</p>

			{passed && nextLessonId ? (
				<Button asChild className="w-full">
					<Link href={`/courses/${courseSlug}/lessons/${nextLessonId}`}>Next Lesson →</Link>
				</Button>
			) : passed ? (
				<Button asChild variant="secondary" className="w-full">
					<Link href={`/courses/${courseSlug}`}>Back to Course</Link>
				</Button>
			) : (
				<Button onClick={onRetake} variant="outline" className="w-full">
					Retake Quiz
				</Button>
			)}
		</div>
	);
}
```

### 🔵 Database Schema Reference (No Migration Needed)

Both required tables **already exist** in `src/server/db/schema.ts`. Do NOT create new migrations.

**`quizzes` table** (read-only in this story):

```ts
export const quizzes = createTable('quizzes', {
	id: serial('id').primaryKey(),
	lessonId: integer('lesson_id')
		.notNull()
		.references(() => lessons.id, { onDelete: 'cascade' }),
	question: text('question').notNull(),
	optionA: text('option_a').notNull(),
	optionB: text('option_b').notNull(),
	optionC: text('option_c').notNull(),
	optionD: text('option_d').notNull(),
	correctAnswer: varchar('correct_answer', { length: 1 }).notNull(), // 'A'|'B'|'C'|'D'
	points: integer('points').notNull().default(10),
});
```

**`quizAttempts` table** (insert new row per submission):

```ts
export const quizAttempts = createTable('quiz_attempts', {
	id: serial('id').primaryKey(),
	userId: varchar('user_id', { length: 255 })
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	lessonId: integer('lesson_id')
		.notNull()
		.references(() => lessons.id, { onDelete: 'cascade' }),
	score: integer('score').notNull(),
	totalPoints: integer('total_points').notNull(),
	passed: boolean('passed').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
```

**`userProgress` table** (idempotent insert on first pass):

```ts
export const userProgress = createTable('user_progress', {
	id: serial('id').primaryKey(),
	userId: varchar('user_id', { length: 255 })
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	lessonId: integer('lesson_id')
		.notNull()
		.references(() => lessons.id, { onDelete: 'cascade' }),
	completed: boolean('completed').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
```

### 🟡 Security: `correctAnswer` Must NEVER Reach the Client

- **Story 3.4** already handled this: `ClientQuizQuestion` type deliberately omits `correctAnswer` and `points`.
- **Story 3.5** fetches correct answers ONLY inside the server action — they are never serialized into a page response or client component prop.
- The `calculateScore` function runs server-side only. Test it via `.shared.ts` pattern.

### 🟡 `userProgress` Idempotency — Critical Constraint

`userProgress` must NOT create duplicate rows for the same `userId` + `lessonId` combination. The sidebar progress bar (Story 3.3) counts distinct completed lessons — a duplicate would NOT cause wrong percentages if there's a UNIQUE constraint, but the current schema may not have one. **Use the existence check pattern above to be safe.**

If the schema has a UNIQUE constraint on `(userId, lessonId)`, use `.onConflictDoNothing()`:

```ts
await db.insert(userProgress).values({ ... }).onConflictDoNothing();
```

Check `src/server/db/schema.ts` for any `uniqueIndex` on `user_progress` before deciding.

### 🟡 Passing Threshold — Hard-Coded at 70%

The `passed` determination uses `score / totalPoints >= 0.70`. This is NOT configurable per-lesson or per-quiz. Do not add a per-lesson threshold column — keep it as a compile-time constant in `submit-quiz.shared.ts`:

```ts
export const PASS_THRESHOLD = 0.7;
```

### 🟢 `revalidatePath` — Required After DB Mutation

After all DB operations, call:

```ts
revalidatePath(`/courses/${courseSlug}/lessons/${lessonId}`);
```

This ensures the sidebar reflects the new `user_progress` entry (same pattern as `mark-lesson-complete.ts` from Story 3.3). [Source: `src/server/actions/progress/mark-lesson-complete.ts`]

### 🟢 Toast Library

The project uses **Sonner** (installed via shadcn/ui `toast` component). Import directly from `"sonner"`:

```ts
import { toast } from 'sonner';
```

Do NOT use `react-hot-toast` or any other library. [Source: `_bmad-output/planning-artifacts/architecture.md` — shadcn/ui as base]

### 🟢 Animation — `animate-in fade-in` Tailwind Class

The project has Tailwind `animate-in` utilities available (from `tailwindcss-animate` which is a shadcn/ui dependency). Use:

- `animate-in fade-in duration-500` for result panel entrance
- Do NOT add external animation libraries (Framer Motion, GSAP, etc.)

### 🟢 AutoNavCountdown After Quiz Pass — Scope Clarification

Story 3.5 does NOT implement `AutoNavCountdown` after quiz pass. The "Continue" CTA is a manual button link. Auto-navigation is for non-quiz lessons only (Story 3.2). See AC 4 — the CTA is a `<Link>` to `nextLessonId`, not a timed redirect.

### Project Structure Notes

**New files to create:**

```
src/server/actions/progress/submit-quiz.shared.ts   — Pure grading logic (calculateScore fn)
src/server/actions/progress/submit-quiz.test.ts     — node:test unit tests for grading logic
src/components/student/quiz-result-display.tsx      — QuizResultDisplay client component
```

**Files to modify:**

```
src/server/actions/progress/submit-quiz.ts          — Replace stub body with real grading logic
src/components/student/quiz-engine.tsx              — Add result state + QuizResultDisplay render
src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx  — Pass nextLessonId prop to QuizEngine
```

**Files to NOT touch:**

```
src/server/db/schema.ts                             — No schema changes needed
src/server/courses/quiz-questions.ts                — Already selects client-safe fields, no change
src/components/student/mark-complete-button.tsx     — Quiz guard already in place (Story 3.3)
src/components/student/auto-nav-countdown.tsx       — No changes; quiz lessons excluded (Story 3.2)
```

- **All `src/` paths resolve to `project-e-course/src/`** — confirmed from Story 3.4 Dev Agent Record file list.

### Testing Requirements

- **Testing framework:** `node:test` (no Jest/Vitest). Run with `npm test` → `node --test`.
- **Pattern:** Extract `calculateScore` to `submit-quiz.shared.ts` for pure logic testing without server-only imports.

**Unit test coverage required:**

```ts
// submit-quiz.shared.test.ts or submit-quiz.test.ts
import { calculateScore } from './submit-quiz.shared';

// Test 1: All correct answers
const allCorrect = [
	{ id: 1, correctAnswer: 'A', points: 10 },
	{ id: 2, correctAnswer: 'B', points: 10 },
];
assert.deepEqual(calculateScore(allCorrect, { 1: 'A', 2: 'B' }), { score: 20, totalPoints: 20 });

// Test 2: All wrong
assert.deepEqual(calculateScore(allCorrect, { 1: 'C', 2: 'D' }), { score: 0, totalPoints: 20 });

// Test 3: Exactly 70% (7/10) → passes threshold
const singleQuiz = [{ id: 1, correctAnswer: 'A', points: 10 }];
const { score, totalPoints } = calculateScore(singleQuiz, { 1: 'A' });
assert.equal(score / totalPoints >= 0.7, true); // 1.0 >= 0.70

// Test 4: 69% → fails (use multi-point variant)
// Test 5: Empty quiz array → { score: 0, totalPoints: 0 }
assert.deepEqual(calculateScore([], {}), { score: 0, totalPoints: 0 });
```

**Manual verification checklist:**

- [ ] Submit quiz with all correct answers → result UI shows "Passed ✓", green ring, toast "Quiz Passed! 🎉"
- [ ] Submit quiz with failing answers → result UI shows "Failed ✗", red ring, toast "Quiz Failed. Try again."
- [ ] "Retake Quiz" button resets to question form
- [ ] "Next Lesson →" navigates to correct next lesson URL
- [ ] `quiz_attempts` row is created in DB after each submission
- [ ] `user_progress` row is created after FIRST pass only (retake does not create duplicate)
- [ ] Course progress bar updates after first-time quiz pass (same as Story 3.3)
- [ ] `npm test` passes
- [ ] `npm run check` (TypeScript strict) passes

### UX Requirements from Design Spec

- **QuizEngine anatomy** (UX Spec, Custom Components section): "Form radio button untuk jawaban, state evaluasi instan (hijau/merah), dan visualisasi skor akhir animasi ring-chart." — Story 3.5 delivers the state evaluation and ring-chart. [Source: `ux-design-specification.md` — Component Strategy, QuizEngine]
- **Triumph emotion on pass:** "Quiz Passed: UI celebrate momen triumph — confetti/glow effect." — For MVP, the green ring + "Passed ✓" badge + toast is sufficient. No confetti library needed unless time permits. [Source: `ux-design-specification.md` — Critical Success Moments]
- **Instant feedback:** "Quiz result: Instant score reveal dengan animasi pass/fail" — Use `animate-in fade-in duration-500` on result panel, ring animates via CSS transition. [Source: `ux-design-specification.md` — Effortless Interactions]
- **Color tokens:** Success = `#22C55E`, Destructive = `#EF4444`, Primary (ring for pass) = `#22C55E`. [Source: `ux-design-specification.md` — Color System]
- **Badge variants:** Use shadcn `Badge` with `variant="default"` (Indigo) for Pass and `variant="destructive"` (Red) for Fail.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 3, Story 3.5 (FR14)]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — QuizEngine custom component, ring-chart, instant feedback, triumph emotion]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — Server Actions pattern, `ActionResponse<T>`, `revalidatePath`, no Redux/Zustand, feature-sliced actions]
- [Source: `_bmad-output/implementation-artifacts/3-4-interactive-quiz-execution.md` — `submitQuiz` stub contract, `ClientQuizQuestion` type, `QuizEngine` structure, `quizAttempts` schema, `userProgress` schema, file locations, `node:test` pattern]
- [Source: `_bmad-output/implementation-artifacts/3-3-progress-tracking-mark-as-complete.md` — `userProgress` insert pattern, `revalidatePath` usage, idempotency via existence check]
- [Source: `project-e-course/src/server/db/schema.ts` — `quizzes`, `quizAttempts`, `userProgress` table definitions]
- [Source: `project-e-course/src/server/actions/progress/mark-lesson-complete.ts` — canonical Server Action pattern for auth + DB + revalidate]
- [Source: `project-e-course/src/server/actions/progress/submit-quiz.ts` — existing stub with auth guard + Zod validation to preserve]

## Dev Agent Record

### Agent Model Used

cliproxy/gpt-5.4

### Debug Log References

- `npm test` → 72/72 passing
- `npm run check` → ESLint + TypeScript passing

### Completion Notes List

- Implemented server-side quiz grading in `submitQuiz` while preserving the Story 3.4 auth guard and Zod validation path.
- Added shared grading utility with `PASS_THRESHOLD`, server-side score calculation, quiz attempt persistence, first-pass-only `userProgress` insertion, and lesson path revalidation.
- Added passed/failed quiz result UI with animated ring chart, Sonner toasts, retake reset flow, and next-lesson/course CTA behavior.
- Wired `nextLessonId` from lesson page RSC data into `QuizEngine` without adding a client fetch.
- Added/updated node:test coverage for grading logic, result UI wiring, and lesson page integration points.

### File List

- `project-e-course/src/server/actions/progress/submit-quiz.ts`
- `project-e-course/src/server/actions/progress/submit-quiz.shared.ts`
- `project-e-course/src/server/actions/progress/submit-quiz.test.ts`
- `project-e-course/src/components/student/quiz-engine.tsx`
- `project-e-course/src/components/student/quiz-engine.test.ts`
- `project-e-course/src/components/student/quiz-result-display.tsx`
- `project-e-course/src/components/student/quiz-result-display.test.ts`
- `project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx`
- `project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/page.test.ts`
- `project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/page.integration.test.ts`

## Change Log

- 2026-03-09: Implemented instant quiz grading, persisted quiz attempts/user progress, added pass/fail result UI with toast feedback, and expanded automated test coverage.
