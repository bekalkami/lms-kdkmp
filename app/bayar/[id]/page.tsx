import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { supabaseServer } from "@/lib/supabase/server";
import PollBayar from "@/components/PollBayar";

const rp = (n: number) => "Rp " + n.toLocaleString("id-ID");
export const dynamic = "force-dynamic";

export default async function Bayar({ params }: { params: { id: string } }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: o } = await sb.from("orders").select("id, amount_idr, status, qr_string, expires_at, courses(title, slug)").eq("id", params.id).maybeSingle();
  if (!o) notFound();
  const c: any = Array.isArray(o!.courses) ? o!.courses[0] : o!.courses;
  const kadaluarsa = new Date(o!.expires_at) < new Date();

  if (o!.status === "paid") return (<div className="space-y-4 text-center">
    <p className="text-5xl">✅</p><h1 className="text-2xl font-black">Pembayaran berhasil</h1>
    <p>Akses {c?.title} sudah aktif.</p><Link href={`/kursus/${c?.slug}`} className="btn">Mulai belajar</Link></div>);

  if (o!.status !== "pending" || kadaluarsa || !o!.qr_string) return (<div className="space-y-4 text-center">
    <h1 className="text-2xl font-black">Pesanan tidak berlaku</h1>
    <p>Kode QRIS sudah kedaluwarsa atau pembayaran gagal. Tidak ada dana yang terpotong jika Anda belum membayar.</p>
    <Link href={`/kursus/${c?.slug ?? ""}/akses`} className="btn">Buat pesanan baru</Link></div>);

  const png = await QRCode.toDataURL(o!.qr_string, { margin: 1, width: 320 });
  return (<div className="space-y-4 text-center">
    <h1 className="text-2xl font-black">Bayar dengan QRIS</h1>
    <p>{c?.title}</p><p className="text-3xl font-black">{rp(o!.amount_idr)}</p>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={png} alt="Kode QRIS" width={320} height={320} className="mx-auto rounded-xl border-2 border-gray-200" />
    <ol className="mx-auto max-w-xs list-decimal space-y-1 pl-5 text-left">
      <li>Buka aplikasi bank atau e-wallet</li><li>Pilih Scan / Bayar QRIS</li><li>Pastikan nominal sesuai, lalu konfirmasi</li></ol>
    <p className="text-sm text-gray-500">Berlaku sampai {new Date(o!.expires_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</p>
    <PollBayar id={o!.id} />
  </div>);
}
