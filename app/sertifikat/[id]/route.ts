import { NextResponse, type NextRequest } from "next/server";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import QRCode from "qrcode";
import { supabaseServer } from "@/lib/supabase/server";
import { JABATAN } from "@/lib/identity";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RED = rgb(0.784, 0.063, 0.18), GRAY = rgb(0.35, 0.35, 0.35), WHITE = rgb(1, 1, 1);
const safe = (s: string) => s.replace(/[^\x20-\x7E\u00A0-\u00FF]/g, "?"); // font standar PDF hanya Latin
function wrap(text: string, font: PDFFont, size: number, max: number) {
  const lines: string[] = []; let cur = "";
  for (const w of safe(text).split(/\s+/)) { const t = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(t, size) <= max) cur = t; else { if (cur) lines.push(cur); cur = w; } }
  if (cur) lines.push(cur); return lines;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));
  const { data: c } = await sb.from("certificates").select("*").eq("id", params.id).maybeSingle(); // RLS: milik sendiri/admin
  if (!c || c.revoked_at) return new NextResponse("Sertifikat tidak ditemukan.", { status: 404 });

  const W = 842, H = 595;
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Sertifikat ${c.number}`); pdf.setAuthor("LMS KDKMP");
  const page = pdf.addPage([W, H]);
  const reg = await pdf.embedFont(StandardFonts.Helvetica), bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const center = (t: string, f: PDFFont, size: number, y: number, color = rgb(0, 0, 0)) => {
    const s = safe(t); page.drawText(s, { x: (W - f.widthOfTextAtSize(s, size)) / 2, y, size, font: f, color }); };

  page.drawRectangle({ x: 20, y: 20, width: W - 40, height: H - 40, borderColor: RED, borderWidth: 4 });
  page.drawRectangle({ x: 30, y: 30, width: W - 60, height: H - 60, borderColor: RED, borderWidth: 1 });
  page.drawRectangle({ x: 30, y: H - 110, width: W - 60, height: 80, color: RED });
  page.drawText("LMS KDKMP", { x: 55, y: H - 78, size: 28, font: bold, color: WHITE });
  const sub = "Koperasi Desa/Kelurahan Merah Putih";
  page.drawText(sub, { x: W - 55 - reg.widthOfTextAtSize(sub, 12), y: H - 76, size: 12, font: reg, color: WHITE });

  center("SERTIFIKAT KOMPETENSI", bold, 30, H - 160, RED);
  center("Diberikan kepada", reg, 14, H - 195, GRAY);
  let ns = 38; const name = safe(c.recipient_name);
  while (ns > 18 && bold.widthOfTextAtSize(name, ns) > W - 160) ns -= 2;
  center(name, bold, ns, H - 245);
  page.drawLine({ start: { x: 150, y: H - 255 }, end: { x: W - 150, y: H - 255 }, thickness: 1, color: RED });
  center("telah dinyatakan LULUS dalam kursus", reg, 14, H - 285, GRAY);
  let y = H - 315;
  for (const ln of wrap(c.course_title, bold, 20, W - 160).slice(0, 3)) { center(ln, bold, 20, y); y -= 26; }
  const jab = JABATAN.find(([v]) => v === c.jabatan)?.[1];
  center([jab, c.kdkmp_name, c.score != null ? `Nilai ${c.score}` : null].filter(Boolean).join("  |  "), reg, 12, y - 6, GRAY);

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  const url = `${base}/verifikasi/${c.qr_token}`;
  const png = await pdf.embedPng(await QRCode.toBuffer(url, { margin: 1, width: 300 }));
  page.drawImage(png, { x: 50, y: 50, width: 95, height: 95 });
  page.drawText("Pindai untuk verifikasi keaslian", { x: 155, y: 128, size: 10, font: reg, color: GRAY });
  wrap(url, reg, 8, 330).slice(0, 2).forEach((l, i) => page.drawText(l, { x: 155, y: 114 - i * 10, size: 8, font: reg, color: GRAY }));
  page.drawText(`No. ${safe(c.number)}`, { x: 155, y: 82, size: 12, font: bold });
  const tgl = new Date(c.issued_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
  page.drawText(`Diterbitkan: ${tgl}`, { x: 155, y: 64, size: 10, font: reg, color: GRAY });
  page.drawLine({ start: { x: W - 270, y: 100 }, end: { x: W - 70, y: 100 }, thickness: 1, color: GRAY });
  const ttd = "Admin Pusat LMS KDKMP"; page.drawText(ttd, { x: W - 170 - reg.widthOfTextAtSize(ttd, 11) / 2, y: 84, size: 11, font: reg });

  const bytes = await pdf.save();
  return new NextResponse(new Uint8Array(bytes), { headers: {
    "Content-Type": "application/pdf", "Cache-Control": "private, no-store",
    "Content-Disposition": `attachment; filename="sertifikat-${String(c.number).replace(/\W+/g, "-")}.pdf"` } });
}
