# Story 8.1: Lesson Viewer Visual & Interaction Polish

Status: done

## Story

As a student,
I want the lesson viewer to feel polished, calm, and clearly structured,
so that I can stay focused on learning content while still receiving strong progress and navigation cues.

## Acceptance Criteria

1. **[Learning Zone Visual Treatment — App Zone, NOT Landing Zone]**
   Given I navigate to `/courses/[slug]/lessons/[lessonId]`
   When the lesson viewer renders on desktop or mobile
   Then the page uses learning-zone visual treatment based on the approved Hybrid Duality direction: Inter-led app typography with tight tracking, structured 1px bordered surfaces with dark tokens (`#0F0F14` bg, `#1A1A24` card, `#2A2A3C` border), indigo/violet active states, and 8px–12px border-radius
   And the page does NOT adopt landing/public gradient hero presentation, Playfair Display typography, large 24–40px border-radius, or any marketing surface treatment

2. **[Clear Page Hierarchy — Zero Confusion Navigation]**
   Given I am consuming a video or text lesson
   When I scan the page hierarchy
   Then breadcrumb, lesson title, lesson metadata (type badge, free/premium badge), main content area, sidebar navigation, and progress area appear in a clear visual order
   And the primary learning content (video/text) is visually dominant
   And the hierarchy supports the "Zero Confusion Navigation" principle so the student always knows their position in the course tree

3. **[Accessible Sticky Completion Actions]**
   Given I am on a long lesson or narrow viewport
   When I need to complete or continue the lesson
   Then the primary completion/navigation actions (`MarkCompleteButton`) remain easy to reach via sticky or persistently accessible placement consistent with the UX specification
   And all interactive elements maintain minimum 44×44px touch targets
   And visible focus states are present on all interactive elements

4. **[Skeleton Loaders — No Blank States or Generic Spinners]**
   Given lesson data is loading or route transitions occur between lessons
   When the UI has not finished rendering final content
   Then `LessonViewSkeleton` is shown instead of a generic spinner or blank state
   And the skeleton preserves the perception of instant navigation by mirroring the full lesson viewer layout structure (sidebar, breadcrumb area, title, content, sticky bar)

5. **[Mark as Complete Interaction — No Functional Regression]**
   Given I click `Mark as Complete` inside the polished lesson viewer
   When the action succeeds
   Then all existing completion interactions remain intact and visually coordinated with the refined layout:
   - Checkmark feedback on the button (✅ Completed state)
   - Sidebar lesson item updates to show completion indicator
   - Progress bar animates with glow effect when percentage increases
   - Toast notification ("Lesson marked as complete!") fires
   - `AutoNavCountdown` card renders for the next lesson (if applicable)
     And no regression is introduced in `MarkCompleteButton`, `CourseSidebarNav`, or `AutoNavCountdown` behavior

6. **[Architecture Compliance — Learning Zone Boundaries Preserved]**
   Given the lesson viewer is reviewed against architecture constraints
   When the story is implemented
   Then it preserves the existing learning-route architecture and entitlement model
   And the lesson experience stays inside the app/learning zone (NOT the public zone)
   And no dependency on public-zone-only decorative treatments is introduced

## Tasks / Subtasks

- [x] **Task 1: Audit current lesson viewer visual state** (AC: #1, #2)
  - [x] 1.1 Read `lesson-layout.tsx` and identify all Tailwind classes at the section/container level — note which tokens are using generic `bg-background`/`text-foreground` vs explicit dark-mode tokens
  - [x] 1.2 Read `page.tsx` lesson page and audit the sticky bottom bar classes (`bg-background/80 border-border`), breadcrumb, badge, and heading typography
  - [x] 1.3 Read `course-sidebar-nav.tsx` and audit sidebar container classes (`bg-background`, border colors, active state `border-primary bg-primary/10`)
  - [x] 1.4 Read `lesson-view-skeleton.tsx` and audit whether skeleton structure mirrors the full layout (sidebar, content, sticky bar)
  - [x] 1.5 Read `video-player-wrapper.tsx` and `text-lesson-content.tsx` for their wrapper border-radius and surface classes
  - [x] 1.6 Read `auto-nav-countdown.tsx` for card visual treatment
  - [x] 1.7 Document a before/after plan: which classes need to change and which must stay

- [x] **Task 2: Apply learning-zone dark surface tokens to `LessonLayout`** (AC: #1, #2)
  - [x] 2.1 Update `lesson-layout.tsx` outer `<section>` to use explicit learning-zone bg: `bg-[#0F0F14]` (dark) with dark mode defaulting on — the learning zone is intentionally dark per UX spec ("Fokus → Lesson view distraction-free: dark bg")
  - [x] 2.2 Apply `font-[family-name:var(--font-inter)] tracking-[-0.02em]` to the root layout wrapper to enforce Inter app typography (NOT Playfair Display)
  - [x] 2.3 Ensure the sidebar `<aside>` uses `border-[#2A2A3C]` (dark border token) and `bg-[#1A1A24]` (dark card token) on desktop
  - [x] 2.4 Verify `border-radius` on the sidebar `<aside>` is `rounded-xl` (12px) — within the 8–12px app-zone spec — NOT larger landing-page radius

- [x] **Task 3: Polish sticky bottom action bar** (AC: #3)
  - [x] 3.1 In `page.tsx`, update the sticky bottom bar (`sticky bottom-0`) to use explicit learning-zone tokens: `bg-[#0F0F14]/90 border-[#2A2A3C]` with `backdrop-blur-sm`
  - [x] 3.2 Confirm `MarkCompleteButton` minimum height is ≥ 44px (currently `min-h-11` = 44px ✅ — verify this is preserved)
  - [x] 3.3 Verify focus-visible states on `MarkCompleteButton` button element are present and use indigo/violet ring color consistent with `focus-visible:ring-indigo-500`
  - [x] 3.4 Confirm that on mobile/narrow viewports the sticky bar remains accessible and does not obscure primary content

- [x] **Task 4: Enhance `LessonViewSkeleton` to mirror full layout** (AC: #4)
  - [x] 4.1 Update `lesson-view-skeleton.tsx` to match the full lesson layout structure:
    - Sidebar skeleton with progress bar skeleton, chapter skeleton items
    - Breadcrumb skeleton (short horizontal bar)
    - Title/metadata skeleton (badges + heading)
    - Main content skeleton (video aspect-ratio block OR text content lines)
    - Sticky bottom bar skeleton (matching the real sticky bar height)
  - [x] 4.2 Apply dark-surface skeleton containers: outer section `bg-[#0F0F14]`, sidebar skeleton `bg-[#1A1A24]` with `border-[#2A2A3C]`
  - [x] 4.3 Ensure skeleton `Skeleton` components use the standard shadcn `Skeleton` from `~/components/ui/skeleton` — do NOT introduce new skeleton library

- [x] **Task 5: Polish content component surfaces** (AC: #1, #2)
  - [x] 5.1 Update `video-player-wrapper.tsx` wrapper border: change from `border-border/70` to `border-[#2A2A3C]` for explicit dark token alignment; confirm `bg-card` maps correctly in dark mode to `#1A1A24`
  - [x] 5.2 Update `text-lesson-content.tsx` article border: change from `border-border/70` to `border-[#2A2A3C]`; confirm `bg-card` is `#1A1A24` in dark mode; keep `rounded-2xl` (16px) — this is a content container not a landing-zone component, and 16px is acceptable for content surfaces
  - [x] 5.3 Update `auto-nav-countdown.tsx` Card to use `bg-[#1A1A24] border-[#2A2A3C]` for dark surface consistency
  - [x] 5.4 In `page.tsx`, polish lesson heading: confirm `h1` uses `text-3xl font-semibold tracking-tight` (already present) — no Playfair Display, no gradient text treatment

- [x] **Task 6: Polish `CourseSidebarNav` active state and progress area** (AC: #2, #5)
  - [x] 6.1 In `course-sidebar-nav.tsx`, update active lesson button state: change from `border-primary bg-primary/10` to `border-[#6366F1] bg-[#6366F1]/10` for explicit indigo active state per design system
  - [x] 6.2 Confirm progress bar `glow` animation uses `ring-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.5)]` (already present ✅) — no change needed
  - [x] 6.3 Confirm sidebar nav container (`nav`) uses `bg-[#1A1A24]` as bg in dark mode (currently `bg-background` — align to explicit token)
  - [x] 6.4 Ensure sidebar `border-r` uses `border-[#2A2A3C]` for dark mode consistency

- [x] **Task 7: Regression verification for all functional behaviors** (AC: #5, #6)
  - [x] 7.1 Verify `MarkCompleteButton` — click fires `markLessonComplete` server action, optimistic update works, toast fires, sidebar updates, progress glow triggers
  - [x] 7.2 Verify `AutoNavCountdown` — renders "Up next" card for non-quiz lessons with next lesson, renders "You've completed all lessons!" when at end, hidden for quiz lessons
  - [x] 7.3 Verify paywall overlay (`PaywallTeaserOverlay`) still renders correctly when `showPaywallOverlay = true`
  - [x] 7.4 Verify quiz lessons (`QuizEngine`) render correctly in place of video/text content
  - [x] 7.5 Verify breadcrumb renders: Courses → [Course Title] → [Chapter Title] → [Lesson Title]
  - [x] 7.6 Verify route auth protection: unauthenticated user is redirected (middleware + page-level `redirect`) — DO NOT touch this logic
  - [x] 7.7 Run full test suite: `npx vitest run` — zero regressions
  - [x] 7.8 Run linter: `npm run lint` — zero errors
  - [x] 7.9 Run type checker: `npm run typecheck` — zero errors

- [x] **Task 8: Update tests for polished components** (AC: #1–#6)
  - [x] 8.1 Update or add tests for `lesson-view-skeleton.tsx` if the skeleton structure changes materially — verify it renders the correct layout sections
  - [x] 8.2 If visual token classes on `lesson-layout.tsx` change, update any existing snapshot or class-assertion tests
  - [x] 8.3 Confirm existing tests for `mark-complete-button`, `course-sidebar-nav`, `auto-nav-countdown` continue to pass without modification (they must NOT be broken)

## Dev Notes

### 🎯 Story Purpose: Learning Zone Visual Polish — NOT Feature Addition

This story delivers **visual and interaction polish** to the lesson viewer. The functional behaviors established in Epics 3 and 4 (Mark Complete, paywall, auto-navigation, quiz engine) are **already working** and must **continue to work** after this story. The developer's job is:

1. Apply the correct **learning-zone visual tokens** (dark bg, dark card surface, 1px dark borders, indigo/violet accents, Inter typography)
2. Ensure **clear visual hierarchy** (breadcrumb → title → content → sticky action)
3. Ensure **skeleton loaders** mirror the full layout
4. Ensure **sticky completion actions** remain accessible with proper touch targets

**What this story is NOT:**

- Not a feature build — all functional behaviors already exist
- Not a public zone redesign — public zone is done (Epic 7)
- Not a quiz engine change — quiz is out of scope
- Not a navigation logic change — sidebar/routing already works

---

### 🎨 Design Zone: Learning/App Zone (NOT Public/Landing Zone)

The lesson viewer sits in the **learning/app zone**, which follows the **Hybrid Duality** design direction:

| Concept       | Public/Landing Zone (Epic 7)          | Learning/App Zone (Epic 8)                      |
| ------------- | ------------------------------------- | ----------------------------------------------- |
| Typography    | Playfair Display (hero), Inter (body) | **Inter only** (`--font-inter`, tight-tracking) |
| Background    | `#0F0F14` with gradient overlays      | **`#0F0F14`** solid, no gradient                |
| Cards         | Marketing surface treatment           | **`#1A1A24`** with `1px border #2A2A3C`         |
| Border Radius | 24–40px (organic/landing)             | **8–12px** (`rounded-xl` = 12px)                |
| Accents       | Coral/Purple/Teal gradient            | **Indigo `#6366F1`** / Violet `#8B5CF6`\*\*     |
| Shadows       | Box-shadow for marketing depth        | **Subtle shadow-sm or none**                    |

**Learning zone emotional goal:** Fokus, Calm, Accomplished — NOT Terpesona (that's for landing).

---

### 📂 Files to Modify (Primary Targets)

| File                                                                               | What Changes                                           |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx`    | Sticky bar tokens, breadcrumb visual, heading polish   |
| `project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/loading.tsx` | Already uses `LessonViewSkeleton` — may stay as-is     |
| `project-e-course/src/components/student/lesson-layout.tsx`                        | Outer section bg, container, sidebar styles            |
| `project-e-course/src/components/student/lesson-view-skeleton.tsx`                 | Skeleton structure to mirror full layout + dark tokens |
| `project-e-course/src/components/student/course-sidebar-nav.tsx`                   | Active state token, border token, bg token             |
| `project-e-course/src/components/student/video-player-wrapper.tsx`                 | Border token                                           |
| `project-e-course/src/components/student/text-lesson-content.tsx`                  | Border token                                           |
| `project-e-course/src/components/student/auto-nav-countdown.tsx`                   | Card surface token                                     |

### 📂 Files to Read But NOT Modify (Functional Context)

| File                                                                      | Why Read                                                          |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `project-e-course/src/components/student/mark-complete-button.tsx`        | Understand button visual states — only token-level polish allowed |
| `project-e-course/src/components/student/optimistic-progress-context.tsx` | DO NOT TOUCH — progress context logic                             |
| `project-e-course/src/server/actions/progress/mark-lesson-complete.ts`    | DO NOT TOUCH — server action                                      |
| `project-e-course/src/components/student/paywall-teaser-overlay.tsx`      | DO NOT TOUCH — paywall logic                                      |
| `project-e-course/src/components/student/quiz-engine.tsx`                 | DO NOT TOUCH — quiz engine                                        |

---

### 🏗️ Current State Analysis (Before Story 8.1)

**`lesson-layout.tsx`** — outer section:

```tsx
<section className="bg-background text-foreground min-h-[calc(100vh-3.5rem)]">
```

- Uses generic `bg-background` — this maps to white in light mode, but the learning zone should be explicitly dark.
- Missing: `font-[family-name:var(--font-inter)] tracking-[-0.02em]` Inter enforcement

**`page.tsx`** — sticky bar:

```tsx
<div className="bg-background/80 border-border sticky bottom-0 flex justify-end border-t py-4 backdrop-blur-sm">
```

- Uses generic `bg-background/80 border-border` — should use dark learning zone tokens

**`course-sidebar-nav.tsx`** — active lesson button:

```tsx
isActive ? 'border-primary bg-primary/10 shadow-sm' : 'hover:bg-accent/40 bg-background';
```

- `border-primary` and `bg-primary/10` are semantic tokens — could resolve correctly in dark mode if `--primary` maps to indigo. Verify and make explicit if needed.

**`lesson-view-skeleton.tsx`** — skeleton outer:

```tsx
<section className="bg-background text-foreground">
```

- Same generic token issue. Needs dark surface.
- Missing: sticky bar skeleton, more complete layout mirroring

**`video-player-wrapper.tsx`**:

```tsx
<div className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
```

- `border-border/70` → update to `border-[#2A2A3C]`; `bg-card` → verify resolves to `#1A1A24` in dark mode ✅

**`text-lesson-content.tsx`**:

```tsx
className = 'border-border/70 bg-card mx-auto w-full max-w-3xl rounded-2xl border...';
```

- Same border token issue. Note: `rounded-2xl` = 16px — this is a content surface, slightly above the 12px app spec but acceptable for reading surface.

---

### 🎯 Target State (After Story 8.1)

```
LessonLayout (<section>)
  ├── bg-[#0F0F14]                       ← Explicit dark learning zone bg
  ├── font-[family-name:var(--font-inter)] tracking-[-0.02em]  ← Inter-only
  ├── <aside> sticky sidebar
  │     ├── bg-[#1A1A24]                 ← Dark card surface
  │     ├── border-[#2A2A3C]             ← Dark border
  │     └── rounded-xl (12px)            ← App-zone radius
  └── <div> main content
        ├── Breadcrumb (clear, contextual)
        ├── Lesson title (h1, Inter, no gradient)
        ├── Metadata badges (type + free/premium)
        ├── Content (VideoPlayerWrapper | TextLessonContent | QuizEngine | PaywallOverlay)
        │     └── border-[#2A2A3C] bg-[#1A1A24] surfaces
        ├── Sticky bottom bar
        │     ├── bg-[#0F0F14]/90 border-[#2A2A3C] backdrop-blur-sm
        │     └── MarkCompleteButton (min-h-11, indigo accent, focus-visible ring)
        └── AutoNavCountdown Card
              └── bg-[#1A1A24] border-[#2A2A3C]
```

---

### ⚠️ Critical Design Constraints (MUST Follow)

1. **NO Playfair Display** in the learning zone — this is public zone only. The lesson viewer uses `Inter` exclusively.
2. **NO gradient hero or marketing composition** — the lesson viewer is app zone. Gradients are for `/`, `/courses`, `/courses/[slug]`, and `/pricing` only.
3. **NO large border-radius (24–40px)** for layout containers — app zone uses 8–12px. Content surfaces like the video wrapper can use up to 16px.
4. **Dark bg is intentional and always-dark** in the learning zone — unlike the public zone which toggles between `bg-white dark:bg-[#0F0F14]`, the lesson viewer is designed to be always dark per UX spec: "Fokus → Lesson view distraction-free: sidebar hidden, **dark bg**, centered content."
5. **DO NOT touch `--font-playfair-display`** anywhere in the lesson viewer path — if it appears, remove the reference.

---

### 🚨 Anti-Patterns to Avoid

- ❌ Do NOT change any Server Actions (`markLessonComplete`, `getCourseSidebarData`, etc.)
- ❌ Do NOT change entitlement logic (`shouldShowPaywallOverlay`, `getUserActiveSubscription`)
- ❌ Do NOT change auth redirect logic (`requireAuthenticatedUserId`, middleware)
- ❌ Do NOT change quiz engine (`QuizEngine`, `getQuizQuestions`)
- ❌ Do NOT add `"use client"` to server components
- ❌ Do NOT introduce `Playfair Display` or gradient backgrounds in the lesson viewer
- ❌ Do NOT change the `LessonLayout` component API (props remain: `courseSlug`, `chapters`, `activeLessonId`, `completedLessonIds`, `progressPercent`)
- ❌ Do NOT touch Admin routes (`/admin/*`) — out of scope
- ❌ Do NOT touch public zone routes (`/`, `/courses`, `/courses/[slug]`, `/pricing`) — Epic 7 complete
- ❌ Do NOT change the `OptimisticProgressContext` or `useOptimistic` logic
- ❌ Do NOT change the `revalidate` setting on any page

---

### 🧪 Test Strategy

This story is **visual polish with zero functional change**. Testing must verify:

1. **No regression in functional behaviors** — MarkComplete, paywall, quiz, sidebar navigation all work exactly as before
2. **Token alignment** — dark bg, dark card surfaces, indigo active states render correctly
3. **Skeleton coverage** — skeleton mirrors the full layout (sidebar + content + sticky bar)
4. **Touch targets** — MarkCompleteButton ≥ 44px min-height preserved
5. **Focus states** — keyboard navigation still shows visible focus rings

**Recommended test targets:**

```bash
# Full suite — must all pass, zero regressions
npx vitest run

# Specific targets if changed:
npx vitest run "src/components/student/lesson-view-skeleton.test"
npx vitest run "src/components/student/lesson-layout.test"
npx vitest run "src/components/student/mark-complete-button.test"
npx vitest run "src/components/student/course-sidebar-nav.test"
npx vitest run "src/components/student/auto-nav-countdown.test"

# Lint + types
npm run lint
npm run typecheck
```

---

### 🔗 Previous Story Intelligence (Epic 7 → Epic 8 Boundary)

**Story 7.4** (last completed) established that:

- Public zone dark surface is `bg-white dark:bg-[#0F0F14]` (toggles with dark mode) via `PublicNavbarShell`
- Learning zone does NOT use `PublicNavbarShell` — it has its own `LessonLayout`
- The lesson viewer route is **explicitly excluded** from Epic 7's public zone scope: "DO NOT TOUCH `/courses/[slug]/[lessonId]` lesson viewer"

**This story begins Epic 8** by applying the same design token discipline (explicit dark tokens, Inter typography, 1px borders) to the learning zone — but **without** the public zone's gradient/editorial treatment.

**Key architecture boundary:**

```
/courses/[slug]                    → Public zone (Epic 7 - done)
/courses/[slug]/lessons/[lessonId] → Learning zone (Epic 8 - this story)
```

---

### 📋 Out-of-Scope (DO NOT TOUCH)

The following are explicitly out of scope and must not be modified:

- Admin routes (`/admin/*`) — Epic 5 complete, no changes
- Public zone routes — Epic 7 complete, no changes
- Payment / Midtrans checkout logic — Epic 4 complete
- Entitlement model / paywall logic / auth protection behavior — must work exactly as before
- Quiz flow (FR13/FR14) — not in Epic 8.1 scope
- `LessonLayout` component API (props interface) — no changes
- `OptimisticProgressContext` — no changes
- Any Server Actions, DB queries, or server-side data fetching logic

---

### References

- Epic 8 definition: [Source: `_bmad-output/planning-artifacts/epics.md#Epic-8`]
- Story 8.1 definition: [Source: `_bmad-output/planning-artifacts/epics.md#Story-8.1`]
- Change proposal (Epic 8 rationale): [Source: `_bmad-output/planning-artifacts/change-proposal-learning-zone-epic-8.md`]
- UX spec — Design Direction (Hybrid Duality): [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Design-Direction-Decision`]
- UX spec — Color System (dark tokens): [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Color-System`]
- UX spec — Typography System (Inter app zone): [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Typography-System`]
- UX spec — Spacing & Layout (border-radius 8–12px app zone): [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Spacing-Layout-Foundation`]
- UX spec — Experience Principle #4 (App is a Tool, Landing is a Stage): [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Experience-Principles`]
- UX spec — Micro-Emotions (Focus → dark bg, distraction-free): [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Micro-Emotions-Design-Implications`]
- Architecture route protection: [Source: `_bmad-output/planning-artifacts/architecture.md`]
- Previous story (Epic 7 public zone complete): [Source: `_bmad-output/implementation-artifacts/7-4-shared-public-zone-layout-consistency.md`]

## Definition of Done

- [ ] Lesson viewer on desktop and mobile renders with explicit dark learning-zone tokens: `bg-[#0F0F14]` page, `bg-[#1A1A24]` cards, `border-[#2A2A3C]` borders
- [ ] Inter font with tight tracking (`-0.02em`) applied to the lesson viewer layout — NO Playfair Display references
- [ ] No gradient hero, no marketing-surface treatment, no landing-zone patterns in the lesson viewer
- [ ] Clear visual hierarchy: breadcrumb → lesson title → metadata badges → content → sticky action bar
- [ ] Sticky bottom action bar (MarkCompleteButton) uses learning-zone tokens and remains accessible on all viewports
- [ ] All interactive elements have minimum 44×44px touch targets and visible focus states
- [ ] `LessonViewSkeleton` mirrors the full layout structure (sidebar, breadcrumb, title, content, sticky bar) with dark surface tokens
- [ ] `MarkCompleteButton` click behavior, optimistic update, toast, sidebar sync, and progress glow all work without regression
- [ ] `AutoNavCountdown` renders correctly for next-lesson and end-of-course cases
- [ ] Paywall overlay, quiz engine, and auth redirect logic are unaffected
- [ ] `npm run lint` passes with zero errors
- [ ] `npm run typecheck` passes with zero errors
- [ ] `npx vitest run` passes with zero regressions (same or greater test count as post-Epic-7)

## Dev Agent Record

### Agent Model Used

cliproxy/gpt-5.4 (Amelia — Developer Agent)

### Debug Log References

- `npx vitest run src/components/student/lesson-view-skeleton.test.tsx src/components/student/course-sidebar-nav.test.tsx`
- `node --test src/components/student/mark-complete-button.test.ts src/components/student/video-player-wrapper.test.ts src/components/student/lesson-view-skeleton.test.ts`
- `npx vitest run`
- `npm run lint`
- `npm run typecheck`

### Completion Notes List

- Audited the lesson viewer route and mapped generic semantic Tailwind tokens to explicit learning-zone dark tokens before implementation.
- Updated `LessonLayout`, lesson page hierarchy, and sticky completion bar to use explicit learning-zone surfaces (`#0F0F14`, `#1A1A24`, `#2A2A3C`) with Inter-only typography and indigo focus/active treatment.
- Refined `CourseSidebarNav`, `VideoPlayerWrapper`, `TextLessonContent`, and `AutoNavCountdown` so existing learning flows keep their behavior while matching the app-zone visual system.
- Rebuilt `LessonViewSkeleton` to mirror the real viewer structure: mobile sidebar trigger, desktop sidebar, breadcrumb/meta block, content surfaces, and sticky action bar placeholder.
- Updated regression assertions for polished classes and confirmed `npx vitest run`, `npm run lint`, and `npm run typecheck` all pass.

### File List

- `project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx`
- `project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/page.integration.test.tsx`
- `project-e-course/src/components/student/lesson-layout.tsx`
- `project-e-course/src/components/student/lesson-view-skeleton.tsx`
- `project-e-course/src/components/student/lesson-view-skeleton.test.ts`
- `project-e-course/src/components/student/course-sidebar-nav.tsx`
- `project-e-course/src/components/student/course-sidebar-nav.test.tsx`
- `project-e-course/src/components/student/video-player-wrapper.tsx`
- `project-e-course/src/components/student/video-player-wrapper.test.ts`
- `project-e-course/src/components/student/text-lesson-content.tsx`
- `project-e-course/src/components/student/auto-nav-countdown.tsx`
- `project-e-course/src/components/student/mark-complete-button.tsx`
- `project-e-course/src/components/student/mark-complete-button.test.ts`

## Change Log

- 2026-03-11: Story file created. Status set to `ready-for-dev`. Begins Epic 8: Learning Zone UX Polish with visual and interaction refinement for the lesson viewer route `/courses/[slug]/lessons/[lessonId]`.
- 2026-03-11: Implemented Story 8.1 learning-zone polish. Applied explicit dark app-zone tokens and Inter typography to the lesson viewer, mirrored the full layout in `LessonViewSkeleton`, refined sticky completion and sidebar states, and updated regression tests for the new visual contract. Story status moved to `review`.
