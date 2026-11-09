import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
export default async function RingkasanPeserta({ userId }: { userId: string }) {
  const sb = supabaseServer();
  const [en, ls, dn, at, ce] = await Promise.all([
    sb.from("enrollments").select("course_id, courses(slug,title)").eq("user_id", userId),
    sb.from("lessons").select("id, modules(course_id)"),
    sb.from("lesson_progress").select("lesson_id").eq("user_id", userId),
    sb.from("attempts").select("score,passed,quizzes(title)").eq("user_id", userId).not("submitted_at", "is", null).order("submitted_at", { ascending: false }).limit(3),
    sb.from("certificates").select("id", { count: "exact", head: true }).eq("user_id", userId).is("revoked_at", null),
  ]);
  const done = new Set((dn.data ?? []).map((d) => d.lesson_id)), tot: Record<string, number> = {}, fin: Record<string, number> = {};
  (ls.data ?? []).forEach((l: any) => { const m = Array.isArray(l.modules) ? l.modules[0] : l.modules; if (!m) return; tot[m.course_id] = (tot[m.course_id] ?? 0) + 1; if (done.has(l.id)) fin[m.course_id] = (fin[m.course_id] ?? 0) + 1; });
  const one = (x: any) => (Array.isArray(x) ? x[0] : x);
  return (<div className="space-y-4">
    <section className="space-y-2"><h2 className="font-black text-merah">Kursus berjalan</h2>
      {(en.data ?? []).length === 0 && <p className="rounded-xl bg-gray-100 p-3">Belum ada. Mulai dari katalog kursus.</p>}
      {(en.data ?? []).map((e: any) => { const c = one(e.courses), t = tot[e.course_id] ?? 0, f = fin[e.course_id] ?? 0, pct = t ? Math.round((f / t) * 100) : 0;
        return (<Link key={e.course_id} href={`/kursus/${c.slug}`} className="block rounded-xl border-2 border-gray-200 p-3"><b>{c.title}</b>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-200"><div className="h-full bg-merah" style={{ width: `${pct}%` }} /></div><span className="text-sm font-semibold">{pct}%</span></Link>); })}</section>
    {(at.data ?? []).length > 0 && <section className="space-y-2"><h2 className="font-black text-merah">Nilai terbaru</h2>
      {(at.data ?? []).map((a: any, i) => (<p key={i} className="flex justify-between rounded-xl border-2 border-gray-200 p-3 font-semibold"><span>{one(a.quizzes)?.title}</span><span>{a.score} {a.passed ? "✅" : "❌"}</span></p>))}</section>}
    <p className="rounded-xl bg-merah-muda p-3 font-bold">🎓 Sertifikat dimiliki: {ce.count ?? 0}</p>
  </div>);
}
