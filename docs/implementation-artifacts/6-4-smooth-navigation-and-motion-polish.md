# Story 6.4: Smooth Navigation & Motion Polish

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a visitor,
I want the landing page to feel modern and smooth,
so that the browsing experience feels memorable without becoming distracting.

## Acceptance Criteria

1. **Given** I interact with landing page navigation links (Home → `#hero`, Courses, Pricing)
   **When** I click a nav anchor or CTA
   **Then** the page scrolls smoothly to the target section without a jarring jump (FR29)

2. **Given** I scroll down the landing page
   **When** motion effects trigger on section entry
   **Then** smooth progress-reveal animations (fade-in, slide-up) may enhance sections as they enter the viewport — these are additive, never blocking (FR29)

3. **Given** motion enhancements are applied
   **When** I view the page on any device
   **Then** motion remains subtle, accessible, and responsive — no layout shift, no blocking of core content (NFR-P1, WCAG AA)

4. **Given** a user has `prefers-reduced-motion: reduce` set in their OS/browser
   **When** they load the landing page
   **Then** all decorative motion effects are suppressed; content is readable without any animation (WCAG AA, architecture mandate)

5. **Given** any advanced effect (e.g., parallax, lightweight 3D ornament, scroll-driven gradient)
   **When** it is implemented
   **Then** it is treated as progressive enhancement — the page is fully usable and all CTAs are accessible even if the animation library fails or is blocked (FR29)

6. **Given** motion polish is applied to the landing page
   **When** I run the page through Lighthouse
   **Then** the public page performance target NFR-P1 (< 2.5s initial load on 4G) is not violated — animation JS must be lightweight or deferred

7. **Given** all previous section IDs exist (`#hero`, `#value`, `#highlights`, `#trust`, `#pricing-cta`, `#footer`)
   **When** motion enhancements are applied
   **Then** no existing `id` attributes are removed or renamed — all anchor navigation remains intact (dependency constraint from Story 6.1–6.3)

## Tasks / Subtasks

- [x] **Implement smooth scrolling behavior for anchor navigation** (AC: 1, 3, 7)
  - [x] Add `scroll-behavior: smooth` to the root `html` element in `project-e-course/src/app/globals.css` (or verify it is already set)
  - [x] Alternatively, use `scrollIntoView({ behavior: 'smooth' })` in a client component if CSS-only smooth scroll doesn't work with Next.js App Router hydration
  - [x] Verify that existing navbar anchor links (`href="#hero"`, `href="#value"` etc.) in `PublicNavbar` scroll smoothly
  - [x] Verify footer links (Home → `/#hero`, Courses → `/courses`, Pricing → `/pricing`) do not break

- [x] **Add scroll-triggered reveal animations for marketing sections** (AC: 2, 3, 4, 5, 6)
  - [x] Choose approach: CSS `@keyframes` + Intersection Observer (zero-dependency, recommended for performance) OR Framer Motion `motion.div` with `whileInView` (already in ecosystem if installed, otherwise evaluate bundle cost)
  - [x] Implement fade-in + subtle slide-up (`translateY(20px) → 0`) for these sections on viewport entry:
    - `<section id="value">` → `LandingValueSection`
    - `<section id="highlights">` → `LandingHighlightsSection`
    - `<section id="trust">` → `LandingTrustSection`
    - `<section id="pricing-cta">` → `LandingPricingCTA`
  - [x] Animation duration ≤ 300ms (per UX spec accessibility constraint)
  - [x] `ease-out` or `cubic-bezier` easing for natural feel — avoid `linear` or `ease-in`
  - [x] Each section animates independently (staggered ~80ms between sections for elegance)

- [x] **Implement `prefers-reduced-motion` suppression** (AC: 4, 5)
  - [x] Wrap all animation-triggering classes with `motion-safe:` Tailwind prefix OR use a CSS `@media (prefers-reduced-motion: reduce)` block in `globals.css` to disable transitions/animations
  - [x] If using Framer Motion: wrap with `AnimatePresence` + check `useReducedMotion()` hook to disable
  - [x] Manual verification: OS accessibility setting "Reduce Motion" → all animations should disappear, content remains fully visible

- [x] **Optional: Add parallax or scroll-driven hero enhancement** (AC: 2, 3, 4, 5, 6) _(treat as progressive enhancement)_
  - [x] If parallax is added to hero blobs (established in Story 6.2 as `pointer-events-none absolute` layers), use CSS `transform: translateY()` driven by scroll position via a lightweight `scroll` event listener in a `'use client'` component
  - [x] Do NOT add three.js or heavy 3D libraries — budget constraint (NFR-P1). Lightweight CSS 3D via `transform: perspective()` + `rotateX/Y` on hover for cards is acceptable
  - [x] If Framer Motion is already installed, `useScroll` + `useTransform` is preferred over raw scroll listeners for cleanup safety

- [x] **Verify no performance regression** (AC: 6)
  - [x] Run `npm run build && npm run start` in `project-e-course/`
  - [x] Open Lighthouse (Chrome DevTools) on `/` and verify Performance score is not significantly degraded vs pre-story baseline
  - [x] Ensure any added `'use client'` boundary is minimal and does not force client rendering of RSC sections

- [x] **Write/update component tests** (AC: all)
  - [x] If a new `LandingMotionWrapper` or `useScrollReveal` hook is extracted, create co-located test file
  - [x] Test pattern: same as `landing-hero.test.tsx` — render without crash + snapshot or aria check
  - [x] If using CSS-only approach (no new components), skip test and document the CSS approach in Dev Notes

## Dev Notes

### 🔴 Critical: Physical Project Root

**ALL source files live under `project-e-course/`**. The `package.json`, `next.config.ts`, and `globals.css` are at `project-e-course/`. Always prefix ALL file paths with `project-e-course/`. Never create or modify files at the `hiring-seefluencer/src/` level.

### 🔴 Critical: Section IDs MUST NOT Change

The following `id` attributes are **anchor targets** used by `PublicNavbar` and the footer, established across Stories 6.1–6.3. They must not be renamed, removed, or restructured:

```
id="hero"        ← Hero section (LandingHero component)
id="value"       ← Value Proposition (LandingValueSection)
id="highlights"  ← Course Highlights (LandingHighlightsSection)
id="trust"       ← Trust / Social Proof (LandingTrustSection)
id="pricing-cta" ← Pricing Bridge (LandingPricingCTA)
id="footer"      ← Footer
```

Do **not** modify `PublicNavbar` or `LandingHero` components — these are complete from Stories 6.1 and 6.2.

### 🔴 Critical: Motion is Progressive Enhancement — Never a Dependency

Per architecture mandate and FR29:

- The page MUST be **fully readable and navigable** even if JavaScript is disabled or the animation library fails.
- Never put core content inside an animation wrapper that hides it before JS runs.
- Pattern to follow: Content renders normally → animation is layered on top via `opacity: 1` default → JS only adds the `entering` class that triggers the animation.

**Safe pattern (CSS + Intersection Observer):**

```tsx
// DO THIS — content always visible, animation enhances
<section id="value" className="opacity-100 transition-all duration-300 ease-out data-[entering]:translate-y-5 data-[entering]:opacity-0">
  ...
</section>

// DON'T DO THIS — content hidden until JS runs
<motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
  ...
</motion.section>
```

### 🔴 Critical: Do NOT Add Heavy Libraries for This Story

- ❌ **No three.js** — too heavy for this MVP performance budget
- ❌ **No GSAP** — license/bundle cost not justified for MVP
- ❌ **No AOS (Animate on Scroll)** — global mutation observer overhead

**Acceptable approaches (in order of preference):**

1. **CSS + `@keyframes` + Intersection Observer** (zero bundle cost, safest)
2. **Framer Motion** — ONLY if already installed in `package.json`. Check first with `cat project-e-course/package.json | grep framer`.
3. **Tailwind `animate-` utilities** + `transition` classes (for simple fade/slide)

### 🔴 Critical: Reduced Motion Compliance is Mandatory

Per WCAG AA, architecture enforcement rules, and UX spec (motion ≤ 300ms):

```css
/* In globals.css — must be present */
@media (prefers-reduced-motion: reduce) {
	*,
	*::before,
	*::after {
		animation-duration: 0.01ms !important;
		animation-iteration-count: 1 !important;
		transition-duration: 0.01ms !important;
		scroll-behavior: auto !important;
	}
}
```

If using Framer Motion: check `useReducedMotion()` hook and set `transition={{ duration: 0 }}` when true.

### 🔵 Smooth Scroll Implementation — CSS vs Next.js

The simplest implementation is:

```css
/* project-e-course/src/app/globals.css */
html {
	scroll-behavior: smooth;
}
```

**Caveat with Next.js App Router:** `scroll-behavior: smooth` on `html` may conflict with Next.js's native `router.push()` scroll restoration. Test carefully. If anchor links (same-page `href="#hero"`) work but cross-page transitions feel sluggish, consider scoping `scroll-behavior: smooth` only to the landing page root `div`.

**Alternative (client component):**

```tsx
// project-e-course/src/components/shared/smooth-scroll-provider.tsx
'use client';
import { useEffect } from 'react';

export function SmoothScrollProvider() {
	useEffect(() => {
		document.documentElement.style.scrollBehavior = 'smooth';
		return () => {
			document.documentElement.style.scrollBehavior = 'auto';
		};
	}, []);
	return null;
}
```

Include it in `page.tsx` above the page content so it mounts only on the landing route.

### 🔵 Scroll-Reveal Pattern — Intersection Observer (Recommended)

If using CSS + Intersection Observer (no library):

```tsx
// project-e-course/src/components/shared/scroll-reveal.tsx
'use client';
import { useEffect, useRef, type ReactNode } from 'react';

interface ScrollRevealProps {
	children: ReactNode;
	className?: string;
	delay?: number; // ms stagger delay
}

export function ScrollReveal({ children, className = '', delay = 0 }: ScrollRevealProps) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setTimeout(() => {
						el.classList.remove('opacity-0', 'translate-y-5');
						el.classList.add('opacity-100', 'translate-y-0');
					}, delay);
					observer.unobserve(el);
				}
			},
			{ threshold: 0.1 },
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [delay]);

	return (
		<div
			ref={ref}
			className={`opacity-0 translate-y-5 transition-all duration-300 ease-out ${className}`}
		>
			{children}
		</div>
	);
}
```

**Usage in `page.tsx`:**

```tsx
<ScrollReveal delay={0}>
  <LandingValueSection />
</ScrollReveal>
<ScrollReveal delay={80}>
  <LandingHighlightsSection />
</ScrollReveal>
<ScrollReveal delay={160}>
  <LandingTrustSection />
</ScrollReveal>
<ScrollReveal delay={240}>
  <LandingPricingCTA />
</ScrollReveal>
```

> **Note:** `ScrollReveal` is a `'use client'` wrapper — the child RSC components remain RSCs. The wrapper only adds behavior, not rendering logic.

### 🔵 Framer Motion Alternative (Only if Already Installed)

First verify: `cat project-e-course/package.json | grep framer-motion`

If installed:

```tsx
'use client'
import { motion, useReducedMotion } from 'framer-motion'

const shouldReduceMotion = useReducedMotion()

const variants = {
  hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
  visible: { opacity: 1, y: 0 },
}

<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.1 }}
  transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: 'easeOut' }}
  variants={variants}
>
  <LandingValueSection />
</motion.div>
```

### 🔵 Architecture Zone Rules — Motion Only in Landing Zone

Per architecture zone-based rules:
| Zone | Animation Policy |
|------|-----------------|
| Landing (`/`) | Smooth scroll, section reveal, optional parallax — **THIS STORY** |
| App Zone (`/courses`, `/learn/*`) | No decorative animations, skeleton loaders only |
| Admin Zone (`/admin/*`) | No animations at all, pure utility |

Do NOT add motion polish to any route outside of `project-e-course/src/app/page.tsx`.

### 🔵 Hero Blob Parallax (Optional Enhancement)

The hero in `LandingHero` has organic blob backgrounds (established in Story 6.2) as `pointer-events-none absolute` `div`s with `blur-3xl`. These can be given a subtle parallax effect:

```tsx
// In LandingHero — requires 'use client' conversion of just the blob layer
'use client';
import { useEffect, useState } from 'react';

function ParallaxBlob({ children, factor = 0.3 }: { children: ReactNode; factor?: number }) {
	const [offset, setOffset] = useState(0);

	useEffect(() => {
		const handleScroll = () => setOffset(window.scrollY * factor);
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, [factor]);

	return <div style={{ transform: `translateY(${offset}px)` }}>{children}</div>;
}
```

> **Warning:** Only apply this if `LandingHero` can be split so the content remains RSC while the blob layer becomes a `'use client'` sub-component. Don't convert the entire `LandingHero` to client component just for parallax.

### 🔵 Design Token Reference — Animation Budget

Per UX spec and WCAG AA:
| Token | Value | Notes |
|-------|-------|-------|
| Max animation duration | `300ms` | Hard cap per UX spec |
| Easing | `ease-out` / `cubic-bezier(0.0, 0.0, 0.2, 1)` | Material-style ease — feels natural |
| Reveal translate offset | `translateY(20px) → 0` | Subtle lift, not dramatic slide |
| Stagger between sections | `~80ms` | Creates cascade feel without delay |
| Parallax factor | `0.1–0.3` (of scroll offset) | Barely perceptible, not distracting |
| Scroll behavior | `smooth` | CSS or JS, scope to landing only |

### 🔵 Files Expected to Touch / Create

| File                                                                | Action                                                                 |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `project-e-course/src/app/globals.css`                              | Add `scroll-behavior: smooth` + `prefers-reduced-motion` block         |
| `project-e-course/src/app/page.tsx`                                 | Wrap marketing sections in `ScrollReveal` + add `SmoothScrollProvider` |
| `project-e-course/src/components/shared/scroll-reveal.tsx`          | Create (if Intersection Observer approach chosen)                      |
| `project-e-course/src/components/shared/scroll-reveal.test.tsx`     | Create (render test)                                                   |
| `project-e-course/src/components/shared/smooth-scroll-provider.tsx` | Create (optional, if CSS approach conflicts)                           |

> **Do NOT modify:** `PublicNavbar`, `LandingHero`, `LandingValueSection`, `LandingHighlightsSection`, `LandingTrustSection`, `LandingPricingCTA` — only wrap them, never edit them for this story.

### 🔵 Previous Story Intelligence

From Story 6.3 (last completed story) dev record:

- All marketing section components are extracted RSCs: `LandingValueSection`, `LandingHighlightsSection`, `LandingTrustSection`, `LandingPricingCTA`
- All are located at `project-e-course/src/components/shared/landing-*.tsx`
- Section IDs confirmed present: `id="value"`, `id="highlights"`, `id="trust"`, `id="pricing-cta"`, `id="footer"`
- The `id` attributes on sections are used for anchor navigation from `PublicNavbar` — **do not remove**
- Test pattern established: `@testing-library/react` render + vitest, co-located test files
- No motion libraries were installed in Story 6.3 — check `package.json` before assuming Framer Motion is available
- Story 6.4 explicitly noted in 6.3 as "will add motion polish on top of these components"
- Story 6.5 (next) will verify responsive/accessible correctness — so this story must not break responsive structure

### 🔵 Story 6.5 Consideration (Don't Pre-Implement, But Don't Break)

Story 6.5 will validate responsive behavior and accessibility. Ensure:

- All new elements added in this story have proper `aria-hidden="true"` on purely decorative animation wrappers
- No `overflow: hidden` that clips content on mobile (common animation mistake)
- No `position: fixed` or `z-index` side effects from parallax that obscure content on small screens

### Project Structure Notes

- Primary file: `project-e-course/src/app/page.tsx` (wrap sections with motion)
- Secondary: `project-e-course/src/app/globals.css` (CSS scroll-behavior + reduced-motion)
- New components (if needed): `project-e-course/src/components/shared/scroll-reveal.tsx`, `smooth-scroll-provider.tsx`
- No new routes, no database changes, no Server Actions
- Animation is 100% client-side progressive enhancement
- Section IDs from 6.1–6.3 must remain untouched

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 6.4 ACs: smooth scrolling, parallax, progress-reveal, lightweight 3D as progressive enhancement; motion must not block rendering, harm usability, or violate NFR-P1 or WCAG AA; FR29 explicit allowance for motion enhancements]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — Motion Guardrails: smooth scroll/parallax/progress-reveal allowed; motion must not reduce readability or cover CTAs; max animation duration 300ms; reduced-motion friendly required; Design token: Coral→Purple→Teal gradient for hero zone only; no motion outside landing zone]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — All AI agents must treat smooth scroll/parallax/3D as progressive enhancement; reduced-motion friendly behavior and WCAG AA must be maintained for public landing route `/`; components in `src/components/shared/`; RSC-first pattern; `'use client'` only when interactivity is required]
- [Source: `_bmad-output/implementation-artifacts/6-3-marketing-sections-for-discovery-and-trust.md` — File list: all 4 marketing sections extracted as RSCs; section IDs confirmed; no motion library installed in Story 6.3; Story 6.4 explicitly scoped to motion polish layer on top; Story 6.5 follows for responsive/accessibility validation]
- [Source: `_bmad-output/implementation-artifacts/6-2-hero-section-and-primary-conversion-cta.md` — Physical project root `project-e-course/`; blob backgrounds are `pointer-events-none absolute blur-3xl` layers in hero; Fonts Playfair_Display + Inter already loaded; vitest co-located test pattern]
- [Source: `_bmad-output/planning-artifacts/prd.md` — FR29: Landing page boleh menyertakan smooth scrolling, parallax, progress-reveal interactions, atau lightweight 3D enhancements selama target accessibility, responsiveness, dan performa halaman publik tetap terjaga; NFR-P1: Initial Page Load < 2.5s pada 4G]

## Dev Agent Record

### Agent Model Used

cliproxy/gpt-5.4

### Debug Log References

- `npm exec vitest run src/components/shared/hero-parallax-accent.test.tsx src/components/shared/scroll-reveal.test.tsx src/components/shared/landing-hero.test.tsx src/components/shared/public-navbar.test.tsx src/components/shared/landing-value-section.test.tsx src/components/shared/landing-highlights-section.test.tsx src/components/shared/landing-trust-section.test.tsx src/components/shared/landing-pricing-cta.test.tsx`
- `npm exec vitest run`
- `npm test`
- `npm run lint`
- `npm run build`

### Completion Notes List

- Implemented landing-page smooth scrolling at the root stylesheet level and preserved existing navbar/footer anchor targets without renaming section IDs.
- Added `ScrollReveal` progressive-enhancement wrapper for `#value`, `#highlights`, `#trust`, and `#pricing-cta` with 300ms max reveal timing, cubic-bezier easing, and 80ms stagger increments while keeping section content visible before JS enhancement.
- Added `prefers-reduced-motion` suppression in global CSS and in client-side motion helpers so decorative effects stay disabled when reduced motion is requested.
- Added `HeroParallaxAccent` as a lightweight, aria-hidden hero enhancement using passive scroll listeners and bounded transforms without converting `LandingHero` itself to a client component.
- Added co-located vitest coverage for the new motion helpers and fixed pre-existing type issues in build-critical payment/db/test support files so `npm run build`, `npm exec vitest run`, and `npm test` pass.

### File List

- `project-e-course/drizzle.config.ts`
- `project-e-course/src/app/api/webhooks/midtrans/route.ts`
- `project-e-course/src/app/page.tsx`
- `project-e-course/src/components/shared/hero-parallax-accent.test.tsx`
- `project-e-course/src/components/shared/hero-parallax-accent.tsx`
- `project-e-course/src/components/shared/scroll-reveal.test.tsx`
- `project-e-course/src/components/shared/scroll-reveal.tsx`
- `project-e-course/src/components/student/quiz-engine.test.tsx`
- `project-e-course/src/server/actions/payments/initiate-checkout.ts`
- `project-e-course/src/server/db/index.ts`
- `project-e-course/src/setup-tests.ts`
- `project-e-course/src/styles/globals.css`

## Change Log

- 2026-03-10: Added smooth scrolling, progressive scroll-reveal motion, reduced-motion safeguards, lightweight hero parallax accent, and supporting tests/build-fix updates for landing page motion polish.
