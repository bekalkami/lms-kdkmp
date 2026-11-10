"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { canonicalEmail, hashCode, kirimEmailKode, newCode, sameHash } from "@/lib/email-code";

const aman = (n: string) => (n.startsWith("/") && !n.startsWith("//") ? n : "/dasbor");
const back = (msg: string, next: string, extra = ""): never =>
  redirect(`/akun/email?e=${encodeURIComponent(msg)}&next=${encodeURIComponent(next)}${extra}`);

export async function kirimKode(fd: FormData) {
  const next = aman(String(fd.get("next") ?? ""));
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const raw = String(fd.get("email") ?? "").trim().toLowerCase();
  const canon = canonicalEmail(raw);
  if (!canon) back("Email tidak valid. Gunakan email asli, bukan nomor WA.", next);

  const admin = supabaseAdmin();
  const { data: dipakai } = await admin.from("email_verified").select("user_id").eq("email_canonical", canon!).maybeSingle();
  if (dipakai && dipakai.user_id !== user!.id) back("Email ini sudah dipakai akun lain.", next);

  const sejam = new Date(Date.now() - 3600_000).toISOString();
  const { data: recent } = await admin.from("email_codes").select("created_at").eq("user_id", user!.id)
    .gte("created_at", sejam).order("created_at", { ascending: false });
  if ((recent?.length ?? 0) >= 5) back("Terlalu banyak permintaan kode. Coba lagi dalam 1 jam.", next);
  if (recent?.[0] && Date.now() - new Date(recent[0].created_at).getTime() < 60_000)
    back("Tunggu 1 menit sebelum meminta kode lagi.", next);

  const code = newCode();
  await admin.from("email_codes").update({ used_at: new Date().toISOString() }).eq("user_id", user!.id).is("used_at", null);
  const { error } = await admin.from("email_codes").insert({
    user_id: user!.id, email: raw, email_canonical: canon, code_hash: hashCode(user!.id, code),
    expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
  });
  if (error) back("Gagal membuat kode. Coba lagi.", next);
  try { await kirimEmailKode(raw, code); } catch (e) { console.error("kirim email gagal:", e); back("Email gagal dikirim. Coba lagi nanti.", next); }
  redirect(`/akun/email?s=kode&email=${encodeURIComponent(raw)}&next=${encodeURIComponent(next)}`);
}

export async function verifikasiKode(fd: FormData) {
  const next = aman(String(fd.get("next") ?? ""));
  const kode = String(fd.get("kode") ?? "").replace(/\D/g, "");
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const admin = supabaseAdmin();
  const { data: row } = await admin.from("email_codes").select("*").eq("user_id", user!.id)
    .is("used_at", null).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!row || new Date(row.expires_at) < new Date()) back("Kode kedaluwarsa. Minta kode baru.", next);
  const stage = `&s=kode&email=${encodeURIComponent(row!.email)}`;
  if (row!.attempts >= 5) back("Terlalu banyak salah. Minta kode baru.", next);
  await admin.from("email_codes").update({ attempts: row!.attempts + 1 }).eq("id", row!.id);
  if (kode.length !== 6 || !sameHash(hashCode(user!.id, kode), row!.code_hash)) back("Kode salah.", next, stage);

  const now = new Date().toISOString();
  await admin.from("email_codes").update({ used_at: now }).eq("id", row!.id);
  const { error } = await admin.from("email_verified").upsert(
    { user_id: user!.id, email: row!.email, email_canonical: row!.email_canonical, verified_at: now }, { onConflict: "user_id" });
  if (error) back(/duplicate|unique/i.test(error.message) ? "Email ini sudah dipakai akun lain." : "Gagal menyimpan. Coba lagi.", next);
  redirect(next);
}
