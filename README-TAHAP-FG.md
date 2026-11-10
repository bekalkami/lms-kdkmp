# LMS KDKMP — Tahap F (verifikasi email) + Tahap G (premium, trial, QRIS)

## Cara pasang (urut)
1. **SQL Editor Supabase**, jalankan berurutan: `supabase/migrations/008_email_verification.sql` lalu `009_premium.sql`.
2. **Variabel lingkungan SERVER** (lokal: `.env.local`; Vercel: Environment Variables, tanpa `NEXT_PUBLIC`). Lihat blok baru di `.env.example`:
   `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_CODE_PEPPER`, `MIDTRANS_SERVER_KEY`, `MIDTRANS_IS_PRODUCTION`.
3. **Resend**: buat akun, verifikasi domain pengirim, ambil API key.
4. **Midtrans**: mulai dari akun **Sandbox**. Aktifkan QRIS. Isi *Payment Notification URL* di dashboard dengan `https://DOMAIN-ANDA/api/webhooks/midtrans`.
5. Jadikan kursus premium (SQL Editor):
   ```sql
   update courses set is_premium = true, price_idr = 149000, trial_days = 7, access_days = 365 where slug = 'ISI-SLUG';
   -- access_days NULL = akses seumur hidup
   update lessons set is_preview = true where id = 'ID-PELAJARAN-CONTOH';  -- opsional: pelajaran contoh gratis
   ```
6. `npm run dev` / deploy.

## Alur
- Daftar/login **tetap seperti sekarang** (nomor WA atau email, tanpa kode).
- Verifikasi email (kode 6 digit, berlaku 10 menit) diminta **hanya** saat peserta menekan trial/beli, lewat `/akun/email`.
- Kursus premium: `/kursus/<slug>/akses` → **Coba gratis N hari** atau **Beli (QRIS)** → `/bayar/<id>` menampilkan QR, halaman polling status.
- Akses diberikan HANYA oleh `fulfill_order` setelah server menanyakan status ke Midtrans dan nominalnya cocok.

## Keamanan yang sudah ditanam
- Gerbang konten ada di **RLS** (`lessons_read`, `worksheets_read`, `start_attempt`), bukan hanya tampilan.
- Harga dibaca dari database saat membuat pesanan, tidak dari form.
- Webhook: tanda tangan SHA-512 diperiksa, lalu status ditanyakan ulang ke Midtrans; aman dikirim berulang.
- Kode email disimpan sebagai hash, maksimal 5 salah tebak, jeda kirim ulang 1 menit, maksimal 5 kode per jam.
- 1 trial per akun **dan** per email kanonik (alias Gmail `a.b+x@gmail.com` dianggap satu).
- Tabel `email_verified`, `entitlements`, `orders`, `trial_claims` tidak punya policy tulis untuk klien.

## Daftar uji (sandbox)
1. Peserta WA → buka kursus premium → terkunci, hanya pelajaran `is_preview` yang terbuka.
2. Klik trial → diarahkan verifikasi email → kode masuk → trial aktif → materi terbuka; trial kedua ditolak.
3. Beli → QR muncul → bayar lewat simulator Midtrans → halaman berubah "Pembayaran berhasil".
4. Buka ulang `/bayar/<id>` setelah kedaluwarsa → "Pesanan tidak berlaku".
5. Akun lain yang mencoba membuka `/bayar/<id>` milik orang → 404.

## Hal yang perlu diketahui
- Di katalog, progres kursus premium yang belum diakses menghitung hanya pelajaran yang boleh dibaca (RLS menyembunyikan sisanya). Tampilan teks kursusnya sudah diberi penanda terkunci.
- Harga/trial diatur lewat SQL dulu; layar admin untuk ini belum dibuat.
- Adapter gateway ada di `lib/payments/midtrans.ts` (+ `app/api/webhooks/midtrans`). Pindah ke Xendit/Duitku cukup mengganti dua tempat itu.
- Kode belum dijalankan terhadap database dan akun Midtrans asli; lulus type-check TypeScript. Uji di sandbox sebelum production.
