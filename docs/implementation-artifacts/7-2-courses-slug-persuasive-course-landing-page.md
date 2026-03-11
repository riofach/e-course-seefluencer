# Story 7.2: /courses/[slug] Persuasive Course Landing Page

Status: done

## Story

As a visitor or student viewing a specific course,
I want the course detail page to function as a persuasive course landing page,
So that I am motivated to start, enroll, or subscribe rather than only reading the syllabus.

## Acceptance Criteria

1. **[Guest Access — Auth Bug Fix]**
   Given I am an unauthenticated visitor navigating to `/courses/[slug]`
   When the page renders
   Then I see the full course detail page WITHOUT being redirected to `/login`
   And the course title, description, metadata, and syllabus are visible to all visitors

2. **[Primary CTA Above the Fold]**
   Given the course detail page is rendered
   When I view the section above the fold (before scrolling)
   Then a primary CTA button is visible (e.g., "Start Learning", "Enroll Now", or "Subscribe to Access")
   And the CTA is contextually appropriate: for free courses it says "Start Learning", for premium courses with no subscription it says "Enroll Now" or links to `/pricing`
   And the CTA appears in the hero/header section, not just below the full syllabus

3. **[Public-Zone Hero with Gradient Accent Treatment]**
   Given the page is rendered
   When I view the hero section
   Then the hero uses Fraunces or Playfair Display for the course title (display heading)
   And a gradient accent treatment (Coral `#FF6B6B` → Purple `#9B59B6` → Teal `#1ABC9C`) is applied in the hero zone, consistent with `/`, `/courses`, and `/pricing`
   And the page background uses dark surface token `#0F0F14`

4. **[Course Metadata — Prominent and Scannable]**
   Given the hero section is rendered
   When I review the course metadata
   Then I see at minimum: course title, short description, access type (Free / Premium badge), and a visual thumbnail or gradient placeholder
   And metadata uses Inter with tight tracking (`-0.02em`) for body/label text
   And the Free/Premium badge uses established badge tokens (teal for Free, indigo/violet for Premium)

5. **[Structured Syllabus Component]**
   Given the course has chapters and lessons
   When I scroll to the syllabus section below the hero
   Then chapters are displayed as collapsible or expanded sections with chapter title and lesson count
   And each lesson within a chapter shows: lesson title, lesson type icon (Video/Text/Quiz), and estimated or sequential position
   And the syllabus is scannable — not a plain bullet list; it is a structured accordion or stacked section component

6. **[Premium Lesson Lock Indicator]**
   Given the course has premium lessons (i.e., the course `isFree: false` OR premium lessons exist in free courses)
   When I view the syllabus
   Then premium lessons show a lock icon or "Premium" indicator alongside their title
   And the page does NOT hard-block or hide premium lesson titles — the names must be visible with a lock state
   And a contextual CTA (e.g., "Unlock with Premium" or "Subscribe to access all lessons") appears inline or near the premium section

7. **[Trust / Learning Outcomes Section]**
   Given I scroll past the syllabus
   When I review the page content below the chapter list
   Then a learning outcomes or trust reinforcement section is visible
   And it communicates the value of completing the course (e.g., "What you'll learn", "Skills you'll gain", or "Who this course is for")
   And dummy data is acceptable for MVP if the course data model does not include this field

8. **[Repeated CTA at Bottom]**
   Given I scroll to the bottom of the course detail page
   When I review the footer section of the page content
   Then a repeated primary CTA button is visible (same CTA logic as AC #2)
   And the CTA does not require scrolling back to the top to take action

9. **[Session-Aware Navbar]**
   Given the course detail page is rendered
   When I view the navbar
   Then the shared `PublicNavbar` component is used (same as `/`, `/courses`, `/pricing`)
   And the navbar correctly shows the signed-in user name if a session exists, or auth CTA if not
   And no regression is introduced to the navbar on other public routes

10. **[No Regression — Lesson Viewer]**
    Given the course detail page redesign is implemented
    When I (as an authenticated student) click a lesson in the syllabus
    Then I am navigated to the lesson viewer at `/courses/[slug]/[lessonId]`
    And the lesson viewer (Story 3.1) and sidebar (Story 3.2) remain fully functional — no regression
    And premium paywall overlay (Story 4.1) still activates when a non-subscriber clicks a premium lesson

## Tasks / Subtasks

- [x] **Task 1: Fix auth guard to allow public access to `/courses/[slug]`** (AC: #1)
  - [x] 1.1 Confirm the `/courses/[slug]` page is the _course detail_ page (not the lesson viewer) — it must be publicly accessible
  - [x] 1.2 Check `project-e-course/src/middleware.ts` — the matcher `courses/:path*` may cover `/courses/[slug]` at the route group level; verify if the `(student)` layout guard also wraps this route
  - [x] 1.3 Check `project-e-course/src/app/(student)/courses/[slug]/page.tsx` (or equivalent) — remove any `getServerSession` + `redirect('/login')` guard at the top of the page (the page must render for all visitors)
  - [x] 1.4 Confirm that `/courses/[slug]/[lessonId]` lesson viewer routes remain session-protected at the Server Component level — do NOT open these
  - [x] 1.5 Smoke test: visit `/courses/some-slug` in incognito/logged-out state → must show full course detail page, NOT redirect to `/login`
  - [x] 1.6 Regression: confirm `/admin/*` and premium lesson routes remain protected

- [x] **Task 2: Redesign course detail page hero section** (AC: #2, #3, #4)
  - [x] 2.1 Add a course hero section above the syllabus — this replaces or wraps the existing course info/header
  - [x] 2.2 Hero heading (course title): use Fraunces or Playfair Display (`font-display`), gradient text treatment from Coral → Purple → Teal
  - [x] 2.3 Apply dark surface tokens: page bg `bg-[#0F0F14]`, hero wrapper consistent with `/pricing` and `/courses`
  - [x] 2.4 Display course thumbnail (or gradient placeholder if no thumbnail) in the hero zone
  - [x] 2.5 Course description: Inter `-0.02em` tracking, `text-gray-300` or `text-gray-400`
  - [x] 2.6 Free/Premium badge using established badge tokens: `bg-teal-500/20 text-teal-400 border-teal-500/20` for Free, `bg-indigo-500/20 text-indigo-400 border-indigo-500/20` for Premium
  - [x] 2.7 Primary CTA button in the hero: visible above the fold — contextual logic: free course → "Start Learning" (link to first lesson); premium course (no subscription) → "Enroll Now" / "Get Premium Access" → `/pricing`

- [x] **Task 3: Build structured syllabus component** (AC: #5, #6)
  - [x] 3.1 Create a `CourseSyllabus` component (or update existing syllabus render) that renders chapters as collapsible or always-open sections
  - [x] 3.2 Each chapter shows: chapter title, lesson count badge (e.g., "4 lessons")
  - [x] 3.3 Each lesson in the chapter shows: lesson type icon (Video 🎥 / Text 📖 / Quiz 📝), lesson title, and sequential number
  - [x] 3.4 Premium lesson indicator: lock icon (🔒) + "Premium" text badge alongside lesson title for lessons in a premium course — do NOT hide the lesson title
  - [x] 3.5 Below premium section OR inline: "Unlock with Premium — Subscribe for full access" CTA linking to `/pricing`
  - [x] 3.6 Use shadcn `Accordion` or custom collapsible component — do NOT use a plain `<ul>` list
  - [x] 3.7 Dark surface tokens: accordion/section bg `bg-[#1A1A24]`, border `border-[#2A2A3C]`

- [x] **Task 4: Add learning outcomes / trust section** (AC: #7)
  - [x] 4.1 Create a `CourseOutcomes` or `CourseTrustSection` component
  - [x] 4.2 Display 3–5 bullet points in "What you'll learn" format (dummy data acceptable if no DB field exists)
  - [x] 4.3 Optionally: "Who this course is for" or "Prerequisites" section below outcomes
  - [x] 4.4 Section uses dark card tokens: `bg-[#1A1A24] border border-[#2A2A3C]` card wrapper
  - [x] 4.5 Icon checkmarks per outcome item use Teal `#1ABC9C` color

- [x] **Task 5: Add repeated bottom CTA** (AC: #8)
  - [x] 5.1 After the syllabus and trust section, render a bottom CTA section with the same CTA logic as the hero (free → "Start Learning", premium → "Get Premium Access")
  - [x] 5.2 Bottom CTA uses the same Indigo primary button style: `bg-indigo-600 hover:bg-indigo-500`
  - [x] 5.3 Add a brief reinforcement line above the CTA button (e.g., "Ready to start? Join thousands of learners today.")

- [x] **Task 6: Verify shared PublicNavbar and no regressions** (AC: #9, #10)
  - [x] 6.1 Confirm `PublicNavbar` from `project-e-course/src/components/shared/` is used — do NOT create a new navbar
  - [x] 6.2 Confirm `getServerAuthSession()` is called for session prop — passed to `PublicNavbar` (same pattern as Story 7.3 and 7.1)
  - [x] 6.3 Confirm lesson viewer routes `/courses/[slug]/[lessonId]` still require session (Server Component level guard)
  - [x] 6.4 Confirm paywall overlay (Story 4.1) is still triggered for non-subscribers on premium lessons
  - [x] 6.5 Skeleton loader in `loading.tsx` for the course detail page (shadcn `Skeleton`)

## Dev Notes

### 🚨 CRITICAL: Auth Bug — Same Pattern as Stories 7.1 and 7.3

`/courses/[slug]` (the course detail page) is almost certainly inaccessible to unauthenticated visitors, redirecting them to `/login`. This is the same class of auth bug fixed in Stories 7.3 and 7.1.

**Where to look first (in order):**

1. **`project-e-course/src/app/(student)/courses/[slug]/page.tsx`**
   - Check if there is a `getServerSession()` + `redirect('/login')` guard at the top of this page.
   - If yes: remove the redirect. The page must render for all visitors.
   - KEEP `getServerSession()` for session-aware behavior (navbar + CTA logic) — but do NOT redirect if no session.

2. **`project-e-course/src/app/(student)/layout.tsx`** (or equivalent route group layout)
   - Check if the `(student)` route group layout has a shared auth guard that covers `/courses/[slug]`.
   - From Story 7.3 Completion Notes: the fix was applied at the _page level_, not middleware. The same approach should be used here.
   - If the layout guard covers all routes including `/courses/[slug]`, you may need to extract `[slug]` into a separate route group or add an exception condition.

3. **`project-e-course/src/middleware.ts`**
   - From Story 7.3: matcher still protects `/courses/:path*`. This pattern matches `/courses/anything` but may or may not match `/courses/some-slug` — test carefully.
   - **DO NOT change the middleware matcher** — fix at the page/layout level only, per Story 7.3 pattern.
   - Lesson viewer routes `/courses/[slug]/[lessonId]` MUST remain protected at the Server Component level.

**Key distinction:**

- `/courses/[slug]` = **course detail page** → PUBLIC (must be accessible without auth)
- `/courses/[slug]/[lessonId]` = **lesson viewer** → PROTECTED (requires session + entitlement check at Server Component level)

---

### Course Detail Page — Existing Implementation Context

The current `/courses/[slug]` page was implemented in **Story 2.3** (Course Detail & Syllabus View). That story delivered:

- Course info (title, description)
- Syllabus: Chapter list → Lesson list per chapter
- The page pulls data using the course `slug` to query DB

**DO NOT reinvent the data fetch.** The existing DB query pattern is in `page.tsx`. This story is a **visual redesign + public access fix** — the data layer should be preserved.

Expected existing data fetch pattern (Drizzle):

```tsx
// Existing pattern — preserve this
const course = await db.query.courses.findFirst({
	where: eq(courses.slug, params.slug),
	with: {
		chapters: {
			orderBy: [asc(chapters.sortOrder)],
			with: {
				lessons: {
					orderBy: [asc(lessons.sortOrder)],
				},
			},
		},
	},
});

if (!course) notFound();
```

---

### Course Data Shape (Drizzle Schema)

```
Courses
├── id, title, description, thumbnail (URL | null), slug
├── status ('published' | 'draft')
├── isFree (boolean)
├── sortOrder, createdAt, updatedAt
└── chapters[]
    ├── id, title, description, sortOrder
    └── lessons[]
        ├── id, title, type ('video' | 'text' | 'quiz')
        ├── videoUrl (for video type), content (for text type)
        ├── sortOrder
        └── (no isFree field on lesson — access control derives from parent course.isFree)
```

**Access logic for the course detail page:**

- `course.isFree === true` → All lessons accessible to authenticated users; CTA = "Start Learning"
- `course.isFree === false` → Lessons accessible only to active subscribers; CTA = "Get Premium Access" → `/pricing`
- For the detail page itself: render for ALL visitors regardless of `isFree`

**Learning Outcomes:** The DB schema may not have a dedicated `outcomes` field on courses. Use dummy/hardcoded outcomes for MVP display. Suggested approach:

```tsx
const dummyOutcomes = [
	'Master the core concepts through hands-on exercises',
	'Build real-world projects you can add to your portfolio',
	'Earn a completion certificate upon finishing the course',
	'Get lifetime access to all course materials and updates',
];
```

---

### Public Zone Design Tokens (Consistent Across All Public Routes)

| Token             | Value                       | Tailwind / Usage                                        |
| ----------------- | --------------------------- | ------------------------------------------------------- |
| Page bg           | `#0F0F14`                   | `bg-[#0F0F14]`                                          |
| Card bg           | `#1A1A24`                   | `bg-[#1A1A24]`                                          |
| Card border       | `#2A2A3C`                   | `border border-[#2A2A3C]`                               |
| Card hover border | `#3A3A4C`                   | `hover:border-[#3A3A4C]`                                |
| Gradient: Coral   | `#FF6B6B`                   | hero gradient start                                     |
| Gradient: Purple  | `#9B59B6`                   | hero gradient mid                                       |
| Gradient: Teal    | `#1ABC9C`                   | hero gradient end                                       |
| Primary CTA       | `#6366F1`                   | `bg-indigo-600`                                         |
| CTA hover         | `#8B5CF6`                   | `hover:bg-violet-500`                                   |
| Free badge        | teal                        | `bg-teal-500/20 text-teal-400 border-teal-500/20`       |
| Premium badge     | indigo                      | `bg-indigo-500/20 text-indigo-400 border-indigo-500/20` |
| Display font      | Fraunces / Playfair Display | `font-display` class                                    |
| Body font         | Inter `-0.02em`             | `font-sans tracking-tight`                              |

The CSS variables are already defined in the project (established in Epic 6):

```css
--color-coral: #ff6b6b;
--color-purple: #9b59b6;
--color-teal: #1abc9c;
--color-indigo: #6366f1;
--color-violet: #8b5cf6;
--color-bg-dark: #0f0f14;
```

---

### Gradient Hero Pattern (Exact Pattern from Story 7.3)

Story 7.3 established the working gradient hero. **Inspect `project-e-course/src/components/student/pricing-page-client.tsx` before writing any code** to get the exact class pattern.

Gradient text heading (for course title):

```tsx
<h1 className="font-display text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B6B] via-[#9B59B6] to-[#1ABC9C]">
	{course.title}
</h1>
```

Hero background accent blob pattern (from pricing):

```tsx
<div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[#FF6B6B]/10 via-[#9B59B6]/10 to-[#1ABC9C]/10 rounded-full blur-3xl pointer-events-none" />
```

---

### Session Detection Pattern

Same pattern as Stories 7.1 and 7.3 (Option A — Server Component preferred):

```tsx
// project-e-course/src/app/(student)/courses/[slug]/page.tsx
import { getServerAuthSession } from "@/server/auth";

export default async function CourseDetailPage({ params }) {
  const session = await getServerAuthSession();
  const course = await getCourseBySlug(params.slug); // existing query — preserve it

  if (!course) notFound();

  return (
    <>
      <PublicNavbar session={session} />
      <CourseDetailClient course={course} isAuthenticated={!!session} hasActiveSubscription={...} />
    </>
  );
}
```

For subscription state detection:

```tsx
// In the page, check if authenticated user has active subscription
const subscription = session?.user?.id
	? await db.query.subscriptions.findFirst({
			where: and(eq(subscriptions.userId, session.user.id), eq(subscriptions.status, 'active')),
		})
	: null;

const hasActiveSubscription = !!subscription;
```

Pass `hasActiveSubscription` to the CTA component to render correct CTA label and link.

---

### CTA Logic Matrix

| Visitor State                      | Course Type | CTA Label                | CTA Action                                |
| ---------------------------------- | ----------- | ------------------------ | ----------------------------------------- |
| Unauthenticated                    | Free        | "Start Learning"         | `/login?callbackUrl=/courses/[slug]`      |
| Unauthenticated                    | Premium     | "Get Premium Access"     | `/pricing`                                |
| Authenticated, no subscription     | Free        | "Start Learning"         | First lesson `/courses/[slug]/[lessonId]` |
| Authenticated, no subscription     | Premium     | "Enroll Now — Subscribe" | `/pricing`                                |
| Authenticated, active subscription | Any         | "Continue Learning"      | First lesson or last visited lesson       |

---

### Syllabus Component Pattern

Use shadcn `Accordion` for chapter collapsible sections:

```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Chapter header
<AccordionTrigger className="bg-[#1A1A24] border border-[#2A2A3C] px-4 py-3 rounded-xl">
  <div className="flex items-center justify-between w-full">
    <span className="font-semibold text-white">{chapter.title}</span>
    <span className="text-xs text-gray-400 mr-4">{chapter.lessons.length} lessons</span>
  </div>
</AccordionTrigger>

// Lesson row
<div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#2A2A3C] last:border-0">
  {/* Type icon */}
  <LessonTypeIcon type={lesson.type} />
  {/* Title */}
  <span className="text-sm text-gray-200 flex-1">{lesson.title}</span>
  {/* Lock indicator for premium lessons */}
  {!course.isFree && (
    <span className="text-xs text-indigo-400 flex items-center gap-1">
      <LockIcon className="w-3 h-3" /> Premium
    </span>
  )}
</div>
```

---

### File Structure

Follow the established project layout:

```
project-e-course/src/
├── app/
│   ├── (student)/
│   │   └── courses/
│   │       └── [slug]/
│   │           ├── page.tsx          ← Redesign this (Server Component) — fix auth guard here
│   │           └── loading.tsx       ← Skeleton loader (update or create)
│   │           └── [lessonId]/       ← DO NOT TOUCH — lesson viewer (protected)
│   └── middleware.ts                 ← DO NOT CHANGE — fix at page level only
├── components/
│   ├── shared/
│   │   └── PublicNavbar              ← Reuse — do NOT create new navbar
│   └── student/
│       ├── course-detail-client.tsx   ← New or update: client wrapper for session-aware CTAs
│       ├── course-syllabus.tsx        ← New: structured syllabus component
│       ├── course-outcomes.tsx        ← New: learning outcomes / trust section
│       └── course-detail-skeleton.tsx ← New: skeleton loader component
```

**Naming conventions (match project):**

- Components: `PascalCase.tsx` OR `kebab-case.tsx` — match whatever convention is already used in `components/student/`
- From Story 7.3 File List: `pricing-page-client.tsx` uses kebab-case → use the same convention here

---

### Skeleton Loaders

Per NFR-U2: use shadcn `Skeleton` for loading state. The `loading.tsx` Suspense fallback should render:

- Skeleton hero block (full-width, ~200–280px height)
- Skeleton course metadata (title, badge, description)
- Skeleton CTA button
- 3–4 skeleton chapter accordion rows
- Skeleton outcomes section

---

### Lesson Viewer Protection — DO NOT TOUCH

Lesson viewer routes (`/courses/[slug]/[lessonId]`) MUST remain session-protected. From Story 7.3 Completion Notes:

> "Verified no middleware expansion opened protected routes; matcher still protects only `/admin/:path*`, `/courses/:path*`, and `/profile/:path*`"

The session check for lesson viewer pages should remain in those Server Components:

```tsx
// DO NOT REMOVE from /courses/[slug]/[lessonId]/page.tsx
const session = await getServerAuthSession();
if (!session) redirect('/login?callbackUrl=...');
```

This story only touches the **course detail** page (`/courses/[slug]`), not the lesson viewer (`/courses/[slug]/[lessonId]`).

---

### Paywall Overlay — DO NOT BREAK

The `PaywallTeaserOverlay` (Story 4.1) activates INSIDE the lesson viewer when a non-subscriber tries to access a premium lesson. This story does NOT touch the lesson viewer — so paywall behavior should not be affected. However, verify during testing that the paywall still activates correctly after any route group layout changes.

---

### Accessibility & Responsive Requirements

- **Responsive layout:** hero section stacks vertically on mobile, side-by-side (image + info) on desktop if thumbnail is large
- **Touch targets:** CTA buttons minimum 44×44px
- **Color contrast:** Course title gradient text must maintain visual readability (gradient text can fail contrast checkers — supplement with white fallback for very small text)
- **Focus rings:** Syllabus accordion triggers use `focus-visible:ring-2 focus-visible:ring-indigo-500`
- **Alt text:** Thumbnail `img` must have `alt={course.title}`
- **Semantic headings:** `h1` for course title, `h2` for sections (Syllabus, What You'll Learn), `h3` for chapter titles

---

### Anti-Patterns to Avoid

- ❌ Do NOT add `redirect('/login')` in the course detail page for unauthenticated visitors — it must render for all
- ❌ Do NOT touch `/courses/[slug]/[lessonId]` lesson viewer pages — leave them protected
- ❌ Do NOT change the middleware matcher — fix at the page/layout level only
- ❌ Do NOT create a new navbar — use the shared `PublicNavbar`
- ❌ Do NOT hide premium lesson titles in the syllabus — show them with a lock indicator
- ❌ Do NOT use a generic spinner — use shadcn Skeleton
- ❌ Do NOT reinvent the course DB query — only change the rendering layer
- ❌ Do NOT hardcode the course slug — use the dynamic `params.slug` from Next.js
- ❌ Do NOT wrap the entire page in `"use client"` — use Server Component for the page shell, Client Component only for interactive CTAs

### Project Structure Notes

- Inspect `project-e-course/src/components/student/pricing-page-client.tsx` **before writing any code** — it contains the exact working gradient hero, dark token, and card patterns from Story 7.3. The course detail hero should match this visual treatment.
- Inspect `project-e-course/src/app/page.tsx` (landing page) for the `font-display` class usage and Fraunces font setup.
- The existing syllabus from Story 2.3 is in `project-e-course/src/app/(student)/courses/[slug]/page.tsx` — do NOT delete it, only enhance it.
- Story 7.3 File List confirms the project root is `project-e-course/` — all file paths use that prefix.
- The `PublicNavbar` is in `project-e-course/src/components/shared/`. Do not duplicate it.

### References

- FR08 (Course detail + syllabus — chapter/lesson hierarchy): [Source: _bmad-output/planning-artifacts/prd.md#6.2]
- FR15 (Paywall — must NOT break): [Source: _bmad-output/planning-artifacts/prd.md#6.4]
- FR16 (Pricing public surface): [Source: _bmad-output/planning-artifacts/prd.md#6.4]
- Route Protection Matrix: [Source: _bmad-output/planning-artifacts/architecture.md#Explicit-Route-Protection-Matrix]
- ISR caching requirement: [Source: _bmad-output/planning-artifacts/architecture.md#Requirements-Coverage-Validation]
- Public Zone Design Tokens: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Color-System]
- Typography System: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Typography-System]
- Story 2.3 (Course Detail baseline implementation): [Source: _bmad-output/planning-artifacts/epics.md#Story-2.3]
- Story 4.1 (Paywall — must NOT break): [Source: _bmad-output/planning-artifacts/epics.md#Story-4.1]
- Story 7.2 definition: [Source: _bmad-output/planning-artifacts/epics.md#Story-7.2]
- Story 7.3 (pattern reference — auth fix + public zone, pricing): [Source: _bmad-output/implementation-artifacts/7-3-pricing-public-marketing-surface-redesign.md]
- Story 7.1 (pattern reference — auth fix + public zone, catalog): [Source: _bmad-output/implementation-artifacts/7-1-courses-public-catalog-premium-surface.md]
- Epic 7 objective: [Source: _bmad-output/planning-artifacts/epics.md#Epic-7]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4.6 (Bob — Scrum Master, Create Story workflow)

### Debug Log References

- `npx vitest run "src/app/(student)/courses/[slug]/page.test.tsx" "src/components/student/course-detail-client.test.tsx" "src/components/student/course-syllabus.test.tsx" "src/middleware.test.tsx" "src/components/shared/public-navbar.test.tsx"`
- `npm run lint`
- `npm run typecheck`
- `npx vitest run`
- `npx vitest run "src/app/(student)/courses/[slug]/page.test.tsx" "src/components/student/course-syllabus.test.ts" "src/components/student/course-detail-skeleton.test.ts"`

### Completion Notes List

Ultimate context engine analysis completed - comprehensive developer guide created

- Verified `/courses/[slug]` remained publicly accessible without adding any guest redirect, while lesson viewer protection still lives in `src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx` and middleware continues protecting only `/admin/*` + `/profile/*`.
- Rebuilt `project-e-course/src/app/(student)/courses/[slug]/page.tsx` into a persuasive public landing page with dark public-zone surface tokens, gradient display hero, contextual CTA logic, outcomes/trust framing, and repeated bottom CTA aligned to Stories 7.1 and 7.3.
- Updated `project-e-course/src/components/student/course-detail-hero.tsx` to surface prominent course metadata, gradient heading treatment, thumbnail/placeholder media block, and session/subscription-aware CTA hierarchy above the fold.
- Reworked `project-e-course/src/components/student/course-syllabus.tsx` into a structured accordion syllabus with lesson-type icons, visible premium lock states, inline unlock CTA, and preserved lesson links to `/courses/[slug]/lessons/[lessonId]`.
- Added `project-e-course/src/components/student/course-outcomes.tsx` for trust/value framing using approved dark cards and teal checkmark accents, and expanded the skeleton/loading path to mirror the new landing-page composition.
- Validation passed: `npm run lint`, `npm run typecheck`, `npx vitest run` (104 tests).

### File List

- `project-e-course/src/app/(student)/courses/[slug]/page.tsx`
- `project-e-course/src/app/(student)/courses/[slug]/page.test.tsx`
- `project-e-course/src/app/(student)/courses/[slug]/page.helpers.ts`
- `project-e-course/src/app/(student)/courses/[slug]/loading.tsx`
- `project-e-course/src/components/student/course-detail-hero.tsx`
- `project-e-course/src/components/student/course-syllabus.tsx`
- `project-e-course/src/components/student/course-syllabus.test.ts`
- `project-e-course/src/components/student/course-outcomes.tsx`
- `project-e-course/src/components/student/course-detail-skeleton.tsx`
- `project-e-course/src/components/student/course-detail-skeleton.test.ts`
- `_bmad-output/implementation-artifacts/7-2-courses-slug-persuasive-course-landing-page.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-03-11: Redesigned `/courses/[slug]` into a persuasive public landing page with premium public-zone styling, syllabus accordion + lock indicators, trust/outcomes section, repeated CTA, and regression-safe public/protected route behavior.
