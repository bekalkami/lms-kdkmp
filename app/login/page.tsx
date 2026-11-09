import Link from "next/link";
import { login } from "../actions";
export default function Login({ searchParams }: { searchParams: { e?: string } }) {
  return (<form action={login} className="space-y-4">
    <h1 className="text-2xl font-black">Masuk</h1>
    {searchParams.e && <p role="alert" className="rounded-xl bg-merah-muda p-3 font-semibold text-merah-tua">{searchParams.e}</p>}
    <label className="block">Nomor WA atau email<input name="id" required className="input mt-1" inputMode="email" autoComplete="username" placeholder="08123456789"/></label>
    <label className="block">Kata sandi<input name="password" type="password" required className="input mt-1" autoComplete="current-password"/></label>
    <button className="btn">Masuk</button>
    <p className="text-center">Belum punya akun? <Link href="/daftar" className="font-bold text-merah underline">Daftar</Link></p>
  </form>);
}
