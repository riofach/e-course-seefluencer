---
stepsCompleted: [1, 2, 3, 4]
workflowType: 'create-epics-and-stories'
user_name: 'Rio'
date: '2026-03-06'
workflow_completed: true
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
---

# hiring-seefluencer - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for hiring-seefluencer, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR01: Pengguna dapat mendaftar (Register) akun menggunakan formulir standar email dan kata sandi yang dikodekan (hashed).
FR02: Pengguna dapat masuk (Login) dengan email dan password yang terautentikasi oleh tata kelola sistem sesi NextAuth.
FR03: Pengguna dapat keluar (Logout) dari sesi aktif secara aman dengan mencabut cache sesi cookie.
FR04: Pengguna dapat melihat dan memperbarui properti dasar biodata pada Halaman Profil (Nama).
FR05: Sistem secara implisit mendifferensiasi hak akses rute privat berdasarkan nilai variabel role (admin atau student).
FR06: Pengguna dapat melihat galeri utama (listing) katalog Course yang dirilis spesifik dalam wujud 'published'.
FR07: Pengguna dapat mencari course sesuai dengan frasa pengetikan input (Search bar dengan pencarian berbasis teks/ILIKE).
FR08: Pengguna dapat mengklik sebuah kursus dan diarahkan ke Halaman Detail yang menerangkan informasi umum dan Daftar Silabus (Chapter > Lesson).
FR09: Murid membuka navigasi khusus (Learning Platform View) berisi konten Lesson aktif baik berbentuk teks redaksional maupun panel iframes Video.
FR10: Murid dapat melakukan klik deklaratif ("Mark as Completed") di setiap penghujung materi lesson untuk mengeksekusi rekam jejak penyelesaian.
FR11: Murid dijamin dapat melihat representasi persentase progres secara numerikal (Berdasarkan jumlah lesson yang dikerjakan dibandingkan total).
FR12: Sistem memfasilitasi antarmuka ergonomis untuk bernavigasi transisi satu Lesson berlanjut ke Lesson selanjutnya di satu rute terisolasi.
FR13: Murid dapat mengerjakan kumpulan soal tes pada Lesson bertipe 'Quiz', memilih argumen A/B/C/D di semua indeks opsi sebelum submit.
FR14: Sistem mengeksekusi kalkulasi poin dan melahirkan skor bulat akhir dan status absolut (Passed jika ≥70%, Failed bila tidak).
FR15: Sistem mencegat rute dengan antarmuka penawaran berlangganan (Paywall) bila pengguna tidak memegang subscription sah mengakses Premium Lesson.
FR16: Pengguna terautentikasi dapat memuat halaman paket harga (Pricing Card) langganan.
FR17: Pengguna memproses siklus pembayaran Midtrans Sandbox pada tombol konversi paket.
FR18: Sistem Webhook dapat mendengar dan mengubah atribut subscription menjadi `active` dan `endDate` yang dikalkulasi pasca settlement.
FR19: Pengguna Admin menerima akses prioritas dasbor Back-Office CMS.
FR20: Admin dapat membaca statistik sederhana dengan akumulasi total subentitas (Users, Courses, dan Subscriptions).
FR21: Admin dapat mengelola Course penuh (Create, Edit, Delete / Publikasi vs Draft), meliputi judul, sinopsis, thumbnail URL, slug, dan akses Gratis/Berbayar.
FR22: Admin dapat merangkai urutan hierarki Chapter: Mengemas Judul, Deskripsi, dan pengaturan urutan kemunculan di dalam Course.
FR23: Admin dapat menambahkan entitas Lesson: melabeli tipe (Video, Teks, atau Quiz), menetapkan URL materi, di dalam Chapter.
FR24: Khusus pada Lesson bertipe Quiz, Admin dapat membuat formulir Pertanyaan serta kunci Jawaban Mutlak.
FR25: Visitor dapat mengakses premium public landing page pada route `/` yang mengkomunikasikan value proposition dan identitas brand sejak first load.
FR26: Landing page navbar harus menampilkan text logo Seefluencer di kiri, Home/Courses/Pricing di tengah, dan nama profil user login di kanan ketika sesi tersedia.
FR27: Visitor dapat bernavigasi dari landing page menuju Courses dan Pricing melalui CTA yang jelas dan section links.
FR28: Landing page harus menghadirkan section marketing terstruktur yang mendukung discovery dan conversion seperti hero messaging, featured benefits, social proof/trust indicators, dan course/value highlights.
FR29: Landing page boleh menyertakan smooth scrolling, parallax, progress-reveal interactions, atau lightweight 3D enhancements selama target accessibility, responsiveness, dan performa halaman publik tetap terjaga.

### NonFunctional Requirements

NFR-P1: Waktu muat awal halaman (Initial Page Load) pada perangkat koneksi normal 4G berada di bawah 2.5 Detik untuk halaman rute publik.
NFR-P2: Transisi antar konten Lesson terasa "Instan" (Zero-flicker routing) menggunakan App Router Next.js 15.
NFR-P3: Permukaan media iframe Youtube dikonfigurasi dengan lazy load properties agar tidak memblokir render antarmuka.
NFR-S1: Seluruh kata sandi pengguna dienkripsi menggunakan bcrypt (atau setaranya) sebelum disimpan ke database.
NFR-S2: Keamanan area internal dashboard dan Client Side Fetching dibentengi oleh NextAuth Middleware Checks & validasi Server Actions.
NFR-S3: Environment variables sakral (NEXTAUTH_SECRET, DATABASE_URL, Midtrans API Keys) tidak boleh bocor via next_public atau serialisasi JSON di browser.
NFR-U1: Layout diselaraskan dan responsif mendeteksi variansi lebar viewport gawai (Mobile hingga Widescreen).
NFR-U2: Komponen halaman menampilkan Skeleton Loaders alih-alih blank screen pada jeda waktu data fetch.
NFR-U3: Setidaknya 90% proses mutasi data pengguna menghasilkan umpan balik visual berupa Toast Notification.
NFR-U4: Komponen menyokong Dark Mode Theme via next-themes.
NFR-M1: TypeScript strict mode digunakan penuh; toleransi nol terhadap penggunaan tipe 'any'.
NFR-M2: Struktur tabel Database (DDL) wajib dikelola via migrasi inkremental Drizzle PostgreSQL.

### Additional Requirements

**From Architecture:**

- **Starter Template:** Gunakan `create-t3-app` sebagai starter utama: `npx create-t3-app@latest hiring-seefluencer --nextAuth --tailwind --drizzle --dbProvider postgres`
- Setup Drizzle Schema penuh (9 tabel: users, courses, chapters, lessons, user_progress, quizzes, quiz_attempts, plans, subscriptions) dengan Cascade Delete.
- Semua Server Actions wajib memiliki return type konsisten: `{ success: true, data: T }` atau `{ success: false, error: string }`.
- Validasi Zod dua lapisan: Client (`react-hook-form` + `@hookform/resolvers/zod`) dan Server (di dalam Server Action).
- Satu-satunya HTTP route handler yang diizinkan tanpa auth adalah `/api/webhooks/midtrans` (untuk Midtrans Webhook POST callback).
- ISR (Incremental Static Regeneration) atau `unstable_cache` diterapkan pada rute `/courses` untuk optimasi performa.
- URL Search Params digunakan sebagai state management untuk Lesson View (bukan React Context).
- Middleware Edge (`src/middleware.ts`) melindungi semua rute `/admin/*` dan memverifikasi role.

**From UX Design:**

- Responsive design: Mobile-first untuk student (< 768px sidebar collapse ke Bottom Sheet), Desktop-first untuk admin.
- Aksesibilitas WCAG AA: Color contrast ratio 4.5:1, visible focus rings, touch target minimum 44x44px.
- Skeleton loaders wajib menggantikan semua spinner konvensional di loading states.
- Dark Mode Global toggle via `next-themes` — persistent, zero flash.
- "Mark as Complete" flow: 1 klik → checkmark animation → sidebar progress update → animated glow progress bar → toast → 3s countdown auto-navigate.
- Paywall diimplementasikan sebagai blur overlay + CTA (bukan hard redirect/full modal).
- Empty states (halaman tanpa data) wajib menampilkan ilustrasi + CTA button.
- Form validation menggunakan on-blur strategy, error message ditampilkan per-field dengan highlight merah.
- Admin CMS menggunakan auto-save inline (bukan manual Save button untuk konten teks/draft).
- Custom components yang perlu dibangun: `CourseSidebarNav`, `VideoPlayerWrapper`, `PaywallTeaserOverlay`, `QuizEngine`.

**Coverage note:** Foundation epics define core capability delivery. Later polish/alignment epics may intentionally refine the UX of already-delivered FRs without changing their product intent.

### FR Coverage Map

FR01: Epic 1 — User registers a new account (email + hashed password)
FR02: Epic 1 — User logs in via NextAuth session management
FR03: Epic 1 — User logs out and session cookie is revoked
FR04: Epic 1 — User views and updates their profile name
FR05: Epic 1 — System differentiates role-based route access (admin vs student)
FR06: Epic 2 — Student views published course catalog listing
FR07: Epic 2 — Student searches courses via text input (ILIKE query)
FR08: Epic 2 — Student views course detail page with syllabus (Chapter > Lesson)
FR09: Epic 3 — Student opens lesson view (video iframe + text content)
FR10: Epic 3 — Student marks lesson as completed (1-click action)
FR11: Epic 3 — Student sees numerical progress percentage
FR12: Epic 3 — Student navigates between lessons seamlessly
FR09 (UX polish alignment): Epic 8 — Learning zone lesson viewer polish for focused study experience
FR10 (interaction polish alignment): Epic 8 — Mark-as-complete feedback remains rewarding inside lesson viewer
FR11 (visual hierarchy alignment): Epic 8 — Progress representation remains clear and immediate inside lesson viewer
FR12 (navigation ergonomics alignment): Epic 8 — Lesson-to-lesson navigation remains focused and low-friction inside learning zone
FR13: Epic 3 — Student takes quiz (select A/B/C/D per question)
FR14: Epic 3 — System calculates quiz score and determines Pass (≥70%) or Fail
FR15: Epic 4 — System intercepts premium lesson with paywall overlay
FR16: Epic 4 — Visitor or authenticated user views public pricing/subscription page
FR17: Epic 4 — User processes payment via Midtrans Sandbox
FR18: Epic 4 — Webhook updates subscription to 'active' with calculated endDate
FR19: Epic 5 — Admin accesses back-office CMS dashboard
FR20: Epic 5 — Admin views analytics: total users, courses, active subscribers
FR21: Epic 5 — Admin manages courses: create, edit, delete, publish/draft
FR22: Epic 5 — Admin manages chapters: create, order within a course
FR23: Epic 5 — Admin manages lessons: create with type (video/text/quiz) in a chapter
FR24: Epic 5 — Admin creates quiz questions and correct answer keys for quiz lessons
FR25: Epic 6 — Visitor accesses premium public landing page at route `/`
FR26: Epic 6 — Landing navbar presents Seefluencer logo, Home/Courses/Pricing, and signed-in profile state
FR27: Epic 6 — Landing page routes users to Courses and Pricing through clear CTA pathways
FR28: Epic 6 — Landing page presents structured marketing sections supporting discovery and conversion
FR29: Epic 6 — Landing page supports smooth motion enhancements without violating accessibility or performance goals

## Epic List

### Epic 1: User Authentication & Identity

Users can create accounts, authenticate securely, manage their profiles, and be recognized with the correct role (student/admin) throughout the platform. This is the identity foundation upon which all personalised features depend.
**FRs covered:** FR01, FR02, FR03, FR04, FR05

### Epic 2: Course Catalog & Discovery

Students can browse, search, and explore the full published course library. They can view detailed course information including chapter/lesson hierarchy before deciding to start learning or subscribe.
**FRs covered:** FR06, FR07, FR08

### Epic 3: Learning Experience & Progress Tracking

Students can fully engage with course content — watching videos, reading lessons, marking completions, tracking progress visually, and taking quizzes with instant scored feedback. This is the core learning loop of the platform.
**FRs covered:** FR09, FR10, FR11, FR12, FR13, FR14

### Epic 4: Subscription & Access Control (Paywall)

Students encounter an elegant paywall when accessing premium lessons, can view pricing options, complete a real Midtrans Sandbox payment flow, and receive immediate premium access after successful payment via webhook confirmation.
**FRs covered:** FR15, FR16, FR17, FR18

### Epic 5: Admin Content Management (Back-Office CMS)

Admin users access a dedicated back-office dashboard with system analytics and full CRUD management of the content hierarchy: Courses → Chapters → Lessons → Quiz Questions. They can publish or draft courses to control public visibility.
**FRs covered:** FR19, FR20, FR21, FR22, FR23, FR24

### Epic 6: Public Landing Experience & Conversion

Visitors and signed-in users can access a premium public landing page at route `/` that establishes strong first-impression trust, communicates the Seefluencer value proposition, and smoothly guides users toward Courses and Pricing through a polished, conversion-focused experience.
**FRs covered:** FR25, FR26, FR27, FR28, FR29

### Epic 7: Public Zone Visual Alignment

Visitors and signed-in users can experience a cohesive premium public surface across `/courses`, `/courses/[slug]`, and `/pricing`, fully aligned with the approved Hybrid Duality direction that is already established on the landing page `/`.
**FRs covered:** FR06, FR08, FR16

### Epic 8: Learning Zone UX Polish

Students can experience a more refined lesson viewer on `/courses/[slug]/lessons/[lessonId]` that remains unmistakably part of the learning/app zone: focused, low-distraction, and ergonomically tuned to the approved UX specification rather than styled as a public marketing surface.
**FRs covered:** FR09, FR10, FR11, FR12

## Epic 1: User Authentication & Identity

Users can create accounts, authenticate securely, manage their profiles, and be recognized with the correct role (student/admin) throughout the platform. This is the identity foundation upon which all personalised features depend.

### Story 1.1: Project Setup & Starter Template Initialization

As a developer,
I want to bootstrap the application using out `create-t3-app` template,
So that the foundational structure (Next.js, Drizzle, NextAuth, Tailwind) is ready for features.

**Acceptance Criteria:**

**Given** the project repository is empty
**When** the developer runs the T3 init command
**Then** the initial codebase is generated and runs locally without errors (Architecture constraint)
**And** the initial database connection is established

### Story 1.2: User Registration

As a new visitor,
I want to register an account with my email and password,
So that I can access the learning platform.

**Acceptance Criteria:**

**Given** I am on the register page and submit a valid email and password
**When** the form is submitted
**Then** my account is created with a hashed password in the database (FR01, NFR-S1)
**And** I am automatically logged in or redirected to the login page

### Story 1.3: User Login & Session Management

As a registered user,
I want to log in securely,
So that the system remembers my identity across pages.

**Acceptance Criteria:**

**Given** I have an active account
**When** I submit correct credentials on the login page
**Then** NextAuth creates a secure session (FR02)
**And** Middleware distinguishes and enforces my role as 'student' or 'admin' for protected routes (FR05, NFR-S2)

### Story 1.4: User Logout

As an authenticated user,
I want to log out,
So that my session is securely terminated on shared devices.

**Acceptance Criteria:**

**Given** I am logged into the platform
**When** I click the logout button
**Then** my NextAuth session cookie is revoked (FR03)
**And** I am safely redirected to the public area/landing page

### Story 1.5: Profile Management

As an authenticated user,
I want to view and edit my profile name,
So that my identity is personalized.

**Acceptance Criteria:**

**Given** I am logged in and navigate to the profile settings
**When** I update my name and save
**Then** the changes are persisted to the database via Server Actions (FR04)
**And** the UI immediately reflects my new name with a Toast Notification for feedback (NFR-U3)

## Epic 2: Course Catalog & Discovery

Students can browse, search, and explore the full published course library. They can view detailed course information including chapter/lesson hierarchy before deciding to start learning or subscribe.

### Story 2.1: Course Listing Validation

As a student or visitor,
I want to view a catalog of courses,
So that I can browse available learning materials.

**Acceptance Criteria:**

**Given** I navigate to the courses page
**When** the page loads
**Then** I only see courses that have a 'published' status (FR06)
**And** the page utilizes ISR/Caching for fast load times (NFR-P1)

### Story 2.2: Course Search & Discovery

As a student,
I want to search for courses by title,
So that I can quickly find topics I am interested in.

**Acceptance Criteria:**

**Given** I am on the course catalog
**When** I type a query into the search bar
**Then** the catalog filters courses whose titles match the text input based on ILIKE query (FR07)

### Story 2.3: Course Detail & Syllabus View

As a student,
I want to view the full details and syllabus of a specific course,
So that I know exactly what I will be learning before starting or buying it.

**Acceptance Criteria:**

**Given** I select a course from the catalog
**When** I land on the course detail page
**Then** I see the general course info
**And** a chronological list of its Chapters and Lessons (FR08)

## Epic 3: Learning Experience & Progress Tracking

Students can fully engage with course content — watching videos, reading lessons, marking completions, tracking progress visually, and taking quizzes with instant scored feedback. This is the core learning loop of the platform.

### Story 3.1: Multimedia Lesson Viewer

As a student,
I want to view the content of a lesson (Video iframe or Text),
So that I can study the material.

**Acceptance Criteria:**

**Given** I click on a video lesson
**When** the learning platform loads
**Then** the YouTube iframe is rendered with lazy loading (NFR-P3)
**And** text content is clearly readable in the main view (FR09)

### Story 3.2: Course Sidebar & Auto-Navigation

As a student,
I want to easily navigate between lessons using a sidebar and auto-navigation,
So that my learning flow remains uninterrupted.

**Acceptance Criteria:**

**Given** I am in the learning view
**When** I finish a lesson
**Then** the system provides an auto-navigation countdown to the next lesson
**And** I can always explicitly click other lessons via the Course Sidebar (FR12)

### Story 3.3: Progress Tracking (Mark as Complete)

As a student,
I want to mark a lesson as completed manually,
So that my overall course progress percentage updates immediately.

**Acceptance Criteria:**

**Given** I finish watching/reading a lesson
**When** I click 'Mark as Complete'
**Then** the database is updated with my completion record (FR10)
**And** my progress bar percentage increases with a visual glow animation instantly via optimistic UI (FR11, NFR-U3)

### Story 3.4: Interactive Quiz Execution

As a student,
I want to take a multiple-choice quiz securely,
So that I can test my knowledge on the current chapter.

**Acceptance Criteria:**

**Given** I land on a Quiz-type lesson
**When** I interact with the QuizEngine component
**Then** I can select exactly one option (A/B/C/D) for each question before hitting submit (FR13)

### Story 3.5: Instant Quiz Grading

As a student,
I want to see my quiz score immediately after submission,
So that I know if I passed the material or need to retake it.

**Acceptance Criteria:**

**Given** I submit my quiz answers
**When** the server action calculates the points (FR14)
**Then** I immediately see a "Passed" state (if ≥ 70%) or "Failed" state
**And** it is visualized via an animated result ring-chart on the UI

## Epic 4: Subscription & Access Control (Paywall)

Students encounter an elegant paywall when accessing premium lessons, can view pricing options, complete a real Midtrans Sandbox payment flow, and receive immediate premium access after successful payment via webhook confirmation.

### Story 4.1: Premium Paywall Teaser

As a free student,
I want to see a clear teaser when trying to access a premium lesson,
So that I understand I need a subscription to proceed without getting a hard error.

**Acceptance Criteria:**

**Given** I do not have an active subscription
**When** I click on a premium lesson (`isFree: false`)
**Then** the video player is hidden behind a blur overlay (`PaywallTeaserOverlay`)
**And** I see a clear Call-To-Action to subscribe (FR15)

### Story 4.2: Pricing & Subscription Selection

As a visitor or authenticated user,
I want to view available subscription plans on a public pricing page,
So that I can evaluate the cost and benefits before deciding to purchase.

**Acceptance Criteria:**

**Given** I want to subscribe
**When** I visit the pricing page or click a paywall CTA
**Then** I see the available plan details without being redirected away for lack of authentication
**And** I can select a plan to purchase (FR16)

### Story 4.3: Midtrans Checkout Integration

As a student,
I want to complete my payment securely,
So that I can activate my premium access.

**Acceptance Criteria:**

**Given** I select a subscription plan
**When** I click 'Checkout'
**Then** the Midtrans Snap JS Popup (`snap.js`) opens directly in the browser
**And** I can simulate a Sandbox payment securely without leaving the page (FR17)

### Story 4.4: Webhook Settlement Processing

As the system,
I need to process payment notifications automatically,
So that student subscriptions are activated without manual intervention.

**Acceptance Criteria:**

**Given** a user completes a Midtrans payment
**When** the `/api/webhooks/midtrans` endpoint receives a valid POST notification
**Then** the system verifies the signature key (NFR-S3)
**And** the corresponding subscription record in the database is automatically updated to `status: 'active'` with an accurately calculated `endDate` (FR18)

## Epic 5: Admin Content Management (Back-Office CMS)

Admin users access a dedicated back-office dashboard with system analytics and full CRUD management of the content hierarchy: Courses → Chapters → Lessons → Quiz Questions. They can publish or draft courses to control public visibility.

### Story 5.1: Admin Dashboard & Analytics

As an admin,
I want to access a secure back-office dashboard,
So that I can view high-level platform statistics.

**Acceptance Criteria:**

**Given** I log in with an 'admin' role
**When** I navigate to `/admin`
**Then** I can see the total number of Users, Courses, and active Subscriptions (FR19, FR20)

### Story 5.2: Course Management (CRUD)

As an admin,
I want to create, edit, and manage Courses,
So that I can control what is available on the platform.

**Acceptance Criteria:**

**Given** I am in the admin panel
**When** I fill out the Course form (Title, Description, Thumbnail URL, `isFree` status)
**Then** the changes are auto-saved via Server Actions
**And** I can toggle its status between 'Draft' and 'Published' (FR21)

### Story 5.3: Chapter Management

As an admin,
I want to create and order Chapters within a specific Course,
So that I can structure the learning material logically.

**Acceptance Criteria:**

**Given** I am editing a Course
**When** I add a new Chapter or rearrange existing ones
**Then** the changes are instantly saved to the database to reflect the correct sequence (FR22)

### Story 5.4: Lesson Content Management

As an admin,
I want to add Lessons to Chapters,
So that I can attach actual learning content like videos or text.

**Acceptance Criteria:**

**Given** I am editing a Chapter
**When** I create a Lesson
**Then** I can specify its Type (Video/Text/Quiz) and provide the respective content or YouTube URL (FR23)

### Story 5.5: Quiz Builder

As an admin,
I want to create Questions and Answers for Quiz-type lessons,
So that students can test their knowledge.

**Acceptance Criteria:**

**Given** I am editing a Quiz-type Lesson
**When** I add a question
**Then** I can specify 4 options (A-D)
**And** mark exactly one as the correct answer and assign it point values (FR24)

## Epic 6: Public Landing Experience & Conversion

Visitors and signed-in users can access a premium public landing page at route `/` that establishes strong first-impression trust, communicates the Seefluencer value proposition, and smoothly guides users toward Courses and Pricing through a polished, conversion-focused experience.

### Story 6.1: Public Landing Page Shell & Navbar

As a visitor or signed-in user,
I want to land on a polished homepage with a clear navigation bar,
So that I immediately understand the product and can navigate to key areas confidently.

**Acceptance Criteria:**

**Given** I open route `/`
**When** the landing page renders
**Then** I see a premium public layout aligned with the approved Hybrid Duality design direction
**And** the navbar shows the **Seefluencer** text logo on the left
**And** the center navigation includes **Home**, **Courses**, and **Pricing**
**And** the right side shows the signed-in user's profile name when a session exists, or the appropriate auth CTA when no user is signed in
**And** the navbar remains accessible across desktop and mobile breakpoints with minimum 44x44px touch targets (FR25, FR26, NFR-U1)

### Story 6.2: Hero Section & Primary Conversion CTA

As a first-time visitor,
I want to see an impressive hero section with a clear value proposition and CTA,
So that I quickly understand why Seefluencer is worth exploring.

**Acceptance Criteria:**

**Given** I load the landing page
**When** the hero section appears above the fold
**Then** I see bold editorial typography, expressive gradient treatment, and messaging aligned with the product's premium EdTech identity
**And** there is a clear primary CTA leading me toward **Courses** or sign-up flow
**And** the above-the-fold section loads quickly enough to support the public-page performance target (FR25, FR27, NFR-P1)

### Story 6.3: Marketing Sections for Discovery & Trust

As a visitor,
I want to scroll through clear sections that explain the platform value,
So that I gain trust before deciding to browse courses or pricing.

**Acceptance Criteria:**

**Given** I continue scrolling on the landing page
**When** I review the marketing content
**Then** I see structured sections such as value proposition, featured course/value highlights, trust indicators, and subscription motivation
**And** each section supports the product context as an EdTech learning platform rather than generic SaaS messaging
**And** CTA placements consistently guide me toward **Courses** and **Pricing**
**And** social proof or confidence-building display content may use dummy data during MVP implementation if production data is not yet available (FR27, FR28)

### Story 6.4: Smooth Navigation & Motion Polish

As a visitor,
I want the landing page to feel modern and smooth,
So that the browsing experience feels memorable without becoming distracting.

**Acceptance Criteria:**

**Given** I interact with landing page sections and navigation links
**When** transitions or motion effects occur
**Then** smooth scrolling, parallax, progress-reveal animation, or equivalent motion enhancements may be used to improve delight
**And** motion remains subtle, accessible, and responsive across device sizes
**And** the experience avoids blocking content rendering or harming usability (NFR-P1, WCAG AA alignment)
**And** any advanced effect such as lightweight 3D enhancement or three.js-powered ornament is treated as progressive enhancement rather than a mandatory dependency for core page usability (FR29)

### Story 6.5: Landing Page Responsive & Accessible Experience

As a mobile or desktop visitor,
I want the landing page to remain readable and easy to use on any device,
So that I can understand the product without friction.

**Acceptance Criteria:**

**Given** I access the landing page from mobile, tablet, or desktop
**When** the layout adapts to my viewport
**Then** typography, spacing, CTA hierarchy, and section stacking remain clear and usable
**And** all interactive elements preserve visible focus rings, adequate contrast, and accessible touch targets
**And** any decorative or animated elements do not interfere with reading flow or keyboard navigation (FR25, FR29, NFR-U1)

## Epic 7: Public Zone Visual Alignment

Visitors and signed-in users can experience a cohesive premium public surface across `/courses`, `/courses/[slug]`, and `/pricing`, fully aligned with the approved Hybrid Duality direction that is already established on the landing page `/`.

### Story 7.1: /courses Public Catalog Premium Surface

As a visitor or student,
I want the course catalog to feel like a premium public surface consistent with the landing page,
So that my first impression of the course library matches the brand quality I experienced on the homepage.

**Acceptance Criteria:**

**Given** I navigate to `/courses`
**When** the page renders
**Then** the page header uses expressive display typography consistent with the public zone (Playfair Display or Fraunces for display headings)
**And** the visual hierarchy, spacing, and section structure reflect the approved Hybrid Duality public surface treatment
**And** course cards use the design-system card tokens for dark public surfaces, including dark card background, 1px border, and structured radius
**And** the empty state shows an illustration with a CTA button rather than a blank screen
**And** the search bar shows correct focus and active treatment using Indigo/Violet accents

### Story 7.2: /courses/[slug] Persuasive Course Landing Page

As a visitor or student viewing a specific course,
I want the course detail page to function as a persuasive course landing page,
So that I am motivated to start, enroll, or subscribe rather than only reading the syllabus.

**Acceptance Criteria:**

**Given** I navigate to `/courses/[slug]`
**When** the page loads
**Then** a primary CTA is visible above the fold before the syllabus section
**And** the hero section uses a public-zone gradient accent treatment aligned with the approved Coral → Purple → Teal direction
**And** course metadata is presented in a visually prominent and scannable way
**And** the chapter and lesson syllabus is rendered as a structured, scannable component
**And** premium lessons show a lock indicator that communicates restricted access without hard-blocking the page
**And** a trust or learning-outcomes section reinforces value below the syllabus
**And** a repeated CTA is visible lower on the page for users who scroll through the full content

### Story 7.3: /pricing Public Marketing Surface Redesign

As a visitor or authenticated user,
I want to access the pricing page without being forced to log in first,
So that I can evaluate subscription plans and make a purchase decision independently of my auth state.

**Acceptance Criteria:**

**Given** I am an unauthenticated visitor navigating to `/pricing`
**When** the page renders
**Then** I see the full pricing page content without being redirected to `/login`
**And** the plan cards present price, duration, benefits, and CTA clearly within a premium public-surface layout
**And** the page uses approved public-zone typography, color accents, and premium dark-surface tokens
**And** a trust or value reinforcement section is included to support conversion

**Given** I am unauthenticated and click a subscribe CTA
**When** checkout initiation requires an account
**Then** I am directed to the auth flow with clear context that login is required only to complete checkout

**Given** I am authenticated and click a subscribe CTA
**When** I continue with purchase intent
**Then** the Midtrans checkout flow opens without regression to the existing payment implementation

### Story 7.4: Shared Public Zone Layout Consistency

As a developer,
I want a consistent shared layout wrapper for all public marketing pages,
So that `/`, `/courses`, `/courses/[slug]`, and `/pricing` share the same navbar, base tokens, and layout conventions without duplication.

**Acceptance Criteria:**

**Given** the public-facing routes are reviewed together
**When** shared layout patterns are applied
**Then** the public navbar is rendered consistently across all public routes via shared composition
**And** the dark background and dark card tokens are applied centrally rather than being duplicated per page
**And** signed-in and signed-out navbar states remain consistent across all public routes
**And** no functional regression is introduced in existing Epic 1–6 capabilities

### Story 7.5: Login & Register Public Zone Alignment

As a prospective or returning learner,
I want `/login` and `/register` to feel visually consistent with the public discovery and conversion surfaces,
So that authentication feels like a seamless continuation of the public experience rather than a disconnected legacy screen.

**Acceptance Criteria:**

**Given** I navigate to `/login` or `/register`
**When** the page renders
**Then** the route uses the shared public-zone shell and navbar conventions established in Epic 7
**And** the route does not show the non-public/global application header used outside the public zone

**Given** the auth entry pages are reviewed against the rest of the public zone
**When** visual treatment is compared across desktop and mobile breakpoints
**Then** typography, spacing, surface treatment, and dark/light behavior align with the established public-zone design language
**And** the responsive hierarchy remains clear for form content, supporting copy, and navigation actions on both desktop and mobile

**Given** existing login and registration flows already work functionally
**When** Story 7.5 is implemented
**Then** validation, submission, redirect behavior, toast behavior, server actions, and callbackUrl/session behavior remain unchanged

**Given** the story scope is prepared for implementation
**When** the planning handoff is reviewed
**Then** the story is explicitly limited to shared shell/navbar alignment and public-zone visual consistency for `/login` and `/register`
**And** auth logic, validation rules, redirects, server actions, and session logic are out of scope

## Epic 8: Learning Zone UX Polish

Students can experience a more refined lesson viewer on `/courses/[slug]/lessons/[lessonId]` that remains unmistakably part of the learning/app zone: focused, low-distraction, and ergonomically tuned to the approved UX specification rather than styled as a public marketing surface.

### Story 8.1: Lesson Viewer Visual & Interaction Polish

As a student,
I want the lesson viewer to feel polished, calm, and clearly structured,
So that I can stay focused on learning content while still receiving strong progress and navigation cues.

**Acceptance Criteria:**

**Given** I navigate to `/courses/[slug]/lessons/[lessonId]`
**When** the lesson viewer renders on desktop or mobile
**Then** the page uses learning-zone visual treatment based on the approved Hybrid Duality direction, with Inter-led app typography, structured 1px bordered surfaces, indigo/violet active states, and without adopting landing/public gradient hero presentation

**Given** I am consuming a video or text lesson
**When** I scan the page hierarchy
**Then** breadcrumb, lesson title, lesson metadata, main content area, sidebar navigation, and progress area appear in a clear order that supports “Zero Confusion Navigation” and keeps primary learning content visually dominant

**Given** I am on a long lesson or narrow viewport
**When** I need to continue or complete the lesson
**Then** the primary completion/navigation actions remain easy to reach through sticky or persistently accessible placement consistent with the UX specification, while maintaining minimum 44x44px touch targets and visible focus states

**Given** lesson data is loading or route transitions occur between lessons
**When** the UI has not finished rendering final content
**Then** skeleton loaders are shown for the lesson viewer layout instead of generic spinners or blank states, preserving the perception of instant navigation

**Given** I click `Mark as Complete` inside the polished lesson viewer
**When** the action succeeds
**Then** the existing completion interaction remains intact and visually coordinated with the refined layout: checkmark feedback, sidebar/progress update, animated progress emphasis, toast confirmation, and optional countdown auto-navigation continue to work without regression

**Given** the lesson viewer is reviewed against architecture constraints
**When** the story is implemented
**Then** it preserves the existing learning-route architecture and entitlement model, keeps the lesson experience inside the app/learning zone, and introduces no dependency on public-zone-only decorative treatments
