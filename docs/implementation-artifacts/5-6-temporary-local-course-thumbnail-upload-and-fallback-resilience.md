# Story 5.6: Temporary Local Course Thumbnail Upload & Fallback Resilience

Status: done

## Story

As an admin,
I want to upload a thumbnail image file for a course instead of manually pasting a Thumbnail URL,
so that thumbnail management is easier for the current HR handoff while the public course experience remains resilient if thumbnail assets are missing or invalid.

## Acceptance Criteria

1. **Admin file upload replaces manual URL-first workflow**
   **Given** I am on `/admin/courses/[courseId]`
   **When** I manage the course thumbnail
   **Then** I can upload a single image file from my device as the primary workflow instead of relying on manual Thumbnail URL input
   **And** the UI clearly communicates accepted file types and basic constraints
   **And** the existing course record is updated to use the processed uploaded asset path.

2. **Preview and update flow remains simple and clear**
   **Given** I select a valid image file for upload
   **When** the upload and processing succeeds
   **Then** I can see a preview of the resulting thumbnail in the admin course editor
   **And** I can replace it later by uploading a new file
   **And** the admin experience remains aligned with the existing course edit flow rather than becoming a separate media-management system.

3. **Temporary local storage is used intentionally as a transitional solution**
   **Given** the project is currently being prepared for HR handoff
   **When** the thumbnail file is stored
   **Then** it is saved locally on the application host in a dedicated replaceable storage path as a temporary approach
   **And** the story documentation clearly states that this is transitional only
   **And** the implementation is structured so the storage layer can later be migrated to Supabase Storage or another managed service without changing the product intent.

4. **Uploaded images are optimized realistically for fast rendering**
   **Given** a valid image upload is received by the server
   **When** image processing runs
   **Then** the system validates supported image types and rejects unsupported files
   **And** the image is resized to bounded dimensions appropriate for course card/detail usage
   **And** the image is converted to WebP
   **And** aggressive compression settings are applied with a realistic goal of substantially reducing payload size while preserving acceptable visual usability for thumbnails
   **And** the story does not depend on exaggerated or guaranteed compression claims.

5. **Fallback placeholder protects public pages from broken media**
   **Given** a course thumbnail path is empty, missing, invalid, corrupted, or the file no longer exists locally
   **When** a user visits `/courses` or `/courses/[slug]`
   **Then** the UI renders a default placeholder/fallback visual instead of a broken image element
   **And** the page remains readable, usable, and visually coherent until the admin uploads a replacement thumbnail.

6. **Scope boundaries are explicit**
   **Given** the story is reviewed for implementation
   **When** the dev handoff is prepared
   **Then** in scope is limited to admin image upload, local temporary storage, WebP conversion, aggressive resize/compression, preview/update, and placeholder fallback behavior
   **And** out of scope includes final Supabase Storage integration, complex media libraries, crop editors, multiple thumbnails, and advanced CDN/image-management workflows.

## Tasks / Subtasks

- [x] **Task 1: Update admin course editor thumbnail UX from URL entry to file upload** (AC: 1, 2, 6)
  - [x] Replace the primary thumbnail input in `project-e-course/src/components/admin/CourseEditForm.tsx` from manual URL-first text entry to a file upload control
  - [x] Keep the admin flow simple: single image upload, current preview, replace/update action
  - [x] Show accepted formats and practical constraints in helper text (for example: JPG/PNG/WebP, single image only)
  - [x] Ensure the form still fits the existing admin course editor layout and does not introduce a separate media-library UI
  - [x] If any legacy URL field is retained temporarily for backward compatibility, mark it secondary/deprecated in the UI and dev notes rather than primary.

- [x] **Task 2: Add server-side upload and image-processing pipeline for thumbnails** (AC: 1, 3, 4)
  - [x] Implement or extend feature-sliced server action(s) under `project-e-course/src/server/actions/courses/` for thumbnail upload/update
  - [x] Validate file presence, MIME type, and practical size limits before processing
  - [x] Process the uploaded image server-side using a realistic image library already available or acceptable for the stack (e.g. `sharp` if used in project/runtime)
  - [x] Resize to bounded maximum dimensions appropriate for catalog/detail presentation (for example, constrain long edge and avoid oversized originals)
  - [x] Convert output to `.webp`
  - [x] Apply aggressive compression settings tuned for thumbnail use while keeping the result visually usable
  - [x] Return a standardized `ActionResponse<T>` payload.

- [x] **Task 3: Store processed thumbnails locally in an isolated transitional path** (AC: 3)
  - [x] Choose a dedicated local storage directory that is easy to replace later with managed object storage
  - [x] Use deterministic/unique file naming to avoid collisions and stale references
  - [x] Persist the resulting public-facing local path back into the course record via the existing thumbnail field or a minimal compatible approach
  - [x] If replacing an existing locally stored thumbnail, define a safe best-effort cleanup strategy for old files without risking unrelated assets
  - [x] Document clearly in code/story notes that this path is temporary and transitional.

- [x] **Task 4: Preserve compatibility with existing course data and public rendering** (AC: 3, 5)
  - [x] Review existing `thumbnailUrl` data usage in queries, page helpers, and components
  - [x] Ensure public course rendering can consume locally stored thumbnail paths without breaking the current route/data contracts
  - [x] Avoid introducing schema churn unless truly necessary; prefer minimal compatible changes for the temporary approach
  - [x] Revalidate relevant routes after thumbnail updates (`/admin/courses`, `/courses`, `/courses/[slug]`).

- [x] **Task 5: Harden `/courses` fallback behavior for missing/invalid thumbnails** (AC: 5)
  - [x] Update `project-e-course/src/components/student/course-catalog.tsx` so the course card renders the existing gradient placeholder/fallback not only when `thumbnailUrl` is empty, but also when the image fails to load
  - [x] Ensure broken local paths do not leave a broken image icon on screen
  - [x] Preserve existing visual design language from Epic 7 while improving runtime resilience.

- [x] **Task 6: Harden `/courses/[slug]` fallback behavior for missing/invalid thumbnails** (AC: 5)
  - [x] Update `project-e-course/src/components/student/course-detail-hero.tsx` so the hero media block falls back to the existing placeholder treatment if the thumbnail cannot be loaded successfully
  - [x] Preserve hero layout stability and CTA hierarchy even when image loading fails
  - [x] Confirm the fallback works for null, empty, invalid path, and missing local-file cases.

- [x] **Task 7: Add validation, error handling, and admin feedback** (AC: 1, 2, 4)
  - [x] Provide clear admin-facing error feedback for unsupported format, oversize file, or processing failure
  - [x] Ensure upload/update failures do not silently overwrite or clear the existing thumbnail reference
  - [x] Keep feedback lightweight and aligned with the established admin toast/error handling patterns.

- [x] **Task 8: Add or update tests for upload processing and fallback rendering** (AC: 1-6)
  - [x] Add/update validation tests for thumbnail upload constraints
  - [x] Add/update server-action tests covering valid upload, invalid format, and processing failure paths
  - [x] Add/update component tests for `/courses` fallback rendering when image URL/path is null or load fails
  - [x] Add/update component tests for `/courses/[slug]` fallback rendering when image URL/path is null or load fails
  - [x] Verify existing course CRUD and public course rendering tests remain green.

## Dev Notes

### Story Intent

This story is a **transitional enhancement** to Epic 5 course management.

It replaces the fragile manual Thumbnail URL workflow from Story 5.2 with a temporary local-upload approach that is easier for current handoff needs, while deliberately avoiding over-engineering a full media platform before project approval.

### Critical Transitional Constraint

**Local storage is temporary.**

Do not present or implement this as the final long-term media architecture. The goal is:

1. make admin thumbnail management easier now,
2. keep public pages resilient now,
3. preserve a clean migration path later.

The storage implementation should therefore be thin, isolated, and replaceable.

### Why Epic 5 Is the Correct Epic

This belongs in **Epic 5: Admin Content Management (Back-Office CMS)** because the primary workflow change happens inside the admin course editor and extends FR21's thumbnail-management capability.

It does affect public pages (`/courses`, `/courses/[slug]`), but only to add resilience/fallback behavior for thumbnail presentation. It is not a new public-zone design story.

### Existing Baseline from Prior Stories

- Story 5.2 currently uses **Thumbnail URL** in the course editor and stores the value in `thumbnailUrl`
- Story 7.1 already has a gradient placeholder in the catalog when no thumbnail exists
- Story 7.2 already has a placeholder media block in the course detail hero when no thumbnail exists

This story should **extend those existing fallback patterns** so they also protect against runtime failures and broken local files, not only `null`/empty values.

### Project Root Reminder

All implementation work for the application lives under:

- `project-e-course/`

Do not create source files in the outer shell project root.

### Architecture Alignment

Relevant architecture guidance already in place:

- Next.js App Router + Server Actions
- feature-sliced server actions under `src/server/actions/[feature]`
- standardized `ActionResponse<T>` contract
- strict TypeScript, no `any`
- public routes `/courses` and `/courses/[slug]` remain public and must stay resilient

The original architecture preferred URL-only thumbnails to save time. This story is an intentional temporary deviation for delivery practicality, but should remain **pragmatic**, not turn into a full asset platform.

### Recommended Technical Direction

- Keep using the existing `thumbnailUrl` field if feasible for compatibility, storing a local served path rather than introducing unnecessary schema churn
- Isolate upload logic behind course thumbnail-specific helpers/actions so storage can later be swapped
- Prefer a local path convention that can later map naturally to Supabase Storage public URLs or signed asset URLs
- If using `sharp`, keep settings realistic and documented as **targets**, not promises:
  - bounded dimensions suitable for card/hero usage
  - WebP output
  - aggressive thumbnail-oriented compression

### Realistic Optimization Guidance

Do **not** write implementation notes that promise guaranteed savings like “99% compression” or “always ultra-fast.”

Use realistic language such as:

- target significantly smaller thumbnails than original uploads
- bound oversized images to practical render dimensions
- aggressively compress for thumbnail use while retaining acceptable readability/visual clarity

### Placeholder / Fallback Guidance

The fallback requirement applies to both:

- `project-e-course/src/components/student/course-catalog.tsx`
- `project-e-course/src/components/student/course-detail-hero.tsx`

The UI must handle at least these cases:

- no thumbnail path stored
- malformed path/value
- file deleted or unavailable from local storage
- image load error at runtime

The page should still look intentional and not display a broken media icon.

### In Scope / Out of Scope

**In scope**

- admin single image upload
- temporary local storage
- WebP conversion
- aggressive resize/compression with realistic targets
- preview/update flow
- fallback placeholder on `/courses` and `/courses/[slug]`

**Out of scope**

- Supabase Storage final integration
- complex media library
- crop/focal-point editor
- multiple thumbnails
- advanced image variants/CDN pipeline

### Likely Files to Touch

- `project-e-course/src/components/admin/CourseEditForm.tsx`
- `project-e-course/src/server/actions/courses/index.ts`
- `project-e-course/src/server/actions/courses/shared.ts`
- `project-e-course/src/lib/validations/course.ts`
- `project-e-course/src/components/student/course-catalog.tsx`
- `project-e-course/src/components/student/course-detail-hero.tsx`
- relevant tests under `src/components/**` and `src/server/**`

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 5, Story 5.2, new Story 5.6]
- [Source: `_bmad-output/planning-artifacts/prd.md` — FR21 admin manages course thumbnail]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — Server Actions pattern, ActionResponse contract, public route matrix, previous URL-only media strategy]
- [Source: `_bmad-output/implementation-artifacts/5-2-course-management-crud.md` — current admin course editor baseline with Thumbnail URL]
- [Source: `project-e-course/src/components/student/course-catalog.tsx` — current `/courses` placeholder baseline]
- [Source: `project-e-course/src/components/student/course-detail-hero.tsx` — current `/courses/[slug]` placeholder baseline]
- [Source: `_bmad-output/planning-artifacts/change-proposal-story-5-6-temporary-local-course-thumbnail-upload.md`]

## Risk / Catatan Transisional

- Local file storage may not be durable across some deployment environments; this is acceptable only because the approach is temporary for current handoff/review needs.
- If the app is redeployed or files are cleaned from the host, thumbnails may disappear; this is why fallback rendering on public pages is mandatory.
- A future migration should move the storage backend to Supabase Storage or another managed object-storage/CDN solution without forcing admins to relearn the thumbnail workflow.
- Avoid deep coupling between UI and local filesystem details; encapsulate path generation and storage behavior.

## Definition of Done

- [x] Admin can upload a single thumbnail image file from the course editor as the primary thumbnail workflow
- [x] Admin sees preview/update behavior for the uploaded thumbnail
- [x] Uploaded thumbnail is validated and processed server-side
- [x] Output image is resized to practical bounds, converted to WebP, and compressed aggressively with realistic thumbnail-quality targets
- [x] Processed thumbnail is stored locally in a clearly transitional/replaceable path
- [x] Course data persists a compatible thumbnail path/reference after upload
- [x] `/courses` shows a fallback placeholder when thumbnail is missing or invalid at runtime
- [x] `/courses/[slug]` shows a fallback placeholder when thumbnail is missing or invalid at runtime
- [x] Broken image icons are not shown on those public surfaces for missing/invalid thumbnail cases
- [x] Revalidation covers admin and public routes affected by thumbnail updates
- [x] Validation/error feedback is clear for unsupported files or processing failures
- [x] Story notes clearly mark local storage as temporary/transitional before migration to Supabase Storage or another service
- [x] Relevant automated tests are updated/added and passing
- [x] `npm run lint` passes
- [x] `npm run typecheck` passes

## Dev Agent Record

### Agent Model Used

cliproxy/gpt-5.4

### Debug Log References

- `npm exec vitest run`
- `npm run lint`
- `npm run typecheck`

### Completion Notes List

- Replaced admin thumbnail URL-first editing with a single-file upload flow, helper copy, preview/update UX, and toast-based success/error handling in the existing course editor.
- Added a transitional local thumbnail storage pipeline under `src/server/actions/courses/` using MIME/size validation, Sharp resize-to-bounds, WebP conversion, aggressive thumbnail compression, unique local file naming, and best-effort cleanup for replaced local assets.
- Preserved `thumbnailUrl` compatibility by storing root-relative local asset paths, revalidating `/admin/courses`, `/admin/courses/[courseId]`, `/courses`, and `/courses/[slug]`, and extending public course surfaces to fall back on runtime image load failure instead of showing broken images.
- Added and updated validation, server action, admin form, catalog, and course detail hero tests; full Vitest suite, lint, and typecheck completed successfully.

### File List

- `_bmad-output/implementation-artifacts/5-6-temporary-local-course-thumbnail-upload-and-fallback-resilience.md`
- `project-e-course/src/components/admin/CourseEditForm.tsx`
- `project-e-course/src/components/admin/CourseEditForm.test.tsx`
- `project-e-course/src/components/shared/thumbnail-with-fallback.tsx`
- `project-e-course/src/components/student/course-catalog.tsx`
- `project-e-course/src/components/student/course-catalog.test.tsx`
- `project-e-course/src/components/student/course-detail-hero.tsx`
- `project-e-course/src/components/student/course-detail-hero.test.tsx`
- `project-e-course/src/lib/validations/course.ts`
- `project-e-course/src/lib/validations/course.test.ts`
- `project-e-course/src/server/actions/courses/index.ts`
- `project-e-course/src/server/actions/courses/shared.ts`
- `project-e-course/src/server/actions/courses/shared.test.ts`
- `project-e-course/src/server/actions/courses/thumbnail-storage.ts`

### Change Log

- 2026-03-11: Implemented transitional local course thumbnail upload, processing, preview/update workflow, and resilient public fallback rendering for Story 5.6.
