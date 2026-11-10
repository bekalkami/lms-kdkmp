import { supabaseAdmin } from "@/lib/supabase/admin";
import { cekStatus } from "./midtrans";

export type StatusPesanan = "pending" | "paid" | "expired" | "failed" | "tidak_ada";

// Satu-satunya jalan menuju status "paid": status SELALU ditanyakan langsung ke gateway
// (bukan dipercaya dari isi webhook/browser), dan nominalnya harus cocok dengan pesanan.
export async function rekonsiliasi(orderId: string): Promise<StatusPesanan> {
  const admin = supabaseAdmin();
  const { data: o } = await admin.from("orders").select("id, amount_idr, status, expires_at").eq("id", orderId).maybeSingle();
  if (!o) return "tidak_ada";
  if (o.status !== "pending") return o.status as StatusPesanan;

  const s = await cekStatus(orderId);
  await admin.from("payment_events").insert({ order_id: orderId, provider: "midtrans", payload: s });
  const ts = String(s.transaction_status ?? "");
  const nominal = Math.round(parseFloat(String(s.gross_amount ?? "0")));

  if ((ts === "settlement" || (ts === "capture" && s.fraud_status === "accept")) && nominal === o.amount_idr) {
    await admin.rpc("fulfill_order", { p_order: orderId });
    return "paid";
  }
  if (["expire", "cancel", "deny", "failure"].includes(ts) || (!ts && new Date(o.expires_at) < new Date())) {
    const st = ts === "cancel" || ts === "deny" || ts === "failure" ? "failed" : "expired";
    await admin.from("orders").update({ status: st }).eq("id", orderId).eq("status", "pending");
    return st;
  }
  return "pending";
}
