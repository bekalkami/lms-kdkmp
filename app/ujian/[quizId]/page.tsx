import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { mulaiUjian } from "../actions";
const NAMA: Record<string, string> = { pre: "Pre-test", modul: "Kuis modul", post: "Post-test", final: "Ujian akhir" };
export default async function Ujian({ params, searchParams }: { params: { quizId: string }; searchParams: { e?: string } }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: q } = await sb.from("quizzes").select("id,title,type,time_limit_min,passing_score,question_count,max_attempts,courses(slug,title)").eq("id", params.quizId).maybeSingle();
  if (!q) notFound();
  const { data: at } = await sb.from("attempts").select("id,submitted_at,score,passed,started_at").eq("quiz_id", q!.id).eq("user_id", user!.id).order("started_at", { ascending: false }).limit(5);
  const c: any = Array.isArray(q!.courses) ? q!.courses[0] : q!.courses;
  const jalan = (at ?? []).find((a) => !a.submitted_at);
  return (<div className="space-y-5">
    <Link href={`/kursus/${c.slug}`} className="font-bold text-merah underline">← {c.title}</Link>
    <h1 className="text-2xl font-black">{q!.title}</h1>
    {searchParams.e && <p role="alert" className="rounded-xl bg-merah-muda p-3 font-semibold text-merah-tua">{searchParams.e}</p>}
    <ul className="space-y-1 rounded-2xl bg-merah-muda p-4 font-semibold">
      <li>Jenis: {NAMA[q!.type]}</li><li>Jumlah soal: {q!.question_count} (diacak)</li><li>Waktu: {q!.time_limit_min} menit</li>
      <li>Nilai minimal lulus: {q!.passing_score}</li>{q!.max_attempts && <li>Batas percobaan: {q!.max_attempts}</li>}</ul>
    <p className="text-base text-gray-600">Waktu dihitung oleh server. Jawaban tersimpan otomatis tiap kamu memilih, dan terkumpul sendiri saat waktu habis.</p>
    <form action={mulaiUjian}><input type="hidden" name="quizId" value={q!.id} /><button className="btn">{jalan ? "Lanjutkan percobaan" : "Mulai"}</button></form>
    {(at ?? []).filter((a) => a.submitted_at).length > 0 && <section className="space-y-2"><h2 className="font-black text-merah">Riwayat</h2>
      {(at ?? []).filter((a) => a.submitted_at).map((a) => (<Link key={a.id} href={`/ujian/hasil/${a.id}`} className="flex justify-between rounded-xl border-2 border-gray-200 p-3 font-semibold">
        <span>{new Date(a.submitted_at!).toLocaleDateString("id-ID")}</span><span>{a.score} · {a.passed ? "✅ Lulus" : "❌ Belum lulus"}</span></Link>))}</section>}
  </div>);
}
