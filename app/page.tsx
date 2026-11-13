import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 border-2 border-neutral-900 bg-neutral-100 px-3 py-1 font-bebas text-sm uppercase tracking-widest text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
            <span className="h-2 w-2 rounded-full bg-merah animate-ping" />
            Koperasi Desa / Kelurahan Merah Putih
          </div>
          <span className="border-2 border-neutral-900 bg-amber-400 px-2 py-1 font-bebas text-xs uppercase tracking-wider text-black">
            Karakter AI: Sora & Shiro Active
          </span>
        </div>

        <h1 className="font-bebas text-5xl sm:text-7xl leading-[0.95] tracking-tight text-neutral-900 dark:text-white uppercase">
          Belajar Nyata untuk <span className="text-merah underline decoration-4 underline-offset-8">Koperasi Maju</span> & Mandiri
        </h1>

        <p className="max-w-2xl text-lg text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed">
          Pusat pelatihan terstruktur dan sertifikasi resmi bagi manajer, pengurus, pengawas, serta staf gerai Koperasi Merah Putih di seluruh nusantara. Didukung bimbingan strategi belajar interaktif oleh Sora & Shiro.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href="/login" className="btn sm:w-auto px-8 flat-shadow">
            Masuk Portal Peserta →
          </Link>
          <Link href="/daftar" className="btn-alt sm:w-auto px-8">
            Daftar Peserta Baru
          </Link>
        </div>
      </section>

      {/* Sora & Shiro Virtual Assistant Banner */}
      <section className="border-2 border-neutral-900 bg-neutral-100 p-6 dark:border-neutral-700 dark:bg-neutral-900 flat-shadow">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="border border-amber-600 bg-amber-500 px-1.5 py-0.5 text-[11px] font-black uppercase text-white tracking-wider">
                SORA
              </span>
              <span className="border border-indigo-700 bg-indigo-600 px-1.5 py-0.5 text-[11px] font-black uppercase text-white tracking-wider">
                SHIRO
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                · Asisten Virtual 『　　』 Siap Mendampingi
              </span>
            </div>
            <h2 className="font-bebas text-3xl uppercase tracking-tight text-neutral-900 dark:text-white">
              Bingung Mulai Belajar Dari Mana atau Mau Tanya Ujian?
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-xl">
              Klik widget asisten virtual di pojok kanan bawah layar untuk konsultasi alur modul, tips kuis, dan cara klaim sertifikat resmi bersama Sora & Shiro.
            </p>
          </div>
          <div className="flex -space-x-3 shrink-0">
            <div className="grid h-16 w-16 place-items-center border-2 border-neutral-900 bg-amber-500 text-xl font-black text-white shadow-md">
              SORA
            </div>
            <div className="grid h-16 w-16 place-items-center border-2 border-neutral-900 bg-indigo-600 text-xl font-black text-white shadow-md">
              SHIRO
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="flat-card flex flex-col justify-between hover:border-neutral-900 dark:hover:border-neutral-300">
          <div className="space-y-2">
            <span className="font-bebas text-3xl text-merah">01. KURIKULUM</span>
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white">Standar Nasional KDKMP</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Materi disusun khusus sesuai tugas pokok dan fungsi tiap jabatan di koperasi desa.
            </p>
          </div>
        </div>

        <div className="flat-card flex flex-col justify-between hover:border-neutral-900 dark:hover:border-neutral-300">
          <div className="space-y-2">
            <span className="font-bebas text-3xl text-merah">02. EVALUASI</span>
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white">Ujian & Bank Soal</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Evaluasi bertahap untuk memastikan pemahaman operasional dan tata kelola kasir/stok.
            </p>
          </div>
        </div>

        <div className="flat-card flex flex-col justify-between hover:border-neutral-900 dark:hover:border-neutral-300">
          <div className="space-y-2">
            <span className="font-bebas text-3xl text-merah">03. VERIFIKASI</span>
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white">Sertifikat Digital Valid</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Dilengkapi QR Code verifikasi publik yang dapat dicek keasliannya secara instan.
            </p>
          </div>
        </div>
      </section>

      {/* Public Verification Callout */}
      <section className="flat-card border-l-4 border-l-merah flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-bold text-neutral-900 dark:text-white">Ingin memverifikasi keaslian sertifikat kelulusan?</h4>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">Masukkan kode sertifikat unik untuk memeriksa data peserta dan status kelulusan.</p>
        </div>
        <Link href="/verifikasi" className="inline-flex shrink-0 items-center gap-1.5 font-bebas text-base uppercase text-merah hover:underline tracking-wider">
          Cek Sertifikat Sekarang →
        </Link>
      </section>
    </div>
  );
}


