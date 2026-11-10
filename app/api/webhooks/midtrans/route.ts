import { tandaTanganValid } from "@/lib/payments/midtrans";
import { rekonsiliasi } from "@/lib/payments/rekonsiliasi";
export const dynamic = "force-dynamic";

// Daftarkan di Midtrans: Settings → Configuration → Payment Notification URL → https://DOMAIN/api/webhooks/midtrans
export async function POST(req: Request) {
  let b: any;
  try { b = await req.json(); } catch { return new Response("bad request", { status: 400 }); }
  if (!tandaTanganValid(b)) return new Response("invalid signature", { status: 401 });
  try { await rekonsiliasi(String(b.order_id)); } catch (e) { console.error("webhook midtrans:", e); return new Response("error", { status: 500 }); } // 500 → Midtrans akan mengirim ulang
  return Response.json({ ok: true });
}
