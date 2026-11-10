import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { mulaiTrial, beliAkses } from "./actions";

const rp = (n: number) => "Rp " + n.toLocaleString("id-ID");
const tgl = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

export default async function Akses({ params, searchParams }: { params: { slug: string }; searchParams: { e?: string } }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: c } = await sb.from("courses").select("id,title,description,is_premium,price_idr,trial_days,access_days").eq("slug", params.slug).maybeSingle();
  if (!c) notFound();
  if (!c!.is_premium) redirect(`/kursus/${params.slug}`);

  const [boleh, ent, ver] = await Promise.all([
    sb.rpc("has_access", { p_course: c!.id }),
    sb.from("entitlements").select("kind, expires_at").eq("user_id", user!.id).eq("course_id", c!.id),
    sb.from("email_verified").select("email").eq("user_id", user!.id).maybeSingle(),
  ]);
  const ents = ent.data ?? [];
  const trialPernah = ents.some((e) => e.kind === "trial");
  const aktif = ents.filter((e) => !e.expires_at || new Date(e.expires_at) > new Date());
  const err = searchParams.e && <p role="alert" className="rounded-xl bg-merah-muda p-3 font-semibold text-merah-tua">{searchParams.e}</p>;

  return (<div className="space-y-5">
    <Link href={`/kursus/${params.slug}`} className="font-bold text-merah underline">← {c!.title}</Link>
    <h1 className="text-2xl font-black">{c!.title}</h1>
    <p>{c!.description}</p>
    {err}

    {boleh.data ? (<div className="space-y-3 rounded-2xl bg-merah-muda p-4">
      <p className="font-black">✅ Akses aktif</p>
      {aktif.map((e, i) => <p key={i}>{e.kind === "paid" ? "Berbayar" : "Trial"}: {e.expires_at ? `sampai ${tgl(e.expires_at)}` : "tanpa batas waktu"}</p>)}
      <Link href={`/kursus/${params.slug}`} className="btn">Mulai belajar</Link></div>
    ) : (<>
      <div className="rounded-2xl border-2 border-gray-200 p-4">
        <p className="text-sm font-bold uppercase text-merah-tua">Kursus premium</p>
        <p className="text-3xl font-black">{rp(c!.price_idr)}</p>
        <p className="text-gray-600">{c!.access_days ? `Akses ${c!.access_days} hari` : "Akses tanpa batas waktu"} · bayar dengan QRIS</p></div>

      {!ver.data && <div className="rounded-xl border-2 border-dashed border-merah p-4">
        <p className="font-bold">Verifikasi email dulu</p>
        <p className="mb-3">Diperlukan sebelum trial atau pembelian. Cukup sekali.</p>
        <Link href={`/akun/email?next=${encodeURIComponent(`/kursus/${params.slug}/akses`)}`} className="btn">Verifikasi email</Link></div>}

      {ver.data && <div className="space-y-3">
        {c!.trial_days > 0 && !trialPernah && <form action={mulaiTrial}>
          <input type="hidden" name="slug" value={params.slug} /><input type="hidden" name="courseId" value={c!.id} />
          <button className="btn-alt">Coba gratis {c!.trial_days} hari</button></form>}
        {trialPernah && <p className="text-center text-gray-500">Trial kursus ini sudah pernah dipakai.</p>}
        <form action={beliAkses}>
          <input type="hidden" name="slug" value={params.slug} /><input type="hidden" name="courseId" value={c!.id} />
          <button className="btn">Beli akses · {rp(c!.price_idr)}</button></form>
      </div>}
    </>)}
  </div>);
}
