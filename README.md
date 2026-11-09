# LMS KDKMP — Tahap A (Autentikasi + Peran)

## Instalasi
1. Buat proyek di https://supabase.com. Di **Authentication → Providers → Email**, matikan **Confirm email** (login nomor WA memakai email internal `628xxx@wa.lmskdkmp.local`).
2. Di **SQL Editor**, jalankan isi `supabase/migrations/001_auth_roles.sql`.
3. `cp .env.example .env.local`, isi URL, anon key, dan service role key (Settings → API).
4. `npm install`
5. `node --env-file=.env.local scripts/seed-demo.mjs` (membuat 4 akun demo)
6. `npm run dev` → buka http://localhost:3000

## Akun demo (kata sandi: `Demo12345!`)
peserta@ · fasilitator@ · wilayah@ · pusat@ `demo.lmskdkmp.id`

## Deploy
Push ke GitHub → import ke Vercel → isi 2 variabel `NEXT_PUBLIC_*` (service role key JANGAN di Vercel) → Deploy.

## Keamanan (Tahap A)
- Kata sandi di-hash oleh Supabase Auth. Peran tidak pernah dibaca dari form; pendaftar publik selalu `peserta`.
- RLS: peserta hanya melihat dirinya, admin wilayah hanya wilayahnya, admin pusat semua; peserta tidak bisa menaikkan perannya sendiri.

## Tahap B (kursus + pelajaran)
Jalankan berurutan di SQL Editor: `supabase/migrations/002_courses.sql`, lalu `supabase/seed/003_seed_courses.sql`.
Coba: masuk sebagai peserta → Dasbor → Katalog Kursus → kursus 1 → buka pelajaran → "Tandai selesai & lanjut" → buka Lembar Kerja.
`content/modul-1-kuis.json` berisi 10 soal kuis Modul 1; dimuat ke bank soal pada Tahap C.
Jalur per jabatan: kolom `courses.jabatan_target`. Admin pusat boleh mengisi pelajaran lewat tabel `lessons` (panel admin menyusul).

## Tahap C (kuis + ujian)
Jalankan berurutan: `supabase/migrations/004_quiz.sql`, lalu `supabase/seed/005_seed_quiz_modul1.sql`.
Aturan: soal & opsi diacak per percobaan; kunci jawaban tidak pernah dikirim ke peserta; timer dan nilai dihitung di database;
ujian akhir hanya terbuka setelah semua pelajaran selesai; nilai minimal lulus dan batas percobaan diatur di tabel `quizzes`.

## Tahap D (sertifikat)
Jalankan `supabase/migrations/006_certificates.sql`, lalu `npm install` (menambah pdf-lib dan qrcode). Isi `NEXT_PUBLIC_SITE_URL` dengan alamat situs publik agar QR menunjuk ke domain yang benar.
- Terbit otomatis saat peserta lulus **ujian akhir**. Satu sertifikat per peserta per kursus. Nomor: `LMS-KDKMP/<tahun>/<urut>`.
- Verifikasi publik tanpa login: `/verifikasi/<token QR>` (data lengkap) atau `/verifikasi` dengan nomor (nama disamarkan, KDKMP disembunyikan).
- Mencabut sertifikat (admin pusat, SQL Editor): `update certificates set revoked_at = now() where number = '...';`
- Demo cepat (tanpa membaca 3 pelajaran), jalankan di SQL Editor lalu kerjakan Ujian Akhir:
  `insert into lesson_progress (user_id, lesson_id) select u.id, l.id from auth.users u, lessons l where u.email = 'peserta@demo.lmskdkmp.id' on conflict do nothing;`

## Tahap E1 (laporan, ekspor, impor)
Jalankan `supabase/migrations/007_report.sql`, lalu `npm install` (menambah jszip).
- **Laporan** `/admin/laporan` (admin wilayah/pusat): filter kursus, provinsi, kabupaten, KDKMP; ekspor Excel/CSV. Admin wilayah otomatis hanya melihat wilayahnya (RLS di database).
- **Impor peserta** `/admin/peserta/impor`: unggah CSV (maks 100 baris), akun dibuat dengan peran Peserta. **Perlu `SUPABASE_SERVICE_ROLE_KEY` di variabel lingkungan SERVER** (Vercel → Environment Variables, tanpa awalan NEXT_PUBLIC). Kunci ini hanya dipakai di server action yang sudah memeriksa peran admin; jangan pernah diberi awalan NEXT_PUBLIC.
- Peserta baru sebaiknya langsung ganti kata sandi di menu "Ganti kata sandi".
- Ekspor dan impor tercatat di tabel `audit_logs` (dibaca admin pusat).
