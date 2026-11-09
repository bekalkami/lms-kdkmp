// Membuat 4 akun demo (satu per peran). Jalankan: npm run seed:demo  (butuh .env.local berisi service role key)
import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY (export atau node --env-file=.env.local)."); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });
const PASS = "Demo12345!";
const base = { kdkmp_name: "KDKMP Sukamaju", village: "Sukamaju", regency: "Kabupaten Purworejo", province: "Jawa Tengah" };
const users = [
  ["peserta@demo.lmskdkmp.id", "Budi Santoso (Peserta)", "manajer", "peserta"],
  ["fasilitator@demo.lmskdkmp.id", "Sari Wulandari (Fasilitator)", "pengurus", "fasilitator"],
  ["wilayah@demo.lmskdkmp.id", "Agus Pratama (Admin Wilayah)", "pengurus", "admin_wilayah"],
  ["pusat@demo.lmskdkmp.id", "Rina Hartati (Admin Pusat)", "pengawas", "admin_pusat"],
];
for (const [email, name, jabatan, role] of users) {
  const { data, error } = await sb.auth.admin.createUser({ email, password: PASS, email_confirm: true, user_metadata: { full_name: name, jabatan, ...base } });
  if (error) { console.log("lewati", email, "-", error.message); continue; }
  const { error: e2 } = await sb.from("profiles").update({ role }).eq("id", data.user.id);
  console.log(e2 ? "GAGAL peran " + email : `ok ${email} → ${role}`);
}
console.log("Kata sandi semua akun demo:", PASS);
