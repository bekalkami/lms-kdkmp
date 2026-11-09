
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { Md } from "@/components/Md";
import VideoOnDemand from "@/components/VideoOnDemand";
import { tandaiSelesai } from "../../actions";

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

  const { data: c } = await sb
    .from("courses")
    .select("id,title")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!c) notFound();

  const { data: mods } = await sb
    .from("modules")
    .select(
      "position, lessons(id,title,type,content_md,video_url,file_url,position)"
    )
    .eq("course_id", c.id)
    .order("position");

  const flat = (mods ?? []).flatMap((m: any) =>
    [...(m.lessons ?? [])].sort(
      (a: any, b: any) => a.position - b.position
    )
  );

  const i = flat.findIndex(
    (l: any) => l.id === params.lessonId
  );

  if (i < 0) notFound();

  const l: any = flat[i];
  const next = flat[i + 1]?.id ?? "";

  await sb.from("enrollments").upsert(
    {
      user_id: user.id,
      course_id: c.id,
    },
    {
      onConflict: "user_id,course_id",
      ignoreDuplicates: true,
    }
  );

  const { data: dn } = await sb
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("lesson_id", l.id);

  const sudah = (dn ?? []).length > 0;

  return (
    <div className="space-y-5">
      <Link
        href={`/kursus/${params.slug}`}
        className="font-bold text-merah underline"
      >
        ← {c.title}
      </Link>

      <h1 className="text-2xl font-black">{l.title}</h1>

      {l.type === "video" && l.video_url && (
        <VideoOnDemand url={l.video_url} />
      )}

      {(l.type === "pdf" || l.type === "infografis") &&
        l.file_url && (
          <a
            href={l.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-alt"
          >
            Buka {l.type === "pdf" ? "PDF" : "infografis"}
          </a>
        )}

      <Md text={l.content_md} />

      <form action={tandaiSelesai}>
        <input
          type="hidden"
          name="lessonId"
          value={l.id}
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
