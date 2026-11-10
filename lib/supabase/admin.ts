import { createClient } from "@supabase/supabase-js";
// HANYA untuk kode server (server action / route handler). Jangan diimpor dari komponen "use client".
// Memakai SUPABASE_SERVICE_ROLE_KEY (tanpa awalan NEXT_PUBLIC) dan melewati RLS.
export function supabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY belum diisi di variabel lingkungan server.");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
