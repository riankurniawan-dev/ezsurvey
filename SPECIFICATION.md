# Spesifikasi Proyek EZSurvey

Berdasarkan dari kode dan konfigurasi project `ezsurvey`, berikut adalah spesifikasi teknologi yang digunakan:

## 1. Core Framework & Bahasa Pemrograman
*   **Framework:** [Next.js](https://nextjs.org/) (versi 16.3.0) 
*   **UI Library:** [React](https://react.dev/) (versi 19.2.8)
*   **Bahasa Utama:** [TypeScript](https://www.typescriptlang.org/) untuk penulisan kode yang *type-safe*.

## 2. Database & Backend
*   **Database:** **MySQL** 
*   **ORM (Object Relational Mapping):** [Prisma](https://www.prisma.io/) (versi 5.22.0) digunakan untuk mengelola skema database dan *query* ke MySQL.

## 3. Autentikasi & Keamanan
*   **Library Auth:** **NextAuth.js** (versi 4) digunakan untuk sistem login dan manajemen sesi.
*   **Keamanan Tambahan:** 
    *   `bcryptjs` untuk enkripsi *password*.
    *   `jsonwebtoken` (JWT) untuk token sesi.
*   **Role-Based Access Control (RBAC):** Terdapat sistem hak akses yang meliputi: Admin, Surveyor, Supervisor, Manager, dan Client.

## 4. Desain & Tampilan (UI/UX)
*   **Styling:** **Tailwind CSS** (versi 4) untuk pembuatan *layout* dan desain yang responsif.
*   **Ikon:** `lucide-react` untuk ikon-ikon antarmuka.
*   **Alert/Popup:** `sweetalert2` untuk notifikasi *popup* yang interaktif.

## 5. Fitur Utama & Library Pendukung
*   **PWA (Progressive Web App):** Didukung oleh `next-pwa` dan `idb` (IndexedDB). Aplikasi dapat diinstal di perangkat (PC/Mobile) dan memiliki potensi kapabilitas untuk menyimpan data secara *offline*.
*   **Manajemen State:** Menggunakan [Zustand](https://zustand-demo.pmnd.rs/) untuk mengelola data global (State Management) secara efisien dalam aplikasi.
*   **Peta & Lokasi:** Menggunakan **Leaflet** untuk menampilkan peta interaktif (untuk melacak lokasi aset/survey atau koordinat GPS).
*   **Grafik & Laporan:** Menggunakan **Chart.js** dan `react-chartjs-2` untuk keperluan visualisasi data statistik.
*   **Pembuatan Dokumen PDF:** Menggunakan kombinasi `jspdf`, `jspdf-autotable`, dan `html2canvas` untuk melakukan *export* data atau hasil survey ke dalam dokumen berformat PDF.
*   **QR Code:** `qrcode` dan `react-qr-code` untuk pembuatan (generate) atau membaca kode QR untuk manajemen aset.
*   **Tanda Tangan Digital:** `react-signature-canvas` untuk memungkinkan fitur tanda tangan langsung di layar sentuh (e-signature).
*   **Manipulasi Waktu:** `date-fns` untuk memanipulasi format tanggal dan waktu secara mudah.

---
*Dokumen ini digenerate secara otomatis berdasarkan isi `package.json` dan struktur proyek yang ada.*
