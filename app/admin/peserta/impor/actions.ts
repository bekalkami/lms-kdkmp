"use server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin, audit } from "@/lib/auth";
import { parseCsv } from "@/lib/csv";
import { parseRecords, bangunSandi, type Rec } from "@/lib/impor";
export type HasilBaris = { baris: number; nama: string; identitas: string; status: "ok" | "gagal"; pesan: string; sandi?: string };
export type State = { error?: string; hasil?: HasilBaris[] } | null;

export async function imporPeserta(_prev: State, fd: FormData): Promise<State> {
  const { sb, user, profile } = await requireAdmin(); // peran dicek di server, bukan di browser
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY, url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!key || !url) return { error: "Fitur impor belum dikonfigurasi: isi SUPABASE_SERVICE_ROLE_KEY di pengaturan server." };
  const f = fd.get("berkas");
  if (!(f instanceof File) || f.size === 0) return { error: "Pilih berkas CSV terlebih dulu." };
  if (f.size > 1_000_000) return { error: "Berkas terlalu besar (maksimal 1 MB)." };
  const scope = profile.role === "admin_wilayah" ? profile.regency : null; // admin wilayah hanya boleh wilayahnya
  if (profile.role === "admin_wilayah" && !scope) return { error: "Akun admin wilayah belum punya kabupaten/kota." };
  const { records, errors, fatal } = parseRecords(parseCsv(await f.text()), scope);
  if (fatal) return { error: fatal };

  const admin = createClient(url, key, { auth: { persistSession: false } });
  const hasil: HasilBaris[] = errors.map((e) => ({ ...e, status: "gagal" as const }));
  const buat = async (r: Rec) => {
    const sandi = r.sandi ?? bangunSandi();
    const { error } = await admin.auth.admin.createUser({ email: r.email, password: sandi, email_confirm: true,
      user_metadata: { full_name: r.nama, phone: r.phone, jabatan: r.jabatan, kdkmp_name: r.kdkmp, village: r.desa, regency: r.kabupaten, province: r.provinsi } }); // peran selalu 'peserta' (trigger)
    hasil.push(error
      ? { baris: r.baris, nama: r.nama, identitas: r.phone ?? r.email, status: "gagal", pesan: /registered|exists/i.test(error.message) ? "Sudah terdaftar." : "Gagal dibuat." }
      : { baris: r.baris, nama: r.nama, identitas: r.phone ?? r.email, status: "ok", pesan: r.sandi ? "Dibuat (kata sandi dari berkas)." : "Dibuat.", sandi: r.sandi ? undefined : sandi });
  };
  for (let i = 0; i < records.length; i += 5) await Promise.all(records.slice(i, i + 5).map(buat));
  hasil.sort((a, b) => a.baris - b.baris);
  await audit(sb, user.id, "impor_peserta", { total: hasil.length, berhasil: hasil.filter((h) => h.status === "ok").length });
  return { hasil };
}
