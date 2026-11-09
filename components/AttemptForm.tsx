"use client";
import { useEffect, useRef, useState } from "react";
import { simpanJawaban, kumpulkan } from "@/app/ujian/actions";
type Q = { id: string; body: string; options: { id: string; body: string }[] };
export default function AttemptForm({ attemptId, deadline, serverNow, questions, saved }:
  { attemptId: string; deadline: string; serverNow: string; questions: Q[]; saved: Record<string, string> }) {
  const key = `jawaban:${attemptId}`;
  const [ans, setAns] = useState<Record<string, string>>(saved);
  const [left, setLeft] = useState(() => Math.max(0, new Date(deadline).getTime() - new Date(serverNow).getTime())); // jam server, bukan jam HP
  const form = useRef<HTMLFormElement>(null), sent = useRef(false);
  useEffect(() => { try { setAns((a) => ({ ...JSON.parse(localStorage.getItem(key) || "{}"), ...a })); } catch {} }, [key]);
  useEffect(() => {
    const end = Date.now() + left;
    const t = setInterval(() => { const r = end - Date.now(); setLeft(Math.max(0, r));
      if (r <= 0 && !sent.current) { sent.current = true; form.current?.requestSubmit(); } }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const pilih = (q: string, o: string) => {
    setAns((a) => { const n = { ...a, [q]: o }; try { localStorage.setItem(key, JSON.stringify(n)); } catch {} return n; });
    simpanJawaban(attemptId, q, o).catch(() => {}); // gagal karena sinyal? tidak masalah, dikirim ulang saat kumpul
  };
  const mm = String(Math.floor(left / 60000)).padStart(2, "0"), ss = String(Math.floor((left % 60000) / 1000)).padStart(2, "0");
  const n = Object.keys(ans).length;
  return (<form ref={form} action={kumpulkan} className="space-y-5" onSubmit={() => { sent.current = true; }}>
    <input type="hidden" name="attemptId" value={attemptId} />
    <div className="sticky top-0 z-10 flex justify-between rounded-xl bg-white/95 p-3 font-bold shadow">
      <span className={left < 60000 ? "text-merah" : ""}>⏱ {mm}:{ss}</span><span>Terjawab {n}/{questions.length}</span></div>
    {questions.map((q, i) => (<fieldset key={q.id} className="space-y-2 rounded-2xl border-2 border-gray-200 p-4">
      <legend className="px-1 font-bold">{i + 1}. {q.body}</legend>
      {q.options.map((o) => (<label key={o.id} className={`flex items-start gap-3 rounded-xl border-2 p-3 ${ans[q.id] === o.id ? "border-merah bg-merah-muda" : "border-gray-200"}`}>
        <input type="radio" className="mt-1 h-5 w-5 accent-[#C8102E]" name={`q_${q.id}`} value={o.id} checked={ans[q.id] === o.id} onChange={() => pilih(q.id, o.id)} />
        <span>{o.body}</span></label>))}
    </fieldset>))}
    <button className="btn">Kumpulkan jawaban</button>
  </form>);
}
