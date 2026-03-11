# Story 7.3: /pricing Public Marketing Surface Redesign

Status: done

## Story

As a visitor or authenticated user,
I want to access the pricing page without being forced to log in first,
So that I can evaluate subscription plans and make a purchase decision independently of my auth state.

## Acceptance Criteria

1. **[Guest Access — Critical Bug Fix]**
   Given I am an unauthenticated visitor navigating to `/pricing`
   When the page renders
   Then I see the full pricing page content WITHOUT being redirected to `/login`
   And the plan cards display price, duration, benefits, and CTA clearly

2. **[Public-Zone Visual Treatment]**
   Given the pricing page is rendered
   When I view the layout
   Then the page uses the approved public-zone dark surface tokens: `bg-[#0F0F14]`, card `bg-[#1A1A24]`
   And display typography uses Fraunces or Playfair Display for hero/price headings
   And body text uses Inter with tight tracking (`-0.02em`)
   And CTA buttons use Indigo `#6366F1` / Violet `#8B5CF6` accent colors
   And a gradient accent treatment (Coral `#FF6B6B` → Purple `#9B59B6` → Teal `#1ABC9C`) is applied consistently with other public-zone pages

3. **[Trust / Conversion Section]**
   Given I scroll down the pricing page
   When I review the full page content
   Then a trust or value reinforcement section is visible below the plan cards
   And it supports conversion intent (e.g., FAQ, feature comparison, guarantee statement, or social proof)

4. **[Guest → Auth Flow for Checkout]**
   Given I am unauthenticated and click a subscribe/checkout CTA on a plan card
   When checkout initiation is triggered (which requires an account)
   Then I am directed to the login/register page with clear context that auth is only required to complete checkout
   And after logging in I am returned to `/pricing` (or the checkout flow) without losing plan context

5. **[Authenticated Checkout — No Regression]**
   Given I am authenticated and click a subscribe CTA on a plan card
   When I continue with purchase intent
   Then the existing Midtrans Snap.js checkout flow opens correctly (Story 4.3 behavior preserved)
   And no regression is introduced to payment initiation or webhook processing (Story 4.4)

6. **[Session-Aware Navbar]**
   Given the pricing page is rendered
   When I view the navbar
   Then the public navbar shows the signed-in user profile name if a session exists
   And shows an auth CTA (Login / Get Started) if no session exists
   And the navbar is consistent with the public navbar on `/`, `/courses`, and `/courses/[slug]`

## Tasks / Subtasks

- [x] **Task 1: Fix auth guard / middleware to allow public access to `/pricing`** (AC: #1)
  - [x] 1.1 Locate middleware or layout auth guard that currently redirects unauthenticated users away from `/pricing`
  - [x] 1.2 Remove or condition the auth guard so `/pricing` is publicly accessible (no redirect for unauthenticated visitors)
  - [x] 1.3 Verify that protected routes (admin, lesson view, etc.) are NOT accidentally opened — only `/pricing` is being unblocked
  - [x] 1.4 Test: visit `/pricing` in incognito/logged-out state → must render page content, NOT redirect to `/login`

- [x] **Task 2: Redesign `/pricing` page with public-zone visual treatment** (AC: #2, #3)
  - [x] 2.1 Apply dark surface tokens: page bg `#0F0F14`, card bg `#1A1A24`, dark card border `#2A2A3C`
  - [x] 2.2 Add page hero/header section using Fraunces or Playfair Display (matching `/` hero typography treatment)
  - [x] 2.3 Apply Coral → Purple → Teal gradient accent in hero section (consistent with `/`, `/courses`, `/courses/[slug]`)
  - [x] 2.4 Style plan cards with premium dark-surface card tokens (see Dev Notes for token details)
  - [x] 2.5 Style CTA buttons using Indigo `#6366F1` primary / Violet `#8B5CF6` hover
  - [x] 2.6 Add trust/conversion section below plan cards (FAQ, value bullets, feature comparison, or guarantee — dummy data acceptable)
  - [x] 2.7 Ensure Inter tight tracking on body text, badges, and plan feature lists

- [x] **Task 3: Implement session-aware CTA logic** (AC: #4, #5, #6)
  - [x] 3.1 Plan cards: detect session state in the component (Server Component `getServerSession` or Client Component `useSession`)
  - [x] 3.2 If unauthenticated → CTA redirects to `/login?callbackUrl=/pricing` (or `/register`) with clear label (e.g., "Login to Subscribe")
  - [x] 3.3 If authenticated → CTA triggers existing Midtrans checkout Server Action (reuse from Story 4.3 — do NOT reinvent)
  - [x] 3.4 Validate `callbackUrl` redirect works: login → return to `/pricing` without losing context

- [x] **Task 4: Integrate public navbar** (AC: #6)
  - [x] 4.1 Confirm the pricing page uses the shared `PublicNavbar` component (from `src/components/shared/`)
  - [x] 4.2 Navbar must render signed-in profile state vs auth CTA correctly (consistent with `/` behavior)
  - [x] 4.3 Ensure mobile navbar collapse behavior is preserved

- [x] **Task 5: Regression testing** (AC: #5)
  - [x] 5.1 Test authenticated checkout flow end-to-end: pricing → Midtrans Snap popup opens
  - [x] 5.2 Confirm webhook (Story 4.4) is not affected
  - [x] 5.3 Confirm existing Epic 1–6 routes are unaffected by auth guard changes

## Dev Notes

### 🚨 CRITICAL: The Bug Being Fixed

The current implementation redirects unauthenticated visitors from `/pricing` to `/login`. This is a **bug** caused by FR16 originally stating "pengguna terautentikasi" — the implementor treated `/pricing` as an authenticated billing page.

**Root cause location to check first:**
- `src/middleware.ts` — check if `/pricing` is listed in protected routes (it must NOT be)
- `src/app/(student)/pricing/page.tsx` or equivalent layout — check if there is a server-side session guard or redirect
- Any route group layout (`layout.tsx`) that wraps `/pricing` — if pricing is under a route group with a shared auth guard, it must be moved to a public route group or the guard must be scoped to exclude `/pricing`

**Architecture constraint (architecture.md — Explicit Route Protection Matrix):**
```
Public routes (NO auth guard, render for all visitors):
  /pricing → public pricing and conversion surface

Critical clarification: /pricing MUST remain publicly accessible.
Session-aware rendering is allowed for contextual CTA behavior,
but the route must NEVER redirect unauthenticated visitors away from pricing content.
```

---

### Existing Checkout Implementation to PRESERVE (Story 4.3)

Do NOT reinvent the checkout flow. Story 4.3 implemented Midtrans Snap.js. The existing Server Action for creating a Midtrans transaction is in `src/server/actions/payments/`. The plan CTA for authenticated users must call this existing action.

**What must NOT break:**
- `POST /api/webhooks/midtrans` — anonymous webhook endpoint; do not touch
- The Midtrans `snap.js` popup sequence
- Subscription `status: 'active'` + `endDate` write from Story 4.4

---

### Public Zone Design Tokens

These tokens are established on `/` (landing page) and must be applied consistently:

| Token | Value | Usage |
|---|---|---|
| Page bg (dark) | `#0F0F14` | `bg-[#0F0F14]` on page wrapper |
| Card bg (dark) | `#1A1A24` | plan cards background |
| Card border (dark) | `#2A2A3C` | `border border-[#2A2A3C]` |
| Gradient start | Coral `#FF6B6B` | hero gradient / accent treatment |
| Gradient mid | Purple `#9B59B6` | gradient middle stop |
| Gradient end | Teal `#1ABC9C` | gradient end stop |
| Primary CTA | Indigo `#6366F1` | `bg-indigo-600` or `bg-[#6366F1]` |
| Hover CTA | Violet `#8B5CF6` | `hover:bg-violet-500` or `hover:bg-[#8B5CF6]` |
| Display font | Fraunces / Playfair Display | Hero heading, price display |
| Body font | Inter `-0.02em` | Body text, plan features |

---

### File Structure

Follow the architecture.md project structure:

```
src/
├── app/
│   ├── (student)/          ← pricing may live here OR in a public route group
│   │   └── pricing/
│   │       └── page.tsx    ← This is the page to redesign
│   └── (public)/           ← Alternatively if a public route group exists
│       └── pricing/
├── components/
│   ├── shared/
│   │   └── PublicNavbar    ← Use this shared navbar
│   └── student/            ← Or a new public/ folder for pricing components
├── server/
│   └── actions/
│       └── payments/       ← Existing checkout Server Action lives here — REUSE it
└── middleware.ts            ← Fix auth guard here first
```

**Naming conventions:**
- Component files: `PascalCase.tsx` (e.g., `PricingHero.tsx`, `PlanCard.tsx`)
- Route paths: `kebab-case` (`/pricing`)
- Server actions: `camelCase` function names

---

### Session Detection Pattern

The pricing page must detect session state without blocking render. Recommended pattern:

**Option A (Server Component — preferred for SEO):**
```tsx
// src/app/.../pricing/page.tsx
import { getServerAuthSession } from "@/server/auth";

export default async function PricingPage() {
  const session = await getServerAuthSession();
  const isAuthenticated = !!session?.user;
  // Pass isAuthenticated as prop to client plan card component
}
```

**Option B (Client Component for CTA only):**
```tsx
"use client";
import { useSession } from "next-auth/react";

// Only in the CTA button component — not the full page
const { data: session } = useSession();
```

**Preferred:** Use Option A for the page shell (SSR, fast, no flash), and pass `isAuthenticated` as a prop to the CTA button component. Do NOT wrap the entire page in `"use client"`.

---

### Guest → Auth Redirect Pattern

When an unauthenticated user clicks a subscribe CTA:
```
/login?callbackUrl=/pricing
```
After login, NextAuth's built-in `callbackUrl` handling will return the user to `/pricing`. This is already supported by the existing NextAuth setup (Story 1.3). No custom redirect logic is needed — just use `callbackUrl`.

---

### Pricing Data Source

Plans are stored in the `plans` table (Drizzle schema):
```
Plans
├── id, name, description, price, duration, features (jsonb)
```

Fetch plans server-side in `page.tsx` using Drizzle directly (no Server Action needed for reads):
```tsx
const plans = await db.query.plans.findMany();
```

If no plans exist in the database yet (seed data), use dummy/hardcoded data as fallback for display — but the DB fetch should be the primary path.

---

### Trust Section Content

The trust/conversion section may use dummy data. Suggested content approaches:
- Feature comparison table (Free vs Premium)
- 3–4 value bullets ("Learn at your own pace", "Premium video lessons", etc.)
- FAQ accordion (shadcn `Accordion` component)
- Guarantee statement ("Cancel anytime")

Keep it lightweight — this is MVP, not a full marketing site.

---

### Skeleton Loaders

Per NFR-U2: show skeleton loaders while plan data is loading, not a blank screen. Use shadcn `Skeleton` component for plan card placeholders.

---

### Accessibility & Responsive Requirements

- Mobile-first responsive layout (NFR-U1): plan cards should stack on mobile, side-by-side on desktop
- Minimum touch targets: 44×44px for CTA buttons (WCAG AA)
- Color contrast: Indigo/Violet CTAs on dark bg must meet 4.5:1 contrast ratio
- Focus rings: use shadcn default `ring-indigo-500` visible focus state

---

### Anti-Patterns to Avoid

- ❌ Do NOT create a new checkout Server Action — reuse the existing one in `server/actions/payments/`
- ❌ Do NOT use `redirect()` inside the pricing page for unauthenticated users — the page must render for all visitors
- ❌ Do NOT wrap the entire page in `"use client"` — SSR the page shell for performance and SEO
- ❌ Do NOT use a generic spinner — use shadcn skeleton loaders
- ❌ Do NOT put auth guard in middleware for `/pricing` — it belongs to the public route matrix
- ❌ Do NOT use modal-heavy paywall flows on this page — this is a pure marketing surface, not a paywall interception

### Project Structure Notes

- The public zone design language is already established and working on `/` (landing page). Before implementing, inspect `src/app/page.tsx` (or the landing page route) and the components it uses to understand the exact Tailwind class patterns, gradient implementation, and typography setup. **The landing page is the visual benchmark — match its public zone feel.**
- The `PublicNavbar` component in `src/components/shared/` must be shared. Do not create a new navbar for the pricing page.
- If `/pricing` is currently inside a route group that applies an auth layout (e.g., `(student)` with a session-required layout), consider whether it should be moved to a separate `(public)` route group alongside `/courses` and `/courses/[slug]`.

### References

- FR16 (updated): [Source: _bmad-output/planning-artifacts/prd.md#6.4]
- Route Protection Matrix: [Source: _bmad-output/planning-artifacts/architecture.md#Explicit-Route-Protection-Matrix]
- Public Zone Design Tokens: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Color-System]
- Typography System: [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Typography-System]
- Story 4.2 (Pricing & Subscription Selection): [Source: _bmad-output/planning-artifacts/epics.md#Story-4.2]
- Story 4.3 (Midtrans Checkout): [Source: _bmad-output/planning-artifacts/epics.md#Story-4.3]
- Story 4.4 (Webhook): [Source: _bmad-output/planning-artifacts/epics.md#Story-4.4]
- Story 7.3 definition: [Source: _bmad-output/planning-artifacts/epics.md#Story-7.3]
- Epic 7 objective: [Source: _bmad-output/planning-artifacts/epics.md#Epic-7]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4.6 (Bob — Scrum Master, Create Story workflow)

### Debug Log References

- `npx vitest run "src/middleware.test.tsx" "src/components/student/pricing-page-client.test.tsx" "src/app/(student)/pricing/page.test.tsx" "src/app/(student)/public-route-layout.test.tsx" "src/components/shared/public-navbar.test.tsx"`
- `npm run lint`
- `npm run typecheck`
- `npx vitest run`

### Completion Notes List

Ultimate context engine analysis completed - comprehensive developer guide created

- Removed guest redirect from `src/app/(student)/pricing/page.tsx`; `/pricing` now renders for all visitors and only resolves active subscription state when a session exists.
- Rebuilt `/pricing` as a public marketing surface using approved dark tokens, Playfair display typography, gradient accents, premium plan cards, fallback plans, and a trust/FAQ reinforcement section aligned with `/`.
- Preserved authenticated Midtrans checkout by reusing `initiateMidtransCheckout`; guest CTAs now use `Login to Subscribe` with `callbackUrl=/pricing?plan={id}` plan context.
- Updated login flow to honor `callbackUrl`, keeping guest users on the intended pricing context after authentication.
- Kept shared `PublicNavbar` shell intact and aligned guest auth CTAs to `Login` / `Get Started` across desktop and mobile states.
- Verified no middleware expansion opened protected routes; `matcher` still protects only `/admin/:path*`, `/courses/:path*`, and `/profile/:path*`.

### File List

- `project-e-course/src/app/(student)/pricing/page.tsx`
- `project-e-course/src/app/(student)/pricing/page.test.tsx`
- `project-e-course/src/app/(student)/pricing/loading.tsx`
- `project-e-course/src/components/student/pricing-page-client.tsx`
- `project-e-course/src/components/student/pricing-page-client.test.tsx`
- `project-e-course/src/components/student/pricing-page-skeleton.tsx`
- `project-e-course/src/components/shared/login-form.tsx`
- `project-e-course/src/app/(auth)/login/page.tsx`
- `project-e-course/src/components/shared/public-navbar-content.tsx`
- `project-e-course/src/components/shared/public-mobile-menu.tsx`
- `project-e-course/src/components/shared/public-navbar.test.tsx`
- `project-e-course/src/middleware.test.tsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/7-3-pricing-public-marketing-surface-redesign.md`

## Change Log

- 2026-03-10: De-gated `/pricing`, redesigned it as a public marketing surface, preserved authenticated Midtrans checkout, and wired login callback return-to-pricing behavior.
