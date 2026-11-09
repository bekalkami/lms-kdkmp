import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import ImporForm from "@/components/ImporForm";
import { MAX_BARIS } from "@/lib/impor";
export const maxDuration = 60;
export default async function Impor() {
  const { profile } = await requireAdmin();
  return (<div className="space-y-5">
    <Link href="/dasbor" className="font-bold text-merah underline">← Dasbor</Link>
    <h1 className="text-2xl font-black">Impor Peserta (CSV)</h1>
    <ol className="list-decimal space-y-1 pl-6"><li><a href="/admin/peserta/template" className="font-bold text-merah underline">Unduh template CSV</a> dan isi satu baris per peserta.</li>
      <li>Jabatan: manajer, pengurus, pengawas, atau staf gerai.</li><li>Kata sandi boleh dikosongkan, sistem membuatkan otomatis.</li><li>Maksimal {MAX_BARIS} baris per unggahan.</li></ol>
    {profile.role === "admin_wilayah" && <p className="rounded-xl bg-merah-muda p-3 font-semibold">Kamu admin wilayah: hanya peserta di {profile.regency} yang bisa diimpor.</p>}
    <p className="text-base text-gray-600">Semua akun yang diimpor berperan Peserta. Peran fasilitator dan admin diatur admin pusat.</p>
    <ImporForm />
  </div>);
}
