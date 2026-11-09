import { randomInt } from "node:crypto";
import { normalizeIdentifier } from "@/lib/identity";
export const MAX_BARIS = 100;
export const KOLOM_TEMPLATE = ["nama", "no_wa_atau_email", "jabatan", "nama_kdkmp", "desa_kelurahan", "kabupaten_kota", "provinsi", "kata_sandi"];
const ALIAS: Record<string, string> = { nama: "nama", nama_lengkap: "nama", no_wa_atau_email: "id", no_wa: "id", nomor_wa: "id", wa: "id", email: "id", id: "id", jabatan: "jabatan",
  nama_kdkmp: "kdkmp", kdkmp: "kdkmp", desa_kelurahan: "desa", desa: "desa", kelurahan: "desa", kabupaten_kota: "kabupaten", kabupaten: "kabupaten", kota: "kabupaten",
  provinsi: "provinsi", kata_sandi: "sandi", sandi: "sandi", password: "sandi" };
const JAB: Record<string, string> = { manajer: "manajer", pengurus: "pengurus", pengawas: "pengawas", staf_gerai: "staf_gerai", stafgerai: "staf_gerai", staf: "staf_gerai" };
export type Rec = { baris: number; nama: string; email: string; phone: string | null; jabatan: string; kdkmp: string; desa: string; kabupaten: string; provinsi: string; sandi?: string };
export type Gagal = { baris: number; nama: string; identitas: string; pesan: string };
const norm = (h: string) => h.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

export function parseRecords(csv: string[][], scopeRegency?: string | null): { records: Rec[]; errors: Gagal[]; fatal?: string } {
  if (csv.length < 2) return { records: [], errors: [], fatal: "Berkas kosong atau hanya berisi judul kolom." };
  const idx: Record<string, number> = {};
  csv[0].forEach((h, i) => { const k = ALIAS[norm(h)]; if (k && !(k in idx)) idx[k] = i; });
  const hilang = ["nama", "id", "jabatan", "kdkmp", "desa", "kabupaten", "provinsi"].filter((k) => !(k in idx));
  if (hilang.length) return { records: [], errors: [], fatal: `Kolom wajib tidak ditemukan: ${hilang.join(", ")}. Gunakan template.` };
  if (csv.length - 1 > MAX_BARIS) return { records: [], errors: [], fatal: `Maksimal ${MAX_BARIS} baris per unggahan (berkasmu ${csv.length - 1}). Bagi menjadi beberapa berkas.` };
  const records: Rec[] = [], errors: Gagal[] = [], seen = new Set<string>();
  csv.slice(1).forEach((r, n) => {
    const baris = n + 2, g = (k: string) => (r[idx[k]] ?? "").trim();
    const nama = g("nama"), id = g("id"), bad = (pesan: string) => errors.push({ baris, nama, identitas: id, pesan });
    const ident = normalizeIdentifier(id), jab = JAB[g("jabatan").toLowerCase().replace(/[\s-]+/g, "_")];
    if (!nama) return bad("Nama kosong.");
    if (!ident) return bad("Nomor WA/email tidak valid.");
    if (!jab) return bad("Jabatan harus: manajer, pengurus, pengawas, atau staf gerai.");
    if (!g("kdkmp") || !g("desa") || !g("kabupaten") || !g("provinsi")) return bad("KDKMP, desa/kelurahan, kabupaten, dan provinsi wajib diisi.");
    if ([nama, g("kdkmp"), g("desa"), g("kabupaten"), g("provinsi")].some((x) => x.length > 120)) return bad("Ada isian lebih dari 120 karakter.");
    if (seen.has(ident.email)) return bad("Duplikat di dalam berkas.");
    if (scopeRegency && g("kabupaten").toLowerCase() !== scopeRegency.trim().toLowerCase()) return bad(`Di luar wilayahmu (${scopeRegency}).`);
    const sandi = idx.sandi != null ? g("sandi") : "";
    if (sandi && sandi.length < 8) return bad("Kata sandi minimal 8 karakter (atau kosongkan agar dibuatkan otomatis).");
    seen.add(ident.email);
    records.push({ baris, nama, email: ident.email, phone: ident.phone, jabatan: jab, kdkmp: g("kdkmp"), desa: g("desa"), kabupaten: scopeRegency ?? g("kabupaten"), provinsi: g("provinsi"), sandi: sandi || undefined });
  });
  return { records, errors };
}
const ABJAD = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"; // tanpa huruf/angka yang mirip (0 O 1 l I)
export const bangunSandi = (n = 10) => Array.from({ length: n }, () => ABJAD[randomInt(ABJAD.length)]).join("");
