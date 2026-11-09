"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

export async function tandaiSelesai(fd: FormData) {
  const lessonId = String(fd.get("lessonId")), slug = String(fd.get("slug")), next = String(fd.get("next") || "");
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  // upsert: aman ditekan berulang; RLS memastikan hanya milik sendiri
  await sb.from("lesson_progress").upsert({ user_id: user!.id, lesson_id: lessonId }, { onConflict: "user_id,lesson_id", ignoreDuplicates: true });
  revalidatePath(`/kursus/${slug}`); revalidatePath("/kursus");
  redirect(next ? `/kursus/${slug}/${next}` : `/kursus/${slug}`);
}
