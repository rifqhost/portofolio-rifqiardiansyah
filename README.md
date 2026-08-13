# Rifqi Ardiansyah - Full Stack Portfolio

Portfolio pribadi **Rifqi Ardiansyah** — siswa SMK jurusan **Rekayasa Perangkat Lunak (RPL)** yang fokus pada **Web Development** dan **Backend Development**.

Dibangun dengan React 19 + Vite + TypeScript + Tailwind CSS + Framer Motion. Situs statis murni (tanpa backend), data disimpan sebagai file JSON dan siap di-deploy ke Netlify. Dilengkapi mode admin untuk mengelola konten dari browser.

## Fitur

- **Landing page** dengan partikel interaktif, animasi scroll reveal, dan tema gelap/terang/sistem.
- **Halaman publik**: Beranda, Tentang, Keahlian, Proyek (+ detail), Pengalaman, Pendidikan, Sertifikat, Blog (+ detail), Testimoni, Kontak, dan 404.
- **i18n** bahasa Indonesia (default) dan Inggris.
- **Mode Admin** di `/admin` untuk CRUD proyek, artikel blog, profil, dan pengaturan.
- **Penyimpanan JSON** — tanpa database, data disimpan di folder `data/`.
- **Upload gambar** di mode admin — disimpan sebagai data URL di localStorage browser (maks ±1.5MB).
- **SEO**: meta tags dinamis, Open Graph, JSON-LD, sitemap, robots.txt, dan service worker.
- **Deploy siap ke Netlify** (fully static): data dibaca dari `client/public/data/`, mode admin disimpan di localStorage.

## Tech Stack

| Bagian     | Teknologi                                                          |
| ---------- | ------------------------------------------------------------------ |
| Frontend   | React 19, Vite, TypeScript, Tailwind CSS, Framer Motion, Radix UI  |
| Penyimpanan| File JSON (`data/*.json`)                                          |
| UI Icons   | lucide-react                                                       |
| Email      | EmailJS (opsional)                                                 |

## Struktur Proyek

```
portfolio/
├── client/                  # Frontend React + Vite
│   ├── public/              # Aset statis (favicon, gambar, data, dll)
│   └── src/
│       ├── components/      # Komponen UI & layout
│       ├── pages/           # Halaman publik + admin
│       ├── contexts/        # Theme, Language, Toast
│       ├── hooks/           # useFetch, usePagination, useSeo, dll
│       ├── services/        # API client, auth, email
│       ├── i18n/            # Terjemahan id/en
│       ├── lib/             # Utilitas & ikon
│       └── types/           # TypeScript types
├── data/                    # Data JSON (sumber untuk build statis)
├── scripts/                 # Utility scripts (prepare-static, prepare-images)
└── netlify.toml             # Konfigurasi build Netlify
```

## Cara Menjalankan

### Prasyarat

- Node.js **>= 18.17** (disarankan 18.18.2)
- npm **>= 9**

### Instalasi

```bash
cd portfolio
npm install
```

### Mode Development

```bash
npm run dev
```

Menjalankan Vite dev server di `http://localhost:5173` (mode statis, tanpa backend).

### Build Produksi

```bash
npm run build     # typecheck + salin data statis + generate gambar + vite build
npm run preview   # pratinjau hasil build (opsional)
```

## Mode Admin

1. Buka `http://localhost:5173/admin/login` (dev) atau `<domain>/admin/login` (produksi).
2. Login dengan kredensial default:
   - Username: `admin`
   - Password: `admin123`
3. Ganti password di **Admin → Pengaturan → Ganti Password**.

> **Penting (mode statis / Netlify):** perubahan via admin tersimpan di **localStorage browser** (per-perangkat), bukan di server. Pengunjung tetap melihat data statis dari `data/*.json`. Untuk memperbarui data untuk semua pengunjung, ubah file di folder `data/` lalu deploy ulang.

## Deploy ke Netlify

1. Push repo ke GitHub.
2. Import proyek di Netlify (Build with Netlify) dengan pengaturan otomatis dari `netlify.toml`:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `client/dist`
   - **Node Version**: 20
3. Set **Environment Variables** di Netlify (Site settings → Environment variables):
   - `VITE_SITE_URL` — domain situs, mis. `https://rifqi-ardiansyah.netlify.app` (dipakai sitemap & robots.txt)
   - `VITE_ADMIN_USERNAME` & `VITE_ADMIN_PASSWORD` — kredensial admin (opsional)
   - `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY` — untuk form kontak (opsional)
4. SPA fallback sudah diatur via `client/public/_redirects` (`/* → /index.html`).

### Cara kerja mode statis

- Saat `npm run build`, script `scripts/prepare-static.mjs` menyalin `data/*.json` ke `client/public/data/` dan `data/uploads/` ke `client/public/uploads/`, lalu regenerasi `sitemap.xml` & `robots.txt` memakai `VITE_SITE_URL`.
- Halaman publik membaca data dari `/data/*.json` (tanpa backend Express).
- Script `scripts/prepare-images.mjs` membuat gambar placeholder (avatar/proyek PNG, cover blog SVG) hanya jika belum ada.

## Ganti Foto (Avatar, Proyek, Blog)

Gambar dipakai langsung dari `client/public/images/`. Untuk mengganti, **timpa file dengan nama yang sama** (jaga ekstensi tetap sama) lalu build & deploy ulang. Atau pakai nama baru dan ubah path-nya di `data/*.json`.

| Konten       | File                                        | Ukuran |
| ------------ | ------------------------------------------- | ------ |
| Avatar       | `avatar.webp`                               | 400×400 |
| Proyek CBT   | `project-cbt.webp`, `project-cbt-2.webp`, `project-cbt-3.webp` | max 800px wide |
| Proyek Guestbook | `project-guestbook.webp`, `project-guestbook-2.webp`, `project-guestbook-3.webp` | max 800px wide |
| Blog REST API| `blog-rest-api.svg`                         | 1200×675 |
| Blog React   | `blog-react.svg`                            | 1200×675 |
| Blog JSON    | `blog-json.svg`                             | 1200×675 |
| CV / dokumen | `data/uploads/cv-rifqi-ardiansyah.pdf` → disalin ke `/uploads/` | - |

Cover blog berupa **SVG bertuliskan judul** (gradien) agar tidak terlihat kosong. Kalau ingin foto asli, cukup timpa isi file-nya dengan gambar Anda — atau ganti nama file & perbarui path di `data/blog.json`.

## Konfigurasi Email

Aktifkan EmailJS di `data/config.json` (`features.emailjs: true`) lalu isi `serviceId`, `templateId`, dan `publicKey`, atau set variabel lingkungan:

```
VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_TEMPLATE_ID=...
VITE_EMAILJS_PUBLIC_KEY=...
```

## Variabel Lingkungan

Lihat `.env.example` untuk daftar variabel yang tersedia.

## Lisensi

Dibuat untuk keperluan belajar dan personal. Silakan dipakai sebagai referensi.
