import Link from "next/link";
import { SoraPixel, ShiroPixel } from "@/components/PixelCharacters";

export default function Home() {
  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-4">
        <div className="inline-flex items-center gap-2 rounded-pill border border-neutral-200/80 bg-white/70 px-4 py-1.5 text-xs font-semibold text-neutral-700 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-neutral-800/70 dark:text-neutral-300">
          <span className="h-2 w-2 rounded-full bg-merah" />
          <span>Koperasi Desa & Kelurahan Merah Putih</span>
        </div>

        <h1 className="mx-auto max-w-3xl text-4xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.1]">
          Belajar Nyata. <br />
          <span className="bg-gradient-to-r from-merah via-rose-600 to-amber-500 bg-clip-text text-transparent">
            Koperasi Mandiri & Terpercaya.
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-base sm:text-lg text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed">
          Pusat pelatihan terstruktur dan sertifikasi resmi bagi manajer, pengurus, pengawas, serta staf gerai Koperasi Merah Putih di seluruh nusantara.
        </p>

        {/* Action Buttons Apple Style */}
        <div className="flex flex-col sm:flex-row justify-center gap-3.5 pt-2">
          <Link href="/login" className="btn-apple-primary px-8 py-3.5 text-base">
            Masuk Portal Peserta →
          </Link>
          <Link href="/daftar" className="btn-apple-secondary px-8 py-3.5 text-base">
            Daftar Peserta Baru
          </Link>
        </div>
      </section>

      {/* Sora & Shiro 8-bit Assistant Showcase Banner */}
      <section className="glass-panel p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-pill bg-white/60 px-3 py-1 border border-black/5 dark:bg-white/5 dark:border-white/5 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Asisten Virtual 8-bit 『　　』 Siap Membantu
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Didampingi Teman Belajar Sora & Shiro
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-xl">
              Bingung alur modul atau mau tanya seputar ujian kelulusan? Klik karakter 8-bit Sora & Shiro di pojok kanan bawah untuk konsultasi langsung.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 rounded-2xl bg-white/60 p-3.5 border border-black/5 dark:bg-white/5 dark:border-white/5 shadow-inner">
            <div className="flex flex-col items-center gap-1">
              <div className="rounded-xl bg-amber-100/80 p-2 dark:bg-amber-950/50 shadow-sm">
                <SoraPixel size={40} />
              </div>
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">SORA</span>
            </div>
            <div className="text-sm font-bold text-neutral-300 dark:text-neutral-700">+</div>
            <div className="flex flex-col items-center gap-1">
              <div className="rounded-xl bg-indigo-100/80 p-2 dark:bg-indigo-950/50 shadow-sm">
                <ShiroPixel size={40} />
              </div>
              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400">SHIRO</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Glass Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel p-6 space-y-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-merah/10 text-merah text-lg">
            📘
          </div>
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white tracking-tight">
            Standar Nasional KDKMP
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Kurikulum praktis yang disesuaikan langsung dengan SOP kasir, stok gudang, dan pembukuan gerai desa.
          </p>
        </div>

        <div className="glass-panel p-6 space-y-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-apple-blue text-lg">
            🎯
          </div>
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white tracking-tight">
            Evaluasi Bertahap
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Kuis interaktif per modul untuk memastikan pemahaman operasional sebelum masuk ke ujian akhir.
          </p>
        </div>

        <div className="glass-panel p-6 space-y-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 text-lg">
            🛡️
          </div>
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white tracking-tight">
            Sertifikat Digital Valid
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Dilengkapi QR Code verifikasi instan publik untuk menjamin keabsahan tanda kelulusan pengelola.
          </p>
        </div>
      </section>

      {/* Public Verification Callout */}
      <section className="glass-panel p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-bold text-neutral-900 dark:text-white">
            Ingin memverifikasi keaslian sertifikat kelulusan?
          </h4>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Masukkan kode sertifikat unik untuk memeriksa data peserta dan status kelulusan secara real-time.
          </p>
        </div>
        <Link
          href="/verifikasi"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-apple-blue hover:text-apple-hover"
        >
          Cek Sertifikat Sekarang →
        </Link>
      </section>
    </div>
  );
}



