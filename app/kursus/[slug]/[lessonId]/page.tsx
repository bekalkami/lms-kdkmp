
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { Md } from "@/components/Md";
import VideoOnDemand from "@/components/VideoOnDemand";
import { tandaiSelesai } from "../../actions";
import { ShiroPixel } from "@/components/PixelCharacters";

type Lesson = {
  id: string;
  title: string;
  type: string;
  content_md: string | null;
  video_url: string | null;
  file_url: string | null;
  duration_min?: number;
  position: number;
};

export default async function Pelajaran({
  params,
}: {
  params: { slug: string; lessonId: string };
}) {
  const sb = supabaseServer();

  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) redirect("/login");

  // Ambil kursus
  const { data: course, error: courseError } = await sb
    .from("courses")
    .select("id, title")
    .eq("slug", params.slug)
    .maybeSingle();

  if (courseError) {
    console.error("Gagal mengambil kursus:", courseError.message);
  }

  if (!course) notFound();

  // Ambil modul beserta materi
  const { data: modules, error: moduleError } = await sb
    .from("modules")
    .select(`
      id,
      title,
      position,
      lessons (
        id,
        title,
        type,
        content_md,
        video_url,
        file_url,
        duration_min,
        position
      )
    `)
    .eq("course_id", course.id)
    .order("position");

  if (moduleError) {
    console.error("Gagal mengambil modul:", moduleError.message);
  }

  // Gabungkan semua materi dan urutkan berdasarkan modul serta posisi materi
  const flat: (Lesson & { moduleTitle?: string; modulePosition: number })[] = (modules ?? [])
    .flatMap((module: any) =>
      (module.lessons ?? []).map((lesson: Lesson) => ({
        ...lesson,
        moduleTitle: module.title,
        modulePosition: module.position,
      }))
    )
    .sort(
      (a: any, b: any) =>
        a.modulePosition - b.modulePosition ||
        a.position - b.position
    );

  // Cari materi yang sedang dibuka
  const index = flat.findIndex(
    (lesson) => lesson.id === params.lessonId
  );

  if (index < 0) {
    const { data: boleh } = await sb.rpc("has_access", { p_course: course.id });
    if (!boleh) redirect(`/kursus/${params.slug}/akses`);
    notFound();
  }

  const lesson = flat[index];
  const prevLesson = index > 0 ? flat[index - 1] : null;
  const nextLesson = index < flat.length - 1 ? flat[index + 1] : null;
  const next = nextLesson?.id ?? "";

  // Daftarkan peserta ke kursus jika belum terdaftar
  const { error: enrollmentError } = await sb
    .from("enrollments")
    .upsert(
      {
        user_id: user.id,
        course_id: course.id,
      },
      {
        onConflict: "user_id,course_id",
        ignoreDuplicates: true,
      }
    );

  if (enrollmentError) {
    console.error("Gagal membuat enrollment:", enrollmentError.message);
  }

  // Periksa progres materi
  const { data: progress, error: progressError } = await sb
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("lesson_id", lesson.id);

  if (progressError) {
    console.error("Gagal mengambil progres:", progressError.message);
  }

  const sudah = (progress ?? []).length > 0;
  const progressPercent = Math.round(((index + 1) / Math.max(flat.length, 1)) * 100);

  const TYPE_LABEL: Record<string, { label: string; icon: string }> = {
    teks: { label: "Materi Bacaan", icon: "📄" },
    video: { label: "Video Pembelajaran", icon: "🎬" },
    pdf: { label: "Dokumen PDF", icon: "📑" },
    infografis: { label: "Infografis Interaktif", icon: "🖼️" },
  };
  const typeMeta = TYPE_LABEL[lesson.type] ?? { label: "Materi", icon: "📄" };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/kursus/${params.slug}`}
          className="text-xs font-semibold text-apple-blue hover:text-apple-hover inline-flex items-center gap-1.5 transition-colors"
        >
          ← Kembali ke Silabus Kursus
        </Link>

        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
          <span className="truncate max-w-[200px] sm:max-w-xs">{course.title}</span>
          <span>•</span>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            Materi {index + 1} dari {flat.length}
          </span>
        </div>
      </div>

      {/* Progress Bar Header */}
      <div className="space-y-1.5">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200/80 dark:bg-neutral-800">
          <div
            className="h-full bg-apple-blue rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-neutral-400">
          <span>{lesson.moduleTitle || "Modul Pelatihan"}</span>
          <span>{progressPercent}% Modul Selesai</span>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="glass-panel p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-apple-blue/10 px-3 py-1 text-xs font-bold text-apple-blue dark:bg-apple-blue/20 dark:text-blue-300">
            <span>{typeMeta.icon}</span>
            <span>{typeMeta.label}</span>
          </span>

          <span className="inline-flex items-center gap-1 rounded-pill bg-neutral-100 dark:bg-white/10 px-3 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300">
            <span>⏱️</span>
            <span>{lesson.duration_min || 8} Menit Estimasi</span>
          </span>

          {sudah ? (
            <span className="inline-flex items-center gap-1 rounded-pill bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300">
              <span>✅</span>
              <span>Selesai Dipelajari</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-pill bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-500/25 dark:text-amber-300">
              <span>📖</span>
              <span>Sedang Berjalan</span>
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight">
          {lesson.title}
        </h1>
      </div>

      {/* Media: Video Player */}
      {lesson.type === "video" && lesson.video_url && (
        <div className="glass-panel overflow-hidden p-2 sm:p-4">
          <VideoOnDemand url={lesson.video_url} />
        </div>
      )}

      {/* Media: PDF / Infografis Card */}
      {(lesson.type === "pdf" || lesson.type === "infografis") && lesson.file_url && (
        <div className="glass-panel p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 border border-apple-blue/30 bg-apple-blue/5">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{lesson.type === "pdf" ? "📑" : "🖼️"}</span>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-white text-base sm:text-lg">
                Berkas Dokumen Lampiran
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Format {lesson.type === "pdf" ? "Dokumen PDF Resmi" : "Grafis Digital"}. Dapat dibuka langsung di tab baru.
              </p>
            </div>
          </div>
          <a
            href={lesson.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-apple-primary px-5 py-2.5 text-xs whitespace-nowrap"
          >
            Buka Berkas Materi ↗
          </a>
        </div>
      )}

      {/* Main Lesson Content (Enhanced Markdown Reader) */}
      {lesson.content_md ? (
        <div className="space-y-6">
          <Md text={lesson.content_md} />
        </div>
      ) : (
        !lesson.video_url &&
        !lesson.file_url && (
          <div className="glass-panel p-8 text-center space-y-2">
            <span className="text-3xl">📝</span>
            <p className="font-semibold text-neutral-700 dark:text-neutral-300">
              Materi untuk pelajaran ini sedang dalam proses penyusunan oleh fasilitator.
            </p>
          </div>
        )
      )}

      {/* Companion Tip Card */}
      <div className="glass-panel p-5 flex items-center gap-3.5 border border-purple-300/40 bg-purple-500/5 dark:bg-purple-950/20">
        <div className="shrink-0">
          <ShiroPixel size={28} />
        </div>
        <div className="text-xs text-neutral-600 dark:text-neutral-300">
          <b className="text-purple-700 dark:text-purple-300">Shiro:</b> 『　　』tidak pernah kalah dalam memahami data. Catat poin penting di atas, lalu konfirmasi pemahamanmu dengan tombol di bawah.
        </div>
      </div>

      {/* Action and Navigation Bottom Bar */}
      <div className="glass-panel p-4 sm:p-6 sticky bottom-4 z-20 backdrop-blur-2xl shadow-xl border border-white/60 dark:border-white/10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Previous Lesson Link */}
          {prevLesson ? (
            <Link
              href={`/kursus/${params.slug}/${prevLesson.id}`}
              className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-apple-blue flex items-center gap-1.5 transition-colors order-2 sm:order-1"
            >
              ← Materi Sebelumnya
            </Link>
          ) : (
            <div className="order-2 sm:order-1 text-xs text-neutral-400">
              Awal Modul Kursus
            </div>
          )}

          {/* Complete & Next Form Button */}
          <form action={tandaiSelesai} className="w-full sm:w-auto order-1 sm:order-2">
            <input type="hidden" name="lessonId" value={lesson.id} />
            <input type="hidden" name="slug" value={params.slug} />
            <input type="hidden" name="next" value={next} />

            <button
              type="submit"
              className={`btn-apple-primary w-full sm:w-auto min-w-[200px] text-sm py-3 px-6 font-bold shadow-md ${
                sudah
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30"
                  : ""
              }`}
            >
              {sudah
                ? next
                  ? "✅ Sudah Selesai · Lanjut →"
                  : "✅ Sudah Selesai · Selesai Modul"
                : next
                  ? "Tandai Selesai & Lanjut →"
                  : "Tandai Selesai Materi"}
            </button>
          </form>

          {/* Next Lesson Link */}
          {nextLesson ? (
            <Link
              href={`/kursus/${params.slug}/${nextLesson.id}`}
              className="text-xs font-semibold text-apple-blue hover:text-apple-hover flex items-center gap-1.5 transition-colors order-3"
            >
              Materi Berikutnya →
            </Link>
          ) : (
            <Link
              href={`/kursus/${params.slug}`}
              className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-apple-blue flex items-center gap-1.5 transition-colors order-3"
            >
              Kembali ke Silabus →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
