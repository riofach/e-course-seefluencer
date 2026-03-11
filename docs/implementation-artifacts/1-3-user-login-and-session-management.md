# Story 1.3: User Login & Session Management

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a registered user,
I want to log in securely with my email and password,
so that the system remembers my identity across pages and grants me role-appropriate access.

## Acceptance Criteria

1. **Given** I navigate to `/login`, **When** the login page loads, **Then** I see a form with fields for _email_ and _password_ — each field displays an appropriate validation error if left empty or incorrectly filled (on-blur validation).
2. **Given** I submit correct credentials (email + password), **When** the NextAuth CredentialsProvider validates them, **Then** a secure session cookie is created via NextAuth (FR02) and I am redirected to `/courses`.
3. **Given** I submit incorrect credentials (wrong password or non-existent email), **When** the Server Action/CredentialsProvider returns an error, **Then** I see an inline error message: "Invalid email or password." (no disclosure of which field is wrong — security best practice).
4. **Given** I am already authenticated, **When** I navigate to `/login`, **Then** I am automatically redirected to `/courses`.
5. **Given** I submit credentials for an account with `role: "admin"`, **When** NextAuth creates the session, **Then** the session contains `user.role = "admin"` and the middleware correctly identifies and allows access to `/admin/*` routes.
6. **Given** I submit credentials for an account with `role: "student"`, **When** NextAuth creates the session, **Then** I am redirected to `/courses` and cannot access `/admin/*` routes (middleware returns 403/redirect).
7. **Given** the form is submitting (pending state), **When** the NextAuth `signIn()` call is in-flight, **Then** the submit button shows a loading indicator and is disabled to prevent duplicate submissions.
8. **Given** I am unauthenticated, **When** I try to directly navigate to a protected route (e.g., `/courses/[slug]/lesson`), **Then** the Next.js Edge Middleware redirects me to `/login` (NFR-S2).

## Tasks / Subtasks

- [x] **Task 1: Configure CredentialsProvider in NextAuth** (AC: #2, #3, #5, #6)
  - [x] Open `src/server/auth.ts`
  - [x] Import `CredentialsProvider` from `next-auth/providers/credentials`
  - [x] Import `bcryptjs` (as `bcrypt`), `eq` from `drizzle-orm`, `db` and `users` from their paths
  - [x] Import the `LoginSchema` Zod schema (to be created in Task 2)
  - [x] Add `CredentialsProvider` to the `providers` array:
    ```typescript
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1. Validate with LoginSchema.safeParse() — return null on failure
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        // 2. Look up user by email
        const user = await db.query.users.findFirst({
          where: eq(users.email, parsed.data.email),
        });
        // 3. If no user or no password (OAuth-only account), return null
        if (!user || !user.password) return null;
        // 4. Compare password with bcrypt.compare()
        const isValid = await bcrypt.compare(parsed.data.password, user.password);
        if (!isValid) return null;
        // 5. Return user object (NextAuth uses this to build the session)
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
    ```
  - [x] Ensure the `session` callback in `authOptions` already passes `role` (it does — from Story 1.1 setup)
  - [x] Add `pages` config to override the default NextAuth login page:
    ```typescript
    pages: {
      signIn: "/login",
    },
    ```

- [x] **Task 2: Create Login Zod Schema** (AC: #1, #3)
  - [x] Open (or create if not exists): `src/server/actions/auth/schemas.ts`
  - [x] Add `LoginSchema` export alongside existing `RegisterSchema`:
    ```typescript
    export const LoginSchema = z.object({
    	email: z.string().email('Please enter a valid email address'),
    	password: z.string().min(1, 'Password is required'),
    });
    export type LoginInput = z.infer<typeof LoginSchema>;
    ```
  - [x] **NOTE:** Password minimum is `1` (not 8) for login — don't block login with a validation rule the user can't see

- [x] **Task 3: Create the Login Page** (AC: #1, #4)
  - [x] Create directory and file: `src/app/(auth)/login/page.tsx`
  - [x] This is a **Server Component** — check for existing session at page level and redirect if already authenticated:
    ```typescript
    import { getServerAuthSession } from '~/server/auth';
    import { redirect } from 'next/navigation';
    const session = await getServerAuthSession();
    if (session) redirect('/courses');
    ```
  - [x] Render the `<LoginForm />` client component within the existing `(auth)` layout (already created in Story 1.2 — `src/app/(auth)/layout.tsx`)
  - [x] Add title metadata: `export const metadata = { title: "Sign In | Learning Platform" }`

- [x] **Task 4: Create the `LoginForm` Client Component** (AC: #1, #2, #3, #7)
  - [x] Create: `src/components/shared/login-form.tsx`
  - [x] Mark with `"use client"` at the top
  - [x] Use `useForm<LoginInput>` from `react-hook-form` with `zodResolver(LoginSchema)` and `mode: "onBlur"`
  - [x] Use `useRouter` from `next/navigation` for post-login redirect
  - [x] Use `useState` for tracking `isPending` loading state
  - [x] Import `signIn` from `next-auth/react` for credential sign-in
  - [x] Form submit handler:
    ```typescript
    const onSubmit = async (data: LoginInput) => {
    	setIsPending(true);
    	const result = await signIn('credentials', {
    		email: data.email,
    		password: data.password,
    		redirect: false, // CRITICAL: handle redirect manually for error handling
    	});
    	setIsPending(false);
    	if (result?.error) {
    		// result.error = "CredentialsSignin" on wrong password (NextAuth default)
    		toast.error('Invalid email or password.');
    		form.setError('root', { message: 'Invalid email or password.' });
    		return;
    	}
    	toast.success('Welcome back!');
    	router.push('/courses');
    	router.refresh(); // Ensure server components re-render with new session
    };
    ```
  - [x] Form fields (using shadcn/ui `Input`, `Label`, `Button`):
    - **Email:** `<Input id="login-email" type="email" {...form.register("email")} />` with error display
    - **Password:** `<Input id="login-password" type="password" {...form.register("password")} />` with error display
  - [x] If `form.formState.errors.root` exists, render a form-level alert with the error message
  - [x] Submit button: disabled and showing "Signing in..." when `isPending`
  - [x] Style with shadcn/ui `Card`, `CardHeader`, `CardContent`, `CardTitle`, `CardDescription`
  - [x] Add link to `/register`: "Don't have an account? Sign up"
  - [x] Primary button: `bg-indigo-600 hover:bg-indigo-700` (matches Story 1.2 register form)
  - [x] ⚠️ **CRITICAL:** Use `redirect: false` in `signIn()` — if `redirect: true`, error handling becomes impossible because NextAuth redirects before you can read the result

- [x] **Task 5: Update Edge Middleware for RBAC** (AC: #6, #8)
  - [x] Open `src/middleware.ts`
  - [x] The current middleware from Story 1.1 likely contains a basic matcher — enhance it for full RBAC:

    ```typescript
    import { withAuth } from 'next-auth/middleware';
    import { NextResponse } from 'next/server';

    export default withAuth(
    	function middleware(req) {
    		const token = req.nextauth.token;
    		const pathname = req.nextUrl.pathname;

    		// Admin route protection
    		if (pathname.startsWith('/admin')) {
    			if (token?.role !== 'admin') {
    				return NextResponse.redirect(new URL('/courses', req.url));
    			}
    		}

    		return NextResponse.next();
    	},
    	{
    		callbacks: {
    			authorized: ({ token }) => !!token, // Must be authenticated for all protected routes
    		},
    	},
    );

    export const config = {
    	matcher: ['/courses/:path*', '/admin/:path*', '/profile/:path*'],
    };
    ```

  - [x] **IMPORTANT:** The `withAuth` wrapper uses the NextAuth JWT token (not the database session). This works because we will configure `session: { strategy: "jwt" }` in auth options — OR if using the database session adapter, use a different approach (see Dev Notes below).
  - [x] **KEY DECISION:** NextAuth v4 with DrizzleAdapter defaults to **database sessions** (not JWT). `withAuth` middleware requires the JWT to work correctly. See Dev Notes for the correct approach.

- [x] **Task 6: Style the Login Page (UX Spec Compliance)** (AC: #1)
  - [x] Error messages shown per-field using `cn("text-sm text-red-500 mt-1")` pattern
  - [x] Primary submit button: `bg-indigo-600 hover:bg-indigo-700` (aligned with registerform)
  - [x] WCAG AA: All labels associated with inputs via `htmlFor`/`id` pairing
  - [x] The login form must be visually identical in structure to the register form (same Card layout, same spacing, same field styles)
  - [x] Mobile: full-width, no horizontal overflow

- [x] **Task 7: Final Verification** (AC: all)
  - [x] Run `npm run dev` — dev server starts cleanly
  - [x] Manually test: login with valid credentials → redirected to `/courses`
  - [x] Manually test: login with wrong password → see "Invalid email or password." error
  - [x] Manually test: login with non-existent email → see "Invalid email or password." (NOT a different message)
  - [x] Manually test as student: attempt to navigate to `/admin` → redirected
  - [x] Manually test: Already logged in, navigate to `/login` → redirected to `/courses`
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
import { db } from '~/server/db'; // ✅ CORRECT
import { db } from '@/server/db'; // ❌ WRONG — will cause module not found
```

This was a key debug finding from Story 1.2.

### 🔴 CRITICAL: NextAuth v4 + DrizzleAdapter = Database Sessions (NOT JWT by default)

The current `auth.ts` uses `DrizzleAdapter`, which stores sessions in the **database** (the `session` table). By default, `next-auth/middleware`'s `withAuth` relies on **JWT tokens**.

**Two Valid Approaches:**

**Approach A (RECOMMENDED for this project): Switch to JWT session strategy**

Add `session: { strategy: "jwt" }` to `authOptions`. This removes database session overhead and makes the middleware work perfectly:

```typescript
export const authOptions: NextAuthOptions = {
	session: { strategy: 'jwt' },
	// ...rest of options
};
```

⚠️ **If you switch to JWT:** The DrizzleAdapter will still be used for `accounts`/`verificationTokens` tables, but the `sessions` table in the DB will no longer be used for session storage. This is perfectly fine — the `sessions` table remains for potential future OAuth use.

**Approach B (Fallback): Use `getToken` in middleware manually**

If the adapter insists on database sessions:

```typescript
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
	const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
	// ...rest of middleware logic
}
```

**Recommendation: Go with Approach A (JWT) — it's simpler and works with `withAuth` out of the box.**

### NextAuth CredentialsProvider — Key Behaviors

- When credentials are wrong, `authorize()` should return `null`. NextAuth converts this to a `CredentialsSignin` error.
- On the client, `signIn("credentials", { redirect: false })` returns `{ error: "CredentialsSignin" }` when credentials fail. **Always** use `redirect: false` and handle routing manually.
- The `authorize()` function callback runs server-side (only in Node.js runtime, not Edge). The middleware runs on Edge — they don't share runtime.
- `result?.ok` will be `false` when credentials fail. `result?.error` will be `"CredentialsSignin"`.

### `signIn` from `next-auth/react` vs Server Actions

For login specifically, use `signIn("credentials", { ... })` from **`next-auth/react`** — this is the correct client-side API to initiate a NextAuth credentials login. Do NOT create a separate Server Action for the login logic — NextAuth's CredentialsProvider ALREADY handles the server-side validation in `authorize()`.

Compare with Story 1.2 which used a custom Server Action for registration (because registration is just a DB insert, not a NextAuth session creation).

### `router.refresh()` After Login

After `router.push("/courses")`, also call `router.refresh()`. This forces Next.js to re-render Server Components with the new session, preventing stale cache issues:

```typescript
router.push('/courses');
router.refresh();
```

### Existing Files Established from Story 1.2

These files **already exist** — do NOT recreate them:

| File                                 | Status    | Notes                                      |
| ------------------------------------ | --------- | ------------------------------------------ |
| `src/app/(auth)/layout.tsx`          | ✅ Exists | Centers auth forms, `max-w-md` — use as-is |
| `src/components/ui/button.tsx`       | ✅ Exists | shadcn Button — ready to use               |
| `src/components/ui/input.tsx`        | ✅ Exists | shadcn Input — ready to use                |
| `src/components/ui/label.tsx`        | ✅ Exists | shadcn Label — ready to use                |
| `src/components/ui/card.tsx`         | ✅ Exists | shadcn Card — ready to use                 |
| `src/components/ui/sonner.tsx`       | ✅ Exists | Sonner toast wrapper — ready to use        |
| `src/server/actions/auth/schemas.ts` | ✅ Exists | Add `LoginSchema` here                     |
| `src/types/index.ts`                 | ✅ Exists | Has `ActionResponse<T>` type               |
| `src/lib/utils.ts`                   | ✅ Exists | Has `cn()` utility                         |
| `src/middleware.ts`                  | ⚠️ Exists | **MODIFY** — enhance for RBAC              |
| `src/server/auth.ts`                 | ⚠️ Exists | **MODIFY** — add CredentialsProvider       |

### Current `auth.ts` State (from Story 1.1)

```typescript
// Current providers array is EMPTY:
providers: [
  // Configure one or more authentication providers here
  // e.g., Credentials, Google, Discord, etc.
],
```

The `session` callback already populates `user.id` and `user.role` — you do NOT need to change the callback, just add the provider.

### Current `middleware.ts` State

The middleware from Story 1.1 likely just exports a default from `next-auth/middleware`. You need to ENHANCE it with the RBAC logic for `/admin/*` protection and proper matchers for all protected routes.

### DB Schema — Relevant Tables for Story 1.3

```typescript
// users table (already in database):
export const users = pgTable('user', {
	id: text('id').primaryKey(), // NextAuth-managed UUID string
	name: text('name'),
	email: text('email').unique(),
	role: varchar('role', { length: 20 }).default('student').notNull(),
	password: varchar('password', { length: 255 }), // Added in Story 1.2
	// ...
});
```

The `password` column was added in Story 1.2. No new DB changes are needed for login.

### Error Messaging: Security Best Practice

**Never** differentiate between "wrong email" and "wrong password" in error messages. Always use:

```
"Invalid email or password."
```

This prevents account enumeration attacks (attackers learning which emails are registered from different error messages).

### `useFormStatus` vs `useState` for Login

Story 1.2 used `useFormStatus` from `react-dom` (for the native form + Server Action pattern).

For Story 1.3, because we're using `signIn()` from `next-auth/react` (not a `<form action={...}>` pattern), we should use **`useState` for the pending state** instead — `useFormStatus` only works inside a form with a native action binding.

```typescript
const [isPending, setIsPending] = useState(false);
// ... in submit handler:
setIsPending(true);
const result = await signIn(...);
setIsPending(false);
```

### UX Spec Compliance for Login Page

From `ux-design-specification.md`:

- **Form Validation:** On-blur validation — `react-hook-form` with `mode: "onBlur"`
- **Error Feedback:** Per-field red error messages (below each input) + form-level error alert for server errors
- **Feedback on Success:** Toast notification ("Welcome back!") before redirect
- **Primary CTA Color:** Indigo `#6366F1` / Tailwind `bg-indigo-600`
- **Auth Layout:** Centered card — same `(auth)/layout.tsx` as register page
- **Touch Targets:** All interactive elements minimum 44×44px (use `h-11` for inputs)
- **Empty/Error States:** Never leave user stranded — clear, solutive error messages

### File Locations — Exact Paths for New Files

| File                      | Path                                                    |
| ------------------------- | ------------------------------------------------------- |
| Login Page                | `project-e-course/src/app/(auth)/login/page.tsx`        |
| Login Form Component      | `project-e-course/src/components/shared/login-form.tsx` |
| Login Zod Schema (ADD to) | `project-e-course/src/server/actions/auth/schemas.ts`   |
| Auth Options (MODIFY)     | `project-e-course/src/server/auth.ts`                   |
| Middleware (MODIFY)       | `project-e-course/src/middleware.ts`                    |

### Architecture Compliance Checklist

- [ ] Path alias is `~/` throughout all imports — never `@/`
- [ ] `signIn("credentials", { redirect: false })` used — error handled manually
- [ ] `authorize()` in CredentialsProvider returns `null` (not throws) on failure
- [ ] Middleware protects `/admin/*`, `/courses/:path*`, `/profile/:path*`
- [ ] Admin role check in middleware redirects students to `/courses` (not 403 error page)
- [ ] All className concatenation uses `cn()` from `~/lib/utils`
- [ ] No `any` TypeScript types used anywhere (NFR-M1)
- [ ] `router.refresh()` called after successful login

### Security Notes

- **NFR-S2:** `withAuth` NextAuth middleware protects all `matcher` routes
- **NFR-S2:** Admin routes additionally check `token.role === "admin"`
- **NFR-S3:** `NEXTAUTH_SECRET` must remain server-only (it's in env.js validation)
- CredentialsProvider must re-validate via `bcryptjs.compare()` server-side — never trust client
- Password from `authorize()` params must be compared against the hashed password in DB

## Previous Story Intelligence (Story 1.2 — Done)

Key learnings and patterns established in Story 1.2 that directly impact Story 1.3:

- ✅ **Path alias was `~/`** — all imports in new story files MUST use `~/` (NOT `@/`)
- ✅ **`useActionState` signature**: React 19's `useActionState` passes `(prevState, formData)` — applicable if using Server Actions
- ✅ **`bcryptjs`** is installed (not `bcrypt`) — import with `import bcrypt from "bcryptjs"`
- ✅ **`react-hook-form` + `@hookform/resolvers`** are already installed — don't reinstall
- ✅ **Sonner toasts**: Use `import { toast } from "sonner"` — `<Toaster />` already in `layout.tsx`
- ✅ **DB push**: `npm run db:push` was used in Story 1.2 — Story 1.3 has NO new schema changes needed
- ✅ **`register-form.tsx` pattern**: Login form should mirror register form structure (same Card/field/button layout)
- ✅ **Auth layout centered**: `src/app/(auth)/layout.tsx` already handles centering — no layout changes needed
- ⚠️ **Story 1.2 used hybrid react-hook-form + `useActionState`** — Story 1.3 uses `signIn()` from `next-auth/react` + `useState`, NOT `useActionState` (different pattern because NextAuth handles server logic)

## Git Intelligence

Recent commits:

- `5631c4f` (HEAD → main) — "Story 1.2: User Registration, done testing"
- `8c15f96` — "first commit"

Code patterns from Story 1.2 to continue:

- shadcn Card structure (CardHeader + CardContent + CardTitle + CardDescription)
- Per-field error display below inputs using red text
- Indigo CTA button with hover state
- Form layout identical to register form for visual consistency

## Project Structure Notes

Files to CREATE in this story:

- **NEW:** `src/app/(auth)/login/page.tsx`
- **NEW:** `src/components/shared/login-form.tsx`

Files to MODIFY in this story:

- **MODIFY:** `src/server/auth.ts` — add CredentialsProvider, add JWT strategy, add pages config
- **MODIFY:** `src/server/actions/auth/schemas.ts` — add LoginSchema
- **MODIFY:** `src/middleware.ts` — enhance with RBAC role-based admin protection and correct matchers

No database schema changes are required for Story 1.3. No new npm packages should be needed — `bcryptjs`, `next-auth`, and `react-hook-form` are all already installed.

### Alignment with Architecture Spec

- ✅ `src/app/(auth)/login/` — aligns with planned `(auth)` route group
- ✅ Login form in `components/shared/` — aligns with architecture spec shared components
- ✅ No new Server Actions created — CredentialsProvider in `auth.ts` IS the server-side logic
- ✅ Middleware at `src/middleware.ts` — architecture spec's defined security layer

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.3`] — User story statement and acceptance criteria
- [Source: `_bmad-output/planning-artifacts/epics.md#FR02`] — User logs in via NextAuth session management
- [Source: `_bmad-output/planning-artifacts/epics.md#FR05`] — System differentiates role-based route access
- [Source: `_bmad-output/planning-artifacts/architecture.md#Architectural Boundaries`] — `/admin/*` must be protected by middleware, role check
- [Source: `_bmad-output/planning-artifacts/architecture.md#API & Communication Patterns`] — Server Actions convention (login is different — uses NextAuth's own mechanism)
- [Source: `_bmad-output/planning-artifacts/architecture.md#Process Patterns`] — `useActionState` for forms (but login uses `signIn()` pattern instead)
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Form Patterns`] — On-blur validation, no blank screens
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Feedback Patterns`] — Toast/Sonner for success/error feedback
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Color System`] — Indigo `#6366F1` for primary CTA
- [Source: `_bmad-output/implementation-artifacts/1-2-user-registration.md#Dev Notes`] — Path alias (`~/`), existing files, bcryptjs, Sonner setup
- [Source: NFR-S1] — Password hashing with bcrypt
- [Source: NFR-S2] — NextAuth middleware protection for protected routes

## Dev Agent Record

### Agent Model Used

Gemini 2.5 Pro (Antigravity) — Story 1.3 Context Engine | 2026-03-07

### Debug Log References

### Completion Notes List

### File List

- `project-e-course/src/server/actions/auth/schemas.ts` (MODIFIED - AI Review fixes)
- `project-e-course/src/components/shared/login-form.tsx` (MODIFIED - AI Review fixes)
