-- Seed Tahap C: 10 soal Modul 1 + 4 kuis/ujian untuk kursus 1. Aman dijalankan ulang.
do $$ declare cid uuid; qid uuid; begin
select id into cid from public.courses where slug='dasar-perkoperasian-kdkmp';
if cid is null then raise exception 'Jalankan seed kursus (003) dulu'; end if;
if exists (select 1 from public.question_bank where course_id=cid) then return; end if;
insert into public.question_bank(course_id,body,explanation) values(cid,'Dasar hukum perkoperasian di Indonesia adalah...','Perkoperasian diatur dalam UU No. 25 Tahun 1992.') returning id into qid;
insert into public.question_options(question_id,body,is_correct,position) values (qid,'UU No. 25 Tahun 1992',true,0), (qid,'UU No. 1 Tahun 1974',false,1), (qid,'UU No. 40 Tahun 2007',false,2), (qid,'UU No. 6 Tahun 2014',false,3);
insert into public.question_bank(course_id,body,explanation) values(cid,'Pemegang kekuasaan tertinggi dalam koperasi adalah...','Rapat Anggota memegang kekuasaan tertinggi.') returning id into qid;
insert into public.question_options(question_id,body,is_correct,position) values (qid,'Pengurus',false,0), (qid,'Pengawas',false,1), (qid,'Rapat Anggota',true,2), (qid,'Manajer',false,3);
insert into public.question_bank(course_id,body,explanation) values(cid,'Tiga perangkat organisasi koperasi adalah...','Perangkatnya: Rapat Anggota, Pengurus, dan Pengawas.') returning id into qid;
insert into public.question_options(question_id,body,is_correct,position) values (qid,'Rapat Anggota, Pengurus, Pengawas',true,0), (qid,'Direktur, Komisaris, Manajer',false,1), (qid,'Ketua, Bendahara, Kasir',false,2), (qid,'Kepala desa, Camat, Bupati',false,3);
insert into public.question_bank(course_id,body,explanation) values(cid,'Sisa Hasil Usaha (SHU) dibagi secara adil sebanding dengan...','Pembagian SHU sebanding dengan jasa usaha anggota.') returning id into qid;
insert into public.question_options(question_id,body,is_correct,position) values (qid,'Lamanya menjadi anggota',false,0), (qid,'Jasa usaha masing-masing anggota',true,1), (qid,'Jabatan anggota',false,2), (qid,'Jumlah anggota keluarga',false,3);
insert into public.question_bank(course_id,body,explanation) values(cid,'Keanggotaan koperasi bersifat...','Prinsip pertama: keanggotaan sukarela dan terbuka.') returning id into qid;
insert into public.question_options(question_id,body,is_correct,position) values (qid,'Wajib bagi semua warga',false,0), (qid,'Sukarela dan terbuka',true,1), (qid,'Hanya untuk pengurus',false,2), (qid,'Hanya untuk pemilik modal besar',false,3);
insert into public.question_bank(course_id,body,explanation) values(cid,'Pembentukan KDKMP didasarkan pada...','Dasarnya Inpres No. 9 Tahun 2025.') returning id into qid;
insert into public.question_options(question_id,body,is_correct,position) values (qid,'Inpres No. 9 Tahun 2025',true,0), (qid,'Perda kabupaten',false,1), (qid,'Keputusan RT/RW',false,2), (qid,'Surat edaran bank',false,3);
insert into public.question_bank(course_id,body,explanation) values(cid,'Target jumlah koperasi dalam Inpres tersebut sekitar...','Targetnya sekitar 80.000 koperasi desa/kelurahan.') returning id into qid;
insert into public.question_options(question_id,body,is_correct,position) values (qid,'800',false,0), (qid,'8.000',false,1), (qid,'80.000',true,2), (qid,'800.000',false,3);
insert into public.question_bank(course_id,body,explanation) values(cid,'Format nama yang benar untuk koperasi di sebuah desa adalah...','Diawali "Koperasi", lalu "Desa Merah Putih", lalu nama desa.') returning id into qid;
insert into public.question_options(question_id,body,is_correct,position) values (qid,'Desa Sukamaju Koperasi',false,0), (qid,'Koperasi Desa Merah Putih Sukamaju',true,1), (qid,'Merah Putih Sukamaju Desa',false,2), (qid,'Koperasi Sukamaju Mandiri Sejahtera',false,3);
insert into public.question_bank(course_id,body,explanation) values(cid,'Mana yang TIDAK termasuk kegiatan usaha yang disebut dalam Inpres?','Inpres menyebut kantor, sembako, simpan pinjam, klinik, apotek, cold storage, dan logistik.') returning id into qid;
insert into public.question_options(question_id,body,is_correct,position) values (qid,'Apotek desa',false,0), (qid,'Cold storage',false,1), (qid,'Simpan pinjam',false,2), (qid,'Pabrik otomotif',true,3);
insert into public.question_bank(course_id,body,explanation) values(cid,'Tugas utama Pengawas koperasi adalah...','Pengawas mengawasi pelaksanaan kebijakan dan pengelolaan koperasi.') returning id into qid;
insert into public.question_options(question_id,body,is_correct,position) values (qid,'Menjual barang di gerai',false,0), (qid,'Mengawasi kebijakan dan pengelolaan koperasi',true,1), (qid,'Mengurus kasir harian',false,2), (qid,'Menentukan harga pemasok',false,3);
end $$;
insert into public.quizzes(course_id,type,title,time_limit_min,passing_score,question_count,position)
select c.id, v.t::quiz_type, v.title, v.mins, v.pass, v.n, v.pos from public.courses c, (values
('pre','Pre-test Modul 1',10,0,5,1),('modul','Kuis Modul 1',15,70,10,2),('post','Post-test Modul 1',15,70,10,3),('final','Ujian Akhir Kursus 1',20,70,10,4)
) as v(t,title,mins,pass,n,pos) where c.slug='dasar-perkoperasian-kdkmp' on conflict (course_id,type,title) do nothing;
