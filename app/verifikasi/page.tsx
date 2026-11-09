import { redirect } from "next/navigation";
export default function Cari({ searchParams }: { searchParams: { kode?: string } }) {
  if (searchParams.kode?.trim()) redirect(`/verifikasi/${encodeURIComponent(searchParams.kode.trim())}`);
  return (<form method="get" className="space-y-4">
    <h1 className="text-2xl font-black">Verifikasi Sertifikat</h1>
    <p>Masukkan nomor sertifikat, atau pindai kode QR pada sertifikat untuk hasil lengkap.</p>
    <input name="kode" required className="input" placeholder="LMS-KDKMP/2026/000001" />
    <button className="btn">Periksa</button>
  </form>);
}
