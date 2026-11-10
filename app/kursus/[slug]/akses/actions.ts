"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { buatQris } from "@/lib/payments/midtrans";

const balik = (slug: string, msg: string): never => redirect(`/kursus/${slug}/akses?e=${encodeURIComponent(msg)}`);
const keVerifikasi = (slug: string): never => redirect(`/akun/email?next=${encodeURIComponent(`/kursus/${slug}/akses`)}`);

export async function mulaiTrial(fd: FormData) {
  const slug = String(fd.get("slug")), courseId = String(fd.get("courseId"));
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: ok } = await sb.rpc("is_email_verified");
  if (!ok) keVerifikasi(slug);
  const { error } = await sb.rpc("start_trial", { p_course: courseId });
  if (error) balik(slug, error.code === "P0001" ? error.message : "Terjadi kesalahan. Coba lagi.");
  redirect(`/kursus/${slug}`);
}

export async function beliAkses(fd: FormData) {
  const slug = String(fd.get("slug")), courseId = String(fd.get("courseId"));
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: ok } = await sb.rpc("is_email_verified");
  if (!ok) keVerifikasi(slug);

  const admin = supabaseAdmin();
  // Harga SELALU dibaca dari database, tidak pernah dari form.
  const { data: c } = await admin.from("courses").select("id, price_idr, is_premium, published").eq("id", courseId).maybeSingle();
  if (!c || !c.published || !c.is_premium || c.price_idr <= 0) balik(slug, "Kursus ini tidak dijual.");

  // Pakai ulang pesanan yang masih berlaku (mencegah tumpukan QR)
  const { data: lama } = await admin.from("orders").select("id").eq("user_id", user!.id).eq("course_id", courseId)
    .eq("status", "pending").gt("expires_at", new Date().toISOString()).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (lama) redirect(`/bayar/${lama.id}`);

  const { data: o, error } = await admin.from("orders").insert({
    user_id: user!.id, course_id: courseId, amount_idr: c!.price_idr,
    expires_at: new Date(Date.now() + 15 * 60_000).toISOString(),
  }).select("id").single();
  if (error || !o) balik(slug, "Gagal membuat pesanan. Coba lagi.");

  const { data: p } = await sb.from("profiles").select("full_name").eq("id", user!.id).single();
  try {
    const { qrString } = await buatQris(o!.id, c!.price_idr, p?.full_name ?? "Peserta");
    await admin.from("orders").update({ qr_string: qrString }).eq("id", o!.id);
  } catch (e) {
    console.error("buat QRIS gagal:", e);
    await admin.from("orders").update({ status: "failed" }).eq("id", o!.id);
    balik(slug, "Gagal membuat kode QRIS. Coba lagi beberapa saat.");
  }
  redirect(`/bayar/${o!.id}`);
}
