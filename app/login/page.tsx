import Link from "next/link";
import { login } from "../actions";

export default function Login({ searchParams }: { searchParams: { e?: string } }) {
  return (
    <div className="mx-auto max-w-md py-6">
      <div className="flat-card space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-merah">Portal Autentikasi</span>
          <h1 className="font-bebas text-4xl text-neutral-900 dark:text-white uppercase tracking-tight">
            Masuk ke Akun Anda
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Akses materi pelatihan, riwayat ujian, dan lembar kerja koperasi.
          </p>
        </div>

        {searchParams.e && (
          <div role="alert" className="border-l-4 border-merah bg-merah-muda/50 dark:bg-merah-tua/20 p-3 text-sm font-semibold text-merah-tua dark:text-red-300">
            {searchParams.e}
          </div>
        )}

        <form action={login} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Nomor WhatsApp atau Email
            </label>
            <input
              name="id"
              required
              className="input mt-1"
              inputMode="email"
              autoComplete="username"
              placeholder="08123456789 atau email@domain.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Kata Sandi
            </label>
            <input
              name="password"
              type="password"
              required
              className="input mt-1"
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <button className="btn mt-2">
            Masuk Sekarang →
          </button>
        </form>

        <div className="border-t-2 border-neutral-100 dark:border-neutral-800 pt-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
          Belum terdaftar sebagai peserta?{" "}
          <Link href="/daftar" className="font-bold text-merah hover:underline">
            Daftar Akun Baru
          </Link>
        </div>
      </div>
    </div>
  );
}

