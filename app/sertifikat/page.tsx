import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
export default async function Sertifikat() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await sb.from("certificates").select("id,number,qr_token,course_title,issued_at,revoked_at").eq("user_id", user!.id).order("issued_at", { ascending: false });
  return (<div className="space-y-5">
    <Link href="/dasbor" className="font-bold text-merah underline">← Dasbor</Link>
    <h1 className="text-2xl font-black">Sertifikat Saya</h1>
    {(data ?? []).length === 0 && <p className="rounded-xl bg-gray-100 p-4">Belum ada sertifikat. Selesaikan semua pelajaran, lalu lulus ujian akhir kursus.</p>}
    {(data ?? []).map((c) => (<div key={c.id} className="space-y-3 rounded-2xl border-2 border-gray-200 p-4">
      <b className="text-lg">{c.course_title}</b>
      <p className="text-base text-gray-600">{c.number} · {new Date(c.issued_at).toLocaleDateString("id-ID", { dateStyle: "long" })}</p>
      {c.revoked_at ? <p className="font-bold text-merah-tua">Sertifikat dicabut</p> : <>
        <a href={`/sertifikat/${c.id}`} className="btn">⬇ Unduh PDF</a>
        <Link href={`/verifikasi/${c.qr_token}`} className="btn-alt">Lihat halaman verifikasi</Link></>}
    </div>))}
  </div>);
}
