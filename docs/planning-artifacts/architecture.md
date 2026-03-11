---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ['prd.md', 'ux-design-specification.md']
workflowType: 'architecture'
project_name: 'hiring-seefluencer'
user_name: 'Rio'
date: '2026-03-06T17:03:15+07:00'
lastStep: 8
status: 'complete'
completedAt: '2026-03-06T18:13:00+07:00'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
Teridentifikasi 24 Functional Requirements yang terbagi dalam 5 kategori utama (Auth, Course Catalog, Learning Experience, Subscription, Admin Back-Office). Secara arsitektural ini menuntut pendekatan Monolith web app (Next.js) dengan peran ganda untuk public-facing student portal dan manajemen fungsional CMS back-office admin. Autentikasi dan autorisasi ketat sangat mendasar.

**Non-Functional Requirements:**

- **NFR-P1 & P2 (Performa & Routing):** Membutuhkan isolasi State yang cermat agar render cepat dan _seamless_.
- **NFR-U2 & U3 (UX Feedback):** Memerlukan arsitektur _optimistic UI_ dengan Suspense boundaries dan Client Components untuk toast dan progress bar interactives.
- **NFR-M1 (Reliability):** Drizzle ORM Schema digunakan sebagai _source of truth_ untuk seluruh propagasi tipe data TypeScript.

**Scale & Complexity:**

- Primary domain: EdTech SaaS Full-Stack Web App (Greenfield)
- Complexity level: Medium (Dibatasi 7 hari MVP)
- Estimated architectural components: ~8 sistem domain (Auth, Roles, Courses, Progress, Media, Quiz, Payment, Analytics)

### Technical Constraints & Dependencies

- **Tech Stack Wajib:** Next.js 15 (App Router), React 19, TypeScript strict, Tailwind, Drizzle ORM, Midtrans/Stripe Sandbox, NextAuth.js v4.
- **Waktu Kritis:** 7 Hari kalender maksimal untuk delivery. Membutuhkan _pragmatic architecture_ yang tidak _over-engineered_.
- **Midtrans Webhook Testing Constraint:** Membutuhkan solusi testing lokal (seperti ngrok) _atau_ arsitektur "Mock Webhook Controller" di sisi server untuk bypass kesulitan review HR Engineer di environment lokal mereka.

### Cross-Cutting Concerns Identified

1. **State Management Lesson View:** Untuk UX "instan" (Player/Progress tracking), menggunakan _URL Search Params as state_ alih-alih React Context Raksasa untuk mempertahankan SSR dan _shareability_.
2. **Session / Access Control:** NextAuth akan digunakan secara ekstensif via Middleware dan _route server action guards_ untuk limitasi Premium vs Gratis.
3. **Data Mutation Pattern:** Mayoritas operasi di-handle dengan RSC (React Server Components) dan Server Actions + `revalidatePath` ketimbang REST API, untuk kecepatan _fetching_ dan _mutations_.

## Starter Template Evaluation

### Primary Technology Domain

**Full-stack Web Application** (Next.js 15, Drizzle ORM, Tailwind CSS, NextAuth.js)

### Starter Options Considered

1. **Vercel Next.js Postgres Auth Starter**: Boilerplate resmi dari Vercel dengan Drizzle dan NextAuth. Keuntungannya sangat ringan, tapi NextAuth versinya di boilerplate ini terkadang masih V5 beta yang berubah-ubah, dan Tailwind-nya standar.
2. **Create T3 App (`create-t3-app`)**: Boilerplate ekosistem komunitas yang sangat modular. Mendukung Next.js 15 (App Router compatible), otomatis inisiasi Drizzle ORM, TailwindCSS, TypeScript strict mode, dan NextAuth v4 yang stabil.
3. **Manual CLI (`create-next-app`)**: Setup murni dari nol. Memakan waktu setup Drizzle dan NextAuth manual (sekitar 1-2 jam untuk menata skeleton).

### Selected Starter: Create T3 App (`create-t3-app`)

**Rationale for Selection:**
Mengingat tenggat waktu ketat 7 Hari MVP dan batasan NFR-M1 (Kedisiplinan TypeScript absolute), _Create T3 App_ adalah pondasi terbaik yang mengotomatisasi hal-hal membosankan tanpa bersikap terlalu _opinionated_ terhadap arsitektur layer UI. T3 mengonfigurasi tRPC secara fallback (bisa dicabut karena kita pakai Server Actions murni), namun yang terpenting: T3 menghubungkan Next.js 15 + Tailwind + Drizzle + NextAuth `v4` dalam satu perintah yang bebas _error environment_.

**Initialization Command:**

```bash
npx create-t3-app@latest hiring-seefluencer --nextAuth --tailwind --drizzle --dbProvider postgres
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**

- TypeScript murni dengan `strict: true` di `tsconfig.json`.
- Next.js 15 (App Router environment dipastikan via flag saat instalasi atau pasca-init manual).

**Styling Solution:**

- Tailwind CSS v3.4+ terkonfigurasi membaur secara build-time. _Pre-setup_ utilitas untuk `clsx` dan `tailwind-merge` akan dilakukan kemudian (bersamaan integrasi `shadcn/ui`).

**Database Tiers:**

- Drizzle ORM dengan _Postgres JS_ query builder terkonfigurasi rapi di dalam `src/server/db`. Skema _users_ bawaan dari NextAuth sudah otomatis di-scaffold.

**Authentication:**

- NextAuth.js terpasang terhubung dengan Drizzle Adapter (otomatis menabung sesi ke tabel `sessions` dan otentikasi ke `users`).

**Code Organization:**

- Struktur `src/` yang kaku dan rapi untuk memisahkan logika server (`src/server`) dan antarmuka web (`src/app`).
- Struktur `src/` yang kaku dan rapi untuk memisahkan logika server (`src/server`) dan antarmuka web (`src/app`).

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

- Data Validation Strategy (Zod)
- API Communication Pattern (React Server Components + Server Actions Murni)

**Important Decisions (Shape Architecture):**

- File Upload / Media Strategy (URL Text Only)

**Deferred Decisions (Post-MVP):**

- Cloud Storage bucket setup (Vercel Blob / S3), karena berisiko memakan waktu setup pada masa Hackathon 7 hari.

### Data Architecture

- **Data Validation:** Menggunakan **Zod**. T3 App secara bawaan membiasakan Zod untuk validasi environment backend. Kita akan membawanya ke level antarmuka: _Schema_ yang sama akan digunakan untuk validasi _Client Form_ (via `react-hook-form` + `@hookform/resolvers/zod`), dan juga divalidasi ulang di dalam fungsi _Server Action_. Menjamin tidak ada bad data yang masuk ke Drizzle.

### API & Communication Patterns

- **API Pattern:** **Server Actions murni (Tanpa `/api` folder)**. Karena Next.js 15 mendukung _stable Server Actions_, kita akan menggunakan form action standar React 19. Ini akan memangkas seluruh beban membuat endpoint _REST_, _type-sharing_ manual, dan _data fetching overhead_. Pengecualian hanya untuk rute tunggal Midtrans Webhook Handler yang tetap memerlukan endpoint HTTP statis standar POST (Route handler `/api/webhooks/midtrans`).
- **Server Actions Convention:** Setiap _Server Actions_ wajib memiliki kontrak _return type_ yang konsisten agar Frontend bisa me-render status UX (toast success/error) dengan benar, contohnya `{ success: true, data: T }` atau `{ success: false, error: string }`.

### Payload Storage & Media Strategy

- **File Uploads (Thumbnail dsb):** **URL Text Only dengan komponen Preview.** Alih-alih merancang sistem unggah _multipart/form-data_ ke _cloud bucket_, Dashboard Admin akan meminta elemen input teks biasa (URL dari Imgur, Unsplash, dsb). Untuk mencegah kesalahan _User Experience_ (Admin salah menyalin teks), form input akan dipasangkan dengan UI _Live Preview_ yang me-render target URL tersebut sesaat setelah disalin. Jika gambar _pecah_ di preview, berarti tautannya tidak valid. Pendekatan perancangan primitif ini menghemat >15% durasi e-course hackathon sambil tetap menjaga UI Admin terlihat _polished_.

### Decision Impact Analysis

**Implementation Sequence:**

1.  Setup Starter T3 App.
2.  Setup Skema Database Drizzle secara utuh (termasuk Auth & Modul Pembelajaran).
3.  Pemasangan konvensi Error Handling Server Actions dasar (Wrapper / Utility functions).
4.  Pembuatan UI System.

**Cross-Component Dependencies:**

- Keputusan Zod (Data Validation) dan Server Actions mengunci arsitektur layer Mutasi. Komponen Form UI harus dirancang menerima _Zod Schema_ secara generik.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
4 areas di mana AI agents (Frontend & Backend) dapat bertentangan saat pengembangan paralel, terutama pada penamaan, format _response_, _state management_, dan spesifikasi letak file.

### Naming Patterns

**Database Naming Conventions (Drizzle):**

- Nama Tabel: Menggunakan bentuk jamak dan `snake_case` (contoh: `users`, `course_modules`, `user_progress`).
- Nama Kolom: Menggunakan `snake_case` sesingkat mungkin tapi deskriptif (contoh: `id`, `created_at`, `course_id`).

**Code Naming Conventions (React/Next.js):**

- Nama Component: Menggunakan `PascalCase` (contoh: `CourseCard.tsx`).
- Nama Path Route (App Router): Menggunakan `kebab-case` (contoh: `/app/admin/manage-courses/page.tsx`).
- Nama Fungsi/Helper: Menggunakan `camelCase` (contoh: `calculateProgress()`).

### Format Patterns

**API & Server Actions Response Formats:**
Semua bentuk _Server Actions_ wajib memiliki _Return Type_ terstandarisasi untuk UI:

- **Success:** `{ success: true, data: T }`
- **Error:** `{ success: false, error: string }`

**Data Validation Formats:**

- _Zod schema_ digunakan dua kali: (1) pada `react-hook-form` di _client Component_, dan (2) diverifikasi ulang secara aman di _Server Action_.

### Structure Patterns

**Project Organization:**

- _Separation of Concerns:_ Fungsi bisnis backend dilarang keras ditulis menyatu dalam file komponen `page.tsx` atau UI.
- Semua _Server Actions_ (Logika form, mutasi DB) ditempatkan sentralistik ke teritori khusus seperti `/src/server/actions/`.

### Process Patterns

**Error Handling & Loading Patterns:**

- UI diinstruksikan murni memanfaatkan hooks _native_ React 19: `useActionState` untuk merekam _state action_ dari server, dan `useFormStatus` untuk melacak `pending` status secara _optimistic_.
- Dilarang membungkus seluruh app dengan Redux/Zustand jika sekadar untuk urusan state form sederhana.

### Enforcement Guidelines

**All AI Agents MUST:**

- Merujuk pada file `_components/ui/` saat menyusun tampilan (karena kita akan memakai pre-built _shadcn/ui_).
- Menambahkan type `ActionResponse<T>` secara konsisten ketika membuat fungsi _server action_.
- Berpatokan pada _schema drizzle_ ketika membutuhkan antarmuka Tipe Data (misalnya dengan menggunakan _Drizzle Infer_).
- Memperlakukan smooth scroll, parallax, progress-reveal animation, atau lightweight 3D / three.js treatment pada landing page hanya sebagai **progressive enhancement**; core readability, CTA navigation, dan responsive usability tidak boleh bergantung pada layer animasi berat.
- Menjaga reduced-motion friendly behavior serta baseline WCAG AA untuk public landing route `/` karena halaman ini reviewer-facing dan termasuk kategori halaman publik yang sensitif terhadap performance budget.

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
hiring-seefluencer/
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── drizzle.config.ts        # Drizzle config
├── env.js                   # Validasi Zod Environment Variables (T3 App env)
├── .env                     # Local environment
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/          # Rute login/register UI
│   │   ├── (student)/       # Layout portal student utama (Catalog, Lesson, dll)
│   │   ├── (admin)/admin/   # Dashboard CMS guru/admin
│   │   ├── api/             # Rute stateless (contoh: auth, webhooks)
│   │   │   ├── auth/[...nextauth]/
│   │   │   └── webhooks/midtrans/
│   │   ├── layout.tsx       # Root layout (Provider, font)
│   │   └── globals.css      # Tailwind base
│   ├── components/
│   │   ├── ui/              # Primitive components (Shadcn/ui)
│   │   ├── shared/          # Komponen lintas persona (navbar public, dsb)
│   │   ├── student/         # Komponen khusus portal student
│   │   └── admin/           # Komponen khusus dashboard CMS Admin
│   ├── server/
│   │   ├── db/              # Drizzle schema dan koneksi
│   │   ├── auth.ts          # Integrasi rute NextAuth
│   │   └── actions/         # React Server Actions (Feature-sliced)
│   │       ├── auth/
│   │       ├── courses/
│   │       ├── payments/
│   │       └── progress/
│   ├── lib/                 # Shared utilities stateless (contoh: kalkulasi waktu, parsing format)
│   └── middleware.ts        # Next.js Edge Middleware (RBAC routing)
└── public/
```

### Architectural Boundaries

**API & Route Boundaries (Middleware Protection):**
- `/admin/*`: WAJIB terotentikasi dan memiliki Role `TEACHER`. Jika tidak, _Edge Middleware_ (`src/middleware.ts`) meredirect ke landing page atau membuang error 403.
- `/`: Route publik utama yang berfungsi sebagai marketing landing page reviewer-facing. Route ini harus dapat diakses tanpa autentikasi, menampilkan identitas brand dan CTA ke `/courses` serta `/pricing`, namun tetap boleh memunculkan signed-in navbar state jika sesi tersedia.
- `/*` (Selain API & Admin): Terbuka secara parsial. Halaman Lesson Video `/course/[slug]/[lessonId]` tetap melakukan pengecekan `session` di level _Server Component_ untuk melimitasi akses sesuai kepemilikan kursus premium.
- `/api/webhooks/midtrans`: Satu-satunya route yang mengizinkan akses anonim (tanpa CSRF/Auth) untuk menerima _callback HTTP POST_ dari Midtrans sandbox, namun tervalidasi via _Signature Key_ rahasia.

**Explicit Route Protection Matrix:**

- **Public routes (NO auth guard, render for all visitors):**
  - `/` → public landing page / marketing surface
  - `/courses` → public course catalog
  - `/courses/[slug]` → public course landing / syllabus preview surface
  - `/pricing` → public pricing and conversion surface
  - `/login` → auth surface
  - `/register` → auth surface
  - `/api/webhooks/midtrans` → anonymous webhook endpoint with internal signature verification
- **Protected routes:**
  - `/admin/*` → auth + role protected in middleware
  - learning / premium access routes → protected at Server Component / Server Action layer based on session and entitlement checks
- **Critical clarification:** `/pricing` MUST remain publicly accessible. Session-aware rendering is allowed for contextual CTA behavior, but the route must never redirect unauthenticated visitors away from pricing content.

**Component Boundaries:**
- _Client Components_ murni (menggunakan `'use client'`) disarankan untuk elemen statis UI yang butuh interaktivitas saja (seperti Dropdown, Modal, Video Player, Toast Notification).
- _Form Components_ (di bawah folder admin) bertanggung jawab mengecek skema validasi `Zod` lokal sebelum dikirim (_dispatched_) ke `server/actions/`.
- Komponen marketing/public landing sebaiknya diletakkan di `src/components/shared/` agar reusable lintas surface, misalnya `PublicNavbar`, `LandingHero`, `LandingSection`, `LandingCTA`, `LandingScrollProgress`, dan `LandingSocialProof`.

**Service Boundaries (Server Actions):**
- Menerapkan _Feature-Sliced Actions_ (`server/actions/[feature]`) memastikan bahwa satu agen AI yang bekerja pada fitur _Payment_ tidak akan berkonflik *merge* dengan agen AI yang bekerja di fitur _Course Catalog_. Semua interaksi NextAuth ada di `actions/auth`, Drizzle mutasi tabel ada di `actions/courses` atau `actions/progress`.

### Requirements to Structure Mapping

**Feature/Epic Mapping:**
- Course Catalog & Player (FR03-FR09): Berada di `src/app/(student)/course/` dan ditenagai oleh logika `server/actions/courses/`. UI ada di `components/student/`.
- Otentikasi & Payment (FR01-02, FR10-14): Diletakkan di level yang lebih tinggi (`server/actions/auth` dan `server/actions/payments`), dengan perlindungan rute via Middleware.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
- Setup _Next.js 15 App Router_ secara harmonis berjalan mendampingi _React Server Actions_ murni dan skema _Drizzle ORM_.
- URL Search Params berfungsi sempurna untuk sinkronisasi antarmuka Lesson View yang melek performa tanpa overhead *context API*.

**Pattern Consistency:**
- Penggunaan **Zod** untuk validasi dwi-lapis (Client via `react-hook-form` & Server Actions) sangat bersinergi dengan ekosistem T3 App.
- Standarisasi `className` menggunakan kombinasi `clsx` dan `tailwind-merge` untuk komponen UI *custom* (di luar _shadcn_) dipastikan menghindari bentrok *styling*.

**Structure Alignment:**
- Fragmentasi *Feature-Sliced Actions* (`server/actions/courses/`, `/progress/`, dsb) di Next.js App Router secara solid mendukung pendelegasian sub-tugas pada *AI Agents* paralel di masa depan tanpa memicu konflik `git merge`.

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**
- Seluruh 24 FR pada dokumen *Hiring Challenge* telah diakomodasi. Mulai dari sistem _Auth_, akses _Course Player_, hingga Back-Office Admin CMS diwadahi via isolasi Route Groups `(student)` dan `(admin)`.

**Non-Functional Requirements Coverage:**
- **NFR-M1 (Type Safety):** Tercantum jelas bahwa _Drizzle Infer_ menjadi Single Source of Truth bagi tipe data TypeScript.
- **NFR-P1 (Performance):** Diakomodasi penuh dengan pola _React Server Components_ murni yang sangat menekan ukuran *client bundle js*.
- Tambahan Caching: Mengedepankan **ISR (Incremental Static Regeneration)** atau `unstable_cache` pada rute `/courses` guna mencegah pemborosan resource saat visitor publik mengakses katalog.

### Implementation Readiness Validation ✅

**Decision Completeness:**
Batas-batas (Boundaries) keamanan telah ditegaskan: _Middleware Edge_ akan me-rating pintu gerbang `/admin/*`, sedangkan proteksi Video Premium dilakukan lapis kedua di dalam _React Server Components_ secara presisi.

**Pattern & Structure Completeness:**
Arsitektur direktori `src/` tergambar 100% sampai lapis direktori fungsional dasar.

### Gap Analysis Results

**Important Gaps (Telah Tertutup):**
1. _ISR Caching Configuration_: AI Agen instruksi implementasi wajib menerapkan metadata `revalidate` di Catalog.
2. _RSC Paywall Logic_: Pengecekan status Subscription milik user *harus* terjadi *sebelum* memutar Video Stream ID di server.
3. _Tailwind CSS Overrides_: Kewajiban utilitas `cn()` (`clsx`+`twMerge`).

Semua Gap telah diverifikasi dan dicetak ke dalam Standar _Boundary_ & _Enforcements_ di atas.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication & Error patterns specified
- [x] Process patterns documented

**✅ Project Structure & Validation**
- [x] Complete directory structure defined
- [x] Component boundaries established 
- [x] Security limits mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** `READY FOR IMPLEMENTATION 🚀`
**Confidence Level:** High (Divalidasi dengan Party Mode lintas perspektif)

**Key Strengths:**
- Setup 7-Day MVP yang hyper-pragmatis dengan menjauhi pemborosan (*avoiding REST API, avoiding cloud bucket setup*).
- Sangat *Optimized* untuk SEO, Performance SSR, dan Type-Safety Strict.

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented.
- Perhatikan pemisahan *Feature-Sliced Server Actions* untuk menghindari tabrakan kerja antar agen.
- Gunakan `architecture.md` ini sebagai patron tunggal struktur file Next.js 15.

**First Implementation Priority:**
```bash
npx create-t3-app@latest hiring-seefluencer --nextAuth --tailwind --drizzle --dbProvider postgres
```
