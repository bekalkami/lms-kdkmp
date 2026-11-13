import Link from "next/link";
import { daftar } from "../actions";
import { JABATAN } from "@/lib/identity";
import { SoraPixel, ShiroPixel } from "@/components/PixelCharacters";

const F = ({ n, l, ...r }: { n: string; l: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
      {l} *
    </label>
    <input name={n} required className="input" {...r} />
  </div>
);

export default function Daftar({ searchParams }: { searchParams: { e?: string } }) {
  return (
    <div className="mx-auto max-w-lg py-6">
      <div className="glass-panel p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex w-fit items-center gap-1.5 rounded-full bg-white/60 p-1.5 border border-black/5 dark:bg-white/10 dark:border-white/10">
            <SoraPixel size={24} />
            <ShiroPixel size={24} />
          </div>
          <span className="text-xs font-semibold tracking-wider text-merah uppercase">
            Registrasi Peserta Baru
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Mulai Perjalanan Belajar
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Lengkapi data diri dan penempatan koperasi desa Anda untuk membuka modul pelatihan.
          </p>
        </div>

        {searchParams.e && (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50/80 p-3 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {searchParams.e}
          </div>
        )}

        <form action={daftar} className="space-y-4">
          <F n="nama" l="Nama Lengkap Sesuai KTP" autoComplete="name" placeholder="Budi Santoso" />
          <F n="id" l="Nomor WhatsApp atau Email Aktif" inputMode="email" autoComplete="username" placeholder="08123456789 atau email@domain.com" />
          <F n="password" l="Kata Sandi (Minimal 8 Karakter)" type="password" minLength={8} autoComplete="new-password" placeholder="••••••••" />

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Jabatan di Koperasi *
            </label>
            <select name="jabatan" required className="input" defaultValue="">
              <option value="" disabled>Pilih Jabatan Kepengurusan</option>
              {JABATAN.map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <F n="kdkmp" l="Nama KDKMP" placeholder="KDKMP Berkah Bersama" />
            <F n="desa" l="Desa / Kelurahan" placeholder="Desa Kemiri" />
            <F n="kabupaten" l="Kabupaten / Kota" placeholder="Kabupaten Purworejo" />
            <F n="provinsi" l="Provinsi" placeholder="Jawa Tengah" />
          </div>

          <button className="btn-apple-primary w-full py-3.5 text-sm font-semibold mt-4">
            Daftar & Masuk ke Kursus →
          </button>
        </form>

        <div className="border-t border-neutral-200/60 dark:border-white/10 pt-4 text-center text-xs text-neutral-500 dark:text-neutral-400">
          Sudah memiliki akun terdaftar?{" "}
          <Link href="/login" className="font-semibold text-apple-blue hover:text-apple-hover">
            Masuk ke Akun
          </Link>
        </div>
      </div>
    </div>
  );
}


