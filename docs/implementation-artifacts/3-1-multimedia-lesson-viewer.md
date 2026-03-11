# Story 3.1: Multimedia Lesson Viewer

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a student,
I want to view the content of a lesson (Video iframe or Text),
so that I can study the material.

## Acceptance Criteria

1. **Given** I click on a lesson link from the course detail page (`/courses/[slug]`)
   **When** the learning platform route loads (`/courses/[slug]/lessons/[lessonId]`)
   **Then** the lesson content area renders the correct content type for the active lesson (FR09)

2. **Given** the active lesson is of type `"video"`
   **When** the lesson view renders
   **Then** a YouTube iframe is rendered with `loading="lazy"` (NFR-P3) wrapped inside `VideoPlayerWrapper`
   **And** the iframe maintains a responsive 16:9 aspect ratio at all viewport widths

3. **Given** the active lesson is of type `"text"`
   **When** the lesson view renders
   **Then** the text/HTML content is displayed in the main content area with readable typography (Inter, 15px/1.6)

4. **Given** a lesson that requires a premium subscription (`isFree: false`)
   **When** a student WITHOUT an active subscription navigates to that lesson
   **Then** the lesson content is hidden behind `PaywallTeaserOverlay` (blur + lock icon + CTA) — NOT a hard redirect (FR15 preview)
   **And** the route URL remains the same (no redirect occurs)

5. **Given** a skeleton loader is shown while the page loads
   **When** data is being fetched
   **Then** a skeleton that mirrors the lesson layout is displayed — no blank screens (NFR-U2)

6. **Given** the lesson view is active
   **When** it renders on any device
   **Then** the `VideoPlayerWrapper` is responsive: full-width on mobile, max-width constrained on desktop (NFR-U1)

7. **Given** a `lessonId` that does not exist or does not belong to the given `slug`'s course
   **When** the page is requested
   **Then** a proper 404 is returned via `notFound()` from Next.js

8. **Given** the student navigates directly to a lesson URL
   **When** they are NOT authenticated
   **Then** they are redirected to the login page (session guard in RSC)

## Tasks / Subtasks

- [x] Create the lesson viewer route (AC: 1, 2, 3, 5, 7, 8)
  - [x] Create `src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx` as a React Server Component
  - [x] Accept and `await` both dynamic params: `const { slug, lessonId } = await params` (Next.js 15 async params pattern)
  - [x] Fetch session server-side; if no session → redirect to `/login`
  - [x] Fetch lesson data using a new `getLessonById(lessonId, slug)` query (validates lesson belongs to course by slug)
  - [x] Call `notFound()` if lesson not found or course not published
  - [x] Conditionally render `VideoPlayerWrapper` (type = "video") or `TextLessonContent` (type = "text") or `QuizEngine` placeholder (type = "quiz" — stub only in this story)
  - [x] Check subscription status server-side for `isFree: false` lessons → render `PaywallTeaserOverlay` if no active sub

- [x] Build the data access layer query (AC: 1, 4, 7)
  - [x] Create `src/server/courses/lesson-detail.ts`
  - [x] Write `getLessonById(lessonId: string, courseSlug: string)` — joins `lessons` → `chapters` → `courses` to validate slug ownership
  - [x] Return: `lesson.id`, `lesson.title`, `lesson.type`, `lesson.videoUrl`, `lesson.content`, `lesson.isFree`, `lesson.order`, plus `course.isFree`, `chapter.id`, `chapter.title`, `chapter.order`
  - [x] Filter: only return if `courses.isPublished = true`
  - [x] TypeScript type: `LessonDetail` (inferred from Drizzle schema — no `any`)

- [x] Build `VideoPlayerWrapper` component (AC: 2, 6)
  - [x] Create `src/components/student/video-player-wrapper.tsx`
  - [x] Props: `videoUrl: string` (full YouTube URL or embed URL), `title: string`
  - [x] Normalize YouTube URL to embed format: `https://www.youtube.com/embed/{videoId}`
  - [x] Render `<iframe>` with `loading="lazy"`, `allowFullScreen`, `title={title}`
  - [x] Aspect ratio wrapper: `<div className="relative aspect-video w-full">` so it never breaks layout
  - [x] Mark as `'use client'` only if interactive state is needed — prefer pure HTML/Tailwind wrapper

- [x] Build `TextLessonContent` component (AC: 3)
  - [x] Create `src/components/student/text-lesson-content.tsx`
  - [x] Props: `content: string` (plain text or minimal HTML)
  - [x] Render in a `<article>` with Tailwind `prose` class (via `@tailwindcss/typography` if installed, else styled manually)
  - [x] Typography: Inter, 15px body, line-height 1.6, comfortable max-width (e.g. `max-w-3xl mx-auto`)

- [x] Build `PaywallTeaserOverlay` stub for premium lessons (AC: 4)
  - [x] Create `src/components/student/paywall-teaser-overlay.tsx`
  - [x] Render as an absolute overlay with `backdrop-blur-sm bg-black/60` over the content area
  - [x] Include: lock icon, message "This lesson is for Premium members", CTA button → `/pricing`
  - [x] Do NOT hard redirect — overlay wraps the blurred content (for Epic 4 to fully implement)

- [x] Build `LessonViewSkeleton` loading state (AC: 5)
  - [x] Create `src/components/student/lesson-view-skeleton.tsx`
  - [x] Mirror lesson page layout: wide video placeholder skeleton + title area + breadcrumb area
  - [x] Use shadcn `Skeleton` component (NO spinners)
  - [x] Export as `loading.tsx` in the `[lessonId]` segment: `src/app/(student)/courses/[slug]/lessons/[lessonId]/loading.tsx`

- [x] Wire up the lesson page (AC: 1–8)
  - [x] Compose all components in `page.tsx` based on `lesson.type` switch
  - [x] Include breadcrumb: `Courses / [Course Title] / [Chapter Title] / [Lesson Title]` using shadcn `Breadcrumb`
  - [x] Verify that clicking a lesson from `CourseSyllabus` (Story 2.3) routes to `/courses/[slug]/lessons/[lessonId]`
  - [x] Confirm paywall check is server-side (no client-side subscription leak)

- [x] Verify accessibility and responsiveness (AC: 6)
  - [x] iframe `title` attribute set (required for accessibility — WCAG AA)
  - [x] Breadcrumb uses `<nav aria-label="breadcrumb">`
  - [x] Mobile: video fills full width, text content is readable with adequate padding
  - [x] Desktop: video max-width constrained, centered layout
  - [x] Touch targets minimum 44×44px for all interactive elements (NFR-U1)

## Dev Notes

- **Do NOT re-implement** any components from Stories 2.1–2.3. The `CourseSyllabus` lesson rows in Story 2.3 already link to `/courses/${slug}/lessons/${lesson.id}` — this story registers that route.
- **URL Search Params as state** is the architectural mandate for the lesson view (architecture.md). Do NOT use React Context or Redux for lesson navigation state.
- **Server-side access check first**: subscription validation MUST happen in the RSC before rendering any premium content. Never rely on client-side checks for premium gating.
- **This story creates the route scaffold** for the full learning experience in Epic 3. Stories 3.2–3.5 will build directly on top of this route. Name types and file paths clearly for handoff.
- **Quiz type lessons:** Render a stub `<div>Quiz content coming soon</div>` for type="quiz" — Story 3.4 will replace this. Do NOT build the QuizEngine in this story.
- **`VideoPlayerWrapper` vs `PaywallTeaserOverlay` layering:** The `PaywallTeaserOverlay` wraps the `VideoPlayerWrapper` (or `TextLessonContent`) in the JSX tree, keeping the overlay on top via absolute positioning. The underlying component is always rendered (for blur effect) but content is inaccessible without subscription.
- **No Server Actions in this story** — this is a read-only page. All data via RSC Drizzle queries in `src/server/courses/`. [Source: architecture.md#API--Communication-Patterns]
- **`LessonDetail` type** is the data contract that Stories 3.2, 3.3, 3.4, 3.5 will all extend. Export it clearly from `src/server/courses/lesson-detail.ts`. This is the equivalent of `CourseDetailItem` established in Story 2.3.

### Project Structure Notes

- New route segment: `src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx` — nested under the existing `[slug]` segment from Story 2.3
- `loading.tsx` in the `[lessonId]` segment activates automatic Suspense streaming for this route
- New query file: `src/server/courses/lesson-detail.ts` — extend the `src/server/courses/` feature slice (do NOT add to page.tsx)
- New component files in `src/components/student/`: `video-player-wrapper.tsx`, `text-lesson-content.tsx`, `paywall-teaser-overlay.tsx`, `lesson-view-skeleton.tsx`
- `PaywallTeaserOverlay` will be further developed in Epic 4 (Story 4.1). Build the minimal correct version here.
- This story establishes the **lesson viewer scaffold** that all subsequent Epic 3 stories depend on.

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.1 (FR09, FR15 preview, NFR-P3, NFR-U1, NFR-U2)]
- [Source: _bmad-output/planning-artifacts/architecture.md — API & Communication Patterns, Project Structure & Boundaries, URL Search Params as state, Architectural Boundaries (premium RSC check)]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — VideoPlayerWrapper, PaywallTeaserOverlay, Component Strategy, Responsive Design, Journey 1 (Learning Loop), Lesson Learning Flow mechanics]
- [Source: _bmad-output/planning-artifacts/prd.md — FR09, FR15, NFR-P3, NFR-U1, NFR-U2, NFR-S2]
- [Source: _bmad-output/implementation-artifacts/2-3-course-detail-and-syllabus-view.md — CourseDetailItem data shape, slug route pattern, notFound() and ISR pattern, node:test test patterns]
- [Source: _bmad-output/implementation-artifacts/epic-2-retro-2026-03-08.md — Key Learnings: query/logic stays in src/server/courses/, RSC-first reads, URL search params as state, no duplicate paths]
- [Source: https://nextjs.org/docs/app/api-reference/functions/not-found — notFound() usage in RSC]
- [Source: https://nextjs.org/docs/app/api-reference/file-conventions/loading — loading.tsx Suspense boundary]
- [Source: https://nextjs.org/docs/messages/sync-dynamic-apis — async params in Next.js 15]
- [Source: https://orm.drizzle.team/docs/rqb — Drizzle RQB join pattern]

## Developer Context Section

### Story Intent

Story 3.1 is the **entry point of Epic 3** — it creates the lesson viewer route that is the foundation of the entire learning experience. Without this route scaffold, Stories 3.2 (sidebar + auto-navigation), 3.3 (mark as complete), 3.4 (quiz engine), and 3.5 (quiz grading) cannot be built.

The developer's primary task is:

1. Register the `/courses/[slug]/lessons/[lessonId]` route in the Next.js App Router
2. Build a clean data access layer (`getLessonById`) that validates lesson-to-course ownership by slug
3. Render lesson content based on type: `video` → `VideoPlayerWrapper`, `text` → `TextLessonContent`, `quiz` → stub
4. Implement server-side premium gating via `PaywallTeaserOverlay` for `isFree: false` lessons
5. Establish the `LessonDetail` TypeScript type as the data contract for Epic 3

### Technical Requirements

- **Next.js 15 App Router + RSC**: `page.tsx` is a Server Component. Both `slug` and `lessonId` must be `await`-ed: `const { slug, lessonId } = await params`. [Source: architecture.md#Technical-Constraints]
- **TypeScript strict mode**: `LessonDetail` type MUST use Drizzle `$inferSelect` / `InferSelectModel` inference. No `any` anywhere. [Source: architecture.md#NFR-M1]
- **Session guard in RSC**: Use `await getServerSession(authOptions)` (NextAuth v4 pattern) at the top of `page.tsx`. Redirect to `/login` if null. [Source: architecture.md#Architectural-Boundaries]
- **Subscription check in RSC**: Query `subscriptions` table for the user's active subscription before rendering premium lessons. Must be server-side — never expose video URLs to unauthorized clients.
- **URL Search Params as lesson navigation state**: The architecture mandates URL Search Params for lesson view state (not React Context). Story 3.2 will utilize this — ensure the route is param-compatible from the start. [Source: architecture.md#State-Management-Lesson-View]
- **Drizzle join query**: `lessons → chapters → courses` join required to validate that `lessonId` belongs to the course identified by `slug`. Use `eq()`, `and()` from `drizzle-orm`. [Source: architecture.md#Data-Architecture]

### Architecture Compliance

- New route: `src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx` — nested under `(student)` route group
- New loading skeleton: `src/app/(student)/courses/[slug]/lessons/[lessonId]/loading.tsx`
- New data layer: `src/server/courses/lesson-detail.ts` — stays in the `courses` feature slice
- New components: `src/components/student/video-player-wrapper.tsx`, `src/components/student/text-lesson-content.tsx`, `src/components/student/paywall-teaser-overlay.tsx`, `src/components/student/lesson-view-skeleton.tsx`
- **Do NOT** create any `/api` route for lesson reading
- **Do NOT** place Drizzle queries inside `page.tsx` — separation of concerns is enforced
- **Do NOT** use `force-dynamic` unless absolutely necessary — prefer RSC with session check
- [Source: architecture.md#Project-Structure--Boundaries; architecture.md#Structure-Patterns]

### Library / Framework Requirements

- **`drizzle-orm`**: Use `eq`, `and` for query conditions; use join pattern: `db.query.lessons.findFirst({ where: and(eq(lessons.id, lessonId), ...), with: { chapter: { with: { course: true } } } })` or manual join — validate slug via `courses.slug` filter. [Source: https://orm.drizzle.team/docs/rqb]
- **`next-auth/next`**: `getServerSession(authOptions)` for server-side session in RSC (NextAuth v4 pattern). [Source: architecture.md#Authentication]
- **`next/navigation`**: `notFound()` for 404 handling, `redirect()` for auth redirect. Both work in RSC.
- **`shadcn/ui` Skeleton**: `<Skeleton className="..." />` for loading states. NOT a spinner. [Source: ux-design-specification.md#UX-Consistency-Patterns]
- **`shadcn/ui` Breadcrumb**: Use for navigation orientation: `Courses / [Course Title] / [Chapter] / [Lesson Title]`. Visible on all lesson views. [Source: ux-design-specification.md#Navigation-Patterns]
- **Tailwind CSS**: `aspect-video` class for 16:9 iframe wrapper. `prose` class (from `@tailwindcss/typography` if installed) or manual `leading-relaxed text-[15px]` for text content.
- **`shadcn/ui` Badge**: Lesson type badge (Video/Text/Quiz) can be shown in breadcrumb area or lesson header. Reuse the badge variants from Story 2.3. [Source: 2-3-course-detail-and-syllabus-view.md]

### File Structure Requirements

- **New files to create:**
  - `src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx` — Lesson viewer RSC page
  - `src/app/(student)/courses/[slug]/lessons/[lessonId]/loading.tsx` — Skeleton for Suspense boundary
  - `src/server/courses/lesson-detail.ts` — Drizzle query: `getLessonById(lessonId, courseSlug)`
  - `src/components/student/video-player-wrapper.tsx` — YouTube iframe with lazy load + responsive 16:9
  - `src/components/student/text-lesson-content.tsx` — Styled text/HTML content renderer
  - `src/components/student/paywall-teaser-overlay.tsx` — Blur overlay with lock + CTA (premium gate)
  - `src/components/student/lesson-view-skeleton.tsx` — Skeleton layout for lesson page

- **Files to read (do NOT modify):**
  - `src/server/db/schema.ts` — Read `lessons`, `chapters`, `courses`, `subscriptions` table definitions before writing any query
  - `src/server/auth.ts` — Read `authOptions` export for use with `getServerSession`
  - `src/app/(student)/courses/[slug]/page.tsx` — Confirm `CourseSyllabus` lesson link format (`/courses/${slug}/lessons/${lesson.id}`)
  - `src/components/student/course-syllabus.tsx` — Confirm the `href` pattern set in Story 2.3 (should already point to `/courses/[slug]/lessons/[lessonId]`)
  - `src/components/ui/badge.tsx` — Reuse existing Badge component; do NOT recreate

- **Do NOT touch:**
  - Any files from `src/server/courses/published-course-catalog*.ts`
  - Any files from `src/server/courses/search-published-courses.ts`
  - Any files from `src/server/courses/course-detail*.ts`
  - `src/components/student/course-search-input.tsx`
  - `src/components/student/course-catalog.tsx`

### Testing Requirements

- Verify `getLessonById` returns `null` for a `lessonId` that doesn't belong to the given `courseSlug`
- Verify `getLessonById` returns `null` for a non-existent `lessonId`
- Verify `getLessonById` returns `null` if the parent `courses.isPublished = false`
- Verify the session guard redirects unauthenticated users to `/login`
- Verify `notFound()` is called when query returns `null`
- Verify `VideoPlayerWrapper` correctly transforms a standard YouTube watch URL (`?v=xxx`) to embed URL (`/embed/xxx`)
- Verify `VideoPlayerWrapper` sets `loading="lazy"` on the iframe
- Verify `PaywallTeaserOverlay` renders as an overlay (absolute positioning) without redirecting
- Verify skeleton loader matches the lesson layout structure
- Use `node:test` (established pattern across Epic 1 & 2) for all unit/helper tests
- [Source: 2-3-course-detail-and-syllabus-view.md#Testing-Requirements; architecture.md#Implementation-Patterns]

## Latest Technical Information

- **Next.js 15 async `params`**: Both `slug` and `lessonId` MUST be `await`-ed: `const { slug, lessonId } = await params`. Synchronous access is deprecated and will trigger a runtime warning. [Source: https://nextjs.org/docs/messages/sync-dynamic-apis]
- **YouTube iframe lazy loading**: Add `loading="lazy"` attribute directly on the `<iframe>` element. This is a native HTML attribute (not YouTube-specific) that defers iframe load until it's near the viewport. Combined with `aspect-video` wrapper, this satisfies NFR-P3. [Source: https://web.dev/articles/lazy-loading-video]
- **Drizzle RQB nested join**: The preferred join for `lesson → chapter → course` validation: `db.query.lessons.findFirst({ where: eq(lessons.id, lessonId), with: { chapter: { with: { course: { where: and(eq(courses.slug, courseSlug), eq(courses.isPublished, true)) } } } } })`. If the nested `course` is null after the join, the lesson either doesn't belong to this course or the course is unpublished — call `notFound()` in either case.
- **NextAuth v4 `getServerSession` in App Router RSC**: Use `import { getServerSession } from "next-auth/next"` with `authOptions` from `src/server/auth.ts`. This is the correct pattern for NextAuth v4 in RSC (not NextAuth v5 `auth()` which is different). Avoid importing from `next-auth` directly without the `/next` sub-path in v4.
- **`aspect-video` Tailwind class**: Equivalent to `aspect-ratio: 16 / 9`. Use `<div className="relative w-full aspect-video overflow-hidden rounded-lg">` as the wrapper around the iframe. The iframe inside should be `className="absolute inset-0 w-full h-full"`.
- **`@tailwindcss/typography` plugin**: If already installed in the project (check `package.json` and `tailwind.config.ts`), use `<article className="prose prose-neutral dark:prose-invert max-w-3xl mx-auto px-4">` for text content rendering. If not installed, use manual Tailwind classes for typography. Do NOT install new packages without confirming with the project.

## Project Context Reference

- No `project-context.md` file was found during workflow discovery.

## Story Completion Status

- Story context created for implementation readiness.
- Epic context analyzed: Epic 3 — Learning Experience & Progress Tracking (Story 3.1 — FR09, NFR-P3, NFR-U1, NFR-U2).
- Cross-epic context: Story 2.3 `CourseDetailItem` data shape and slug route conventions carried forward.
- Previous story intelligence: Story 2.3 file list, patterns, and Dev Notes analyzed. Epic 2 Retrospective key learnings incorporated (query/logic in `src/server/courses/`, RSC-first, URL Search Params as state, no duplicate paths).
- Architecture compliance: URL Search Params mandate, server-side premium gating requirement, feature-sliced actions boundary — all verified and included.
- Git intelligence: not applicable (repository not detected).
- Completion note: Ultimate context engine analysis completed — comprehensive developer guide created.

## Dev Agent Record

### Agent Model Used

github-copilot/claude-sonnet-4.6

### Debug Log References

- 2026-03-09: Confirmed app root at `project-e-course/` after workflow halt due to missing root config files.
- 2026-03-09: Implemented lesson viewer route, course-syllabus lesson linking, lesson detail data layer, premium gating, skeleton, and helper-based node:test coverage.
- 2026-03-09: Validation passed with `npm test`, `npm run lint`, and `npm run typecheck` in `project-e-course/`.

### Completion Notes List

- Added RSC lesson viewer route at `src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx` with async params, auth redirect, `notFound()` handling, breadcrumb UI, premium overlay logic, and quiz placeholder rendering.
- Added `LessonDetail` data contract and server queries in `src/server/courses/lesson-detail.ts` plus shared helpers/tests for lesson ownership validation and active subscription detection.
- Added `VideoPlayerWrapper`, `TextLessonContent`, `PaywallTeaserOverlay`, `LessonViewSkeleton`, and local breadcrumb primitive with node:test coverage for URL normalization, overlay behavior, and skeleton/layout wiring.
- Updated `CourseSyllabus` to link lesson rows to `/courses/[slug]/lessons/[lessonId]` and passed `courseSlug` from the course detail route.

### Review Follow-ups (AI)

- **Fixed missing searchParams**: Added `searchParams` prop to `LessonPageProps` to comply with the URL Search Params state architecture requirement.
- **Fixed HTML detection regex**: Improved regex in `TextLessonContent`'s `hasHtmlMarkup` to avoid false positives with math/code snippets.
- **Fixed YouTube URL matching**: Added support for `youtube-nocookie.com` in `normalizeYouTubeUrl` to handle privacy-enhanced embeds properly. Added corresponding test cases.

### File List

- project-e-course/src/app/(student)/courses/[slug]/page.tsx
- project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx
- project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/loading.tsx
- project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/page.helpers.ts
- project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/page.helpers.test.ts
- project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/page.test.ts
- project-e-course/src/components/student/course-syllabus.tsx
- project-e-course/src/components/student/course-syllabus.test.ts
- project-e-course/src/components/student/video-player-wrapper.tsx
- project-e-course/src/components/student/video-player-wrapper.helpers.ts
- project-e-course/src/components/student/video-player-wrapper.test.ts
- project-e-course/src/components/student/text-lesson-content.tsx
- project-e-course/src/components/student/paywall-teaser-overlay.tsx
- project-e-course/src/components/student/paywall-teaser-overlay.test.ts
- project-e-course/src/components/student/lesson-view-skeleton.tsx
- project-e-course/src/components/student/lesson-view-skeleton.test.ts
- project-e-course/src/components/ui/breadcrumb.tsx
- project-e-course/src/server/courses/lesson-detail.ts
- project-e-course/src/server/courses/lesson-detail.shared.ts
- project-e-course/src/server/courses/lesson-detail.test.ts
