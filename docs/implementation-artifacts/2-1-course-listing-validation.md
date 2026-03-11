# Story 2.1: course-listing-validation

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a student or visitor,
I want to view a catalog of courses,
so that I can browse available learning materials.

## Acceptance Criteria

1. **Given** I navigate to the courses page  
   **When** the page loads  
   **Then** I only see courses that have a `published` status. [Source: _bmad-output/planning-artifacts/epics.md#Story-21-Course-Listing-Validation]
2. **Given** I navigate to the courses page  
   **When** the page loads  
   **Then** the page uses ISR or approved Next.js caching for fast public load times. [Source: _bmad-output/planning-artifacts/epics.md#Story-21-Course-Listing-Validation; _bmad-output/planning-artifacts/architecture.md#API--Communication-Patterns]

## Tasks / Subtasks

- [x] Create the public course catalog route in the student/public route group (AC: 1, 2)
  - [x] Confirm route placement matches the App Router structure for student-facing pages
  - [x] Keep the page primarily server-rendered for public catalog delivery
- [x] Implement typed course listing data access using Drizzle (AC: 1)
  - [x] Query only `published` courses
  - [x] Select only fields needed for the catalog card/list UI
  - [x] Keep query logic out of client-only components
- [x] Apply approved caching strategy for `/courses` (AC: 2)
  - [x] Use route-level ISR and/or `unstable_cache` consistent with architecture guidance
  - [x] Structure implementation so future admin publish flows can revalidate this route cleanly
- [x] Build catalog UI states for success, loading, and empty data (AC: 1, 2)
  - [x] Use skeleton loaders instead of generic spinners
  - [x] Add an empty state with illustration/message and CTA if no published courses exist
  - [x] Ensure the layout works in light and dark mode
- [x] Prepare the page structure for upcoming search and detail stories (AC: 1)
  - [x] Use reusable card/list patterns that can support Story 2.2 search results
  - [x] Ensure each listed course can serve as a clean entry point into Story 2.3 detail pages
- [x] Verify accessibility and responsiveness (AC: 1, 2)
  - [x] Preserve visible focus states and minimum 44x44 touch targets
  - [x] Confirm mobile-first behavior for student-facing layouts

## Dev Notes

- This story establishes the public discovery baseline for Epic 2. It must not leak draft content and must be performant enough to support public-first reviewer impressions.
- Keep the implementation simple and aligned with the documented architecture: App Router, React Server Components, Drizzle, Tailwind, shadcn/ui, and strict TypeScript.
- Do not introduce a new REST endpoint for course listing. This project favors server-rendered data access and Server Actions over custom API routes for internal app behavior. [Source: _bmad-output/planning-artifacts/architecture.md#API--Communication-Patterns]
- The `/courses` route is explicitly called out for ISR / caching optimization. Favor the architecture-approved pattern over ad hoc client fetching. [Source: _bmad-output/planning-artifacts/epics.md#Additional-Requirements; _bmad-output/planning-artifacts/architecture.md#Requirements-Coverage-Validation]
- This page is public. Do not add unnecessary auth gates or middleware requirements for basic catalog visibility.

### Developer Context Section

#### Story Intent

This story is not just about rendering a list. It creates the canonical public catalog baseline that later stories depend on:

- **Story 2.2** will build search/filtering on top of this catalog behavior.
- **Story 2.3** will use catalog entries as the entry point to the course detail and syllabus experience.

If this story mixes concerns or hardcodes assumptions, later catalog/search/detail work will become harder to extend.

#### Technical Requirements

- Use **Next.js 15 App Router** and prefer **React Server Components** for the public listing page. [Source: _bmad-output/planning-artifacts/architecture.md#Technical-Constraints--Dependencies]
- Use **Drizzle ORM + PostgreSQL** as the data source. Schema and inferred types are the source of truth. [Source: _bmad-output/planning-artifacts/architecture.md#Non-Functional-Requirements; _bmad-output/planning-artifacts/prd.md#Database-Architecture-Schema-Drizzle-PostgreSQL]
- Respect **TypeScript strict mode** with zero `any` usage. [Source: _bmad-output/planning-artifacts/prd.md#23-Technical-Success; _bmad-output/planning-artifacts/epics.md#NonFunctional-Requirements]
- Only show courses where status is `published`. Do not surface draft/unpublished records in any empty/loading/success path. [Source: _bmad-output/planning-artifacts/epics.md#Story-21-Course-Listing-Validation]
- Avoid inventing a custom client-side fetching layer for this page unless a small interactive subcomponent requires it.

#### Architecture Compliance

- Keep business/data logic out of `page.tsx` if it becomes substantial; place reusable server-side logic in the appropriate server area. [Source: _bmad-output/planning-artifacts/architecture.md#Structure-Patterns]
- Follow project organization boundaries:
  - App routes under `src/app/`
  - Student-specific UI under `src/components/student/`
  - Shared UI primitives under `src/components/ui/`
  - Database and auth/server concerns under `src/server/` [Source: _bmad-output/planning-artifacts/architecture.md#Complete-Project-Directory-Structure]
- Do not add a non-required `/api` route for listing catalog data. The only explicitly unauthenticated custom route exception is the Midtrans webhook handler. [Source: _bmad-output/planning-artifacts/architecture.md#API--Communication-Patterns; _bmad-output/planning-artifacts/epics.md#Additional-Requirements]

#### Library / Framework Requirements

- **Next.js 15**: implement public catalog rendering with App Router-compatible caching. Current official guidance still supports `unstable_cache`, while newer caching primitives are emerging; for this project, follow the architecture document and keep the solution straightforward. [Source: _bmad-output/planning-artifacts/architecture.md#Technical-Constraints--Dependencies; https://nextjs.org/docs/app/api-reference/functions/unstable_cache; https://nextjs.org/docs/app/guides/caching]
- **React 19**: `useActionState` / `useFormStatus` are not central to this story because the page is primarily read-only. Do not overcomplicate the listing page with form patterns meant for mutations. [Source: _bmad-output/planning-artifacts/architecture.md#Process-Patterns]
- **Drizzle ORM**: use typed queries and keep selected fields minimal for performance. [Source: https://orm.drizzle.team/docs/get-started/postgresql-existing]
- **shadcn/ui + Tailwind**: prefer existing card, badge, skeleton, and layout primitives instead of reinventing custom UI unnecessarily. [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Design-System-Foundation; _bmad-output/planning-artifacts/ux-design-specification.md#Design-System-Components-shadcnui]

#### File Structure Requirements

- Expected route area: `src/app/(student)/courses/` or equivalent student/public route placement consistent with existing project routing.
- Expected UI extraction:
  - catalog page shell in App Router page file
  - reusable student-facing card/list components under `src/components/student/`
  - shared presentational primitives under `src/components/ui/`
- Expected server-side support:
  - typed query helpers and database access under `src/server/`
- Do not place reusable business query logic inside client-only components.

#### Testing Requirements

- Verify unpublished/draft courses never render in the public catalog.
- Verify the route works for anonymous visitors.
- Verify empty-state rendering when no published courses exist.
- Verify loading state uses skeleton loaders rather than generic spinners. [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UX-Consistency-Patterns]
- Verify responsive behavior across mobile and desktop breakpoints. [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Responsive-Design--Accessibility]
- Verify visible focus states and accessible interactive targets. [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Accessibility-Strategy]
- If tests exist in the codebase, align with existing test patterns rather than introducing a new testing style.

### Project Structure Notes

- Public student browsing belongs in the App Router student-facing structure, not admin space. [Source: _bmad-output/planning-artifacts/architecture.md#FeatureEpic-Mapping]
- Admin workflows and premium access logic are separate concerns; do not mix them into this listing story.
- Keep the listing implementation extensible for:
  - search query input and filtering in Story 2.2
  - click-through to course details/syllabus in Story 2.3

### References

- `_bmad-output/planning-artifacts/epics.md` — Epic 2, Story 2.1, Additional Requirements
- `_bmad-output/planning-artifacts/architecture.md` — Technical Constraints & Dependencies, API & Communication Patterns, Structure Patterns, Complete Project Directory Structure, Requirements Coverage Validation
- `_bmad-output/planning-artifacts/prd.md` — Functional Requirements FR06, Technical Success, Database Architecture Schema
- `_bmad-output/planning-artifacts/ux-design-specification.md` — Design System Foundation, Custom Components, UX Consistency Patterns, Responsive Design & Accessibility
- https://nextjs.org/docs/app/guides/caching
- https://nextjs.org/docs/app/api-reference/functions/unstable_cache
- https://orm.drizzle.team/docs/get-started/postgresql-existing

## Latest Technical Information

- Next.js official documentation still documents `unstable_cache`, but it also signals newer caching models. For this project, stay aligned with the architecture document and implement the simplest valid cache strategy for `/courses` without speculative migration work.
- In Next.js App Router, cache choices affect both server render behavior and later route freshness. Keep this story’s implementation ready for future invalidation when admin publish flows are built.
- Public catalog pages benefit from keeping data selection narrow and rendering mostly on the server to reduce client bundle weight and improve perceived load.

## Project Context Reference

- No `project-context.md` file was found during workflow discovery.

## Story Completion Status

- Story context created for implementation readiness.
- Epic context analyzed: Epic 2 Course Catalog & Discovery.
- Core artifacts analyzed: epics, architecture, PRD, UX spec.
- Previous story intelligence: not applicable (first story in epic).
- Git intelligence: not applicable (repository not detected).
- Validation workflow task file `_bmad/core/tasks/validate-workflow.xml` was not present in the project; checklist-based validation could not be executed via the referenced task runner.
- Completion note: Ultimate context engine analysis completed - comprehensive developer guide created.

## Dev Agent Record

### Agent Model Used

cliproxy/gpt-5.4

### Debug Log References

- Workflow: `_bmad/bmm/workflows/4-implementation/create-story/workflow.yaml`
- Instructions: `_bmad/bmm/workflows/4-implementation/create-story/instructions.xml`
- Dev workflow: `_bmad/bmm/workflows/4-implementation/dev-story/workflow.yaml`
- Tests: `npm test`
- Validation: `npm run build && npm run typecheck && npm run lint`

### Completion Notes List

- Story file generated in English as required by config.
- Context optimized for dev agent implementation handoff.
- Implemented public App Router route at `src/app/(student)/courses/page.tsx` with route-level ISR (`revalidate = 300`) and server-rendered catalog delivery.
- Added typed published-course query + cache wrapper in `src/server/courses/published-course-catalog.ts` and `src/server/courses/published-course-catalog-cache.ts` using Drizzle selection limited to catalog fields and `unstable_cache` tag support for future revalidation.
- Built reusable student catalog UI, empty state, and skeleton loading state in `src/components/student/` with 44x44 CTA sizing, visible focus states via shared button styles, and mobile-first grid behavior.
- Added node:test coverage for published filtering query contract and catalog item normalization in `src/server/courses/published-course-catalog.test.ts`.
- Verified implementation with `npm test`, `npm run build && npm run typecheck`, and `npm run lint`.

### File List

- `_bmad-output/implementation-artifacts/2-1-course-listing-validation.md`
- `project-e-course/package.json`
- `project-e-course/tsconfig.json`
- `project-e-course/src/app/(student)/courses/loading.tsx`
- `project-e-course/src/app/(student)/courses/page.tsx`
- `project-e-course/src/components/shared/navbar-auth.tsx`
- `project-e-course/src/components/student/course-catalog-skeleton.tsx`
- `project-e-course/src/components/student/course-catalog.tsx`
- `project-e-course/src/server/courses/published-course-catalog-cache.ts`
- `project-e-course/src/server/courses/published-course-catalog.test.ts`
- `project-e-course/src/server/courses/published-course-catalog.ts`

## Change Log

- 2026-03-08: Implemented Story 2.1 public course catalog route, typed published-course data access, caching, reusable UI states, and test coverage.
