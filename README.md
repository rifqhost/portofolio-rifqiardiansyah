# Rifqi Ardiansyah - Full Stack Portfolio

Portfolio pribadi **Rifqi Ardiansyah** — siswa SMK jurusan **Rekayasa Perangkat Lunak (RPL)** yang fokus pada **Web Development** dan **Backend Development**.

Dibangun dengan React 19 + Vite + TypeScript + Tailwind CSS + Framer Motion di sisi frontend, dan Express.js dengan penyimpanan berbasis file JSON di sisi backend. Dilengkapi mode admin lokal untuk mengelola seluruh konten situs.

## Fitur

- **Landing page** dengan partikel interaktif, animasi scroll reveal, dan tema gelap/terang/sistem.
- **Halaman publik**: Beranda, Tentang, Keahlian, Proyek (+ detail), Pengalaman, Pendidikan, Sertifikat, Blog (+ detail), Testimoni, Kontak, dan 404.
- **i18n** bahasa Indonesia (default) dan Inggris.
- **Mode Admin** di `/admin` untuk CRUD proyek, artikel blog, profil, dan pengaturan.
- **Penyimpanan JSON** — tanpa database, data disimpan di folder `data/`.
- **Upload gambar** via API `/api/admin/upload` (Multer) ke `data/uploads/`.
- **SEO**: meta tags dinamis, Open Graph, JSON-LD, sitemap, robots.txt, dan service worker.
- **Deploy siap ke Vercel** via `api/index.js`.

## Tech Stack

| Bagian     | Teknologi                                                          |
| ---------- | ------------------------------------------------------------------ |
| Frontend   | React 19, Vite, TypeScript, Tailwind CSS, Framer Motion, Radix UI  |
| Backend    | Node.js, Express.js, JWT, Multer, express-rate-limit               |
| Penyimpanan| File JSON (`data/*.json`)                                          |
| UI Icons   | lucide-react                                                       |
| Email      | EmailJS (opsional)                                                 |

## Struktur Proyek

```
portfolio/
├── client/                  # Frontend React + Vite
│   ├── public/              # Aset statis (favicon, SVG, manifest, dll)
│   └── src/
│       ├── components/      # Komponen UI & layout
│       ├── pages/           # Halaman publik + admin
│       ├── contexts/        # Theme, Language, Toast
│       ├── hooks/           # useFetch, usePagination, useSeo, dll
│       ├── services/        # API client, auth, email
│       ├── i18n/            # Terjemahan id/en
│       ├── lib/             # Utilitas & ikon
│       └── types/           # TypeScript types
├── server/                  # Backend Express.js
│   ├── routes/              # Public, auth, admin
│   ├── controllers/         # Logika bisnis
│   ├── middleware/          # Auth, rate limit, multer, error
│   ├── helpers/             # Response, id, paths, config
│   └── services/            # Storage JSON
├── data/                    # Data JSON + folder uploads
├── scripts/                 # Utility scripts
└── api/index.js             # Entry untuk Vercel serverless
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

Menjalankan server Express di `http://localhost:5000` dan Vite dev server di `http://localhost:5173` secara bersamaan.

### Build Produksi

```bash
npm run build     # typecheck + vite build
npm run start     # jalankan build dengan NODE_ENV=production
```

### Generate Aset (jika folder public dihapus)

```bash
npm run assets
```

## Mode Admin

1. Buka `http://localhost:5173/admin/login`.
2. Login dengan kredensial default:
   - Username: `admin`
   - Password: `admin123`
3. Ganti password di **Admin → Pengaturan → Ganti Password**.

Semua data yang diubah tersimpan di folder `data/` sebagai file JSON.

## Deploy ke Vercel

1. Push repo ke GitHub.
2. Import proyek di Vercel dengan pengaturan berikut:
   - **Framework Preset**: Other
   - **Root Directory**: `portfolio`
   - **Build Command**: `npm run build`
   - **Output Directory**: `client/dist`
3. Vercel akan otomatis menggunakan `vercel.json` dan entry `api/index.js`.

> Catatan: di lingkungan serverless (Vercel), penulisan file JSON bersifat **read-only/stateless**. Folder `data/` dipakai untuk pengembangan lokal; gunakan layanan penyimpanan eksternal (mis. Vercel KV, Supabase, atau Firestore) bila ingin CRUD penuh di produksi.

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
