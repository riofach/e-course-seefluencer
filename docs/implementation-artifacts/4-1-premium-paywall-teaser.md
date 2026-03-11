# Story 4.1: Premium Paywall Teaser

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a free student,
I want to see a clear teaser when trying to access a premium lesson,
so that I understand I need a subscription to proceed without getting a hard error.

## Acceptance Criteria

1. **Given** I am authenticated but do NOT have an active subscription (no `subscriptions` row with `status: 'active'` AND `endDate > now()` for my `userId`),
   **When** I navigate to a lesson where `lessons.isFree = false`,
   **Then** the video player / text content area is hidden behind a `PaywallTeaserOverlay` component,
   **And** the raw lesson content (video URL, text body) is NOT included in the page response.

2. **Given** I am unauthenticated (no session),
   **When** I navigate to any lesson URL,
   **Then** I am redirected to `/login` (same pattern as Epic 3 lesson access guard).

3. **Given** the paywall overlay is rendered,
   **When** it appears,
   **Then** I see a blur backdrop covering the content area, a lock icon, a headline (e.g., "This lesson is for Pro members"), a brief value proposition text, and a prominent "Upgrade to Pro" CTA button.

4. **Given** the paywall overlay is rendered,
   **When** I click "Upgrade to Pro",
   **Then** I am navigated to `/pricing` (the subscription selection page — Story 4.2).

5. **Given** the paywall overlay is rendered,
   **When** it is displayed,
   **Then** the `CourseSidebarNav` remains fully visible and functional — I can still navigate to free lessons without restriction.

6. **Given** I DO have an active subscription (`status: 'active'` AND `endDate > now()`),
   **When** I navigate to any lesson (free or premium),
   **Then** the `PaywallTeaserOverlay` is NOT rendered and I see the full lesson content.

7. **Given** the paywall check runs,
   **When** the lesson access guard executes on the server,
   **Then** it is implemented as a Server Component check (NOT a client-side check) — subscription status is fetched server-side and the content gate is enforced before serializing page props.

## Tasks / Subtasks

- [x] **Add `subscriptions` and `plans` Drizzle table schema** (AC: 1, 6, 7)
  - [x] In `src/server/db/schema.ts`, add the `plans` table: `id` (serial PK), `name` (varchar 100), `price` (integer, in IDR cents), `durationDays` (integer), `createdAt` (timestamp with timezone, defaultNow)
  - [x] In `src/server/db/schema.ts`, add the `subscriptions` table: `id` (serial PK), `userId` (varchar 255, FK → `users.id` cascade delete), `planId` (integer, FK → `plans.id`), `status` (varchar 20, default `'inactive'`), `startDate` (timestamp with timezone), `endDate` (timestamp with timezone), `midtransOrderId` (varchar 255, unique, nullable), `createdAt` (timestamp with timezone, defaultNow)
  - [x] Run `npm run db:generate` to generate the Drizzle migration SQL
  - [x] Run `npm run db:migrate` to apply it to the local database
  - [x] Do NOT seed `plans` data in this story — that is Story 4.2's responsibility

- [x] **Create `getUserSubscription` server-side query helper** (AC: 1, 6, 7)
  - [x] Create `src/server/queries/subscriptions.ts`
  - [x] Implement `getUserActiveSubscription(userId: string)` — queries `subscriptions` table for a row where `userId` matches AND `status = 'active'` AND `endDate > new Date()`, returns the row or `null`
  - [x] Export the function for use in RSC pages

- [x] **Add subscription access guard to the lesson page** (AC: 1, 2, 6, 7)
  - [x] In `src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx` (exists from Epic 3):
    - [x] Add `getServerAuthSession()` call — redirect to `/login` if no session (AC: 2; this pattern already exists from Epic 3 — verify it is in place, do NOT add a second redirect)
    - [x] Fetch the current lesson from DB to check `lesson.isFree`
    - [x] If `lesson.isFree === false`: call `getUserActiveSubscription(session.user.id)` — if `null`, set `showPaywall = true`
    - [x] Pass `showPaywall` boolean down to the lesson content rendering logic

- [x] **Build `PaywallTeaserOverlay` component** (AC: 3, 4, 5)
  - [x] Create `src/components/student/paywall-teaser-overlay.tsx` as a Client Component (`'use client'`)
  - [x] Props: none required (self-contained; uses `<Link>` to `/pricing`)
  - [x] Anatomy: `<div className="relative">` wrapping the content area + an absolute-positioned overlay with `backdrop-blur-md bg-background/70` covering the full content zone
  - [x] Inside overlay: Lock icon (use `lucide-react` `Lock` icon — already installed), `<h2>` "This lesson is for Pro members", `<p>` "Unlock this lesson and all premium content with a Pro subscription.", `<Button asChild>` → `<Link href="/pricing">Upgrade to Pro</Link>` (primary/indigo CTA)
  - [x] Lock icon: `w-12 h-12` with `text-indigo-500` — matches accent color from UX spec
  - [x] The overlay does NOT hide or disable the `CourseSidebarNav` — the sidebar is a sibling component outside the overlay wrapper

- [x] **Conditionally render lesson content vs. overlay in lesson page** (AC: 1, 3, 5, 6)
  - [x] In `src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx`:
    - [x] When `showPaywall === true`: render `<PaywallTeaserOverlay />` in place of `<VideoPlayerWrapper>` / `<MarkCompleteButton>` / text content body
    - [x] When `showPaywall === false` (or lesson is free): render existing content components unchanged
    - [x] The lesson title, `CourseSidebarNav`, breadcrumb, and progress bar remain visible regardless of `showPaywall` — only the media/content zone is gated
    - [x] Do NOT pass `videoUrl`, `textContent`, or any premium content fields into the page props when `showPaywall === true` — exclude them from the DB select query return

- [x] **Add `isFree` badge to lesson items in `CourseSidebarNav`** (AC: 5 — visual context)
  - [x] In `src/components/student/course-sidebar-nav.tsx`, add a small `Badge` ("Free" / "Pro") beside lesson titles where `lesson.isFree` is available in the existing props
  - [x] "Free" badge: `variant="secondary"`, "Pro" badge: `variant="outline"` with lock icon (12px)
  - [x] This is a UI enhancement for clarity; it does NOT gate navigation

- [x] **Write tests** (testing requirement)
  - [x] Create `src/server/queries/subscriptions.test.ts` — test `getUserActiveSubscription`: mock DB, assert returns `null` when no active row, returns subscription when active + endDate in future, returns `null` when endDate is past
  - [x] Create/update `src/app/(student)/courses/[slug]/lessons/[lessonId]/page.test.ts` — test that `showPaywall = true` when `isFree = false` AND no active subscription; `showPaywall = false` when active subscription exists

## Dev Notes

### 🔴 Critical Architecture Notes

**1. Subscription Check is a Server-Side Responsibility — NEVER client-side**

Per `architecture.md`: "RSC Paywall Logic: Pengecekan status Subscription milik user _harus_ terjadi _sebelum_ memutar Video Stream ID di server."

This means:

- The entire access gate (`showPaywall` logic) lives in the RSC `page.tsx` body
- `getUserActiveSubscription` is imported from `~/server/queries/subscriptions` — a server-only module
- The `videoUrl` and `textContent` fields are conditionally excluded from the DB select when the paywall is active — they must NEVER be serialized into a client-readable prop when `showPaywall = true`

**Implementation pattern:**

```ts
// src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx (server component)
import { getUserActiveSubscription } from '~/server/queries/subscriptions';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';
import { lessons } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export default async function LessonPage({ params }: { params: { slug: string; lessonId: string } }) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) redirect('/login'); // Already exists from Epic 3 — verify only

  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, Number(params.lessonId)),
  });
  if (!lesson) notFound();

  let showPaywall = false;
  if (!lesson.isFree) {
    const subscription = await getUserActiveSubscription(session.user.id);
    showPaywall = subscription === null;
  }

  // If showPaywall is true, do NOT include videoUrl/textContent in render props
  return (
    <LessonPageContent
      lesson={showPaywall ? { ...lesson, videoUrl: null, textContent: null } : lesson}
      showPaywall={showPaywall}
      // ... other props (sidebar data, breadcrumb, etc.) unchanged
    />
  );
}
```

**2. `PaywallTeaserOverlay` Anatomy (from UX Spec)**

UX Spec explicitly defines this custom component:

> **PaywallTeaserOverlay:** "Membatasi konten tanpa merusak UX navigasi. Anatomy: Elemen absolut dengan backdrop-blur, ikon gembok elegan, penjelasan ('This lesson is for Pro members'), dan tombol Premium CTA."

Critical implementation constraints:

- `backdrop-blur-md` on the overlay background (NOT a hard gray block)
- Lock icon from `lucide-react` (already installed via shadcn — `import { Lock } from 'lucide-react'`)
- CTA must navigate to `/pricing` (Story 4.2 route)
- The overlay is a **blur teaser, not a hard redirect** — this is explicitly listed as the UX strategy (`ux-design-specification.md`: "Paywall diimplementasikan sebagai blur overlay + CTA (bukan hard redirect/full modal)")

```tsx
// src/components/student/paywall-teaser-overlay.tsx
'use client';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Button } from '~/components/ui/button';

export function PaywallTeaserOverlay() {
	return (
		<div className="relative min-h-[400px] w-full overflow-hidden rounded-lg">
			{/* Blurred placeholder content behind overlay (optional: blurred thumbnail) */}
			<div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-muted/80 backdrop-blur-md" />

			{/* Overlay CTA content */}
			<div className="relative z-10 flex min-h-[400px] flex-col items-center justify-center gap-4 px-6 text-center">
				<div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
					<Lock className="h-8 w-8 text-indigo-500" />
				</div>
				<h2 className="text-xl font-semibold">This lesson is for Pro members</h2>
				<p className="max-w-sm text-sm text-muted-foreground">
					Unlock this lesson and all premium content with a Pro subscription.
				</p>
				<Button asChild size="lg" className="mt-2 bg-indigo-600 hover:bg-indigo-700">
					<Link href="/pricing">Upgrade to Pro</Link>
				</Button>
			</div>
		</div>
	);
}
```

**3. Database Schema — Add `plans` and `subscriptions` Tables**

These tables do NOT exist yet. This is the first story in Epic 4, which introduces the payment/subscription domain.

```ts
// src/server/db/schema.ts — ADD these tables (do not replace existing ones)
import { serial, integer, varchar, timestamp, boolean, text } from 'drizzle-orm/pg-core';

export const plans = createTable('plans', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 100 }).notNull(),
	price: integer('price').notNull(), // In IDR (Indonesian Rupiah), e.g., 99000
	durationDays: integer('duration_days').notNull(), // e.g., 30
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const subscriptions = createTable('subscriptions', {
	id: serial('id').primaryKey(),
	userId: varchar('user_id', { length: 255 })
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	planId: integer('plan_id').references(() => plans.id),
	status: varchar('status', { length: 20 }).notNull().default('inactive'), // 'inactive' | 'active'
	startDate: timestamp('start_date', { withTimezone: true }),
	endDate: timestamp('end_date', { withTimezone: true }),
	midtransOrderId: varchar('midtrans_order_id', { length: 255 }).unique(), // nullable — set on checkout
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
```

**Migration commands:**

```bash
npm run db:generate   # Generates /drizzle/*.sql migration file
npm run db:migrate    # Applies migration to the DB
```

Verify `drizzle.config.ts` points to `src/server/db/schema.ts` as schema source before running.

**4. `getUserActiveSubscription` Query Helper**

```ts
// src/server/queries/subscriptions.ts
import { db } from '~/server/db';
import { subscriptions } from '~/server/db/schema';
import { and, eq, gt } from 'drizzle-orm';

export async function getUserActiveSubscription(userId: string) {
	const result = await db
		.select()
		.from(subscriptions)
		.where(
			and(
				eq(subscriptions.userId, userId),
				eq(subscriptions.status, 'active'),
				gt(subscriptions.endDate, new Date()),
			),
		)
		.limit(1);

	return result[0] ?? null;
}
```

This function will be reused in Stories 4.2, 4.3, and 4.4 — write it to be cleanly importable from `~/server/queries/subscriptions`.

### 🔵 Existing File Patterns to Follow (Previous Stories)

**From Story 3.5 Dev Agent Record (confirmed file paths):**

All source files live under `project-e-course/src/` — the physical project directory is `project-e-course/`, NOT the repo root. Confirm by checking `package.json` location before creating any files.

**Auth guard pattern (established in Epic 3):**

```ts
// Pattern used in Epic 3 lesson pages:
const session = await getServerAuthSession();
if (!session?.user?.id) redirect('/login');
```

Verify this is already present in the lesson page before adding it again (AC: 2 says "already exists from Epic 3 — verify only").

**`ActionResponse<T>` return type** (from `architecture.md`):

```ts
// src/types.ts or ~/types (already exists from Epic 3 server actions)
export type ActionResponse<T> = { success: true; data: T } | { success: false; error: string };
```

`getUserActiveSubscription` is a query helper (not a server action) so it does NOT need `ActionResponse<T>` — it returns the DB row directly or `null`.

**Feature-sliced pattern for queries:**

- Server Actions live in `src/server/actions/[feature]/`
- Query helpers should follow: `src/server/queries/[feature].ts`
- Do NOT put `getUserActiveSubscription` inside `src/server/actions/payments/` — it is a query, not a mutation

### 🟡 UX Requirements

**PaywallTeaserOverlay emotional design (from UX spec):**

- **Target emotion:** "Convinced, bukan Frustrated — 'Ini worth it'" (UX Spec: Desired Emotional Response → Paywall)
- **Experience principle:** "Earn Your Premium — Paywall adalah jembatan value, bukan wall" (UX Spec: Experience Principles)
- **Anti-pattern to avoid:** "Upsell everywhere — Merusak trust; paywall hanya di lesson premium" (UX Spec: Anti-Patterns to Avoid)

**Sidebar must remain functional (AC: 5):**
The `CourseSidebarNav` sits outside the content area. The paywall overlay ONLY replaces the video/content render zone. The sidebar, breadcrumb, lesson title, and progress bar remain fully visible. Do NOT wrap the entire lesson layout with the overlay.

**Badge for Free/Pro lessons in sidebar (AC-adjacent):**

- Use `shadcn/ui Badge` component — already installed
- "Free" badge: `variant="secondary"` (gray) — subtle, non-intrusive
- "Pro" badge: `variant="outline"` with a small `Lock` icon inline — conveys gating without being loud

**Responsive behavior:**

- Mobile (< 768px): The overlay stacks vertically. The sidebar collapses to Bottom Sheet (already established in Story 3.1/3.2). The overlay `min-h-[400px]` ensures it's visible on mobile without scroll.
- The CTA button uses `size="lg"` for touch-target compliance (WCAG AA: 44×44px minimum).

### 🟡 Security Requirements

**Premium content must NOT be in the page response for non-subscribers:**

- The lesson page RSC must NOT include `videoUrl`, `textContent`, or quiz question data in page props when `showPaywall = true`
- This is enforced server-side — there is no client-side hydration of premium content
- The `PaywallTeaserOverlay` receives NO lesson content props — it only shows the lock/CTA UI

**Subscription status check:**

- `endDate > new Date()` check is CRITICAL — an `'active'` status alone is not enough; the subscription must not be expired
- This prevents edge cases where `status` was set to `'active'` but `endDate` was never updated (e.g., from a failed webhook)

### 🟢 What Exists vs. What to Create

**Files that already exist (from Epic 3) — DO NOT recreate:**

```
src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx   — MODIFY ONLY
src/components/student/course-sidebar-nav.tsx                  — MODIFY (add badges)
src/components/student/video-player-wrapper.tsx                — DO NOT touch
src/components/student/mark-complete-button.tsx                — DO NOT touch
src/server/auth.ts                                             — DO NOT touch
src/server/db/schema.ts                                        — ADD plans/subscriptions tables only
```

**New files to create:**

```
src/server/db/schema.ts                         — ADD plans + subscriptions table definitions
src/server/queries/subscriptions.ts             — getUserActiveSubscription() query helper
src/components/student/paywall-teaser-overlay.tsx — PaywallTeaserOverlay component
src/server/queries/subscriptions.test.ts        — unit tests
drizzle/[timestamp]_plans_subscriptions.sql     — auto-generated migration (via db:generate)
```

### 🟢 Toast Notifications

This story does NOT require toast notifications. The `PaywallTeaserOverlay` is a passive UI state, not a user-triggered action result. No Sonner calls needed.

### 🟢 Drizzle Naming Convention

Follow `architecture.md` database naming:

- Table names: plural `snake_case` → `plans`, `subscriptions`
- Column names: `snake_case` → `user_id`, `plan_id`, `start_date`, `end_date`, `midtrans_order_id`, `duration_days`
- `createTable` wrapper from T3 App adds the table prefix (check `src/server/db/schema.ts` for `createTable` definition — T3 uses `pgTableCreator` with a prefix like `"hiring-seefluencer_"`)

### 🟢 `isFree` Column Already Exists

The `lessons` table was defined in Epic 2/3 stories. The `isFree` boolean column (`is_free`) already exists in `src/server/db/schema.ts`:

```ts
isFree: boolean('is_free').notNull().default(false),
```

Do NOT add it again. Verify by inspecting `schema.ts` before touching it.

### Project Structure Notes

**Alignment with unified project structure:**

- New query helper: `src/server/queries/subscriptions.ts` — follows the `src/server/` pattern for server-only modules
- New component: `src/components/student/paywall-teaser-overlay.tsx` — follows `components/student/` zone for student-facing custom components
- Schema additions go in existing `src/server/db/schema.ts` — the file is already established; only append, do NOT restructure

**Detected conflict/variance:**

- None. This story introduces new tables (`plans`, `subscriptions`) that have no prior definition in the codebase. Clean addition.

### Testing Requirements

- **Framework:** `node:test` (same as previous stories — no Jest/Vitest)
- **Run command:** `npm test` → `node --test`

**Tests to write:**

```ts
// src/server/queries/subscriptions.test.ts
// Mock db to return:
// 1. Empty array → getUserActiveSubscription returns null (no subscription)
// 2. Row with status='active' and endDate in future → returns subscription row
// 3. Row with status='active' but endDate in PAST → returns null (expired)
// 4. Row with status='inactive' → returns null

// Pattern for pure test without actual DB (mock db.select().from().where().limit()):
import { getUserActiveSubscription } from './subscriptions';
// Use dependency injection or module mock — see submit-quiz.shared.ts pattern from Story 3.5
```

**TypeScript check:** `npm run check` must pass with strict mode. No `any` types.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 4, Story 4.1 (FR15), Epic 4 overview]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — PaywallTeaserOverlay custom component, Experience Principles ("Earn Your Premium"), Desired Emotional Response (Paywall), Anti-Patterns, Accessibility (44×44px touch targets)]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — RSC Paywall Logic gap analysis, Server Actions convention, project directory structure, `src/server/queries/` pattern, security boundaries, no client-side auth]
- [Source: `_bmad-output/planning-artifacts/prd.md` — FR15 (system intercepts premium lesson with paywall), FR16 (pricing page link), NFR-S2 (server-side validation)]
- [Source: `_bmad-output/implementation-artifacts/3-5-instant-quiz-grading.md` — confirmed file path `project-e-course/src/`, auth guard pattern, Sonner toast usage, `node:test` testing framework, `lucide-react` availability]
- [Source: `_bmad-output/implementation-artifacts/3-3-progress-tracking-mark-as-complete.md` — `revalidatePath` pattern, `userProgress` schema for cross-reference]

## Dev Agent Record

### Agent Model Used

github-copilot/claude-sonnet-4.6

### Debug Log References

- 2026-03-09: Added schema contract tests for `plans` and `subscriptions`; used failing tests to identify drift between pre-existing schema and Story 4.1 requirements.
- 2026-03-09: Generated `drizzle/0002_icy_sheva_callister.sql` and backfilled local `drizzle.__drizzle_migrations` rows for prior migrations because the local database already contained baseline tables while the migrations journal was empty.
- 2026-03-09: Added `getUserActiveSubscription` query helper plus shared testable logic; installed approved Vitest/testing-library dev dependencies so repo-wide `npm run check` could pass with pre-existing UI test files.
- 2026-03-09: Rewired lesson page access guard to use `getUserActiveSubscription()` directly while preserving the existing single server-side auth redirect path.
- 2026-03-09: Rebuilt `PaywallTeaserOverlay` to match the Story 4.1 UX spec exactly: client component, blur teaser treatment, indigo lock/CTA, and `/pricing` navigation.
- 2026-03-09: Added `isFree` to `SidebarLesson` type pick in `lesson-navigation.shared.ts`, added `isFree` to the DB select in `lesson-navigation.ts`, and rendered conditional Free/Pro badges (with Lock icon on Pro) in `course-sidebar-nav.tsx`. Source-based test in `course-sidebar-nav.test.ts` enforces badge structure, variant, and conditional rendering. All 75 tests pass; TypeScript clean.

### Completion Notes List

- ✅ Corrected existing `plans` and `subscriptions` Drizzle definitions to match Story 4.1: timezone-aware timestamps, nullable `planId`, unique `midtransOrderId`, and removed extra `updatedAt` column.
- ✅ Added `src/server/db/schema.subscriptions.test.ts` to validate the schema contract required by AC 1/6/7.
- ✅ Generated and applied migration `drizzle/0002_icy_sheva_callister.sql` successfully after reconciling local Drizzle migration history.
- ✅ Added `src/server/queries/subscriptions.ts` and `src/server/queries/subscriptions.shared.ts` with `getUserActiveSubscription(userId)` server query behavior aligned to active + unexpired subscription rules.
- ✅ Added `src/server/queries/subscriptions.test.ts` covering no-row, active, expired, and inactive scenarios.
- ✅ Installed missing test dev-dependencies and fixed pre-existing test typing/setup issues so `npm run check` and `npm test` both pass.
- ✅ Updated lesson-page guard logic to use the new subscription query helper and verified paywall visibility logic with helper tests while keeping the existing `/login` redirect behavior intact.
- ✅ Updated `PaywallTeaserOverlay` to the required Pro-member copy and visual treatment, and expanded the source-based test to enforce the required structure, CTA, and lock icon styling.
- ✅ Added `isFree` to `SidebarLesson` type, DB select query, and rendered conditional Free/Pro badges in `CourseSidebarNav` with Lock icon on Pro badge. Source-based test added to enforce badge structure.
- ✅ [AI-Review] Removed duplicate `getLessonById` DB query in `LessonPage` for free lessons.
- ✅ [AI-Review] Added composite index on `subscriptions` table (`userId`, `status`) to optimize premium lesson access checks.
- ✅ [AI-Review] Added `aria-hidden="true"` to Lock icon in `CourseSidebarNav` for accessibility.
- ✅ [AI-Review] Fixed DOM hierarchy in `PaywallTeaserOverlay` to conditionally render `blur-sm` wrapper only if `children` exists.
- ✅ [AI-Review] Added integration test enforcing paywall conditional rendering on premium lessons (`page.integration.test.tsx`).

### File List

- `project-e-course/src/server/db/schema.ts`
- `project-e-course/src/server/db/schema.subscriptions.test.ts`
- `project-e-course/drizzle/0002_icy_sheva_callister.sql`
- `project-e-course/src/server/queries/subscriptions.ts`
- `project-e-course/src/server/queries/subscriptions.shared.ts`
- `project-e-course/src/server/queries/subscriptions.test.ts`
- `project-e-course/package.json`
- `project-e-course/package-lock.json`
- `project-e-course/src/setup-tests.ts`
- `project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx`
- `project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/page.helpers.test.ts`
- `project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/page.test.tsx`
- `project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/page.integration.test.tsx`
- `project-e-course/src/server/courses/lesson-detail.ts`
- `project-e-course/src/server/courses/lesson-detail.test.ts`
- `project-e-course/src/components/student/paywall-teaser-overlay.tsx`
- `project-e-course/src/components/student/paywall-teaser-overlay.test.ts`
- `project-e-course/src/components/student/course-sidebar-nav.tsx`
- `project-e-course/src/components/student/course-sidebar-nav.test.ts`
- `project-e-course/src/server/courses/lesson-navigation.shared.ts`
- `project-e-course/src/server/courses/lesson-navigation.ts`
- `project-e-course/src/components/student/quiz-result-display.test.tsx`
