
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Kursus({
  params,
}: {
  params: { slug: string };
}) {
  const sb = supabaseServer();

  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) redirect("/login");

  const { data: c } = await sb
    .from("courses")
    .select("id,title,description,is_premium,price_idr")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!c) notFound();

  const { data: punyaAkses } = await sb.rpc("has_access", { p_course: c.id });
  const terkunci = c.is_premium && !punyaAkses;

  const [modsResult, dnResult, qzResult] = await Promise.all([
    sb
      .from("modules")
      .select(`
        id,
        title,
        position,
        lessons(id,title,type,duration_min,position),
        worksheets(id,title)
      `)
      .eq("course_id", c.id)
      .order("position"),

    sb
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", user.id),

    sb
      .from("quizzes")
      .select("id,title,type,time_limit_min,passing_score,position")
      .eq("course_id", c.id)
      .order("position"),
  ]);

  const mods = modsResult.data ?? [];
  const dn = dnResult.data ?? [];
  const qz = qzResult.data ?? [];
  const qzError = qzResult.error;

  const done = new Set(dn.map((d) => d.lesson_id));

  const ICON: Record<string, string> = {
    teks: "📄",
    video: "🎬",
    pdf: "📑",
    infografis: "🖼️",
  };

  const TYPE_NAME: Record<string, string> = {
    teks: "Teks Bacaan",
    video: "Video Interaktif",
    pdf: "Dokumen PDF",
    infografis: "Infografis",
  };

  const all = mods.flatMap((m: any) => m.lessons ?? []);
  const finished = all.filter((l: any) => done.has(l.id)).length;
  const pct = all.length ? Math.round((finished / all.length) * 100) : 0;

  // Cari lesson pertama yang belum selesai untuk quick resume CTA
  const firstUnfinished = all.find((l: any) => !done.has(l.id)) ?? all[0];

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Back Link */}
      <div>
        <Link
          href="/kursus"
          className="text-xs font-semibold text-apple-blue hover:text-apple-hover inline-flex items-center gap-1.5 transition-colors"
        >
          ← Kembali ke Katalog Kursus
        </Link>
      </div>

      {/* Hero Course Header */}
      <div className="glass-panel p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-pill bg-apple-blue/10 px-3 py-1 text-xs font-bold text-apple-blue dark:bg-apple-blue/20 dark:text-blue-300">
            SILABUS RESMI KDKMP
          </span>
          {c.is_premium && (
            <span className="rounded-pill bg-merah/10 px-3 py-1 text-xs font-bold text-merah dark:bg-merah/20 dark:text-red-300">
              PREMIUM · Rp {c.price_idr.toLocaleString("id-ID")}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          {c.title}
        </h1>

        <p className="text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
          {c.description}
        </p>

        {/* Progress Overview Card */}
        {all.length > 0 && (
          <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                  Progres Pembelajaran: {finished} dari {all.length} materi selesai
                </span>
                <span className="font-bold text-apple-blue">{pct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200/80 dark:bg-neutral-800">
                <div
                  className="h-full bg-apple-blue rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {firstUnfinished && !terkunci && (
              <Link
                href={`/kursus/${params.slug}/${firstUnfinished.id}`}
                className="btn-apple-primary px-5 py-2.5 text-xs whitespace-nowrap shrink-0"
              >
                {finished > 0 && finished < all.length
                  ? "Lanjut Belajar →"
                  : finished === all.length
                  ? "Pelajari Ulang →"
                  : "Mulai Belajar →"}
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Premium Lock Banner */}
      {terkunci && (
        <div className="glass-panel p-6 border border-amber-300/40 bg-amber-500/5 dark:bg-amber-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔒</span>
              <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                Akses Kursus Premium Terkunci
              </h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              Buka seluruh modul, materi video eksklusif, kuis evaluasi, dan klaim sertifikat resmi.
            </p>
          </div>
          <Link
            href={`/kursus/${params.slug}/akses`}
            className="btn-apple-primary px-6 py-2.5 text-xs whitespace-nowrap shrink-0"
          >
            Buka Akses atau Coba Trial →
          </Link>
        </div>
      )}

      {/* Modules and Lessons List */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/10 pb-2">
          <span className="text-base font-bold text-neutral-900 dark:text-white">
            Daftar Modul & Materi Pelatihan
          </span>
        </div>

        {mods.length === 0 ? (
          <div className="glass-panel p-8 text-center text-neutral-500">
            Modul sedang disiapkan oleh fasilitator.
          </div>
        ) : (
          mods.map((m: any, mIdx: number) => {
            const lessons = (m.lessons ?? []).sort((a: any, b: any) => a.position - b.position);
            const mFinished = lessons.filter((l: any) => done.has(l.id)).length;

            return (
              <div key={m.id} className="glass-panel p-6 sm:p-7 space-y-4">
                {/* Module Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 dark:border-white/10 pb-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-apple-blue dark:text-blue-400">
                      Modul {mIdx + 1}
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
                      {m.title}
                    </h2>
                  </div>
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    {mFinished}/{lessons.length} Selesai
                  </span>
                </div>

                {lessons.length === 0 && (
                  <p className="text-xs text-neutral-500 py-2">
                    {terkunci
                      ? "🔒 Materi terkunci. Buka akses premium untuk mempelajari modul ini."
                      : "Materi sedang disiapkan oleh fasilitator."}
                  </p>
                )}

                {/* Lessons Rows */}
                <div className="space-y-2.5">
                  {lessons.map((l: any) => {
                    const isDone = done.has(l.id);
                    return (
                      <Link
                        key={l.id}
                        href={`/kursus/${params.slug}/${l.id}`}
                        className="group flex items-center justify-between gap-3.5 rounded-2xl border border-black/5 dark:border-white/5 bg-white/40 dark:bg-white/5 p-3.5 sm:p-4 transition-all hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm transition-colors ${
                              isDone
                                ? "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-300 font-bold"
                                : "bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-300"
                            }`}
                          >
                            {isDone ? "✓" : ICON[l.type] ?? "📄"}
                          </span>

                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate group-hover:text-apple-blue transition-colors">
                              {l.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                              <span>{TYPE_NAME[l.type] ?? "Materi"}</span>
                              <span>•</span>
                              <span>{l.duration_min || 8} menit</span>
                            </div>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-neutral-400 group-hover:text-apple-blue group-hover:translate-x-0.5 transition-all">
                          →
                        </span>
                      </Link>
                    );
                  })}
                </div>

                {/* Worksheet item if available */}
                {(m.worksheets ?? []).length > 0 && (
                  <div className="pt-2">
                    <Link
                      href={`/kursus/${params.slug}/lembar-kerja`}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-dashed border-apple-blue/40 bg-apple-blue/5 dark:bg-apple-blue/10 p-4 transition-all hover:bg-apple-blue/10 dark:hover:bg-apple-blue/20"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📝</span>
                        <div>
                          <h4 className="text-sm font-bold text-apple-blue dark:text-blue-300">
                            Lembar Kerja Praktik Mandiri
                          </h4>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Isi lembar kerja implementasi KDKMP berdasarkan modul ini.
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-apple-blue">
                        Buka Lembar Kerja →
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Quizzes and Exams Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/10 pb-2">
          <span className="text-base font-bold text-neutral-900 dark:text-white">
            Evaluasi & Ujian Kelulusan
          </span>
        </div>

        {qzError ? (
          <div className="glass-panel p-4 border-red-300/60 bg-red-500/10 text-red-700 dark:text-red-300 text-xs">
            Gagal mengambil data ujian dari database: {qzError.message}
          </div>
        ) : qz.length === 0 ? (
          <div className="glass-panel p-6 text-center text-xs text-neutral-400">
            Belum ada evaluasi atau ujian untuk kursus ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {qz.map((z: any) => (
              <Link
                key={z.id}
                href={`/ujian/${z.id}`}
                className="glass-panel group p-5 flex flex-col justify-between gap-3 transition-all hover:scale-[1.01]"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-2xl">
                      {z.type === "final" ? "🎓" : "🧪"}
                    </span>
                    <span className="rounded-pill bg-apple-blue/10 px-2.5 py-0.5 text-[10px] font-bold text-apple-blue dark:bg-apple-blue/20 dark:text-blue-300 uppercase">
                      {z.type === "final" ? "Ujian Akhir" : "Kuis Evaluasi"}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white group-hover:text-apple-blue transition-colors">
                    {z.title}
                  </h3>
                </div>

                <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-neutral-400">
                  <span>⏱️ {z.time_limit_min} Menit</span>
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Lulus ≥ {z.passing_score}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
