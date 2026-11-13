import Link from "next/link";
import { login } from "../actions";
import { SoraPixel, ShiroPixel } from "@/components/PixelCharacters";

export default function Login({ searchParams }: { searchParams: { e?: string } }) {
  return (
    <div className="mx-auto max-w-md py-6">
      <div className="glass-panel p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex w-fit items-center gap-1.5 rounded-full bg-white/60 p-1.5 border border-black/5 dark:bg-white/10 dark:border-white/10">
            <SoraPixel size={24} />
            <ShiroPixel size={24} />
          </div>
          <span className="text-xs font-semibold tracking-wider text-merah uppercase">
            Portal Masuk Peserta
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Selamat Datang Kembali
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Akses materi pelatihan dan verifikasi progres kursus KDKMP.
          </p>
        </div>

        {searchParams.e && (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50/80 p-3 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {searchParams.e}
          </div>
        )}

        <form action={login} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Nomor WhatsApp atau Email
            </label>
            <input
              name="id"
              required
              className="input"
              inputMode="email"
              autoComplete="username"
              placeholder="08123456789 atau email@domain.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Kata Sandi
            </label>
            <input
              name="password"
              type="password"
              required
              className="input"
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <button className="btn-apple-primary w-full py-3 text-sm font-semibold mt-2">
            Masuk Sekarang →
          </button>
        </form>

        <div className="border-t border-neutral-200/60 dark:border-white/10 pt-4 text-center text-xs text-neutral-500 dark:text-neutral-400">
          Belum terdaftar sebagai peserta?{" "}
          <Link href="/daftar" className="font-semibold text-apple-blue hover:text-apple-hover">
            Daftar Akun Baru
          </Link>
        </div>
      </div>
    </div>
  );
}


