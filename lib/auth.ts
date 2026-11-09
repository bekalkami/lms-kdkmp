import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
// Gerbang untuk halaman/route admin. Pemeriksaan sebenarnya tetap di database (RLS); ini hanya mencegah halaman salah dibuka.
export async function requireAdmin() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await sb.from("profiles").select("role, regency, full_name").eq("id", user!.id).single();
  if (!profile || !["admin_wilayah", "admin_pusat"].includes(profile.role)) redirect("/dasbor");
  return { sb, user: user!, profile: profile! };
}
export async function audit(sb: ReturnType<typeof supabaseServer>, userId: string, action: string, detail: object) {
  await sb.from("audit_logs").insert({ user_id: userId, action, detail });
}
