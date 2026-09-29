# Struktur Proyek Portal Berita Perhutani

Dokumen ini menjelaskan lokasi kode utama dan alur kerja aplikasi untuk pengembang yang baru bergabung.

## Teknologi dan Alur Utama

Aplikasi menggunakan Laravel sebagai backend, Inertia.js sebagai penghubung halaman, dan React untuk antarmuka. Dashboard mengambil daftar publikasi dari Google Sheets melalui Google Apps Script.

```text
Browser
  -> routes/web.php
  -> auth + EnsureStaffRole
  -> DashboardController
  -> GoogleSheetsApiService
  -> Google Apps Script (Code.gs)
  -> tab "data" pada Google Sheets
  -> data dikirim kembali ke halaman React melalui Inertia
```

Gambar Google Drive ditampilkan melalui endpoint aplikasi `/sheets-berita/drive-image/{fileId}`. Endpoint memeriksa format ID dan tipe konten sebelum meneruskan gambar ke browser.

## Peta Folder

```text
berita-perhutani/
├── app/
│   ├── Console/Commands/
│   │   ├── CreateAdminUser.php
│   │   ├── PublishScheduledBerita.php
│   │   ├── SheetsPullCommand.php
│   │   └── SheetsPushCommand.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/                 # Login, reset password, verifikasi
│   │   │   ├── BeritaSheetsController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── KategoriController.php
│   │   │   ├── ProfileController.php
│   │   │   └── UserController.php
│   │   ├── Middleware/
│   │   │   ├── EnsureStaffRole.php
│   │   │   └── HandleInertiaRequests.php
│   │   └── Requests/                 # Validasi request, termasuk profil/login
│   ├── Models/                       # User, Berita, Kategori, riwayat revisi
│   ├── Policies/                     # Aturan akses model
│   ├── Providers/
│   └── Services/
│       ├── GoogleSheetsApiService.php
│       └── GoogleSheetsCsvService.php
├── bootstrap/
│   └── app.php                       # Bootstrap Laravel, routing, scheduler
├── config/
│   ├── services.php                  # Nama variabel integrasi Sheets
│   ├── session.php                   # Pengaturan sesi/cookie
│   └── ...
├── database/
│   ├── factories/                    # Data untuk tes
│   ├── migrations/                   # Struktur tabel database
│   └── seeders/                      # Data awal kategori/berita
├── google-apps-script/
│   ├── Code.gs                       # API baca/tulis Google Sheets
│   └── netlify.gs                    # Pemicu build situs publik
├── resources/
│   ├── css/                          # Style aplikasi
│   ├── js/
│   │   ├── Components/               # Komponen React yang dipakai ulang
│   │   ├── Layouts/                  # Layout login dan area staf
│   │   ├── Pages/
│   │   │   ├── Auth/                 # Login dan alur akun
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Kategori/
│   │   │   ├── Profile/
│   │   │   ├── SheetsBerita/
│   │   │   └── Users/
│   │   ├── utils/                    # Helper tanggal, artikel, gambar
│   │   └── app.jsx                   # Entry point React/Inertia
│   └── views/
│       └── app.blade.php             # Shell HTML Inertia
├── routes/
│   ├── web.php                       # Dashboard dan fitur area staf
│   ├── auth.php                      # Login, logout, reset password
│   └── console.php                   # Perintah console sederhana
├── tests/
│   ├── Feature/                      # Tes alur HTTP dan integrasi
│   └── Unit/                         # Tes unit
├── public/                           # Entry point, gambar, dan hasil build
├── artisan                           # CLI Laravel
├── composer.json                     # Paket PHP dan perintah Composer
├── package.json                      # Paket dan perintah frontend
└── vite.config.js                    # Build frontend
```

## File yang Sering Dicari

- `routes/web.php`: daftar URL utama dan middleware akses.
- `app/Http/Controllers/DashboardController.php`: data statistik dan berita terbaru untuk Dashboard.
- `app/Http/Controllers/BeritaSheetsController.php`: daftar, detail, tambah, ubah, hapus berita, dan proxy gambar Drive.
- `app/Services/GoogleSheetsApiService.php`: request API Dashboard ke Apps Script.
- `app/Services/GoogleSheetsCsvService.php`: sinkronisasi CSV/berita lokal yang digunakan perintah Sheets.
- `app/Http/Middleware/EnsureStaffRole.php`: membatasi area staf untuk akun aktif ber-role admin/editor.
- `resources/js/Pages/Dashboard.jsx`: antarmuka Dashboard.
- `resources/js/Pages/SheetsBerita/`: antarmuka pengelolaan publikasi.
- `resources/js/utils/article.jsx`: normalisasi URL gambar dan sanitasi konten artikel.
- `google-apps-script/Code.gs`: endpoint Apps Script yang bekerja dengan tab `data`.
- `tests/Feature/`: tes autentikasi, pengguna, gambar Drive, dan sinkronisasi terjadwal.

## Keamanan dan Pengaturan

Nilai rahasia tidak disimpan dalam source code. Atur URL dan token Apps Script pada `.env` sebagai `GOOGLE_SHEETS_EXEC_URL` dan `GOOGLE_SHEETS_TOKEN`. Di Apps Script, property `SHEETS_API_TOKEN` harus cocok dengan token aplikasi. Build hook disimpan pada property `NETLIFY_BUILD_HOOKS`.

Jangan membagikan `.env`. File `.env.example` hanya berisi nama konfigurasi dan placeholder.

## Perintah Pengembangan

```powershell
# Jalankan tes
php artisan test

# Build frontend untuk production
npm run build

# Buat admin pertama; password dimasukkan melalui prompt tersembunyi
php artisan users:create-admin

# Tarik/push salinan berita database lokal bila diperlukan
php artisan sheets:pull --dry-run
php artisan sheets:push --dry-run
```

`vendor/` dan `node_modules/` berisi dependency, sedangkan `public/build/` adalah output hasil build. Umumnya keduanya bukan tempat mengubah fitur aplikasi secara langsung.
