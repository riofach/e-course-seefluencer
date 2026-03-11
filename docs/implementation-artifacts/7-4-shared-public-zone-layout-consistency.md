# Story 7.4: Shared Public Zone Layout Consistency

Status: done

## Story

As a developer,
I want a consistent shared layout wrapper for all public marketing pages,
So that `/`, `/courses`, `/courses/[slug]`, and `/pricing` share the same navbar, base tokens, and layout conventions without duplication.

## Acceptance Criteria

1. **[Shared Navbar Composition — No Duplication]**
   Given the public-facing routes are reviewed together
   When the navbar rendering path is traced for `/`, `/courses`, `/courses/[slug]`, and `/pricing`
   Then the `PublicNavbar` component (or its shell wrapper) is the single canonical composition point for the public navbar across all four routes
   And the navbar is NOT instantiated more than once per page render
   And there is no duplication of navbar code between route groups or individual pages

2. **[Dark Background Token — Centrally Applied]**
   Given the four public routes share a common visual foundation
   When the dark background token is applied
   Then `bg-[#0F0F14]` (or the equivalent CSS variable `var(--color-bg-dark)`) is applied in a single shared composition layer rather than duplicated in each page's root `<div>`
   And removing it from an individual page does NOT break the layout — it is inherited from the shared shell

3. **[Font Variables — Consistently Available on All Public Routes]**
   Given the public zone uses Playfair Display for display headings and Inter for body
   When any public route renders
   Then both `--font-inter` and `--font-playfair-display` CSS variables are in scope for all four public routes
   And the font variables do NOT need to be re-declared on individual page files (they are injected once at the shared layout level)

4. **[Session-Aware Navbar State — Consistent Across All Public Routes]**
   Given both signed-in and signed-out states are possible on any public route
   When I visit `/`, `/courses`, `/courses/[slug]`, or `/pricing` in either auth state
   Then the signed-in user's name appears in the navbar when a session exists
   And auth CTAs (Login / Get Started) appear when no session exists
   And this behavior is identical across all four routes — no route shows a stale or different auth state

5. **[No Functional Regression — Epic 1–6 Capabilities]**
   Given the public zone layout refactor is applied
   When I verify all previously working features
   Then the Midtrans checkout flow on `/pricing` continues to work for authenticated users (Story 4.3 / Story 7.3)
   And the lesson viewer at `/courses/[slug]/[lessonId]` remains session-protected (Story 3.1 / Story 7.1)
   And the paywall overlay on premium lessons is unaffected (Story 4.1)
   And admin routes (`/admin/*`) remain middleware-protected (Story 5.1)
   And the ISR/caching strategy on `/courses` is preserved (Architecture requirement)
   And all existing Vitest unit tests continue to pass with no regressions

## Tasks / Subtasks

- [x] **Task 1: Audit current public zone layout state** (AC: #1, #2, #3)
  - [x] 1.1 Map exactly how the navbar is composed for each of the four public routes today:
    - `/` → `page.tsx` wraps directly in `<PublicNavbarShell>` (inline in page)
    - `/courses` → `(student)/courses/layout.tsx` wraps in `<PublicNavbarShell>` (route-group layout)
    - `/courses/[slug]` → `(student)/courses/layout.tsx` inherits the same `CoursesLayout` → `PublicNavbarShell` (no per-page wrapper needed)
    - `/pricing` → `(student)/pricing/layout.tsx` wraps in `<PublicNavbarShell>` (route-group layout)
  - [x] 1.2 Identify the inconsistency: `/` inlines `PublicNavbarShell` inside its page body, while `/courses` and `/pricing` delegate to route-group `layout.tsx` files — this is the architectural divergence to address
  - [x] 1.3 Audit where `bg-[#0F0F14]` is applied per-page vs in a shared wrapper:
    - In `courses/page.tsx`: dark bg is applied on the root `<div className="bg-[#0F0F14] ...">` inline
    - In `pricing/page.tsx` (via `PricingPageClient`): check if dark bg is on the component root or inherited
    - In `page.tsx` (landing): dark bg applied via `dark:bg-[#0F0F14]` on the content div inside `PublicNavbarShell`
    - In `courses/[slug]/page.tsx`: check for dark bg on the page root
  - [x] 1.4 Audit font variable injection:
    - `page.tsx` (landing): declares `const inter = Inter(...)` and `const playfairDisplay = Playfair_Display(...)` **locally** and applies their `.variable` props to the root div — these are NOT in the root `app/layout.tsx`
    - Check if `/courses/page.tsx`, `/courses/[slug]/page.tsx`, and `/pricing/page.tsx` also declare fonts locally or inherit them from a higher layout
    - If per-page declarations exist in multiple places → consolidation target
  - [x] 1.5 Document a before/after comparison of where each concern (navbar, bg, fonts) currently lives vs where they will live after the story

- [x] **Task 2: Promote `PublicNavbarShell` to a true shared public layout** (AC: #1, #2, #3)
  - [x] 2.1 Enhance `PublicNavbarShell` (`project-e-course/src/components/shared/public-navbar-shell.tsx`) to be the canonical public zone layout wrapper:
    - Add the dark background token: `bg-[#0F0F14]` on the outer wrapper (in addition to or replacing the existing `flex min-h-screen flex-col` wrapper)
    - Add the font variable class injection for `--font-inter` and `--font-playfair-display` so they are available to all children
    - Keep the existing `PublicNavbar` composition at the top
    - Keep the `flex-1` content area for children
  - [x] 2.2 The updated `PublicNavbarShell` should look roughly like:
    ```tsx
    export function PublicNavbarShell({ children }: PublicNavbarShellProps) {
    	return (
    		<div
    			className={`${inter.variable} ${playfairDisplay.variable} flex min-h-screen flex-col bg-[#0F0F14] font-[family-name:var(--font-inter)] tracking-[-0.02em] text-white`}
    		>
    			<PublicNavbar />
    			<div className="flex-1">{children}</div>
    		</div>
    	);
    }
    ```
  - [x] 2.3 Move the Google Font imports (`Inter`, `Playfair_Display` from `next/font/google`) from `page.tsx` (landing) into `PublicNavbarShell` — the fonts should be declared once in the shell, not repeated on individual pages
  - [x] 2.4 Ensure the font variable declarations use `next/font/google` correctly: `Inter({ subsets: ["latin"], variable: "--font-inter" })` and `Playfair_Display({ subsets: ["latin"], weight: ["700", "900"], variable: "--font-playfair-display" })` — match the exact config from the landing page

- [x] **Task 3: Update individual pages to remove redundant dark bg / font declarations** (AC: #2, #3)
  - [x] 3.1 Update `project-e-course/src/app/page.tsx` (landing page):
    - Remove the local `Inter` and `Playfair_Display` font instantiation and their `.variable` class applications (now inherited from `PublicNavbarShell`)
    - Remove the redundant `bg-[#0F0F14]` class from the inner div (now applied by `PublicNavbarShell`)
    - Keep all content sections, motion components, and marketing sections intact — only remove the font/bg duplication
    - The `PublicNavbarShell` wrapper call itself stays on this page (it wraps the landing content)
  - [x] 3.2 Update `project-e-course/src/app/(student)/courses/page.tsx`:
    - Remove `bg-[#0F0F14]` and the `font-[family-name:var(--font-inter)] tracking-[-0.02em]` classes from the root `<div>` (now inherited from the layout shell)
    - The `text-white` class may remain or be inherited — verify rendering is consistent
    - Preserve all hero content, search input, course grid, and skeleton structure
  - [x] 3.3 Update `project-e-course/src/app/(student)/courses/[slug]/page.tsx`:
    - Check if a dark bg wrapper exists at the page root — if so, remove it (inherited from `CoursesLayout` → `PublicNavbarShell`)
    - Preserve all hero, syllabus, outcomes, and CTA sections
  - [x] 3.4 Update `project-e-course/src/components/student/pricing-page-client.tsx` (or `pricing/page.tsx`):
    - Remove `bg-[#0F0F14]` from the outermost wrapper if present (now inherited from `PricingLayout` → `PublicNavbarShell`)
    - Preserve all plan cards, trust section, and checkout CTA logic intact

- [x] **Task 4: Consolidate route-group layouts for public routes** (AC: #1, #4)
  - [x] 4.1 Verify the current state of route-group layouts:
    - `(student)/courses/layout.tsx` → already uses `PublicNavbarShell` ✅
    - `(student)/pricing/layout.tsx` → already uses `PublicNavbarShell` ✅
    - `page.tsx` (landing `/`) → uses `PublicNavbarShell` inline in the page (inconsistency)
  - [x] 4.2 Evaluate whether `/` landing page benefits from a parent layout with `PublicNavbarShell` — the cleanest approach is:
    - **Option A (Preferred):** Keep the `PublicNavbarShell` call in `page.tsx` for `/` since it lives outside all route groups. Now that the shell also applies fonts and bg, this is architecturally clean and there is no real duplication.
    - **Option B (Structural change):** Create an `(public)` route group that wraps `/`, `/courses`, and `/pricing` together with a single layout. This is a larger structural change and more risky for regression. **Use Option A unless there is a clear compelling reason.**
  - [x] 4.3 The `/courses/[slug]` route already inherits `CoursesLayout` → `PublicNavbarShell` via the parent `(student)/courses/layout.tsx`. Verify this: `/courses/[slug]` pages do NOT instantiate `PublicNavbar` or `PublicNavbarShell` again.
  - [x] 4.4 Confirm that `(student)/layout.tsx` remains a passthrough (`return <>{children}</>`) — it should NOT add any visual wrapping since each sub-route has its own specific layout

- [x] **Task 5: Verify dark/light mode consistency** (AC: #2, #4)
  - [x] 5.1 Confirm that the dark bg token application in `PublicNavbarShell` is compatible with next-themes dark mode toggle:
    - The public zone is intentionally always dark (`bg-[#0F0F14]`) regardless of system/user theme preference — this is by design per UX spec ("public zone dark surface")
    - The landing page currently uses `dark:bg-[#0F0F14]` (conditional on dark mode class) — after moving bg to `PublicNavbarShell`, decide: should it be always-dark or only-in-dark-mode?
    - **Recommended decision:** Match the current landing page behavior — the public zone adapts to the global dark mode theme. Use `bg-white dark:bg-[#0F0F14]` on the shell wrapper so light-mode visitors don't get a forced dark background. This preserves parity with the landing page.
  - [x] 5.2 Confirm text color: use `text-slate-900 dark:text-white` on the shell wrapper (matching current landing page pattern) so body text is readable in both modes
  - [x] 5.3 Smoke test: toggle dark/light mode on all four public routes and confirm no background "flash" or mismatch between navbar bg and page bg

- [x] **Task 6: Regression testing and final verification** (AC: #5)
  - [x] 6.1 Run full Vitest suite: `npx vitest run` — all tests must pass (target: same count as after Story 7.2, currently 104 tests)
  - [x] 6.2 Run linter: `npm run lint` — zero errors
  - [x] 6.3 Run type checker: `npm run typecheck` — zero errors
  - [x] 6.4 Manual smoke tests (incognito + logged-in):
    - `/` → renders with navbar, correct dark bg, Playfair Display heading visible
    - `/courses` → renders with navbar, correct dark bg, catalog visible without auth
    - `/courses/some-slug` → renders with navbar, correct dark bg, course detail visible without auth
    - `/pricing` → renders with navbar, correct dark bg, plan cards visible without auth
    - `/courses/some-slug/some-lesson-id` → still requires auth (lesson viewer protected)
    - `/admin` → still requires auth + admin role
  - [x] 6.5 Confirm ISR/caching on `/courses` is preserved: `revalidate = 300` must still be in `courses/page.tsx`
  - [x] 6.6 Confirm Midtrans checkout still works for authenticated users on `/pricing`
  - [x] 6.7 Confirm paywall overlay still activates for non-subscribers on premium lessons

## Dev Notes

### 🎯 Story Purpose: DRY Consolidation — Not Feature Addition

This story is a **structural DRY refactor**, not a new feature. The three previous stories (7.1, 7.2, 7.3) delivered the public zone visual patterns working correctly on each individual route. Story 7.4 now **consolidates** the shared patterns into a single authoritative source rather than leaving them duplicated across four pages.

**What was duplicated across Stories 7.1–7.3:**

- `bg-[#0F0F14]` dark background applied per-page in each route's root div
- `font-[family-name:var(--font-inter)] tracking-[-0.02em]` applied per-page
- Font variable injection (`--font-inter`, `--font-playfair-display`) possibly declared per-page
- `PublicNavbar` / `PublicNavbarShell` composition repeated in page-level or layout-level wrappers

**Target state after Story 7.4:**

- All of the above live in ONE place: `PublicNavbarShell`
- Individual pages render clean content without worrying about fonts, bg color, or navbar

---

### 🏗️ Current Architecture Map (Before Story 7.4)

```
Route: /
  └── page.tsx
        ├── declares: Inter({ variable: "--font-inter" })         ← FONT HERE
        ├── declares: Playfair_Display({ variable: "--font-playfair-display" })  ← FONT HERE
        └── <PublicNavbarShell>          ← NAVBAR SHELL HERE (inline in page)
              └── <div className="...bg-white dark:bg-[#0F0F14] font-[--font-inter]...">  ← BG + FONT CLASS HERE
                    └── [landing content]

Route: /courses
  └── (student)/courses/layout.tsx
        └── <PublicNavbarShell>          ← NAVBAR SHELL HERE (in layout)
              └── courses/page.tsx
                    └── <div className="bg-[#0F0F14] font-[--font-inter]...">  ← BG + FONT CLASS AGAIN
                          └── [catalog content]

Route: /courses/[slug]
  └── (student)/courses/layout.tsx      ← NAVBAR SHELL VIA PARENT LAYOUT
        └── (student)/courses/[slug]/page.tsx
              └── [course detail content]     ← CHECK IF BG/FONT APPLIED HERE TOO

Route: /pricing
  └── (student)/pricing/layout.tsx
        └── <PublicNavbarShell>          ← NAVBAR SHELL HERE (in layout)
              └── pricing/page.tsx
                    └── PricingPageClient
                          └── <div className="...bg-[#0F0F14]...">  ← BG AGAIN?
```

---

### 🎯 Target Architecture (After Story 7.4)

```
PublicNavbarShell (canonical shell — ALL public routes use this)
  ├── Applies: --font-inter, --font-playfair-display variables  ← ONCE
  ├── Applies: bg-white dark:bg-[#0F0F14] text-slate-900 dark:text-white  ← ONCE
  ├── Renders: <PublicNavbar /> (session-aware, server component)  ← ONCE
  └── Renders: {children}

Route: /
  └── page.tsx → <PublicNavbarShell>[landing sections]</PublicNavbarShell>
        (no local font declarations, no local bg class)

Route: /courses
  └── layout.tsx → <PublicNavbarShell>[children]</PublicNavbarShell>
        └── page.tsx → [catalog content, no bg/font declarations]

Route: /courses/[slug]
  └── (inherits courses/layout.tsx) → [course detail, no bg/font declarations]

Route: /pricing
  └── layout.tsx → <PublicNavbarShell>[children]</PublicNavbarShell>
        └── page.tsx → PricingPageClient → [plan cards, no bg/font declarations]
```

---

### 📂 Key Files to Read Before Coding

**Core files to understand current state:**

| File                                                               | Relevance                                                        |
| ------------------------------------------------------------------ | ---------------------------------------------------------------- |
| `project-e-course/src/components/shared/public-navbar-shell.tsx`   | The shell to enhance — currently only adds navbar + flex wrapper |
| `project-e-course/src/components/shared/public-navbar.tsx`         | Session-fetching server component — do NOT change                |
| `project-e-course/src/components/shared/public-navbar-content.tsx` | Client content rendering — do NOT change                         |
| `project-e-course/src/app/page.tsx`                                | Landing page — has font declarations to MOVE                     |
| `project-e-course/src/app/(student)/courses/page.tsx`              | Catalog page — has bg/font classes to REMOVE                     |
| `project-e-course/src/app/(student)/courses/[slug]/page.tsx`       | Course detail — check for bg/font duplication                    |
| `project-e-course/src/app/(student)/pricing/page.tsx`              | Pricing page — check bg inheritance path                         |
| `project-e-course/src/components/student/pricing-page-client.tsx`  | Pricing client — check for bg/font classes                       |
| `project-e-course/src/app/(student)/courses/layout.tsx`            | Courses route layout — already uses shell                        |
| `project-e-course/src/app/(student)/pricing/layout.tsx`            | Pricing route layout — already uses shell                        |
| `project-e-course/src/app/(student)/layout.tsx`                    | Student route layout — should be a passthrough                   |

---

### 🔧 Implementation: Updating `PublicNavbarShell`

The current `PublicNavbarShell` (`src/components/shared/public-navbar-shell.tsx`) is:

```tsx
export function PublicNavbarShell({ children }: PublicNavbarShellProps) {
	return (
		<div className="flex min-h-screen flex-col">
			<PublicNavbar />
			<div className="flex-1">{children}</div>
		</div>
	);
}
```

After this story it should look approximately like:

```tsx
import { Inter, Playfair_Display } from 'next/font/google';
import type { ReactNode } from 'react';
import { PublicNavbar } from '~/components/shared/public-navbar';

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
});

const playfairDisplay = Playfair_Display({
	subsets: ['latin'],
	weight: ['700', '900'],
	variable: '--font-playfair-display',
});

type PublicNavbarShellProps = {
	children: ReactNode;
};

export function PublicNavbarShell({ children }: PublicNavbarShellProps) {
	return (
		<div
			className={`${inter.variable} ${playfairDisplay.variable} flex min-h-screen flex-col bg-white font-[family-name:var(--font-inter)] tracking-[-0.02em] text-slate-900 dark:bg-[#0F0F14] dark:text-white`}
		>
			<PublicNavbar />
			<div className="flex-1">{children}</div>
		</div>
	);
}
```

**Key design decisions baked in:**

- `bg-white dark:bg-[#0F0F14]` — respects global dark mode toggle (consistent with landing page existing behavior)
- `text-slate-900 dark:text-white` — readable in both modes
- `font-[family-name:var(--font-inter)] tracking-[-0.02em]` — sets Inter as the default public zone body font
- `--font-playfair-display` CSS variable in scope so any `font-[family-name:var(--font-playfair-display)]` usage in children just works

> ⚠️ **CRITICAL — `next/font` module-level singleton rule:** `next/font/google` font instances must be declared at the **module level** (top of the file, outside any function/component). Never declare them inside a render function or component body. The `inter` and `playfairDisplay` constants at the top of `public-navbar-shell.tsx` satisfy this requirement.

---

### 🔧 Updating `page.tsx` (Landing)

After moving font declarations to `PublicNavbarShell`, the landing page removes:

```tsx
// REMOVE these from page.tsx:
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfairDisplay = Playfair_Display({
	subsets: ['latin'],
	weight: ['700', '900'],
	variable: '--font-playfair-display',
});
```

And on the root div inside `PublicNavbarShell`, remove the font variable class application:

```tsx
// BEFORE (in page.tsx):
<div className={`${inter.variable} ${playfairDisplay.variable} min-h-screen bg-white font-[family-name:var(--font-inter)] ...`}>

// AFTER (in page.tsx — font vars and bg now come from PublicNavbarShell):
<div className="min-h-screen ...">
  {/* or just remove this wrapper div entirely and let PublicNavbarShell's flex-1 div be the container */}
```

The `metadata` export stays in `page.tsx` — do NOT move it.

---

### 🔧 Updating Individual Route Pages

For each public route page where `bg-[#0F0F14]` or font classes exist at the root div:

**Before (example from `courses/page.tsx`):**

```tsx
<div className="bg-[#0F0F14] font-[family-name:var(--font-inter)] tracking-[-0.02em] text-white">
	{/* content */}
</div>
```

**After (bg and font now come from `PublicNavbarShell` via layout):**

```tsx
<div>{/* content — bg and font inherited from shell */}</div>
```

Keep all content-level classes (padding, margin, max-width, grid layouts, section backgrounds like `bg-[#1A1A24]` on cards, etc.) — only remove the **root-level background and font** classes.

> ⚠️ **Do NOT remove `bg-[#1A1A24]` from cards, `bg-white/5` from pills, or any section-specific bg overrides.** Only the root page-level `bg-[#0F0F14]` is being removed in favour of the shell.

---

### 📐 `next/font` in Server Components

`PublicNavbarShell` is a **Server Component** (no `"use client"` directive). `next/font/google` works in Server Components with no issues. Font objects declared at module level are singleton-safe in Next.js App Router — Next.js deduplicates font loading automatically even if the same font config appears in multiple places during migration.

> ⚠️ **After migration:** Once font declarations are moved to `PublicNavbarShell`, remove them from `page.tsx` (landing) to avoid double-loading. Next.js deduplicates by config hash, so duplicate configs won't cause broken fonts, but they will generate redundant `<link>` preload tags that waste waterfall budget.

---

### ⚠️ Dark Mode Compatibility

The `PublicNavbarShell` will use `bg-white dark:bg-[#0F0F14]`. This means:

- In **light mode** → white background (matching current landing page light-mode behavior)
- In **dark mode** → `#0F0F14` dark background (matching all three stories' dark public surface)

**Do NOT make it unconditionally `bg-[#0F0F14]`** — this would break the light-mode experience for users who prefer light mode. The landing page intentionally supports both modes (it uses `dark:bg-[#0F0F14]`), and the other public routes should match.

However, if the current `courses/page.tsx` has an **unconditional** `bg-[#0F0F14]` (without the `dark:` prefix), then those pages were forcing dark bg in all modes. This is an inconsistency to address — align them all to `bg-white dark:bg-[#0F0F14]` via the shell.

**Verify in browser** that dark/light mode switch works correctly across all four public routes after this change.

---

### ⚠️ `text-white` vs `dark:text-white`

Currently some pages use `text-white` unconditionally (always white text, regardless of mode). After this story, the shell will provide `text-slate-900 dark:text-white`. Individual component text colors can override the shell as needed — this is Tailwind's cascade working correctly. Just ensure no child component has `text-white` hardcoded that would look bad on a light background.

If all existing content uses conditional `dark:text-white` or relies on the page-level unconditional `text-white`, audit and adjust as needed. The goal is that the shell provides a **sensible default** that works in both modes.

---

### 🚨 Anti-Patterns to Avoid

- ❌ Do NOT change the `PublicNavbar` component itself — only `PublicNavbarShell` wraps it
- ❌ Do NOT change `PublicNavbarContent` or `PublicMobileMenu` — navbar UI is already correct
- ❌ Do NOT add `"use client"` to `PublicNavbarShell` — it must remain a Server Component
- ❌ Do NOT declare `next/font` inside a component body — only at module level
- ❌ Do NOT remove `revalidate = 300` from `courses/page.tsx` — ISR caching is an architecture hard requirement
- ❌ Do NOT touch `/courses/[slug]/[lessonId]` lesson viewer — lesson viewer must remain session-protected
- ❌ Do NOT touch `/admin/*` routes — admin area is intentionally NOT part of the public zone
- ❌ Do NOT touch any Server Actions, DB queries, or payment logic — this story is layout/composition only
- ❌ Do NOT remove section-level `bg-[#1A1A24]` card backgrounds — only remove root page-level bg duplication
- ❌ Do NOT create a new navbar — `PublicNavbar` and `PublicNavbarContent` are the canonical components

---

### 🧪 Test Strategy

This story is a **structural refactor with visual parity** target. Testing should verify:

1. **No regression in rendered output** — the pages must look identical before and after
2. **Font loading** — Playfair Display headings render correctly on all four routes
3. **Dark bg** — All four routes show `#0F0F14` in dark mode
4. **Navbar** — Signed-in and signed-out states correct across all routes
5. **Route protection** — Lesson viewer still protected, admin still protected

**Recommended Vitest targets to add/update:**

- `project-e-course/src/components/shared/public-navbar-shell.test.tsx` — verify shell renders navbar + children; verify font variable classNames are applied; verify bg classes present
- Update `project-e-course/src/components/shared/public-navbar.test.tsx` — ensure existing tests still pass
- `project-e-course/src/app/page.test.tsx` (if exists) — landing page should still render correctly after font decl removal
- Run: `npx vitest run`

**Existing test coverage from previous stories:**

- Story 7.1: `npx vitest run "src/middleware.test.tsx" "src/app/(student)/courses/page.test.tsx" "src/components/student/course-catalog.test.tsx" "src/components/student/course-search-input.test.tsx" "src/components/student/course-catalog-skeleton.test.tsx"`
- Story 7.2: `npx vitest run "src/app/(student)/courses/[slug]/page.test.tsx" "src/components/student/course-syllabus.test.ts" "src/components/student/course-detail-skeleton.test.ts"`
- Story 7.3: `npx vitest run "src/middleware.test.tsx" "src/components/student/pricing-page-client.test.tsx" "src/app/(student)/pricing/page.test.tsx" "src/components/shared/public-navbar.test.tsx"`

All of the above must pass **unchanged** after this story's changes.

---

### 📋 Existing `PublicNavbarShell` Usage Map

After Story 7.3 these files import and use `PublicNavbarShell`:

| File                                   | Usage                                |
| -------------------------------------- | ------------------------------------ |
| `src/app/page.tsx`                     | Wraps entire landing page content    |
| `src/app/(student)/courses/layout.tsx` | Route group layout for `/courses/**` |
| `src/app/(student)/pricing/layout.tsx` | Route group layout for `/pricing`    |

This means `/courses/[slug]` automatically inherits the shell via `courses/layout.tsx` — no additional wrapping needed for course detail pages.

---

### 🔗 Route Group Structure Reference

```
src/app/
├── page.tsx                            ← Landing (/) — uses PublicNavbarShell inline
├── (auth)/
│   ├── login/page.tsx                  ← NOT a public zone page
│   └── register/page.tsx              ← NOT a public zone page
├── (student)/
│   ├── layout.tsx                      ← PASSTHROUGH — must remain empty
│   ├── courses/
│   │   ├── layout.tsx                  ← Uses PublicNavbarShell ← KEEP AS IS
│   │   ├── page.tsx                    ← Remove root bg/font classes
│   │   └── [slug]/
│   │       ├── page.tsx               ← Remove root bg/font classes if any
│   │       └── lessons/
│   │           └── [lessonId]/
│   │               └── page.tsx       ← DO NOT TOUCH (protected lesson viewer)
│   └── pricing/
│       ├── layout.tsx                  ← Uses PublicNavbarShell ← KEEP AS IS
│       └── page.tsx                    ← Remove root bg/font classes
└── (admin)/
    └── admin/                         ← DO NOT TOUCH
```

---

### References

- Epic 7 objective: [Source: `_bmad-output/planning-artifacts/epics.md#Epic-7`]
- Story 7.4 definition: [Source: `_bmad-output/planning-artifacts/epics.md#Story-7.4`]
- Story 7.1 (courses catalog — public zone patterns established): [Source: `_bmad-output/implementation-artifacts/7-1-courses-public-catalog-premium-surface.md`]
- Story 7.2 (course detail — public zone patterns applied): [Source: `_bmad-output/implementation-artifacts/7-2-courses-slug-persuasive-course-landing-page.md`]
- Story 7.3 (pricing — public zone + auth fix + shared navbar): [Source: `_bmad-output/implementation-artifacts/7-3-pricing-public-marketing-surface-redesign.md`]
- Route Protection Matrix: [Source: `_bmad-output/planning-artifacts/architecture.md#Explicit-Route-Protection-Matrix`]
- Public Zone Design Tokens: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Color-System`]
- Typography System: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Typography-System`]
- Component Boundaries: [Source: `_bmad-output/planning-artifacts/architecture.md#Component-Boundaries`]
- ISR caching requirement: [Source: `_bmad-output/planning-artifacts/architecture.md#Requirements-Coverage-Validation`]

## Definition of Done

- [ ] `PublicNavbarShell` is the single source of truth for: public navbar, dark background token, and font variable injection across all four public routes (`/`, `/courses`, `/courses/[slug]`, `/pricing`)
- [ ] No individual public route page declares `bg-[#0F0F14]` or font variable classes at the root level — these are inherited from the shell
- [ ] No individual public route page re-declares `Inter` or `Playfair_Display` from `next/font/google` — the shell owns these
- [ ] All four public routes render visually identical to their post-Story-7.1/7.2/7.3 state (no visible regression)
- [ ] Signed-in and signed-out navbar states are consistent across all four public routes
- [ ] Lesson viewer (`/courses/[slug]/[lessonId]`) still requires auth — NOT accidentally opened
- [ ] Admin routes (`/admin/*`) still require auth + role — NOT affected
- [ ] ISR `revalidate = 300` on `/courses/page.tsx` is preserved
- [ ] Midtrans checkout on `/pricing` continues to work for authenticated users
- [ ] `npm run lint` passes with zero errors
- [ ] `npm run typecheck` passes with zero errors
- [ ] `npx vitest run` passes with the same or greater test count as post-Story-7.2 (104 tests)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4.6 (SM — Scrum Master, Create Story workflow)

### Debug Log References

- `npx vitest run`
- `npm run lint`
- `npm run typecheck`
- `npx vitest run "src/components/shared/public-navbar-shell.test.tsx" "src/components/shared/public-navbar.test.tsx" "src/app/(student)/courses/page.test.tsx" "src/app/(student)/pricing/page.test.tsx" "src/middleware.test.tsx"`
- `npx vitest run "src/components/shared/public-navbar-shell.test.tsx"`
- `npx vitest run "src/components/shared/public-navbar-shell.test.tsx" "src/components/shared/public-navbar.test.tsx" "src/app/(student)/courses/page.test.tsx" "src/app/(student)/courses/[slug]/page.test.tsx" "src/app/(student)/pricing/page.test.tsx"`
- `npx vitest run "src/app/(student)/public-route-layout.test.tsx"`

### Completion Notes List

- Consolidated shared public-zone concerns into `project-e-course/src/components/shared/public-navbar-shell.tsx`: canonical `PublicNavbar` composition, `Inter`/`Playfair_Display` font variable injection, and shared `bg-white dark:bg-[#0F0F14] text-slate-900 dark:text-white` defaults.
- Removed redundant root-level background/font wrappers from `src/app/page.tsx`, `src/app/(student)/courses/page.tsx`, `src/app/(student)/courses/[slug]/page.tsx`, `src/app/(student)/pricing/page.tsx`, plus aligned route loading states under the same shell-provided defaults.
- Added `src/components/shared/public-navbar-shell.test.tsx` and updated `src/app/(student)/public-route-layout.test.tsx` to cover the new shared shell contract and keep route-layout tests compatible with `next/font/google` usage.
- Preserved `/courses` ISR (`revalidate = 300`) and left navbar auth logic, pricing checkout flow, middleware protection, paywall behavior, admin routes, and lesson-viewer protection untouched.

### File List

- `project-e-course/src/components/shared/public-navbar-shell.tsx`
- `project-e-course/src/components/shared/public-navbar-shell.test.tsx`
- `project-e-course/src/app/page.tsx`
- `project-e-course/src/app/(student)/courses/page.tsx`
- `project-e-course/src/app/(student)/courses/loading.tsx`
- `project-e-course/src/app/(student)/courses/[slug]/page.tsx`
- `project-e-course/src/app/(student)/courses/[slug]/loading.tsx`
- `project-e-course/src/app/(student)/pricing/page.tsx`
- `project-e-course/src/app/(student)/pricing/loading.tsx`
- `project-e-course/src/app/(student)/public-route-layout.test.tsx`

## Change Log

- 2026-03-11: Story file created. Status set to `ready-for-dev`. Consolidates shared public zone layout patterns (navbar, dark bg token, font variables) established across Stories 7.1–7.3 into a single `PublicNavbarShell` composition layer.
- 2026-03-11: Refactored public-zone layout concerns into `PublicNavbarShell`, removed page-level bg/font duplication from public routes/loading states, and added shell regression coverage. Status set to `review`.
