# Sprint Change Proposal — Public Landing Experience & Conversion

**Project:** hiring-seefluencer  
**Date:** 2026-03-10  
**Workflow:** Correct Course  
**Change Scope (Proposed):** Moderate

## 1. Issue Summary

### Problem Statement
Planning artifacts saat ini belum memuat epic dan story eksplisit untuk Landing Page route `/`, padahal PRD dan UX Design sudah menempatkan landing page sebagai marketing surface utama untuk first impression, discovery, dan conversion ke area Courses maupun Pricing.

### Discovery Context
Gap ini ditemukan saat meninjau keterlacakan antar artefak berikut:

- `prd.md`
- `ux-design-specification.md`
- `ux-design-directions.html`
- `epics.md`

### Evidence
1. PRD menyebut user journey dibuka dengan landing page visual clean dan wow factor pada first load.
2. UX Design menetapkan prinsip **"App is a Tool, Landing is a Stage"** dan menempatkan landing sebagai creative agency surface.
3. UX Design juga secara eksplisit mendukung gradient hero, micro-animation, smooth interactions, dan emotional first impression.
4. `epics.md` saat ini hanya mencakup Auth, Catalog, Learning, Subscription, dan Admin CMS—tanpa epic/story khusus untuk landing page `/`.
5. Stakeholder clarification menetapkan kebutuhan navbar publik yang spesifik:
   - kiri: `Seefluencer` text logo
   - tengah: `Home`, `Courses`, `Pricing`
   - kanan: profile name user yang login
6. Stakeholder juga mengizinkan social proof dan data showcase menggunakan dummy data bila diperlukan.

## 2. Impact Analysis

### Epic Impact
- **Epic 1–5:** tetap valid, tidak perlu dihapus atau dirombak.
- **Gap identified:** dibutuhkan epic tambahan yang menangani public landing experience.
- **Recommended addition:** tambah **Epic 6: Public Landing Experience & Conversion**.

### Story Impact
- Story yang sudah ada tidak perlu diubah atau dihapus.
- Dibutuhkan story baru untuk:
  1. landing shell + public navbar
  2. hero + CTA conversion
  3. marketing sections + trust/social proof
  4. motion polish / progressive enhancement
  5. responsive + accessibility integrity

### Artifact Conflicts

#### PRD
- Tidak ada konflik destruktif.
- Perlu tambahan requirement eksplisit untuk landing page `/`.

#### Architecture
- Tidak ada konflik besar.
- Perlu penegasan bahwa `/` adalah public marketing route.
- Perlu guardrail bahwa motion/3D adalah progressive enhancement.

#### UX Design
- Secara arah sudah mendukung penuh.
- Hanya perlu elaborasi operasional: IA section order, public navbar detail, dan motion guardrails.

#### Sprint / Backlog Tracking
- `sprint-status.yaml` perlu ditambah entri **epic-6** dan story-story baru jika proposal ini disetujui.

### Technical Impact
- Dampak teknis bersifat terukur dan additive.
- Akan muncul kebutuhan komponen shared baru untuk landing page.
- Efek seperti parallax, progress reveal, atau lightweight 3D harus dibangun sebagai enhancement opsional.
- Core landing experience tidak boleh tergantung pada layer animasi berat.

## 3. Recommended Approach

### Chosen Path
**Hybrid approach**

- **Primary:** Direct Adjustment
- **Secondary:** PRD clarification
- **Avoided:** Rollback

### Why This Path
1. Tidak ada kebutuhan rollback karena dokumen existing tetap valid.
2. Change ini adalah **coverage gap**, bukan perubahan arah produk total.
3. Menambahkan artefak baru secara additive menjaga stabilitas dokumentasi yang sudah berjalan.
4. Landing page memiliki business value tinggi karena menjadi first impression reviewer-facing.

### Effort Estimate
- **Medium**

### Risk Assessment
- **Low to Medium**
- Risk meningkat jika efek motion-heavy atau 3D dijadikan mandatory core.
- Risk dapat dikendalikan dengan menjadikannya progressive enhancement.

### Timeline Impact
- Minimal sampai moderat.
- Tidak menambah rework besar selama scope landing dibagi jelas antara core experience dan optional polish.

## 4. Detailed Change Proposals

### 4.1 PRD Modification

**Artifact:** `prd.md`  
**Section:** Functional Requirements

**OLD:**
- PRD belum memiliki FR eksplisit untuk public landing page `/`, public navbar behavior, CTA routing ke Courses/Pricing, dan motion guardrails.

**NEW:**
- Tambahkan subsection baru untuk public landing experience dengan requirement baru di bagian belakang agar tidak mengganggu numbering lama:
  - `FR25`: Visitors can access a premium public landing page at route `/` that communicates the platform value proposition and brand identity on first load.
  - `FR26`: The landing page navbar must display the Seefluencer text logo on the left, Home/Courses/Pricing navigation in the center, and the authenticated user profile name on the right when a user is signed in.
  - `FR27`: Visitors can navigate from the landing page to Courses and Pricing through clear CTA placements and section links.
  - `FR28`: The landing page must present structured marketing sections that support discovery and conversion, such as hero messaging, featured benefits, social proof or trust indicators, and course/value highlights.
  - `FR29`: The landing page may include smooth scrolling, parallax, progress-reveal interactions, or lightweight 3D enhancements as long as accessibility, responsiveness, and public-page performance targets are maintained.

**Rationale:**
- Menutup gap traceability dari PRD ke UX dan epics tanpa mengacak struktur lama.

---

### 4.2 Epic Addition

**Artifact:** `epics.md`  
**Section:** Epic List + FR Coverage Map + Epic Detail

**OLD:**
- Epic list berhenti di Epic 5 dan belum mencakup landing page `/`.

**NEW:**
- Tambahkan **Epic 6: Public Landing Experience & Conversion**

**Epic text:**
> Visitors and signed-in users can access a premium public landing page at route `/` that establishes strong first-impression trust, communicates the Seefluencer value proposition, and smoothly guides users toward Courses and Pricing through a polished, conversion-focused experience.

**FRs covered:** `FR25, FR26, FR27, FR28, FR29`

**Coverage map additions:**
- `FR25: Epic 6 — Visitor accesses premium public landing page at route /`
- `FR26: Epic 6 — Landing navbar presents Seefluencer logo, Home/Courses/Pricing, and signed-in profile state`
- `FR27: Epic 6 — Landing page routes users to Courses and Pricing`
- `FR28: Epic 6 — Landing page presents structured marketing sections supporting discovery and conversion`
- `FR29: Epic 6 — Landing page supports smooth motion enhancements without violating accessibility/performance goals`

**Rationale:**
- Menambahkan coverage formal tanpa renumbering epic atau FR yang sudah berjalan.

---

### 4.3 New Stories Under Epic 6

**Artifact:** `epics.md`  
**Section:** Epic 6 stories

#### Story 6.1: Public Landing Page Shell & Navbar
**NEW:**
- Landing page `/` menghadirkan shell premium dan navbar publik dengan:
  - kiri: `Seefluencer`
  - tengah: `Home`, `Courses`, `Pricing`
  - kanan: profile name user yang login atau auth CTA bila belum login

#### Story 6.2: Hero Section & Primary Conversion CTA
**NEW:**
- Hero di atas fold dengan editorial typography, gradient premium, dan CTA utama menuju Courses / sign-up path.

#### Story 6.3: Marketing Sections for Discovery & Trust
**NEW:**
- Landing page memuat value proposition, highlights, trust indicators, social proof, dan CTA ke Courses/Pricing.
- Social proof atau data yang belum tersedia boleh memakai **dummy data** pada fase implementasi MVP selama jelas sebagai display content.

#### Story 6.4: Smooth Navigation & Motion Polish
**NEW:**
- Smooth scroll, parallax, progress reveal, atau lightweight 3D boleh digunakan sebagai progressive enhancement.

#### Story 6.5: Landing Page Responsive & Accessible Experience
**NEW:**
- Landing tetap jelas, usable, dan accessible pada mobile, tablet, dan desktop.

**Rationale:**
- Memecah landing page menjadi unit kerja implementasi yang realistis dan tetap premium.

---

### 4.4 Architecture Clarification

**Artifact:** `architecture.md`

**OLD:**
- Public routes dan shared components sudah ada secara generik, tetapi route `/` belum didefinisikan secara eksplisit sebagai landing page marketing.

**NEW:**
- Tambahkan klarifikasi bahwa route `/` adalah public marketing landing page.
- Tambahkan contoh komponen shared:
  - `PublicNavbar`
  - `LandingHero`
  - `LandingSection`
  - `LandingCTA`
  - `LandingScrollProgress`
  - `LandingSocialProof`
- Tambahkan aturan progressive enhancement untuk motion/3D.
- Tegaskan reduced-motion friendliness, WCAG AA, dan performance baseline public pages.

**Rationale:**
- Memberi guardrail teknis agar eksplorasi visual tetap aman.

---

### 4.5 UX Design Elaboration

**Artifact:** `ux-design-specification.md`

**OLD:**
- UX sudah mendukung landing direction secara kuat, namun belum mengunci IA dan navbar behavior secara operasional.

**NEW:**
- Tambahkan IA operasional untuk route `/`:
  1. Public Navbar
  2. Hero Section
  3. Value Proposition / Benefits
  4. Featured Course / Learning Highlights
  5. Trust / Social Proof / Reviewer Confidence Layer
  6. Pricing Bridge CTA
  7. Footer / Final CTA
- Tegaskan behavior navbar publik dan signed-in state.
- Tegaskan motion guardrails dan accessibility guardrails.
- Izinkan social proof dan showcase memakai **dummy data** bila data produksi belum tersedia.

**Rationale:**
- Mengubah UX direction menjadi implementable IA tanpa mengubah arah desain.

## 5. Implementation Handoff

### Scope Classification
**Moderate**

Alasan:
- Perubahan tidak bersifat destruktif, tetapi memengaruhi beberapa planning artifacts dan backlog tracking.

### Handoff Recipients
1. **Product Owner / Scrum Master**
   - Menambahkan Epic 6 dan Story 6.1–6.5 ke backlog
   - Menyesuaikan sprint/status tracking
2. **Product Manager**
   - Menyetujui tambahan FR25–FR29 di PRD
3. **Solution Architect**
   - Menyetujui guardrail progressive enhancement untuk route `/`
4. **Development Team**
   - Mengimplementasikan landing page berdasarkan Epic 6 setelah backlog diupdate

### Responsibilities
- **PO/SM:** update epic/story records dan sprint-status
- **PM:** memastikan scope tetap additive dan tidak mengganggu MVP utama
- **Architect:** menjaga performance dan accessibility constraints
- **Dev:** membangun landing page premium dengan optional motion enhancement dan dummy social proof bila dibutuhkan

### Success Criteria
1. PRD memuat FR25–FR29 secara additive.
2. `epics.md` memuat Epic 6 dan Story 6.1–6.5.
3. `architecture.md` memuat klarifikasi route `/` dan guardrails progressive enhancement.
4. `ux-design-specification.md` memuat IA operasional landing page.
5. `sprint-status.yaml` memuat Epic 6 dan story-story baru dengan status backlog.

## 6. Recommended Next Steps

1. Approve Sprint Change Proposal.
2. Update planning artifacts secara additive.
3. Update `sprint-status.yaml` dengan Epic 6 backlog entries.
4. Route implementation planning ke Scrum Master / Product Owner.
5. Prioritaskan Epic 6 dalam backlog jika reviewer-facing wow factor dianggap penting untuk delivery.
