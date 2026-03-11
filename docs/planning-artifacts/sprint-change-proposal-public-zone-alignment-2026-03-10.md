# Sprint Change Proposal
## Public Zone Visual Alignment: /courses, /courses/[slug], /pricing

**Project:** hiring-seefluencer
**Author:** Bob (Scrum Master) / Rio
**Date:** 2026-03-10
**Status:** Proposed — Awaiting Approval
**Scope Classification:** Moderate → Major (mixed)

---

## Section 1: Issue Summary

### Problem Statement

Following the successful completion of all six implementation epics (Epic 1–6), a post-implementation UX audit revealed that three public-facing routes — `/courses`, `/courses/[slug]`, and `/pricing` — do not fully conform to the approved UX Design Direction ("Hybrid Duality" / "The Hybrid Expressive SaaS"). While functional requirements have been met, the *visual and experiential fidelity* to the approved UX specification is incomplete.

The homepage route `/` is fully aligned with the approved direction and serves as the visual reference benchmark for this proposal.

### Discovery Context

- **When:** Post-Epic 6 completion, pre-delivery audit
- **Who:** Rio (project owner), audit findings shared as structured context
- **Method:** Route-by-route visual comparison against `ux-design-specification.md` and `ux-design-directions.html`

### Evidence of Issues

#### `/courses` — Generic catalog, not premium public surface
- Typography does not use Playfair Display / Fraunces for display headings as required by UX spec
- Spacing, border-radius, and visual hierarchy do not reflect the "public surface" treatment defined in the Design System Foundation
- Course cards lack design system card tokens: dark card bg `#1A1A24`, 1px border `#2A2A3C`, proper radius 8–12px
- Empty state treatment likely missing illustration + CTA (violates UX anti-pattern rule: "No Blank Screens")

#### `/courses/[slug]` — Informational, not persuasive
- Page is in the "public zone" but functions as a data display rather than a course landing page
- Lacks above-the-fold primary CTA hierarchy (Enroll/Subscribe/Start)
- Gradient/color treatment not aligned with public zone tokens (Coral → Purple → Teal)
- No trust/social-proof indicators appropriate for a conversion surface

#### `/pricing` — Critical intent misalignment: authenticated billing page vs. public marketing surface
- **Most severe issue:** Page currently redirects unauthenticated guests to `/login` instead of rendering as a publicly accessible marketing page
- This directly contradicts:
  - UX Experience Principle #4: *"App is a Tool, Landing is a Stage"*
  - PRD FR16 intent (pricing as a public discovery surface, not a locked billing utility)
  - The approved Information Architecture that places Pricing as a primary nav destination from the landing page
  - Story 4.2 which describes pricing as a subscription selection page reachable from paywall CTAs (accessible to unauthenticated users)
- The page intent is misclassified: implemented as a utility billing page for authenticated users, but must be a public marketing conversion page

---

## Section 2: Impact Analysis

### 2.1 Epic Impact

| Epic | Status | Impact |
|------|--------|--------|
| Epic 1 (Auth & Identity) | ✅ Done | None — auth zone correctly implemented |
| Epic 2 (Course Catalog & Discovery) | ✅ Done | **Affected** — `/courses` and `/courses/[slug]` visual polish needed |
| Epic 3 (Learning Experience) | ✅ Done | None — learning zone correctly implemented |
| Epic 4 (Subscription & Paywall) | ✅ Done | **Affected** — `/pricing` requires intent redefinition + visual redesign |
| Epic 5 (Admin CMS) | ✅ Done | None — admin zone correctly isolated |
| Epic 6 (Landing Page) | ✅ Done | None — fully aligned, serves as visual benchmark |
| **Epic 7 (Proposed)** | 🆕 New | New epic to contain all public zone alignment stories |

### 2.2 Story Impact

Completed stories with visual/intent gaps — functional behavior is correct, no rollback needed:

| Story | Current Status | Gap |
|-------|---------------|-----|
| 2.1 Course Listing Validation | Done | Visual fidelity — typography, spacing, card design system |
| 2.3 Course Detail & Syllabus View | Done | Missing persuasive CTA layer, conversion-oriented layout |
| 4.2 Pricing & Subscription Selection | Done | Fundamental misclassification — page must be public, not auth-gated |

### 2.3 Artifact Conflicts

#### PRD — Minor Update Required

**FR16** currently reads:
> *"Pengguna **terautentikasi** dapat memuat halaman paket harga (Pricing Card) langganan yang dikomersialkan."*

The word **"terautentikasi"** is the root cause of the misclassification. It implies authenticated-only access, which led to the current gated implementation.

**Required update:** Clarify that `/pricing` is a public marketing page accessible to ALL visitors. Authentication is only required at the moment of initiating checkout (FR17), not for viewing pricing.

#### Architecture — Annotation Required (No Structural Change)

No architecture changes needed for the technical stack. The existing middleware pattern already supports public routing.

**Required annotation:** Add an explicit route protection matrix that clearly identifies `/pricing` as a public route (no auth middleware), consistent with how `/courses` and `/` are handled.

#### UX Specification — No Update Required

The UX spec is already correct and comprehensive. The "Hybrid Duality" direction, color tokens, typography system, and zone-based rules are all properly defined. The gap is in implementation fidelity, not specification completeness.

#### Sprint Status YAML — Update Required

Add Epic 7 entries with all new stories in `backlog` status after proposal approval.

### 2.4 Technical Impact

- **Code changes only** — no database migrations, no API contracts, no schema changes
- `/pricing` de-gating: Remove auth middleware guard for `/pricing` route (or ensure page renders without requiring session)
- Component restyling: Apply correct design tokens (typography, gradients, card borders, spacing) to affected pages
- No deployment pipeline changes required
- Low regression risk — changes are isolated to UI/UX layer

---

## Section 3: Recommended Approach

### Selected Path: Option 1 — Direct Adjustment via New Epic 7

**Rationale:**
- Functional behavior across all epics is correct — no rollback needed or justified
- The issue is exclusively in visual/UX fidelity and one intent misclassification (`/pricing`)
- All corrections can be delivered as focused, independent stories within a new Epic 7
- No disruption to previously completed epics, their retrospective findings, or any existing functionality

### Effort & Risk Assessment

| Route | Classification | Effort | Risk |
|-------|---------------|--------|------|
| `/courses` | Quick Polish + Medium Refactor | Medium | Low |
| `/courses/[slug]` | Medium Refactor | Medium | Low |
| `/pricing` | Major Redesign (intent + visual) | High | Medium |
| Shared public layout | Quick Polish / DRY | Low | Low |

**Overall Epic 7 effort estimate:** 3–4 focused development sessions
**Timeline impact:** Adds one polish sprint before final delivery
**Risk profile:** Low-Medium overall — all changes are UI/UX layer only

---

## Section 4: Detailed Change Proposals

### 4.1 PRD Update

**Section:** 6.4 Subscription & Access Control (Paywall), FR16

**OLD:**
```
FR16: Pengguna terautentikasi dapat memuat halaman paket harga (Pricing Card) 
langganan yang dikomersialkan.
```

**NEW:**
```
FR16: Visitors and authenticated users can access the `/pricing` page as a 
public marketing surface that presents subscription plan details, benefits, 
and pricing without any authentication requirement. Authentication is only 
required at the point of initiating checkout (see FR17). Unauthenticated 
visitors MUST NOT be redirected away from `/pricing`.
```

**Rationale:** The original wording "terautentikasi" created the ambiguity that led to `/pricing` being implemented as an authenticated billing page rather than a public conversion surface — directly contradicting UX Principle #4 ("App is a Tool, Landing is a Stage") and the Information Architecture that places Pricing as a primary public nav destination.

---

### 4.2 Architecture Annotation

**Section:** Route Protection / Middleware Configuration

**OLD (implicit — no explicit exclusion matrix):**
```
Middleware Edge (src/middleware.ts) melindungi semua rute /admin/* dan 
memverifikasi role.
```

**NEW (explicit route protection matrix to be added):**
```
Middleware Edge (src/middleware.ts) protects /admin/* routes and verifies role.

Explicitly PUBLIC routes (NO auth guard, render for all visitors):
  /                        → Public landing page
  /courses                 → Public course catalog
  /courses/[slug]          → Public course landing page
  /pricing                 → Public marketing & conversion page ← CRITICAL
  /login                   → Auth surface
  /register                → Auth surface
  /api/webhooks/midtrans   → Webhook endpoint (signature-verified internally)

Session awareness IS ALLOWED on all public routes (to show contextual UI 
such as profile name vs. auth CTA in navbar), but must NEVER gate page 
rendering or redirect unauthenticated visitors.
```

**Rationale:** Makes the route protection matrix explicit to prevent future misclassification of public surfaces, and creates a clear reference for any future developer working on middleware configuration.

---

### 4.3 Proposed Epic 7: Public Zone Visual Alignment

**Epic Goal:** Align the visual and experiential quality of all public-facing routes (`/courses`, `/courses/[slug]`, `/pricing`) with the approved "Hybrid Duality" UX direction, achieving the same premium public surface quality already present on the landing page `/`.

**FRs addressed:** FR06, FR08, FR16 (clarified), and full UX Spec zone compliance

---

#### Story 7.1: /courses — Public Catalog Premium Surface

As a visitor or student,
I want the course catalog to feel like a premium public surface consistent with the landing page,
So that my first impression of the course library matches the brand quality I experienced on the homepage.

**Acceptance Criteria:**

**Given** I navigate to `/courses`
**When** the page renders
**Then** the page header uses expressive display typography consistent with the public zone (Playfair Display or Fraunces for h1/h2 headings)
**And** the visual hierarchy, spacing, and section structure reflect the UX Spec "Hybrid Duality" public surface treatment
**And** course cards use design system tokens: dark card bg `#1A1A24` in dark mode, 1px border `#2A2A3C`, border-radius 8–12px
**And** Free/Premium badges use the correct pill design with semantic accent colors (Indigo `#6366F1` for premium CTA indicators)
**And** the empty state (no courses found or empty search results) shows a delightful illustration with a CTA button — no blank screen
**And** the search bar shows proper focus/active states using the Indigo accent token (`#6366F1`)
**And** the overall page visual quality is cohesively aligned with the `/` landing page benchmark

**Scope:** Quick Polish + Medium Refactor | **Effort:** Medium | **Risk:** Low

---

#### Story 7.2: /courses/[slug] — Persuasive Course Landing Page

As a visitor or student viewing a specific course,
I want the course detail page to function as a persuasive course landing page,
So that I am motivated to enroll, subscribe, or start the course rather than simply viewing its syllabus.

**Acceptance Criteria:**

**Given** I navigate to `/courses/[slug]`
**When** the page loads
**Then** a primary CTA (e.g., "Start Free" or "Subscribe to Access") is visible **above the fold** before the syllabus section begins
**And** the course hero section uses a gradient accent treatment consistent with the public zone (Coral → Purple → Teal) rather than flat utility styling
**And** course metadata (lesson count, difficulty level, Free/Premium status) is presented in a visually prominent and scannable layout
**And** the chapter/lesson syllabus is rendered as a structured, scannable component — not a plain unstyled list
**And** premium lessons in the syllabus display a lock indicator that visually communicates paywall without hard-blocking access to the page
**And** a trust/value reinforcement section below the syllabus (may use dummy data) highlights learning outcomes or course strengths
**And** a secondary CTA is repeated at the bottom of the page for users who scroll through the full syllabus
**And** the page maintains the same navbar and base layout as other public routes

**Scope:** Medium Refactor | **Effort:** Medium | **Risk:** Low

---

#### Story 7.3: /pricing — Public Marketing Surface (De-gate + Redesign)

As a visitor (unauthenticated) or authenticated user,
I want to access the pricing page without being forced to log in first,
So that I can evaluate subscription plans and make a purchase decision independently of my auth state.

**Acceptance Criteria:**

**Given** I am an unauthenticated visitor navigating to `/pricing` (directly, via navbar, or via paywall CTA)
**When** the page renders
**Then** I see the full pricing page content WITHOUT being redirected to `/login`
**And** the page is publicly accessible from both direct URL and all CTA pathways

**Given** I am on the pricing page
**When** I review the plan options
**Then** plan name, price, duration, and feature list are clearly displayed
**And** a primary CTA per plan (e.g., "Get Started" / "Subscribe Now") is prominently visible
**And** the page uses public zone visual treatment: gradient accents, Fraunces/Playfair Display for price display, Indigo/Violet for CTA buttons, dark bg `#0F0F14` in dark mode
**And** a brief trust/value reinforcement section is present (may use dummy data for MVP)
**And** the page visual quality matches the premium public surface standard of the landing page

**Given** I am an unauthenticated visitor and click a "Subscribe" or "Get Started" CTA
**When** the action is triggered
**Then** I am redirected to `/login` (or `/register`) with a clear message that authentication is required to complete checkout
**And** after successful login, I am returned to `/pricing` (or directly to checkout) without losing my plan context

**Given** I am an authenticated user on `/pricing`
**When** I click a "Subscribe" or "Get Started" CTA
**Then** the Midtrans Snap.js checkout flow initiates as implemented in Story 4.3 (no regression)

**Scope:** Major Redesign (intent redefinition + de-gate + visual redesign) | **Effort:** High | **Risk:** Medium

---

#### Story 7.4: Shared Public Zone Layout Consistency

As a developer,
I want a consistent shared layout wrapper for all public marketing pages,
So that `/`, `/courses`, `/courses/[slug]`, and `/pricing` share the same navbar, base tokens, and layout without duplication.

**Acceptance Criteria:**

**Given** stories 7.1–7.3 are implemented
**When** reviewing the codebase for the public zone
**Then** the public navbar (from Story 6.1) is rendered consistently across all public routes via a shared layout component — no duplication
**And** dark background `#0F0F14` and card dark `#1A1A24` are applied via shared CSS variables or a layout wrapper class, not inline per-page overrides
**And** the layout correctly handles signed-in vs. signed-out navbar state (profile name vs. auth CTA) across all public routes
**And** no functional regression is introduced across Epic 1–6 features

**Scope:** Quick Polish (DRY consolidation) | **Effort:** Low-Medium | **Risk:** Low

---

### 4.4 Recommended Implementation Order

```
7.3 (/pricing: de-gate + intent redesign)   ← FIRST: highest risk, most impactful, unblocks user journey
      ↓
7.1 (/courses: catalog premium polish)       ← SECOND: establishes visual pattern vocabulary
      ↓
7.2 (/courses/[slug]: persuasive landing)    ← THIRD: extends catalog patterns to detail view
      ↓
7.4 (shared public zone layout DRY)          ← LAST: consolidate after all three surfaces are polished
```

**Rationale:**
1. `/pricing` must be de-gated first — it unblocks the guest user journey from landing → pricing CTA without forced login friction, and is the highest-risk change
2. `/courses` catalog polish establishes the design token vocabulary and card patterns that `/courses/[slug]` will extend and build upon
3. Story 7.4 is a clean-up consolidation step, most effectively done after all three surfaces are individually stable

---

## Section 5: Implementation Handoff

### Scope Classification: **Moderate → Major (mixed)**

| Story | Individual Scope | Handoff |
|-------|-----------------|---------|
| 7.1 /courses polish | Moderate | Dev Agent — direct implementation |
| 7.2 /courses/[slug] redesign | Moderate | Dev Agent — direct implementation |
| 7.3 /pricing major redesign | Major | Dev Agent — requires UX Spec reference before starting |
| 7.4 shared layout DRY | Minor | Dev Agent — direct implementation |

### Handoff Recipients & Responsibilities

**Development Agent (primary executor):**
- Implement stories in sequence: 7.3 → 7.1 → 7.2 → 7.4
- Primary reference: `ux-design-specification.md` (design tokens, zone rules, color system, typography)
- Visual benchmark: `/` landing page (already fully aligned with approved direction)
- Secondary reference: `ux-design-directions.html` for approved visual direction mockups

**Product Owner / Scrum Master (Rio + Bob):**
- Approve this proposal
- Update `epics.md` to append Epic 7 with Stories 7.1–7.4
- Update `prd.md` FR16 wording as described in Section 4.1
- Update `architecture.md` to add route protection matrix as described in Section 4.2
- Update `sprint-status.yaml` to add Epic 7 entries

### Success Criteria for Epic 7

- [ ] `/pricing` is fully accessible to unauthenticated visitors without any redirect to `/login`
- [ ] `/pricing` visual quality matches the "public marketing surface" standard of the landing page
- [ ] `/courses` card design, typography, and spacing match UX spec design tokens exactly
- [ ] `/courses/[slug]` has a clear primary CTA above the fold and a persuasive, conversion-oriented layout
- [ ] All four public routes share a consistent navbar and base layout wrapper
- [ ] Dark mode tokens (`#0F0F14`, `#1A1A24`) apply correctly and consistently across all public surfaces
- [ ] No functional regression across Epic 1–6 features
- [ ] PRD FR16 wording is updated to reflect public access intent

---

## Checklist Completion Summary

| Section | ID | Status |
|---------|----|--------|
| Understand Trigger | 1.1 | ✅ Done — post-Epic audit, routes identified |
| Core Problem Defined | 1.2 | ✅ Done — visual fidelity gap + `/pricing` intent misclassification |
| Evidence Gathered | 1.3 | ✅ Done — route-by-route audit findings documented |
| Current Epic Assessment | 2.1 | ✅ Done — Epic 2 and 4 affected |
| Epic Changes Required | 2.2 | ✅ Done — Epic 7 proposed |
| Future Epic Review | 2.3 | ✅ Done — Epics 1, 3, 5, 6 unaffected |
| Obsolete/New Epic Check | 2.4 | ✅ Done — no obsoletes; 1 new epic |
| Priority & Sequencing | 2.5 | ✅ Done — 7.3 → 7.1 → 7.2 → 7.4 |
| PRD Conflict Check | 3.1 | ✅ Done — FR16 needs wording clarification |
| Architecture Conflict | 3.2 | ✅ Done — route matrix annotation needed |
| UX Spec Conflict | 3.3 | ✅ Done — spec is correct; no changes needed |
| Other Artifacts | 3.4 | ✅ Done — sprint-status.yaml needs Epic 7 |
| Option 1 Evaluated | 4.1 | ✅ Viable — Selected |
| Option 2 (Rollback) | 4.2 | ✅ Not viable — functional behavior correct |
| Option 3 (MVP Review) | 4.3 | ✅ Not applicable — MVP scope maintained |
| Path Selected | 4.4 | ✅ Done — Direct Adjustment, Epic 7 |
| Issue Summary | 5.1 | ✅ Done |
| Epic + Artifact Impact | 5.2 | ✅ Done |
| Recommended Path | 5.3 | ✅ Done |
| PRD MVP Impact | 5.4 | ✅ Done — MVP scope unaffected |
| Agent Handoff Plan | 5.5 | ✅ Done |
| Checklist Complete | 6.1 | ✅ Done |
| Proposal Accuracy | 6.2 | ✅ Done |
| User Approval | 6.3 | ⏳ Pending — awaiting Rio's approval |
| Sprint-Status Update | 6.4 | ⏳ Pending — after approval |
| Handoff Confirmed | 6.5 | ⏳ Pending — after approval |

---

*Sprint Change Proposal generated by Bob (Scrum Master Agent) — 2026-03-10*
*Workflow: Correct Course (CC) — hiring-seefluencer*
*Output location: `_bmad-output/planning-artifacts/sprint-change-proposal-public-zone-alignment-2026-03-10.md`*
