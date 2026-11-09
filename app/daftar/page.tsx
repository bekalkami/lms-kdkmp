import Link from "next/link";
import { daftar } from "../actions";
import { JABATAN } from "@/lib/identity";
const F = ({ n, l, ...r }: { n: string; l: string } & React.InputHTMLAttributes<HTMLInputElement>) =>
  (<label className="block">{l} *<input name={n} required className="input mt-1" {...r}/></label>);
export default function Daftar({ searchParams }: { searchParams: { e?: string } }) {
  return (<form action={daftar} className="space-y-4">
    <h1 className="text-2xl font-black">Daftar Peserta</h1>
    {searchParams.e && <p role="alert" className="rounded-xl bg-merah-muda p-3 font-semibold text-merah-tua">{searchParams.e}</p>}
    <F n="nama" l="Nama lengkap" autoComplete="name"/>
    <F n="id" l="Nomor WA atau email" inputMode="email" autoComplete="username"/>
    <F n="password" l="Kata sandi (min. 8 karakter)" type="password" minLength={8} autoComplete="new-password"/>
    <label className="block">Jabatan *<select name="jabatan" required className="input mt-1" defaultValue="">
      <option value="" disabled>Pilih jabatan</option>{JABATAN.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></label>
    <F n="kdkmp" l="Nama KDKMP"/><F n="desa" l="Desa/Kelurahan"/><F n="kabupaten" l="Kabupaten/Kota" placeholder="Kabupaten Purworejo"/><F n="provinsi" l="Provinsi"/>
    <button className="btn">Daftar</button>
    <p className="text-center">Sudah punya akun? <Link href="/login" className="font-bold text-merah underline">Masuk</Link></p>
  </form>);
}
