import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
export default async function Kursus({ params }: { params: { slug: string } }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: c } = await sb.from("courses").select("id,title,description").eq("slug", params.slug).maybeSingle();
  if (!c) notFound();
  const [{ data: mods }, { data: dn }, { data: qz }] = await Promise.all([
    sb.from("modules").select("id,title,position, lessons(id,title,type,duration_min,position), worksheets(id)").eq("course_id", c!.id).order("position"),
    sb.from("lesson_progress").select("lesson_id").eq("user_id", user!.id),
    sb.from("quizzes").select("id,title,type,time_limit_min,passing_score").eq("course_id", c!.id).order("position"),
  ]);
  const done = new Set((dn ?? []).map((d) => d.lesson_id));
  const ICON: Record<string, string> = { teks: "📄", video: "🎬", pdf: "📑", infografis: "🖼️" };
  const all = (mods ?? []).flatMap((m: any) => m.lessons ?? []);
  const f = all.filter((l: any) => done.has(l.id)).length;
  return (<div className="space-y-5">
    <Link href="/kursus" className="font-bold text-merah underline">← Katalog</Link>
    <h1 className="text-2xl font-black">{c!.title}</h1><p>{c!.description}</p>
    {all.length > 0 && <p className="rounded-xl bg-merah-muda p-3 font-bold">Progres: {f} dari {all.length} pelajaran selesai</p>}
    {(mods ?? []).map((m: any) => (<section key={m.id} className="space-y-2">
      <h2 className="font-black text-merah">{m.title}</h2>
      {(m.lessons ?? []).length === 0 && <p className="text-gray-500">Materi sedang disiapkan.</p>}
      {[...(m.lessons ?? [])].sort((a: any, b: any) => a.position - b.position).map((l: any) => (
        <Link key={l.id} href={`/kursus/${params.slug}/${l.id}`} className="flex items-center gap-3 rounded-xl border-2 border-gray-200 p-4 active:border-merah">
          <span className="text-2xl">{done.has(l.id) ? "✅" : ICON[l.type]}</span>
          <span className="flex-1 font-semibold">{l.title}<span className="block text-sm font-normal text-gray-500">{l.duration_min} menit</span></span></Link>))}
      {(m.worksheets ?? []).length > 0 && <Link href={`/kursus/${params.slug}/lembar-kerja`} className="block rounded-xl border-2 border-dashed border-merah p-4 font-bold text-merah">📝 Lembar kerja modul ini</Link>}
    </section>))}
    {(qz ?? []).length > 0 && <section className="space-y-2"><h2 className="font-black text-merah">Kuis dan ujian</h2>
      {(qz ?? []).map((z: any) => (<Link key={z.id} href={`/ujian/${z.id}`} className="flex items-center gap-3 rounded-xl border-2 border-gray-200 p-4 active:border-merah">
        <span className="text-2xl">{z.type === "final" ? "🎓" : "🧪"}</span>
        <span className="flex-1 font-semibold">{z.title}<span className="block text-sm font-normal text-gray-500">{z.time_limit_min} menit · lulus ≥ {z.passing_score}</span></span></Link>))}</section>}
  </div>);
}
