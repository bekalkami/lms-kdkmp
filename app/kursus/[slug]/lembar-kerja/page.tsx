import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import PrintButton from "@/components/PrintButton";
export default async function LembarKerja({ params }: { params: { slug: string } }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: c } = await sb.from("courses").select("id,title").eq("slug", params.slug).maybeSingle();
  if (!c) notFound();
  const { data: ms } = await sb.from("modules").select("worksheets(title,instructions,items)").eq("course_id", c!.id);
  const w: any = (ms ?? []).flatMap((m: any) => m.worksheets ?? [])[0];
  if (!w) notFound();
  return (<div className="space-y-4">
    <Link href={`/kursus/${params.slug}`} className="font-bold text-merah underline print:hidden">← {c!.title}</Link>
    <h1 className="text-2xl font-black">{w.title}</h1><p>{w.instructions}</p>
    {(w.items as { label: string; hint: string }[]).map((it, n) => (<label key={n} className="block"><b>{n + 1}. {it.label}</b>
      <span className="block text-sm text-gray-500">{it.hint}</span><textarea rows={3} className="input mt-1 print:border-gray-400" /></label>))}
    <PrintButton />
    <p className="text-sm text-gray-500 print:hidden">Isian belum tersimpan di sistem. Cetak atau tulis salinannya.</p>
  </div>);
}
