import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { kirimKode, verifikasiKode } from "./actions";

export default async function VerifikasiEmail({ searchParams }: { searchParams: { e?: string; s?: string; email?: string; next?: string } }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const next = searchParams.next && searchParams.next.startsWith("/") && !searchParams.next.startsWith("//") ? searchParams.next : "/dasbor";
  const { data: v } = await sb.from("email_verified").select("email").eq("user_id", user!.id).maybeSingle();
  const err = searchParams.e && <p role="alert" className="rounded-xl bg-merah-muda p-3 font-semibold text-merah-tua">{searchParams.e}</p>;

  if (v) return (<div className="space-y-4">
    <h1 className="text-2xl font-black">Email terverifikasi ✅</h1>
    <p>{v.email}</p><Link href={next} className="btn">Lanjut</Link></div>);

  if (searchParams.s === "kode") return (<form action={verifikasiKode} className="space-y-4">
    <h1 className="text-2xl font-black">Masukkan kode</h1>
    {err}
    <p>Kami mengirim kode 6 digit ke <b>{searchParams.email}</b>. Berlaku 10 menit. Cek juga folder Spam.</p>
    <input type="hidden" name="next" value={next} />
    <label className="block">Kode verifikasi
      <input name="kode" required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" className="input mt-1 text-center text-2xl tracking-widest" /></label>
    <button className="btn">Verifikasi</button>
    <Link href={`/akun/email?next=${encodeURIComponent(next)}`} className="block text-center font-bold text-merah underline">Ganti email / kirim ulang kode</Link>
  </form>);

  return (<form action={kirimKode} className="space-y-4">
    <h1 className="text-2xl font-black">Verifikasi email</h1>
    {err}
    <p>Diperlukan untuk mencoba trial dan membeli kursus premium. Belajar kursus gratis tidak perlu verifikasi.</p>
    <input type="hidden" name="next" value={next} />
    <label className="block">Email aktif
      <input name="email" type="email" required autoComplete="email" inputMode="email" className="input mt-1" placeholder="nama@gmail.com" /></label>
    <button className="btn">Kirim kode</button>
  </form>);
}
