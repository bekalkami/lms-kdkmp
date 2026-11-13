import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { JABATAN } from "@/lib/identity";

export default async function Katalog() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const [me, cs, ls, dn] = await Promise.all([
    sb.from("profiles").select("jabatan").eq("id", user!.id).single(),
    sb.from("courses").select("id,slug,title,description,jabatan_target,is_premium,price_idr").eq("published", true).order("position"),
    sb.from("lessons").select("id, modules(course_id)"),
    sb.from("lesson_progress").select("lesson_id").eq("user_id", user!.id),
  ]);
  const done = new Set((dn.data ?? []).map((d) => d.lesson_id));
  const total: Record<string, number> = {}, fin: Record<string, number> = {};
  (ls.data ?? []).forEach((l: any) => {
    const m = Array.isArray(l.modules) ? l.modules[0] : l.modules;
    if (!m) return;
    total[m.course_id] = (total[m.course_id] ?? 0) + 1;
    if (done.has(l.id)) fin[m.course_id] = (fin[m.course_id] ?? 0) + 1;
  });
  const jab = me.data?.jabatan;
  const all = cs.data ?? [];
  const mine = all.filter((c) => c.jabatan_target.includes(jab));
  const rest = all.filter((c) => !c.jabatan_target.includes(jab));

  const Card = ({ c }: { c: (typeof all)[number] }) => {
    const t = total[c.id] ?? 0, f = fin[c.id] ?? 0, pct = t ? Math.round((f / t) * 100) : 0;
    return (
      <Link
        href={`/kursus/${c.slug}`}
        className="glass-panel group block p-6 transition-all hover:scale-[1.01]"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight group-hover:text-apple-blue transition-colors">
            {c.title}
          </h3>
          {c.is_premium && (
            <span className="rounded-pill bg-merah/10 px-2.5 py-0.5 text-[11px] font-semibold text-merah dark:bg-merah/20 dark:text-red-300">
              PREMIUM
            </span>
          )}
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
          {c.description}
        </p>

        <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-white/5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200/80 dark:bg-neutral-800">
            <div className="h-full bg-apple-blue rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-neutral-400">
            <span>{t ? `${f}/${t} Pelajaran Selesai` : "Materi sedang disiapkan"}</span>
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">{pct}%</span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dasbor" className="text-xs font-semibold text-apple-blue hover:text-apple-hover inline-flex items-center gap-1">
          ← Kembali ke Dasbor
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight mt-2">
          Katalog Kursus
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Kurikulum resmi yang disesuaikan dengan peran kerja dan tupoksi Anda di KDKMP.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/10 pb-2">
          <span className="text-base font-bold text-neutral-900 dark:text-white">
            Jalur Wajib: {JABATAN.find(([v]) => v === jab)?.[1] ?? "Tupoksi Anda"}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mine.map((c) => (
            <Card key={c.id} c={c} />
          ))}
        </div>
      </div>

      {rest.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/10 pb-2">
            <span className="text-base font-bold text-neutral-500">
              Modul Tambahan Lainnya
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rest.map((c) => (
              <Card key={c.id} c={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


