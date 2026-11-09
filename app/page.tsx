import Link from "next/link";
export default function Home() {
  return (<div className="space-y-5">
    <h1 className="text-3xl font-black text-merah">Belajar untuk koperasi yang lebih maju</h1>
    <p>Pelatihan resmi bagi manajer, pengurus, pengawas, dan staf gerai Koperasi Desa/Kelurahan Merah Putih.</p>
    <Link href="/login" className="btn">Masuk</Link><Link href="/daftar" className="btn-alt mt-3">Daftar Peserta Baru</Link><Link href="/verifikasi" className="mt-3 block text-center font-bold text-merah underline">Verifikasi sertifikat</Link>
  </div>);
}
