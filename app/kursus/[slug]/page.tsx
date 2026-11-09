
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
    .select("id,title,description")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!c) notFound();

  const [modsResult, dnResult, qzResult] = await Promise.all([
    sb
      .from("modules")
      .select(`
        id,
        title,
        position,
        lessons(id,title,type,duration_min,position),
        worksheets(id)
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

  const all = mods.flatMap((m: any) => m.lessons ?? []);
  const finished = all.filter((l: any) => done.has(l.id)).length;

  return (
    <div className="space-y-5">
      <Link
        href="/kursus"
        className="font-bold text-merah underline"
      >
        ← Katalog
      </Link>

      <h1 className="text-2xl font-black">{c.title}</h1>

      <p>{c.description}</p>

      {all.length > 0 && (
        <p className="rounded-xl bg-merah-muda p-3 font-bold">
          Progres: {finished} dari {all.length} pelajaran selesai
        </p>
      )}

      {mods.map((m: any) => (
        <section key={m.id} className="space-y-2">
          <h2 className="font-black text-merah">{m.title}</h2>

          {(m.lessons ?? []).length === 0 && (
            <p className="text-gray-500">
              Materi sedang disiapkan.
            </p>
          )}

          {[...(m.lessons ?? [])]
            .sort((a: any, b: any) => a.position - b.position)
            .map((l: any) => (
              <Link
                key={l.id}
                href={`/kursus/${params.slug}/${l.id}`}
                className="flex items-center gap-3 rounded-xl border-2 border-gray-200 p-4 active:border-merah"
              >
                <span className="text-2xl">
                  {done.has(l.id) ? "✅" : ICON[l.type] ?? "📄"}
                </span>

                <span className="flex-1 font-semibold">
                  {l.title}
                  <span className="block text-sm font-normal text-gray-500">
                    {l.duration_min} menit
                  </span>
                </span>
              </Link>
            ))}

          {(m.worksheets ?? []).length > 0 && (
            <Link
              href={`/kursus/${params.slug}/lembar-kerja`}
              className="block rounded-xl border-2 border-dashed border-merah p-4 font-bold text-merah"
            >
              📝 Lembar kerja modul ini
            </Link>
          )}
        </section>
      ))}

      {/* BAGIAN KUIS DAN UJIAN */}
      <section className="space-y-3">
        <h2 className="text-lg font-black text-merah">
          📝 Kuis dan ujian
        </h2>

        {qzError ? (
          <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4">
            <p className="font-bold text-red-700">
              Gagal mengambil data ujian dari database.
            </p>
            <p className="mt-2 break-words text-sm text-red-700">
              {qzError.message}
            </p>
          </div>
        ) : qz.length === 0 ? (
          <p className="rounded-xl border-2 border-gray-200 p-4 text-gray-500">
            Belum ada kuis atau ujian untuk kursus ini.
          </p>
        ) : (
          qz.map((z: any) => (
            <Link
              key={z.id}
              href={`/ujian/${z.id}`}
              className="flex items-center gap-3 rounded-xl border-2 border-gray-200 p-4 active:border-merah"
            >
              <span className="text-2xl">
                {z.type === "final" ? "🎓" : "🧪"}
              </span>

              <span className="flex-1 font-semibold">
                {z.title}

                <span className="block text-sm font-normal text-gray-500">
                  {z.time_limit_min} menit · lulus ≥ {z.passing_score}
                </span>
              </span>

              <span className="font-bold text-merah">
                →
              </span>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
