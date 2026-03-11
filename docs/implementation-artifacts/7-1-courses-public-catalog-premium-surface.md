# Story 7.1: /courses Public Catalog Premium Surface

Status: done

## Story

As a visitor or student,
I want the course catalog to feel like a premium public surface consistent with the landing page,
So that my first impression of the course library matches the brand quality I experienced on the homepage.

## Acceptance Criteria

1. **[Guest Access — Auth Bug Fix]**
   Given I am an unauthenticated visitor navigating to `/courses`
   When the page renders
   Then I see the full course catalog WITHOUT being redirected to `/login`
   And published courses are listed with their titles, thumbnails, and access badges (Free / Premium)

2. **[Premium Public-Zone Header]**
   Given the catalog page is rendered
   When I view the top of the page
   Then a catalog hero/header section is present using Fraunces or Playfair Display for the display heading
   And a gradient accent treatment (Coral `#FF6B6B` → Purple `#9B59B6` → Teal `#1ABC9C`) is applied in the hero zone, consistent with `/` and `/pricing`
   And the page background uses dark surface token `#0F0F14`

3. **[Course Card Visual Alignment]**
   Given published courses are listed
   When I view the course cards
   Then each card uses dark card background `#1A1A24` with `1px` border `#2A2A3C`
   And the card border-radius follows the public-zone large radius (24px or `rounded-3xl`)
   And each card displays: thumbnail image, course title (Inter semi-bold), short description, and an access badge ("Free" or "Premium")
   And the "Free" badge uses Teal `#1ABC9C` treatment and "Premium" badge uses Indigo/Violet treatment

4. **[Search Bar Accent Treatment]**
   Given I view the search bar on the catalog page
   When the search input is focused or active
   Then the focus ring and active border use Indigo `#6366F1` accent
   And the search input background matches the dark card token `#1A1A24`

5. **[Empty State]**
   Given no courses match the current search query (or no published courses exist)
   When the empty state renders
   Then an illustration or icon is shown alongside a descriptive message
   And a CTA button (e.g., "Browse All Courses" or "Clear Search") is present — NOT a blank screen

6. **[Typography & Spacing Consistency]**
   Given the full catalog page is rendered
   When I review typography and spacing
   Then body text (descriptions, labels) uses Inter with tight tracking (`-0.02em`)
   And heading hierarchy is consistent: display font for the page title, Inter semi-bold for course card titles
   And section spacing matches the public-zone rhythm established on `/` and `/pricing`

7. **[Session-Aware Navbar]**
   Given the catalog page is rendered
   When I view the navbar
   Then the shared `PublicNavbar` component is used (same as `/`, `/pricing`)
   And the navbar correctly shows signed-in user name if a session exists, or auth CTA if not
   And no regression is introduced to the navbar on other public routes

8. **[ISR / Caching — No Regression]**
   Given the catalog page fetches published courses
   When the page is served
   Then the existing ISR (`revalidate`) or `unstable_cache` caching strategy is preserved or improved — NOT removed
   And the page still only displays courses with `status: 'published'`

## Tasks / Subtasks

- [x] **Task 1: Fix auth guard to allow public access to `/courses`** (AC: #1)
  - [x] 1.1 Check `src/middleware.ts` — confirm whether `/courses` (the catalog root) is protected; it must NOT be (only `/courses/[slug]/[lessonId]` lesson routes may remain protected at Server Component level)
  - [x] 1.2 Check if `/courses` lives inside a route group (`(student)`) with a shared `layout.tsx` auth guard — if so, either extract `/courses` to a public route group, or scope the auth guard to exclude the catalog root
  - [x] 1.3 Confirm the middleware `matcher` pattern does NOT block unauthenticated access to `/courses` (the catalog) — deep lesson routes like `/courses/[slug]/[lessonId]` may still be session-checked at Server Component level
  - [x] 1.4 Smoke test: visit `/courses` in incognito/logged-out state → must show full catalog, NOT redirect to `/login`
  - [x] 1.5 Regression: confirm `/admin/*` and premium lesson access remain protected

- [x] **Task 2: Redesign catalog hero/header with public-zone treatment** (AC: #2, #6)
  - [x] 2.1 Add a catalog hero/header section above the course grid
  - [x] 2.2 Hero heading uses Fraunces or Playfair Display (match font-family used on `/` landing page hero)
  - [x] 2.3 Apply Coral → Purple → Teal gradient accent in the hero section (e.g., gradient text on heading, or decorative gradient blob/bar — match the pattern used in `/pricing` hero)
  - [x] 2.4 Page background wrapper uses `bg-[#0F0F14]`
  - [x] 2.5 Hero/header section padding and spacing align with public-zone rhythm from `/` and `/pricing`

- [x] **Task 3: Redesign course cards with dark public-surface tokens** (AC: #3, #6)
  - [x] 3.1 Card background: `bg-[#1A1A24]`
  - [x] 3.2 Card border: `border border-[#2A2A3C]` with `rounded-3xl` (or match the radius pattern from `/pricing` plan cards)
  - [x] 3.3 Thumbnail: full-width image top of card with `rounded-t-3xl` overflow clip; fallback gradient placeholder if no thumbnail URL
  - [x] 3.4 "Free" badge: teal treatment — `bg-teal-500/20 text-teal-400 border border-teal-500/20`
  - [x] 3.5 "Premium" badge: indigo/violet treatment — `bg-indigo-500/20 text-indigo-400 border border-indigo-500/20`
  - [x] 3.6 Course title: Inter `font-semibold text-white`; description: Inter `text-sm text-gray-400 tracking-tight`
  - [x] 3.7 Card hover state: subtle border brightening (`hover:border-[#3A3A4C]`) or glow — consistent with dark card hover from the UX mockup

- [x] **Task 4: Style search bar with Indigo/Violet accent** (AC: #4)
  - [x] 4.1 Search input background: `bg-[#1A1A24]`
  - [x] 4.2 Default border: `border-[#2A2A3C]`
  - [x] 4.3 Focus state: `focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500` (match the pattern from `ux-design-directions.html`)
  - [x] 4.4 Placeholder text: `placeholder:text-gray-500`
  - [x] 4.5 Search icon (if present): `text-gray-500`

- [x] **Task 5: Implement polished empty state** (AC: #5)
  - [x] 5.1 When search yields zero results: show icon/illustration + "No courses found" message + "Clear Search" CTA button
  - [x] 5.2 When no published courses exist at all: show icon/illustration + "No courses available yet" + CTA linking to `/` or `/pricing`
  - [x] 5.3 CTA button in empty state uses Indigo primary style (`bg-indigo-600 hover:bg-indigo-500`)
  - [x] 5.4 Empty state is NOT a blank screen (NFR-U2 enforcement)

- [x] **Task 6: Verify shared PublicNavbar and caching** (AC: #7, #8)
  - [x] 6.1 Confirm `PublicNavbar` from `src/components/shared/` is used — do NOT create a new navbar
  - [x] 6.2 Confirm `revalidate` or `unstable_cache` on the courses fetch is preserved (architecture ISR requirement)
  - [x] 6.3 Confirm only `status: 'published'` courses are shown (FR06)
  - [x] 6.4 Skeleton loaders are shown while course data loads (NFR-U2) — use shadcn `Skeleton`

## Dev Notes

### 🚨 CRITICAL: Auth Bug — Same Root Cause as Story 7.3

`/courses` (the catalog root) is currently inaccessible to unauthenticated visitors — they are redirected to `/login`. This is the same class of bug as Story 7.3 (`/pricing`). The fix follows the exact same pattern.

**Where to look first (in order):**

1. `project-e-course/src/middleware.ts`
   - Check the `matcher` config. From Story 7.3 Completion Notes, the matcher was confirmed to still protect `/courses/:path*`. The pattern `/courses/:path*` catches `/courses/anything` but does it also catch `/courses` (no trailing segment)? Verify carefully — if the matcher uses `/courses/:path*`, the root `/courses` might be excluded already. But if it uses `/courses(.*)` or is combined with a route group layout guard, the root is also blocked.
   - **Safe fix:** Ensure the matcher explicitly allows `/courses` root while protecting `/courses/[slug]/[lessonId]` lesson routes (which still need session checks at the Server Component layer).

2. `project-e-course/src/app/(student)/` route group layout
   - Check if `/courses` page lives inside `(student)` group and if that group's `layout.tsx` has a `getServerSession` + `redirect('/login')` guard at the top.
   - If so: either move the courses catalog page out of `(student)` into a `(public)` route group (matching the architectural intent), or add an exception condition in the layout guard.

3. Cross-reference Story 7.3's fix approach:
   - Story 7.3 Completion Notes: "Verified no middleware expansion opened protected routes; matcher still protects only `/admin/:path*`, `/courses/:path*`, and `/profile/:path*`"
   - This confirms the middleware was intentionally left protecting `/courses/:path*` for lesson routes. The fix for `/courses` catalog root must be scoped at the **route group layout level**, not by changing the middleware matcher.

**Lesson routes MUST remain protected:** `/courses/[slug]/[lessonId]` still needs session + entitlement checks (Premium paywall). Do NOT accidentally open those. The protection for lesson routes should happen at the Server Component level inside those specific pages, not in middleware or the shared layout.

---

### Visual Benchmark: The UX Design Mockup

The `ux-design-directions.html` Direction 2 (Dark Mode Catalog mockup) is the **direct visual reference** for the course card design. Key patterns from that mockup:

```html
<!-- Card structure from ux-design-directions.html -->
<div class="bg-cardDark border border-gray-800 rounded-lg p-3 hover:border-gray-700 transition-colors">
  <div class="h-24 bg-gray-800 rounded-md mb-3 relative overflow-hidden">
    <!-- gradient overlay on thumbnail -->
    <div class="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent"></div>
    <!-- badge -->
    <div class="absolute top-2 right-2 bg-white/10 backdrop-blur-md border border-white/10 text-[10px] px-2 py-0.5 rounded-full">
      Premium
    </div>
  </div>
  <h4 class="text-sm font-medium mb-1">Course Title</h4>
  <p class="text-[11px] text-gray-400 mb-3">Short description.</p>
  <!-- For free courses: Start Course CTA button -->
  <button class="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] py-1.5 rounded-md font-medium">
    Start Course
  </button>
</div>
```

Apply the actual design tokens (`#1A1A24`, `#2A2A3C`) instead of the Tailwind named colors from the mockup. The mockup uses `cardDark` and `gray-800` as approximations — use the exact hex values in production.

---

### Public Zone Design Tokens (Consistent Across All Public Routes)

| Token | Value | Tailwind / Usage |
|---|---|---|
| Page bg | `#0F0F14` | `bg-[#0F0F14]` |
| Card bg | `#1A1A24` | `bg-[#1A1A24]` |
| Card border | `#2A2A3C` | `border border-[#2A2A3C]` |
| Card hover border | `#3A3A4C` | `hover:border-[#3A3A4C]` |
| Gradient: Coral | `#FF6B6B` | hero gradient start |
| Gradient: Purple | `#9B59B6` | hero gradient mid |
| Gradient: Teal | `#1ABC9C` | hero gradient end |
| Primary CTA | `#6366F1` | `bg-indigo-600` |
| CTA hover | `#8B5CF6` | `hover:bg-violet-500` |
| Free badge | teal | `bg-teal-500/20 text-teal-400 border-teal-500/20` |
| Premium badge | indigo | `bg-indigo-500/20 text-indigo-400 border-indigo-500/20` |
| Display font | Fraunces / Playfair Display | `font-display` class |
| Body font | Inter `-0.02em` | `font-sans tracking-tight` |

The CSS variables for these are already defined in the project (set up during Epic 6):
```css
--color-coral: #FF6B6B;
--color-purple: #9B59B6;
--color-teal: #1ABC9C;
--color-indigo: #6366F1;
--color-violet: #8B5CF6;
--color-bg-dark: #0F0F14;
```

---

### Gradient Hero Pattern (Match `/pricing` Implementation)

Story 7.3 established the gradient hero pattern for public routes. Inspect `project-e-course/src/components/student/pricing-page-client.tsx` (or equivalent) to see the exact gradient implementation. Apply the same class pattern to the `/courses` catalog hero — do NOT reinvent it.

The `hero-gradient` CSS class from `ux-design-directions.html`:
```css
.hero-gradient {
  background: linear-gradient(135deg, #ff6b6b 0%, #9b59b6 50%, #1abc9c 100%);
}
```

For the catalog hero heading, gradient text treatment:
```tsx
<h1 className="font-display text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B6B] via-[#9B59B6] to-[#1ABC9C]">
  Browse Courses
</h1>
```

---

### Existing Courses Data Fetch — PRESERVE ISR

The existing `/courses` page already fetches published courses with ISR caching (architecture requirement). **Do NOT remove or bypass this.** The fetch pattern should look like:

```tsx
// Preserve existing revalidate pattern
export const revalidate = 3600; // or whatever value was set

// Or with unstable_cache:
const getCourses = unstable_cache(
  async () => db.query.courses.findMany({ where: eq(courses.status, 'published') }),
  ['courses-published'],
  { revalidate: 3600 }
);
```

The redesign task is **visual only** for the data layer — do not change the query, only the rendering layer.

---

### Course Data Shape (Drizzle Schema)

```
Courses
├── id, title, description, thumbnail (URL string), slug
├── status ('published' | 'draft')
├── isFree (boolean)
├── sortOrder, createdAt, updatedAt
```

Use `isFree` to determine badge type:
- `isFree === true` → "Free" badge (teal)
- `isFree === false` → "Premium" badge (indigo/violet)

Thumbnail is a URL string. If `thumbnail` is null/empty, render a gradient placeholder:
```tsx
{course.thumbnail ? (
  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
) : (
  <div className="w-full h-full bg-gradient-to-tr from-[#9B59B6]/30 to-[#1ABC9C]/10" />
)}
```

---

### File Structure

Follow the established project layout:

```
project-e-course/src/
├── app/
│   ├── (student)/
│   │   └── courses/
│   │       ├── page.tsx          ← Main catalog page (Server Component)
│   │       └── loading.tsx       ← Skeleton loader (Suspense fallback)
│   └── middleware.ts             ← Check/fix auth guard here
├── components/
│   ├── shared/
│   │   └── PublicNavbar          ← Reuse — do NOT create new navbar
│   └── student/                  ← OR create a public/ subfolder
│       ├── CourseCard.tsx         ← Redesign this (or new CourseCatalogCard.tsx)
│       ├── CourseGrid.tsx         ← Grid wrapper + search bar
│       └── CatalogEmptyState.tsx  ← New: polished empty state component
```

**Naming conventions (match project):**
- Components: `PascalCase.tsx`
- Route paths: `kebab-case`
- Server actions: `camelCase` (no new actions needed for this story — reads only)

---

### Search Bar: Existing Implementation

The search bar for `/courses` was implemented in Story 2.2 using URL Search Params as state (architecture decision). The existing behavior:
- Search query stored in URL: `/courses?q=react`
- ILIKE query on course titles in the DB fetch
- URL Search Params as state (no React Context, no client state — this is correct per architecture)

**Do NOT change the search behavior/logic.** Only restyle the search input element to match dark surface tokens (Task 4). The search URL param state pattern must be preserved.

---

### Session Detection in Catalog

The catalog itself does not require session for rendering — it is a public page. However, the navbar needs session state. Use the same pattern as Story 7.3:

```tsx
// page.tsx (Server Component)
import { getServerAuthSession } from "@/server/auth";

export default async function CoursesPage({ searchParams }) {
  const session = await getServerAuthSession();
  const courses = await getCourses(searchParams?.q);
  
  return (
    <>
      <PublicNavbar session={session} />
      <CatalogHero />
      <CourseGrid courses={courses} />
    </>
  );
}
```

Do NOT add any `redirect('/login')` call here — the page must render for all visitors.

---

### Skeleton Loaders

Per NFR-U2: use shadcn `Skeleton` for loading states, not a spinner. The `loading.tsx` file provides the Suspense boundary fallback. Create a `CatalogSkeleton` component with:
- Skeleton for hero/header section
- Grid of skeleton course cards (2–3 rows of 3 cards each)
- Each skeleton card matches the shape of the real course card

---

### Accessibility & Responsive Requirements

- **Responsive grid:** 1 column on mobile (`grid-cols-1`), 2 on tablet (`md:grid-cols-2`), 3 on desktop (`lg:grid-cols-3`)
- **Touch targets:** Course card CTA buttons minimum 44×44px
- **Color contrast:** Course title text on `#1A1A24` card bg must meet WCAG AA 4.5:1
- **Focus rings:** Search input and card links use `focus-visible:ring-2 focus-visible:ring-indigo-500`
- **Alt text:** Course thumbnail `img` must have `alt={course.title}`

---

### Anti-Patterns to Avoid

- ❌ Do NOT add `redirect('/login')` anywhere in the catalog page — it must render for all visitors
- ❌ Do NOT change the search URL param logic — only restyle the input element
- ❌ Do NOT remove the ISR `revalidate` config — it's a hard architecture requirement (NFR-P1)
- ❌ Do NOT create a new navbar — use the shared `PublicNavbar`
- ❌ Do NOT use a generic spinner — use shadcn Skeleton cards
- ❌ Do NOT leave an empty/blank screen for zero-results state
- ❌ Do NOT reinvent the courses DB query — only change the rendering layer
- ❌ Do NOT accidentally open `/courses/[slug]/[lessonId]` lesson routes — those must remain session-protected at their Server Component level

### Project Structure Notes

- Inspect `project-e-course/src/components/student/pricing-page-client.tsx` **before writing any code** — it contains the already-working gradient hero, dark token, and card pattern from Story 7.3. The `/courses` catalog hero should match this visual treatment.
- Inspect `project-e-course/src/app/page.tsx` (landing page) to see the exact `font-display` class usage and Fraunces font setup — replicate the same class on the catalog hero heading.
- The `PublicNavbar` is in `project-e-course/src/components/shared/`. Do not duplicate it.
- Story 7.3 file list confirms the project root is `project-e-course/` — all file paths in this story use that prefix.

### References

- FR06 (Course catalog — published only): [Source: _bmad-output/planning-artifacts/prd.md#6.2]
- FR07 (Search bar — ILIKE): [Source: _bmad-output/planning-artifacts/prd.md#6.2]
- ISR caching requirement: [Source: _bmad-output/planning-artifacts/architecture.md#Requirements-Coverage-Validation]
- Route Protection Matrix: [Source: _bmad-output/planning-artifacts/architecture.md#Explicit-Route-Protection-Matrix]
- Public Zone Design Tokens: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Color-System]
- Typography System: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Typography-System]
- Course card dark mockup: [Source: _bmad-output/planning-artifacts/ux-design-directions.html — Direction 2 Dark Mode Catalog]
- Empty state requirement: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Form-Patterns]
- Story 7.1 definition: [Source: _bmad-output/planning-artifacts/epics.md#Story-7.1]
- Story 7.3 (pattern reference — auth fix + public zone): [Source: _bmad-output/implementation-artifacts/7-3-pricing-public-marketing-surface-redesign.md]
- Epic 7 objective: [Source: _bmad-output/planning-artifacts/epics.md#Epic-7]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4.6 (Bob — Scrum Master, Create Story workflow)

### Debug Log References

- `npx vitest run "src/middleware.test.tsx" "src/app/(student)/courses/page.test.tsx" "src/components/student/course-catalog.test.tsx" "src/components/student/course-search-input.test.tsx" "src/components/student/course-catalog-skeleton.test.tsx"`
- `npm run lint`
- `npm run typecheck`
- `npx vitest run`

### Completion Notes List

- Removed `/courses` from middleware matcher so guest traffic reaches the catalog root again, while `/admin/*` and `/profile/*` stay middleware-protected and lesson routes remain server-protected in `src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx`.
- Rebuilt `src/app/(student)/courses/page.tsx` as a premium public-zone surface using the same dark hero/card rhythm established on `/pricing`, with Playfair display headings, gradient atmospheric accents, and Inter tight-tracking body copy.
- Redesigned `src/components/student/course-catalog.tsx` for dark premium cards, thumbnail fallback gradients, teal/indigo access badges, stronger CTA hierarchy, and non-blank empty states for both no-results and no-published-courses scenarios.
- Restyled `src/components/student/course-search-input.tsx` to preserve existing URL-param discovery behavior while aligning focus, border, placeholder, and icon treatments to the approved indigo public-zone tokens.
- Expanded `src/components/student/course-catalog-skeleton.tsx` and `src/app/(student)/courses/loading.tsx` so loading states now mirror the hero, search, and card layout with shadcn `Skeleton` instead of generic placeholders.
- Validation passed: `npm run lint`, `npm run typecheck`, full `npx vitest run` (102 tests).

### File List

- project-e-course/src/middleware.ts
- project-e-course/src/middleware.test.tsx
- project-e-course/src/app/(student)/courses/page.tsx
- project-e-course/src/app/(student)/courses/page.test.tsx
- project-e-course/src/app/(student)/courses/loading.tsx
- project-e-course/src/components/student/course-catalog.tsx
- project-e-course/src/components/student/course-catalog.test.tsx
- project-e-course/src/components/student/course-search-input.tsx
- project-e-course/src/components/student/course-search-input.test.tsx
- project-e-course/src/components/student/course-catalog-skeleton.tsx
- project-e-course/src/components/student/course-catalog-skeleton.test.tsx

## Change Log

- 2026-03-11: Fixed `/courses` guest access regression, redesigned the public catalog to match premium public-zone direction, added catalog/search/skeleton regression coverage, and verified lint + typecheck + full Vitest suite.
