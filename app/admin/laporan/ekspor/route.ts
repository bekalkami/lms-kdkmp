import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin, audit } from "@/lib/auth";
import { fetchReport, HEADER_EKSPOR, barisEkspor } from "@/lib/report";
import { toCsv } from "@/lib/csv";
import { buildXlsx } from "@/lib/xlsx";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const { sb, user } = await requireAdmin();
  const p = req.nextUrl.searchParams, course = p.get("course") ?? "", fmt = p.get("format") === "csv" ? "csv" : "xlsx";
  if (!/^[0-9a-f-]{36}$/i.test(course)) return new NextResponse("Kursus tidak valid.", { status: 400 });
  const rows = await fetchReport(sb, { course, province: p.get("province") ?? undefined, regency: p.get("regency") ?? undefined, kdkmp: p.get("kdkmp") ?? undefined });
  await audit(sb, user.id, "ekspor_laporan", { format: fmt, baris: rows.length, course });
  const data = rows.map(barisEkspor), name = `laporan-lms-kdkmp-${new Date().toISOString().slice(0, 10)}.${fmt}`;
  const body = fmt === "csv" ? toCsv([HEADER_EKSPOR, ...data]) : await buildXlsx("Laporan", HEADER_EKSPOR, data);
  return new NextResponse(typeof body === "string" ? body : new Uint8Array(body), { headers: {
    "Content-Type": fmt === "csv" ? "text/csv; charset=utf-8" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": `attachment; filename="${name}"`, "Cache-Control": "private, no-store" } });
}
