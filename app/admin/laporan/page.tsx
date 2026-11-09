import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { fetchReport, summarize, perKdkmp, progresPct, statusOf } from "@/lib/report";
export const dynamic = "force-dynamic";
type SP = { course?: string; province?: string; regency?: string; kdkmp?: string };
export default async function Laporan({ searchParams }: { searchParams: SP }) {
  const { sb, profile } = await requireAdmin();
  const { data: courses } = await sb.from("courses").select("id,title").order("position");
  const course = searchParams.course || courses?.[0]?.id;
  if (!course) return <p>Belum ada kursus.</p>;
  const { data: scope } = await sb.from("profiles").select("province,regency,kdkmp_id").eq("role", "peserta").limit(5000); // dibatasi RLS sesuai peran
  const uniq = (a: (string | null)[]) => [...new Set(a.filter(Boolean) as string[])].sort();
  const provs = uniq((scope ?? []).map((s) => s.province)), regs = uniq((scope ?? []).filter((s) => !searchParams.province || s.province === searchParams.province).map((s) => s.regency));
  const kids = [...new Set((scope ?? []).filter((s) => !searchParams.regency || s.regency === searchParams.regency).map((s) => s.kdkmp_id).filter(Boolean))] as string[];
  const { data: kd } = kids.length ? await sb.from("kdkmp").select("id,name").in("id", kids.slice(0, 500)).order("name") : { data: [] };
  const rows = await fetchReport(sb, { course, province: searchParams.province, regency: searchParams.regency, kdkmp: searchParams.kdkmp });
  const s = summarize(rows), grup = perKdkmp(rows);
  const qs = new URLSearchParams({ course, ...(searchParams.province && { province: searchParams.province }), ...(searchParams.regency && { regency: searchParams.regency }), ...(searchParams.kdkmp && { kdkmp: searchParams.kdkmp }) }).toString();
  const Sel = ({ n, v, opts, ph }: { n: string; v?: string; opts: { v: string; t: string }[]; ph: string }) => (
    <select name={n} defaultValue={v ?? ""} className="input"><option value="">{ph}</option>{opts.map((o) => <option key={o.v} value={o.v}>{o.t}</option>)}</select>);
  return (<div className="space-y-5">
    <Link href="/dasbor" className="font-bold text-merah underline">← Dasbor</Link>
    <h1 className="text-2xl font-black">Laporan {profile.role === "admin_wilayah" ? `· ${profile.regency ?? "wilayah"}` : "nasional"}</h1>
    <form className="space-y-2 rounded-2xl bg-merah-muda p-4">
      <Sel n="course" v={course} opts={(courses ?? []).map((c) => ({ v: c.id, t: c.title }))} ph="Kursus" />
      <Sel n="province" v={searchParams.province} opts={provs.map((p) => ({ v: p, t: p }))} ph="Semua provinsi" />
      <Sel n="regency" v={searchParams.regency} opts={regs.map((p) => ({ v: p, t: p }))} ph="Semua kabupaten/kota" />
      <Sel n="kdkmp" v={searchParams.kdkmp} opts={(kd ?? []).map((k) => ({ v: k.id, t: k.name }))} ph="Semua KDKMP" />
      <button className="btn">Terapkan filter</button></form>
    <div className="grid grid-cols-2 gap-3">{[["Peserta", s.peserta], ["Sudah mulai", s.mulai], ["Selesai belajar", `${s.selesai} (${s.tingkatSelesai}%)`], ["Lulus ujian akhir", s.lulus], ["Rata-rata nilai", s.rataNilai ?? "-"]].map(([k, v]) => (
      <div key={String(k)} className="rounded-2xl border-2 border-gray-200 p-3"><p className="text-sm font-bold text-gray-500">{k}</p><p className="text-2xl font-black text-merah">{v}</p></div>))}</div>
    <div className="grid grid-cols-2 gap-3"><a className="btn" href={`/admin/laporan/ekspor?format=xlsx&${qs}`}>⬇ Excel (.xlsx)</a><a className="btn-alt" href={`/admin/laporan/ekspor?format=csv&${qs}`}>⬇ CSV</a></div>
    <h2 className="font-black text-merah">Per KDKMP</h2>
    <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-base"><thead><tr className="border-b-2 border-merah"><th className="py-2">KDKMP</th><th>Peserta</th><th>Progres</th><th>Nilai</th><th>Lulus</th></tr></thead>
      <tbody>{grup.slice(0, 50).map((g, i) => (<tr key={i} className="border-b"><td className="py-2 font-semibold">{g.kdkmp}<span className="block text-sm font-normal text-gray-500">{g.kabupaten}</span></td><td>{g.peserta}</td><td>{g.rataProgres}%</td><td>{g.rataNilai ?? "-"}</td><td>{g.lulus}</td></tr>))}</tbody></table></div>
    <h2 className="font-black text-merah">Peserta ({Math.min(rows.length, 100)} dari {rows.length})</h2>
    <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-base"><thead><tr className="border-b-2 border-merah"><th className="py-2">Nama</th><th>Progres</th><th>Nilai</th><th>Status</th></tr></thead>
      <tbody>{rows.slice(0, 100).map((r) => (<tr key={r.user_id} className="border-b"><td className="py-2 font-semibold">{r.full_name}<span className="block text-sm font-normal text-gray-500">{r.jabatan.replace("_", " ")} · {r.kdkmp ?? "-"}</span></td><td>{progresPct(r)}%</td><td>{r.avg_score ?? "-"}</td><td>{statusOf(r)}</td></tr>))}</tbody></table></div>
    <p className="text-sm text-gray-500">Gunakan Excel (.xlsx) untuk dibuka di Excel. CSV cocok untuk aplikasi lain. Ekspor memuat semua baris.</p>
  </div>);
}
