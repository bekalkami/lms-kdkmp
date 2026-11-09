"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { normalizeIdentifier, JABATAN } from "@/lib/identity";

const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const fail = (path: string, msg: string): never => redirect(`${path}?e=${encodeURIComponent(msg)}`);

export async function login(fd: FormData) {
  const id = normalizeIdentifier(s(fd, "id"));
  if (!id) fail("/login", "Nomor WA atau email tidak valid.");
  const { error } = await supabaseServer().auth.signInWithPassword({ email: id!.email, password: s(fd, "password") });
  if (error) fail("/login", "Nomor/email atau kata sandi salah.");
  redirect("/dasbor");
}

export async function daftar(fd: FormData) {
  const id = normalizeIdentifier(s(fd, "id"));
  const password = s(fd, "password");
  const need = ["nama", "kdkmp", "desa", "kabupaten", "provinsi"].filter((k) => !s(fd, k));
  if (!id) fail("/daftar", "Nomor WA atau email tidak valid.");
  if (need.length) fail("/daftar", "Lengkapi semua isian bertanda *.");
  if (password.length < 8) fail("/daftar", "Kata sandi minimal 8 karakter.");
  if (!JABATAN.some(([v]) => v === s(fd, "jabatan"))) fail("/daftar", "Pilih jabatan.");
  // Peran TIDAK diambil dari form: semua pendaftar publik otomatis 'peserta' (diatur di trigger database).
  const { error } = await supabaseServer().auth.signUp({
    email: id!.email, password,
    options: { data: { full_name: s(fd, "nama"), phone: id!.phone, jabatan: s(fd, "jabatan"),
      kdkmp_name: s(fd, "kdkmp"), village: s(fd, "desa"), regency: s(fd, "kabupaten"), province: s(fd, "provinsi") } },
  });
  if (error) fail("/daftar", /registered/i.test(error.message) ? "Nomor/email sudah terdaftar. Silakan masuk." : "Pendaftaran gagal. Coba lagi.");
  redirect("/dasbor");
}

export async function logout() {
  await supabaseServer().auth.signOut();
  redirect("/login");
}
