import { supabaseServer } from "@/lib/supabase/server";
export type Row = { user_id: string; full_name: string; jabatan: string; kdkmp: string | null; village: string | null; regency: string | null; province: string | null;
  lessons_total: number; lessons_done: number; avg_score: number | null; final_passed: boolean; certificate_number: string | null };
export type Filters = { course: string; province?: string; regency?: string; kdkmp?: string };

export async function fetchReport(sb: ReturnType<typeof supabaseServer>, f: Filters): Promise<Row[]> {
  const out: Row[] = [];
  for (let from = 0; ; from += 1000) { // PostgREST membatasi 1000 baris/permintaan -> ambil bertahap
    const { data, error } = await sb.rpc("report_participants", { p_course: f.course, p_province: f.province || null, p_regency: f.regency || null, p_kdkmp: f.kdkmp || null }).range(from, from + 999);
    if (error) throw new Error(error.message);
    out.push(...((data ?? []) as Row[]));
    if (!data || data.length < 1000) break;
  }
  return out;
}
export const progresPct = (r: Row) => (r.lessons_total ? Math.round((r.lessons_done / r.lessons_total) * 100) : 0);
export const statusOf = (r: Row) => r.certificate_number ? "Bersertifikat" : r.final_passed ? "Lulus ujian" : r.lessons_total && r.lessons_done >= r.lessons_total ? "Selesai belajar" : r.lessons_done > 0 ? "Sedang belajar" : "Belum mulai";
const avg = (a: number[]) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : null);
export function summarize(rows: Row[]) {
  const sel = rows.filter((r) => r.lessons_total > 0 && r.lessons_done >= r.lessons_total);
  return { peserta: rows.length, mulai: rows.filter((r) => r.lessons_done > 0).length, selesai: sel.length,
    tingkatSelesai: rows.length ? Math.round((sel.length / rows.length) * 100) : 0,
    lulus: rows.filter((r) => r.final_passed).length, rataNilai: avg(rows.flatMap((r) => (r.avg_score == null ? [] : [r.avg_score]))) };
}
export function perKdkmp(rows: Row[]) {
  const g = new Map<string, Row[]>();
  rows.forEach((r) => { const k = `${r.kdkmp ?? "(tanpa KDKMP)"}|${r.regency ?? ""}`; g.set(k, [...(g.get(k) ?? []), r]); });
  return [...g.entries()].map(([k, rs]) => ({ kdkmp: k.split("|")[0], kabupaten: k.split("|")[1], ...summarize(rs), rataProgres: avg(rs.map(progresPct)) ?? 0 }))
    .sort((a, b) => b.peserta - a.peserta);
}
export const HEADER_EKSPOR = ["Nama", "Jabatan", "KDKMP", "Desa/Kelurahan", "Kabupaten/Kota", "Provinsi", "Pelajaran selesai", "Total pelajaran", "Progres (%)", "Rata-rata nilai", "Lulus ujian akhir", "Nomor sertifikat", "Status"];
export const barisEkspor = (r: Row) => [r.full_name, r.jabatan.replace("_", " "), r.kdkmp, r.village, r.regency, r.province, r.lessons_done, r.lessons_total, progresPct(r), r.avg_score, r.final_passed ? "Ya" : "Tidak", r.certificate_number, statusOf(r)];
