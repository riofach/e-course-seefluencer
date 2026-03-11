# Story 1.4: User Logout

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an authenticated user,
I want to log out of the platform,
so that my session is securely terminated and I am safely redirected to the public area.

## Acceptance Criteria

1. **Given** I am logged in as any role (student or admin), **When** I click the "Logout" button/link anywhere on the app, **Then** my NextAuth session JWT cookie is revoked (FR03) and I am redirected to the landing/login page (`/`).
2. **Given** I have successfully logged out, **When** I attempt to navigate to a protected route (e.g., `/courses`, `/admin`), **Then** the middleware blocks access and redirects me back to `/login`.
3. **Given** I am on any page of the app, **When** a logout button/trigger is available, **Then** it is clearly visible and labeled (e.g., "Sign Out" or "Logout") with accessible labels.
4. **Given** the logout action is triggered, **When** the `signOut()` call is in-flight, **Then** a visual loading indicator is shown (button disabled or shows "Signing out...") to prevent duplicate submissions.
5. **Given** logout completes successfully, **When** the redirect happens, **Then** a Toast Notification confirms the action (e.g., "Signed out successfully.") in accordance with NFR-U3 (≥90% of mutations produce feedback toast).
6. **Given** I am an unauthenticated user, **When** I visit the landing page (`/`), **Then** I see appropriate navigation options (Login / Register links) — not a logout button.

## Tasks / Subtasks

- [x] **Task 1: Create `LogoutButton` Client Component** (AC: #1, #3, #4, #5)
  - [x] Create: `src/components/shared/logout-button.tsx`
  - [x] Mark with `"use client"` at the top
  - [x] Import `signOut` from `next-auth/react`
  - [x] Import `useState` for `isPending` state
  - [x] Import `toast` from `sonner`
  - [x] Import `Button` from `~/components/ui/button`
  - [x] Implement handler:
    ```typescript
    const handleLogout = async () => {
    	setIsPending(true);
    	toast.success('Signed out successfully.');
    	await signOut({ callbackUrl: '/' });
    	// Note: signOut with callbackUrl will redirect — no need to setIsPending(false)
    };
    ```
  - [x] Render a `<Button>` with `onClick={handleLogout}` and `disabled={isPending}`
  - [x] Show "Signing out..." text when `isPending` is true
  - [x] Ensure minimum 44×44px touch target (use `h-11` or `min-h-[44px]`)
  - [x] Expose component props for `variant` and `className` to allow flexible usage (sidebar, navbar, dropdown)

- [x] **Task 2: Add Logout trigger to a Navbar or Layout** (AC: #1, #3, #6)
  - [x] Determine the correct shared layout(s) that authenticated users see:
    - For now: the landing `page.tsx` at root and any future `(student)` or `(admin)` layouts
  - [x] In `src/app/page.tsx` (or a top-level Navbar component), conditionally render `<LogoutButton />` when session exists and show Login/Register links when no session
  - [x] Use `getServerAuthSession()` (Server Component) or `useSession()` (Client Component) to determine auth state
  - [x] **Recommended approach:** Create a minimal `<NavbarAuth />` Server Component in `src/components/shared/navbar-auth.tsx`:
    - Fetch session via `getServerAuthSession()`
    - If session: render `<LogoutButton />` + user name
    - If no session: render `<Link href="/login">Sign In</Link>` + `<Link href="/register">Sign Up</Link>`
  - [x] Place `<NavbarAuth />` in the root `layout.tsx` or add a minimal header bar to `page.tsx`

- [x] **Task 3: Verify middleware behavior post-logout** (AC: #2)
  - [x] Confirm that after `signOut()`, navigating to `/courses` redirects to `/login` (middleware matcher covers it)
  - [x] Confirm that after `signOut()`, navigating to `/admin` redirects to `/login`
  - [x] No code changes needed to `middleware.ts` — it is already correctly configured from Story 1.3

- [x] **Task 4: Final Verification** (AC: all)
  - [x] Run `npm run dev` — dev server starts cleanly
  - [x] Log in as a student → click Logout → confirm redirect to `/` or `/login`
  - [x] After logout, manually navigate to `/courses` → confirm redirect to `/login`
  - [x] Log in as admin → click Logout → confirm redirect to `/` or `/login`
  - [x] After admin logout, manually navigate to `/admin` → confirm redirect to `/login`
  - [x] Confirm toast "Signed out successfully." appears on logout
  - [x] Run `npx tsc --noEmit` — zero TypeScript errors
  - [x] Run `npm run lint` — zero lint errors

## Dev Notes

### 🔴 CRITICAL: All Code Goes Inside `project-e-course/`

All source files for this story MUST be created inside:

```
d:\RioRaditya\Ngoding\hiring-seefluencer\project-e-course\
```

Never place code outside `project-e-course/`. The `_bmad-output/` folder is documentation only.

### 🔴 CRITICAL: Path Alias is `~/` NOT `@/`

This T3 project uses the `~/` path alias (mapped to `./src` in `tsconfig.json`). **All imports MUST use `~/`:**

```typescript
import { getServerAuthSession } from '~/server/auth'; // ✅ CORRECT
import { getServerAuthSession } from '@/server/auth'; // ❌ WRONG — will cause module not found
```

This was a key debug finding from Story 1.2, confirmed in Story 1.3.

### `signOut()` from `next-auth/react` — How It Works

The correct client-side API to trigger NextAuth logout is `signOut()` from `next-auth/react`.

**Key behaviors:**

- `signOut({ callbackUrl: "/" })` — Clears the JWT session cookie AND redirects to the specified URL after sign-out.
- `signOut({ redirect: false })` — Clears the JWT session cookie but does NOT redirect. You would need to call `router.push("/")` manually.
- **Recommended for this story:** Use `signOut({ callbackUrl: "/" })` — simpler, NextAuth handles the redirect.
- The toast should fire **before** `signOut()` because the page redirect will unmount the component, potentially preventing the toast from appearing.

```typescript
const handleLogout = async () => {
	setIsPending(true);
	toast.success('Signed out successfully.'); // Fire toast BEFORE redirect
	await signOut({ callbackUrl: '/' });
};
```

### Session Strategy: JWT (Not Database Sessions)

As established in Story 1.3, `auth.ts` now uses `session: { strategy: "jwt" }`. This means:

- **Logout works by clearing the client-side JWT cookie** — there is no server-side session record to invalidate.
- `signOut()` from `next-auth/react` handles this cookie clearance automatically.
- No Server Action or API call to the database is needed for logout.

### Current JWT Session Strategy in `auth.ts`

```typescript
// src/server/auth.ts (current state after Story 1.3)
export const authOptions: NextAuthOptions = {
	session: { strategy: 'jwt' }, // ← Already set
	pages: {
		signIn: '/login',
	},
	// ...callbacks, adapter, providers...
};
```

No changes to `auth.ts` are needed for this story.

### Current Middleware — Already Handles Post-Logout Protection

```typescript
// src/middleware.ts (current state after Story 1.3)
export const config = {
	matcher: ['/courses/:path*', '/admin/:path*', '/profile/:path*'],
};
```

After `signOut()`, the JWT cookie is cleared. The next navigation to `/courses/*` or `/admin/*` will be caught by the middleware `authorized: ({ token }) => !!token` callback (token is now `null` → `!!null` = `false`), which redirects to `/login`. **No changes needed to `middleware.ts`.**

### Existing Files That Are Ready to Use (Do NOT Recreate)

| File                           | Status    | Notes                                                |
| ------------------------------ | --------- | ---------------------------------------------------- |
| `src/components/ui/button.tsx` | ✅ Exists | shadcn Button — ready to use                         |
| `src/components/ui/sonner.tsx` | ✅ Exists | Sonner toast wrapper — `<Toaster />` in `layout.tsx` |
| `src/server/auth.ts`           | ✅ Exists | No changes needed                                    |
| `src/middleware.ts`            | ✅ Exists | No changes needed                                    |
| `src/app/layout.tsx`           | ✅ Exists | Has `<Toaster position="bottom-right" />` ready      |
| `src/lib/utils.ts`             | ✅ Exists | Has `cn()` utility                                   |

### File Locations — Exact Paths for New Files

| File                             | Path                                                       |
| -------------------------------- | ---------------------------------------------------------- |
| Logout Button Component          | `project-e-course/src/components/shared/logout-button.tsx` |
| Navbar Auth Component (optional) | `project-e-course/src/components/shared/navbar-auth.tsx`   |

### Architecture Compliance Checklist

- [ ] Path alias is `~/` throughout all imports — never `@/`
- [ ] `signOut({ callbackUrl: "/" })` used from `next-auth/react`
- [ ] Toast fires **before** `signOut()` call (before page unload)
- [ ] `isPending` state prevents duplicate submissions
- [ ] `LogoutButton` is a `"use client"` component
- [ ] `NavbarAuth` is a Server Component (reads session server-side)
- [ ] All `className` concatenation uses `cn()` from `~/lib/utils`
- [ ] No `any` TypeScript types used anywhere (NFR-M1)
- [ ] Component touch target minimum `44×44px` for mobile (NFR-U1)
- [ ] Toast notification on logout (NFR-U3)

### UX Spec Compliance for Logout

From `ux-design-specification.md`:

- **Feedback Pattern:** Logout is a user action that must produce a Toast Notification — confirmed by NFR-U3 ("≥90% proses mutasi data pengguna menghasilkan umpan balik visual berupa Toast Notification").
- **Navigation:** After logout, user is redirected to public area (landing page `/` or `/login`). UX spec states: "safely redirect to public area/landing page."
- **Destructive Action Pattern (Optional consideration):** Logout is NOT a destructive action (no data is deleted), so it does NOT require a confirmation dialog. A direct click → logout flow is the correct UX.
- **Button Styling:** The logout button should use `variant="outline"` or `variant="ghost"` (secondary action), NOT the primary `bg-indigo-600` style — that is reserved for the single primary action per screen.

### `useSession()` vs Server Component Session Check

- **`LogoutButton`** — must be `"use client"` to use `signOut()`. It does NOT need to know the session state itself; it just triggers logout.
- **`NavbarAuth`** — should be a **Server Component** to read session via `getServerAuthSession()` and conditionally render either `<LogoutButton />` or Login/Register links. This avoids a client-side `useSession()` flash on page load.

### No Database Changes Required

This story requires **zero database schema changes**. Logout is purely a cookie/JWT operation. No new npm packages are needed — `next-auth` is already installed.

## Previous Story Intelligence (Story 1.3 — Done)

Key learnings from Story 1.3 that directly impact Story 1.4:

- ✅ **Path alias `~/`** — confirmed critical, must use everywhere
- ✅ **`signIn` from `next-auth/react`** — Login used `signIn()` client-side; Logout uses `signOut()` same library
- ✅ **JWT strategy confirmed** — `session: { strategy: "jwt" }` is set in `auth.ts` — logout clears cookie, no DB involvement
- ✅ **`useState` for pending state** — same pattern as login form for tracking `isPending`
- ✅ **Sonner toasts** — `import { toast } from "sonner"` — `<Toaster />` already in `layout.tsx`
- ✅ **Middleware already handles post-logout protection** — `/courses/:path*`, `/admin/:path*`, `/profile/:path*` all protected
- ✅ **`router.refresh()`** — After `signOut({ redirect: false })`, call `router.refresh()` to force RSC re-render. If using `callbackUrl`, the redirect handles this automatically.
- ✅ **`shadcn Button`** at `src/components/ui/button.tsx` — ready to use
- ⚠️ **Story 1.3 note:** The current landing `page.tsx` is a bare-bones placeholder. Story 1.4 needs to add at least a minimal navigation bar or header that shows auth state (login/register vs. logout). Keep it minimal — a full landing page is NOT in scope here.

## Git Intelligence

Recent commits:

- `9317230` (HEAD → main) — "1-3-user-login-and-session-management, done testing" (login form, middleware RBAC, LoginSchema, CredentialsProvider, auth.ts JWT strategy)
- `5631c4f` — "Story 1.2: User Registration, done testing" (register form, register Server Action, bcryptjs password hash, `(auth)` layout)
- `8c15f96` — "first commit" (T3 App scaffold, Drizzle schema, NextAuth base setup)

Code patterns established in previous stories to continue:

- `"use client"` on any component that uses browser hooks (`useState`, `signIn`, `signOut`)
- `async/await` for all NextAuth calls
- `toast.success()` / `toast.error()` from `"sonner"` for user feedback
- Indigo primary buttons (`bg-indigo-600`), ghost/outline for secondary actions
- Server Components for reading session state (`getServerAuthSession()`)

## Project Structure Notes

Files to CREATE in this story:

- **NEW:** `src/components/shared/logout-button.tsx` — Client Component with `signOut()` + toast
- **NEW (Recommended):** `src/components/shared/navbar-auth.tsx` — Server Component, conditional auth nav links

Files to MODIFY in this story:

- **MODIFY (Minimal):** `src/app/page.tsx` — Add `<NavbarAuth />` (or inline session-based nav) to the landing page so users can see Login/Register/Logout links

Files that are **unchanged** from previous stories:

- `src/server/auth.ts` — No changes needed
- `src/middleware.ts` — No changes needed
- `src/app/layout.tsx` — No changes needed
- All `src/components/ui/*` — Use as-is

### Alignment with Architecture Spec

- ✅ `LogoutButton` in `components/shared/` — aligns with architecture spec's shared components zone
- ✅ No new Server Actions created — logout is a client-side NextAuth operation
- ✅ No new `/api` routes — NextAuth's built-in `/api/auth/signout` handles cookie clearance internally
- ✅ Middleware at `src/middleware.ts` — unchanged, already correctly protects all routes post-logout

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.4`] — User story statement and acceptance criteria
- [Source: `_bmad-output/planning-artifacts/epics.md#FR03`] — User logs out and session cookie is revoked
- [Source: `_bmad-output/planning-artifacts/epics.md#NFR-U3`] — ≥90% mutations produce Toast Notification
- [Source: `_bmad-output/planning-artifacts/architecture.md#API & Communication Patterns`] — Server Actions/NextAuth conventions
- [Source: `_bmad-output/planning-artifacts/architecture.md#Architectural Boundaries`] — Middleware protects all `/admin/*`, `/courses/*`
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Feedback Patterns`] — Toast/Sonner for success feedback
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Button Hierarchy`] — Secondary action = outline/ghost style
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Accessibility`] — Touch target minimum 44×44px
- [Source: `_bmad-output/implementation-artifacts/1-3-user-login-and-session-management.md#Dev Notes`] — Path alias (`~/`), JWT strategy, existing files, `signIn` pattern

## Dev Agent Record

### Agent Model Used

claude-sonnet-4.6 (github-copilot/claude-sonnet-4.6) — Story 1.4 Context Engine | 2026-03-07

### Debug Log References

- ESLint checks: Fix logical OR inside `navbar-auth.tsx` requiring nullish coalescing operator `??`.
- ESLint checks: `auth.ts` required optional chaining check for password verification logic.
- Unused import warnings resolved in `schema.ts`.

### Completion Notes List

- Evaluated behavior of NextAuth user session and `signOut`. Added `<LogoutButton />` component configured with `isPending` state handling to disable it safely during ongoing requests and dispatch a sonner toast event for clear feedback.
- Created `<NavbarAuth />` wrapper reading Server Side Session using `getServerAuthSession()` and placed properly at the top of the root `page.tsx`. If no active session, it points to login/register routes.
- Middleware confirmed intact and blocking routes without any modifications.

### File List

- `project-e-course/src/components/shared/logout-button.tsx` (NEW)
- `project-e-course/src/components/shared/navbar-auth.tsx` (NEW)
- `project-e-course/src/app/page.tsx` (MODIFIED)
- `project-e-course/src/server/auth.ts` (MODIFIED - Linter fixes)
- `project-e-course/src/server/db/schema.ts` (MODIFIED - Linter fixes)
- `project-e-course/src/components/shared/logout-button.tsx` (MODIFIED - AI Review fixes)
