# Admin Konten LMS KDKMP

## Perubahan
- Halaman baru `/admin/konten` untuk admin_pusat.
- Pengelolaan kursus (tambah, ubah, hapus, urutan, status terbit).
- Pengelolaan modul dan materi (Markdown, jenis materi, URL video/file, durasi, urutan).
- Pengelolaan kuis/ujian (pre-test, kuis modul, post-test, ujian akhir, durasi, nilai lulus, jumlah soal, batas percobaan).
- Pengelolaan bank soal (pertanyaan, empat opsi, satu jawaban benar, pembahasan).
- Tautan ke halaman ini ditambahkan pada dasbor admin_pusat.

## Instalasi
1. Ganti/tambahkan file sesuai struktur folder proyek ini.
2. Jalankan `npm install` bila dependensi belum terpasang.
3. Jalankan `npm run build` untuk memeriksa build.
4. Commit dan push ke branch deployment (biasanya `main`), lalu periksa deployment Vercel.

## Supabase
Tidak ada migration SQL baru. Fitur menggunakan tabel dan kebijakan RLS yang sudah ada pada migration `002_courses.sql` dan `004_quiz.sql`. Pastikan migration tersebut sudah diterapkan di project Supabase.

## Pengamanan riwayat
- Halaman dan server actions memeriksa role `admin_pusat`.
- RLS Supabase tetap menjadi lapisan otorisasi database.
- Kuis tidak bisa dihapus jika sudah memiliki percobaan ujian.
- Kursus tidak bisa dihapus jika sudah memiliki percobaan atau sertifikat.
- Soal yang sudah pernah masuk ke percobaan ujian dikunci agar perubahan soal tidak mengubah riwayat peserta.

## Catatan
Penghapusan modul atau materi akan mengikuti foreign key `ON DELETE CASCADE` yang sudah ada di database. Sebelum menghapus modul/materi yang sudah dipakai, pastikan memang ingin menghapus konten dan data progres terkait.
