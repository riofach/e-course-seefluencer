# Story 1.2: User Registration

Status: done

## Story

As a new visitor,
I want to register an account with my email and password,
so that I can access the learning platform.

## Acceptance Criteria

1. **Given** I navigate to `/register`, **When** the registration page loads, **Then** I see a form with fields for _name_, _email_, and _password_ — each field displays an appropriate validation error if left empty or incorrectly filled (on-blur validation).
2. **Given** I submit a valid name, email, and password (min. 8 chars), **When** the Server Action processes the request, **Then** my account is persisted in the database with the password hashed using `bcryptjs` (NFR-S1) and my `role` defaults to `"student"`.
3. **Given** registration succeeds, **When** the Server Action returns `{ success: true }`, **Then** the user is **automatically redirected to `/login`** with a success toast message (e.g. "Account created! Please log in.") — NOT auto-logged in via NextAuth at this stage (see Notes).
4. **Given** I submit an email that is already registered, **When** the Server Action checks the database, **Then** I receive an inline field-level error: "An account with this email already exists."
5. **Given** I submit a password shorter than 8 characters, **When** client-side (on-blur) AND server-side (Server Action) validation runs, **Then** I see "Password must be at least 8 characters."
6. **Given** the form is submitting (pending state), **When** the Server Action is in-flight, **Then** the submit button shows a loading indicator and is disabled to prevent duplicate submissions (via `useFormStatus`).
7. **Given** the user is already authenticated, **When** they navigate to `/register`, **Then** they are redirected away to the main student catalog (`/courses`).

## Tasks / Subtasks

- [x] **Task 1: Create Zod Validation Schema** (AC: #1, #5)
  - [x] Create `src/server/actions/auth/schemas.ts` (or `src/lib/validations/auth.ts`) exporting:
    ```typescript
    import { z } from 'zod';
    export const RegisterSchema = z.object({
    	name: z.string().min(2, 'Name must be at least 2 characters'),
    	email: z.string().email('Please enter a valid email address'),
    	password: z.string().min(8, 'Password must be at least 8 characters'),
    });
    export type RegisterInput = z.infer<typeof RegisterSchema>;
    ```

- [x] **Task 2: Create the `register` Server Action** (AC: #2, #3, #4, #5)
  - [x] Create file: `src/server/actions/auth/register.ts`
  - [x] Mark the file with `"use server"` at the top
  - [x] Install `bcryptjs`: `npm install bcryptjs` and `npm install -D @types/bcryptjs`
  - [x] Import from: `db` (`~/server/db`), `users` table (`~/server/db/schema`), `RegisterSchema` from schemas file, `bcryptjs`, `eq` from `drizzle-orm`
  - [x] Action function signature: `export async function registerUser(_prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse>`
  - [x] Implementation steps inside action:
    1. Extract and parse raw data from `formData`: `name`, `email`, `password`
    2. Validate with `RegisterSchema.safeParse()` — return `{ success: false, error: "..." }` on validation failure
    3. Check for existing email: `await db.query.users.findFirst({ where: eq(users.email, email) })`
    4. If exists, return `{ success: false, error: "An account with this email already exists." }`
    5. Hash password: `const hashedPassword = await bcrypt.hash(password, 12)`
    6. Insert new user: `await db.insert(users).values({ name, email, password: hashedPassword, role: "student" })`
    7. Return `{ success: true, data: undefined }` on success
  - [x] Wrap entire action body in `try/catch` — return `{ success: false, error: "An unexpected error occurred. Please try again." }` on exception

- [x] **Task 3: Add `password` Column to Drizzle Schema** (AC: #2)
  - [x] Open `src/server/db/schema.ts`
  - [x] Locate the `users` table definition
  - [x] Add the `password` column (T3's default NextAuth `users` table does NOT include a password field — it's OAuth-only by default):
    ```typescript
    password: varchar("password", { length: 255 }),
    ```
    (nullable is intentional — allows OAuth-only users in future without a password)
  - [x] Run `npm run db:push` OR `npm run db:generate && npm run db:migrate` to apply the schema change
  - [x] ⚠️ The T3 default `users` table uses `id: text("id")` (UUID string via NextAuth DrizzleAdapter). Do NOT change this.

- [x] **Task 4: Create the Register Page** (AC: #1, #7)
  - [x] Create directory and file: `src/app/(auth)/register/page.tsx`
  - [x] This is a **Server Component** — check for existing session at page level and redirect if already authenticated:
    ```typescript
    import { getServerSession } from 'next-auth';
    import { authOptions } from '@/server/auth';
    import { redirect } from 'next/navigation';
    // In the page function:
    const session = await getServerSession(authOptions);
    if (session) redirect('/courses');
    ```
  - [x] Render the `<RegisterForm />` client component within a centered auth layout

- [x] **Task 5: Create the `RegisterForm` Client Component** (AC: #1, #5, #6)
  - [x] Create: `src/components/shared/register-form.tsx` (or `src/app/(auth)/register/_components/register-form.tsx`)
  - [x] Mark with `"use client"` at the top
  - [x] Install react-hook-form + zod resolver: `npm install react-hook-form @hookform/resolvers`
  - [x] Use `useForm<RegisterInput>` from `react-hook-form` with `zodResolver(RegisterSchema)`:
    ```typescript
    const form = useForm<RegisterInput>({
    	resolver: zodResolver(RegisterSchema),
    	defaultValues: { name: '', email: '', password: '' },
    });
    ```
  - [x] Use the native `useFormStatus` hook from `react-dom` for button pending state
  - [x] Use `useActionState` from React 19 / `react` to invoke `registerUser` server action and track result
  - [x] On `success: true` response from action: show a **Sonner toast** (`import { toast } from "sonner"`) with message "Account created! Please log in." and use `router.push("/login")` via `useRouter` from `next/navigation`
  - [x] On `success: false` response from action: show Sonner toast with the error message AND display a form-level error alert
  - [x] Form fields (using shadcn/ui `Input`, `Label`, `Button`):
    - **Name:** `<Input id="name" {...form.register("name")} />` with error display
    - **Email:** `<Input id="email" type="email" {...form.register("email")} />` with error display
    - **Password:** `<Input id="password" type="password" {...form.register("password")} />` with error display
  - [x] Field errors are shown **on-blur** (react-hook-form default with `mode: "onBlur"`) — red text below each input
  - [x] Submit button: `<Button type="submit" disabled={isPending}>` — show "Creating account..." when pending

- [x] **Task 6: Create `(auth)` Route Group Layout** (AC: #1)
  - [x] Create `src/app/(auth)/layout.tsx` if it doesn't exist:
    ```typescript
    export default function AuthLayout({ children }: { children: React.ReactNode }) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      );
    }
    ```

- [x] **Task 7: Style the Register Page (UX Spec Compliance)** (AC: #1)
  - [x] Use `Card`, `CardHeader`, `CardContent`, `CardTitle`, `CardDescription` from shadcn/ui to wrap the form
  - [x] Add a link to `/login` at the bottom: "Already have an account? Sign in"
  - [x] Error messages shown per-field using `cn("text-sm text-red-500 mt-1")` pattern
  - [x] Primary submit button: `bg-indigo-600 hover:bg-indigo-700` (aligned with UX spec primary CTA color)
  - [x] WCAG AA: Ensure all labels are associated with inputs via `htmlFor`/`id` pairing
  - [x] Ensure form is visually consistent with the planned `/login` page (use identical Card layout, same field styles)

- [x] **Task 8: Final Verification**
  - [x] Run `npm run dev` — dev server starts cleanly
  - [x] Manually test: fill form with valid data → account created → redirected to `/login`
  - [x] Manually test: register with same email twice → get "email already exists" error
  - [x] Manually test: submit empty form → see per-field validation errors
  - [x] Verify password is hashed in DB via `npm run db:studio` (row should show bcrypt hash starting with `$2b$`)
  - [x] Run `npx tsc --noEmit` — zero TypeScript errors
  - [x] Run `npm run lint` — zero lint errors

## Dev Notes

### 🔴 CRITICAL: All Code Goes Inside `project-e-course/`

All source files for this story MUST be created inside:

```
d:\RioRaditya\Ngoding\hiring-seefluencer\project-e-course\
```

Never place code outside `project-e-course/`. The `_bmad-output/` folder is documentation only.

### Password Column is NOT in Current Schema

The T3 scaffold sets up NextAuth's Drizzle Adapter tables which are OAuth-first — the `users` table has NO `password` column by default. You **must add it** (Task 3) before the Server Action can insert hashed passwords.

```typescript
// In src/server/db/schema.ts — FIND the users table and ADD:
password: varchar("password", { length: 255 }),
```

After adding this, always run a migration. Use the appropriate command:

```bash
# Option A: Push directly (dev environment)
npm run db:push

# Option B: Full migration flow (recommended for team/CI)
npm run db:generate
npm run db:migrate
```

### Server Action Pattern — Exact Convention

All Server Actions in this project return `ActionResponse<T>` (defined in `src/types/index.ts` from Story 1.1):

```typescript
export type ActionResponse<T = undefined> =
	| { success: true; data: T }
	| { success: false; error: string };
```

The `registerUser` action MUST return this type. Example:

```typescript
'use server';
import type { ActionResponse } from '@/types';

export async function registerUser(formData: FormData): Promise<ActionResponse> {
	// ... implementation
	return { success: true, data: undefined }; // on success
	return { success: false, error: 'An account with this email already exists.' }; // on failure
}
```

### useActionState + useFormStatus Pattern (React 19)

⚠️ In Next.js 15 with React 19, use the native React hooks, NOT third-party wrappers:

```typescript
"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registerUser } from "@/server/actions/auth/register";

// In the parent form component wrapper:
const [state, formAction] = useActionState(registerUser, null);

// In the submit button (child component, must be separate for useFormStatus):
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full bg-indigo-600 hover:bg-indigo-700">
      {pending ? "Creating account..." : "Create Account"}
    </Button>
  );
}
```

**Key caveat:** `useFormStatus` only works inside a child component of the form, NOT in the same component that renders the `<form>` tag.

### react-hook-form vs useActionState — Hybrid Approach

For this story, use **react-hook-form for client-side validation only** (on-blur errors), and **useActionState for the server action handling**. The form submit handler pattern:

```typescript
const [serverState, serverAction] = useActionState(registerUser, null);
const form = useForm<RegisterInput>({ resolver: zodResolver(RegisterSchema), mode: 'onBlur' });

const handleSubmit = form.handleSubmit((data) => {
	const formData = new FormData();
	formData.append('name', data.name);
	formData.append('email', data.email);
	formData.append('password', data.password);
	serverAction(formData);
});
```

### bcryptjs Not bcrypt

Use `bcryptjs` (pure JS, no native bindings) — NOT the `bcrypt` package which requires node-gyp and native compilation that can fail in some environments.

```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

Salt rounds: use **12** for production-appropriate security while keeping registration latency under 1 second.

### Auto-Login Decision: NOT Implemented in This Story

Per the story acceptance criteria (#3), after registration the user is **redirected to `/login`** (not auto-logged in). This is intentional:

- Story 1.3 covers the full NextAuth session + middleware setup.
- Auto-login would require `signIn()` from `next-auth/react` which needs NextAuth options already configured — while NextAuth is already set up from Story 1.1, the full credential provider configuration belongs in Story 1.3 to keep scope clean.
- If the dev wants to add auto-login, they must wait until Story 1.3 is complete.

### Sonner Toast Setup (from Story 1.1)

Story 1.1 installed `sonner` and initialized shadcn's Sonner component. Ensure the `<Toaster />` is present in `src/app/layout.tsx`. If not yet added, add it:

```typescript
import { Toaster } from "@/components/ui/sonner"; // shadcn sonner wrapper
// In layout.tsx body:
<Toaster position="bottom-right" />
```

To trigger a toast in client components:

```typescript
import { toast } from 'sonner';
toast.success('Account created! Please log in.');
toast.error('An account with this email already exists.');
```

### shadcn/ui Components Required

The following shadcn components must be available (should already be installed from Story 1.1 — verify or add):

```bash
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add button
npx shadcn@latest add form  # for react-hook-form integration
```

### File Locations — Exact Paths

| File           | Path                                                                      |
| -------------- | ------------------------------------------------------------------------- |
| Server Action  | `project-e-course/src/server/actions/auth/register.ts`                    |
| Zod Schema     | `project-e-course/src/server/actions/auth/schemas.ts`                     |
| Page           | `project-e-course/src/app/(auth)/register/page.tsx`                       |
| Auth Layout    | `project-e-course/src/app/(auth)/layout.tsx`                              |
| Form Component | `project-e-course/src/components/shared/register-form.tsx`                |
| DB Schema      | `project-e-course/src/server/db/schema.ts` (MODIFY — add password column) |

### Previous Story Intelligence (Story 1.1 — Done)

Key learnings from Story 1.1 setup:

- ✅ `src/types/index.ts` has `ActionResponse<T>` type — **use it, don't re-define**
- ✅ `src/lib/utils.ts` has `cn()` utility — **always use for className concatenation**
- ✅ `src/(auth)/` directory was created (empty) — **the route group structure is ready**
- ✅ `src/server/actions/auth/` directory exists (with `.gitkeep`) — **place action here, no need to create directory**
- ✅ `next-themes` is set up with `ThemeProvider` in `layout.tsx` — **dark mode classes will work**
- ✅ shadcn Button, Input, Label, Toast/Sonner are already installed — **do NOT reinstall unless missing**
- ✅ T3 scaffold preserved `users`, `accounts`, `sessions`, `verification_tokens` tables — **do NOT replace them, only ADD the `password` column**
- ⚠️ tRPC was removed from Story 1.1 setup — `src/server/api/` does NOT exist, do not import from it
- ⚠️ T3 generates `env.js` at project root (not `src/`) — import env validations from there if needed
- ✅ `src/server/auth.ts` has `authOptions` exported — use `getServerSession(authOptions)` for session checks

### Architecture Compliance Checklist

- [ ] Server Action file starts with `"use server"` directive
- [ ] All className concatenation uses `cn()` from `@/lib/utils`
- [ ] Action returns `ActionResponse<T>` type from `@/types`
- [ ] Zod schema validates BOTH client-side and server-side (dual-layer validation)
- [ ] Business logic ONLY in `src/server/actions/auth/` — NOT in page.tsx or component files
- [ ] No `any` TypeScript types used anywhere (NFR-M1)
- [ ] Sensitive error details (e.g., DB errors) are caught and replaced with generic messages returned to client
- [ ] Password hashed with bcryptjs before DB insert (NFR-S1)

### UX Spec Compliance

From `ux-design-specification.md`:

- **Form Validation:** On-blur validation (react-hook-form `mode: "onBlur"` — field error shown when user moves away from the field)
- **Error Feedback:** Highlight input field in red + per-field message below the input in red text
- **Feedback on Success:** Toast notification (Sonner) confirming account creation
- **Primary CTA Color:** Indigo `#6366F1` / Tailwind `bg-indigo-600` for the submit button
- **Empty States / Auth Layout:** Centered card on page background — aligned with app zone aesthetics (8–12px border radius, subtle shadow, white card on `#FAFAFA` background in light mode)
- **Responsive:** Auth forms should be `max-w-md` — full-width on mobile, centered card on tablet+
- **Touch Targets:** All interactive elements minimum 44×44px (use `h-11` for inputs, standard Button height)

### Security Notes

- **NFR-S1:** bcrypt hash with salt rounds 12 — never store plaintext passwords
- **NFR-S3:** No sensitive data in `NEXT_PUBLIC_*` env vars — the action runs server-side only, zero browser exposure
- **NFR-S2:** `getServerSession` called on the page Server Component guards against authenticated users accessing the register page again
- Server Action must re-validate all inputs (even if client already validated) — never trust client data alone

## Project Structure Notes

Files touched in this story:

- **NEW:** `src/app/(auth)/register/page.tsx`
- **NEW:** `src/app/(auth)/layout.tsx` (if not yet created from Story 1.1)
- **NEW:** `src/server/actions/auth/register.ts`
- **NEW:** `src/server/actions/auth/schemas.ts`
- **NEW:** `src/components/shared/register-form.tsx`
- **MODIFY:** `src/server/db/schema.ts` — add `password` column to `users` table

No conflicts detected with architecture spec. The `(auth)` route group was pre-created in Story 1.1.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.2`] — User story statement and acceptance criteria
- [Source: `_bmad-output/planning-artifacts/architecture.md#Data Architecture`] — Zod dual-layer validation, Server Actions `ActionResponse<T>` contract
- [Source: `_bmad-output/planning-artifacts/architecture.md#API & Communication Patterns`] — Server Actions only (no REST endpoints for mutations)
- [Source: `_bmad-output/planning-artifacts/architecture.md#Enforcement Guidelines`] — `cn()` usage, Drizzle Infer, shadcn/ui components
- [Source: `_bmad-output/planning-artifacts/architecture.md#Naming Patterns`] — PascalCase components, camelCase functions, kebab-case routes
- [Source: `_bmad-output/planning-artifacts/architecture.md#Project Structure`] — Exact file locations
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Form Patterns`] — On-blur validation, no blank screens
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Feedback Patterns`] — Toast/Sonner for success/error feedback
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Color System`] — Indigo `#6366F1` for primary CTA
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Responsive Strategy`] — Mobile-first, max-w-md for auth forms
- [Source: `_bmad-output/implementation-artifacts/1-1-project-setup-and-starter-template-initialization.md#File List`] — What files already exist from Story 1.1
- [Source: NFR-S1] — Password hashing requirement (bcrypt)
- [Source: NFR-S2] — NextAuth middleware protection
- [Source: FR01] — User registers account with email + hashed password

## Dev Agent Record

### Agent Model Used

Gemini 2.5 Pro (Antigravity) — Story 1.2 Implementation | 2026-03-07

### Debug Log References

- Import alias fix: T3 project uses `~/` path alias (not `@/`). Updated all new files.
- `useActionState` signature fix: React 19's `useActionState` passes `(prevState, formData)` — updated `registerUser` to accept `_prevState` as first param.
- DB push: `npm run db:push` completed successfully (exit code 0) — `password` column added to `user` table.
- TypeScript: 0 errors (`npx tsc --noEmit`).
- ESLint: 0 errors (`npm run lint`).

### Completion Notes List

- ✅ Task 1: `RegisterSchema` Zod schema created at `src/server/actions/auth/schemas.ts` with name (min 2), email (valid), password (min 8) validation.
- ✅ Task 2: `registerUser` server action created with `"use server"`, Zod validation, duplicate email check, bcrypt hash (12 rounds), and DB insert. Signature updated to `(prevState, formData)` for React 19 `useActionState` compatibility.
- ✅ Task 3: `password: varchar("password", { length: 255 })` added to `users` table in `schema.ts`. `npm run db:push` applied migration.
- ✅ Task 4: Register page (`src/app/(auth)/register/page.tsx`) created as Server Component, session check redirects authenticated users to `/courses`.
- ✅ Task 5: `RegisterForm` client component created with hybrid react-hook-form (on-blur validation) + `useActionState` server action, `useFormStatus` for loading state, Sonner toasts for success/error.
- ✅ Task 6: `(auth)` route group layout created — centers auth forms with `max-w-md`.
- ✅ Task 7: Styled with shadcn/ui Card, indigo CTA button (`bg-indigo-600`), per-field error display, WCAG AA labels, sign-in link.
- ✅ Task 8: Dev server starts cleanly. TypeScript: 0 errors. ESLint: 0 errors. Sonner `<Toaster />` added to root layout.

### File List

**New files created:**

- `project-e-course/src/server/actions/auth/schemas.ts`
- `project-e-course/src/server/actions/auth/register.ts`
- `project-e-course/src/app/(auth)/layout.tsx`
- `project-e-course/src/app/(auth)/register/page.tsx`
- `project-e-course/src/components/shared/register-form.tsx`

**Modified files:**

- `project-e-course/src/server/db/schema.ts` — added `password` column to `users` table
- `project-e-course/src/app/layout.tsx` — added `<Toaster />` from sonner, updated metadata title

**Dependencies installed:**

- `bcryptjs` + `@types/bcryptjs`
- `react-hook-form` + `@hookform/resolvers`

### Change Log

- 2026-03-07: Story 1.2 fully implemented. 5 new files created, 2 files modified. DB schema migrated (password column). All ACs satisfied. TypeScript 0 errors, ESLint 0 errors.
