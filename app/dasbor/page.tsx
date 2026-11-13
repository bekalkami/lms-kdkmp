import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { logout } from "../actions";
import { ROLE_LABEL } from "@/lib/identity";
import RingkasanPeserta from "@/components/RingkasanPeserta";

export default async function Dasbor() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: p } = await sb.from("profiles").select("full_name, jabatan, role, regency, kdkmp(name, village)").eq("id", user!.id).single();
  if (!p) redirect("/login");
  const k: any = Array.isArray(p!.kdkmp) ? p!.kdkmp[0] : p!.kdkmp, admin = p!.role === "admin_wilayah" || p!.role === "admin_pusat";

  return (
    <div className="space-y-6">
      {/* Profile Banner */}
      <div className="flat-card border-l-4 border-l-merah space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-block border-2 border-merah bg-merah-muda/60 px-2 py-0.5 text-xs font-bebas uppercase tracking-wider text-merah-tua dark:bg-merah-tua/30 dark:text-red-300">
            {ROLE_LABEL[p!.role]}
          </span>
          <span className="text-xs font-semibold text-neutral-500">
            ID: {user!.id.slice(0, 8)}
          </span>
        </div>
        <h1 className="font-bebas text-3xl sm:text-4xl text-neutral-900 dark:text-white uppercase tracking-tight">
          Selamat Datang, {p!.full_name}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 capitalize">
          {p!.jabatan.replace("_", " ")}
          {k ? ` · ${k.name}, ${k.village}` : ""}
          {p!.regency ? ` · ${p!.regency}` : ""}
        </p>
      </div>

      {/* Admin Actions */}
      {admin && (
        <div className="space-y-3">
          <h2 className="font-bebas text-xl uppercase tracking-wider text-neutral-500">
            Menu Administrasi
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/admin/laporan" className="btn text-center">
              📊 Laporan & Ekspor Data
            </Link>
            <Link href="/admin/peserta/impor" className="btn-alt text-center">
              👥 Impor Peserta (CSV)
            </Link>
          </div>
          {p!.role === "admin_pusat" && (
            <Link href="/admin/konten" className="btn-alt text-center">
              🛠️ Kelola Kursus, Materi & Bank Soal
            </Link>
          )}
        </div>
      )}

      {/* Peserta Actions */}
      {p!.role === "peserta" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/kursus" className="btn sm:flex-1">
              📚 Buka Katalog Kursus →
            </Link>
            <Link href="/sertifikat" className="btn-alt sm:flex-1">
              🎓 Sertifikat Saya
            </Link>
          </div>

          <div className="pt-2">
            <h2 className="font-bebas text-xl uppercase tracking-wider text-neutral-500 mb-2">
              Progres Pembelajaran
            </h2>
            <RingkasanPeserta userId={user!.id} />
          </div>
        </div>
      )}

      {p!.role === "fasilitator" && (
        <div className="flat-card border-dashed">
          <p className="text-sm font-semibold text-neutral-500">
            Fitur peserta binaan dan forum tanya jawab fasilitator dijadwalkan pada Tahap E2.
          </p>
        </div>
      )}

      {/* Account Settings Grid */}
      <div className="flat-card pt-4 space-y-3">
        <h3 className="font-bebas text-lg uppercase tracking-wider text-neutral-500">
          Pengaturan Akun
        </h3>
        <div className="flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/akun/email" className="text-merah hover:underline">
            Verifikasi Email
          </Link>
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <Link href="/akun/sandi" className="text-merah hover:underline">
            Ganti Kata Sandi
          </Link>
        </div>
        <form action={logout} className="pt-2">
          <button className="btn-alt border-red-300 text-red-600 hover:bg-red-600 hover:text-white dark:border-red-900/50 dark:text-red-400">
            Keluar dari Sistem (Logout)
          </button>
        </form>
      </div>
    </div>
  );
}

