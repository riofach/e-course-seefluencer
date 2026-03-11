# Story 6.1: Public Landing Page Shell & Navbar

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a visitor or signed-in user,
I want to land on a polished homepage with a clear navigation bar,
so that I immediately understand the product and can navigate to key areas confidently.

## Acceptance Criteria

1. **Given** I open route `/`
   **When** the landing page renders
   **Then** I see a premium public layout aligned with the approved **Hybrid Duality** design direction — Creative Agency aesthetic for the landing surface (large border-radius, Fraunces/Playfair Display hero font, gradient accents) (FR25)

2. **Given** the landing page is loaded
   **When** the navbar renders
   **Then** the **Seefluencer** text logo appears on the left (not an image — text logo only) (FR26)

3. **Given** the landing page is loaded
   **When** the center nav links render
   **Then** three links appear: **Home**, **Courses**, and **Pricing** — in that order (FR26)
   **And** clicking **Courses** navigates to `/courses`
   **And** clicking **Pricing** navigates to `/pricing`
   **And** clicking **Home** stays on or scrolls to top of `/`

4. **Given** I am signed in as a student or admin
   **When** the navbar right section renders
   **Then** I see my profile name displayed (not just avatar) (FR26)

5. **Given** I am NOT signed in
   **When** the navbar right section renders
   **Then** I see auth CTAs: **Sign In** and **Sign Up** links (FR26)

6. **Given** the landing page is accessed
   **When** the page loads
   **Then** the global app header (`GlobalHeader` + `NavbarAuth` from root layout) is **NOT** used — the landing page has its own `PublicNavbar` component that is route-specific (architecture constraint)

7. **Given** I access the landing page from mobile viewport (< 768px)
   **When** the navbar renders
   **Then** all interactive nav elements meet **minimum 44×44px touch targets** (WCAG AA, NFR-U1)
   **And** the navbar remains accessible and usable across mobile, tablet, and desktop breakpoints

8. **Given** I scroll or interact with the navbar
   **When** in scroll position > 0
   **Then** the navbar has a sticky/fixed position at the top with subtle backdrop blur, ensuring orientation at all scroll positions

9. **Given** the landing page loads
   **When** I inspect the page shell structure
   **Then** the page uses **Playfair Display** or **Fraunces** as the hero display font (loaded via `next/font/google`)
   **And** body text uses **Inter** with tight tracking (`-0.02em`)

10. **Given** the route `/` page
    **When** any server component fetches session
    **Then** the public page remains accessible without authentication — no auth redirect (NFR-S2 inverse: public route stays public)

## Tasks / Subtasks

- [x] **Create `PublicNavbar` server component** (AC: 2, 3, 4, 5, 6, 7, 8)
  - [x] Create `project-e-course/src/components/shared/public-navbar.tsx` as async RSC (NO `'use client'`)
  - [x] Fetch session via `getServerAuthSession()` inside the component
  - [x] If session → fetch user profile via `getUserProfileData(session.user.id)` for display name
  - [x] Left: `<Link href="/">Seefluencer</Link>` with hero/display font styling
  - [x] Center: nav links — `Home` (`/`), `Courses` (`/courses`), `Pricing` (`/pricing`)
  - [x] Right: if session exists → show display name + NavbarProfileDropdown (reuse existing); else → Sign In + Sign Up buttons
  - [x] Sticky positioning: `position: sticky; top: 0; z-index: 50` with `backdrop-blur` and subtle `bg-opacity`
  - [x] Mobile responsive: nav links collapse to hamburger/sheet on `< 768px` (use shadcn `Sheet` for mobile menu)
  - [x] All interactive elements: `min-h-[44px] min-w-[44px]` touch target compliance

- [x] **Update root `layout.tsx` to suppress `GlobalHeader` on landing page** (AC: 6)
  - [x] Open `project-e-course/src/app/layout.tsx`
  - [x] The `GlobalHeader` already conditionally hides itself on `/admin` routes (via `usePathname`)
  - [x] Extend `GlobalHeader` suppression: add `/` exact-match suppression so the root landing page does NOT render the global header
  - [x] Update `project-e-course/src/components/shared/global-header.tsx`: add `pathname === '/'` to the suppression condition

- [x] **Create landing page root at route `/`** (AC: 1, 6, 9, 10)
  - [x] Update `project-e-course/src/app/page.tsx` — replace stub with full landing page shell
  - [x] This file is a **React Server Component** (no `'use client'`)
  - [x] Add display font loading: import `Playfair_Display` (or `Fraunces`) from `next/font/google`
  - [x] Render `<PublicNavbar />` at top of page (NOT inside root layout's GlobalHeader)
  - [x] Render placeholder sections for Story 6.2–6.5 work (structural divs with section IDs so future stories can populate them)
  - [x] Add scroll target `id="hero"` for Home link smooth scroll behavior
  - [x] The page must be publicly accessible — no `getServerAuthSession()` redirect guard here

- [x] **Create `PublicMobileMenu` client component** (AC: 7)
  - [x] Create `project-e-course/src/components/shared/public-mobile-menu.tsx` as `'use client'`
  - [x] Uses shadcn `Sheet` (already installed) for slide-in mobile nav drawer
  - [x] Trigger: hamburger icon button (lucide `Menu` icon), minimum `44x44px` touch target
  - [x] Sheet content: Seefluencer logo, nav links (Home, Courses, Pricing), auth state (name or Sign In/Sign Up)
  - [x] Close on link click

- [x] **Update `metadata` in `page.tsx`** (SEO)
  - [x] Set `title: "Seefluencer | Learn from Influencers"`
  - [x] Set `description` aligned with value proposition
  - [x] Export `metadata` as per Next.js App Router convention

- [x] **Write component tests** (AC: 2, 3, 4, 5)
  - [x] Create `project-e-course/src/components/shared/public-navbar.test.tsx` using vitest + `@testing-library/react`
  - [x] Test: renders Seefluencer logo link
  - [x] Test: renders Home, Courses, Pricing links
  - [x] Test: renders Sign In / Sign Up when no session
  - [x] Test: renders user display name when session exists

## Dev Notes

### 🔴 Critical: Physical Project Root

**ALL source files live under `project-e-course/`**. The `package.json` is at `project-e-course/package.json`. Always prefix ALL paths with `project-e-course/`. The outer `hiring-seefluencer/` directory is the monorepo shell. Never create files at the `hiring-seefluencer/src/` level.

### 🔴 Critical: Landing Page Zone vs App Zone — Hybrid Duality

Per approved UX direction **"The Hybrid Duality"**:

- **Landing surface (route `/`):** Creative Agency aesthetic — Fraunces/Playfair Display display font, gradient Coral `#FF6B6B` → Purple `#9B59B6` → Teal `#1ABC9C`, large `border-radius` (24–40px), organic blob shapes.
- **App zone (routes like `/courses`, `/profile`, etc.):** SaaS Productivity — Inter tight-tracking, `#E5E7EB` 1px borders, no decorations.
- **Admin zone (`/admin/*`):** Pure SaaS minimal — white bg, 1px borders, NO dark mode, no decorations.

The `PublicNavbar` lives in the landing zone — it should feel premium, not a plain utility header.

### 🔴 Critical: `GlobalHeader` Suppression on Route `/`

The root `layout.tsx` renders `GlobalHeader > NavbarAuth` globally. `GlobalHeader` already suppresses itself on `/admin` routes. This story extends that suppression to the landing page `/` so the landing page can render its own `PublicNavbar` in `page.tsx` instead.

**Current `global-header.tsx` suppression logic (line 9):**

```tsx
if (pathname.startsWith('/admin')) return null;
```

**Must become:**

```tsx
if (pathname.startsWith('/admin') || pathname === '/') return null;
```

> ⚠️ `GlobalHeader` uses `'use client'` with `usePathname()` — this change is safe and non-breaking for all other routes.

### 🔴 Critical: `PublicNavbar` Is an Async RSC — NOT `'use client'`

The `PublicNavbar` fetches session server-side just like `NavbarAuth`. It must be an async React Server Component:

```tsx
// src/components/shared/public-navbar.tsx — RSC
import { getServerAuthSession } from '~/server/auth';
import { getUserProfileData } from '~/server/users/queries';
import Link from 'next/link';
// ... other imports

export async function PublicNavbar() {
	const session = await getServerAuthSession();
	let displayName: string | null = null;

	if (session?.user?.id) {
		const user = await getUserProfileData(session.user.id);
		displayName = user?.name ?? session.user.name ?? 'User';
	}

	return (
		<nav className="sticky top-0 z-50 ...">
			{/* left: Seefluencer */}
			{/* center: nav links */}
			{/* right: displayName or auth CTAs */}
			{/* Mobile: <PublicMobileMenu /> client component for interactive sheet */}
		</nav>
	);
}
```

> **Why RSC?** Server-side session fetch avoids layout flash. The `NavbarAuth` component (for app zone) uses the same pattern. Consistency is key.

### 🔴 Critical: Mobile Menu Interactivity — `PublicMobileMenu` As Client Island

Since `PublicNavbar` is an RSC, interactivity (hamburger toggle, sheet open/close) must be delegated to a client component:

```tsx
// src/components/shared/public-mobile-menu.tsx
'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet';
import Link from 'next/link';

type PublicMobileMenuProps = {
	displayName: string | null;
};

export function PublicMobileMenu({ displayName }: PublicMobileMenuProps) {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<button
					type="button"
					aria-label="Open navigation menu"
					className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md md:hidden"
				>
					<Menu size={20} />
				</button>
			</SheetTrigger>
			<SheetContent side="right" className="w-72 pt-8">
				{/* nav links + auth state */}
			</SheetContent>
		</Sheet>
	);
}
```

> **Pattern:** Same RSC + Client Island pattern used for NavbarProfileDropdown. The RSC fetches data, passes `displayName` as a prop to the client component.

### 🔴 Critical: Display Font — `Playfair Display` via `next/font/google`

Add the display font to the **landing page** scope, NOT the global `layout.tsx` root (to avoid adding font weight to every page):

```tsx
// src/app/page.tsx
import { Playfair_Display } from 'next/font/google';

const playfairDisplay = Playfair_Display({
	subsets: ['latin'],
	weight: ['700', '900'],
	variable: '--font-playfair-display',
});

export default async function Home() {
	return (
		<div className={playfairDisplay.variable}>
			<PublicNavbar />
			{/* sections */}
		</div>
	);
}
```

Use `font-[family-name:var(--font-playfair-display)]` in Tailwind for hero headings.

> **Alternative:** `Fraunces` font is also acceptable per UX spec. Use whichever loads successfully via `next/font/google`. Do NOT use `@import` — always use `next/font/google`.

### 🔴 Critical: No `getServerAuthSession()` Redirect Guard on `/`

Route `/` must be publicly accessible — do NOT add any session-based redirect logic in `page.tsx`. The page simply shows different navbar state (logged-in vs logged-out). This is consistent with architecture boundary:

> [Source: architecture.md] — `/`: Route publik utama yang berfungsi sebagai marketing landing page reviewer-facing. Route ini harus dapat diakses tanpa autentikasi.

### 🔴 Critical: ActionResponse Pattern Does NOT Apply Here

This story has NO Server Actions. It is a purely presentational RSC page with session-reading only. Do NOT add `ActionResponse<T>` wrappers — this pattern only applies to mutation server actions.

### 🔵 `PublicNavbar` Visual Spec — Landing Zone Aesthetic

```tsx
// Navbar shell — sticky + backdrop blur
<nav className="sticky top-0 z-50 border-b border-white/10 bg-white/80 backdrop-blur-md dark:bg-[#0F0F14]/80">
	<div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
		{/* LEFT: Seefluencer text logo */}
		<Link
			href="/"
			className="font-[family-name:var(--font-playfair-display)] text-xl font-bold tracking-tight text-gray-900 dark:text-white"
		>
			Seefluencer
		</Link>

		{/* CENTER: Nav links — hidden on mobile */}
		<div className="hidden items-center gap-6 md:flex">
			<Link
				href="/"
				className="text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
			>
				Home
			</Link>
			<Link
				href="/courses"
				className="text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
			>
				Courses
			</Link>
			<Link
				href="/pricing"
				className="text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
			>
				Pricing
			</Link>
		</div>

		{/* RIGHT: Auth state or profile */}
		<div className="hidden items-center gap-3 md:flex">
			{displayName ? (
				// Reuse NavbarProfileDropdown from NavbarAuth pattern
				<NavbarProfileDropdownWrapper displayName={displayName} session={session} />
			) : (
				<>
					<Button variant="ghost" asChild className="min-h-[44px]">
						<Link href="/login">Sign In</Link>
					</Button>
					<Button asChild className="min-h-[44px] bg-indigo-600 hover:bg-indigo-700">
						<Link href="/register">Sign Up</Link>
					</Button>
				</>
			)}
		</div>

		{/* MOBILE: hamburger */}
		<PublicMobileMenu displayName={displayName} session={session} />
	</div>
</nav>
```

> **Note:** The `NavbarProfileDropdown` for the signed-in state should follow the same pattern as `NavbarAuth` — use `DropdownMenu` + `Avatar` from shadcn. You may extract the signed-in dropdown portion from `NavbarAuth` into a shared component or replicate the structure.

### 🔵 Landing Page Shell — Structural Sections Placeholder

`page.tsx` should scaffold the section structure so Stories 6.2–6.5 can slot in without restructuring:

```tsx
export default async function Home() {
	return (
		<div className={`${playfairDisplay.variable} min-h-screen`}>
			<PublicNavbar />

			{/* Section 1: Hero — populated in Story 6.2 */}
			<section id="hero" className="...">
				{/* Story 6.2 will implement this */}
			</section>

			{/* Section 2: Value Proposition / Benefits — populated in Story 6.3 */}
			<section id="value" className="...">
				{/* Story 6.3 will implement this */}
			</section>

			{/* Section 3: Featured Courses / Highlights — populated in Story 6.3 */}
			<section id="highlights" className="...">
				{/* Story 6.3 will implement this */}
			</section>

			{/* Section 4: Social Proof / Trust — populated in Story 6.3 */}
			<section id="trust" className="...">
				{/* Story 6.3 will implement this */}
			</section>

			{/* Section 5: Pricing Bridge CTA — populated in Story 6.3 */}
			<section id="pricing-cta" className="...">
				{/* Story 6.3 will implement this */}
			</section>

			{/* Footer — populated in Story 6.3/6.5 */}
			<footer id="footer" className="...">
				{/* Future story */}
			</footer>
		</div>
	);
}
```

> **This story's scope:** ONLY the `PublicNavbar` and page shell. Hero content, marketing sections, and motion polish are deferred to Stories 6.2–6.4.

### 🔵 Dark Mode — Landing Zone Dark Background

Per UX spec, dark mode background for landing/app zone:

- Page bg (dark mode): `#0F0F14`
- Card bg (dark mode): `#1A1A24`
- Border (dark mode): `#2A2A3C`

The `ThemeProvider` is already configured in `layout.tsx` with `next-themes`. The landing page inherits dark/light theme automatically via `dark:` Tailwind classes.

### 🔵 Pricing Page Route Note

The center nav links include `/pricing`. If `/pricing` doesn't exist yet in the route structure (check `src/app/(student)/` or root `src/app/`), **do NOT create it in this story** — just wire the `Link href="/pricing"`. The link will 404 until Story 4.2's pricing page is available, which is acceptable for this story's scope.

Similarly, `/courses` maps to the existing `src/app/(student)/courses/page.tsx` — that route already exists from Epic 2.

### 🔵 Existing `NavbarAuth` — Do NOT Modify

`src/components/shared/navbar-auth.tsx` is used inside the `GlobalHeader` for all NON-landing, NON-admin routes. Do NOT modify it. The landing page uses its own `PublicNavbar`. After this story:

| Route pattern                | Header component                                |
| ---------------------------- | ----------------------------------------------- |
| `/` (landing)                | `PublicNavbar` (new)                            |
| `/courses`, `/profile`, etc. | `GlobalHeader > NavbarAuth` (existing)          |
| `/admin/*`                   | Admin layout header (existing, no GlobalHeader) |

### 🔵 Existing Components Available — DO NOT Recreate

```
project-e-course/src/components/ui/button.tsx           — Button (use for CTAs)
project-e-course/src/components/ui/sheet.tsx            — Sheet (use for mobile menu drawer)
project-e-course/src/components/ui/avatar.tsx           — Avatar (use in profile dropdown)
project-e-course/src/components/ui/dropdown-menu.tsx    — DropdownMenu (use in profile dropdown)
project-e-course/src/components/shared/global-header.tsx — EXTEND to suppress on pathname "/"
project-e-course/src/components/shared/navbar-auth.tsx   — Reference for auth state pattern (DO NOT modify)
project-e-course/src/components/shared/logout-button.tsx — LogoutButton (reuse in dropdown)
project-e-course/src/server/auth.ts                     — getServerAuthSession()
project-e-course/src/server/users/queries.ts             — getUserProfileData()
```

### 🔵 Files to Create (New)

```
project-e-course/src/components/shared/public-navbar.tsx        — Landing-specific nav RSC
project-e-course/src/components/shared/public-mobile-menu.tsx   — Client island for mobile sheet
project-e-course/src/components/shared/public-navbar.test.tsx   — vitest component tests
```

### 🔵 Files to Modify (Extend, Not Recreate)

```
project-e-course/src/app/page.tsx
  → Replace stub with landing page shell + <PublicNavbar /> + section placeholders
  → Add Playfair Display font import
  → Export metadata (title, description)

project-e-course/src/components/shared/global-header.tsx
  → Extend suppression: add `|| pathname === "/"` to the null-return condition
```

### 🔵 TypeScript Conventions (Same as All Previous Stories)

- **No `any` types** — TypeScript strict mode, zero tolerance (NFR-M1)
- **File naming:** `kebab-case` for files, `PascalCase` for components
- **Import alias:** `~` maps to `src/`
- **No Redux/Zustand** — session is server-fetched; no client state management needed for this story
- **No `@import` for fonts** — always use `next/font/google`

### 🔵 Accessibility Compliance (WCAG AA)

Per NFR-U1 and UX spec accessibility strategy:

- **Color contrast:** `text-gray-900` on white background and `text-white` on `#0F0F14` both meet 4.5:1 ratio
- **Touch targets:** All buttons and nav links must have `min-h-[44px]` class
- **Focus rings:** Use shadcn default `ring-indigo-500` — do not remove focus-visible styles
- **Keyboard navigation:** Tab order must be logical: logo → nav links → auth CTA/profile
- **ARIA labels:** Mobile hamburger button must have `aria-label="Open navigation menu"`
- **Skip to content:** Not required for this story but add `id="main-content"` to main section for future

### 🔵 Performance — Public Page Budget

Per NFR-P1: Initial page load < 2.5s on 4G.

- Use `next/font` for display fonts (zero layout shift, preloaded)
- Keep JS payload minimal: `PublicNavbar` is RSC, only `PublicMobileMenu` is client JS
- No heavy animations in this story (motion polish is deferred to Story 6.4)
- No external image requests in navbar (text logo only)

### Project Structure Notes

- New component: `src/components/shared/public-navbar.tsx` — shares the `/shared/` folder with other public-facing components like `navbar-auth.tsx` and `global-header.tsx`
- Architecture boundary: Route `/` is explicitly a public marketing route — no auth guards, no redirect
- The landing page does NOT use the `(student)` or `(admin)` route groups; it lives at root `src/app/page.tsx`
- Sheet component (`src/components/ui/sheet.tsx`) is already installed — no new shadcn installs required

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — FR25, FR26, FR27; Epic 6: Public Landing Experience & Conversion; Story 6.1 acceptance criteria; Landing Page IA order from UX Design section]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — Route `/` is public marketing route, no auth requirement; `src/components/shared/` for public nav components (PublicNavbar); Progressive enhancement rule for motion; Middleware does NOT protect `/`; RSC + Server Actions pattern; TypeScript strict mode (NFR-M1); `~` import alias]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — Hybrid Duality direction: Creative Agency landing + SaaS Productivity app; Display font: Playfair Display / Fraunces; Navbar IA: left logo, center nav, right auth state; Dark mode bg `#0F0F14`; WCAG AA touch target 44×44px; Sticky navbar; Mobile: sheet/drawer for nav collapse; "Seefluencer" text logo; Signed-in state shows profile name; Unauthenticated state shows Sign In / Sign Up]
- [Source: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-03-10.md` — Story 6.1 rationale: landing shell + public navbar; Navbar spec: left Seefluencer, center Home/Courses/Pricing, right profile name or auth CTA]
- [Source: `project-e-course/src/components/shared/global-header.tsx` — Current suppression pattern (`pathname.startsWith("/admin")`); `'use client'` with `usePathname()`; must be extended to suppress on `/`]
- [Source: `project-e-course/src/components/shared/navbar-auth.tsx` — Reference for session fetch pattern, Avatar+DropdownMenu structure, displayName resolution, logout button integration]
- [Source: `project-e-course/src/app/layout.tsx` — Root layout uses GlobalHeader + NavbarAuth globally; ThemeProvider with next-themes already configured; Toaster at bottom-right already configured]
- [Source: `project-e-course/src/app/page.tsx` — Current stub to replace with landing shell]
- [Source: `_bmad-output/implementation-artifacts/5-5-quiz-builder.md` — Physical project root `project-e-course/`, established RSC + Client Island pattern, vitest + testing-library test pattern, `~` import alias, `sheet.tsx` already installed]

## Dev Agent Record

### Agent Model Used

cliproxy/gpt-5.4

### Debug Log References

- `npm exec vitest run "src/components/shared/public-navbar.test.tsx"`
- `npm run typecheck`
- `npm run lint`
- `npm test`

### Completion Notes List

- Implemented `PublicNavbar` as async RSC with server-side session/profile lookup and landing-zone sticky shell styling.
- Added `PublicMobileMenu` sheet drawer and extracted `PublicNavbarContent` to keep the RSC thin while preserving testability.
- Replaced the `/` route stub with a public landing shell using `Playfair Display` + `Inter`, section placeholders, and route-specific metadata.
- Extended `GlobalHeader` suppression so the shared app header no longer renders on `/`.
- Added vitest component coverage for logo, nav links, guest CTAs, and signed-in display-name rendering.
- Refined the hero shell copy and supporting panel content to feel public-facing and production-ready without changing Story 6.1 scope or section structure.
- Tightened the navbar-to-hero transition and reduced the top visual seam so the landing shell feels more cohesive on desktop while preserving mobile responsiveness.

### File List

- `project-e-course/src/app/page.tsx`
- `project-e-course/src/components/shared/global-header.tsx`
- `project-e-course/src/components/shared/public-mobile-menu.tsx`
- `project-e-course/src/components/shared/public-navbar-content.tsx`
- `project-e-course/src/components/shared/public-navbar.test.tsx`
- `project-e-course/src/components/shared/public-navbar.tsx`

## Change Log

- 2026-03-10: Implemented Story 6.1 public landing shell, route-specific navbar, mobile menu, SEO metadata, and component tests.
- 2026-03-10: Polished landing hero copy and visual hierarchy to remove dev-facing placeholder language while preserving shell-only scope.
- 2026-03-10: Reduced hero top gap and softened the upper gradient overlay for a cleaner navbar-to-hero transition.
