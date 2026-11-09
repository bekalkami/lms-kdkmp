import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { logout } from "../actions";
import { ROLE_LABEL } from "@/lib/identity";
const MENU: Record<string, string[]> = {
  peserta: ["Kursus saya (Tahap B)", "Nilai & sertifikat (Tahap C-D)"],
  fasilitator: ["Peserta binaan (Tahap E)", "Forum tanya jawab (Tahap E)"],
  admin_wilayah: ["Laporan wilayah (Tahap E)", "Kelola peserta & impor CSV (Tahap E)"],
  admin_pusat: ["Kelola kursus & bank soal (Tahap B-C)", "Laporan nasional (Tahap E)"],
};
export default async function Dasbor() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: p } = await sb.from("profiles").select("full_name, jabatan, role, regency, kdkmp(name, village)").eq("id", user!.id).single();
  if (!p) redirect("/login");
  const k: any = Array.isArray(p!.kdkmp) ? p!.kdkmp[0] : p!.kdkmp;
  return (<div className="space-y-5">
    <div className="rounded-2xl bg-merah-muda p-4">
      <p className="text-sm font-bold uppercase text-merah-tua">{ROLE_LABEL[p!.role]}</p>
      <h1 className="text-2xl font-black">Halo, {p!.full_name}</h1>
      <p>{p!.jabatan.replace("_", " ")}{k ? ` · ${k.name}, ${k.village}` : ""}{p!.regency ? ` · ${p!.regency}` : ""}</p>
    </div>
    <ul className="space-y-3">{MENU[p!.role].map((m) => <li key={m} className="rounded-xl border-2 border-gray-200 p-4 font-semibold text-gray-500">{m}</li>)}</ul>
    <form action={logout}><button className="btn-alt">Keluar</button></form>
  </div>);
}
