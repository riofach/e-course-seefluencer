---
stepsCompleted:
  [
    step-01-init,
    step-02-discovery,
    step-02b-vision,
    step-02c-executive-summary,
    step-04-journeys,
    step-05-domain,
    step-06-innovation,
    step-07-project-type,
    step-08-scoping,
    step-09-functional,
    step-10-nonfunctional,
    step-11-polish,
  ]
inputDocuments:
  - 'Full Stack Engineer Challenge.md'
  - 'HIRING_CHALLENGE_REFERENCE.md'
workflowType: 'prd'
briefCount: 0
researchCount: 0
projectDocsCount: 2
classification:
  projectType: saas_b2b
  domain: edtech
  complexity: medium
  projectContext: greenfield
---

# Product Requirements Document - hiring-seefluencer

**Author:** Rio / AI Assistant
**Date:** 2026-03-06
**Version:** 1.0 (Polished)
**Status:** Approved Draft

---

## 1. Executive Summary

Platform e-course ini adalah solusi MVP SaaS EdTech fungsional yang dibangun dalam waktu 7 hari untuk memenuhi tantangan rekrutmen Full Stack Engineer. Sistem ini menyediakan alur pembelajaran end-to-end yang membedakan hak akses antara pengguna gratis dan pelanggan berbayar (Premium). Platform dirancang untuk menghadirkan skalabilitas teknis yang solid di _backend_ (NextAuth, Drizzle ORM, PostgreSQL) sekaligus menyajikan interaksi _frontend_ yang sangat responsif.

Differentiator utama dari produk ini terletak pada **kombinasi UI/UX kelas premium dan arsitektur kode yang _clean_**. Meskipun ini adalah MVP dengan tenggat waktu ketat, produk ini tidak mengorbankan kualitas visual—menampilkan _dark mode_, transisi yang _smooth_, dan _loading states_ yang dipikirkan matang-matang untuk memberikan _wow effect_ instan bagi reviewer. Di balik visualnya, sistem ini ditenagai oleh _"clean code architecture"_ yang rapi untuk memastikan skalabilitas jangka panjang.

## 2. Success Criteria

### 2.1 User Success

- **Student:** Berhasil mendaftar dan login tanpa hambatan. Bisa menemukan _course_, memutar _lesson_ tanpa _error_, menyelesaikan _lesson_, dan mengerjakan kuis dengan _feedback_ instan (Lulus/Gagal passing score 70%). Mampu melakukan _checkout_ via Midtrans dengan pembaruan status akun secara instan.
- **Admin:** Bisa membuat _course_ utuh dari hulu ke hilir (_Course_ → _Chapter_ → _Lesson_ → _Quiz_) tanpa mengalami _error_ relasi data. Bisa melihat dasbor keseluruhan sistem.

### 2.2 Business Success (Hiring Challenge Perspective)

- **Penyelesaian Tepat Waktu:** Seluruh 7 fitur utama wajib MVP selesai dan berfungsi sempurna dalam batas waktu 7 hari.
- **Impresi "Wow Factor":** Menghasilkan UI/UX berkelas (_Clean_, responsif, animasi _smooth_, _Dark Mode_, _Skeleton Loading_) sejak pandangan pertama _reviewer_.
- **Kode Siap Review:** Struktur repositori yang merefleksikan senioritas (_README_ inklusif, arsitektur modular, _database schema_ normalisasi Drizzle).

### 2.3 Technical Success

- **TypeScript Accuracy:** 100% _strict mode_. Tidak ada penggunaan tipe `any`.
- **Database Integrity:** 9 tabel utama berhasil direpresentasikan dalam _schema_ Drizzle (lengkap dengan _Cascade Delete_). Migrasi berjalan mulus.
- **Authentication & Security:** NextAuth.js terimplementasi dengan perlindungan _Route_ berlapis (_Server Actions_ & _Middleware_).
- **Server Actions:** Digunakan penuh untuk mutasi data secara langsung disertai revalidasi _cache_.

## 3. Product Scope

### 3.1 MVP (Minimum Viable Product - Hari 1-5)

1.  **Authentication:** Register, Login, Logout, Edit Profile, Role Access (Student/Admin).
2.  **Course Management:** CRUD Course, Chapter, Lesson (Admin). Halaman Listing & Detail (Student).
3.  **Progress Tracking:** Mark complete, hitung persentase progres, auto-next lesson.
4.  **Quiz System:** Admin create quiz (pilihan ganda), User answer, Score grading (70% pass).
5.  **Subscription:** Pricing page, Midtrans Sandbox Checkout, penentuan Status Active/Expired.
6.  **Access Control:** Pembatas akses Premium vs Gratis.
7.  **Core UI/UX:** Routing dan layout Radix/shadcn standar.

### 3.2 Growth Features (Hari 6-7)

1.  **Search & Filtering:** Memudahkan _student_ mencari _course_ berbasis _query_ simpel.
2.  **Dark Mode:** implementasi estetika melalui dependensi `next-themes`.
3.  **Simple Admin Analytics:** Dasbor indikator metrik Admin (Total Users, Courses, Active Subscribers).
4.  **UI/UX Polish:** Memperhalus interaksi status _loading_, _toast validation_, dan responsivitas ekstrem.

### 3.3 Out of Scope (Vision)

_Fitur seperti Tracking progres durasi video, Sistem Rating/Review kursus, Unit Testing/E2E rumit, Notifikasi Email via Resend, dan Setup Docker ditiadakan untuk mitigasi waktu._

## 4. User Journeys

Dokumen ini memetakan seluruh interaksi fungsional utama melalui 3 skenario naratif.

### 4.1 The Ambitious Learner (Student - Happy Path)

- **Opening:** Andi menemukan situs via pencarian. Ia disambut _Landing Page_ visual _clean_ dengan _Dark Mode_.
- **Action:** Andi melakukan registrasi. Ia langsung disajikan daftar kombinasi _course_ (Gratis/Berbayar). Ia mulai menonton materi _course_ gratis (embed YouTube) lalu menekan tombol "Mark as Completed".
- **Climax:** Saat beralih ke _Lesson_ selanjutnya (materi _Premium_), muncul _prompt paywall_ berlangganan. Andi mengklik "Subscribe", diarahkan ke antarmuka _Midtrans Sandbox_, lalu menggesek _dummy credentials_ hingga pembayaran berhasil instan.
- **Resolution:** Sistem mengubah status Andi menjadi _Active_. Ia menyelesaikan kuis akhir dengan skor di atas _passing grade_, _Progress Bar_ bersinar di angka 100%.

### 4.2 The Content Creator (Admin - Ops Path)

- **Opening:** Budi _login_ dengan kredensial Admin-nya dan mendapat akses eksklusif ke _Admin Dashboard_ (`/admin`) yang berisi _overview_ aktivitas aplikasi (Analytics).
- **Action:** Budi menyusun _Course_ baru (Judul, Thumbnail URL, Deskripsi, `isFree: false`) lalu menyimpannya sebagai _Draft_.
- **Climax:** Ia menelusuri hierarki—membuat _Chapter_ baru, ditambah 3 _Lesson_ (2 video, 1 Kuis). Ia mendaftarkan 5 soal pilihan ganda lengkap dengan poin dan kunci jawaban.
- **Resolution:** Setelah semua konten rampung, Budi mempublikasikan kursus tersebut ke publik (`published`). Aplikasi secara reaktif meluruhkan _cache_ sehingga daftar terbaru langsung tayang bagi pengunjung situs.

### 4.3 The Hesitant User (Student - Edge Case & Error Handling)

- **Opening:** Di form registrasi, Citra lupa menyertakan karakter `@` pada email. _Client-side validation_ seketika mencegah eksekusi pengiriman dan memunculkan indikator teks merah.
- **Action:** Citra sukses _login_, namun iseng meretas jalan dengan memaksa navigasi parameter URL peramban secara langsung ke `/admin/dashboard`.
- **Climax:** Infrastruktur keamanan Next.js bereaksi seketika mencegat akses berkat verifikasi sesi Role (Bukan Admin) pada tingkatan _Server/Middleware_.
- **Resolution:** Citra ter-_redirect_ kembali dengan halus ke halaman `/courses` diiringi visibilitas _Toast Notification_ bertuliskan "Unauthorized Access", memastikan tidak ada celah tereksekusi.

## 5. Domain & Project-Type Requirements

### 5.1 Project-Type: SaaS Web App (EdTech)

- **RBAC (Role-Based Access Control):** Hanya memerlukan 1 _database_ logis (non-multitenant). Hak akses dipusatkan pada tabel `Users` via flag tipe `role` (`admin` / `student`).
- **Paywall / Permissions:** Izin untuk mengakses URL _Lesson Premium_ dievaluasi berdasarkan nilai properti kondisional (`Courses.isFree == false` dan `Subscriptions.status == 'active'`).
- **Third-Party Integrations:** Beban muatan operasional dipangkas menggunakan pihak ketiga (Youtube URL Iframes untuk penayangan media, dan _webhook listener_ Midtrans `snap.js` pasif untuk status setelmen instan).

## 6. Functional Requirements (FR)

Daftar di bawah ini mengikat _Capability Contract_ teknis berkat integrasi fungsional menyeluruh yang teruji dari tantangan _Full Stack Engineer Challenge_.

### 6.1 User Management & Authentication

- **FR01:** Pengguna dapat mendaftar (Register) akun menggunakan formulir standar email dan kata sandi yang dikodekan (_hashed_).
- **FR02:** Pengguna dapat masuk (Login) dengan email dan _password_ yang terautentikasi oleh tata kelola sistem sesi NextAuth.
- **FR03:** Pengguna dapat keluar (Logout) dari sesi aktif secara aman dengan mencabut _cache_ sesi _cookie_.
- **FR04:** Pengguna dapat melihat dan memperbarui properti dasar biodata pada Halaman Profil (Nama).
- **FR05:** Sistem secara implisit mendifferensiasi hak akses rute privat berdasarkan nilai variabel `role` (`admin` atau `student`).

### 6.2 Course Catalog & Discovery

- **FR06:** Pengguna dapat melihat galeri utama (_listing_) katalog _Course_ yang dirilis spesifik dalam wujud 'published'.
- **FR07:** Pengguna dapat mencari _course_ sesuai dengan frasa pengetikan input (_Search bar_ dengan pencarian berkuari ringan berbasis teks/ILIKE).
- **FR08:** Pengguna dapat mengklik sebuah kursus dan diarahkan ke Halaman Detail yang menerangkan cakupan informasi umum dan keseluruhan Daftar Silabus (_Chapter_ > _Lesson_).

### 6.3 Learning Experience (Student Core)

- **FR09:** Murid membuka navigasi khusus (_Learning Platform View_) berisi konten _Lesson_ aktif baik berbentuk teks redaksional maupun panel iframes Video.
- **FR10:** Murid dapat melakukan klik deklaratif/eksplisit ("Mark as Completed") di setiap penghujung materi _lesson_ untuk mengeksekusi rekam jejak penyelesaian lokalnya.
- **FR11:** Murid dijamin dapat melihat representasi presentase progres secara numerikal (Berdasarkan jumlah komparasi _lesson_ yang dikerjakan dibandingkan total spesifikasi).
- **FR12:** Sistem memfasilitasi antarmuka ergonomis untuk bernavigasi transisi satu _Lesson_ berlanjut ke bagian _Lesson_ selanjutnya di satu rute terisolasi.
- **FR13:** Murid dapat mengerjakan kumpulan soal tes pada _Lesson_ bertipe 'Quiz', memilih argumen A/B/C/D di semua indeks opsi sebelum _submit_.
- **FR14:** Sistem mengeksekusi utilitas kalkulasi poin di belakang layar, melahirkan skor bulat akhir dan stempel status absolut (_Passed_ jika ≥70%, _Failed_ bila tidak).

### 6.4 Subscription & Access Control (Paywall)

- **FR15:** Sistem mencegat rute dengan antarmuka penawaran berlangganan (_Prompt/Upsell_) bila pengguna anonim / pengguna biasa tidak memegang _subscription_ sah melakukan interupsi ke entitas _Premium Lesson_.
- **FR16:** Visitors dan pengguna terautentikasi dapat mengakses halaman `/pricing` sebagai **public marketing surface** yang menampilkan detail paket, manfaat, dan harga langganan tanpa mewajibkan login terlebih dahulu. Autentikasi hanya diwajibkan pada saat memulai checkout (lihat FR17). Pengunjung anonim tidak boleh di-redirect menjauh dari `/pricing`.
- **FR17:** Pengguna mem-proktori siklus pembayaran fiktif Midtrans (via jendela fungsional _Sandbox_) pada tombol konversi paket.
- **FR18:** Sistem _Webhook_ secara paralel dapat mendengar dan merubah atribut hierarki _subscription_ menjadi `active` sejati dan `endDate` yang dikalkulasi durasi baru pasca menerima paket transaksi _settlement_.

### 6.5 Course Administration (Admin Back-Office)

- **FR19:** Pengguna super (Admin) menerima akses prioritas dasbor _Back-Office CMS_.
- **FR20:** Admin dapat Membaca statistik sederhana berisi akumulasi absolut total subentitas (`Users`, `Courses`, dan `Subscriptions`).
- **FR21:** Admin dapat mendesain utilitas Manajemen _Course_ penuh (Create, Edit, Delete / Publikasi vs Draft), meliputi judul, teks sinopsis, URL rujukan _thumbnail_, slug konversi URL, dan visibilitas akses Gratis/Berbayar.
- **FR22:** Admin dapat merangkai urutan hirarki _Chapter Table_: Mengemas Judul, Penjabaran, dan pengaturan urutan kemunculan sub-materi penunjang di sebuah target id _Course_.
- **FR23:** Admin dapat menambahkan entitas muatan _Lesson_ terisolasi: melabeli status properti wujud (Video, Teks Konvensional, atau Kuis), menetapkan URL materi terkait, di dalam rentetan sebuah spesifik _Chapter_.
- **FR24:** Khusus pada _Lesson_ bertipe Kuis, Admin dapat mematri skrup formulir perumusan Pertanyaan serta kunci penentu Jawaban Mutlak.

### 6.6 Public Landing Experience

- **FR25:** Visitors can access a premium public landing page at route `/` that communicates the platform value proposition and brand identity on first load.
- **FR26:** The landing page navbar must display the Seefluencer text logo on the left, Home/Courses/Pricing navigation in the center, and the authenticated user profile name on the right when a user is signed in.
- **FR27:** Visitors can navigate from the landing page to Courses and Pricing through clear CTA placements and section links.
- **FR28:** The landing page must present structured marketing sections that support discovery and conversion, such as hero messaging, featured benefits, social proof or trust indicators, and course/value highlights.
- **FR29:** The landing page may include smooth scrolling, parallax, progress-reveal interactions, or lightweight 3D enhancements as long as accessibility, responsiveness, and public-page performance targets are maintained.

## 7. Non-Functional Requirements (NFR)

_Non-Functional Requirements_ berfokus pada kualitas eksekusi spesifik teknis MVP selama 7 hari:

### 7.1 Performance (Kinerja)

- **NFR-P1 (Kecepatan Muat Dasar):** Waktu muat awal halaman (_Initial Page Load_) pada perangkat bersimulasi koneksi normal 4G dijamin berada sangat presisi di bawah 2.5 Detik untuk halaman rute publik.
- **NFR-P2 (Routing Halus):** Transisi spasial antar konten spesifik (_Lesson View_) terasa "Instan" (_Zero-flicker routing_) tanpa rute terputus menggunakan pengoptimalan _client routing_ App Router Next.js 15.
- **NFR-P3 (Lazy Loading):** Permukaan antar muka media _streaming iframe_ Youtube dikonfigurasi untuk sama sekali tidak menskorsing alur render eksternal _User Interface_ sekitar melalui injeksi parameter pemuatan tertunda (_Lazy load properties_).

### 7.2 Security (Keamanan)

- **NFR-S1 (Isolasi Sandi Mentah):** Seluruh kata sandi pengguna diawetkan murni melelalui pertahanan komputasi _cryptanalysis_, dengan standar ketat utilitas paket `bcrypt` (atau setaranya) pra-insert _Drizzle PostgreSQL Database_.
- **NFR-S2 (Intervensi Hak Akses Mutlak):** Keamanan area internal dasbor maupun eksploitasi peretasan _Client Side Fetching_ dibentengi 100% oleh mekanisme dinding server-kriteria (_NextAuth Middleware Checks_ & validasi tipe parameter statis di tubuh Drizzle _Server Actions_).
- **NFR-S3 (Rahasia Perusahan Absolut):** Elemen-elemen lingkungan sakral (_Provider Identifications_, `NEXTAUTH_SECRET`, Serpihan koneksi `DATABASE_URL`, serta Kunci Autorisasi Midtrans API) ditutup tanpa celah agar tidak bocor via `next_public` maupun serialisasi JSON di peramban pengguna.

### 7.3 Usability & Form Aesthetics (Ketergunaan & UI/UX)

- **NFR-U1 (Adaptasi Antarmuka Mobile-First):** Layout diselaraskan dan responsif mendeteksi variansi konstan lebar viewport gawai (Memastikan utilitas tidak bocor atau menyempit kaku di proporsi minimum Ponsel atau maksimum Resolusi Panel Widescreen).
- **NFR-U2 (Toleransi Tunggu Psikologis):** Komponen halaman menampilkan desain indikator pengalihan memanjakan semisal rekayasa grafis `Skeleton Loaders` alih-alih kekosongan interaktif layar putih (blank screen) pada jeda waktu penyediaan komputasi data _fetch_.
- **NFR-U3 (Konfirmasi Sukses/Gagal Tervisualisasi):** Setidaknya 90% proses perputaran eksekusi manipulasi data pengguna (_Server Actions Mutations_)—seprti pengiriman kuis, perbarui nama, publikasi modul materi—menghasilkan impresi umpan balik warna visual terang konfirmasi bertipe _Toasts Notification_ ke layar muka.
- **NFR-U4 (Aksesibilitas Tampilan Adaptif Cerdas):** Kompoen menyokong interaksi pengubahan tematik latar belakang gelap elegan (`Dark Mode Theme via next-themes`) dalam sekali interaksi intuitif kursor perancangannya guna menjaga kesegaran mata pengguna penonton edutech tersebut.

### 7.4 Maintainability (Pemeliharaan Infrastruktur MVP)

- **NFR-M1 (Kedisiplinan Logika Skrip Tipe Mutlak):** Menolak secara masif kompiler eksekusi skrip primitif perantara dengan pengikatan persetujuan wajib bendera kompiler TypeScript `strict` murni secara penuh dan toleransi nol besar kepada rujukan inferensi anomali (`any`).
- **NFR-M2 (Standarisasi Versi Rangkaian Skema Transaksional):** Penentuan alur struktur model tabel Database (DDL) wajib tunduk sejalan lewat rekayasa skrip transaksional terkontrol rapi utilitas deklaratif antarmuka spesifik (_Migrasi fail `Drizzle PostgreSQL` berinkremental_).

## 8. Database Architecture Schema (Drizzle PostgreSQL)

Skema direpresentasikan secara kuat menggunakan Drizzle ORM sebagai basis data relasional MVP EdTech ini.

```
Users
├── id, email, name, password (hashed), role, emailVerified, createdAt, updatedAt

Courses
├── id, title, description, thumbnail, slug, status, isFree, sortOrder, createdAt, updatedAt

Chapters
├── id, courseId (→ Courses), title, description, slug, sortOrder, createdAt, updatedAt

Lessons
├── id, chapterId (→ Chapters), title, description, content, videoUrl, type, slug, sortOrder

UserProgress
├── id, userId (→ Users), lessonId (→ Lessons), completed, completedAt, createdAt, updatedAt

Quizzes
├── id, lessonId (→ Lessons), question, optionA-D, correctAnswer, points, sortOrder

QuizAttempts
├── id, userId (→ Users), lessonId (→ Lessons), score, totalPoints, passed, answers (jsonb)

Plans
├── id, name, description, price, duration, features (jsonb)

Subscriptions
├── id, userId (→ Users), planId (→ Plans), status, startDate, endDate, paymentProvider, paymentId
```

## 9. Implementation Timeline (7 Days MVP)

- **Phase 1 (H+1/2): Foundation:** Setup Next.js, Auth, Middleware, Layout UI + Drizzle Setup.
- **Phase 2 (H+3/4): Core Logic:** Manajemen Kursus (CMS Admin), Katalog Kursus (Student), Peningkatan antarmuka Progress Bar _Lesson View_.
- **Phase 3 (H+5): Evaluasi & Finansial:** Logika pemrosesan soal _Quiz Generator_, Kalkulasi _Quiz Attempts_, Panel _Pricing_, dan Sinkronasi Webhook Pembayaran Midtrans Sandbox.
- **Phase 4 (H+6): Polish:** Restrukturisasi skenario gagal (Blank page error catcher), visualisasi peringatan Toasts, Search Bar interaktif, Dashboard metrik angka admin simpel, transisi animasi Dark mode komponen Shadcn.
- **Phase 5 (H+7): Delivery Execution:** Finalisasi perbaikan kelancaran alur navigasi (_Bug Catcher_ QA) mendalam. Menyiapkan manual interaktif pengerjaan (_Setup, run scripts_, Seed database simulasi awal) rapi di `README.md`.

## 10. Risk & Mitigation Strategy

- **Risk:** Waktu pengerjaan (_timeline 7 Hari_) rentan gagal mengakomodasi semua ide.
  - **Mitigation:** Strategi kompartementalisasi ketat pada _scope Phase 4/5_ (Growth features) yang hanya diamankan apabila seluruh 7 modul fundamental (_Auth, CMS, Lesson View, Tracking, Quiz, Sandbox Checkout, Gatekeeper Payment_) tersertifikasi nihil interupsi galat sistem _fatal error_ putih layar.
- **Risk:** Integrasi pihak ketiga (_Payment Gateway Callback / External URL Render_) yang bisa memperumit manajemen API berantakan pada MVP skala tipis.
  - **Mitigation:** Penetrasi pembebanan rendering Media secara otonom meminjam kapasitas mesin (_YouTube native UI player IFRAME embeds_), lalu mematuhi konvensi perpustakaan _Snap.JS Client Drop-In UI Widget_ standar dari repositori Midtrans untuk minimalisasi waktu habis merakit kanvas form _Payment Card_ sendiri dari nol.

## 11. Final Delivery Requirements

- **Repositori Github Publik** - Tercermin riwayat git _commit messages_ spesifik fungsionalitas.
- **Berkas Manual Dokumentasi Utama (`README.md`)** - Terisi tata ruang arahan operasional mendetail (Perintah inisiasi paket `pnpm install`, duplikasi `env.example`, tata letak migrasi _Push Schema Database DB_, skrip pendongkrak awal sampel data admin tersemat `pnpm seed`).
- **Eksekusi Stabil Nir-Error** - Dipastikan mampu berjalan dengan sempurna saat proses _build/dev local server machine_ di perangkat target _Reviewing Engineer_ HR tim penilai.
