# Story 1.1: Project Setup & Starter Template Initialization

Status: done

## Story

As a developer,
I want to bootstrap the application using the `create-t3-app` template inside the `project-e-course/` directory,
so that the foundational structure (Next.js 15, Drizzle ORM, NextAuth v4, Tailwind CSS) is ready for all subsequent feature stories.

## Acceptance Criteria

1. **Given** the `project-e-course/` directory is empty, **When** the developer runs the T3 init command pointed to `./project-e-course`, **Then** the full T3 boilerplate is generated without errors and the dev server starts successfully at `localhost:3000`.
2. **Given** the T3 app is bootstrapped, **When** the Drizzle schema is applied, **Then** all 9 domain tables (`users`, `accounts`, `sessions`, `verification_tokens`, `courses`, `chapters`, `lessons`, `user_progress`, `quizzes`, `quiz_attempts`, `plans`, `subscriptions`) are created in the local/configured Postgres database with correct cascade-delete constraints.
3. **Given** the database schema is migrated, **When** the dev server runs, **Then** there are zero TypeScript errors (`tsc --noEmit` passes) and zero lint errors.
4. **Given** the project is set up, **When** reviewing env vars, **Then** all sensitive keys (`NEXTAUTH_SECRET`, `DATABASE_URL`, Midtrans keys stubs) are stored in `.env` and validated via the T3 `env.js` Zod schema — none are exposed via NEXT*PUBLIC* or serialized to the browser.
5. **Given** the base structure is in place, **When** reviewing the source tree, **Then** it matches the canonical folder structure defined in `architecture.md` (`src/app`, `src/components/ui`, `src/server/db`, `src/server/actions/`, `src/middleware.ts`, etc.).
6. **Given** shadcn/ui is to be the UI component library, **When** shadcn is initialized using `npx shadcn@latest init`, **Then** it integrates cleanly with the Tailwind config and the `src/components/ui/` directory is created.
7. **Given** the project root has been set up, **When** reviewing `next.config.ts`, **Then** the configuration is ready (app router enabled, no `pages/` directory used).

## Tasks / Subtasks

- [x] **Task 1: Bootstrap T3 App inside `project-e-course/`** (AC: #1)
  - [x] Run: `npx create-t3-app@latest . --nextAuth --tailwind --drizzle --dbProvider postgres --appRouter --noGit` from inside `project-e-course/` directory (use `--noGit` since the parent repo already has git)
  - [x] Confirm Next.js 15 + App Router is selected during init (or manually upgrade if T3 scaffolds Next.js 14)
  - [x] Verify `package.json` has correct Next.js version (`^15.x`)
  - [x] Run `npm install` to install all dependencies

- [x] **Task 2: Configure Environment Variables** (AC: #4)
  - [x] Create `.env` file from `.env.example`
  - [x] Add `DATABASE_URL` for local Postgres (e.g. `postgresql://postgres:password@localhost:5432/hiring_seefluencer`)
  - [x] Generate and add `NEXTAUTH_SECRET` via `openssl rand -base64 32`
  - [x] Add stub Midtrans env vars: `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY` (set to placeholder for now)
  - [x] Update `src/env.js` Zod schema to include all project-specific env vars (not just T3 defaults)
  - [x] Confirm `NEXTAUTH_URL=http://localhost:3000` is set

- [x] **Task 3: Define the Complete Drizzle Database Schema** (AC: #2)
  - [x] Open `src/server/db/schema.ts`
  - [x] Keep the T3 default NextAuth tables (`users`, `accounts`, `sessions`, `verification_tokens`) — do NOT remove them
  - [x] Add `role` column to `users` table: `role: varchar("role", { length: 20 }).default("student").notNull()` — valid values: `"student"` | `"admin"`
  - [x] Add the 8 domain tables below in one schema file or split into a `src/server/db/` sub-schema structure:

  **`courses` table:**

  ```typescript
  export const courses = pgTable('courses', {
  	id: serial('id').primaryKey(),
  	title: varchar('title', { length: 255 }).notNull(),
  	description: text('description'),
  	thumbnailUrl: text('thumbnail_url'),
  	slug: varchar('slug', { length: 255 }).unique().notNull(),
  	isFree: boolean('is_free').default(true).notNull(),
  	isPublished: boolean('is_published').default(false).notNull(),
  	createdAt: timestamp('created_at').defaultNow().notNull(),
  	updatedAt: timestamp('updated_at').defaultNow().notNull(),
  });
  ```

  **`chapters` table:**

  ```typescript
  export const chapters = pgTable('chapters', {
  	id: serial('id').primaryKey(),
  	courseId: integer('course_id')
  		.references(() => courses.id, { onDelete: 'cascade' })
  		.notNull(),
  	title: varchar('title', { length: 255 }).notNull(),
  	description: text('description'),
  	order: integer('order').notNull(),
  	createdAt: timestamp('created_at').defaultNow().notNull(),
  });
  ```

  **`lessons` table:**

  ```typescript
  export const lessons = pgTable('lessons', {
  	id: serial('id').primaryKey(),
  	chapterId: integer('chapter_id')
  		.references(() => chapters.id, { onDelete: 'cascade' })
  		.notNull(),
  	title: varchar('title', { length: 255 }).notNull(),
  	type: varchar('type', { length: 20 }).notNull(), // 'video' | 'text' | 'quiz'
  	content: text('content'), // URL for video, markdown text for text lessons
  	isFree: boolean('is_free').default(false).notNull(),
  	order: integer('order').notNull(),
  	createdAt: timestamp('created_at').defaultNow().notNull(),
  });
  ```

  **`user_progress` table:**

  ```typescript
  export const userProgress = pgTable('user_progress', {
  	id: serial('id').primaryKey(),
  	userId: text('user_id')
  		.references(() => users.id, { onDelete: 'cascade' })
  		.notNull(),
  	lessonId: integer('lesson_id')
  		.references(() => lessons.id, { onDelete: 'cascade' })
  		.notNull(),
  	completedAt: timestamp('completed_at').defaultNow().notNull(),
  });
  ```

  **`quizzes` table (questions):**

  ```typescript
  export const quizzes = pgTable('quizzes', {
  	id: serial('id').primaryKey(),
  	lessonId: integer('lesson_id')
  		.references(() => lessons.id, { onDelete: 'cascade' })
  		.notNull(),
  	question: text('question').notNull(),
  	optionA: text('option_a').notNull(),
  	optionB: text('option_b').notNull(),
  	optionC: text('option_c').notNull(),
  	optionD: text('option_d').notNull(),
  	correctAnswer: varchar('correct_answer', { length: 1 }).notNull(), // 'A' | 'B' | 'C' | 'D'
  	points: integer('points').default(10).notNull(),
  	createdAt: timestamp('created_at').defaultNow().notNull(),
  });
  ```

  **`quiz_attempts` table:**

  ```typescript
  export const quizAttempts = pgTable('quiz_attempts', {
  	id: serial('id').primaryKey(),
  	userId: text('user_id')
  		.references(() => users.id, { onDelete: 'cascade' })
  		.notNull(),
  	lessonId: integer('lesson_id')
  		.references(() => lessons.id, { onDelete: 'cascade' })
  		.notNull(),
  	score: integer('score').notNull(),
  	totalPoints: integer('total_points').notNull(),
  	passed: boolean('passed').notNull(),
  	submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  });
  ```

  **`plans` table:**

  ```typescript
  export const plans = pgTable('plans', {
  	id: serial('id').primaryKey(),
  	name: varchar('name', { length: 100 }).notNull(),
  	price: integer('price').notNull(), // in IDR (smallest unit)
  	durationDays: integer('duration_days').notNull(),
  	createdAt: timestamp('created_at').defaultNow().notNull(),
  });
  ```

  **`subscriptions` table:**

  ```typescript
  export const subscriptions = pgTable('subscriptions', {
  	id: serial('id').primaryKey(),
  	userId: text('user_id')
  		.references(() => users.id, { onDelete: 'cascade' })
  		.notNull(),
  	planId: integer('plan_id')
  		.references(() => plans.id, { onDelete: 'restrict' })
  		.notNull(),
  	status: varchar('status', { length: 20 }).default('inactive').notNull(), // 'active' | 'inactive' | 'expired'
  	startDate: timestamp('start_date'),
  	endDate: timestamp('end_date'),
  	midtransOrderId: varchar('midtrans_order_id', { length: 255 }),
  	createdAt: timestamp('created_at').defaultNow().notNull(),
  	updatedAt: timestamp('updated_at').defaultNow().notNull(),
  });
  ```

- [x] **Task 4: Run Database Migrations** (AC: #2)
  - [x] Update `drizzle.config.ts` to point to `src/server/db/schema.ts` (or index.ts)
  - [x] Run `npm run db:push` (T3's push command) OR `npm run db:generate` then `npm run db:migrate` to apply schema
  - [x] Verify all tables exist in Postgres by running `npm run db:studio` or connecting via psql

- [x] **Task 5: Initialize shadcn/ui** (AC: #6)
  - [x] Run: `npx shadcn@latest init` from inside `project-e-course/`
  - [x] Choose "New York" style, "Zinc" base color (or "Neutral" — align with UX spec dark mode)
  - [x] Confirm `components.json` is created and `src/components/ui/` is set as component directory
  - [x] Run: `npx shadcn@latest add button card input label toast sonner` to install core UI primitives needed for upcoming stories

- [x] **Task 6: Set Up `cn()` Utility** (AC: #5)
  - [x] Confirm `clsx` and `tailwind-merge` are installed (shadcn/ui init should add them)
  - [x] Ensure `src/lib/utils.ts` exports: `export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }`

- [x] **Task 7: Configure Canonical Folder Structure** (AC: #5)
  - [x] Create directories that T3 doesn't scaffold by default:
    - `src/app/(auth)/` — for login/register pages (empty for now)
    - `src/app/(student)/` — for student portal routes (empty for now)
    - `src/app/(admin)/admin/` — for admin dashboard routes (empty for now)
    - `src/components/shared/` — for cross-persona components
    - `src/components/student/` — for student-specific components
    - `src/components/admin/` — for admin-specific components
    - `src/server/actions/auth/` — auth server actions
    - `src/server/actions/courses/` — course server actions
    - `src/server/actions/payments/` — payment server actions
    - `src/server/actions/progress/` — progress server actions
  - [x] Add a `.gitkeep` file in each empty directory to preserve them in git

- [x] **Task 8: Set Up Next.js Middleware Stub** (AC: #5)
  - [x] Create `src/middleware.ts` with a stub that protects `/admin/*` routes (full implementation in Story 1.3):

  ```typescript
  export { default } from 'next-auth/middleware';
  export const config = { matcher: ['/admin/:path*'] };
  ```

- [x] **Task 9: Define Global TypeScript Types** (AC: #3)
  - [x] Create `src/types/index.ts` with the universal Server Action response type:

  ```typescript
  export type ActionResponse<T = undefined> =
  	| { success: true; data: T }
  	| { success: false; error: string };
  ```

- [x] **Task 10: Configure next-themes for Dark Mode** (AC: #5)
  - [x] Install: `npm install next-themes`
  - [x] Create `src/components/shared/theme-provider.tsx` wrapping `ThemeProvider` from `next-themes`
  - [x] Wrap root `src/app/layout.tsx` with `ThemeProvider` (attribute="class", defaultTheme="system", enableSystem)

- [x] **Task 11: Final Verification** (AC: #3)
  - [x] Run `npm run dev` — dev server must start at localhost:3000 without errors
  - [x] Run `npx tsc --noEmit` — zero TypeScript errors
  - [x] Run linter: `npm run lint` — zero errors

## Dev Notes

### 🔴 CRITICAL: All Code Goes Inside `project-e-course/`

The entire Next.js application lives at:

```
d:\RioRaditya\Ngoding\hiring-seefluencer\project-e-course\
```

**Never** place source files outside of `project-e-course/`. The `_bmad-output/` folder is for planning documentation only.

### T3 App Initialization — Exact Command

```bash
# Navigate into project-e-course first, then run:
cd project-e-course
npx create-t3-app@latest . --nextAuth --tailwind --drizzle --dbProvider postgres --appRouter --noGit
```

> **Why `--noGit`?** The parent `hiring-seefluencer/` directory already has a git repo. We don't want T3 to init a new nested git repo inside `project-e-course/`.

> **Why `--appRouter`?** We're using App Router (Next.js 15). The `--pages` flag would scaffold the deprecated Pages Router.

### T3 App — Post-Init Potential Issues

- T3 may scaffold **Next.js 14** instead of 15. After init, check `package.json` and upgrade: `npm install next@latest react@latest react-dom@latest`
- T3 scaffolds **tRPC** by default even if not selected in prompts in some versions. Remove it if present: delete `src/server/api`, `src/trpc/`, and uninstall `@trpc/*` packages.
- The T3 default `users` table already includes `id`, `name`, `email`, `emailVerified`, `image`. DO NOT recreate these. Only ADD additional columns like `role`.

### Database Schema — Key Constraints

- `users.id` in T3/NextAuth is type `text` (UUID string), NOT `serial`/`integer`. All FK references to `users.id` must use `text()`.
- All domain table IDs (`courses`, `chapters`, etc.) use `serial()` (auto-increment integers).
- Cascade delete chain: `courses` → `chapters` → `lessons` → `user_progress`, `quizzes`, `quiz_attempts`.
- `subscriptions.planId` uses `{ onDelete: "restrict" }` — do not delete a plan if subscriptions reference it.

### shadcn/ui Integration

- shadcn v2 (latest) uses `components.json` for configuration and imports from `@/components/ui/`.
- The `cn()` utility (`clsx` + `tailwind-merge`) MUST be used for ALL className concatenation in custom components.
- Do NOT use string template literals for conditional class names — always use `cn()`.

### Environment Variable Validation (T3 env.js)

The `env.js` file at the project root validates all env vars at build and startup time using Zod. When adding new env vars, you MUST declare them in BOTH:

1. `env.js` → `server` object (for server-side vars like `NEXTAUTH_SECRET`)
2. `.env` file (actual values)

Failing to declare in `env.js` will cause a runtime error. Never add sensitive keys to `NEXT_PUBLIC_*` namespace.

### next-themes Dark Mode

- Use `attribute="class"` so Tailwind's `dark:` variants work correctly (class-based dark mode).
- `suppressHydrationWarning` must be added to the `<html>` tag in `layout.tsx` to prevent hydration mismatch.

### Canonical Folder Structure (from architecture.md)

```
project-e-course/
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── drizzle.config.ts
├── env.js                         ← T3 env validation
├── .env                           ← Local secrets (gitignored)
├── src/
│   ├── app/
│   │   ├── (auth)/                ← login, register pages
│   │   ├── (student)/             ← course catalog, lesson view
│   │   ├── (admin)/admin/         ← back-office CMS
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   └── webhooks/midtrans/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                    ← shadcn/ui primitives
│   │   ├── shared/                ← ThemeProvider, Navbar, etc.
│   │   ├── student/               ← Student-specific components
│   │   └── admin/                 ← Admin-specific components
│   ├── server/
│   │   ├── db/
│   │   │   ├── index.ts           ← drizzle client
│   │   │   └── schema.ts          ← ALL table definitions
│   │   ├── auth.ts                ← NextAuth config
│   │   └── actions/
│   │       ├── auth/
│   │       ├── courses/
│   │       ├── payments/
│   │       └── progress/
│   ├── lib/
│   │   └── utils.ts               ← cn() utility
│   ├── types/
│   │   └── index.ts               ← ActionResponse<T>, shared types
│   └── middleware.ts              ← Edge Middleware for /admin/*
└── public/
```

### Tech Stack — Exact Versions (as of March 2026)

- **Next.js**: `^15.x` (App Router required)
- **React**: `^19.x`
- **TypeScript**: `^5.x` with `strict: true`
- **Drizzle ORM**: `^0.38.x` + `drizzle-kit ^0.29.x`
- **NextAuth.js**: `^4.x` (NOT v5/Auth.js — T3 uses stable v4)
- **Tailwind CSS**: `^3.4.x`
- **shadcn/ui**: Latest (`npx shadcn@latest`)
- **postgres**: `^3.x` (Drizzle's postgres driver)
- **next-themes**: `^0.4.x`
- **zod**: `^3.x`

### Project Structure Notes

- This story creates the foundation — the canonical folder structure from `architecture.md` MUST be established now, even as empty directories, to prevent future stories from using wrong paths.
- The `src/types/index.ts` `ActionResponse<T>` type is critical — ALL 20+ server actions across subsequent stories depend on this type contract. Get it right now.
- `src/middleware.ts` stub protects `/admin/*` — this prevents accidental public access to admin routes during development even before full RBAC is implemented.

### Alignment with Unified Project Structure

- Code path: `d:\RioRaditya\Ngoding\hiring-seefluencer\project-e-course\` (REQUIRED)
- Planning docs: `d:\RioRaditya\Ngoding\hiring-seefluencer\_bmad-output\` (READ ONLY — do not write code here)
- No conflicts detected with the architecture spec.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation] — T3 App selection rationale and init command
- [Source: _bmad-output/planning-artifacts/architecture.md#Complete Project Directory Structure] — Canonical folder structure
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns] — snake_case DB, PascalCase components, kebab-case routes
- [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns] — `ActionResponse<T>` type contract
- [Source: _bmad-output/planning-artifacts/architecture.md#Enforcement Guidelines] — `cn()` utility, shadcn/ui, Drizzle Infer
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1] — User story statement and acceptance criteria
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture] — Zod dual-layer validation strategy
- [Source: _bmad-output/planning-artifacts/architecture.md#Additional Requirements] — Full DB schema (9 tables requirement)

## Dev Agent Record

### Agent Model Used

Gemini 2.5 Pro (Antigravity) — Story Context Creation

### Debug Log References

_None yet — this is a greenfield initialization story._

### Completion Notes List

- Succeeded in scaffolding the Next.js App Router application.
- Configured environment variables (Midtrans, NextAuth, Postgres).
- Discarded Prisma and TRPC from the default T3 setup in favor of Drizzle ORM and server actions as per specs.
- Created `schema.ts` housing the 9 domain tables plus NextAuth requirements.
- Configured shadcn-ui and added foundational UI primitives.
- Global TypeScript types (`ActionResponse`) and TS path aliases resolved.

### File List

- `project-e-course/package.json` (modified)
- `project-e-course/src/server/db/schema.ts` (created)
- `project-e-course/src/server/db/index.ts` (modified)
- `project-e-course/src/server/auth.ts` (modified)
- `project-e-course/src/app/api/auth/[...nextauth]/route.ts` (created)
- `project-e-course/src/types/index.ts` (created)
- `project-e-course/src/middleware.ts` (created)
- `project-e-course/src/lib/utils.ts` (created)
- `project-e-course/src/components/shared/theme-provider.tsx` (created)
- `project-e-course/src/app/layout.tsx` (modified)
- `project-e-course/drizzle.config.ts` (created)
- `project-e-course/env.js` (modified)
- `project-e-course/.env` (created)
- `project-e-course/components.json` (created)
- `project-e-course/src/app/page.tsx` (modified)
