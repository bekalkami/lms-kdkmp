import { createHash, randomInt, timingSafeEqual } from "crypto";

// Email kanonik: huruf kecil; Gmail dibuang titik dan +alias supaya satu orang tidak bisa klaim banyak trial.
export function canonicalEmail(raw: string): string | null {
  const v = raw.trim().toLowerCase();
  if (v.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return null;
  const [l, d0] = v.split("@");
  let local = l, domain = d0;
  if (domain.endsWith("lmskdkmp.local")) return null; // email internal nomor WA bukan email asli
  if (domain === "googlemail.com") domain = "gmail.com";
  if (domain === "gmail.com") local = local.split("+")[0].replace(/\./g, "");
  return local ? `${local}@${domain}` : null;
}

export const newCode = () => String(randomInt(0, 1_000_000)).padStart(6, "0");

export function hashCode(userId: string, code: string) {
  const pepper = process.env.EMAIL_CODE_PEPPER;
  if (!pepper) throw new Error("EMAIL_CODE_PEPPER belum diisi.");
  return createHash("sha256").update(`${pepper}:${userId}:${code}`).digest("hex");
}
export function sameHash(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

// Kirim lewat Resend (HTTP). Mengganti penyedia cukup mengubah fungsi ini.
export async function kirimEmailKode(to: string, code: string) {
  const key = process.env.RESEND_API_KEY, from = process.env.EMAIL_FROM;
  if (!key || !from) throw new Error("RESEND_API_KEY / EMAIL_FROM belum diisi.");
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from, to: [to], subject: `Kode verifikasi LMS KDKMP: ${code}`,
      text: `Kode verifikasi Anda: ${code}\n\nBerlaku 10 menit. Jangan bagikan kode ini kepada siapa pun.\nAbaikan email ini jika Anda tidak memintanya.`,
    }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}`);
}
