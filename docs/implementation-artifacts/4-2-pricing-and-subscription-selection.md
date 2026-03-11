# Story 4.2: Pricing & Subscription Selection

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an authenticated user,
I want to view available subscription plans and initiate checkout,
so that I know the cost and benefits before purchasing and can select a plan to proceed.

## Acceptance Criteria

1. **Given** I am authenticated and navigate to `/pricing`,
   **When** the page loads,
   **Then** I see all available plan cards fetched from the `plans` table — each showing plan `name`, formatted `price` (in IDR), and `durationDays` (e.g., "30 days" or "1 Month").

2. **Given** the `plans` table exists but has no rows,
   **When** I visit `/pricing`,
   **Then** an empty state is rendered with an illustration + descriptive message (e.g., "No plans available yet") — no blank screen, no error (NFR-U2).

3. **Given** I am on the pricing page and see a plan card,
   **When** I click the "Subscribe" / "Checkout" button on a plan,
   **Then** a Server Action `initiateMidtransCheckout(planId)` is triggered, which creates a pending `subscriptions` row and calls the Midtrans Snap API to get a `snap_token` (FR17).

4. **Given** the `initiateMidtransCheckout` Server Action succeeds and returns a `snap_token`,
   **When** the token is received on the client,
   **Then** `window.snap.pay(snap_token)` is called immediately to open the Midtrans Snap JS popup without a full-page redirect.

5. **Given** I do NOT have an active subscription,
   **When** I visit `/pricing`,
   **Then** the "Subscribe" CTA is enabled on all plan cards — no plan is greyed out or disabled.

6. **Given** I already have an active subscription (`status: 'active'` AND `endDate > now()`),
   **When** I visit `/pricing`,
   **Then** I see a clear indicator that I am already subscribed (e.g., a "You're Pro!" banner or badge on the active plan card) — the checkout button may be disabled or replaced with a "Manage" link.

7. **Given** the Midtrans Snap popup is open,
   **When** I dismiss or close it without completing payment,
   **Then** I am returned to `/pricing` without an error screen — the pending `subscriptions` row (if created) is left as `'inactive'` and will be cleaned up by Story 4.4's webhook logic.

8. **Given** the `plans` table is seeded with at least one plan,
   **When** the page first renders (SSR/RSC),
   **Then** pricing data is fetched server-side — NOT via a client-side fetch or useEffect (architecture constraint: RSC-first, Server Actions for mutations).

9. **Given** I am NOT authenticated (no session),
   **When** I navigate to `/pricing`,
   **Then** I am redirected to `/login` (same auth guard pattern from prior epics).

10. **Given** the checkout button is clicked,
    **When** the Server Action is processing,
    **Then** the button shows a loading state (disabled + spinner) to prevent double-submission.

## Tasks / Subtasks

- [x] **Seed `plans` table with initial plan data** (AC: 1, 2, 5)
  - [x] Create `project-e-course/src/server/db/seed.ts` (or add to existing seed file if one exists)
  - [x] Insert at least one plan row: `{ name: 'Pro Monthly', price: 99000, durationDays: 30 }`
  - [x] Add `npm run db:seed` script to `package.json` if not already present
  - [x] Confirm `plans` table was created by Story 4.1 migration — do NOT re-define the schema

- [x] **Create `getPlans` server-side query helper** (AC: 1, 8)
  - [x] Create `project-e-course/src/server/queries/plans.ts`
  - [x] Implement `getPlans()` — queries all rows from `plans` table, ordered by `price ASC`
  - [x] Return type: array of plan rows (use Drizzle infer)

- [x] **Create `getUserActiveSubscription` import guard** (AC: 6, 9)
  - [x] Import `getUserActiveSubscription` from `~/server/queries/subscriptions` (already exists from Story 4.1 — DO NOT re-implement)
  - [x] Use it server-side on the pricing page to determine if user already has an active subscription

- [x] **Create `/pricing` page (RSC)** (AC: 1, 2, 5, 6, 8, 9)
  - [x] Create `project-e-course/src/app/(student)/pricing/page.tsx`
  - [x] Auth guard: `getServerAuthSession()` → redirect to `/login` if no session (AC: 9)
  - [x] Fetch plans via `getPlans()` server-side
  - [x] Fetch current subscription via `getUserActiveSubscription(session.user.id)`
  - [x] Pass `plans`, `isSubscribed` boolean (and `activeSubscription` if needed) to client component
  - [x] Render `<PricingPageClient plans={plans} isSubscribed={isSubscribed} />` (client component handles interactivity)

- [x] **Build `PricingPageClient` component** (AC: 1, 2, 3, 4, 5, 6, 7, 10)
  - [x] Create `project-e-course/src/components/student/pricing-page-client.tsx` as a Client Component (`'use client'`)
  - [x] Props: `plans: Plan[]`, `isSubscribed: boolean`
  - [x] Render a `PricingCard` for each plan (or render empty state if `plans.length === 0`)
  - [x] Empty state: shadcn/ui illustration-style card + "No plans available yet" message + CTA to `/courses` (AC: 2)
  - [x] If `isSubscribed === true`: show "You're Pro! ✨" banner at top of page (AC: 6)
  - [x] Each `PricingCard` renders: plan name, formatted price (`Rp 99.000/month`), duration, and "Subscribe" button
  - [x] If `isSubscribed === true`: disable checkout button on all cards OR replace with "Already Subscribed" badge
  - [x] On button click: call `initiateMidtransCheckout(planId)` Server Action, show loading state (AC: 10)
  - [x] On success (snap_token returned): call `window.snap.pay(snap_token, { onClose: () => {} })` (AC: 4, 7)

- [x] **Create `initiateMidtransCheckout` Server Action** (AC: 3, 4)
  - [x] Create `project-e-course/src/server/actions/payments/initiate-checkout.ts`
  - [x] Input: `planId: number`
  - [x] Validate user session server-side (do NOT trust client session)
  - [x] Fetch plan from DB by `planId` to get `price` and `durationDays`
  - [x] Generate a unique `orderId` (e.g., `sub_${userId}_${Date.now()}`)
  - [x] Create a `subscriptions` row with `status: 'inactive'`, `midtransOrderId: orderId`, `planId`, `userId`, `startDate: new Date()`, `endDate: addDays(new Date(), plan.durationDays)` (endDate is provisional — Story 4.4 webhook will overwrite with confirmed date)
  - [x] Call Midtrans Snap API: `POST https://app.sandbox.midtrans.com/snap/v1/transactions` with `Authorization: Basic ${btoa(MIDTRANS_SERVER_KEY + ':')}`, body: `{ transaction_details: { order_id: orderId, gross_amount: plan.price }, customer_details: { ... } }`
  - [x] On success: return `{ success: true, data: { snap_token: response.token } }`
  - [x] On failure: return `{ success: false, error: string }` — do NOT throw (consistent `ActionResponse<T>` pattern)
  - [x] Environment variable used: `MIDTRANS_SERVER_KEY` (from `.env`, never exposed via `next_public`)

- [x] **Add Midtrans Snap JS script tag** (AC: 4)
  - [x] In the pricing page layout or root layout: add `<Script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} strategy="beforeInteractive" />` via Next.js `<Script>` component
  - [x] Add `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` to `.env` and `env.js` Zod validation schema
  - [x] Extend TypeScript global type to include `window.snap` (add `snap.d.ts` declaration if needed)

- [x] **Write tests** (testing requirement)
  - [x] `project-e-course/src/server/queries/plans.test.ts` — test `getPlans()`: mock DB, assert returns array, handles empty table
  - [x] `project-e-course/src/server/actions/payments/initiate-checkout.test.ts` — test action: unauthenticated call returns error, invalid planId returns error, valid call creates subscription row and returns snap_token

## Dev Notes

### 🔴 Critical Architecture Notes

**1. Server Action Convention — ALWAYS return `ActionResponse<T>`**

Per `architecture.md` and established in every prior story:

```ts
// src/server/actions/payments/initiate-checkout.ts
'use server';
import { type ActionResponse } from '~/types'; // Already exists from prior stories

export async function initiateMidtransCheckout(
	planId: number,
): Promise<ActionResponse<{ snap_token: string }>> {
	const session = await getServerAuthSession();
	if (!session?.user?.id) return { success: false, error: 'Unauthorized' };
	// ...
}
```

**NEVER** throw errors from Server Actions — always return `{ success: false, error: string }`.

**2. Midtrans Snap Integration Pattern**

Two environment variables are required:

- `MIDTRANS_SERVER_KEY` — **server-only**, used to call Snap API (never `NEXT_PUBLIC_`)
- `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` — **client-safe**, used in `<Script data-client-key=...>`

Midtrans Sandbox Snap API endpoint:

```
POST https://app.sandbox.midtrans.com/snap/v1/transactions
Authorization: Basic BASE64(SERVER_KEY + ':')
Content-Type: application/json
```

Minimal request body:

```json
{
	"transaction_details": {
		"order_id": "sub_userId_1709999999999",
		"gross_amount": 99000
	},
	"customer_details": {
		"email": "user@example.com"
	}
}
```

Response contains `token` (the snap_token) and `redirect_url`.

Client-side invocation after getting the token:

```ts
// In PricingPageClient — after Server Action returns snap_token:
window.snap.pay(snap_token, {
	onSuccess: (result) => {
		/* optional: show success toast */
	},
	onPending: (result) => {
		/* optional: show pending toast */
	},
	onError: (result) => {
		/* show error toast */
	},
	onClose: () => {
		/* user closed popup — do nothing, leave pending sub */
	},
});
```

**3. `window.snap` TypeScript Declaration**

Add a global type declaration to prevent TypeScript errors:

```ts
// project-e-course/src/types/snap.d.ts (NEW FILE)
interface SnapCallbackResult {
	order_id: string;
	transaction_status: string;
	fraud_status?: string;
}

interface SnapOptions {
	onSuccess?: (result: SnapCallbackResult) => void;
	onPending?: (result: SnapCallbackResult) => void;
	onError?: (result: SnapCallbackResult) => void;
	onClose?: () => void;
}

interface Snap {
	pay: (token: string, options?: SnapOptions) => void;
	hide: () => void;
}

declare global {
	interface Window {
		snap: Snap;
	}
}

export {};
```

**4. env.js Zod Validation Extension**

T3 App uses `env.js` for validated env vars. Add Midtrans keys:

```ts
// project-e-course/env.js — ADD to appropriate sections:
// In server schema:
MIDTRANS_SERVER_KEY: z.string().min(1),

// In client schema:
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: z.string().min(1),
```

**5. Provisional `endDate` on Checkout Initiation**

When creating the `subscriptions` row during checkout initiation, set a provisional `endDate`:

```ts
const endDate = new Date();
endDate.setDate(endDate.getDate() + plan.durationDays);
```

**This `endDate` is provisional.** Story 4.4's webhook handler will overwrite `startDate` and `endDate` with values computed from Midtrans's `settlement_time` upon successful payment. The provisional date exists only to have a non-null DB column.

**6. `plans` Table Already Created by Story 4.1 Migration**

DO NOT re-define the `plans` schema. It was created in `drizzle/0002_icy_sheva_callister.sql` as part of Story 4.1. Verify the migration was applied before seeding.

The existing schema:

```ts
// Already in src/server/db/schema.ts
export const plans = createTable('plans', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 100 }).notNull(),
	price: integer('price').notNull(), // In IDR, e.g., 99000
	durationDays: integer('duration_days').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
```

**7. `orderId` Uniqueness Constraint**

The `subscriptions.midtransOrderId` column has a `UNIQUE` constraint (from Story 4.1). Use a timestamp-based ID to avoid collisions: `sub_${userId}_${Date.now()}`. If a user initiates checkout multiple times rapidly, each click must generate a unique `orderId`.

### 🔵 Existing Patterns to Follow (from Previous Stories)

**Physical project directory:**
All source files are under `project-e-course/src/` — the physical directory is `project-e-course/`, NOT the repo root. Verify via `package.json` location before creating files.

**Auth guard (established in Epic 3, confirmed in Story 4.1):**

```ts
import { getServerAuthSession } from '~/server/auth';
import { redirect } from 'next/navigation';

const session = await getServerAuthSession();
if (!session?.user?.id) redirect('/login');
```

**`getUserActiveSubscription` — reuse from Story 4.1:**

```ts
import { getUserActiveSubscription } from '~/server/queries/subscriptions';
// Already tested and verified in Story 4.1 — DO NOT re-implement
```

**Server Actions location:** `src/server/actions/[feature]/[action-name].ts` — feature-sliced.

**Query helpers location:** `src/server/queries/[feature].ts` — consistent with `subscriptions.ts`.

**Testing framework:** `node:test` + Vitest (Vitest was installed in Story 4.1 — `npm run check` and `npm test` use it). Follow the same mock pattern as `subscriptions.test.ts`.

**Toast notification:** Use `sonner` (already installed). Import `toast` from `sonner`.

**Component location:** `src/components/student/` for student-facing components.

**`ActionResponse<T>` type:** Already defined in `~/types` from prior stories — import it, do NOT redefine.

### 🟡 UX Requirements

**Pricing page emotional goal (from UX Spec):**

> "Paywall: **Convinced, bukan Frustrated** — 'Ini worth it'"
> "**Earn Your Premium** — Paywall adalah jembatan value, bukan wall"

**Pricing card visual spec:**

- Use shadcn/ui `Card` component as wrapper
- Show plan name as `<h3>`, price formatted as `Rp 99.000 / bulan` (IDR with thousands separator)
- Duration below price: e.g., "30 hari akses penuh" (or localized)
- Primary CTA: `<Button>` with `bg-indigo-600 hover:bg-indigo-700` — indigo is the primary accent color
- "You're Pro! ✨" banner: use a `<div>` with `bg-gradient-to-r from-indigo-500 to-violet-500 text-white` at the top of page
- Empty state: illustration card with icon (e.g., `PackageOpen` from lucide-react) + descriptive text + link to `/courses`

**Skeleton loading (NFR-U2):**

- Render skeleton cards while data loads if using Suspense — however since this is RSC, data is fetched server-side before render. Still add a `loading.tsx` file at `src/app/(student)/pricing/loading.tsx` with `PricingPageSkeleton` for Next.js streaming.

**Button states (AC: 10):**

- Loading state: `disabled` prop + `<Loader2 className="animate-spin" />` icon inside button
- Use `useTransition` from React to manage the loading state during Server Action call

**Toast notifications (NFR-U3):**

- On checkout success (Snap opened): `toast.success('Midtrans checkout opened!')` (optional but improves feedback)
- On action error: `toast.error(errorMessage)` — always provide feedback

**Responsive layout (NFR-U1):**

- Desktop: Pricing cards side-by-side in a `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Mobile: Single column, full-width cards

### 🟡 Security Requirements

**Server key must NEVER reach the client:**

- `MIDTRANS_SERVER_KEY` is only used inside `initiate-checkout.ts` (server-only file under `src/server/actions/`)
- Do NOT import it via `env.js` client schema — only the server schema
- Verify `env.js` structure before adding (T3 App separates `server` and `client` env schemas)

**Session re-validation in Server Action:**

- Even though the client sends `planId`, the Server Action MUST independently call `getServerAuthSession()` to get `userId` — never trust client-provided userId

**Midtrans signature verification is Story 4.4's responsibility** — Story 4.2 only creates the transaction. Do NOT implement webhook verification here.

### 🟢 What Exists vs. What to Create

**Files that exist (from Story 4.1) — DO NOT recreate:**

```
src/server/db/schema.ts                     — plans + subscriptions already defined
src/server/queries/subscriptions.ts         — getUserActiveSubscription() available
drizzle/0002_icy_sheva_callister.sql        — plans + subscriptions migration applied
src/components/student/paywall-teaser-overlay.tsx  — PaywallTeaserOverlay (links to /pricing)
```

**New files to create:**

```
project-e-course/src/server/db/seed.ts                              — plan seed data
project-e-course/src/server/queries/plans.ts                        — getPlans() helper
project-e-course/src/server/actions/payments/initiate-checkout.ts   — Server Action
project-e-course/src/app/(student)/pricing/page.tsx                 — RSC pricing page
project-e-course/src/app/(student)/pricing/loading.tsx              — Next.js streaming skeleton
project-e-course/src/components/student/pricing-page-client.tsx     — Client component
project-e-course/src/types/snap.d.ts                                — window.snap TypeScript declaration
project-e-course/src/server/queries/plans.test.ts                   — unit tests
project-e-course/src/server/actions/payments/initiate-checkout.test.ts  — unit tests
```

**Files to modify:**

```
project-e-course/env.js         — Add MIDTRANS_SERVER_KEY + NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
project-e-course/.env           — Add Midtrans sandbox key values
project-e-course/package.json   — Add db:seed script
project-e-course/src/app/layout.tsx  — Add Midtrans Snap <Script> tag
```

### 🟢 Midtrans Sandbox Credentials (Dev Reference)

Use these Midtrans Sandbox values in `.env`:

```
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxx   (from Midtrans Sandbox dashboard)
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxx   (from Midtrans Sandbox dashboard)
```

For local HR reviewer testing, add a note in `README.md` that reviewers must create their own free Midtrans Sandbox account or use placeholder values — the webhook (Story 4.4) is the only place real payment data is processed.

### 🟢 Price Formatting Utility

Create a simple utility to format IDR prices:

```ts
// project-e-course/src/lib/format-currency.ts (NEW or add to existing lib/utils.ts)
export function formatIDR(amount: number): string {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0,
	}).format(amount);
	// Output: "Rp 99.000"
}
```

### 🟢 Downstream Story Context (for Story 4.3 awareness)

**Story 4.3 (Midtrans Checkout Integration)** is the SAME checkout flow — re-reading that story's AC shows it covers the Snap popup behavior in more detail. **Story 4.2 and 4.3 share `initiateMidtransCheckout`.** Be aware that:

- Story 4.2 is responsible for: pricing page UI + Server Action that creates subscription + gets snap_token
- Story 4.3 is responsible for: verifying and polishing the Snap popup interaction itself
- Do NOT try to implement Story 4.3's scope in this story — only get to the point of calling `window.snap.pay(token)`

### Project Structure Notes

**Alignment with unified project structure:**

- New Server Action: `src/server/actions/payments/initiate-checkout.ts` — follows `Feature-Sliced Actions` pattern; `payments/` subfolder is consistent with architecture boundary document
- New query helper: `src/server/queries/plans.ts` — follows `src/server/queries/[feature].ts` pattern (same as `subscriptions.ts`)
- New page: `src/app/(student)/pricing/page.tsx` — within `(student)` route group for authenticated student pages
- New component: `src/components/student/pricing-page-client.tsx` — student zone for student-facing interactive components
- Type declaration: `src/types/snap.d.ts` — consistent with any existing type declarations; if `src/types/` doesn't exist, create it

**Detected potential conflict:**

- `src/app/layout.tsx` is the root layout — adding `<Script>` for Snap.js here ensures it's available everywhere, but verify that this does not conflict with existing `<Script>` tags. The `strategy="beforeInteractive"` ensures the Snap script is loaded before the page becomes interactive (required for `window.snap` to be defined when the user clicks checkout).

### Testing Requirements

- **Framework:** Vitest (installed in Story 4.1 — `npm test` → Vitest runner)
- **Run command:** `npm test` or `npm run check` for TypeScript

**Tests to write:**

```ts
// src/server/queries/plans.test.ts
// Mock db.select().from().orderBy() to return:
// 1. Array of plan rows → getPlans() returns the array
// 2. Empty array → getPlans() returns [] (no error)

// src/server/actions/payments/initiate-checkout.test.ts
// Test scenarios:
// 1. Unauthenticated (no session) → returns { success: false, error: 'Unauthorized' }
// 2. Invalid planId (not found in DB) → returns { success: false, error: 'Plan not found' }
// 3. Valid call → creates subscription row + calls Midtrans API mock → returns { success: true, data: { snap_token: 'token-xxx' } }
// 4. Midtrans API failure → returns { success: false, error: '...' }
```

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 4, Story 4.2 (FR16), Story 4.3 (FR17), Epic 4 overview]
- [Source: `_bmad-output/planning-artifacts/prd.md` — FR16 (pricing page), FR17 (Midtrans Sandbox checkout), NFR-S3 (no secret leakage via NEXT_PUBLIC)]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — Server Actions convention `ActionResponse<T>`, Feature-Sliced Actions folder structure, `/api/webhooks/midtrans` as sole anonymous route, RSC-first data fetching, env Zod validation]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — "Earn Your Premium" principle, PaywallTeaserOverlay links to `/pricing`, pricing card visual guidance, Toast/Sonner feedback pattern, indigo CTA color, empty state illustration requirement, responsive grid layout, skeleton loaders]
- [Source: `_bmad-output/implementation-artifacts/4-1-premium-paywall-teaser.md` — Confirmed file path `project-e-course/src/`, `plans` + `subscriptions` schema, `getUserActiveSubscription()` available at `~/server/queries/subscriptions`, Vitest as test framework, migration `0002_icy_sheva_callister.sql` applied, `createTable` with T3 prefix, `ActionResponse<T>` type location, physical project directory warning]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

- Verified existing `plans` schema in `project-e-course/src/server/db/schema.ts` and Story 4.1 migration `project-e-course/drizzle/0002_icy_sheva_callister.sql` before seeding.
- Added idempotent pricing seed flow in `project-e-course/src/server/db/seed.ts`, shared logic in `project-e-course/src/server/db/seed.shared.ts`, and CLI runner `project-e-course/scripts/run-db-seed.mjs` wired via `npm run db:seed`.
- Confirmed seed execution with `npm run db:seed` and red-green unit coverage via `npm test -- src/server/db/seed.test.ts`.
- Added `getPlans()` helper in `project-e-course/src/server/queries/plans.ts` with red-green coverage in `project-e-course/src/server/queries/plans.test.ts`.
- Resolved repo regression blockers by migrating `course-sidebar-nav` and `paywall-teaser-overlay` component tests to Vitest `.tsx` suites.
- Verified Node test suite passes again with `npm test`; kept repo script on `node --test` because most existing suites are still authored for the Node runner, while interactive `.tsx` suites continue to run under targeted Vitest commands.
- Reused `getUserActiveSubscription()` on the new RSC pricing route to derive `isSubscribed` without re-implementing subscription lookup logic.
- Implemented `/pricing` SSR route, loading skeleton, Midtrans checkout action/shared logic, client-side pricing UI, global Snap typings, env validation updates, and reviewer setup notes in `README.md`.
- Verified repo quality gates with `npm run check`, `npm test`, and targeted Vitest coverage for converted component suites.

### Completion Notes List

- ✅ Seeded initial pricing plan data with `Pro Monthly` (`Rp 99.000`, `30` days) using an idempotent insert path.
- ✅ Added test coverage for seed payload + execution contract in `project-e-course/src/server/db/seed.test.ts`.
- ✅ Added `getPlans()` server query helper returning plans ordered by ascending price with unit coverage in `project-e-course/src/server/queries/plans.test.ts`.
- ✅ Repaired pre-existing component test blockers by converting the affected `.ts` files to Vitest `.tsx` suites and stubbing `scrollIntoView`.
- ✅ Added authenticated `/pricing` RSC route with server-side plan + active-subscription loading, empty state, subscription banner, and streaming skeleton support.
- ✅ Implemented Midtrans checkout initiation flow with pending subscription creation, Snap token retrieval, client `window.snap.pay(...)` invocation, loading state, and guarded public/client env usage.
- ✅ Added checkout action tests plus repo-wide lint/type/test validation; kept interactive component regression coverage under targeted Vitest suites.

### File List

- `_bmad-output/implementation-artifacts/4-2-pricing-and-subscription-selection.md`
- `project-e-course/package.json`
- `project-e-course/.env`
- `project-e-course/README.md`
- `project-e-course/src/app/(student)/pricing/loading.tsx`
- `project-e-course/src/app/(student)/pricing/page.tsx`
- `project-e-course/src/app/layout.tsx`
- `project-e-course/src/components/student/course-sidebar-nav.test.tsx`
- `project-e-course/src/components/student/paywall-teaser-overlay.test.tsx`
- `project-e-course/src/components/student/pricing-page-client.tsx`
- `project-e-course/src/components/student/pricing-page-skeleton.tsx`
- `project-e-course/src/lib/format-currency.ts`
- `project-e-course/scripts/run-db-seed.mjs`
- `project-e-course/src/env.js`
- `project-e-course/src/server/actions/payments/initiate-checkout.shared.ts`
- `project-e-course/src/server/actions/payments/initiate-checkout.test.ts`
- `project-e-course/src/server/actions/payments/initiate-checkout.ts`
- `project-e-course/src/server/db/seed.shared.ts`
- `project-e-course/src/server/db/seed.test.ts`
- `project-e-course/src/server/db/seed.ts`
- `project-e-course/src/server/queries/plans.shared.ts`
- `project-e-course/src/server/queries/plans.test.ts`
- `project-e-course/src/server/queries/plans.ts`
- `project-e-course/src/types/snap.d.ts`

## Change Log

- 2026-03-09: Implemented pricing page, plan query/seed flow, Midtrans checkout initiation, env/script updates, and regression/test fixes for Story 4.2.
