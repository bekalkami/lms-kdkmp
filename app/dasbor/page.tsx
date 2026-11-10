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
  return (<div className="space-y-5">
    <div className="rounded-2xl bg-merah-muda p-4">
      <p className="text-sm font-bold uppercase text-merah-tua">{ROLE_LABEL[p!.role]}</p>
      <h1 className="text-2xl font-black">Halo, {p!.full_name}</h1>
      <p>{p!.jabatan.replace("_", " ")}{k ? ` · ${k.name}, ${k.village}` : ""}{p!.regency ? ` · ${p!.regency}` : ""}</p></div>
    {admin && <div className="space-y-3"><Link href="/admin/laporan" className="btn">📊 Laporan & ekspor</Link><Link href="/admin/peserta/impor" className="btn-alt">👥 Impor peserta (CSV)</Link>{p!.role === "admin_pusat" && <Link href="/admin/konten" className="btn-alt">🛠️ Kelola kursus, materi & bank soal</Link>}</div>}
    {p!.role === "peserta" && <><Link href="/kursus" className="btn">📚 Buka Katalog Kursus</Link><RingkasanPeserta userId={user!.id} /><Link href="/sertifikat" className="btn-alt">🎓 Sertifikat Saya</Link></>}
    {p!.role === "fasilitator" && <p className="rounded-xl border-2 border-gray-200 p-4 font-semibold text-gray-500">Peserta binaan dan forum tanya jawab: Tahap E2</p>}
    <Link href="/akun/email" className="block text-center font-bold text-merah underline">Verifikasi email</Link>
    <Link href="/akun/sandi" className="block text-center font-bold text-merah underline">Ganti kata sandi</Link>
    <form action={logout}><button className="btn-alt">Keluar</button></form>
  </div>);
}
