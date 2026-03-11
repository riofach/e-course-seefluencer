# Story 1.5: Profile Management

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an authenticated user,
I want to view and edit my profile name,
so that my identity is personalized on the platform.

## Acceptance Criteria

1. **Given** I am logged in and navigate to `/profile`, **When** the page loads, **Then** I see my current name and email displayed (FR04).
2. **Given** I am on the profile page, **When** I update my name and click "Save", **Then** the change is persisted to the `users` table via a Server Action `{ success: true, data: undefined }`.
3. **Given** the update succeeds, **When** the save completes, **Then** a Toast Notification confirms "Profile updated successfully." (NFR-U3).
4. **Given** I submit an empty name or invalid input (< 2 characters), **When** I click "Save", **Then** client-side Zod validation rejects the form and shows a per-field red error message **without** sending a server request.
5. **Given** a server error occurs, **When** the save action returns `{ success: false, error: string }`, **Then** a Toast notification with the error message is shown (destructive variant).
6. **Given** I am an unauthenticated user, **When** I navigate directly to `/profile`, **Then** the middleware intercepts and redirects me to `/login` (middleware matcher already covers `/profile/:path*` — no new config needed).
7. **Given** the profile form is loading data, **When** fetch is in-flight, **Then** the UI shows a Skeleton Loader for the form fields (NFR-U2) — no blank screen.

## Tasks / Subtasks

- [x] **Task 1: Create `updateProfile` Server Action** (AC: #2, #4, #5)
  - [x] Create file: `src/server/actions/auth/update-profile.ts`
  - [x] Add `"use server"` directive at top
  - [x] Define `ProfileSchema` in `src/server/actions/auth/schemas.ts`:
    ```typescript
    export const ProfileSchema = z.object({
    	name: z.string().min(2, 'Name must be at least 2 characters.').max(100),
    });
    ```
  - [x] Implement `updateProfile(_prevState, formData)` with signature `(ActionResponse | null, FormData) => Promise<ActionResponse>`:

    ```typescript
    'use server';
    import { getServerAuthSession } from '~/server/auth';
    import { db } from '~/server/db';
    import { users } from '~/server/db/schema';
    import { eq } from 'drizzle-orm';
    import { revalidatePath } from 'next/cache';
    import { ProfileSchema } from './schemas';
    import type { ActionResponse } from '~/types';

    export async function updateProfile(
    	_prevState: ActionResponse | null,
    	formData: FormData,
    ): Promise<ActionResponse> {
    	const session = await getServerAuthSession();
    	if (!session?.user?.id) {
    		return { success: false, error: 'Unauthorized.' };
    	}
    	const parsed = ProfileSchema.safeParse({ name: formData.get('name') });
    	if (!parsed.success) {
    		return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input.' };
    	}
    	await db.update(users).set({ name: parsed.data.name }).where(eq(users.id, session.user.id));
    	revalidatePath('/profile');
    	return { success: true, data: undefined };
    }
    ```

  - [x] Call `revalidatePath("/profile")` after successful DB update to refresh RSC

- [x] **Task 2: Create Profile Page at `/profile`** (AC: #1, #3, #4, #5, #7)
  - [x] Create: `src/app/(student)/profile/page.tsx` ← **read route group below**
  - [x] Make it a **Server Component** that fetches session via `getServerAuthSession()` and current user name from DB:

    ```typescript
    import { getServerAuthSession } from "~/server/auth";
    import { db } from "~/server/db";
    import { users } from "~/server/db/schema";
    import { eq } from "drizzle-orm";
    import { redirect } from "next/navigation";
    import { ProfileForm } from "~/components/shared/profile-form";

    export default async function ProfilePage() {
      const session = await getServerAuthSession();
      if (!session?.user?.id) redirect("/login");
      const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
        columns: { name: true, email: true },
      });
      return (
        <main className="mx-auto max-w-lg py-10 px-4">
          <h1 className="mb-6 text-2xl font-semibold">Profile Settings</h1>
          <ProfileForm initialName={user?.name ?? ""} email={session.user.email ?? ""} />
        </main>
      );
    }
    ```

  - [x] **Note:** `/profile` is protected by middleware at `matcher: ["/profile/:path*"]` — no additional auth check needed in middleware, but always verify session in Server Component as defense-in-depth.

- [x] **Task 3: Create `ProfileForm` Client Component** (AC: #3, #4, #5)
  - [x] Create: `src/components/shared/profile-form.tsx`
  - [x] Mark `"use client"` at top
  - [x] Use `useActionState` (React 19) + `useFormStatus` for pending state — **same pattern as login/register forms**
  - [x] Use `react-hook-form` + `@hookform/resolvers/zod` for client-side validation with `ProfileSchema`:

    ```typescript
    "use client";
    import { useActionState } from "react";
    import { useEffect } from "react";
    import { toast } from "sonner";
    import { updateProfile } from "~/server/actions/auth/update-profile";
    import { Button } from "~/components/ui/button";
    import { Input } from "~/components/ui/input";
    import { Label } from "~/components/ui/label";
    import type { ActionResponse } from "~/types";

    interface ProfileFormProps {
      initialName: string;
      email: string;
    }

    export function ProfileForm({ initialName, email }: ProfileFormProps) {
      const [state, formAction, isPending] = useActionState<ActionResponse | null, FormData>(
        updateProfile,
        null,
      );

      useEffect(() => {
        if (state?.success === true) {
          toast.success("Profile updated successfully.");
        } else if (state?.success === false) {
          toast.error(state.error);
        }
      }, [state]);

      return (
        <form action={formAction} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" name="name" defaultValue={initialName} disabled={isPending} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" value={email} disabled readOnly />
            <p className="text-sm text-muted-foreground">Email cannot be changed.</p>
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      );
    }
    ```

  - [x] Show `state.error` inline under name field if it contains a validation error (optional but better UX)
  - [x] Email field is read-only — never pass it to the server action; only `name` is mutable

- [x] **Task 4: Add Profile link to Navbar** (AC: #1)
  - [x] Modify: `src/components/shared/navbar-auth.tsx` (ALREADY EXISTS from Story 1.4)
  - [x] Add a `<Link href="/profile">Profile</Link>` link next to the `<LogoutButton />` when session exists
  - [x] Keep minimal — no avatar/image required (image column is nullable)

- [x] **Task 5: Final Verification** (AC: all)
  - [x] Log in as student → navigate to `/profile` → confirm name/email displayed
  - [x] Update name → save → confirm toast "Profile updated successfully." appears
  - [x] Refresh `/profile` → confirm name persisted from DB (revalidatePath worked)
  - [x] Log out → navigate to `/profile` directly → confirm redirect to `/login`
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
import { getServerAuthSession } from '@/server/auth'; // ❌ WRONG — module not found
```

### Route Group for Profile Page

The `/profile` route must live inside the `(student)` route group because:

- The middleware matcher already protects `/profile/:path*`
- It is a student-facing page (not admin, not auth)
- Architecture spec places student pages in `src/app/(student)/`

**Correct path:** `src/app/(student)/profile/page.tsx`

> ⚠️ If a `(student)` layout does not yet exist at `src/app/(student)/layout.tsx`, create a minimal passthrough layout:
>
> ```tsx
> export default function StudentLayout({ children }: { children: React.ReactNode }) {
> 	return <>{children}</>;
> }
> ```

### `useActionState` Pattern (React 19 — Matches Existing Stories)

All forms in this project use `useActionState` from React 19 (not the older `useFormState`). This is already established in Stories 1.2 and 1.3. Follow the **exact same pattern**:

```typescript
const [state, formAction, isPending] = useActionState<ActionResponse | null, FormData>(
	updateProfile,
	null,
);
```

The `isPending` boolean from `useActionState` replaces the need for `useState` + `setIsPending` pattern (which was used in Story 1.4's `LogoutButton` since it uses `signOut` directly, not a Server Action).

### Server Action Pattern — Exact Contract Required

Every Server Action in this project MUST return `ActionResponse<T>` from `~/types/index.ts`:

```typescript
export type ActionResponse<T = undefined> =
	| { success: true; data: T }
	| { success: false; error: string };
```

For profile update, the success case returns `{ success: true, data: undefined }` (no data needed — just confirmation).

### Database: `users` Table Schema (from `schema.ts`)

The relevant columns for this story:

```typescript
// src/server/db/schema.ts
export const users = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name'), // ← This is what we update
	email: text('email').unique(), // ← Read-only, shown for display
	role: varchar('role', { length: 20 }).default('student').notNull(),
	password: varchar('password', { length: 255 }),
});
```

**Only `name` is mutable in this story.** Do NOT allow updating `email`, `role`, or `password` here — those are out of scope.

### `revalidatePath` After Mutation — REQUIRED

After updating the `users` table, call `revalidatePath("/profile")` to bust Next.js RSC cache and force the page to re-render with fresh data on the next visit:

```typescript
import { revalidatePath } from 'next/cache';
// After successful db.update(...)
revalidatePath('/profile');
```

Without this, the page will serve a stale cached version of the user's name.

### Session vs. DB for Display

- Use **`session.user.email`** for displaying email (already in JWT — no DB query needed)
- Use **DB query** for `name` to always show the latest value (not the potentially stale JWT cache)
- The JWT `name` field is only refreshed on next login — DB is the source of truth for profile display

### Existing Files That Are Ready to Use (Do NOT Recreate)

| File                                    | Status    | Notes                                                                |
| --------------------------------------- | --------- | -------------------------------------------------------------------- |
| `src/components/ui/button.tsx`          | ✅ Exists | shadcn Button — ready to use                                         |
| `src/components/ui/input.tsx`           | ✅ Exists | shadcn Input — ready to use                                          |
| `src/components/ui/label.tsx`           | ✅ Exists | shadcn Label — ready to use                                          |
| `src/components/ui/sonner.tsx`          | ✅ Exists | Sonner toast wrapper — `<Toaster />` in `layout.tsx`                 |
| `src/server/auth.ts`                    | ✅ Exists | `getServerAuthSession()` available — no changes needed               |
| `src/middleware.ts`                     | ✅ Exists | Already protects `/profile/:path*` — no changes needed               |
| `src/server/actions/auth/schemas.ts`    | ✅ Exists | Add `ProfileSchema` here (LoginSchema, RegisterSchema already there) |
| `src/types/index.ts`                    | ✅ Exists | `ActionResponse<T>` type — import and use                            |
| `src/lib/utils.ts`                      | ✅ Exists | `cn()` utility — use for className concatenation                     |
| `src/components/shared/navbar-auth.tsx` | ✅ Exists | ADD profile link here — do NOT recreate                              |

### File Locations — Exact Paths for New Files

| File                         | Path                                                         |
| ---------------------------- | ------------------------------------------------------------ |
| Update Profile Server Action | `project-e-course/src/server/actions/auth/update-profile.ts` |
| Profile Page                 | `project-e-course/src/app/(student)/profile/page.tsx`        |
| Student Layout (if needed)   | `project-e-course/src/app/(student)/layout.tsx`              |
| Profile Form Component       | `project-e-course/src/components/shared/profile-form.tsx`    |

### Skeleton Loader for Profile Form (NFR-U2)

To satisfy NFR-U2 (skeleton loaders instead of blank screens), add a `loading.tsx` at:
`src/app/(student)/profile/loading.tsx`

```tsx
import { Skeleton } from '~/components/ui/skeleton';

export default function ProfileLoading() {
	return (
		<div className="mx-auto max-w-lg py-10 px-4 space-y-4">
			<Skeleton className="h-8 w-48" />
			<Skeleton className="h-10 w-full" />
			<Skeleton className="h-10 w-full" />
			<Skeleton className="h-10 w-full" />
		</div>
	);
}
```

> **Check:** If `shadcn/ui Skeleton` component is not yet installed, install it: `npx shadcn@latest add skeleton`. If unavailable, use a simple Tailwind `animate-pulse` div as fallback.

### Architecture Compliance Checklist

- [ ] Path alias is `~/` throughout all imports — never `@/`
- [ ] Server Action `updateProfile` in `src/server/actions/auth/` (Feature-Sliced Actions)
- [ ] Server Action returns `ActionResponse<undefined>` — matches project-wide contract
- [ ] Server Action validates session via `getServerAuthSession()` — auth guard
- [ ] `revalidatePath("/profile")` called after successful DB update
- [ ] `ProfileSchema` added to existing `src/server/actions/auth/schemas.ts` (no new file)
- [ ] Profile Page is a Server Component; Profile Form is a `"use client"` component
- [ ] `useActionState` (React 19) used — not `useFormState` (deprecated) or manual `useState`
- [ ] Email is read-only — not sent to server, not updatable via this story
- [ ] No `any` TypeScript types (NFR-M1)
- [ ] Toast notification on success and error (NFR-U3)
- [ ] Skeleton loader on `/profile/loading.tsx` (NFR-U2)
- [ ] All `className` concatenation uses `cn()` from `~/lib/utils`
- [ ] Touch target minimum `44×44px` for Save button on mobile (NFR-U1) — `h-11` or `min-h-[44px]`
- [ ] Dark Mode compatible — use Tailwind semantic color classes (no hardcoded hex values)

### UX Spec Compliance for Profile

From `ux-design-specification.md`:

- **Form Validation:** On-blur strategy preferred. For this story, Zod error on `useActionState` response is acceptable since the name field is simple.
- **Button Hierarchy:** "Save Changes" is the **primary action** — use `bg-indigo-600` / shadcn `default` variant (not outline/ghost).
- **Feedback:** Both success and error states must produce Toast Notifications (NFR-U3 ≥90% of mutations).
- **Empty/Loading States:** Skeleton loader on loading.tsx (NFR-U2).
- **Form placement:** Action button at bottom-right per UX spec. Or full-width for single-column forms (acceptable for profile edit).
- **Error messages:** Per-field red highlight preferred. For server-level errors, use destructive toast.

### No New Database Migrations Required

The `users` table already has the `name: text("name")` column. No schema changes. No `drizzle-kit` push needed for this story.

### Scope Boundaries — What is NOT in This Story

- ❌ Password change — out of scope (no `oldPassword`/`newPassword` fields)
- ❌ Avatar/profile image upload — out of scope (image column is nullable, stays null)
- ❌ Email change — out of scope
- ❌ Account deletion — out of scope
- ❌ Student dashboard page — out of scope for this story (Epic 2)

### Project Structure Notes

Files to CREATE in this story:

- **NEW:** `src/server/actions/auth/update-profile.ts` — Server Action for name update
- **NEW:** `src/app/(student)/profile/page.tsx` — Profile page (Server Component)
- **NEW (if not exists):** `src/app/(student)/layout.tsx` — Minimal passthrough layout for (student) group
- **NEW:** `src/components/shared/profile-form.tsx` — Client Component for form
- **NEW (optional):** `src/app/(student)/profile/loading.tsx` — Skeleton loader (NFR-U2)

Files to MODIFY in this story:

- **MODIFY:** `src/server/actions/auth/schemas.ts` — Add `ProfileSchema` (export alongside existing LoginSchema, RegisterSchema)
- **MODIFY:** `src/components/shared/navbar-auth.tsx` — Add `/profile` link when session exists

Files that are **unchanged** from previous stories:

- `src/server/auth.ts` — No changes needed
- `src/middleware.ts` — Already covers `/profile/:path*`
- `src/app/layout.tsx` — No changes needed
- `src/server/db/schema.ts` — No changes needed (name column already exists)
- All `src/components/ui/*` — Use as-is

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.5`] — User story statement and acceptance criteria
- [Source: `_bmad-output/planning-artifacts/epics.md#FR04`] — User views and updates profile name
- [Source: `_bmad-output/planning-artifacts/epics.md#NFR-U3`] — ≥90% mutations produce Toast Notification
- [Source: `_bmad-output/planning-artifacts/epics.md#NFR-U2`] — Skeleton loaders instead of blank screens
- [Source: `_bmad-output/planning-artifacts/architecture.md#API & Communication Patterns`] — Server Actions return `{ success: true/false }` contract
- [Source: `_bmad-output/planning-artifacts/architecture.md#Structure Patterns`] — Server Actions in `server/actions/[feature]/`
- [Source: `_bmad-output/planning-artifacts/architecture.md#Project Structure`] — `(student)` route group for student pages
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Feedback Patterns`] — Toast/Sonner on success and destructive on error
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Button Hierarchy`] — Primary action button style
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Form Patterns`] — On-blur validation, no blank screens
- [Source: `_bmad-output/implementation-artifacts/1-4-user-logout.md#Dev Notes`] — Path alias `~/`, existing component inventory, JWT strategy
- [Source: `project-e-course/src/server/db/schema.ts`] — `users` table with `name: text("name")` column
- [Source: `project-e-course/src/types/index.ts`] — `ActionResponse<T>` type definition
- [Source: `project-e-course/src/server/auth.ts`] — `getServerAuthSession()` for Server Components

## Previous Story Intelligence (Story 1.4 — done, Story 1.3 — done)

Key learnings from Stories 1.3 and 1.4 that directly impact Story 1.5:

- ✅ **Path alias `~/`** — Confirmed critical, must use everywhere (never `@/`)
- ✅ **`useActionState` from React 19** — Established in Stories 1.2/1.3 for Server Action forms
- ✅ **`ActionResponse<T>` contract** — All Server Actions return `{ success: true, data: T }` or `{ success: false, error: string }`
- ✅ **Sonner toasts** — `import { toast } from "sonner"`. `<Toaster />` already in `root layout.tsx` — nothing to add
- ✅ **JWT strategy** — `session: { strategy: "jwt" }` in `auth.ts`. `session.user.id` and `session.user.role` are available in JWT token
- ✅ **`getServerAuthSession()`** — Use in Server Components (no args needed: `await getServerAuthSession()`)
- ✅ **Middleware already protects `/profile/:path*`** — From Story 1.3 config, confirmed in Story 1.4 — zero changes needed
- ✅ **shadcn `Button`, `Input`, `Label` exist** — At `src/components/ui/` — import directly
- ✅ **`cn()` from `~/lib/utils`** — For all className concatenation
- ✅ **`NavbarAuth` Server Component** — Created in Story 1.4 at `src/components/shared/navbar-auth.tsx` — MODIFY to add Profile link
- ⚠️ **`(student)` route group may not have a `layout.tsx` yet** — If it doesn't exist, create minimal passthrough before adding profile page to avoid build errors
- ⚠️ **`useActionState` vs. `useFormState`** — Always use `useActionState` (React 19 stable API); `useFormState` is deprecated
- ⚠️ **`revalidatePath` is critical** — Without it, the profile page will show the old name from Next.js cache after update

## Dev Agent Record

### Agent Model Used

claude-sonnet-4.6 (github-copilot/claude-sonnet-4.6) — Story 1.5 Context Engine | 2026-03-07

### Debug Log References

### Completion Notes List

- Implemented `updateProfile` Server Action using `Drizzle` and `Zod`.
- Created Server Component profile page rendering a Client Component profile form.
- Implemented React 19 `useActionState` matching prior login/logout patterns.
- Ensured form includes `shadcn/ui` integration with `Sonner` toasts.
- Created `loading.tsx` to display Skeleton loaders when loading from server.
- Linked Profile page in the `NavbarAuth` component.
- Validated via TS compiler and Linter successfully.

### Code Review Fixes (2026-03-07)

- **[High] Missing Client-Side Zod Validation:** Fixed by integrating `react-hook-form` and `@hookform/resolvers/zod` into `ProfileForm` to validate against `ProfileSchema` before submission.
- **[Medium] Stale Nav Name:** Fixed `NavbarAuth` to query `db.users` for the latest name instead of relying on the potentially stale `session.user.name`.
- **[Low] Double Error Feedback UX:** Removed the inline error rendering under the name field if the error comes from the server, relying solely on `toast.error` as configured.

### File List

- `src/server/actions/auth/schemas.ts` (Modified)
- `src/server/actions/auth/update-profile.ts` (New)
- `src/app/(student)/layout.tsx` (New)
- `src/app/(student)/profile/page.tsx` (New)
- `src/app/(student)/profile/loading.tsx` (New)
- `src/components/shared/profile-form.tsx` (New, Modified)
- `src/components/shared/navbar-auth.tsx` (Modified)
