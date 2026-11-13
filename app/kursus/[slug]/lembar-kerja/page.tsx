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

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="print:hidden">
        <Link
          href={`/kursus/${params.slug}`}
          className="text-xs font-semibold text-apple-blue hover:text-apple-hover inline-flex items-center gap-1.5 transition-colors"
        >
          ← Kembali ke Silabus: {c!.title}
        </Link>
      </div>

      <div className="glass-panel p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2">
          <span className="rounded-pill bg-apple-blue/10 px-3 py-1 text-xs font-bold text-apple-blue dark:bg-apple-blue/20 dark:text-blue-300">
            LEMBAR KERJA PRAKTIK
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          {w.title}
        </h1>
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          {w.instructions}
        </p>
      </div>

      <div className="space-y-4">
        {(w.items as { label: string; hint: string }[]).map((it, n) => (
          <div key={n} className="glass-panel p-6 space-y-2">
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-apple-blue font-bold text-xs text-white">
                {n + 1}
              </span>
              <div className="space-y-1 w-full">
                <label className="block text-sm font-bold text-neutral-900 dark:text-white">
                  {it.label}
                </label>
                <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                  {it.hint}
                </span>
                <textarea
                  rows={3}
                  className="input mt-2 resize-y"
                  placeholder="Ketik catatan atau analisis Anda di sini..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel p-6 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          💡 Catatan: Isian lembar kerja ini dapat dicetak langsung sebagai bahan rapat anggota atau arsip fisik.
        </p>
        <div className="shrink-0">
          <PrintButton />
        </div>
      </div>
    </div>
  );
}
