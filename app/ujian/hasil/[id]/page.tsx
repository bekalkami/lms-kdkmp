import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
export default async function Hasil({ params }: { params: { id: string } }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: r, error } = await sb.rpc("get_result", { p_attempt: params.id });
  if (error || !r) redirect("/kursus");
  const { data: z } = await sb.from("quizzes").select("type").eq("id", r.quiz_id).maybeSingle();
  const { data: cert } = r.passed && z?.type === "final" ? await sb.from("certificates").select("id").eq("user_id", user!.id).order("issued_at").limit(1).maybeSingle() : { data: null };
  return (<div className="space-y-5">
    <div className={`rounded-2xl p-5 text-center ${r.passed ? "bg-green-100" : "bg-merah-muda"}`}>
      <p className="font-bold">{r.title}</p><p className="text-6xl font-black">{r.score}</p>
      <p className="text-xl font-black">{r.passed ? "✅ Lulus" : "❌ Belum lulus"} <span className="text-base font-semibold">(minimal {r.passing})</span></p></div>
    {cert && <a href={`/sertifikat/${cert.id}`} className="btn">🎓 Unduh sertifikat PDF</a>}
    <Link href={`/ujian/${r.quiz_id}`} className="btn">{r.passed ? "Kembali ke kuis" : "Coba lagi"}</Link>
    <h2 className="text-xl font-black text-merah">Pembahasan</h2>
    {r.items.map((it: any, i: number) => (<div key={i} className="space-y-2 rounded-2xl border-2 border-gray-200 p-4">
      <b>{i + 1}. {it.body}</b>
      {it.options.map((o: any) => (<p key={o.id} className={`rounded-lg px-3 py-2 ${o.correct ? "bg-green-100 font-bold" : it.chosen === o.id ? "bg-merah-muda line-through" : ""}`}>
        {o.correct ? "✅ " : it.chosen === o.id ? "❌ " : ""}{o.body}</p>))}
      {!it.chosen && <p className="font-semibold text-merah-tua">Tidak dijawab</p>}
      <p className="text-base text-gray-600">💡 {it.explanation}</p></div>))}
  </div>);
}
