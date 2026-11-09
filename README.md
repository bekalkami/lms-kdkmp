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
