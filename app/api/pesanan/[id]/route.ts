import { supabaseServer } from "@/lib/supabase/server";
import { rekonsiliasi } from "@/lib/payments/rekonsiliasi";
export const dynamic = "force-dynamic";

// Dipolling halaman bayar. Juga menjadi cadangan bila webhook terlambat / tidak terjangkau (mis. di localhost).
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return Response.json({ status: "unauthorized" }, { status: 401 });
  const { data: o } = await sb.from("orders").select("status").eq("id", params.id).maybeSingle(); // RLS: hanya milik sendiri
  if (!o) return Response.json({ status: "tidak_ada" }, { status: 404 });
  if (o.status !== "pending") return Response.json({ status: o.status });
  try { return Response.json({ status: await rekonsiliasi(params.id) }); } catch { return Response.json({ status: "pending" }); }
}
