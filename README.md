# Seefluencer E-Course Platform

Seefluencer adalah platform e-course berbasis web yang dibangun sebagai MVP EdTech full-stack untuk hiring challenge Full Stack Engineer. Aplikasi ini mencakup alur end-to-end untuk public discovery, autentikasi, katalog course, lesson viewer, quiz, progress tracking, admin CMS, pricing, dan integrasi Midtrans Sandbox untuk simulasi subscription premium.

Project ini dirancang dengan fokus pada dua hal utama:

- **premium reviewer-facing UI/UX** untuk memberi impresi visual yang kuat,
- **clean and scalable architecture** agar mudah dipahami, diuji, dan dikembangkan lebih lanjut.

---

## Highlights

- Public landing page, course catalog, course detail, dan pricing surface yang polished
- Authentication lengkap: register, login, logout, profile management
- Role-based access control untuk **student** dan **admin**
- Admin CMS untuk mengelola course, chapter, lesson, dan quiz
- Lesson viewer dengan progress tracking, mark-as-complete, dan auto-navigation
- Quiz engine dengan instant grading dan passing score
- Subscription flow dengan **Midtrans Sandbox** + webhook settlement handling
- Dark mode dan UI polish untuk public zone dan learning zone
- Temporary local thumbnail upload pipeline dengan WebP optimization + fallback placeholder

---

## Product Scope

Secara fungsional, project ini mencakup domain utama berikut:

1. **Authentication & Identity**
   - Register
   - Login
   - Logout
   - Profile management
   - Session-based route protection

2. **Course Catalog & Discovery**
   - Public course listing
   - Search & discovery
   - Public course detail / syllabus preview

3. **Learning Experience**
   - Multimedia lesson viewer
   - Course sidebar and navigation
   - Progress tracking
   - Interactive quiz execution and grading

4. **Subscription & Access Control**
   - Pricing page
   - Midtrans sandbox checkout
   - Premium lesson/paywall enforcement
   - Webhook-driven subscription activation

5. **Admin Back-Office CMS**
   - Dashboard analytics
   - Course management
   - Chapter management
   - Lesson management
   - Quiz builder
   - Temporary local thumbnail upload workflow

---

## Tech Stack

### Core Framework
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript** (`strict` mode)

### Styling & UI
- **Tailwind CSS**
- **shadcn/ui**-style component architecture
- **Radix UI** primitives
- **next-themes** for dark mode
- **Lucide React** for icons

### Forms & Validation
- **react-hook-form**
- **Zod**
- **@hookform/resolvers**

### Authentication
- **NextAuth.js v4**
- **@auth/drizzle-adapter**

### Database & ORM
- **PostgreSQL**
- **Drizzle ORM**
- **drizzle-kit**
- **postgres** driver

### Data Fetching / App Patterns
- **React Server Components**
- **Server Actions** as the main mutation pattern
- **TanStack Query** (installed in the stack)

### Payments
- **Midtrans Sandbox**

### Testing & Quality
- **Vitest**
- **Testing Library**
- **ESLint**
- **Prettier**

---

## Project Structure

```text
project-e-course/
├── docs/                      # Project documentation snapshots and delivery artifacts
│   ├── planning-artifacts/
│   └── implementation-artifacts/
├── public/                    # Public static assets
├── scripts/                   # Utility and database seed scripts
├── src/
│   ├── app/                   # Next.js App Router routes
│   ├── components/            # UI components (shared, admin, student, ui)
│   ├── lib/                   # Shared utilities and validations
│   └── server/                # Auth, DB, server actions, server-side domain logic
├── drizzle.config.ts          # Drizzle configuration
├── next.config.js             # Next.js configuration
├── package.json
└── README.md
```

---

## Documentation

Project documentation is available inside:

```text
project-e-course/docs/
```

### Planning Artifacts
Located in:

```text
project-e-course/docs/planning-artifacts/
```

Contains, among others:
- `prd.md`
- `architecture.md`
- `epics.md`
- `ux-design-specification.md`
- implementation readiness and change proposal documents

### Implementation Artifacts
Located in:

```text
project-e-course/docs/implementation-artifacts/
```

Contains:
- per-story implementation records
- sprint status tracking
- epic retrospectives

These documents are useful for reviewers who want to inspect:
- product direction
- architecture decisions
- implementation scope by story
- delivery progress across epics

---

## Scripts

### App Lifecycle
- `npm run dev` — start development server with Turbopack
- `npm run build` — build production bundle
- `npm run start` — run production server
- `npm run preview` — build and start in one step

### Code Quality
- `npm run lint` — run Next.js ESLint checks
- `npm run lint:fix` — auto-fix lint issues where possible
- `npm run typecheck` — run TypeScript type checking
- `npm run format:check` — check formatting with Prettier
- `npm run format:write` — format files with Prettier
- `npm exec vitest run` — run the Vitest test suite

### Database
- `npm run db:generate` — generate Drizzle migration files
- `npm run db:migrate` — run Drizzle migrations
- `npm run db:push` — push schema changes directly to the database
- `npm run db:studio` — open Drizzle Studio
- `npm run db:seed` — seed base pricing plans
- `npm run db:seed:story-2-3` — run additional story-specific seed flow

### Seeder / Utility Files
Located in:

```text
project-e-course/scripts/
```

Current scripts include:
- `run-db-seed.mjs`
- `run-seed-story-2-3.mjs`
- `seed-story-2-3.sql`

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values.

```bash
cp .env.example .env
```

Required environment variables:

```bash
DATABASE_URL=""
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"

MIDTRANS_SERVER_KEY=""
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=""
```

### Notes
- `DATABASE_URL` must point to a PostgreSQL database
- `NEXTAUTH_SECRET` is required for secure auth sessions
- `NEXTAUTH_URL` should match your local or deployed app URL
- Midtrans keys are required to test pricing and checkout flow end-to-end

---

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env` based on `.env.example` and fill in the required values.

### 3. Prepare the database

```bash
npm run db:push
```

Or, if using generated migrations:

```bash
npm run db:migrate
```

### 4. Seed initial data

```bash
npm run db:seed
```

### 5. Start development server

```bash
npm run dev
```

App default URL:

```text
http://localhost:3000
```

---

## Testing & Verification

Recommended verification commands:

```bash
npm exec vitest run
npm run lint
npm run typecheck
```

Optional full sanity check:

```bash
npm run build
```

---

## Authentication & Roles

This application uses role-based access control:

- **student** — access learning and subscription flows
- **admin** — access CMS/back-office routes under `/admin/*`

Protected areas include admin routes and premium learning flows. Public routes include the landing page, public catalog, public course detail, pricing, login, and register.

---

## Payments

This project integrates **Midtrans Sandbox** for local subscription and checkout testing.

To test pricing and checkout flow locally, provide the following in `.env`:

```bash
MIDTRANS_SERVER_KEY="SB-Mid-server-xxxx"
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxx"
```

Reviewers can use their own Midtrans Sandbox account credentials, or placeholder values if they only want to review UI flow without executing payment settlement.

---

## Thumbnail Upload Note

The current course thumbnail workflow uses a **temporary local-first implementation** for admin uploads. This was intentionally introduced as a transitional approach for project handoff.

- Uploaded thumbnails are optimized for thumbnail usage
- Processed images are stored locally for now
- Public catalog/detail pages include placeholder fallback behavior if a thumbnail is missing or broken

This area is intentionally designed to be replaceable with **Supabase Storage** or another managed asset storage solution in a future iteration.

---

## Reviewer Notes

This repository was prepared to be review-friendly for a hiring / technical evaluation context. In particular:

- core user journeys are implemented end-to-end
- architecture and planning docs are included in `docs/`
- database seed scripts are included in `scripts/`
- the app is structured around scalable boundaries (`app`, `components`, `lib`, `server`)

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.

Copyright (c) Fachrio Raditya.
