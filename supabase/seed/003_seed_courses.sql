-- 10 kursus awal + isi lengkap Modul 1. Aman dijalankan ulang (ON CONFLICT).
insert into public.courses (slug, title, description, jabatan_target, position) values
('dasar-perkoperasian-kdkmp','1. Dasar-dasar Perkoperasian dan Kebijakan KDKMP','Memahami koperasi, prinsipnya, dan dasar kebijakan KDKMP.','{manajer,pengurus,pengawas,staf_gerai}',1),
('tata-kelola-organisasi','2. Tata Kelola Organisasi dan Peran Pengurus/Pengawas','Rapat anggota, pembagian tugas, dan akuntabilitas.','{manajer,pengurus,pengawas,staf_gerai}',2),
('manajemen-gerai-ritel','3. Manajemen Gerai/Ritel Koperasi','Mengelola stok, display, kasir, dan layanan gerai.','{manajer,pengurus,staf_gerai}',3),
('rantai-pasok-pengadaan','4. Manajemen Rantai Pasok dan Pengadaan','Memilih pemasok, memesan, dan menjaga ketersediaan barang.','{manajer,staf_gerai}',4),
('pembukuan-laporan-keuangan','5. Pembukuan dan Laporan Keuangan Sederhana','Mencatat transaksi dan menyusun laporan dasar.','{manajer,pengurus,pengawas}',5),
('simpan-pinjam-risiko','6. Pengelolaan Simpan Pinjam dan Manajemen Risiko','Mengelola simpanan, pinjaman, dan risiko kredit.','{manajer,pengurus,pengawas}',6),
('pemasaran-layanan-anggota','7. Pemasaran dan Layanan Anggota','Menjangkau anggota dan menjaga kepuasan layanan.','{manajer,pengurus,pengawas,staf_gerai}',7),
('literasi-digital-aplikasi','8. Literasi Digital dan Aplikasi Koperasi','Memakai ponsel dan aplikasi untuk kerja koperasi.','{manajer,pengurus,pengawas,staf_gerai}',8),
('kepatuhan-pajak-pelaporan','9. Kepatuhan, Perpajakan, dan Pelaporan','Kewajiban legal, pajak, dan pelaporan rutin.','{manajer,pengurus,pengawas}',9),
('kewirausahaan-unit-usaha','10. Kewirausahaan dan Pengembangan Unit Usaha','Menemukan peluang dan mengembangkan unit usaha baru.','{manajer,pengurus}',10)
on conflict (slug) do nothing;

-- Satu modul per kursus (kursus 2-10: isi pelajaran menyusul, ditambah admin pusat)
insert into public.modules (course_id, title, position)
select c.id, 'Modul ' || c.position, 1 from public.courses c
where not exists (select 1 from public.modules m where m.course_id = c.id);

-- Modul 1: 3 pelajaran
with m as (select m.id from public.modules m join public.courses c on c.id = m.course_id where c.slug = 'dasar-perkoperasian-kdkmp')
insert into public.lessons (module_id, title, type, content_md, video_url, duration_min, position)
select m.id, v.title, v.type::lesson_type, v.body, null, v.dur, v.pos from m, (values
(1, 'Apa itu Koperasi? Nilai dan Prinsipnya', 'teks', 8, $$## Pengertian
Koperasi adalah badan usaha yang beranggotakan orang-seorang atau badan hukum koperasi. Koperasi bekerja berdasarkan **prinsip koperasi** dan sekaligus sebagai gerakan ekonomi rakyat berdasarkan asas kekeluargaan. Dasar hukumnya adalah **UU No. 25 Tahun 1992 tentang Perkoperasian**.

## Tujuh prinsip koperasi
1. Keanggotaan bersifat sukarela dan terbuka
2. Pengelolaan dilakukan secara demokratis
3. Pembagian Sisa Hasil Usaha (SHU) dilakukan adil, sebanding dengan jasa usaha anggota
4. Balas jasa yang terbatas terhadap modal
5. Kemandirian
6. Pendidikan perkoperasian
7. Kerja sama antarkoperasi

## Tiga perangkat organisasi
- **Rapat Anggota**: pemegang kekuasaan tertinggi
- **Pengurus**: menjalankan organisasi dan usaha
- **Pengawas**: mengawasi kebijakan dan pengelolaan koperasi

## Yang perlu diingat
Satu anggota satu suara, apa pun besar simpanannya. SHU dibagi menurut seberapa aktif anggota bertransaksi, bukan hanya menurut besar modal.$$),
(2, 'Mengenal Program KDKMP', 'teks', 8, $$## Dasar kebijakan
Koperasi Desa/Kelurahan Merah Putih (KDKMP) dibentuk berdasarkan **Instruksi Presiden No. 9 Tahun 2025** tentang Percepatan Pembentukan Koperasi Desa/Kelurahan Merah Putih, ditandatangani pada 27 Maret 2025. Targetnya sekitar **80.000 koperasi** di desa dan kelurahan. Kelembagaannya diluncurkan secara nasional pada 21 Juli 2025.

## Kegiatan usaha yang disebut dalam Inpres
Kantor koperasi, pengadaan sembako, simpan pinjam, klinik desa/kelurahan, apotek desa/kelurahan, cold storage/pergudangan, dan logistik. Rumusannya "meliputi namun tidak terbatas", sehingga disesuaikan dengan karakter dan potensi desa.

## Penamaan
Nama diawali kata "Koperasi", lalu "Desa Merah Putih" atau "Kelurahan Merah Putih", lalu nama desa/kelurahan setempat.

## Catatan
Aturan pelaksana (pembiayaan, pembangunan gerai, dan lainnya) dapat berubah. Pengelola wajib memeriksa edaran terbaru dari Kementerian Koperasi dan dinas koperasi setempat.$$),
(3, 'Peran Pengelola dan Langkah Awal Operasional', 'video', 7, $$## Video
Video penjelasan akan ditambahkan admin pusat. Ringkasannya sudah tersedia di bawah, jadi kamu tetap bisa belajar tanpa video.

## Peran sehari-hari
- **Manajer**: menjalankan operasional harian gerai dan unit usaha, serta melapor ke pengurus
- **Pengurus**: menetapkan kebijakan, mengelola organisasi, dan mempertanggungjawabkan kepada Rapat Anggota
- **Pengawas**: memeriksa, memberi saran, dan memastikan pengelolaan sesuai aturan
- **Staf gerai**: melayani anggota, mencatat transaksi, dan menjaga stok

## Lima langkah awal yang aman
1. Pastikan data anggota dan simpanan tercatat rapi
2. Pisahkan uang koperasi dari uang pribadi, tanpa pengecualian
3. Catat setiap transaksi pada hari yang sama
4. Tetapkan siapa yang boleh memutuskan pembelian dan pinjaman
5. Laporkan kondisi usaha secara berkala kepada pengurus dan anggota

Kerjakan **Lembar Kerja: Peta Koperasi Saya** setelah selesai.$$)
) as v(pos, title, type, dur, body)
where not exists (select 1 from public.lessons l where l.module_id = m.id);

insert into public.worksheets (module_id, title, instructions, items)
select m.id, 'Lembar Kerja: Peta Koperasi Saya', 'Isi dengan kondisi nyata KDKMP kamu. Boleh dicetak atau ditulis tangan, lalu dibahas bersama pengurus dan fasilitator.',
$$[{"label":"Nama KDKMP dan jumlah anggota saat ini","hint":"Contoh: Koperasi Desa Merah Putih Sukamaju, 120 anggota"},
{"label":"Tiga potensi utama desa/kelurahan","hint":"Hasil tani, kerajinan, jasa, wisata, dan sejenisnya"},
{"label":"Unit usaha yang sudah berjalan dan yang ingin dibuka","hint":"Gerai sembako, simpan pinjam, apotek, dan sejenisnya"},
{"label":"Nama pengurus dan pengawas beserta tugas masing-masing","hint":"Tuliskan satu baris per orang"},
{"label":"Tiga hal yang paling ingin saya pelajari","hint":"Akan dipakai untuk memilih kursus berikutnya"}]$$::jsonb
from public.modules m join public.courses c on c.id = m.course_id
where c.slug = 'dasar-perkoperasian-kdkmp' and not exists (select 1 from public.worksheets w where w.module_id = m.id);
