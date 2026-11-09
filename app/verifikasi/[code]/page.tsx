import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { JABATAN } from "@/lib/identity";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };
export default async function Verifikasi({ params }: { params: { code: string } }) {
  let code = params.code; try { code = decodeURIComponent(code); } catch {}
  const { data: r } = await supabaseServer().rpc("verify_certificate", { p_code: code.slice(0, 80) });
  if (!r?.valid) return (<div className="space-y-4 text-center">
    <div className="rounded-2xl bg-merah-muda p-6"><p className="text-5xl">❌</p><h1 className="text-2xl font-black text-merah-tua">Sertifikat tidak ditemukan</h1>
      <p>Kode salah, atau sertifikat sudah dicabut. Periksa kembali kode pada sertifikat.</p></div>
    <Link href="/verifikasi" className="btn-alt">Coba kode lain</Link></div>);
  const rows: [string, string | null][] = [["Nama", r.name], ["Kursus", r.course], ["Jabatan", JABATAN.find(([v]) => v === r.jabatan)?.[1] ?? null],
    ["KDKMP", r.kdkmp], ["Nomor", r.number], ["Diterbitkan", new Date(r.issued_at).toLocaleDateString("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" })]];
  return (<div className="space-y-4">
    <div className="rounded-2xl bg-green-100 p-6 text-center"><p className="text-5xl">✅</p><h1 className="text-2xl font-black">Sertifikat ASLI dan berlaku</h1></div>
    <dl className="space-y-2">{rows.filter(([, v]) => v).map(([k, v]) => (<div key={k} className="rounded-xl border-2 border-gray-200 p-3"><dt className="text-sm font-bold text-gray-500">{k}</dt><dd className="font-semibold">{v}</dd></div>))}</dl>
    {r.masked && <p className="text-base text-gray-600">Nama disamarkan untuk menjaga data pribadi. Pindai QR pada sertifikat untuk data lengkap.</p>}
  </div>);
}
