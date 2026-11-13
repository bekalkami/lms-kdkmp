import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { logout } from "../actions";
import { ROLE_LABEL } from "@/lib/identity";
import RingkasanPeserta from "@/components/RingkasanPeserta";
import { SoraPixel, ShiroPixel } from "@/components/PixelCharacters";

export default async function Dasbor() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: p } = await sb.from("profiles").select("full_name, jabatan, role, regency, kdkmp(name, village)").eq("id", user!.id).single();
  if (!p) redirect("/login");
  const k: any = Array.isArray(p!.kdkmp) ? p!.kdkmp[0] : p!.kdkmp, admin = p!.role === "admin_wilayah" || p!.role === "admin_pusat";

  return (
    <div className="space-y-6">
      {/* Profile Glass Banner */}
      <div className="glass-panel p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-merah/10 px-3 py-1 text-xs font-semibold text-merah dark:bg-merah/20 dark:text-red-300">
            <span className="h-1.5 w-1.5 rounded-full bg-merah" />
            {ROLE_LABEL[p!.role]}
          </span>
          <span className="text-xs font-medium text-neutral-400">
            ID: {user!.id.slice(0, 8)}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              Selamat Datang, {p!.full_name}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 capitalize mt-0.5">
              {p!.jabatan.replace("_", " ")}
              {k ? ` · ${k.name}, ${k.village}` : ""}
              {p!.regency ? ` · ${p!.regency}` : ""}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-white/70 p-2 border border-black/5 dark:bg-white/10 dark:border-white/10">
            <SoraPixel size={26} />
            <ShiroPixel size={26} />
          </div>
        </div>

        {/* Shiro Tactical Status Tip */}
        <div className="mt-2 rounded-2xl bg-neutral-100/70 p-3 text-xs text-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-300 flex items-center gap-2.5">
          <ShiroPixel size={20} />
          <span>
            <b>Shiro Assistant:</b> Seluruh data kelulusan tersinkronisasi. Kamu dapat membuka diskusi modul kapan saja di tombol asisten bawah.
          </span>
        </div>
      </div>

      {/* Admin Actions */}
      {admin && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
            Menu Administrasi
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/admin/laporan" className="btn-apple-primary text-center">
              📊 Laporan & Ekspor Data
            </Link>
            <Link href="/admin/peserta/impor" className="btn-apple-secondary text-center">
              👥 Impor Peserta (CSV)
            </Link>
          </div>
          {p!.role === "admin_pusat" && (
            <Link href="/admin/konten" className="btn-apple-secondary text-center block mt-2">
              🛠️ Kelola Kursus, Materi & Bank Soal
            </Link>
          )}
        </div>
      )}

      {/* Peserta Actions */}
      {p!.role === "peserta" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/kursus" className="btn-apple-primary sm:flex-1 text-center py-3.5">
              📚 Buka Katalog Kursus →
            </Link>
            <Link href="/sertifikat" className="btn-apple-secondary sm:flex-1 text-center py-3.5">
              🎓 Sertifikat Saya
            </Link>
          </div>

          <div className="glass-panel p-6 space-y-3">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
              Ringkasan Progres Pembelajaran
            </h2>
            <RingkasanPeserta userId={user!.id} />
          </div>
        </div>
      )}

      {p!.role === "fasilitator" && (
        <div className="glass-panel p-4 text-center">
          <p className="text-xs font-medium text-neutral-500">
            Fitur peserta binaan dan forum tanya jawab fasilitator dijadwalkan pada Tahap E2.
          </p>
        </div>
      )}

      {/* Account Settings Glass Panel */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
          Pengaturan Akun & Keamanan
        </h3>
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <Link href="/akun/email" className="text-apple-blue hover:text-apple-hover">
            Verifikasi Email
          </Link>
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <Link href="/akun/sandi" className="text-apple-blue hover:text-apple-hover">
            Ganti Kata Sandi
          </Link>
        </div>
        <form action={logout} className="pt-1">
          <button className="rounded-pill border border-red-200 bg-red-50/50 px-5 py-2 text-xs font-semibold text-red-600 transition-all hover:bg-red-600 hover:text-white dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
            Keluar dari Sistem (Logout)
          </button>
        </form>
      </div>
    </div>
  );
}


