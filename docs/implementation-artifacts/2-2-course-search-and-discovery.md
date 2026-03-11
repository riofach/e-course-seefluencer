# Story 2.2: Course Search & Discovery

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a student,
I want to search for courses by title,
so that I can quickly find topics I am interested in.

## Acceptance Criteria

1. **Given** I am on the course catalog (`/courses`)
   **When** I type a query into the search bar
   **Then** the catalog filters courses whose titles match the text input using an ILIKE query (FR07)

2. **Given** I type a search query
   **When** the results are filtered
   **Then** only published courses whose titles match the query are shown (preserving the `isPublished = true` filter from Story 2.1)

3. **Given** I clear the search input or leave it empty
   **When** the catalog reloads
   **Then** the full published catalog is restored (same behavior as Story 2.1 baseline)

4. **Given** I type a query that matches no published courses
   **When** results are returned
   **Then** the catalog displays the existing empty state UI with illustration + CTA

5. **Given** I type a search query
   **When** the URL updates
   **Then** the search state is reflected in the URL as a `?q=` query parameter so the result is shareable/bookmarkable (URL Search Params as state — architecture requirement)

## Tasks / Subtasks

- [x] Extend the courses page to read `?q=` search param and pass to data layer (AC: 1, 5)
  - [x] Update `CoursesPage` in `src/app/(student)/courses/page.tsx` to accept and await `searchParams.q`
  - [x] Sanitize the query (trim, enforce max length ~100 chars) before passing to the query layer
- [x] Implement ILIKE search in the Drizzle data access layer (AC: 1, 2)
  - [x] Add `searchPublishedCourses(query, limit, offset)` function in `src/server/courses/`
  - [x] Query must always include `isPublished = true` — never expose unpublished courses via search
  - [x] Use Drizzle's `ilike(courses.title, \`%${q}%\`)`with the`and()` combinator alongside the published filter
  - [x] Return the same `PublishedCourseCatalogItem` shape as Story 2.1 (reuse `toPublishedCourseCatalogItem`)
- [x] Build the Search Input UI as a client-side form component (AC: 1, 3, 5)
  - [x] Create `src/components/student/course-search-input.tsx` as a `'use client'` component
  - [x] Use `useRouter` + `useSearchParams` from `next/navigation` — replace `?q=` param on submit/debounce
  - [x] Default input value from current `?q=` param so state is preserved on navigation
  - [x] Use `shadcn/ui Input` primitive styled to match catalog page header
  - [x] Debounce the search submission (300–500ms) to avoid spamming server re-renders
- [x] Wire search results into the catalog display (AC: 2, 3, 4)
  - [x] In `CoursesPage`: if `q` is present, call `searchPublishedCourses`; else call existing `getPublishedCourseCatalog`
  - [x] Pass results to existing `CourseCatalog` component — no structural change to `CourseCatalog` needed
  - [x] Reuse existing `CourseCatalogEmptyState` when results are empty (AC: 4)
- [x] Caching strategy for search results (AC: 1, 5)
  - [x] Search results should NOT use the ISR `revalidate = 300` path — they are dynamic by nature
  - [x] Force dynamic rendering for the page when `q` is present: `export const dynamic = 'force-dynamic'` or conditionally use `noStore()`
  - [x] The base catalog (no query) continues using the existing `unstable_cache` / ISR path from Story 2.1
- [x] Verify accessibility and responsiveness (AC: 1–5)
  - [x] Search input must have an accessible `aria-label` or `<label>` association
  - [x] Keyboard: pressing Enter submits the search; clear button (if added) is keyboard-accessible
  - [x] Minimum 44×44px touch target for the search input area (NFR-U1)

## Dev Notes

- This story extends Story 2.1's catalog page. **Do not rewrite** `CoursesPage`, `CourseCatalog`, or `getPublishedCourseCatalog` — extend and compose them.
- The search input is a thin Client Component wrapper. The data fetching remains server-side (RSC) — the component updates the URL, and the Next.js App Router re-renders the server page with the new `searchParams`.
- Architecture mandates: **URL Search Params as state** (not React Context, not useState alone). [Source: architecture.md#Cross-Cutting-Concerns-Identified]
- Do NOT create a new REST `/api` route for search. Use the existing RSC + Drizzle pattern. [Source: architecture.md#API--Communication-Patterns]
- `isPublished` filter is non-negotiable in both `getPublishedCourseCatalog` and `searchPublishedCourses`. Never expose draft courses publicly.

### Developer Context Section

#### Story Intent

Story 2.2 adds the search capability on top of the catalog baseline established in Story 2.1. The intent is:

- Students can find relevant courses fast via a text search bar (FR07)
- The page URL carries the search state (`?q=term`) so results are bookmarkable/shareable
- The developer must NOT reinvent the catalog rendering — the existing `CourseCatalog` and empty state components work without modification
- The data layer needs a new search query function that composes the same ILIKE + published filter

Next story (2.3) will use the catalog card's `href={/courses/${slug}}` for the detail page — the slug-based routing is already wired in Story 2.1.

#### Technical Requirements

- **Next.js 15 App Router + RSC:** Page re-renders server-side when `?q=` changes. The client component (`CourseSearchInput`) only updates the URL — it does not fetch data. [Source: architecture.md#Technical-Constraints--Dependencies]
- **TypeScript strict mode:** No `any`. The search query parameter from `searchParams` is `string | undefined` — handle both. [Source: prd.md#2.3-Technical-Success]
- **Drizzle ILIKE:** Use `ilike(courses.title, \`%${sanitizedQ}%\`)`combined with`eq(courses.isPublished, true)`via`and()`. Import from `drizzle-orm`. [Source: architecture.md#Data-Architecture]
- **Published-only guard:** Always include `eq(courses.isPublished, true)` in search. No exceptions.
- **Input sanitization:** Trim whitespace, cap at ~100 chars. Empty/whitespace query → fall back to full catalog.
- **No new `/api` routes.** The only exempt route is `/api/webhooks/midtrans`. [Source: architecture.md#API--Communication-Patterns]

#### Architecture Compliance

- Keep search query logic in `src/server/courses/` — not inside the page or client component
- Client component goes in `src/components/student/course-search-input.tsx`
- Page file stays in `src/app/(student)/courses/page.tsx` — extend, do not recreate
- Reuse `PublishedCourseCatalogItem` type and `toPublishedCourseCatalogItem` mapper from Story 2.1
- Feature-sliced Server Actions boundary: search is a read query, not a mutation — no Server Action needed; direct RSC query is correct
- [Source: architecture.md#Project-Structure--Boundaries; architecture.md#Architectural-Boundaries]

#### Library / Framework Requirements

- **`drizzle-orm`:** `ilike`, `and`, `eq`, `desc`, `asc` — all already imported in the catalog query; compose them for search [Source: https://orm.drizzle.team/docs/operators#ilike]
- **`next/navigation`:** `useRouter()`, `useSearchParams()`, `usePathname()` for the client component URL management [Source: https://nextjs.org/docs/app/api-reference/functions/use-search-params]
- **`shadcn/ui` Input:** Reuse the existing `~/components/ui/input` primitive — do NOT create a raw `<input>` [Source: ux-design-specification.md#Design-System-Components-shadcnui]
- **`next/cache`:** `unstable_cache` is already wired for the base catalog; for search results, use `noStore()` from `next/cache` to opt the dynamic path out of caching [Source: architecture.md#Requirements-Coverage-Validation]
- **React 19 patterns:** `useActionState`/`useFormStatus` are not needed here — this is a URL navigation pattern, not a form mutation

#### File Structure Requirements

- New files:
  - `src/server/courses/search-published-courses.ts` — Drizzle ILIKE search query (returns `PublishedCourseCatalogItem[]`)
  - `src/components/student/course-search-input.tsx` — `'use client'` search bar, URL-driven
- Modified files:
  - `src/app/(student)/courses/page.tsx` — read `searchParams.q`, branch between catalog and search, render `CourseSearchInput`
- **Do NOT modify:**
  - `src/server/courses/published-course-catalog.ts` — existing mapper/type reused as-is
  - `src/server/courses/published-course-catalog-cache.ts` — existing cache layer untouched
  - `src/components/student/course-catalog.tsx` — works for both full catalog and search results without changes
  - `src/components/student/course-catalog-skeleton.tsx` — loading skeleton reused as-is

#### Testing Requirements

- Verify search with a matching partial title returns only published courses with ILIKE match
- Verify search with a query that matches no course shows the empty state
- Verify empty query string returns the full published catalog (same as Story 2.1)
- Verify unpublished courses are never returned even if title matches the query
- Verify the `?q=` param is set in the URL when the user types a search term
- Verify clearing the search input restores the full catalog
- Verify the search input has correct accessibility attributes (`aria-label` or `<label>`)
- Verify touch target is at least 44×44px on mobile viewports [Source: ux-design-specification.md#Accessibility-Strategy]
- Align with existing test patterns in `src/server/courses/*.test.ts` — use node:test

### Project Structure Notes

- The search feature lives entirely within the `(student)` route group — no admin or API files touched
- No new route is created — `/courses` page is extended in place
- The existing ISR/cache path for the base catalog is preserved; the dynamic search path is opt-in only when `q` param is present
- Story 2.3 (detail page) depends on the existing `href={/courses/${slug}}` links already in `CourseCatalogCard` — no changes needed to those links

### References

- `_bmad-output/planning-artifacts/epics.md` — Epic 2, Story 2.2 (FR07), Additional Requirements (URL Search Params, No custom `/api` routes)
- `_bmad-output/planning-artifacts/architecture.md` — API & Communication Patterns, Cross-Cutting Concerns (URL Search Params), Complete Project Directory Structure, Implementation Patterns
- `_bmad-output/planning-artifacts/prd.md` — FR07, NFR-U1, NFR-P1, Technical Success (TypeScript strict)
- `_bmad-output/planning-artifacts/ux-design-specification.md` — Accessibility Strategy, Responsive Design, Design System Components (shadcn/ui Input), UX Consistency Patterns
- `_bmad-output/implementation-artifacts/2-1-course-listing-validation.md` — Previous story: file list, patterns established, catalog component structure
- `project-e-course/src/server/courses/published-course-catalog.ts` — Reuse: `PublishedCourseCatalogItem`, `toPublishedCourseCatalogItem`, `fetchPublishedCourseCatalog` signature
- `project-e-course/src/server/courses/published-course-catalog-cache.ts` — Reuse: `COURSE_CATALOG_CACHE_TAG`, do not modify
- `project-e-course/src/components/student/course-catalog.tsx` — Reuse without modification
- `project-e-course/src/app/(student)/courses/page.tsx` — Extend (not replace)
- `project-e-course/src/server/db/schema.ts` — `courses` table: `isPublished`, `title`, `slug` columns
- https://orm.drizzle.team/docs/operators#ilike
- https://nextjs.org/docs/app/api-reference/functions/use-search-params
- https://nextjs.org/docs/app/api-reference/functions/use-router

## Latest Technical Information

- **Drizzle `ilike`**: Available as a top-level import from `drizzle-orm`. Usage: `ilike(column, pattern)`. Combine with `and(eq(...), ilike(...))` for multi-condition queries. The `%` wildcards must be included in the pattern string. Case-insensitive by nature.
- **`useSearchParams` in Next.js 15 App Router**: Must be wrapped in `<Suspense>` if used inside a component that is part of a page boundary, to avoid opt-out of static rendering. Since the search input is client-only and the page is already dynamic when `q` is present, this is straightforward.
- **`noStore()` from `next/cache`**: Call at the top of the server function/component to opt out of the cache for that render. Preferred over `export const dynamic = 'force-dynamic'` for fine-grained control — use it inside the search branch only, so the base catalog path retains ISR.
- **URL Search Param pattern**: `router.replace(\`${pathname}?${params.toString()}\`)`is the idiomatic App Router approach. Use`URLSearchParams`API to set/delete the`q` param cleanly.

## Project Context Reference

- No `project-context.md` file was found during workflow discovery.

## Story Completion Status

- Story context created for implementation readiness.
- Epic context analyzed: Epic 2 Course Catalog & Discovery (Story 2.2 — FR07).
- Core artifacts analyzed: epics, architecture, PRD, UX spec, previous story 2.1, actual codebase inspection.
- Previous story intelligence: Story 2.1 file list and patterns analyzed; existing `CourseCatalog`, `toPublishedCourseCatalogItem`, and cache layer fully mapped for reuse.
- Git intelligence: not applicable (repository not detected).
- Web research completed: Drizzle `ilike` operator and Next.js `useSearchParams` / `noStore` patterns verified against official documentation.
- Completion note: Ultimate context engine analysis completed — comprehensive developer guide created.

## Dev Agent Record

### Agent Model Used

github-copilot/claude-sonnet-4.6

### Debug Log References

- Workflow: `_bmad/bmm/workflows/4-implementation/create-story/workflow.yaml`
- Instructions: `_bmad/bmm/workflows/4-implementation/create-story/instructions.xml`

### Completion Notes List

- Implemented URL-driven course search on `src/app/(student)/courses/page.tsx` using sanitized `searchParams.q`, dynamic `noStore()` only for searched renders, and preserved cached published catalog fallback.
- Added `src/server/courses/search-published-courses.ts` with Drizzle `and(eq(isPublished, true), ilike(title, pattern))` query logic and reused `toPublishedCourseCatalogItem` mapper.
- Added `src/components/student/course-search-input.tsx` plus helper utilities to debounce `router.replace`, preserve current query state, provide clear action, and meet accessibility/touch target requirements.
- Added node:test coverage for search query helpers and Drizzle search query behavior; validation passed via `npm test`, `npm run lint`, and `npm run typecheck`.
- **Code Review Fixes**:
  - Wrapped `CourseSearchInput` in a `<Suspense>` boundary in `page.tsx` as required by Next.js 15.
  - Fixed `CourseSearchInput` race conditions and redundant router pushes by tracking Uncontrolled/Controlled states properly.
  - Escaped SQL wildcard characters (`%`, `_`) in `search-published-courses.ts` to prevent ILIKE injection bugs.
  - Added specific empty state messaging in `course-catalog.tsx` when a search query yields no matches.

### File List

- project-e-course/src/app/(student)/courses/page.tsx
- project-e-course/src/components/student/course-search-input.tsx
- project-e-course/src/components/student/course-search-input.helpers.ts
- project-e-course/src/components/student/course-search-input.helpers.test.ts
- project-e-course/src/server/courses/search-published-courses.ts
- project-e-course/src/server/courses/search-published-courses.test.ts
