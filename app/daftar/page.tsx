import Link from "next/link";
import { daftar } from "../actions";
import { JABATAN } from "@/lib/identity";

const F = ({ n, l, ...r }: { n: string; l: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
      {l} *
    </label>
    <input name={n} required className="input mt-1" {...r} />
  </div>
);

export default function Daftar({ searchParams }: { searchParams: { e?: string } }) {
  return (
    <div className="mx-auto max-w-lg py-6">
      <div className="flat-card space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-merah">Registrasi Akun</span>
          <h1 className="font-bebas text-4xl text-neutral-900 dark:text-white uppercase tracking-tight">
            Pendaftaran Peserta
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Lengkapi profil kepengurusan atau staf gerai KDKMP Anda untuk membuka kurikulum modul.
          </p>
        </div>

        {searchParams.e && (
          <div role="alert" className="border-l-4 border-merah bg-merah-muda/50 dark:bg-merah-tua/20 p-3 text-sm font-semibold text-merah-tua dark:text-red-300">
            {searchParams.e}
          </div>
        )}

        <form action={daftar} className="space-y-4">
          <F n="nama" l="Nama Lengkap Sesuai KTP" autoComplete="name" placeholder="Budi Santoso" />
          <F n="id" l="Nomor WhatsApp atau Email Aktif" inputMode="email" autoComplete="username" placeholder="08123456789 atau email@domain.com" />
          <F n="password" l="Kata Sandi (Minimal 8 Karakter)" type="password" minLength={8} autoComplete="new-password" placeholder="••••••••" />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Jabatan di Koperasi *
            </label>
            <select name="jabatan" required className="input mt-1" defaultValue="">
              <option value="" disabled>Pilih Jabatan Kepengurusan</option>
              {JABATAN.map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <F n="kdkmp" l="Nama KDKMP" placeholder="KDKMP Berkah Bersama" />
            <F n="desa" l="Desa / Kelurahan" placeholder="Desa Kemiri" />
            <F n="kabupaten" l="Kabupaten / Kota" placeholder="Kabupaten Purworejo" />
            <F n="provinsi" l="Provinsi" placeholder="Jawa Tengah" />
          </div>

          <button className="btn mt-4">
            Daftar & Mulai Belajar →
          </button>
        </form>

        <div className="border-t-2 border-neutral-100 dark:border-neutral-800 pt-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
          Sudah memiliki akun terdaftar?{" "}
          <Link href="/login" className="font-bold text-merah hover:underline">
            Masuk ke Akun
          </Link>
        </div>
      </div>
    </div>
  );
}

