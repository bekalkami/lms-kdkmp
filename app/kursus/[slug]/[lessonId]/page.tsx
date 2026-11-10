
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { Md } from "@/components/Md";
import VideoOnDemand from "@/components/VideoOnDemand";
import { tandaiSelesai } from "../../actions";

type Lesson = {
  id: string;
  title: string;
  type: string;
  content_md: string | null;
  video_url: string | null;
  file_url: string | null;
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
      position,
      lessons (
        id,
        title,
        type,
        content_md,
        video_url,
        file_url,
        position
      )
    `)
    .eq("course_id", course.id)
    .order("position");

  if (moduleError) {
    console.error("Gagal mengambil modul:", moduleError.message);
  }

  // Gabungkan semua materi dan urutkan berdasarkan modul serta posisi materi
  const flat: Lesson[] = (modules ?? [])
    .flatMap((module: any) =>
      (module.lessons ?? []).map((lesson: Lesson) => ({
        ...lesson,
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
  const next = flat[index + 1]?.id ?? "";

  // Daftarkan peserta ke kursus
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

  return (
    <div className="space-y-5">
      <Link
        href={`/kursus/${params.slug}`}
        className="font-bold text-merah underline"
      >
        ← {course.title}
      </Link>

      <h1 className="text-2xl font-black">
        {lesson.title}
      </h1>

      {lesson.type === "video" && lesson.video_url && (
        <VideoOnDemand url={lesson.video_url} />
      )}

      {(lesson.type === "pdf" ||
        lesson.type === "infografis") &&
        lesson.file_url && (
          <a
            href={lesson.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-alt"
          >
            Buka {lesson.type === "pdf" ? "PDF" : "infografis"}
          </a>
        )}

      {lesson.content_md && (
        <Md text={lesson.content_md} />
      )}

      {!lesson.content_md &&
        !lesson.video_url &&
        !lesson.file_url && (
          <p className="text-gray-500">
            Materi untuk pelajaran ini belum tersedia.
          </p>
        )}

      <form action={tandaiSelesai}>
        <input
          type="hidden"
          name="lessonId"
          value={lesson.id}
        />

        <input
          type="hidden"
          name="slug"
          value={params.slug}
        />

        <input
          type="hidden"
          name="next"
          value={next}
        />

        <button className="btn">
          {sudah
            ? "✅ Sudah selesai · Lanjut"
            : next
              ? "Tandai selesai & lanjut"
              : "Tandai selesai"}
        </button>
      </form>
    </div>
  );
}
