# Story 6.3: Marketing Sections for Discovery & Trust

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a visitor,
I want to scroll through clear sections that explain the platform value,
so that I gain trust before deciding to browse courses or pricing.

## Acceptance Criteria

1. **Given** I continue scrolling on the landing page past the hero
   **When** I review the marketing content
   **Then** I see a **Value Proposition / Benefits** section (`id="value"`) replacing the current dashed-border placeholder — communicating why Seefluencer is different from generic e-courses (FR28)

2. **Given** I am viewing the Value Proposition section
   **When** I read the content
   **Then** the messaging is EdTech-specific (creative influencer learning, structured curriculum, real progress) — NOT generic SaaS messaging (FR28)

3. **Given** I continue scrolling
   **When** I reach the **Featured Course / Learning Highlights** section (`id="highlights"`)
   **Then** it replaces the current placeholder with 2–3 curated course highlight cards or learning outcome feature tiles aligned to the Seefluencer EdTech context (FR27, FR28)

4. **Given** I am in the highlights section
   **When** I see the course or feature tiles
   **Then** each tile includes a title, brief description, and a visual badge or icon indicator (e.g., Lesson type tag, course level)
   **And** dummy data may be used as production data is not yet available (FR28 acceptance criteria note)

5. **Given** I continue scrolling
   **When** I reach the **Trust / Social Proof / Reviewer Confidence** section (`id="trust"`)
   **Then** it replaces the current placeholder with credibility indicators such as testimonial cards, platform stats (e.g., "100+ courses", "500+ students"), or quality assurance badges (FR28)

6. **Given** I am in the trust section
   **When** I view the content
   **Then** dummy data is used for social proof numbers and testimonial quotes (acceptable for MVP per FR28 note)

7. **Given** I continue scrolling
   **When** I reach the **Pricing Bridge CTA** section (`id="pricing-cta"`)
   **Then** it replaces the current placeholder with a smooth subscription motivator block with a clear CTA linking to `/pricing` (FR27)
   **And** the section feels inviting rather than aggressively sales-focused

8. **Given** I reach the footer (`id="footer"`)
   **When** I view it
   **Then** the dashed placeholder is replaced with a minimal real footer containing the Seefluencer brand name, a short tagline, and footer navigation links (Home, Courses, Pricing) (FR25, FR27)

9. **Given** all sections are rendered
   **When** I inspect CTA placements
   **Then** every section that calls the user to action guides them to either `/courses` or `/pricing` — no broken links, no dead-end CTAs (FR27)

10. **Given** I view any of these sections on mobile (< 768px)
    **When** the layout adapts
    **Then** all section content remains readable, stacked vertically where necessary, with CTA buttons meeting the minimum 44×44px touch target (NFR-U1)

11. **Given** the page is viewed in dark mode
    **When** `next-themes` applies the dark class
    **Then** all new section backgrounds, card borders, and text maintain adequate WCAG AA contrast (4.5:1 ratio) (NFR-U4)

## Tasks / Subtasks

- [x] **Replace `id="value"` section placeholder with Value Proposition section** (AC: 1, 2, 9, 10, 11)
  - [x] Open `project-e-course/src/app/page.tsx`
  - [x] Remove the dashed-border placeholder div inside `<section id="value">`
  - [x] Implement 3-column feature benefit grid (or 2-col on mobile, 3-col on `md:`) using shadcn `Card` components or custom styled divs
  - [x] Each benefit card: icon (SVG or Heroicon/lucide-react icon), headline (~4 words), short description (~20 words) — EdTech-specific messaging
  - [x] Suggested benefit pillars: "Learn from Real Creators" / "Structured Curriculum" / "Track Your Progress" (or equivalent EdTech copy)
  - [x] Apply Hybrid Duality: light/dark bg variants, no heavy gradient here (gradient reserved for hero), but subtle Indigo/Teal accent on icons
  - [x] Extract to `LandingValueSection` RSC component in `project-e-course/src/components/shared/landing-value-section.tsx` if JSX exceeds ~60 lines
  - [x] Ensure `min-h-[24rem]` is removed/replaced with real content height; keep `border-b border-slate-200/70 dark:border-white/10` separator

- [x] **Replace `id="highlights"` section placeholder with Featured Course Highlights** (AC: 3, 4, 9, 10, 11)
  - [x] Remove the dashed-border placeholder div inside `<section id="highlights">`
  - [x] Implement 2–3 course showcase cards (horizontal layout on `lg:`, vertical stacked on mobile)
  - [x] Each card: dummy course title, chapter count, lesson count, `isFree` badge (Free/Premium), a brief tagline (2 sentences max)
  - [x] Style as `Card` with `rounded-[24px]` (landing-zone border-radius per UX spec), `border border-slate-200/80 dark:border-[#2A2A3C]`
  - [x] Add a section heading: e.g., `h2` with `Playfair Display` font (`font-[family-name:var(--font-playfair-display)]`), matching hero editorial hierarchy
  - [x] Include a "Browse All Courses" CTA link → `/courses` below the grid (AC: 9)
  - [x] Extract to `LandingHighlightsSection` RSC if needed (`project-e-course/src/components/shared/landing-highlights-section.tsx`)

- [x] **Replace `id="trust"` section placeholder with Social Proof / Trust section** (AC: 5, 6, 9, 10, 11)
  - [x] Remove the dashed-border placeholder div inside `<section id="trust">`
  - [x] Implement trust sub-components — choose 2 of the following (both acceptable for MVP):
    - **Stats strip:** 3–4 platform stats (e.g., "500+ Students", "50+ Courses", "10+ Creators", "4.8★ Rating") — large bold number + label
    - **Testimonial cards:** 2–3 card quotes (dummy first-person student testimonials) with avatar initials, name, and star rating
  - [x] Dummy data is explicitly allowed per AC 6 and FR28 note
  - [x] All data is hardcoded/static — no database query needed
  - [x] Add an `aria-label="Social proof and platform statistics"` on the section for accessibility
  - [x] Extract to `LandingTrustSection` RSC if needed

- [x] **Replace `id="pricing-cta"` section placeholder with Pricing Bridge CTA** (AC: 7, 9, 10, 11)
  - [x] Remove the dashed-border placeholder div inside `<section id="pricing-cta">`
  - [x] Implement a centered CTA block: eyebrow text, headline (Playfair Display), 1-line subtext, and primary CTA button → `/pricing`
  - [x] Apply subtle background differentiation (e.g., `bg-slate-50 dark:bg-[#1A1A24]` or a very light Indigo tint) to visually separate this section
  - [x] CTA button: `<Button asChild>` with `<Link href="/pricing">` — solid Indigo, min-h-[44px], rounded-full
  - [x] Optional: add a secondary link "or start browsing free courses" → `/courses`
  - [x] NO hard-sell language — framing should be "Unlock Full Access" / "Start Your Premium Journey" style
  - [x] Extract to `LandingPricingCTA` RSC if needed

- [x] **Replace `id="footer"` placeholder with minimal real footer** (AC: 8, 9, 10, 11)
  - [x] Remove the dashed-border placeholder div inside `<footer id="footer">`
  - [x] Implement a simple 2-row footer:
    - Top: Seefluencer brand name (bold, left) + nav links (Home → `#hero`, Courses → `/courses`, Pricing → `/pricing`) centered or right
    - Bottom: copyright line `© 2026 Seefluencer. All rights reserved.` — small text, slate-500
  - [x] NO dark mode override — uses root page dark class already set on parent `div`
  - [x] Keep `py-12` wrapper from current footer tag

- [x] **Write component tests for newly extracted RSC components** (AC: all)
  - [x] For each extracted component (e.g., `landing-value-section.tsx`, `landing-highlights-section.tsx`, etc.), create co-located test files
  - [x] Test pattern: `import { render } from '@testing-library/react'` + vitest, matching `landing-hero.test.tsx` pattern
  - [x] Minimum: test that section renders without crashing + CTA link hrefs are correct
  - [x] File: `project-e-course/src/components/shared/landing-value-section.test.tsx` (etc.)

## Dev Notes

### 🔴 Critical: Physical Project Root

**ALL source files live under `project-e-course/`**. The `package.json` and `next.config.ts` are at `project-e-course/`. Always prefix ALL file paths with `project-e-course/`. Never create files at `hiring-seefluencer/src/` level.

### 🔴 Critical: Target File is `page.tsx` — Sections Already Have IDs

The current `project-e-course/src/app/page.tsx` has these placeholder sections already wired with IDs that **MUST be preserved**:

```tsx
// CURRENT STATE — dashed-border placeholders to be REPLACED:
<section id="value"     className="min-h-[24rem] border-b ...">  {/* → Replace content */}
<section id="highlights" className="min-h-[24rem] border-b ..."> {/* → Replace content */}
<section id="trust"     className="min-h-[24rem] border-b ...">  {/* → Replace content */}
<section id="pricing-cta" className="min-h-[20rem] border-b ..."> {/* → Replace content */}
<footer id="footer"     className="py-12">                         {/* → Replace content */}
```

- The `id` attributes on ALL sections are anchor targets for the `Public Navbar` smooth scroll behavior (Home → `#hero`, etc.) — **DO NOT rename or remove any id**.
- The `border-b border-slate-200/70 dark:border-white/10` separators on `section` elements should be kept (or migrated to the new content structure).
- The `LandingHero` component and `PublicNavbar` are already rendered above — **DO NOT modify them**.

### 🔴 Critical: NO New Routes or Database Queries

This story is 100% static/hardcoded UI:

- No `db` imports
- No Server Actions
- No `getServerSession` or auth checks
- No new routes, no new pages
- All content (course highlights, testimonials, stats) is dummy/hardcoded for MVP

### 🔴 Critical: Fonts — Use Existing CSS Variables Only

Fonts `Playfair_Display` and `Inter` are already loaded in `page.tsx` (from Story 6.1):

```tsx
// Already in page.tsx — DO NOT add again:
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfairDisplay = Playfair_Display({
	subsets: ['latin'],
	weight: ['700', '900'],
	variable: '--font-playfair-display',
});
```

CSS variables applied on root div — use them in extracted components:

- Section headings (editorial h2): `font-[family-name:var(--font-playfair-display)] text-3xl font-bold sm:text-4xl`
- Body copy / labels: default (Inter is the CSS body variable)

### 🔴 Critical: Design Zone Rules — NO Gradient Blobs in Marketing Sections

Per architecture and UX spec — the decorative gradient blobs (Coral/Purple/Teal) are **landing hero zone only**:

| Zone              | Aesthetic Rule                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------ |
| Hero section      | Coral→Purple→Teal blobs, large radius, Playfair h1                                         |
| Value / Trust etc | Clean, light sections — **NO blob decorations**. Use Indigo/Teal accent on icons/CTAs only |
| `/courses` etc    | SaaS Productivity — 1px `#E5E7EB` borders, no decorations                                  |
| `/admin/*`        | Pure SaaS minimal — always light, no dark mode                                             |

The marketing sections **should feel premium but clean** — they are the bridge between the expressive hero and the utilitarian course catalog.

### 🔴 Critical: Component Extraction Threshold

If a section's JSX exceeds ~60 lines in `page.tsx`, extract it to `src/components/shared/`:

```
landing-value-section.tsx      → <LandingValueSection />
landing-highlights-section.tsx → <LandingHighlightsSection />
landing-trust-section.tsx      → <LandingTrustSection />
landing-pricing-cta.tsx        → <LandingPricingCTA />
```

All extracted components are RSC (no `'use client'`) — no props needed (all content is hardcoded).

### 🔴 Critical: CTA Route Integrity

All CTAs must link to routes that **already exist** from previous epics:

- `/courses` → `project-e-course/src/app/(student)/courses/page.tsx` ✅ (Epic 2)
- `/pricing` → exists from Epic 4 (`src/app/(student)/pricing/page.tsx` or root `src/app/pricing/page.tsx`) ✅

If uncertain which pricing path resolves, check both. Use whichever exists. If neither, use `href="#pricing-cta"` as anchor fallback only.

### 🔵 Landing Page Section IA Reference (from UX spec)

Per UX spec `ux-design-specification.md` — Landing Page Information Architecture:

1. Public Navbar ✅ (done in 6.1)
2. Hero Section ✅ (done in 6.2)
3. **Value Proposition / Benefits** ← `id="value"` — **THIS STORY**
4. **Featured Course / Learning Highlights** ← `id="highlights"` — **THIS STORY**
5. **Trust / Social Proof / Reviewer Confidence** ← `id="trust"` — **THIS STORY**
6. **Pricing Bridge CTA** ← `id="pricing-cta"` — **THIS STORY**
7. Footer ← `id="footer"` — **THIS STORY**

Stories 6.4 (motion polish) and 6.5 (responsive/accessibility) will layer on top of what this story builds — therefore the DOM structure and section IDs created here are the canonical foundation for those stories.

### 🔵 Recommended Layout Patterns per Section

**Value Proposition (`id="value"`):**

```tsx
// 3-feature benefit grid — RSC, no 'use client'
<section id="value" className="border-b border-slate-200/70 py-16 dark:border-white/10">
	<div className="mx-auto max-w-5xl">
		<h2 className="mb-12 text-center font-[family-name:var(--font-playfair-display)] text-3xl font-bold sm:text-4xl">
			Why Seefluencer?
		</h2>
		<div className="grid grid-cols-1 gap-6 md:grid-cols-3">{/* 3 benefit cards */}</div>
	</div>
</section>
```

**Highlights (`id="highlights"`):**

```tsx
<section id="highlights" className="border-b border-slate-200/70 py-16 dark:border-white/10">
  <div className="mx-auto max-w-5xl">
    <h2 className="mb-3 font-[family-name:var(--font-playfair-display)] text-3xl font-bold sm:text-4xl">
      Explore Our Courses
    </h2>
    <p className="mb-10 text-slate-600 dark:text-slate-300">...</p>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* 2–3 course cards */}
    </div>
    <div className="mt-8 text-center">
      <Button asChild variant="outline" ...><Link href="/courses">Browse All Courses</Link></Button>
    </div>
  </div>
</section>
```

**Trust (`id="trust"`):**

```tsx
<section
	id="trust"
	aria-label="Social proof and platform statistics"
	className="border-b border-slate-200/70 py-16 dark:border-white/10"
>
	{/* Stats strip or testimonial cards — all dummy data */}
</section>
```

**Pricing CTA (`id="pricing-cta"`):**

```tsx
<section
	id="pricing-cta"
	className="border-b border-slate-200/70 bg-slate-50 py-20 text-center dark:border-white/10 dark:bg-[#1A1A24]"
>
	{/* eyebrow + h2 (Playfair) + subtext + CTA button */}
</section>
```

### 🔵 Styling Token Reference for This Story

From UX spec and architecture — tokens to use across marketing sections:

| Token                   | Value                                                                            | Usage                                    |
| ----------------------- | -------------------------------------------------------------------------------- | ---------------------------------------- |
| Primary CTA             | `bg-indigo-600 hover:bg-indigo-700`                                              | Pricing CTA button, "Browse Courses" btn |
| Card bg (light)         | `bg-white`                                                                       | Benefit cards, course highlight cards    |
| Card bg (dark)          | `dark:bg-[#1A1A24]`                                                              | Cards in dark mode                       |
| Border (light)          | `border-slate-200/80`                                                            | Card borders                             |
| Border (dark)           | `dark:border-[#2A2A3C]`                                                          | Card borders in dark mode                |
| Section separator       | `border-slate-200/70 dark:border-white/10`                                       | Between sections                         |
| Body text (dark mode)   | `dark:text-slate-300`                                                            | Descriptions, subtext                    |
| Section bg variation    | `bg-slate-50 dark:bg-[#1A1A24]`                                                  | Pricing CTA section contrast             |
| Border radius (landing) | `rounded-[24px]`                                                                 | Cards in landing marketing sections      |
| Icon accent             | `text-indigo-600 dark:text-indigo-400`                                           | Benefit icons                            |
| H2 editorial            | `font-[family-name:var(--font-playfair-display)] text-3xl font-bold sm:text-4xl` | Section headings                         |

### 🔵 Dummy Data Reference

All content is hardcoded. Use these as content guidelines:

**Benefit cards (Value section):**

- "Learn from Real Creators" — "Curated courses built by influencers with real-world expertise and practical insights."
- "Structured Learning Path" — "Follow a clear chapter → lesson curriculum with progress tracking at every step."
- "Premium Learning Experience" — "HD video, interactive quizzes, and instant feedback — designed for modern learners."

**Course highlights (Highlights section):**

- "Social Media Mastery" — 4 chapters, 18 lessons, Free badge
- "YouTube Storytelling" — 6 chapters, 24 lessons, Premium badge
- "Content Creator Bootcamp" — 8 chapters, 32 lessons, Premium badge

**Trust stats:**

- "500+ Students Enrolled"
- "50+ Courses Available"
- "10+ Expert Creators"
- "4.8★ Average Rating"

**Pricing CTA copy:**

- Eyebrow: "Start Learning Today"
- Headline: "Unlock Your Full Creative Potential"
- Subtext: "Subscribe to access all premium courses, quizzes, and progress tracking — cancel anytime."
- CTA: "View Pricing Plans" → `/pricing`

**Footer:**

- Brand: "Seefluencer"
- Tagline: "Learn from the best creators."
- Links: Home → `/#hero`, Courses → `/courses`, Pricing → `/pricing`
- Copyright: `© 2026 Seefluencer. All rights reserved.`

### 🔵 Button Import — Use Existing Component

```tsx
import { Button } from "~/components/ui/button";
import Link from "next/link";

// Pricing CTA:
<Button asChild className="min-h-[44px] rounded-full bg-indigo-600 px-8 py-3 text-base font-semibold text-white hover:bg-indigo-700">
  <Link href="/pricing">View Pricing Plans</Link>
</Button>

// Secondary outline CTA:
<Button asChild variant="outline" className="min-h-[44px] rounded-full px-8 py-3 text-base font-semibold">
  <Link href="/courses">Browse All Courses</Link>
</Button>
```

### 🔵 Accessibility Requirements for These Sections

Per NFR-U1, WCAG AA, and UX spec accessibility strategy:

- All section headings follow correct hierarchy: `h1` (hero, from LandingHero) → `h2` (section titles) → `h3` (card titles within sections)
- Decorative elements (icons used as pure visual) must have `aria-hidden="true"`
- Stats section: use `<dl><dt>/<dd>` or `role="list"` for accessible stat lists
- Testimonial cards: wrap name in `<cite>` element
- CTA buttons: ensure the link text is descriptive (not just "Click here")
- Touch targets: all interactive elements `min-h-[44px]` on mobile
- Focus rings: do NOT strip `focus-visible:ring-2 focus-visible:ring-indigo-500` from Button

### 🔵 Testing Pattern — Follow `landing-hero.test.tsx`

Existing test at `project-e-course/src/components/shared/landing-hero.test.tsx` establishes the pattern:

- Uses `@testing-library/react` `render` + vitest
- Tests component renders without crashing
- Tests specific CTA `href` values are correct

Apply same pattern for each extracted component. Test runner: `npx vitest run`.

### Project Structure Notes

- This story modifies `project-e-course/src/app/page.tsx` (primary — replaces 4 placeholder sections and footer)
- May create up to 4 new RSC components in `project-e-course/src/components/shared/`:
  - `landing-value-section.tsx` + `landing-value-section.test.tsx`
  - `landing-highlights-section.tsx` + `landing-highlights-section.test.tsx`
  - `landing-trust-section.tsx` + `landing-trust-section.test.tsx`
  - `landing-pricing-cta.tsx` + `landing-pricing-cta.test.tsx`
- No new routes, no new pages, no database schema changes, no Server Actions
- The section IDs (`value`, `highlights`, `trust`, `pricing-cta`, `footer`) MUST remain unchanged for anchor navigation
- Story 6.4 will add motion polish on top of these components; Story 6.5 will verify responsive/accessible correctness — so naming and structure established here must be clean and extendable

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 6.3 ACs: structured marketing sections, discovery & trust, EdTech context not generic SaaS, FR27 CTA toward Courses/Pricing, FR28 marketing sections including value proposition/highlights/trust indicators, dummy data allowed]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — Landing Page IA sections 3–7: Value Proposition, Featured Course, Trust/Social Proof, Pricing Bridge, Footer; Design tokens: Indigo #6366F1, card bg #1A1A24 dark, border #2A2A3C dark; Responsive: mobile-first, min touch target 44px; Typography h2: 28px/600; No blob decorations outside hero; WCAG AA 4.5:1 contrast; reduced-motion friendly]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — Marketing/public landing components in `src/components/shared/`; RSC pattern; No Redux/Zustand; `~` import alias; TypeScript strict mode NFR-M1; Smooth scroll/parallax is progressive enhancement; Component naming: PascalCase; No file/module creation outside project-e-course/; Server Actions not needed for static marketing content]
- [Source: `_bmad-output/implementation-artifacts/6-2-hero-section-and-primary-conversion-cta.md` — Physical root `project-e-course/`; Section IDs established: id="value", id="highlights", id="trust", id="pricing-cta", id="footer" are PLACEHOLDER sections awaiting this story; Fonts Playfair_Display + Inter already loaded in page.tsx; Button component at `~/components/ui/button`; RSC extraction threshold ~60-80 lines; vitest + @testing-library/react test pattern; File list from 6.2: page.tsx already has LandingHero rendering; landing-hero.test.tsx is canonical test reference]
- [Source: `project-e-course/src/app/page.tsx` — Current state: PublicNavbar + LandingHero rendered; 4 dashed-border placeholder sections + footer are the TARGET of this story; section id="value/highlights/trust/pricing-cta/footer" all present and must be populated]
- [Source: Git log — Most recent commit `246e293` is Story 6.2 hero completion; conventional kebab-case filenames, PascalCase components, vitest co-located tests; no motion libraries installed yet (Story 6.4 scope)]

## Dev Agent Record

### Agent Model Used

cliproxy/gpt-5.4

### Debug Log References

- Replaced landing page placeholders in `project-e-course/src/app/page.tsx` with extracted RSC marketing sections and a real footer while preserving section ids.
- Added static landing section components for value proposition, highlights, trust, and pricing CTA under `project-e-course/src/components/shared/`.
- Added co-located vitest component coverage for all extracted sections and verified CTA destinations for `/courses` and `/pricing`.
- Fixed footer navigation lint findings by switching internal anchors/routes from `<a>` to `next/link` `Link`.

### Completion Notes List

- Implemented `LandingValueSection` with three EdTech-focused benefit cards, icon accents, dark-mode-safe card styling, and Playfair editorial heading.
- Implemented `LandingHighlightsSection` with three dummy course cards, chapter/lesson/access badges, and a browse CTA to `/courses`.
- Implemented `LandingTrustSection` with accessible social proof stats, testimonial cards, and hardcoded MVP trust content.
- Implemented `LandingPricingCTA` with inviting premium messaging plus primary `/pricing` and secondary `/courses` CTAs.
- Replaced the footer placeholder with Seefluencer brand, tagline, and valid internal navigation links.
- Validation passed: `npx vitest run`, `npm test`, and `npm run lint`.

### File List

- project-e-course/src/app/page.tsx
- project-e-course/src/components/shared/landing-value-section.tsx
- project-e-course/src/components/shared/landing-value-section.test.tsx
- project-e-course/src/components/shared/landing-highlights-section.tsx
- project-e-course/src/components/shared/landing-highlights-section.test.tsx
- project-e-course/src/components/shared/landing-trust-section.tsx
- project-e-course/src/components/shared/landing-trust-section.test.tsx
- project-e-course/src/components/shared/landing-pricing-cta.tsx
- project-e-course/src/components/shared/landing-pricing-cta.test.tsx

### Change Log

- 2026-03-10: Replaced landing marketing placeholders with static trust-building sections, pricing bridge CTA, footer navigation, and component test coverage for Story 6.3.
