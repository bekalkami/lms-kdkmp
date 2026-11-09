"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
export async function gantiSandi(fd: FormData) {
  const a = String(fd.get("baru") ?? ""), b = String(fd.get("ulang") ?? "");
  const back = (m: string, k = "e"): never => redirect(`/akun/sandi?${k}=${encodeURIComponent(m)}`);
  if (a.length < 8) back("Kata sandi baru minimal 8 karakter.");
  if (a !== b) back("Pengulangan kata sandi tidak sama.");
  const { error } = await supabaseServer().auth.updateUser({ password: a });
  if (error) back("Gagal mengganti kata sandi. Coba masuk ulang lalu ulangi.");
  back("Kata sandi berhasil diganti.", "ok");
}
