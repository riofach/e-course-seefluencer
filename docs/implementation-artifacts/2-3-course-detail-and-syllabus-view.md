# Story 2.3: Course Detail & Syllabus View

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a student,
I want to view the full details and syllabus of a specific course,
so that I know exactly what I will be learning before starting or buying it.

## Acceptance Criteria

1. **Given** I select a course from the catalog (click a `CourseCard` on `/courses`)
   **When** I land on the course detail page (`/courses/[slug]`)
   **Then** I see the general course info: title, description/synopsis, thumbnail image, and `isFree` / "Premium" badge (FR08)

2. **Given** I am on the course detail page
   **When** the page loads
   **Then** I see a chronological list of Chapters, each expanded to show its Lessons in order (FR08)

3. **Given** I am viewing the syllabus
   **When** I look at each Lesson entry
   **Then** I can see its title and type badge (Video / Text / Quiz)

4. **Given** the page is loaded by an unauthenticated visitor
   **When** they view the syllabus
   **Then** they can browse all chapters and lessons freely (public discovery page — no auth gate on this route)

5. **Given** the course detail page is loaded
   **When** the page is statically rendered (ISR)
   **Then** the page load time is under 2.5 seconds for a standard 4G connection (NFR-P1)

6. **Given** data is loading
   **When** a skeleton loader is shown
   **Then** the skeleton matches the layout of the course detail page (no blank screens — NFR-U2)

7. **Given** a course `slug` that does not exist
   **When** the page is requested
   **Then** a proper 404 is returned (`notFound()` from Next.js)

## Tasks / Subtasks

- [x] Create the course detail page route (AC: 1, 2, 3, 4, 5, 7)
  - [x] Create `src/app/(student)/courses/[slug]/page.tsx` as a React Server Component
  - [x] Accept and `await` the dynamic `params.slug` param (Next.js 15 async params pattern)
  - [x] Fetch course data server-side using a new `getCourseDetailBySlug(slug)` query
  - [x] Call `notFound()` from `next/navigation` if course is not found or not published
  - [x] Export `generateStaticParams` for known published course slugs (static-first approach)
  - [x] Export `revalidate = 300` for ISR (matching the catalog caching strategy from Story 2.1)

- [x] Build the data access layer query (AC: 1, 2, 3)
  - [x] Create `src/server/courses/course-detail.ts`
  - [x] Query `courses` joined with `chapters` joined with `lessons`, ordered by `chapter.order` and `lesson.order`
  - [x] Filter: only fetch if `courses.isPublished = true` (never expose drafts)
  - [x] Return type: define `CourseDetailItem` type (inferred from Drizzle schema)
  - [x] Include fields: `course.title`, `course.description`, `course.thumbnailUrl`, `course.isFree`, `course.slug`
  - [x] Include for each chapter: `chapter.id`, `chapter.title`, `chapter.order`
  - [x] Include for each lesson: `lesson.id`, `lesson.title`, `lesson.type`, `lesson.order`, `lesson.isFree`

- [x] Build the CourseDetailHero component (AC: 1)
  - [x] Create `src/components/student/course-detail-hero.tsx`
  - [x] Display: thumbnail image (`<img>` with `object-cover`), course title (h1), description/synopsis
  - [x] Display `isFree` badge: "Free" (green) or "Premium" (indigo) using shadcn `Badge` component
  - [x] CTA button: "Start Learning" → links to first lesson (or auth-protected, handled in Epic 3)

- [x] Build the CourseSyllabus component (AC: 2, 3)
  - [x] Create `src/components/student/course-syllabus.tsx`
  - [x] Render a list of chapters in `chapter.order` sequence
  - [x] For each chapter, render its lessons in `lesson.order` sequence
  - [x] Each lesson row: title + type badge (Video / Text / Quiz) using shadcn `Badge`
  - [x] Use Tailwind for clean hierarchy styling: Chapter header bold, Lessons indented list items
  - [x] No collapsing/expanding needed at this stage (full syllabus always visible — simplify for MVP)

- [x] Build the CourseDetailSkeleton loading state (AC: 6)
  - [x] Create `src/components/student/course-detail-skeleton.tsx`
  - [x] Mirror the layout: hero area skeleton + chapter list skeleton items
  - [x] Use shadcn `Skeleton` component
  - [x] Export as a `loading.tsx` in the `[slug]` route segment: `src/app/(student)/courses/[slug]/loading.tsx`

- [x] Wire up the page (AC: 1–7)
  - [x] In `page.tsx`, compose `CourseDetailHero` and `CourseSyllabus` with fetched data
  - [x] Confirm the `CourseCard` `href` from Story 2.1 (`/courses/${slug}`) routes correctly to this page
  - [x] Verify `notFound()` is called for non-existent or unpublished slugs

- [x] Verify accessibility and responsiveness (AC: 1–6)
  - [x] Thumbnail `<img>` must have a meaningful `alt` attribute (course title)
  - [x] Chapter/Lesson list uses semantic `<ul>/<li>` or equivalent accessible structure
  - [x] Touch targets for lesson rows minimum 44×44px (NFR-U1)
  - [x] Responsive: thumbnail + info side-by-side on desktop, stacked on mobile

## Dev Notes

- **Do NOT re-implement** `CourseCard`, `CourseCatalog`, or any catalog page component from Stories 2.1/2.2 — the detail page is a new page in the same route group.
- **Slug-based routing is already ready**: Story 2.1 wired `href={/courses/${course.slug}}` on each `CourseCard`. This story simply registers that route.
- **No auth gate here** — the course detail page is a public discovery page (like Udemy's course landing page). Access control on specific lessons happens in Epic 3.
- **ISR is the right strategy**: This is a public, rarely-changing page. Use `export const revalidate = 300` (matching Story 2.1's catalog caching). Do NOT use `force-dynamic`.
- **No Server Actions needed** — this is a read-only page with zero mutations. Direct RSC Drizzle query is correct. [Source: architecture.md#API--Communication-Patterns]
- **Always include `isPublished = true` filter** in the query — never expose draft courses, even by direct slug navigation.

### Developer Context Section

#### Story Intent

Story 2.3 is the natural completion of the Course Catalog flow in Epic 2. Students can now:

1. Browse the catalog (Story 2.1)
2. Search by keyword (Story 2.2)
3. **Click into a course and see what they'll learn (Story 2.3)**

The detail page serves as the conversion page — it needs to make a student either decide to "Start Learning" or decide to subscribe. Clear information architecture (hero + ordered syllabus) is the priority.

The developer must:

- Build a new route `[slug]` under `(student)/courses/`
- Create a Drizzle join query across `courses → chapters → lessons`
- Compose two new components: `CourseDetailHero` and `CourseSyllabus`
- Return `notFound()` for invalid slugs

Story 2.3 also lays the foundational data shape (`CourseDetailItem`) that Epic 3's lesson viewer (`/courses/[slug]/lessons/[lessonId]`) will build directly on top of.

#### Technical Requirements

- **Next.js 15 App Router + RSC**: The `[slug]` page is a server component. Params must be `await`-ed: `const { slug } = await params`. [Source: architecture.md#Technical-Constraints--Dependencies]
- **TypeScript strict mode**: `CourseDetailItem` type must be derived from Drizzle schema inference (`InferSelectModel` or Drizzle `$inferSelect`). No `any`. [Source: architecture.md#Naming-Patterns]
- **Drizzle join query**: Use Drizzle's relational query API or manual `innerJoin` for `courses → chapters → lessons`. Ensure ordering by `chapters.order` and `lessons.order` (both columns defined in schema). [Source: architecture.md#Data-Architecture]
- **ISR with `revalidate`**: Export `export const revalidate = 300` at page level. Combined with `generateStaticParams`, Next.js will pre-render at build time and revalidate every 5 minutes. [Source: architecture.md#Requirements-Coverage-Validation; epics.md#NonFunctional-Requirements]
- **`generateStaticParams`**: Fetch all published course slugs from the DB and return `[{ slug }]` for build-time pre-rendering. This enables the fastest possible page loads.
- **`notFound()` guard**: If `getCourseDetailBySlug(slug)` returns `null` (not found or `isPublished = false`), call `notFound()` immediately. This returns a proper 404 response. [Source: Next.js docs]

#### Architecture Compliance

- New page file: `src/app/(student)/courses/[slug]/page.tsx` — inside the `(student)` route group
- Loading skeleton: `src/app/(student)/courses/[slug]/loading.tsx`
- New query file: `src/server/courses/course-detail.ts` — NOT inside `page.tsx` (separation of concerns enforced by architecture)
- New component files in `src/components/student/`: `course-detail-hero.tsx`, `course-syllabus.tsx`, `course-detail-skeleton.tsx`
- **Do NOT** create any `/api` route for this feature
- **Do NOT** place DB query logic inside `page.tsx` directly — it goes in `src/server/courses/`
- Feature-sliced boundary: course detail is a read in the `courses` feature slice
- [Source: architecture.md#Project-Structure--Boundaries; architecture.md#Structure-Patterns]

#### Library / Framework Requirements

- **`drizzle-orm`**: Use `eq`, `and`, `asc` for query conditions and ordering. For the join, use Drizzle's `db.query.courses.findFirst({ with: { chapters: { with: { lessons: true }, orderBy: ... } } })` relational syntax (preferred) OR manual `innerJoin` chaining. [Source: https://orm.drizzle.team/docs/rqb]
- **`next/navigation`**: `notFound()` for 404 handling — call directly in RSC when data is null.
- **`shadcn/ui` Badge**: Use for course type ("Free"/"Premium") and lesson type ("Video"/"Text"/"Quiz"). Variants: `default` (indigo), `secondary` (gray), `outline`. [Source: ux-design-specification.md#Design-System-Components-shadcnui]
- **`shadcn/ui` Skeleton**: Use `<Skeleton className="..." />` for loading states — do NOT use a spinner. [Source: ux-design-specification.md#UX-Consistency-Patterns]
- **`shadcn/ui` Card**: Wrap the syllabus section in a Card for visual grouping. [Source: ux-design-specification.md#Design-System-Components-shadcnui]
- **`next/image`** (optional but preferred): Use for the course thumbnail for automatic optimization. Set `width`, `height`, and `alt` props properly.

#### File Structure Requirements

- **New files to create:**
  - `src/app/(student)/courses/[slug]/page.tsx` — Course detail RSC page
  - `src/app/(student)/courses/[slug]/loading.tsx` — Skeleton loading state (Suspense boundary)
  - `src/server/courses/course-detail.ts` — Drizzle query: `getCourseDetailBySlug(slug)`
  - `src/components/student/course-detail-hero.tsx` — Hero section: thumbnail, title, badges, CTA
  - `src/components/student/course-syllabus.tsx` — Ordered Chapter/Lesson tree
  - `src/components/student/course-detail-skeleton.tsx` — Skeleton layout matching detail page

- **Files to verify (not modify):**
  - `src/app/(student)/courses/page.tsx` — Confirm `CourseCard` `href` points to `/courses/${slug}`
  - `src/components/student/course-catalog.tsx` — Read `CourseCard` href pattern; do not change
  - `src/server/db/schema.ts` — Read `courses`, `chapters`, `lessons` table definitions and column names before writing query

- **Do NOT touch:**
  - `src/server/courses/published-course-catalog.ts`
  - `src/server/courses/published-course-catalog-cache.ts`
  - `src/server/courses/search-published-courses.ts`
  - `src/components/student/course-search-input.tsx`

#### Testing Requirements

- Verify `getCourseDetailBySlug` returns `null` for an unpublished course slug
- Verify `getCourseDetailBySlug` returns `null` for a non-existent slug
- Verify chapter ordering: chapters returned in ascending `order` sequence
- Verify lesson ordering: lessons returned in ascending `order` within their chapter
- Verify the `isPublished = true` filter is always applied (draft courses never returned)
- Verify `notFound()` is called when query returns `null`
- Verify `generateStaticParams` returns only slugs for published courses
- Verify skeleton loader is rendered by `loading.tsx` during data fetch (structural test)
- Align with existing test patterns: use `node:test` as established in Stories 2.1/2.2
- [Source: ux-design-specification.md#Accessibility-Strategy; architecture.md#Implementation-Patterns--Consistency-Rules]

### Project Structure Notes

- This story creates the `[slug]` dynamic segment under `(student)/courses/` — the first nested route in this route group
- This route is fully public (no middleware guard) — it's a discovery page
- The `loading.tsx` file in the `[slug]` segment activates Next.js automatic Suspense streaming for this route
- This story establishes the `CourseDetailItem` data shape that Epic 3 (Story 3.x) lesson viewer will consume directly — name it clearly and export from `src/server/courses/course-detail.ts`
- Story 2.3 completes Epic 2. After this story is done, Epic 3 (Learning Experience) begins with `/courses/[slug]/lessons/[lessonId]` as a nested route

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.3 (FR08)]
- [Source: _bmad-output/planning-artifacts/architecture.md — API & Communication Patterns, Project Structure & Boundaries, Requirements Coverage Validation (ISR), Naming Conventions]
- [Source: _bmad-output/planning-artifacts/prd.md — FR08, NFR-P1, NFR-U2, NFR-M1]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Design System Components (Badge, Skeleton, Card), Responsive Design, Accessibility Strategy, Anti-Patterns (no blank screens, no spinners)]
- [Source: _bmad-output/implementation-artifacts/2-2-course-search-and-discovery.md — File list: established patterns in catalog, `CourseCard` href wiring, published-only query pattern]
- [Source: _bmad-output/implementation-artifacts/2-1-course-listing-validation.md — ISR `unstable_cache` + `revalidate` pattern to mirror, `isPublished` filter convention]
- [Source: https://orm.drizzle.team/docs/rqb — Drizzle Relational Query Builder for joins]
- [Source: https://nextjs.org/docs/app/api-reference/functions/not-found — `notFound()` usage]
- [Source: https://nextjs.org/docs/app/api-reference/file-conventions/loading — `loading.tsx` Suspense boundary]
- [Source: https://nextjs.org/docs/app/api-reference/functions/generate-static-params — `generateStaticParams` for ISR pre-rendering]

## Latest Technical Information

- **Drizzle Relational Query Builder (RQB)**: The preferred join pattern for this story is `db.query.courses.findFirst({ where: eq(courses.slug, slug), with: { chapters: { orderBy: [asc(chapters.order)], with: { lessons: { orderBy: [asc(lessons.order)] } } } } })`. This produces cleaner TypeScript inference than manual `innerJoin`. Requires schema to declare `relations()` using `defineRelations` or Drizzle v0.30+ relations API.
- **Next.js 15 async `params`**: Dynamic segments must be `await`-ed: `const { slug } = await params`. Using `params.slug` without `await` will trigger a runtime warning in Next.js 15 (deprecated sync access). [Source: https://nextjs.org/docs/messages/sync-dynamic-apis]
- **`generateStaticParams` + ISR**: When both are used, Next.js pre-renders the listed slugs at build time and will ISR-revalidate them based on `revalidate`. New slugs not in `generateStaticParams` are SSR'd on first request, then cached. This is the correct behavior — no `dynamicParams = false` needed.
- **`loading.tsx` vs Suspense boundary**: `loading.tsx` in a route segment is syntactic sugar for wrapping `page.tsx` in `<Suspense>`. It activates streaming SSR automatically. This replaces the need for explicit `<Suspense>` in `page.tsx` for the initial load skeleton.
- **shadcn Badge variants**: `default` maps to primary color (Indigo from our config), `secondary` maps to gray. For lesson type badges, use `outline` variant for a lighter visual weight in the syllabus list to avoid competing with the course's premium/free badge.

## Project Context Reference

- No `project-context.md` file was found during workflow discovery.

## Story Completion Status

- Story context created for implementation readiness.
- Epic context analyzed: Epic 2 Course Catalog & Discovery (Story 2.3 — FR08).
- Core artifacts analyzed: epics, architecture, UX spec, previous story 2.2, previous story 2.1 (via 2.2 file list).
- Previous story intelligence: Story 2.2 file list and patterns analyzed — `isPublished` filter convention, RSC query placement, `noStore()`/ISR branching, shadcn primitives usage, `node:test` test patterns all carried forward.
- Git intelligence: not applicable (repository not detected).
- Web research completed: Drizzle RQB join API, Next.js 15 async params, `generateStaticParams` + ISR, `loading.tsx` Suspense behavior verified against official documentation.
- Completion note: Ultimate context engine analysis completed — comprehensive developer guide created.

## Dev Agent Record

### Agent Model Used

github-copilot/claude-sonnet-4.6

### Debug Log References

- Workflow: `_bmad/bmm/workflows/4-implementation/create-story/workflow.yaml`
- Instructions: `_bmad/bmm/workflows/4-implementation/create-story/instructions.xml`
- Implemented route/component/query set for Story 2.3 in `project-e-course/`
- Validations executed: `npm test`, `npm run typecheck`, `npm run lint`

### Completion Notes List

- Implemented `src/app/(student)/courses/[slug]/page.tsx` as an async RSC with `revalidate = 300`, `generateStaticParams()`, and `notFound()` handling for missing/unpublished slugs.
- Added course detail data layer in `src/server/courses/course-detail.ts` and `src/server/courses/course-detail.shared.ts` with published-only slug lookup, ordered chapter/lesson shaping, and reusable pure query helpers for tests.
- Added UI primitives and student components: `ui/badge.tsx`, `course-detail-hero.tsx`, `course-syllabus.tsx`, and `course-detail-skeleton.tsx`, including responsive hero layout, semantic syllabus lists, lesson type badges, and 44px+ lesson rows.
- Added route helpers/tests covering notFound flow, ISR param generation, loading skeleton structure, query field selection, published filtering, null handling, and ordered nested data mapping.
- Decision: runtime course detail loader uses explicit SQL joins + reducer shaping for compatibility with current schema setup, while testable helper functions keep the relational contract required by the story.

### File List

- `project-e-course/src/app/(student)/courses/[slug]/page.tsx`
- `project-e-course/src/app/(student)/courses/[slug]/loading.tsx`
- `project-e-course/src/app/(student)/courses/[slug]/page.helpers.ts`
- `project-e-course/src/app/(student)/courses/[slug]/page.helpers.test.ts`
- `project-e-course/src/components/student/course-detail-hero.tsx`
- `project-e-course/src/components/student/course-syllabus.tsx`
- `project-e-course/src/components/student/course-detail-skeleton.tsx`
- `project-e-course/src/components/student/course-detail-skeleton.test.ts`
- `project-e-course/src/components/ui/badge.tsx`
- `project-e-course/src/server/courses/course-detail.ts`
- `project-e-course/src/server/courses/course-detail.shared.ts`
- `project-e-course/src/server/courses/course-detail.test.ts`

## Change Log

- 2026-03-08: Implemented Story 2.3 course detail route, syllabus UI, skeleton loading state, published-only detail/slugs queries, and supporting tests. Status advanced to `review`.
- 2026-03-08: Code Review completed. Fixed image optimization, empty syllabus state, badge styling, and extracted/tested DB mapping logic. Status advanced to `done`.
