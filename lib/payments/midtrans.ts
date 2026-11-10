import { createHash, timingSafeEqual } from "crypto";
// Adapter gateway: Midtrans Core API (QRIS). Mengganti gateway = mengganti file ini + route webhook.
const BASE = () => (process.env.MIDTRANS_IS_PRODUCTION === "true" ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com");
const auth = () => {
  if (!process.env.MIDTRANS_SERVER_KEY) throw new Error("MIDTRANS_SERVER_KEY belum diisi.");
  return "Basic " + Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString("base64");
};

export async function buatQris(orderId: string, amount: number, nama: string): Promise<{ qrString: string }> {
  const r = await fetch(`${BASE()}/v2/charge`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: auth() },
    body: JSON.stringify({
      payment_type: "qris",
      transaction_details: { order_id: orderId, gross_amount: amount },
      qris: { acquirer: "gopay" },
      customer_details: { first_name: nama.slice(0, 50) },
    }),
  });
  const j: any = await r.json().catch(() => ({}));
  if (!["200", "201"].includes(String(j.status_code)) || !j.qr_string) throw new Error(j.status_message ?? `Midtrans ${r.status}`);
  return { qrString: String(j.qr_string) };
}

export async function cekStatus(orderId: string): Promise<any> {
  const r = await fetch(`${BASE()}/v2/${encodeURIComponent(orderId)}/status`, {
    headers: { Accept: "application/json", Authorization: auth() }, cache: "no-store",
  });
  return r.json().catch(() => ({}));
}

// signature_key = SHA512(order_id + status_code + gross_amount + ServerKey)
export function tandaTanganValid(b: any): boolean {
  if (!b || !b.order_id || !b.signature_key) return false;
  const h = createHash("sha512").update(`${b.order_id}${b.status_code}${b.gross_amount}${process.env.MIDTRANS_SERVER_KEY ?? ""}`).digest("hex");
  const x = Buffer.from(h), y = Buffer.from(String(b.signature_key));
  return x.length === y.length && timingSafeEqual(x, y);
}
