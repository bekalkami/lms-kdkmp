import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { gantiSandi } from "./actions";
export default async function Sandi({ searchParams }: { searchParams: { e?: string; ok?: string } }) {
  const { data: { user } } = await supabaseServer().auth.getUser();
  if (!user) redirect("/login");
  return (<form action={gantiSandi} className="space-y-4">
    <Link href="/dasbor" className="font-bold text-merah underline">← Dasbor</Link>
    <h1 className="text-2xl font-black">Ganti Kata Sandi</h1>
    {searchParams.e && <p role="alert" className="rounded-xl bg-merah-muda p-3 font-semibold text-merah-tua">{searchParams.e}</p>}
    {searchParams.ok && <p className="rounded-xl bg-green-100 p-3 font-semibold">{searchParams.ok}</p>}
    <label className="block">Kata sandi baru (min. 8 karakter)<input name="baru" type="password" minLength={8} required className="input mt-1" autoComplete="new-password" /></label>
    <label className="block">Ulangi kata sandi baru<input name="ulang" type="password" minLength={8} required className="input mt-1" autoComplete="new-password" /></label>
    <button className="btn">Simpan</button></form>);
}
