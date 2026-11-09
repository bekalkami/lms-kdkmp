import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { toCsv } from "@/lib/csv";
import { KOLOM_TEMPLATE } from "@/lib/impor";
export async function GET() {
  await requireAdmin();
  const body = toCsv([KOLOM_TEMPLATE,
    ["Siti Aminah", "081234567890", "manajer", "Koperasi Desa Merah Putih Sukamaju", "Sukamaju", "Kabupaten Purworejo", "Jawa Tengah", ""],
    ["Joko Widodo", "joko@contoh.id", "staf gerai", "Koperasi Desa Merah Putih Sukamaju", "Sukamaju", "Kabupaten Purworejo", "Jawa Tengah", ""]]);
  return new NextResponse(body, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="template-impor-peserta.csv"' } });
}
