
"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

const pesan = (e: { code?: string; message: string }) =>
  e.code === "P0001"
    ? e.message
    : "Terjadi kesalahan. Coba lagi.";

export async function mulaiUjian(fd: FormData) {
  const quizId = String(fd.get("quizId"));
  const sb = supabaseServer();

  const { data, error } = await sb.rpc("start_attempt", {
    p_quiz: quizId,
  });

  if (error) {
    redirect(
      `/ujian/${quizId}?e=${encodeURIComponent(pesan(error))}`
    );
  }

  redirect(`/ujian/mengerjakan/${data}`);
}

export async function simpanJawaban(
  attemptId: string,
  questionId: string,
  optionId: string
) {
  const sb = supabaseServer();

  const { error } = await sb.rpc("save_answer", {
    p_attempt: attemptId,
    p_question: questionId,
    p_option: optionId,
  });

  if (error) {
    throw new Error(pesan(error));
  }
}

export async function kumpulkan(fd: FormData) {
  const attemptId = String(fd.get("attemptId"));
  const sb = supabaseServer();

  if (!attemptId || attemptId === "null") {
    throw new Error("ID ujian tidak ditemukan.");
  }

  // Simpan ulang semua jawaban dari form
  const saves: Array<{
    questionId: string;
    optionId: string;
  }> = [];

  fd.forEach((value, key) => {
    if (key.startsWith("q_")) {
      saves.push({
        questionId: key.slice(2),
        optionId: String(value),
      });
    }
  });

  // Simpan jawaban sebelum ujian dikumpulkan
  for (const answer of saves) {
    const { error } = await sb.rpc("save_answer", {
      p_attempt: attemptId,
      p_question: answer.questionId,
      p_option: answer.optionId,
    });

    if (error) {
      throw new Error(pesan(error));
    }
  }

  // Kumpulkan ujian
  const { error } = await sb.rpc("submit_attempt", {
    p_attempt: attemptId,
  });

  if (error) {
    throw new Error(pesan(error));
  }

  redirect(`/ujian/hasil/${attemptId}`);
}
