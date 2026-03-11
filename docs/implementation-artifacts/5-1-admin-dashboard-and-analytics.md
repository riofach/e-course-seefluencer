# Story 5.1: Admin Dashboard & Analytics

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an admin,
I want to access a secure back-office dashboard with high-level platform statistics,
so that I can monitor the overall health of the platform at a glance.

## Acceptance Criteria

1. **Given** I am logged in with role `admin`
   **When** I navigate to `/admin`
   **Then** I am granted access and see the Admin Dashboard page (FR19).

2. **Given** I am logged in with role `student` (or unauthenticated)
   **When** I attempt to navigate to `/admin`
   **Then** the Next.js Edge Middleware (`src/middleware.ts`) intercepts the request and redirects me away (to `/` or `/login`) — I never see the admin page.

3. **Given** I am on the Admin Dashboard
   **When** the page fully loads
   **Then** I can see three analytics stat cards displaying:
   - Total number of **Users** registered on the platform
   - Total number of **Courses** (regardless of published/draft status)
   - Total number of **Active Subscriptions** (where `status = 'active'` AND `endDate > now()`) (FR20).

4. **Given** the database has data
   **When** the stat cards render
   **Then** each card shows an accurate numeric count fetched server-side via a React Server Component (no client-side fetch).

5. **Given** data is loading
   **When** the component is in the loading state
   **Then** skeleton placeholders (not spinners) appear in place of each stat card (NFR-U2).

6. **Given** an admin is authenticated
   **When** the dashboard is visible
   **Then** there is a clear navigation sidebar or header with links to: Dashboard (active), Courses, so that the admin can navigate to other admin sections in Epic 5.

## Tasks / Subtasks

- [x] **Verify/Update Edge Middleware for `/admin/*` protection** (AC: 2)
  - [x] Open `project-e-course/src/middleware.ts`
  - [x] Confirm the `matcher` array includes `/admin/:path*` pattern
  - [x] Confirm it checks `session.user.role === 'admin'` (or TEACHER equivalent) before allowing access
  - [x] Confirm it redirects to `/` or `/login` on unauthorized access
  - [x] DO NOT touch `/api/webhooks/*` matcher — it must stay publicly accessible

- [x] **Create Admin Layout with Sidebar Navigation** (AC: 6)
  - [x] Create `project-e-course/src/app/(admin)/admin/layout.tsx`
  - [x] Sidebar should be Desktop-First — always-open fixed sidebar (per UX spec: Admin is optimized for desktop)
  - [x] Include nav links: Dashboard (`/admin`), Courses (`/admin/courses`)
  - [x] Apply Admin Zone visual style: pure white bg, `#E5E7EB` 1px borders, NO gradients, NO decorative elements
  - [x] Use shadcn/ui `Separator` or plain borders for structure — no decorative blobs or hero gradients
  - [x] Admin zone is ALWAYS light mode — do NOT apply dark mode to admin layout

- [x] **Create Admin Dashboard page with Analytics** (AC: 3, 4, 5)
  - [x] Create `project-e-course/src/app/(admin)/admin/page.tsx` as a React Server Component
  - [x] Fetch all three stats server-side in parallel using `Promise.all()`
  - [x] Render three `StatCard` components with: title label, numeric value, and optional icon
  - [x] Wrap the stats section with `<Suspense fallback={<StatCardsSkeleton />}>` for skeleton loading (AC: 5)

- [x] **Create database query functions for analytics** (AC: 3, 4)
  - [x] Create `project-e-course/src/server/queries/analytics.ts`
  - [x] `getTotalUsersCount(): Promise<number>` — `db.select({ count: count() }).from(users)`
  - [x] `getTotalCoursesCount(): Promise<number>` — `db.select({ count: count() }).from(courses)`
  - [x] `getActiveSubscriptionsCount(): Promise<number>` — query `subscriptions` where `status = 'active'` AND `endDate > new Date()`
  - [x] Use Drizzle `count()` aggregation from `drizzle-orm` — do NOT use `SELECT *` and count in JS
  - [x] Use `gt(subscriptions.endDate, new Date())` for the endDate filter

- [x] **Create StatCard component** (AC: 3, 5)
  - [x] Create `project-e-course/src/components/admin/StatCard.tsx`
  - [x] Props: `{ title: string; value: number; icon?: React.ReactNode }`
  - [x] Use shadcn/ui `Card`, `CardHeader`, `CardTitle`, `CardContent` as base
  - [x] Apply Admin Zone styling: white bg, 1px border, minimal shadow
  - [x] Create `StatCardsSkeleton` component using shadcn `Skeleton` for loading state

- [x] **Create Admin Navbar/Header component** (optional, part of layout)
  - [x] Create `project-e-course/src/components/admin/AdminHeader.tsx`
  - [x] Show user name and a Sign Out button using NextAuth `signOut`
  - [x] Use `NavbarProfileDropdown` pattern established in prior stories if applicable

## Dev Notes

### 🔴 Critical: Physical Project Root

**All source files live under `project-e-course/`**, not the repository root. The `package.json` is at `project-e-course/package.json`. Always prefix file paths with `project-e-course/`.

### 🔴 Critical: Route Group for Admin

The architecture defines admin routes under `src/app/(admin)/admin/` (route group pattern). The route group `(admin)` is just for folder organization — it does NOT appear in the URL. So:

- File: `src/app/(admin)/admin/page.tsx` → URL: `/admin`
- File: `src/app/(admin)/admin/layout.tsx` → Layout for all `/admin/*` routes

Check if `(admin)` route group already exists. If Story 1.5 or prior work created `src/app/(admin)/` folder already, DO NOT create a duplicate — extend it.

### 🔴 Critical: Middleware Must Check `role === 'admin'` NOT Just Auth

```ts
// project-e-course/src/middleware.ts — expected pattern
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
	const token = await getToken({ req, secret: env.NEXTAUTH_SECRET });

	const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');

	if (isAdminRoute) {
		if (!token || token.role !== 'admin') {
			return NextResponse.redirect(new URL('/', req.url));
		}
	}
	// ... other route guards
}

export const config = {
	matcher: ['/courses/:path*', '/admin/:path*', '/profile/:path*'],
};
```

**CRITICAL:** Confirm `token.role` is populated. From Story 1.3, NextAuth was configured with a `session` callback that injects `role` into the JWT token. Verify `src/server/auth.ts` has:

```ts
callbacks: {
  session: ({ session, token }) => ({
    ...session,
    user: {
      ...session.user,
      id: token.sub,
      role: token.role, // ← Must be present
    },
  }),
  jwt: ({ token, user }) => {
    if (user) {
      token.role = user.role; // ← Must be present
    }
    return token;
  },
}
```

If this callback is missing or incomplete, add it — admin access control depends entirely on this.

### 🔴 Critical: Admin Zone Is ALWAYS Light Mode

Per UX spec: `Admin: Pure SaaS minimal — white, 1px borders #E5E7EB, no decorations`. Admin CMS is ALWAYS light mode even if the student app supports dark mode. Do NOT apply `dark:` Tailwind variants or `next-themes` to admin layout. The admin layout should hardcode a `light` class or simply use white/gray Tailwind utilities without conditional dark variants.

### 🔴 Critical: Active Subscription Query — Use endDate Filter

The `getActiveSubscriptionsCount` query **MUST** filter by both `status = 'active'` AND `endDate > now()`. Counting only `status = 'active'` would include expired subscriptions where `endDate` has passed. Drizzle query:

```ts
import { count, gt, and, eq } from 'drizzle-orm';
import { subscriptions } from '~/server/db/schema';

export async function getActiveSubscriptionsCount(): Promise<number> {
	const result = await db
		.select({ count: count() })
		.from(subscriptions)
		.where(and(eq(subscriptions.status, 'active'), gt(subscriptions.endDate, new Date())));
	return result[0]?.count ?? 0;
}
```

### 🔵 Drizzle `count()` Import

```ts
import { count, eq, gt, and } from 'drizzle-orm';

// Total users
const [userResult] = await db.select({ count: count() }).from(users);
const totalUsers = userResult?.count ?? 0;
```

`count()` is from `drizzle-orm`, NOT a custom function. Do NOT use `sql\`COUNT(\*)\`` unless necessary.

### 🔵 Server Component Data Fetching Pattern (No `"use client"`)

The dashboard page is a React Server Component. Fetch all data in parallel at the top level:

```tsx
// src/app/(admin)/admin/page.tsx
import { Suspense } from 'react';
import {
	getTotalUsersCount,
	getTotalCoursesCount,
	getActiveSubscriptionsCount,
} from '~/server/queries/analytics';

export default async function AdminDashboardPage() {
	const [totalUsers, totalCourses, activeSubscriptions] = await Promise.all([
		getTotalUsersCount(),
		getTotalCoursesCount(),
		getActiveSubscriptionsCount(),
	]);

	return (
		<div>
			<h1>Dashboard</h1>
			<Suspense fallback={<StatCardsSkeleton />}>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<StatCard title="Total Users" value={totalUsers} />
					<StatCard title="Total Courses" value={totalCourses} />
					<StatCard title="Active Subscriptions" value={activeSubscriptions} />
				</div>
			</Suspense>
		</div>
	);
}
```

**Note:** Since `Promise.all` is awaited before the Suspense boundary, the Suspense boundary is primarily for any streaming sub-components. You may also wrap the entire data-fetching in a separate `async` component and use Suspense for streaming — either approach is valid.

### 🔵 Admin Layout Structure

Admin layout should use the **Admin Zone** design language. No dark mode, no gradients:

```tsx
// src/app/(admin)/admin/layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-screen bg-white">
			{/* Sidebar */}
			<aside className="w-64 border-r border-[#E5E7EB] bg-white">
				<nav>
					<Link href="/admin">Dashboard</Link>
					<Link href="/admin/courses">Courses</Link>
					{/* More links added in stories 5.2-5.5 */}
				</nav>
			</aside>
			{/* Main Content */}
			<main className="flex-1 p-6">{children}</main>
		</div>
	);
}
```

### 🔵 StatCard Component

Use shadcn `Card` components:

```tsx
// src/components/admin/StatCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

interface StatCardProps {
	title: string;
	value: number;
	icon?: React.ReactNode;
}

export function StatCard({ title, value, icon }: StatCardProps) {
	return (
		<Card className="border border-[#E5E7EB] shadow-none">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
				{icon}
			</CardHeader>
			<CardContent>
				<p className="text-3xl font-bold">{value.toLocaleString()}</p>
			</CardContent>
		</Card>
	);
}
```

### 🔵 Skeleton Loading Pattern

Use shadcn `Skeleton`:

```tsx
import { Skeleton } from '~/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '~/components/ui/card';

export function StatCardsSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
			{[1, 2, 3].map((i) => (
				<Card key={i} className="border border-[#E5E7EB] shadow-none">
					<CardHeader className="pb-2">
						<Skeleton className="h-4 w-32" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-8 w-16" />
					</CardContent>
				</Card>
			))}
		</div>
	);
}
```

### 🔵 Database Schema Reference (Already Exists)

These tables already exist in `project-e-course/src/server/db/schema.ts` — do NOT recreate:

```ts
// Already defined — reference only
users            → id, name, email, role, emailVerified, image, createdAt
courses          → id, title, description, slug, thumbnailUrl, isFree, status, createdAt
subscriptions    → id, userId, planId, status, startDate, endDate, midtransOrderId, createdAt
plans            → id, name, price, durationDays, description, createdAt
```

Import with: `import { users, courses, subscriptions } from '~/server/db/schema';`

### 🔵 TypeScript Conventions (from previous stories)

- **No `any` types** — use Drizzle infer: `typeof users.$inferSelect` when needed
- **Server Action return type:** `ActionResponse<T>` from `~/types/index.ts` — BUT this page uses direct RSC data fetch, no Server Actions needed here
- **File naming:** `kebab-case` for files, `PascalCase` for components
- **Import alias:** Use `~` for `src/` (e.g., `~/server/db/schema`, `~/components/ui/card`)
- **Error boundaries:** Do NOT throw from RSC — wrap in try/catch and return fallback UI

### 🔵 Route Protection Verification

Before implementing, verify that the existing `src/middleware.ts` already handles `/admin` protection from Story 1.3. The middleware matcher was:

```ts
// From Story 4.4 reference:
matcher: ["/courses/:path*", "/admin/:path*", "/profile/:path*"],
```

`/admin/:path*` is already in the matcher ✅. Confirm the middleware body performs the role check. If only auth (not role) is checked, add the `role === 'admin'` check.

### 🔵 Empty State

If the platform has 0 users/courses/subscriptions (fresh DB), the stat cards should display `0` — not an error state or empty state illustration. The count queries should always return a number (defaulting to `0` via `?? 0`).

### 🟡 UX Design Requirements for Admin Zone

Per `ux-design-specification.md`:

- **Admin:** `Pure SaaS minimal — white, 1px borders #E5E7EB, no decorations`
- **Typography:** Inter, tight tracking — informational density over aesthetics
- **Button hierarchy:** Destructive = red, default = utility
- **No dark mode** for admin
- **Desktop-First** — sidebar always open on desktop
- **Emotional goal:** Admin feels `Confident & In Control` — clear visual hierarchy, no noise

### 🟡 Navigation for Future Stories

The admin sidebar added in this story's layout will be the shared navigation for Stories 5.2–5.5. Design it to accommodate future nav items:

- Story 5.2: Courses (`/admin/courses`)
- Story 5.3: (Chapters are nested under courses, not a top-level nav item)
- Story 5.4: (Lessons are nested, not top-level)
- Story 5.5: (Quiz Builder is nested)

Only `Dashboard` and `Courses` are needed at top-level navigation for now.

### 🟡 No Server Actions Needed

This story is a **pure read/display** story. There are NO mutations, no forms, and no Server Actions required. All data is fetched server-side in the RSC page component. Do NOT add `"use server"` to any file in this story.

### 🟢 What Already Exists (DO NOT Recreate)

```
project-e-course/src/server/db/schema.ts          — users, courses, subscriptions, plans tables
project-e-course/src/server/db/index.ts            — db (Drizzle instance)
project-e-course/src/server/auth.ts               — NextAuth config with role in JWT callbacks
project-e-course/src/middleware.ts                 — Route protection with /admin/:path* matcher
project-e-course/src/components/ui/               — All shadcn/ui primitives (card, skeleton, etc.)
project-e-course/src/types/index.ts               — ActionResponse<T> type
project-e-course/src/env.js                       — Environment validation
```

### 🟢 New Files to Create

```
project-e-course/src/app/(admin)/admin/page.tsx            — Admin Dashboard RSC page
project-e-course/src/app/(admin)/admin/layout.tsx           — Admin layout with sidebar
project-e-course/src/server/queries/analytics.ts            — Count queries for dashboard stats
project-e-course/src/components/admin/StatCard.tsx           — Stat card display component
project-e-course/src/components/admin/AdminHeader.tsx        — (optional) Admin header with user info
```

### Project Structure Notes

- All admin routes go under `src/app/(admin)/admin/` to match the architecture's route group pattern
- Admin-specific UI components go under `src/components/admin/` (parallel to existing `src/components/student/`)
- Analytics queries go in `src/server/queries/analytics.ts` — separate from `src/server/queries/subscriptions.ts` (which handles student paywall logic)
- No new database migrations required — all tables already exist from Epics 1–4

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 5 overview, Story 5.1 acceptance criteria (FR19, FR20)]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — `/admin/*` Middleware protection, route group `(admin)`, Admin Zone boundaries, `src/components/admin/` folder, Feature-Sliced Actions, TypeScript strict mode, Drizzle ORM patterns]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — Admin Zone: always light, pure SaaS minimal, white bg + 1px #E5E7EB borders; Desktop-First; Admin emotional goal: Confident & In Control; No skeleton spinner; shadcn/ui Card + Skeleton components]
- [Source: `_bmad-output/planning-artifacts/prd.md` — FR19 (Admin dashboard access), FR20 (Analytics: total users, courses, active subscriptions), NFR-U2 (skeleton loaders), NFR-M1 (TypeScript strict)]
- [Source: `_bmad-output/implementation-artifacts/4-4-webhook-settlement-processing.md` — Physical project root `project-e-course/`, kebab-case file naming, `~/` import alias, Vitest test framework, no `any` types, `ActionResponse<T>` location, existing `subscriptions` schema]

## Dev Agent Record

### Agent Model Used

cliproxy/gpt-5.4

### Debug Log References

- `npm run test`
- `npm run check`
- `npx vitest run src/middleware.test.tsx src/server/queries/analytics.test.tsx src/components/admin/StatCard.test.tsx src/components/admin/AdminHeaderContent.test.tsx "src/app/(admin)/admin/layout.test.tsx" "src/app/(admin)/admin/page.test.tsx"`

### Completion Notes List

- Verified `project-e-course/src/middleware.ts` keeps `/admin/:path*` protected by role-based access and redirects unauthorized users to `/`.
- Implemented admin analytics queries in `project-e-course/src/server/queries/analytics.ts` using Drizzle `count()` and active subscription date filtering.
- Built desktop-first admin shell in `project-e-course/src/app/(admin)/admin/layout.tsx` with always-light sidebar navigation and shared header.
- Added admin dashboard analytics UI in `project-e-course/src/app/(admin)/admin/page.tsx` with server-side `Promise.all()`, Suspense fallback, and skeleton stat cards.
- Added focused regression coverage for middleware, analytics queries, admin header, layout, stat cards, and dashboard rendering paths.

### File List

- `project-e-course/src/middleware.ts`
- `project-e-course/src/middleware.test.tsx`
- `project-e-course/src/server/queries/analytics.ts`
- `project-e-course/src/server/queries/analytics.test.tsx`
- `project-e-course/src/components/admin/StatCard.tsx`
- `project-e-course/src/components/admin/StatCard.test.tsx`
- `project-e-course/src/components/admin/AdminHeader.tsx`
- `project-e-course/src/components/admin/AdminHeaderContent.tsx`
- `project-e-course/src/components/admin/AdminHeaderContent.test.tsx`
- `project-e-course/src/app/(admin)/admin/layout.tsx`
- `project-e-course/src/app/(admin)/admin/layout.test.tsx`
- `project-e-course/src/app/(admin)/admin/page.tsx`
- `project-e-course/src/app/(admin)/admin/page.test.tsx`

## Change Log

- 2026-03-10: Implemented Story 5.1 admin dashboard analytics, admin layout/navigation, middleware redirect adjustment, and supporting tests.

## Code Review Record
- [x] Code Review executed and passed.
- Issues Identified: Missing Active Route State, UX Spec Deviation on Header, Missing Mobile Viewport Handling, Hardcoded Locale in Error Catch Block.
- Actions Taken: Added AdminSidebar for active states, updated AdminHeaderContent to include NavbarProfileDropdown, implemented MobileAdminSidebar with Sheet, translated error texts to English.
