"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

async function adminPusat() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: p } = await sb.from("profiles").select("role").eq("id", user.id).single();
  if (p?.role !== "admin_pusat") redirect("/dasbor");
  return sb;
}
const val = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const num = (fd: FormData, key: string, fallback = 0) => {
  const n = Number(fd.get(key));
  return Number.isFinite(n) ? n : fallback;
};
function refresh() { revalidatePath("/admin/konten"); revalidatePath("/kursus"); }

export async function simpanKursus(fd: FormData) {
  const sb = await adminPusat();
  const id = val(fd, "id");
  const payload = {
    slug: val(fd, "slug"), title: val(fd, "title"),
    description: val(fd, "description"), position: num(fd, "position"),
    published: fd.get("published") === "on",
  };
  if (!payload.slug || !payload.title) throw new Error("Slug dan judul kursus wajib diisi.");
  const result = id
    ? await sb.from("courses").update(payload).eq("id", id)
    : await sb.from("courses").insert(payload);
  if (result.error) throw new Error(result.error.message);
  refresh();
}

export async function hapusKursus(fd: FormData) {
  const sb = await adminPusat();
  const id = val(fd, "id");
  const { data: quizzes } = await sb.from("quizzes").select("id").eq("course_id", id);
  const quizIds = (quizzes ?? []).map(x => x.id);
  if (quizIds.length) {
    const { count, error } = await sb.from("attempts").select("id", { count: "exact", head: true }).in("quiz_id", quizIds);
    if (error) throw new Error(error.message);
    if ((count ?? 0) > 0) throw new Error("Kursus tidak dapat dihapus karena sudah memiliki riwayat ujian.");
  }
  const { count: certCount, error: certError } = await sb.from("certificates").select("id", { count: "exact", head: true }).eq("course_id", id);
  if (certError) throw new Error(certError.message);
  if ((certCount ?? 0) > 0) throw new Error("Kursus tidak dapat dihapus karena sudah memiliki sertifikat peserta.");
  const { error } = await sb.from("courses").delete().eq("id", id);
  if (error) throw new Error(error.message);
  refresh();
}

export async function simpanModul(fd: FormData) {
  const sb = await adminPusat();
  const id = val(fd, "id");
  const payload = { course_id: val(fd, "course_id"), title: val(fd, "title"), position: num(fd, "position") };
  if (!payload.title || !payload.course_id) throw new Error("Kursus dan nama modul wajib diisi.");
  const r = id ? await sb.from("modules").update(payload).eq("id", id) : await sb.from("modules").insert(payload);
  if (r.error) throw new Error(r.error.message);
  refresh();
}
export async function hapusModul(fd: FormData) {
  const sb = await adminPusat();
  const { error } = await sb.from("modules").delete().eq("id", val(fd, "id"));
  if (error) throw new Error(error.message);
  refresh();
}

export async function simpanMateri(fd: FormData) {
  const sb = await adminPusat();
  const id = val(fd, "id");
  const type = val(fd, "type");
  if (!["teks", "video", "pdf", "infografis"].includes(type)) throw new Error("Jenis materi tidak valid.");
  const payload = {
    module_id: val(fd, "module_id"), title: val(fd, "title"), type,
    content_md: val(fd, "content_md"), video_url: val(fd, "video_url") || null,
    file_url: val(fd, "file_url") || null, duration_min: Math.max(1, num(fd, "duration_min", 5)),
    position: num(fd, "position"),
  };
  if (!payload.module_id || !payload.title) throw new Error("Modul dan judul materi wajib diisi.");
  const r = id ? await sb.from("lessons").update(payload).eq("id", id) : await sb.from("lessons").insert(payload);
  if (r.error) throw new Error(r.error.message);
  refresh();
}
export async function hapusMateri(fd: FormData) {
  const sb = await adminPusat();
  const { error } = await sb.from("lessons").delete().eq("id", val(fd, "id"));
  if (error) throw new Error(error.message);
  refresh();
}

export async function simpanKuis(fd: FormData) {
  const sb = await adminPusat();
  const id = val(fd, "id"), type = val(fd, "type");
  if (!["pre", "modul", "post", "final"].includes(type)) throw new Error("Jenis kuis tidak valid.");
  const payload = {
    course_id: val(fd, "course_id"), type, title: val(fd, "title"),
    time_limit_min: Math.max(1, num(fd, "time_limit_min", 15)),
    passing_score: Math.min(100, Math.max(0, num(fd, "passing_score", 70))),
    question_count: Math.max(1, num(fd, "question_count", 10)),
    max_attempts: val(fd, "max_attempts") ? Math.max(1, num(fd, "max_attempts")) : null,
    position: num(fd, "position"),
  };
  if (!payload.course_id || !payload.title) throw new Error("Kursus dan judul kuis wajib diisi.");
  const r = id ? await sb.from("quizzes").update(payload).eq("id", id) : await sb.from("quizzes").insert(payload);
  if (r.error) throw new Error(r.error.message);
  refresh();
}
export async function hapusKuis(fd: FormData) {
  const sb = await adminPusat();
  const id = val(fd, "id");
  const { count, error: checkError } = await sb.from("attempts").select("id", { count: "exact", head: true }).eq("quiz_id", id);
  if (checkError) throw new Error(checkError.message);
  if ((count ?? 0) > 0) throw new Error("Kuis tidak dapat dihapus karena sudah memiliki riwayat ujian.");
  const { error } = await sb.from("quizzes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  refresh();
}

export async function simpanSoal(fd: FormData) {
  const sb = await adminPusat();
  const id = val(fd, "id");
  const course_id = val(fd, "course_id");
  const body = val(fd, "body"), explanation = val(fd, "explanation");
  const options = [1,2,3,4].map(i => val(fd, `option${i}`));
  const correct = num(fd, "correct", 1);
  if (!course_id || !body || options.some(x => !x) || ![1,2,3,4].includes(correct)) {
    throw new Error("Pertanyaan, empat pilihan, dan jawaban benar wajib diisi.");
  }
  let questionId = id;
  if (id) {
    const { data: attempts, error: aErr } = await sb.from("attempts").select("id").contains("question_ids", [id]).limit(1);
    if (aErr) throw new Error(aErr.message);
    if (attempts?.length) throw new Error("Soal ini sudah pernah digunakan dalam ujian. Buat soal baru agar riwayat peserta tetap utuh.");
    const { error } = await sb.from("question_bank").update({ course_id, body, explanation }).eq("id", id);
    if (error) throw new Error(error.message);
    const { error: delErr } = await sb.from("question_options").delete().eq("question_id", id);
    if (delErr) throw new Error(delErr.message);
  } else {
    const { data, error } = await sb.from("question_bank").insert({ course_id, body, explanation }).select("id").single();
    if (error) throw new Error(error.message);
    questionId = data.id;
  }
  const { error: optErr } = await sb.from("question_options").insert(options.map((body, i) => ({
    question_id: questionId, body, is_correct: i + 1 === correct, position: i,
  })));
  if (optErr) throw new Error(optErr.message);
  refresh();
}
export async function hapusSoal(fd: FormData) {
  const sb = await adminPusat();
  const id = val(fd, "id");
  const { data: attempts, error: aErr } = await sb.from("attempts").select("id").contains("question_ids", [id]).limit(1);
  if (aErr) throw new Error(aErr.message);
  if (attempts?.length) throw new Error("Soal sudah pernah digunakan dan tidak dapat dihapus agar riwayat ujian tetap utuh.");
  const { error } = await sb.from("question_bank").delete().eq("id", id);
  if (error) throw new Error(error.message);
  refresh();
}
