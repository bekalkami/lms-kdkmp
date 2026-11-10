import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { JABATAN } from "@/lib/identity";
export default async function Katalog() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const [me, cs, ls, dn] = await Promise.all([
    sb.from("profiles").select("jabatan").eq("id", user!.id).single(),
    sb.from("courses").select("id,slug,title,description,jabatan_target,is_premium,price_idr").eq("published", true).order("position"),
    sb.from("lessons").select("id, modules(course_id)"),
    sb.from("lesson_progress").select("lesson_id").eq("user_id", user!.id),
  ]);
  const done = new Set((dn.data ?? []).map((d) => d.lesson_id));
  const total: Record<string, number> = {}, fin: Record<string, number> = {};
  (ls.data ?? []).forEach((l: any) => { const m = Array.isArray(l.modules) ? l.modules[0] : l.modules; if (!m) return;
    total[m.course_id] = (total[m.course_id] ?? 0) + 1; if (done.has(l.id)) fin[m.course_id] = (fin[m.course_id] ?? 0) + 1; });
  const jab = me.data?.jabatan; const all = cs.data ?? [];
  const mine = all.filter((c) => c.jabatan_target.includes(jab)); const rest = all.filter((c) => !c.jabatan_target.includes(jab));
  const Card = ({ c }: { c: (typeof all)[number] }) => { const t = total[c.id] ?? 0, f = fin[c.id] ?? 0, pct = t ? Math.round((f / t) * 100) : 0;
    return (<Link href={`/kursus/${c.slug}`} className="block rounded-2xl border-2 border-gray-200 p-4 active:border-merah">
      <b className="text-lg">{c.title}</b>{c.is_premium && <span className="ml-2 rounded-full bg-merah-muda px-2 py-0.5 text-xs font-black text-merah-tua">PREMIUM</span>}<p className="text-base text-gray-600">{c.description}</p>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-200"><div className="h-full bg-merah" style={{ width: `${pct}%` }} /></div>
      <p className="mt-1 text-sm font-semibold">{t ? `${f}/${t} pelajaran · ${pct}%` : "Materi sedang disiapkan"}</p></Link>); };
  return (<div className="space-y-5">
    <Link href="/dasbor" className="font-bold text-merah underline">← Dasbor</Link>
    <h1 className="text-2xl font-black">Katalog Kursus</h1>
    <h2 className="font-black text-merah">Jalur untuk {JABATAN.find(([v]) => v === jab)?.[1] ?? "kamu"}</h2>
    <div className="space-y-3">{mine.map((c) => <Card key={c.id} c={c} />)}</div>
    {rest.length > 0 && <><h2 className="font-black text-gray-500">Kursus lainnya</h2><div className="space-y-3">{rest.map((c) => <Card key={c.id} c={c} />)}</div></>}
  </div>);
}
