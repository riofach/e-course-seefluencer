# Story 3.2: Course Sidebar & Auto-Navigation

Status: done

## Senior Developer Review (AI)

### Review Findings

1.  **RSC Payload Serialization Crash** (Critical): `completedLessonIds` was passed to child Client Components as a `Set<number>`. This violates Next.js 15 serialization constraints. Fixed by sending `number[]` and constructing the Set locally.
2.  **Auto-Navigation Infinite Loop** (Critical): `<AutoNavCountdown>` lacked a `key` prop, causing state reuse instead of remounting during client-side navigation. Fixed by adding `key={lesson.id}`.
3.  **Mobile Sidebar Sticky** (Medium): Clicking a lesson link on mobile failed to close the Drawer Sheet automatically. Fixed by passing an `onLessonSelected` handler to retract the Sheet.
4.  **Flaky Ref Assignment** (Low): The active lesson ref in the sidebar used a volatile inline assignment. Refactored to a callback ref structure.

_Fixes applied automatically. Story moved to `done` and Sprint tracking updated._

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a student,
I want to easily navigate between lessons using a sidebar and auto-navigation,
so that my learning flow remains uninterrupted.

## Acceptance Criteria

1. **Given** I am in the learning view (`/courses/[slug]/lessons/[lessonId]`)
   **When** the page renders on desktop (≥ 1024px)
   **Then** a `CourseSidebarNav` component is visible on the left, showing all chapters and their lessons in collapsible accordion form (FR12)
   **And** the currently active lesson is highlighted (active state) and the sidebar is auto-scrolled to it

2. **Given** I am in the learning view on mobile (< 768px)
   **When** the page renders
   **Then** the `CourseSidebarNav` is hidden in a toggleable bottom sheet / drawer
   **And** a persistent toggle button (hamburger or sidebar icon) is visible to open it

3. **Given** the sidebar is visible
   **When** I click a lesson item in the sidebar
   **Then** I am navigated to that lesson's URL (`/courses/[slug]/lessons/[lessonId]`)
   **And** the sidebar highlights the newly active lesson

4. **Given** the active lesson is of type `"video"` or `"text"` (not quiz)
   **When** the page finishes loading with a valid next lesson
   **Then** an auto-navigation countdown indicator (3 seconds) appears at the bottom of the content area
   **And** after the countdown completes, I am automatically navigated to the next lesson's URL

5. **Given** the auto-navigation countdown is visible
   **When** I click "Cancel" or interact with the page content
   **Then** the countdown is cancelled and I remain on the current lesson

6. **Given** the active lesson is the last lesson in the course (no next lesson)
   **When** the page loads
   **Then** no auto-navigation countdown is shown
   **And** a "Course Completed" or "You've reached the end" message is displayed instead

7. **Given** the active lesson is of type `"quiz"`
   **When** the page loads
   **Then** no auto-navigation countdown is displayed (quiz results will handle navigation in Story 3.5)

8. **Given** the sidebar lessons list
   **When** it renders
   **Then** each lesson item shows: lesson title, lesson type badge (Video/Text/Quiz), and a checkmark icon if `user_progress` marks it as completed (FR11 visual)
   **And** a per-course overall progress percentage is displayed at the top of the sidebar (total completed / total lessons)

9. **Given** a student who is not authenticated
   **When** they navigate directly to the lesson URL
   **Then** they are redirected to `/login` (session guard in RSC — preserved from Story 3.1)

## Tasks / Subtasks

- [x] **FIRST: Install missing shadcn components** (prerequisite for all UI tasks)
  - [x] Run `npx shadcn@latest add accordion sheet progress` from inside `project-e-course/`
  - [x] Verify `src/components/ui/accordion.tsx`, `src/components/ui/sheet.tsx`, `src/components/ui/progress.tsx` exist before writing any component code

- [x] Build `CourseSidebarNav` component (AC: 1, 2, 3, 8)
  - [x] Create `src/components/student/course-sidebar-nav.tsx` as a Client Component (`'use client'`)
  - [x] Props: `courseSlug: string`, `chapters: SidebarChapter[]`, `activeLessonId: number`, `completedLessonIds: Set<number>`, `progressPercent: number`
  - [x] Render: collapsible accordion per chapter (`shadcn Accordion`), lesson list items with active state highlight, lesson type badge, completion checkmark
  - [x] For lesson type label: use `toLessonTypeLabel` from `~/server/courses/lesson-navigation.shared` (defined there — do NOT import from `course-syllabus.tsx`, do NOT duplicate inline)
  - [x] On lesson click: navigate to `/courses/[courseSlug]/lessons/[lessonId]` using `next/navigation` `useRouter` push
  - [x] Auto-scroll sidebar to active lesson on mount using `useEffect` + `scrollIntoView`
  - [x] Show `progressPercent` as a `shadcn Progress` bar at top of sidebar with numerical label (e.g. "12% complete")
  - [x] Responsive: desktop `lg:block fixed left sidebar (280px)`, mobile hidden by default, exposed via Drawer (see next task)

- [x] Build sidebar drawer for mobile (AC: 2)
  - [x] Create `src/components/student/lesson-layout.tsx` — a Client Component shell wrapping the lesson page layout
  - [x] Use `shadcn Sheet` (`side="left"`) to contain `CourseSidebarNav` on mobile
  - [x] Toggle button: sticky position, sidebar/menu icon from `lucide-react`, accessible aria-label "Open sidebar"
  - [x] On desktop (≥ 1024px): sidebar pinned left, no toggle button shown

- [x] Build shared helpers and types (prerequisite for data layer and components)
  - [x] Create `src/server/courses/lesson-navigation.shared.ts`
  - [x] Define and export types: `SidebarLesson`, `SidebarChapter`, `CourseSidebarData`, `AdjacentLessons`
  - [x] Export `toLessonTypeLabel(type: string): string` — same logic as in `course-syllabus.tsx` and `page.tsx` but now centralised here. This is the single source of truth going forward.
  - [x] Export `getAdjacentLessonsFromSortedList(lessons: { id: number; order: number }[], activeLessonId: number): { prevLesson: { id: number } | null; nextLesson: { id: number } | null }` — pure function, no DB
  - [x] Export `mapProgressToCompletedIds(progressRows: { lessonId: number }[]): Set<number>` — pure function
  - [x] Export `calculateProgressPercent(completedCount: number, totalLessons: number): number` — returns 0 for division by zero, rounds to nearest integer

- [x] Build server data layer for sidebar (AC: 1, 8)
  - [x] Create `src/server/courses/lesson-navigation.ts` (new file in `courses` slice)
  - [x] Function `getCourseSidebarData(courseSlug: string, userId: string): Promise<CourseSidebarData | null>`
    - [x] Fetch all chapters and lessons for the course (ordered by `chapter.order`, `lesson.order`)
    - [x] Guard: if `allLessonIds.length === 0`, skip `inArray` query and return empty `completedLessonIds: []`
    - [x] Fetch all `user_progress` rows for this user and this course's lesson IDs
    - [x] Return: `{ chapters: SidebarChapter[], completedLessonIds: number[], totalLessons: number, completedCount: number }`
  - [x] Function `getAdjacentLessons(lessonId: number, courseSlug: string): Promise<AdjacentLessons>`
    - [x] Query all lessons for the course (ordered by `chapter.order`, `lesson.order`), flatten to sorted list
    - [x] Use `getAdjacentLessonsFromSortedList` from `lesson-navigation.shared.ts` for pure adjacency logic
    - [x] Returns `{ prevLesson: { id, title } | null, nextLesson: { id, title } | null }`

- [x] Update the lesson page to integrate sidebar (AC: 1, 2, 3, 8, 9)
  - [x] Update `src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx`
  - [x] Call `getCourseSidebarData(slug, userId)` and `getAdjacentLessons(parsedLessonId, slug)` server-side
  - [x] Compute `completedLessonIds` as `Set<number>` (via `mapProgressToCompletedIds`) and `progressPercent` (via `calculateProgressPercent`)
  - [x] Wrap page output in `LessonLayout` component passing sidebar data as props
  - [x] Pass `nextLesson` to `AutoNavCountdown` client component
  - [x] Keep existing `page.helpers.ts` imports unchanged (`requireAuthenticatedUserId`, `resolveLessonPageData`, `shouldShowPaywallOverlay` — do NOT modify `page.helpers.ts`)

- [x] Build `AutoNavCountdown` component (AC: 4, 5, 6, 7)
  - [x] Create `src/components/student/auto-nav-countdown.tsx` as a Client Component (`'use client'`)
  - [x] Props: `nextLesson: { id: number, title: string } | null`, `courseSlug: string`, `currentLessonType: string`
  - [x] Render: only when `nextLesson` is not null AND `currentLessonType !== 'quiz'`
  - [x] Start 3-second countdown on mount using `useEffect` + `setInterval`
  - [x] Display: "Up next: [nextLesson.title]" with a 3-2-1 countdown + progress ring or bar
  - [x] On countdown complete: call `router.push(/courses/[courseSlug]/lessons/[nextLesson.id])`
  - [x] Cancel button: `<button onClick={cancel}>Cancel</button>` — clears interval and hides the component
  - [x] If no next lesson (`nextLesson === null`): render "You've completed all lessons!" message instead of countdown

- [x] Update loading skeleton for sidebar layout (AC: 1, 2)
  - [x] Update `src/components/student/lesson-view-skeleton.tsx` — add a sidebar skeleton column (280px wide) on the left for desktop, keeping content area skeleton on the right
  - [x] Mobile skeleton: keep full-width content skeleton (no sidebar visible on mobile)
  - [x] The `loading.tsx` file already imports `LessonViewSkeleton` — no change needed to `loading.tsx` itself

- [x] Write unit / helper tests (AC: 1–8)
  - [x] Create `src/server/courses/lesson-navigation.test.ts` using `node:test`
  - [x] Test `getAdjacentLessonsFromSortedList`: middle → prev+next; first → prev null; last → next null; single → both null; empty → both null
  - [x] Test `mapProgressToCompletedIds`: populated rows → correct Set; empty rows → empty Set
  - [x] Test `calculateProgressPercent`: 0/5→0, 5/5→100, 3/4→75, 0/0→0

- [x] Verify responsiveness and accessibility (AC: 1, 2, 9)
  - [x] Desktop: sidebar pinned left at 280px, content area fills remaining width
  - [x] Mobile: content area is full width, sidebar accessible only via Sheet drawer
  - [x] Sidebar lesson items: min-height 44px touch targets
  - [x] Active lesson item: distinct visual treatment (indigo background or left border accent)
  - [x] Sidebar scroll: auto-scrolls to active lesson on load (not relying on manual scroll)
  - [x] `CourseSidebarNav` accordion trigger: keyboard-navigable with visible focus ring

## Dev Notes

- **Build on Story 3.1 scaffold** — do NOT re-implement any route, data layer, or component from Story 3.1. The lesson page (`page.tsx`) exists; this story extends it with sidebar + auto-navigation.
- **LessonDetail type is the data contract** — exported from `src/server/courses/lesson-detail.shared.ts`. Do not duplicate or redefine. Read its `lesson.type` for quiz detection.
- **URL Search Params as state** — this is the architecture mandate. Navigation between lessons uses URL changes (`router.push`), NOT React Context or global state.
- **No client-side lesson data fetch** — all sidebar data must be fetched server-side in RSC `page.tsx` and passed as props to Client Components. Do NOT create an API route for sidebar data.
- **`user_progress` table** — the `userProgress` table in `schema.ts` has `userId (text)`, `lessonId (int)`, `completedAt`. Query it with `eq(userProgress.userId, userId)` + `inArray(userProgress.lessonId, allLessonIds)` to get all completed lesson IDs for the course.
- **Sidebar and Auto-Navigation are independent** — the sidebar renders navigation for ALL lessons; auto-nav only fires when a lesson is active and is not a quiz. Keep them as separate components.
- **`CourseSidebarNav` must be `'use client'`** — it needs `useRouter` and `useEffect` for scroll behavior. The data (chapters, completedLessonIds) flows in as props from the server.
- **Story 3.3 dependency** — when Story 3.3 (Mark as Complete) is implemented, it will call `revalidatePath` on the lesson page, causing the RSC to re-fetch progress and re-render `CourseSidebarNav` with updated checkmarks. Story 3.2 sets up this data flow correctly so that Story 3.3 does NOT need to modify sidebar logic.
- **Auto-nav for Quiz lessons** — the `AutoNavCountdown` MUST check `currentLessonType !== 'quiz'`. After a quiz is submitted, Story 3.5 handles navigation. Do NOT auto-navigate from quiz lessons here.
- **`sonner` toast** — NOT needed in this story. No mutations happen here. Toasts are for Story 3.3 (mark as complete action).
- **No `@tailwindcss/typography`** — not in `package.json`. Do not add it. The text lesson content from Story 3.1 handles its own styling.
- **`page.helpers.ts` is stable** — `src/app/(student)/courses/[slug]/lessons/[lessonId]/page.helpers.ts` contains `requireAuthenticatedUserId`, `resolveLessonPageData`, and `shouldShowPaywallOverlay`. All three are used in `page.tsx` and must remain unchanged. Do NOT modify this file.

### Project Structure Notes

- **New files to create:**
  - `src/components/student/course-sidebar-nav.tsx` — Collapsible chapter/lesson accordion sidebar
  - `src/components/student/lesson-layout.tsx` — Layout shell: sidebar (desktop pinned / mobile Sheet drawer) + content area
  - `src/components/student/auto-nav-countdown.tsx` — 3-second countdown to next lesson (Client Component)
  - `src/server/courses/lesson-navigation.ts` — DB queries: `getCourseSidebarData`, `getAdjacentLessons`
  - `src/server/courses/lesson-navigation.shared.ts` — Pure helpers and types: `SidebarChapter`, `SidebarLesson`, `CourseSidebarData`, `AdjacentLessons`, `toLessonTypeLabel`, adjacency/progress logic
  - `src/server/courses/lesson-navigation.test.ts` — `node:test` unit coverage for pure helpers

- **Files to modify:**
  - `src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx` — Add sidebar data fetch calls, wrap in `LessonLayout`, pass `nextLesson` to `AutoNavCountdown`
  - `src/components/student/lesson-view-skeleton.tsx` — Update to show sidebar skeleton column alongside content skeleton

- **Files to read (do NOT modify):**
  - `src/server/db/schema.ts` — Read `userProgress`, `lessons`, `chapters`, `courses` table definitions before writing any query
  - `src/server/auth.ts` — `getServerAuthSession` pattern (already used in page.tsx)
  - `src/server/courses/lesson-detail.ts` — `LessonDetail` type, `getLessonById`, session guard pattern
  - `src/server/courses/lesson-detail.shared.ts` — `LessonDetail` type export and shared helper patterns
  - `src/app/(student)/courses/[slug]/lessons/[lessonId]/page.helpers.ts` — Read to understand existing helpers; do NOT modify
  - `src/components/student/course-syllabus.tsx` — Reference for chapter/lesson rendering patterns; `toLessonTypeLabel` is defined there but **do NOT import from it** — define it in `lesson-navigation.shared.ts` instead
  - `src/components/ui/accordion.tsx`, `src/components/ui/sheet.tsx`, `src/components/ui/progress.tsx` — Verify APIs after running `npx shadcn@latest add accordion sheet progress`

- **Do NOT touch:**
  - `src/app/(student)/courses/[slug]/lessons/[lessonId]/page.helpers.ts` — stable, read only
  - `src/server/courses/lesson-detail.ts` / `lesson-detail.shared.ts` — read only
  - `src/components/student/video-player-wrapper.tsx`, `text-lesson-content.tsx`, `paywall-teaser-overlay.tsx` — established in Story 3.1
  - `src/server/courses/published-course-catalog*.ts`, `search-published-courses.ts`, `course-detail.ts`
  - Any Epic 1 or Epic 2 components/routes

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.2 (FR12)]
- [Source: _bmad-output/planning-artifacts/prd.md — FR11, FR12, NFR-P2, NFR-U1, NFR-U3]
- [Source: _bmad-output/planning-artifacts/architecture.md — URL Search Params as state, Feature-Sliced Server Actions, Project Structure, API & Communication Patterns, Architectural Boundaries]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — CourseSidebarNav custom component spec, Journey 1 (Learning Loop), Experience Mechanics (auto-navigate 3s countdown), Sidebar State (Desktop pinned / Mobile Sheet), Responsive Design, Accessibility (44px touch targets, visible focus rings)]
- [Source: _bmad-output/implementation-artifacts/3-1-multimedia-lesson-viewer.md — LessonDetail type contract, page.tsx patterns, file structure, lesson-detail.shared.ts patterns, testing patterns with node:test]
- [Source: _bmad-output/implementation-artifacts/epic-2-retro-2026-03-08.md — Key Learnings: query/logic in src/server/courses/, RSC-first reads, URL search params as state, no duplicate paths]
- [Source: project-e-course/src/server/db/schema.ts — userProgress, lessons, chapters, courses table definitions]
- [Source: project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx — Current lesson page structure to extend]
- [Source: project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/page.helpers.ts — Existing helpers: requireAuthenticatedUserId, resolveLessonPageData, shouldShowPaywallOverlay]
- [Source: project-e-course/src/components/student/course-syllabus.tsx — toLessonTypeLabel pattern reference (NOT import source)]
- [Source: project-e-course/src/components/student/lesson-view-skeleton.tsx — Existing skeleton to update for sidebar layout]
- [Source: https://nextjs.org/docs/app/api-reference/functions/use-router — useRouter for client-side navigation]
- [Source: https://orm.drizzle.team/docs/operators#inarray — inArray operator for batch userProgress query]

## Developer Context Section

### Story Intent

Story 3.2 is the **navigation backbone of Epic 3**. It transforms the standalone lesson viewer (Story 3.1) into a fully-navigable learning platform by adding:

1. A `CourseSidebarNav` — gives the student a persistent map of the entire course with completion indicators
2. An `AutoNavCountdown` — eliminates the need for the student to click "next" after every lesson (Netflix-style autoplay feel)
3. A `LessonLayout` — the responsive layout shell that positions the sidebar and content area together

This story does **not** implement "Mark as Complete" (that's Story 3.3) — but it sets up the `completedLessonIds` data flow and `progressPercent` display so that when Story 3.3 adds the Server Action + `revalidatePath`, the sidebar checkmarks and progress bar automatically update without any changes to the sidebar component itself.

**Key design constraint from UX spec:** The sidebar must always be visible on desktop. On mobile, it collapses to a left Sheet drawer (like YouTube's playlist UI). This is a core UX requirement, not optional.

### Technical Requirements

- **Next.js 15 App Router + RSC:** All DB queries (`getCourseSidebarData`, `getAdjacentLessons`) run server-side in `page.tsx`. Data is passed as serializable props to Client Components. [Source: architecture.md#API--Communication-Patterns]
- **URL Search Params as navigation state:** Lesson navigation = URL changes (`/courses/[slug]/lessons/[lessonId]`). The sidebar does NOT manage "current lesson" in local state — it reads `activeLessonId` from props (which comes from the URL `params`). [Source: architecture.md#State-Management-Lesson-View]
- **TypeScript strict mode:** All new types (`SidebarChapter`, `CourseSidebarData`, `AdjacentLessons`) MUST use Drizzle `$inferSelect` picks. No `any`. [Source: architecture.md#NFR-M1]
- **Client Components boundary:** `CourseSidebarNav`, `LessonLayout`, and `AutoNavCountdown` are Client Components (`'use client'`). They receive only serializable props (no Drizzle objects). The RSC `page.tsx` fetches data and maps it to plain serializable types before passing down.
- **`user_progress` batch query pattern:** Use `inArray(userProgress.lessonId, allLessonIds)` from `drizzle-orm` to fetch all progress for a course in one query. Do NOT query progress per-lesson in a loop. Guard against empty array (skip query if `allLessonIds.length === 0`).
- **No Server Actions in this story** — this story is read-only (display only). Server Actions for marking lessons complete belong to Story 3.3.

### Architecture Compliance

- `CourseSidebarNav`, `LessonLayout`, `AutoNavCountdown` → `src/components/student/` (student-specific components)
- `getCourseSidebarData`, `getAdjacentLessons` → `src/server/courses/lesson-navigation.ts` (courses feature slice)
- Pure helpers, types, and `toLessonTypeLabel` → `src/server/courses/lesson-navigation.shared.ts` (testable without DB)
- Tests → `src/server/courses/lesson-navigation.test.ts` using `node:test`
- Page update → extend existing `src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx`
- **No `/api` routes** — all data is RSC server-side fetching
- **No React Context** — sidebar state (which chapter expanded) can use local `useState` inside `CourseSidebarNav`; navigation state is always URL-driven
- **No Redux / Zustand** — prohibited by architecture for simple state [Source: architecture.md#Process-Patterns]

### Library / Framework Requirements

- **Install first — `accordion`, `sheet`, `progress` are NOT in `src/components/ui/`**: Run `npx shadcn@latest add accordion sheet progress` from `project-e-course/`. The current `src/components/ui/` only contains: `avatar`, `badge`, `breadcrumb`, `button`, `card`, `dropdown-menu`, `input`, `label`, `skeleton`, `sonner`. Any import of `accordion`, `sheet`, or `progress` before running this command will cause a build error.
- **`drizzle-orm` `inArray`**: `import { inArray } from "drizzle-orm"` — use `inArray(userProgress.lessonId, allLessonIds)` for batch progress query. `allLessonIds` is `number[]` extracted from all fetched lesson rows. Guard: `if (allLessonIds.length === 0) return []` before calling inArray.
- **`shadcn/ui` Accordion**: Use `<Accordion type="multiple">` so all chapters can be open simultaneously — important for sidebar navigation UX. Default `type="single"` collapses others which is wrong for a persistent sidebar.
- **`shadcn/ui` Sheet**: Use `<Sheet>` + `<SheetContent side="left">` for mobile sidebar drawer. Toggle with a `useState(isOpen)` boolean in `LessonLayout`.
- **`shadcn/ui` Progress**: `<Progress value={progressPercent} />` at the top of the sidebar. Display `{progressPercent}% complete` as a text label.
- **`toLessonTypeLabel`**: Define once in `lesson-navigation.shared.ts`. Import from `~/server/courses/lesson-navigation.shared` in `CourseSidebarNav`. Do NOT import from `course-syllabus.tsx` (wrong module boundary). Do NOT duplicate inline. Note: `page.tsx` also has a local copy — leave it as-is; Story 3.2 does not require cleaning it up.
- **`lucide-react` icons**: `CheckCircle2` (completed lesson), `CirclePlay` (video lesson), `FileText` (text lesson), `HelpCircle` (quiz lesson), `PanelLeft` or `Menu` (mobile sidebar toggle). All already installed.
- **`next/navigation` `useRouter`**: In `CourseSidebarNav` (`'use client'`), use `const router = useRouter()` for `router.push(lessonUrl)` on lesson click.
- **`useEffect` + `setInterval`**: In `AutoNavCountdown`, use `useEffect` to start the 3-second countdown on mount. Clean up with `clearInterval` in the effect cleanup function — CRITICAL to prevent memory leaks.

### File Structure Requirements

- **New files to create:**

  ```
  src/components/student/course-sidebar-nav.tsx    — Accordion sidebar (Client Component)
  src/components/student/lesson-layout.tsx          — Responsive layout shell (Client Component)
  src/components/student/auto-nav-countdown.tsx     — 3-second auto-navigate countdown (Client Component)
  src/server/courses/lesson-navigation.ts           — Server DB queries
  src/server/courses/lesson-navigation.shared.ts    — Pure types + helper functions + toLessonTypeLabel
  src/server/courses/lesson-navigation.test.ts      — node:test unit tests
  ```

- **Files to modify:**

  ```
  src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx  — Add sidebar data, wrap in LessonLayout
  src/components/student/lesson-view-skeleton.tsx               — Add sidebar skeleton column for desktop
  ```

- **Do NOT create:**
  - Any `/api` route handler for lesson navigation data
  - Any React Context provider for lesson state
  - Any file in `src/server/actions/` (no mutations in this story)

### Testing Requirements

- **Unit tests for `lesson-navigation.shared.ts` helpers** using `node:test`:
  - `getAdjacentLessonsFromSortedList(lessons, activeLessonId)` — pure function taking sorted array of `{ id, order }` objects
  - Test: middle lesson → both `prev` and `next` set correctly
  - Test: first lesson → `prev === null`, `next` is second lesson
  - Test: last lesson → `next === null`, `prev` is second-to-last lesson
  - Test: array of one lesson → both `prev === null` and `next === null`
  - Test: empty array → both null (defensive case)
  - `mapProgressToCompletedIds(progressRows)` — pure function
  - Test: returns `Set<number>` of completed lesson IDs from progress rows
  - Test: empty progress rows → empty Set
  - `calculateProgressPercent(completedCount, totalLessons)` — pure function
  - Test: 0/5 → 0, 5/5 → 100, 3/4 → 75 (round to integer)
  - Test: 0/0 → 0 (no division by zero)

- **Integration tests** are NOT required for this story (DB queries are straightforward joins + inArray)
- **Manual verification checklist:**
  - [ ] Sidebar visible on desktop, hidden on mobile (toggle via Sheet)
  - [ ] Active lesson highlighted in sidebar
  - [ ] Completed lessons show checkmark in sidebar
  - [ ] Progress percentage is accurate
  - [ ] Auto-nav countdown appears for video/text lessons with a next lesson
  - [ ] Auto-nav does NOT appear on quiz lessons
  - [ ] Auto-nav does NOT appear on the last lesson
  - [ ] Cancel button stops auto-nav countdown
  - [ ] Clicking sidebar lesson navigates to correct URL
  - [ ] Loading skeleton matches sidebar + content layout on desktop

## Latest Technical Information

- **Next.js 15 `useRouter` in Client Components**: Import `from "next/navigation"`, NOT `"next/router"`. The App Router only works with `next/navigation`. `router.push(url)` triggers client-side navigation (soft navigation), preserving the layout shell without full page reload.
- **`drizzle-orm` `inArray` operator**: `import { inArray } from "drizzle-orm"`. Example: `db.select().from(userProgress).where(and(eq(userProgress.userId, userId), inArray(userProgress.lessonId, lessonIdArray)))`. If `lessonIdArray` is empty, skip the query entirely — Drizzle will error on empty `inArray`.
- **`shadcn/ui` Accordion `type="multiple"`**: Allows multiple chapters to be open at the same time in the sidebar. Default `type="single"` collapses others when one opens, which is NOT the right UX for a persistent sidebar.
- **`shadcn/ui` Sheet `side="left"`**: The Sheet component supports `side` prop: `"top" | "right" | "bottom" | "left"`. Use `side="left"` for a left-sliding panel consistent with standard mobile navigation patterns.
- **`setInterval` vs `setTimeout` for countdown**: Use `setInterval` for decrementing a `count` state (3→2→1→0), then trigger navigation when count hits 0. The `clearInterval` in `useEffect` cleanup is CRITICAL to prevent memory leaks when the user navigates away or cancels.
- **Tailwind CSS `lg:block hidden`**: sidebar wrapper: `className="hidden lg:block"` for desktop always-visible; mobile toggle: `className="lg:hidden"` for the Sheet trigger button.
- **`LessonViewSkeleton` must match new layout**: The existing `lesson-view-skeleton.tsx` renders a single full-width column. After this story, the page has a 280px sidebar + content area on desktop. Update the skeleton to use `flex` with a sidebar column (`hidden lg:block w-[280px]`) + content column (`flex-1`) so the loading state does not visually "jump" when the real layout renders.

## Project Context Reference

- No `project-context.md` was found during workflow discovery.
- **Project root is `project-e-course/`** — confirmed from Story 3.1 dev notes. All `src/` paths resolve to `project-e-course/src/`.
- **Tailwind CSS v4** is installed (`tailwindcss: ^4.0.15`) — use standard Tailwind utility classes. Tailwind v4 uses a CSS-based config approach.
- **shadcn version 3.8.5** — `accordion`, `sheet`, and `progress` must be installed with `npx shadcn@latest add accordion sheet progress` before use. They are NOT present in the current `src/components/ui/` directory.

## Story Completion Status

- Story context created for implementation readiness.
- Epic context analyzed: Epic 3 — Learning Experience & Progress Tracking (Story 3.2 — FR12, FR11 visual, NFR-P2, NFR-U1, NFR-U2).
- Previous story intelligence: Story 3.1 `LessonDetail` type contract, `page.tsx` RSC pattern, `lesson-detail.shared.ts` pattern for testable helpers, `node:test` testing conventions, and `project-e-course/` root path all carried forward.
- Architecture compliance: URL Search Params mandate, RSC-first data fetch, no API routes for read data, feature-sliced server queries in `src/server/courses/`, client component boundary for interactive UI — all verified and included.
- Epic 2 retrospective learnings incorporated: query/logic stays in `src/server/courses/`, RSC-first reads, URL search params as state, no duplicate paths/components.
- Codebase verified: shadcn components `accordion`, `sheet`, `progress` confirmed absent from `src/components/ui/` — install step added as first task. `toLessonTypeLabel` centralised in `lesson-navigation.shared.ts`. `page.helpers.ts` documented as stable/read-only. `LessonViewSkeleton` update included.
- Git intelligence: not applicable (repository not detected).
- Completion note: Ultimate context engine analysis completed — comprehensive developer guide created and validated.

## Dev Agent Record

### Agent Model Used

github-copilot/claude-sonnet-4.6

### Debug Log References

- Installed required shadcn UI primitives: `accordion`, `sheet`, `progress`
- Added `lesson-navigation.shared.ts` pure helpers/types and `lesson-navigation.ts` server queries
- Integrated `LessonLayout`, `CourseSidebarNav`, and `AutoNavCountdown` into lesson page RSC flow
- Updated desktop/mobile loading skeleton to match sidebar layout
- Validation runs: `node --test src/server/courses/lesson-navigation.test.ts`, `npm test`, `npm run typecheck`, `npm run lint`

### Completion Notes List

- Implemented left-pinned desktop sidebar and mobile sheet drawer with active lesson highlighting, completion icons, progress bar, and router-based lesson navigation.
- Added shared lesson navigation helpers plus server-side sidebar/progress/adjacent-lesson data loading with batch `user_progress` lookup.
- Added auto-navigation countdown for non-quiz lessons, cancel-on-interaction behavior, and end-of-course completion messaging.
- Verified helper coverage and full regression suite: `npm test` (46/46), `npm run typecheck`, `npm run lint`.

### File List

- project-e-course/package.json
- project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx
- project-e-course/src/components/student/auto-nav-countdown.tsx
- project-e-course/src/components/student/course-sidebar-nav.tsx
- project-e-course/src/components/student/lesson-layout.tsx
- project-e-course/src/components/student/lesson-view-skeleton.tsx
- project-e-course/src/components/ui/accordion.tsx
- project-e-course/src/components/ui/progress.tsx
- project-e-course/src/components/ui/sheet.tsx
- project-e-course/src/server/courses/lesson-navigation.shared.ts
- project-e-course/src/server/courses/lesson-navigation.test.ts
- project-e-course/src/server/courses/lesson-navigation.ts

## Change Log

- 2026-03-09: Implemented course sidebar navigation, mobile drawer layout, progress display, and auto-navigation countdown for Story 3.2.
