"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
const pesan = (e: { code?: string; message: string }) => (e.code === "P0001" ? e.message : "Terjadi kesalahan. Coba lagi.");

export async function mulaiUjian(fd: FormData) {
  const quizId = String(fd.get("quizId"));
  const { data, error } = await supabaseServer().rpc("start_attempt", { p_quiz: quizId });
  if (error) redirect(`/ujian/${quizId}?e=${encodeURIComponent(pesan(error))}`);
  redirect(`/ujian/mengerjakan/${data}`);
}
export async function simpanJawaban(attemptId: string, questionId: string, optionId: string) {
  await supabaseServer().rpc("save_answer", { p_attempt: attemptId, p_question: questionId, p_option: optionId });
}
export async function kumpulkan(fd: FormData) {
  const attemptId = String(fd.get("attemptId")), sb = supabaseServer();
  // kirim ulang semua jawaban di layar (cadangan jika ada simpan-per-soal yang gagal karena sinyal)
  for (const [k, v] of fd.entries()) if (k.startsWith("q_")) await sb.rpc("save_answer", { p_attempt: attemptId, p_question: k.slice(2), p_option: String(v) });
  await sb.rpc("submit_attempt", { p_attempt: attemptId });
  redirect(`/ujian/hasil/${attemptId}`);
}
