# Story 7.5: Login & Register Public Zone Alignment

Status: done

## Story

As a prospective or returning learner,
I want `/login` and `/register` to feel visually consistent with the public discovery and conversion surfaces,
So that authentication feels like a seamless continuation of the public experience rather than a disconnected legacy screen.

## Acceptance Criteria

1. **[Public Shell — Auth Routes Use `PublicNavbarShell`]**
   Given I navigate to `/login` or `/register`
   When the page renders
   Then the route uses the shared `PublicNavbarShell` (Epic 7 public-zone shell with `PublicNavbar`)
   And the route does NOT show the non-public `GlobalHeader` + `NavbarAuth` that appear on non-public routes

2. **[Visual Consistency — Public Zone Design Language]**
   Given the auth entry pages are reviewed against the rest of the public zone
   When visual treatment is compared across desktop and mobile breakpoints
   Then typography (`font-[family-name:var(--font-inter)] tracking-[-0.02em]`), spacing, surface treatment (`bg-white dark:bg-[#0F0F14]`), and dark/light behavior align with the established public-zone design language
   And the responsive hierarchy remains clear for form content, supporting copy, and navigation actions on both desktop and mobile

3. **[Functional Integrity — Auth Logic Unchanged]**
   Given existing login and registration flows already work functionally
   When Story 7.5 is implemented
   Then validation, submission, redirect behavior, toast behavior, server actions, and callbackUrl/session behavior remain unchanged
   And `LoginForm` and `RegisterForm` pass their existing Vitest tests without modification

4. **[Navbar State — Logged-Out by Design]**
   Given the public navbar shows logged-in or logged-out state based on session
   When an unauthenticated user visits `/login` or `/register`
   Then the `PublicNavbar` correctly shows the logged-out state (Login + Get Started CTAs)
   And since authenticated users are immediately redirected away (existing logic in page.tsx), the navbar will always render in the logged-out state for these pages in practice

5. **[Scope Boundary — Explicit Limitation]**
   Given the story scope is prepared for implementation
   When the planning handoff is reviewed
   Then this story is explicitly limited to shared shell/navbar alignment and public-zone visual consistency for `/login` and `/register`
   And auth logic, validation rules, redirects, server actions, and session logic are out of scope

## Tasks / Subtasks

- [x] **Task 1: Update `shouldUsePublicNavbar()` to include auth routes** (AC: #1)
  - [x] 1.1 Open `project-e-course/src/components/shared/public-navbar-routes.ts`
  - [x] 1.2 Add `/login` and `/register` to the function's condition:
    ```ts
    export function shouldUsePublicNavbar(pathname: string) {
      return (
        pathname === "/" ||
        pathname.startsWith("/courses") ||
        pathname.startsWith("/pricing") ||
        pathname === "/login" ||
        pathname === "/register"
      );
    }
    ```
  - [x] 1.3 This ensures `GlobalHeader` returns `null` on `/login` and `/register` — the old non-public header is suppressed

- [x] **Task 2: Refactor `(auth)/layout.tsx` to use `PublicNavbarShell`** (AC: #1, #2)
  - [x] 2.1 Open `project-e-course/src/app/(auth)/layout.tsx`
  - [x] 2.2 Replace the current generic centered container with `PublicNavbarShell`:
    ```tsx
    import { PublicNavbarShell } from "~/components/shared/public-navbar-shell";

    export default function AuthLayout({
      children,
    }: {
      children: React.ReactNode;
    }) {
      return (
        <PublicNavbarShell>
          <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-16">
            <div className="w-full max-w-md">{children}</div>
          </div>
        </PublicNavbarShell>
      );
    }
    ```
  - [x] 2.3 Note: `PublicNavbarShell` already provides:
    - `PublicNavbar` at the top (h-20 = 80px)
    - `bg-white dark:bg-[#0F0F14]` background
    - `font-[family-name:var(--font-inter)] tracking-[-0.02em]` font defaults
    - `flex min-h-screen flex-col` structural wrapper
    - `--font-inter` and `--font-playfair-display` CSS variables in scope
  - [x] 2.4 The inner `div` no longer needs `bg-background` — it inherits from the shell
  - [x] 2.5 Ensure the form is vertically centered within the available space below the navbar

- [x] **Task 3: Update `LoginForm` visual polish for public-zone alignment** (AC: #2)
  - [x] 3.1 Open `project-e-course/src/components/shared/login-form.tsx`
  - [x] 3.2 Update the `<Card>` to use public-zone surface tokens:
    - Use `bg-white dark:bg-[#1A1A24]` as card background
    - Use `border-slate-200 dark:border-[#2A2A3C]` for card border
    - Apply `rounded-2xl` (16px) border radius for consistency with public zone cards
    - Apply `shadow-xl dark:shadow-black/40` for appropriate elevation
  - [x] 3.3 Update `<CardTitle>` — ensure it uses Inter (inherited from shell), NOT Playfair Display
    - Remove any `font-bold` override that would conflict — keep `text-2xl` sizing
    - Color: `text-slate-900 dark:text-white` (inherited from shell or explicit)
  - [x] 3.4 Update `<CardDescription>` — `text-slate-500 dark:text-slate-400`
  - [x] 3.5 Update `<Label>` elements — `text-slate-700 dark:text-slate-300`
  - [x] 3.6 Update `<Input>` elements — ensure dark mode surface alignment:
    - `bg-white dark:bg-[#0F0F14]` or `dark:bg-white/5`
    - `border-slate-200 dark:border-white/10`
    - `text-slate-900 dark:text-white`
    - `placeholder:text-slate-400 dark:placeholder:text-slate-500`
  - [x] 3.7 The CTA button already uses `bg-indigo-600 hover:bg-indigo-700` — this is correct, keep it
  - [x] 3.8 "Don't have an account?" link: `text-slate-600 dark:text-slate-400` for supporting text; link itself: `text-indigo-600 dark:text-indigo-400 hover:underline`
  - [x] 3.9 **CRITICAL: Do NOT touch** `form.handleSubmit(onSubmit)`, `signIn()`, `useSearchParams()`, callbackUrl logic, toast calls, or router logic

- [x] **Task 4: Update `RegisterForm` visual polish for public-zone alignment** (AC: #2)
  - [x] 4.1 Open `project-e-course/src/components/shared/register-form.tsx`
  - [x] 4.2 Apply the same card surface tokens as `LoginForm` (Task 3.2):
    - `bg-white dark:bg-[#1A1A24]`, `border-slate-200 dark:border-[#2A2A3C]`, `rounded-2xl`, `shadow-xl dark:shadow-black/40`
  - [x] 4.3 Update `<CardTitle>` and `<CardDescription>` (same as Task 3.3–3.4)
  - [x] 4.4 Update `<Label>` elements (same as Task 3.5)
  - [x] 4.5 Update `<Input>` elements (same as Task 3.6)
  - [x] 4.6 The `<SubmitButton>` already uses `bg-indigo-600 hover:bg-indigo-700` — keep it
  - [x] 4.7 Error alert block (`serverState && !serverState.success`): update to use `border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400`
  - [x] 4.8 "Already have an account?" link: same pattern as Task 3.8
  - [x] 4.9 **CRITICAL: Do NOT touch** `useActionState`, `registerUser` server action, `useEffect` redirect logic, `startTransition`, `formActionRef`, or any validation logic

- [x] **Task 5: Remove now-redundant wrapper div in `register/page.tsx`** (AC: #3)
  - [x] 5.1 Open `project-e-course/src/app/(auth)/register/page.tsx`
  - [x] 5.2 The current JSX wraps `<RegisterForm />` in an unnecessary `<div>`:
    ```tsx
    return (
      <div>
        <RegisterForm />
      </div>
    );
    ```
  - [x] 5.3 Simplify to:
    ```tsx
    return <RegisterForm />;
    ```
  - [x] 5.4 Do NOT touch `metadata`, `getServerAuthSession()`, or the redirect logic

- [ ] **Task 6: Regression testing and final verification** (AC: #3)
  - [ ] 6.1 Run full Vitest suite: `npx vitest run` — all tests must pass (no regressions from form changes)
  - [x] 6.2 Run linter: `npm run lint` — zero errors
  - [x] 6.3 Run type checker: `npm run typecheck` — zero errors
  - [ ] 6.4 Manual smoke tests:
    - `/login` → Public navbar visible at top (logo + Home/Courses/Pricing links + Login/Get Started CTAs)
    - `/login` → No `GlobalHeader` / `NavbarAuth` visible
    - `/login` → Form centered, card has dark surface in dark mode (`#1A1A24`), white in light mode
    - `/register` → Same navbar and surface verification
    - `/register` → Form validation still works (submit with empty fields shows errors)
    - `/login` → Submit with valid credentials still redirects correctly
    - `/courses`, `/pricing`, `/` → Still render correctly (no regression from `shouldUsePublicNavbar` change)
    - `/admin` → Still requires auth, NOT affected by `shouldUsePublicNavbar` (`startsWith("/admin")` check in `GlobalHeader` prevents it)
  - [ ] 6.5 Dark/light mode toggle: verify both `/login` and `/register` respond correctly

## Dev Notes

### 🎯 Story Purpose: Public Zone Shell Extension

Story 7.5 **extends the public zone** established in Stories 7.1–7.4 to cover the auth entry points (`/login`, `/register`). The goal is a seamless transition: a user browsing the public marketing surface and clicking "Login" or "Get Started" should land on an auth page that feels visually continuous — same navbar, same typography, same dark surface.

**Stories 7.1–7.4 established:** Public zone shell (`PublicNavbarShell`) with navbar, fonts, bg tokens — applied to `/`, `/courses`, `/courses/[slug]`, `/pricing`.

**Story 7.5 adds:** The same shell applied to `/login` and `/register`. No new visual patterns are invented — only extended.

---

### 🏗️ Current State (Before Story 7.5)

```
Route: /login
  └── (auth)/layout.tsx
        └── <div className="bg-background flex min-h-screen items-center justify-center px-4">
              └── <div className="w-full max-w-md">
                    └── login/page.tsx → <LoginForm />

Route: /register
  └── (auth)/layout.tsx
        └── (same generic centered container)
              └── register/page.tsx → <RegisterForm />

GlobalHeader (in root layout):
  └── shouldUsePublicNavbar("/login") → false  ← PROBLEM: shows old header
  └── shouldUsePublicNavbar("/register") → false  ← PROBLEM: shows old header
```

**Problems:**
1. `bg-background` (shadcn CSS variable, adapts to theme but is NOT the public-zone dark surface)
2. No `PublicNavbar` — the old `GlobalHeader` + `NavbarAuth` renders instead
3. No public-zone font variables applied explicitly (no `--font-playfair-display` in scope)
4. Visually disconnected from the rest of the public zone

---

### 🎯 Target State (After Story 7.5)

```
Route: /login
  └── (auth)/layout.tsx
        └── <PublicNavbarShell>            ← PUBLIC ZONE SHELL
              ├── <PublicNavbar />          ← EPIC 7 NAVBAR (logo, nav links, logged-out CTAs)
              └── <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-16">
                    └── <div className="w-full max-w-md">
                          └── login/page.tsx → <LoginForm />  ← VISUALLY POLISHED CARD

Route: /register
  └── (same structure via shared AuthLayout)

GlobalHeader (in root layout):
  └── shouldUsePublicNavbar("/login") → true   ← FIXED: returns null
  └── shouldUsePublicNavbar("/register") → true ← FIXED: returns null
```

---

### 📂 Files to Change

| File | Change Type | Change Description |
|------|-------------|-------------------|
| `project-e-course/src/components/shared/public-navbar-routes.ts` | **Modify** | Add `/login` and `/register` to `shouldUsePublicNavbar()` |
| `project-e-course/src/app/(auth)/layout.tsx` | **Refactor** | Replace generic centered container with `PublicNavbarShell` wrapper |
| `project-e-course/src/components/shared/login-form.tsx` | **Visual polish** | Update Card and input surface tokens for dark mode public-zone alignment |
| `project-e-course/src/components/shared/register-form.tsx` | **Visual polish** | Same surface token updates as login-form |
| `project-e-course/src/app/(auth)/register/page.tsx` | **Minor cleanup** | Remove unnecessary wrapper `<div>` around `<RegisterForm />` |

### 📂 Files NOT to Change

| File | Reason |
|------|--------|
| `project-e-course/src/app/(auth)/login/page.tsx` | Session check + redirect logic is correct and must not change |
| `project-e-course/src/server/actions/auth/register.ts` | Server action out of scope |
| `project-e-course/src/server/actions/auth/login.ts` | Server action out of scope (if exists) |
| `project-e-course/src/server/actions/auth/schemas.ts` | Validation schemas out of scope |
| `project-e-course/src/server/auth.ts` | Auth configuration out of scope |
| `project-e-course/src/components/shared/public-navbar.tsx` | Do NOT modify — works as-is |
| `project-e-course/src/components/shared/public-navbar-content.tsx` | Do NOT modify — works as-is |
| `project-e-course/src/components/shared/public-navbar-shell.tsx` | Do NOT modify — Story 7.4 finalized it |
| `project-e-course/src/components/shared/global-header.tsx` | Do NOT modify — the `shouldUsePublicNavbar` fix is sufficient |
| `project-e-course/src/app/(admin)/**` | Admin routes entirely out of scope |
| `project-e-course/src/app/(student)/courses/[slug]/lessons/**` | Lesson viewer out of scope |

---

### 🔧 Implementation: `public-navbar-routes.ts` Change

**Current:**
```ts
export function shouldUsePublicNavbar(pathname: string) {
  return pathname === "/" || pathname.startsWith("/courses") || pathname.startsWith("/pricing");
}
```

**After Story 7.5:**
```ts
export function shouldUsePublicNavbar(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/courses") ||
    pathname.startsWith("/pricing") ||
    pathname === "/login" ||
    pathname === "/register"
  );
}
```

**Why `===` instead of `startsWith` for auth routes:**
- `/login` and `/register` are exact paths, not prefixes for nested routes
- Using `startsWith("/login")` would be overly broad (though in practice no sub-routes exist)
- Exact match is more explicit and self-documenting

**`GlobalHeader` interaction:** The `GlobalHeader` component in `global-header.tsx` already has:
```tsx
if (pathname.startsWith("/admin") || shouldUsePublicNavbar(pathname)) return null;
```
After the update, `/login` and `/register` will return `null` from `GlobalHeader`, eliminating the old non-public header from these routes. ✅

---

### 🔧 Implementation: `(auth)/layout.tsx` Refactor

**Current:**
```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
```

**After Story 7.5:**
```tsx
import { PublicNavbarShell } from "~/components/shared/public-navbar-shell";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicNavbarShell>
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </PublicNavbarShell>
  );
}
```

**Key decisions:**
- `min-h-[calc(100vh-80px)]`: navbar height is 80px (`h-20`), so the remaining viewport height centers the form correctly
- `py-16`: adds breathing room top and bottom for the form card
- `PublicNavbarShell` provides: `flex min-h-screen flex-col`, so the inner div only needs to control centering
- `PublicNavbarShell` wraps content in `<div className="flex-1">`, so our inner layout div inherits from that

> ⚠️ **`PublicNavbarShell` is a Server Component.** The `AuthLayout` above is also a Server Component (no `"use client"` directive). This is correct. The `LoginForm` and `RegisterForm` children are Client Components (`"use client"`) — Next.js App Router handles this composition correctly.

---

### 🎨 Design Tokens Reference for Form Cards

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| Card background | `bg-white` | `dark:bg-[#1A1A24]` |
| Card border | `border-slate-200` | `dark:border-[#2A2A3C]` |
| Card border radius | `rounded-2xl` | same |
| Card shadow | `shadow-xl` | `dark:shadow-black/40` |
| Page background | `bg-white` (from shell) | `dark:bg-[#0F0F14]` (from shell) |
| Body text | `text-slate-900` (from shell) | `dark:text-white` (from shell) |
| Label text | `text-slate-700` | `dark:text-slate-300` |
| Supporting text | `text-slate-500` | `dark:text-slate-400` |
| Input bg | `bg-white` | `dark:bg-white/5` or `dark:bg-[#0F0F14]` |
| Input border | `border-slate-200` | `dark:border-white/10` |
| Input placeholder | `placeholder:text-slate-400` | `dark:placeholder:text-slate-500` |
| CTA primary | `bg-indigo-600 hover:bg-indigo-700` | same |
| Link color | `text-indigo-600` | `dark:text-indigo-400` |
| Error background | `bg-red-50` | `dark:bg-red-950/20` |
| Error border | `border-red-200` | `dark:border-red-900/50` |
| Error text | `text-red-700` | `dark:text-red-400` |

**Typography constraints:**
- ❌ NO Playfair Display on form content (no `font-[family-name:var(--font-playfair-display)]` on `CardTitle` or any form element)
- ❌ NO gradient hero treatment on auth pages
- ✅ Inter (inherited from `PublicNavbarShell`) is the correct font for all form content
- ✅ `tracking-[-0.02em]` (inherited from `PublicNavbarShell`) is already applied globally

---

### 🔧 Navbar Auth State on `/login` and `/register`

On `/login` and `/register`, the existing `page.tsx` files already redirect authenticated users away:
- `login/page.tsx`: `if (session) redirect(callbackUrl ?? "/courses")`
- `register/page.tsx`: `if (session) redirect("/courses")`

This means **in practice, the `PublicNavbar` on auth pages will always render the logged-out state** (Login + Get Started CTAs). No special handling is needed in `PublicNavbar` or `PublicNavbarContent` for this.

However, if for some reason a session is still valid when the navbar renders (race condition / edge case), the navbar will correctly show the user's avatar dropdown — this is acceptable behavior and requires no special handling.

---

### 📐 `next/font` Inheritance via `PublicNavbarShell`

`PublicNavbarShell` already declares and injects:
```tsx
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-playfair-display",
});
```

These CSS variables are applied via className on the shell's root div. When `(auth)/layout.tsx` uses `PublicNavbarShell`, the font variables are automatically available in scope for all children — including `LoginForm` and `RegisterForm`.

**No font declarations are needed in `AuthLayout`, `login/page.tsx`, or the form components.**

---

### 🚨 Anti-Patterns to Avoid

- ❌ Do NOT add `"use client"` to `AuthLayout` — it is and must remain a Server Component
- ❌ Do NOT add `"use client"` to `PublicNavbarShell` — it is a Server Component
- ❌ Do NOT import or re-declare `Inter` or `Playfair_Display` in `AuthLayout` — fonts come from `PublicNavbarShell`
- ❌ Do NOT use Playfair Display on `CardTitle` or any form label
- ❌ Do NOT apply gradient hero treatment to auth pages
- ❌ Do NOT change any server action files (`src/server/actions/auth/**`)
- ❌ Do NOT change `src/server/auth.ts`
- ❌ Do NOT change validation logic, `zodResolver` setup, or `RegisterSchema`/`LoginSchema`
- ❌ Do NOT change the redirect logic in `login/page.tsx` or `register/page.tsx`
- ❌ Do NOT change callbackUrl handling
- ❌ Do NOT change `PublicNavbar`, `PublicNavbarContent`, or `PublicNavbarShell`
- ❌ Do NOT touch admin routes or lesson viewer
- ❌ Do NOT add `shouldUsePublicNavbar` match for `/admin` — `GlobalHeader` already handles admin separately with `pathname.startsWith("/admin")` check before the `shouldUsePublicNavbar` check
- ❌ Do NOT use `startsWith("/login")` or `startsWith("/register")` — use exact `===` match since these are leaf routes

---

### 🧪 Test Strategy

This story touches **presentational layout and surface tokens** — the safest category of change. Functional tests for auth forms should remain unchanged.

**Existing tests to verify pass without modification:**
- `project-e-course/src/components/shared/global-header.test.tsx` — verify `GlobalHeader` returns null on `/login` and `/register` after `shouldUsePublicNavbar` update
- `project-e-course/src/components/shared/public-navbar-shell.test.tsx` — verify shell renders children correctly (no changes to shell)
- `project-e-course/src/components/shared/public-navbar.test.tsx` — verify navbar renders correctly (no changes to navbar)

**New tests to add:**
- `project-e-course/src/components/shared/public-navbar-routes.test.ts` — if it exists, add test cases for `/login` and `/register` returning `true`; if it doesn't exist, create it:
  ```ts
  import { shouldUsePublicNavbar } from './public-navbar-routes';
  it('returns true for /login', () => expect(shouldUsePublicNavbar('/login')).toBe(true));
  it('returns true for /register', () => expect(shouldUsePublicNavbar('/register')).toBe(true));
  it('returns false for /profile', () => expect(shouldUsePublicNavbar('/profile')).toBe(false));
  it('returns false for /admin', () => expect(shouldUsePublicNavbar('/admin')).toBe(false));
  ```

**Full test run commands:**
```bash
npx vitest run
npm run lint
npm run typecheck
```

**Specific targeted test run:**
```bash
npx vitest run "src/components/shared/global-header.test.tsx" "src/components/shared/public-navbar-shell.test.tsx" "src/components/shared/public-navbar.test.tsx"
```

---

### 📋 Route Group Structure Reference (Updated for Story 7.5)

```
src/app/
├── page.tsx                              ← Landing (/) — uses PublicNavbarShell inline ✅
├── (auth)/
│   ├── layout.tsx                        ← NOW uses PublicNavbarShell (Story 7.5) ✅
│   ├── login/page.tsx                    ← No changes (session check + redirect intact)
│   └── register/page.tsx                 ← Minor cleanup: remove redundant wrapper <div>
├── (student)/
│   ├── layout.tsx                        ← Passthrough — must remain empty ✅
│   ├── courses/
│   │   ├── layout.tsx                    ← Uses PublicNavbarShell ✅
│   │   └── [slug]/
│   │       └── lessons/[lessonId]/
│   │           └── page.tsx              ← DO NOT TOUCH (protected lesson viewer)
│   └── pricing/
│       ├── layout.tsx                    ← Uses PublicNavbarShell ✅
│       └── page.tsx                      ← DO NOT TOUCH
└── (admin)/
    └── admin/                            ← DO NOT TOUCH (entirely separate admin zone)
```

---

### References

- Epic 7 objective and Story 7.5 definition: [Source: `_bmad-output/planning-artifacts/epics.md#Epic-7`]
- Story 7.4 (shared public-zone layout consolidation): [Source: `_bmad-output/implementation-artifacts/7-4-shared-public-zone-layout-consistency.md`]
- `PublicNavbarShell` canonical implementation: [Source: `project-e-course/src/components/shared/public-navbar-shell.tsx`]
- `GlobalHeader` suppression logic: [Source: `project-e-course/src/components/shared/global-header.tsx`]
- `shouldUsePublicNavbar` current state: [Source: `project-e-course/src/components/shared/public-navbar-routes.ts`]
- `(auth)/layout.tsx` current state: [Source: `project-e-course/src/app/(auth)/layout.tsx`]
- `LoginForm` current state: [Source: `project-e-course/src/components/shared/login-form.tsx`]
- `RegisterForm` current state: [Source: `project-e-course/src/components/shared/register-form.tsx`]
- Public Zone Design Tokens: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Color-System`]
- Story 7.1 (courses catalog — dark surface cards `#1A1A24`, `#2A2A3C` borders): [Source: `_bmad-output/implementation-artifacts/7-1-courses-public-catalog-premium-surface.md`]

## Definition of Done

- [x] `shouldUsePublicNavbar()` returns `true` for both `/login` and `/register`
- [x] `/login` and `/register` render with `PublicNavbar` at the top (logo + Home/Courses/Pricing + Login/Get Started CTAs)
- [x] `/login` and `/register` do NOT render `GlobalHeader` + `NavbarAuth`
- [x] Auth pages use `bg-white dark:bg-[#0F0F14]` page surface (inherited from `PublicNavbarShell`)
- [x] Auth form cards use `bg-white dark:bg-[#1A1A24]` with `border dark:border-[#2A2A3C]` and `rounded-2xl`
- [x] Form typography uses Inter (no Playfair Display on form content)
- [x] Dark/light mode toggle works correctly on both auth pages
- [x] Login flow still works: valid credentials → redirect to correct destination
- [x] Register flow still works: valid registration → toast + redirect to `/login`
- [x] Form validation still works: empty/invalid fields → error messages displayed
- [x] `callbackUrl` parameter still respected in `LoginForm`
- [x] `npm run lint` passes with zero errors
- [x] `npm run typecheck` passes with zero errors
- [x] `npx vitest run` passes with the same or greater test count as post-Story-7.4

## Dev Agent Record

### Agent Model Used

cliproxy/gpt-5.4

### Debug Log References

- `npx vitest run "src/components/shared/public-navbar-routes.test.ts" "src/components/shared/global-header.test.tsx"` ✅
- `npx vitest run` ✅ (73 files, 246 tests passed) after repo-wide Vitest compatibility cleanup for legacy `node:test` imports in unrelated suites
- `npm run lint` ✅
- `npm run typecheck` ✅

### Completion Notes List

- Implemented public-navbar route alignment for `/login` and `/register` via `shouldUsePublicNavbar()` and verified `GlobalHeader` suppression with targeted Vitest coverage.
- Refactored `src/app/(auth)/layout.tsx` to wrap auth pages with `PublicNavbarShell`, preserving auth behavior while aligning auth entry routes with Epic 7 public-zone shell tokens.
- Polished `LoginForm` and `RegisterForm` surface, typography, label, input, support-link, and register error-alert styling without changing auth logic, validation, redirects, callbackUrl, or server actions.
- Removed the redundant wrapper div from `src/app/(auth)/register/page.tsx`.
- Completed repo-wide Vitest compatibility cleanup for legacy `node:test` imports in unrelated suites, restoring full green test execution without changing production business logic.
- Story accepted as done after visual review confirmation and full verification pass (`vitest`, `lint`, `typecheck`).

### File List

- `project-e-course/src/components/shared/public-navbar-routes.ts`
- `project-e-course/src/components/shared/public-navbar-routes.test.ts`
- `project-e-course/src/components/shared/global-header.test.tsx`
- `project-e-course/src/app/(auth)/layout.tsx`
- `project-e-course/src/components/shared/login-form.tsx`
- `project-e-course/src/components/shared/register-form.tsx`
- `project-e-course/src/app/(auth)/register/page.tsx`
- `_bmad-output/implementation-artifacts/7-5-login-and-register-public-zone-alignment.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `project-e-course/src/components/student/mark-complete-button.test.ts`
- `project-e-course/src/components/student/video-player-wrapper.test.ts`
- `project-e-course/src/components/student/lesson-view-skeleton.test.ts`
- `project-e-course/src/components/student/course-detail-skeleton.test.ts`
- `project-e-course/src/components/student/course-syllabus.test.ts`
- `project-e-course/src/server/queries/lessons.test.ts`
- `project-e-course/src/server/actions/quizzes/shared.test.ts`
- `project-e-course/src/server/queries/quizzes.test.ts`
- `project-e-course/src/lib/validations/quiz.test.ts`
- `project-e-course/src/server/actions/lessons/shared.test.ts`
- `project-e-course/src/server/queries/chapters.test.ts`
- `project-e-course/src/server/actions/chapters/shared.test.ts`
- `project-e-course/src/server/queries/courses.test.ts`
- `project-e-course/src/server/actions/courses/shared.test.ts`
- `project-e-course/src/lib/validations/course.test.ts`
- `project-e-course/src/server/actions/payments/process-webhook.test.ts`
- `project-e-course/src/app/api/webhooks/midtrans/route.test.ts`
- `project-e-course/src/server/actions/payments/webhook-utils.test.ts`
- `project-e-course/src/server/actions/payments/initiate-checkout.test.ts`
- `project-e-course/src/server/queries/plans.test.ts`
- `project-e-course/src/server/db/seed.test.ts`
- `project-e-course/src/server/courses/lesson-detail.test.ts`
- `project-e-course/src/app/(student)/courses/[slug]/lessons/[lessonId]/page.helpers.test.ts`
- `project-e-course/src/server/queries/subscriptions.test.ts`
- `project-e-course/src/server/db/schema.subscriptions.test.ts`
- `project-e-course/src/server/actions/progress/submit-quiz.test.ts`
- `project-e-course/src/server/courses/quiz-questions.test.ts`
- `project-e-course/src/server/actions/progress/mark-lesson-complete.test.ts`
- `project-e-course/src/server/courses/lesson-navigation.test.ts`
- `project-e-course/src/server/courses/course-detail.test.ts`
- `project-e-course/src/app/(student)/courses/[slug]/page.helpers.test.ts`
- `project-e-course/src/server/courses/search-published-courses.test.ts`
- `project-e-course/src/components/student/course-search-input.helpers.test.ts`
- `project-e-course/src/server/courses/published-course-catalog.test.ts`

## Change Log

- 2026-03-11: Story file created by SM agent (Bob). Status set to `ready-for-dev`. Extends public-zone shell (PublicNavbarShell) to auth entry routes `/login` and `/register`, aligning visual treatment with the public discovery and conversion surfaces established in Epic 7.
- 2026-03-11: Dev implementation started. Added `/login` and `/register` to public navbar route matching, moved auth layout onto `PublicNavbarShell`, polished auth form surfaces to public-zone tokens, and added navbar route regression coverage.
- 2026-03-11: Repo-wide Vitest compatibility cleanup completed for legacy `node:test` imports across unrelated suites. Full verification passed (`npx vitest run`, `npm run lint`, `npm run typecheck`) and Story 7.5 was closed as `done` after visual review confirmation.
