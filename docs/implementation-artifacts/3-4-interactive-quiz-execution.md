# Story 3.4: Interactive Quiz Execution

Status: done

## Story

As a student,
I want to take a multiple-choice quiz on a Quiz-type lesson,
so that I can test my knowledge on the current chapter.

## Acceptance Criteria

1. **Given** I navigate to a lesson where `lesson.type === 'quiz'`,
   **When** the lesson page renders,
   **Then** the `QuizEngine` component is rendered in place of the current `"Quiz content coming soon"` placeholder div.

2. **Given** the quiz is loaded,
   **When** I view the QuizEngine,
   **Then** all questions for that lesson are displayed (fetched from the `quizzes` table via `lesson_id`),
   **And** each question shows its `question` text and four radio options (A, B, C, D).

3. **Given** I am interacting with the quiz,
   **When** I select an option for a question,
   **Then** exactly one option (A/B/C/D) can be selected per question (radio button group behavior),
   **And** I can change my selection before submitting.

4. **Given** I have selected answers for all questions,
   **When** the "Submit Quiz" button is enabled and clicked,
   **Then** the answers are sent to the Server Action `submitQuiz` (no score calculation in this story — that is Story 3.5).

5. **Given** the quiz has no questions (empty `quizzes` array),
   **When** the quiz lesson renders,
   **Then** an empty state UI is shown: an illustration/icon + message "No questions available yet." (no CTA needed).

6. **Given** I have not yet answered all questions,
   **When** the submit button is rendered,
   **Then** it is disabled until all questions have a selected answer.

7. **Given** I am viewing a quiz lesson,
   **When** the lesson page renders,
   **Then** the "Mark as Complete" button is NOT rendered (this was already implemented in Story 3.3 — the `MarkCompleteButton` returns `null` when `lessonType === 'quiz'`). **Do NOT modify this behavior.**

## Tasks / Subtasks

- [x] **Create `getQuizQuestions` server query** (AC: 2)
  - [x] Create `src/server/courses/quiz-questions.ts` (server-only)
  - [x] Import `db` from `~/server/db/index`, `quizzes` from `~/server/db/schema`
  - [x] Add `import "server-only"` at top
  - [x] Export `async function getQuizQuestions(lessonId: number): Promise<QuizQuestion[]>`
  - [x] Query: `db.select().from(quizzes).where(eq(quizzes.lessonId, lessonId)).orderBy(asc(quizzes.id))`
  - [x] Export `QuizQuestion` type inferred from Drizzle: `type QuizQuestion = typeof quizzes.$inferSelect`
  - [x] Also create `src/server/courses/quiz-questions.shared.ts` for testable pure logic (see testing section)

- [x] **Create `QuizEngine` Client Component** (AC: 1, 2, 3, 4, 5, 6)
  - [x] Create `src/components/student/quiz-engine.tsx` as a Client Component (`'use client'`)
  - [x] Props: `questions: QuizQuestion[]`, `lessonId: number`, `courseSlug: string`
  - [x] If `questions.length === 0`: render empty state — `<div>` with a `HelpCircle` lucide icon + `<p>"No questions available yet."</p>`
  - [x] State: `const [answers, setAnswers] = useState<Record<number, string>>({})` — key is `quizzes.id`, value is `'A' | 'B' | 'C' | 'D'`
  - [x] Render each question as a `<fieldset>` with `<legend>` for the question text
  - [x] Render 4 radio inputs per question: `name={`question-${quiz.id}`}` — this enforces one-selection-per-question
  - [x] `allAnswered` derived: `Object.keys(answers).length === questions.length`
  - [x] Submit button: `disabled={!allAnswered || isPending}` — using `useTransition`
  - [x] On submit: call `startTransition(() => submitQuiz(lessonId, courseSlug, answers))` (Story 3.5 implements the action; for now, wire to a stub or the actual action if already exported)
  - [x] Show `isPending` state on submit button: spinner + "Submitting..." label
  - [x] **Do NOT implement score display or result state here** — that is Story 3.5's scope

- [x] **Create `submitQuiz` Server Action stub** (AC: 4 — needed for QuizEngine wiring)
  - [x] Create `src/server/actions/progress/submit-quiz.ts`
  - [x] Add `"use server"` directive
  - [x] Export `async function submitQuiz(lessonId: number, courseSlug: string, answers: Record<number, string>): Promise<ActionResponse<{ score: number; totalPoints: number; passed: boolean }>>`
  - [x] For Story 3.4 scope: implement auth guard (call `getServerAuthSession`, return `{ success: false, error: "Unauthorized." }` if no session) and basic Zod validation
  - [x] The actual grading logic (score calculation, DB insert into `quiz_attempts`, `user_progress` mark as done) is Story 3.5's responsibility — Story 3.4 only needs the action to accept and validate the payload without error
  - [x] Return `{ success: true, data: { score: 0, totalPoints: 0, passed: false } }` as placeholder (Story 3.5 will replace this body)

- [x] **Fetch quiz questions in lesson `page.tsx` and pass to `QuizEngine`** (AC: 1, 2)
  - [x] In `src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx`:
    - Import `getQuizQuestions` from `~/server/courses/quiz-questions`
    - Import `QuizEngine` from `~/components/student/quiz-engine`
    - In `renderLessonContent`: when `lesson.type === 'quiz'`, call `getQuizQuestions(lesson.id)` and render `<QuizEngine questions={questions} lessonId={lesson.id} courseSlug={courseSlug} />`
    - [x] **Since `renderLessonContent` is currently synchronous**, refactor it to `async` or fetch quiz questions in the RSC body and pass as a prop to `renderLessonContent`
    - [x] Preferred approach: fetch in `LessonPage` RSC body: `const quizQuestions = lesson.type === 'quiz' ? await getQuizQuestions(lesson.id) : []`
    - [x] Then pass `quizQuestions` to `renderLessonContent(lesson, quizQuestions)` — update function signature accordingly

- [x] **Write unit tests for `quiz-questions.shared.ts`** (prerequisite for testability)
  - [x] Create `src/server/courses/quiz-questions.shared.ts` — extract pure mapping logic (e.g., order sorting) if any, or minimal shape contract
  - [x] Create `src/server/courses/quiz-questions.test.ts` using `node:test`
  - [x] Test: empty array input → returns `[]`
  - [x] Test: valid `QuizQuestion[]` → returns same array in correct order

- [x] **Write unit tests for `QuizEngine` component contract**
  - [x] Create `src/components/student/quiz-engine.test.ts` using `node:test`
  - [x] Test: empty questions → renders empty state, no submit button
  - [x] Test: questions present → `allAnswered` logic (given 2 questions with 1 answered, allAnswered is false)
  - [x] Test: all answered → `allAnswered` is true

## Dev Notes

### Critical Architecture Notes

- **`QuizEngine` is the custom component mentioned explicitly in UX spec and architecture** — do NOT reinvent under a different name. It must be `src/components/student/quiz-engine.tsx`. [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — Custom Components section]
- **`quizzes` table already exists** — `src/server/db/schema.ts` has `quizzes` with fields: `id`, `lessonId`, `question`, `optionA`, `optionB`, `optionC`, `optionD`, `correctAnswer`, `points`. **Do NOT create a new schema.** The `correctAnswer` column (`'A'|'B'|'C'|'D'`) and `points` are NOT exposed to the client in Story 3.4 — they are server-side only for Story 3.5 grading.
- **`quiz_attempts` table already exists** — `quizAttempts` in schema with `userId`, `lessonId`, `score`, `totalPoints`, `passed`. Story 3.4 does NOT insert into this table — that is Story 3.5.
- **`renderLessonContent` must become async** — Currently synchronous in `page.tsx`. It needs to call `getQuizQuestions` for quiz-type lessons. The cleanest pattern is to fetch in the RSC (`LessonPage`) body and pass as a prop. **Do NOT make it a separate RSC component** — keep it a plain async function inside the RSC page file.
- **`MarkCompleteButton` already returns `null` for quiz type** — Confirmed in `src/components/student/mark-complete-button.tsx` (`if (lessonType === 'quiz') return null`). AND `page.tsx` already has the guard: `{lesson.type !== 'quiz' && <div className="sticky ..."><MarkCompleteButton .../></div>}`. **Do NOT touch these guards.**
- **Server Action pattern** — Follow `mark-lesson-complete.ts` exactly: `"use server"` directive, `getServerAuthSession()` auth guard, try/catch, `ActionResponse<T>` return type. [Source: `src/server/actions/progress/mark-lesson-complete.ts`]
- **`QuizQuestion` type** — Use Drizzle infer: `type QuizQuestion = typeof quizzes.$inferSelect`. Import `quizzes` from `~/server/db/schema`. **Do NOT expose `correctAnswer` in the type passed to the client component** — create a client-safe type without `correctAnswer` and `points`.

### Client-Safe QuizQuestion Type

The `quizzes` table contains `correctAnswer` — this must NOT be sent to the client (security). Create a **client-safe subset type** for the QuizEngine component:

```ts
// In quiz-questions.shared.ts or quiz-engine.tsx
export type ClientQuizQuestion = {
	id: number;
	lessonId: number;
	question: string;
	optionA: string;
	optionB: string;
	optionC: string;
	optionD: string;
	// correctAnswer intentionally omitted
	// points intentionally omitted
};
```

In `getQuizQuestions`, explicitly select only the safe fields:

```ts
export async function getQuizQuestions(lessonId: number): Promise<ClientQuizQuestion[]> {
	return db
		.select({
			id: quizzes.id,
			lessonId: quizzes.lessonId,
			question: quizzes.question,
			optionA: quizzes.optionA,
			optionB: quizzes.optionB,
			optionC: quizzes.optionC,
			optionD: quizzes.optionD,
		})
		.from(quizzes)
		.where(eq(quizzes.lessonId, lessonId))
		.orderBy(asc(quizzes.id));
}
```

### QuizEngine Component Structure

```tsx
'use client';
import { useState, useTransition } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { submitQuiz } from '~/server/actions/progress/submit-quiz';
import type { ClientQuizQuestion } from '~/server/courses/quiz-questions';

type Props = {
	questions: ClientQuizQuestion[];
	lessonId: number;
	courseSlug: string;
};

export function QuizEngine({ questions, lessonId, courseSlug }: Props) {
	const [answers, setAnswers] = useState<Record<number, string>>({});
	const [isPending, startTransition] = useTransition();

	if (questions.length === 0) {
		return (
			<div className="flex flex-col items-center gap-4 py-12 text-center">
				<HelpCircle className="h-12 w-12 text-muted-foreground" />
				<p className="text-muted-foreground">No questions available yet.</p>
			</div>
		);
	}

	const allAnswered = Object.keys(answers).length === questions.length;

	const handleSubmit = () => {
		startTransition(async () => {
			await submitQuiz(lessonId, courseSlug, answers);
			// Story 3.5 handles result display
		});
	};

	return (
		<div className="mx-auto w-full max-w-3xl space-y-8">
			{questions.map((quiz, index) => (
				<fieldset key={quiz.id} className="space-y-3">
					<legend className="text-base font-medium">
						{index + 1}. {quiz.question}
					</legend>
					{(['A', 'B', 'C', 'D'] as const).map((option) => (
						<label
							key={option}
							className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted/50"
						>
							<input
								type="radio"
								name={`question-${quiz.id}`}
								value={option}
								checked={answers[quiz.id] === option}
								onChange={() => setAnswers((prev) => ({ ...prev, [quiz.id]: option }))}
							/>
							<span>{quiz[`option${option}` as keyof ClientQuizQuestion]}</span>
						</label>
					))}
				</fieldset>
			))}
			<Button onClick={handleSubmit} disabled={!allAnswered || isPending} className="w-full">
				{isPending ? 'Submitting...' : 'Submit Quiz'}
			</Button>
		</div>
	);
}
```

### Refactoring `renderLessonContent` in `page.tsx`

Current signature (synchronous):

```ts
function renderLessonContent(lesson: LessonDetail);
```

Required change — fetch quiz questions in RSC body:

```tsx
// In LessonPage RSC:
const quizQuestions = lesson.type === 'quiz' ? await getQuizQuestions(lesson.id) : [];

// Updated renderLessonContent signature:
function renderLessonContent(lesson: LessonDetail, quizQuestions: ClientQuizQuestion[]) {
	switch (lesson.type.toLowerCase()) {
		case 'video':
			return <VideoPlayerWrapper videoUrl={lesson.videoUrl ?? ''} title={lesson.title} />;
		case 'text':
			return <TextLessonContent content={lesson.content ?? ''} />;
		case 'quiz':
			return (
				<QuizEngine
					questions={quizQuestions}
					lessonId={lesson.id}
					courseSlug={/* pass courseSlug */}
				/>
			);
		default:
			return <TextLessonContent content={lesson.content ?? ''} />;
	}
}
```

Note: `courseSlug` is already in scope as `slug` in the `LessonPage` RSC.

### `submitQuiz` Action Input Validation

Use Zod for server-side validation:

```ts
const answersSchema = z.record(z.coerce.number().int().positive(), z.enum(['A', 'B', 'C', 'D']));
const schema = z.object({
	lessonId: z.number().int().positive(),
	answers: answersSchema,
});
```

The `Record<number, string>` from client-side JS becomes `Record<string, string>` after JSON serialization — use `z.record(z.coerce.number(), z.enum(['A','B','C','D']))` to handle this.

### `submitQuiz` Action Stub — Story 3.4 Scope

Story 3.4 only needs the action to accept the payload without error. The stub:

```ts
'use server';
import { z } from 'zod';
import { getServerAuthSession } from '~/server/auth';
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

	// Grading logic intentionally deferred to Story 3.5
	return { success: true, data: { score: 0, totalPoints: 0, passed: false } };
}
```

**Story 3.5 will replace the body after the auth/validation guard** — do not worry about breaking its implementation.

### Project Structure Notes

- **New files to create:**
  ```
  src/server/courses/quiz-questions.ts            — Server-only DB query (import "server-only")
  src/server/courses/quiz-questions.shared.ts     — Pure types / testable logic
  src/server/courses/quiz-questions.test.ts       — node:test unit tests
  src/server/actions/progress/submit-quiz.ts      — Server Action stub (Story 3.4 scope)
  src/components/student/quiz-engine.tsx          — QuizEngine Client Component
  src/components/student/quiz-engine.test.ts      — node:test unit tests
  ```
- **Files to modify:**
  ```
  src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx  — Add quiz questions fetch + QuizEngine render
  ```
- **All `src/` paths resolve to `project-e-course/src/`** — confirmed from prior stories.
- **Do NOT modify:**
  - `src/server/db/schema.ts` — No schema changes needed (tables already exist)
  - `src/components/student/mark-complete-button.tsx` — Quiz guard already in place
  - `src/components/student/auto-nav-countdown.tsx` — No changes needed; `AutoNavCountdown` already skips for quiz type (Story 3.2)
  - `src/server/courses/lesson-detail.ts` — No changes needed; LessonDetail type is sufficient

### Testing Requirements

- **Testing framework:** `node:test` (no Jest/Vitest). Run with `npm test` → `node --test`. See `package.json` test script.
- **Pattern:** Extract pure logic to `.shared.ts` files for testability without Next.js/server-only imports.
- **Manual verification checklist:**
  - [ ] Navigate to a quiz-type lesson → QuizEngine renders (not "Quiz content coming soon")
  - [ ] All questions show with A/B/C/D radio options
  - [ ] Selecting option for Q1 doesn't affect Q2's selection
  - [ ] Submit button is disabled until all questions answered
  - [ ] Submit button is enabled when all questions answered
  - [ ] Clicking Submit shows "Submitting..." state (spinner)
  - [ ] Navigate to a video or text lesson → QuizEngine NOT rendered, MarkCompleteButton IS rendered
  - [ ] Quiz lesson → MarkCompleteButton NOT rendered (existing Story 3.3 behavior preserved)
  - [ ] Quiz lesson with no questions in DB → empty state message shown

### UX Requirements from Design Spec

- **QuizEngine anatomy** (from UX spec): Form radio button for answers, instant state evaluation (Story 3.5), animated score ring-chart (Story 3.5). **Story 3.4 scope: radio buttons + submit only.**
- **Styling:** Use `border` rounded cards for each option (`rounded-lg border p-3`) — consistent with App Zone aesthetics (1px border, 8–12px radius).
- **Primary CTA:** "Submit Quiz" button uses solid Indigo (`bg-indigo-600 text-white` = `default` variant in shadcn) — consistent with "Mark as Complete" button.
- **Empty state** must show illustration/icon + message (HelpCircle lucide icon suffices for MVP). [Source: UX spec — "Empty states wajib menampilkan ilustrasi + CTA button" — CTA not required for "no questions" case since students cannot fix it.]
- **No `AutoNavCountdown`** after quiz submission in Story 3.4 — auto-navigation after quiz is Story 3.5's responsibility.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 3, Story 3.4 (FR13)]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — QuizEngine custom component, radio button form, animated ring-chart (Story 3.5)]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — Server Actions pattern, `ActionResponse<T>`, no Redux/Zustand, `src/server/actions/[feature]/` structure]
- [Source: `project-e-course/src/server/db/schema.ts` — `quizzes` and `quizAttempts` table definitions — both already exist, no migration needed]
- [Source: `project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx` — `renderLessonContent` quiz placeholder, `MarkCompleteButton` guard via `lesson.type !== 'quiz'`]
- [Source: `project-e-course/src/components/student/mark-complete-button.tsx` — existing `if (lessonType === 'quiz') return null` guard — do not touch]
- [Source: `project-e-course/src/server/actions/progress/mark-lesson-complete.ts` — canonical Server Action pattern]
- [Source: `_bmad-output/implementation-artifacts/3-3-progress-tracking-mark-as-complete.md` — `correctAnswer` security concern, `useTransition` + server action pattern, node:test + .shared.ts pattern]

## Dev Agent Record

### Agent Model Used

cliproxy/gpt-5.4

### Debug Log References

- `npm test`
- `npm run check`

### Completion Notes List

- Implemented `getQuizQuestions` with server-only Drizzle query selecting only client-safe quiz fields and ordering by quiz id.
- Added `quiz-questions.shared.ts` to hold `QuizQuestion`, `ClientQuizQuestion`, and pure sanitization logic for `node:test` coverage.
- Implemented `QuizEngine` client component with empty state, per-question radio groups, `allAnswered` gating, and pending submit state using `useTransition`.
- Added `submitQuiz` server action stub with auth guard and Zod payload validation, returning the Story 3.4 placeholder response without grading logic.
- Refactored lesson page quiz branch to fetch quiz questions in the RSC body and render `QuizEngine` instead of the placeholder while preserving existing quiz guards for `MarkCompleteButton`.
- Added/updated `node:test` coverage for quiz query shared logic, quiz engine contract, submit action stub, and lesson page quiz integration.
- Validation passed: `npm test`, `npm run check`.

### File List

- project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx
- project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/page.integration.test.ts
- project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/page.test.ts
- project-e-course/src/components/student/quiz-engine.test.ts
- project-e-course/src/components/student/quiz-engine.tsx
- project-e-course/src/server/actions/progress/submit-quiz.test.ts
- project-e-course/src/server/actions/progress/submit-quiz.ts
- project-e-course/src/server/courses/quiz-questions.shared.ts
- project-e-course/src/server/courses/quiz-questions.test.ts
- project-e-course/src/server/courses/quiz-questions.ts
