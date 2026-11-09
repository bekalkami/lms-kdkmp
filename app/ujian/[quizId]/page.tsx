
import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { mulaiUjian } from "../actions";

const NAMA: Record<string, string> = {
  pre: "Pre-test",
  modul: "Kuis modul",
  post: "Post-test",
  final: "Ujian akhir",
};

export default async function Ujian({
  params,
  searchParams,
}: {
  params: { quizId: string };
  searchParams: { e?: string };
}) {
  const sb = supabaseServer();

  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) redirect("/login");

  // Ambil data ujian dari Supabase.
  const { data: q, error: qError } = await sb
    .from("quizzes")
    .select(
      "id,course_id,title,type,time_limit_min,passing_score,question_count"
    )
    .eq("id", params.quizId)
    .maybeSingle();

  if (qError) {
    return (
      <div className="space-y-4">
        <Link href="/kursus" className="font-bold text-merah underline">
          ← Katalog
        </Link>

        <h1 className="text-2xl font-black">Gagal membuka ujian</h1>

        <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4">
          <p className="font-bold text-red-700">
            Terjadi kesalahan saat mengambil data ujian.
          </p>
          <p className="mt-2 break-words text-sm text-red-700">
            {qError.message}
          </p>
        </div>
      </div>
    );
  }

  if (!q) {
    return (
      <div className="space-y-4">
        <Link href="/kursus" className="font-bold text-merah underline">
          ← Katalog
        </Link>

        <h1 className="text-2xl font-black">Ujian tidak ditemukan</h1>

        <p className="rounded-xl bg-merah-muda p-4">
          Data ujian tidak ditemukan atau akun kamu belum memiliki akses.
        </p>

        <p className="break-all text-sm text-gray-500">
          ID ujian: {params.quizId}
        </p>
      </div>
    );
  }

  // Ambil informasi kursus.
  const { data: c, error: cError } = await sb
    .from("courses")
    .select("slug,title")
    .eq("id", q.course_id)
    .maybeSingle();

  if (cError || !c) {
    return (
      <div className="space-y-4">
        <Link href="/kursus" className="font-bold text-merah underline">
          ← Katalog
        </Link>

        <h1 className="text-2xl font-black">
          Informasi kursus tidak ditemukan
        </h1>

        <p className="rounded-xl bg-merah-muda p-4 break-words">
          {cError?.message ??
            "Kursus yang terhubung dengan ujian ini tidak ditemukan."}
        </p>
      </div>
    );
  }

  // Ambil riwayat pengerjaan peserta.
  const { data: at, error: atError } = await sb
    .from("attempts")
    .select("id,submitted_at,score,passed,started_at")
    .eq("quiz_id", q.id)
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(5);

  const jalan = (at ?? []).find((a) => !a.submitted_at);

  return (
    <div className="space-y-5">
      <Link
        href={`/kursus/${c.slug}`}
        className="font-bold text-merah underline"
      >
        ← {c.title}
      </Link>

      <h1 className="text-2xl font-black">{q.title}</h1>

      {searchParams.e && (
        <p
          role="alert"
          className="rounded-xl bg-merah-muda p-3 font-semibold text-merah-tua"
        >
          {searchParams.e}
        </p>
      )}

      <ul className="space-y-1 rounded-2xl bg-merah-muda p-4 font-semibold">
        <li>Jenis: {NAMA[q.type] ?? q.type}</li>
        <li>Jumlah soal: {q.question_count} (diacak)</li>
        <li>Waktu: {q.time_limit_min} menit</li>
        <li>Nilai minimal lulus: {q.passing_score}</li>
      </ul>

      <p className="text-base text-gray-600">
        Waktu dihitung oleh server. Jawaban tersimpan otomatis setiap
        kamu memilih, dan ujian dikumpulkan otomatis saat waktu habis.
      </p>

      <form action={mulaiUjian}>
        <input type="hidden" name="quizId" value={q.id} />

        <button type="submit" className="btn">
          {jalan ? "Lanjutkan percobaan" : "Mulai"}
        </button>
      </form>

      {atError && (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          Gagal mengambil riwayat: {atError.message}
        </p>
      )}

      {(at ?? []).filter((a) => a.submitted_at).length > 0 && (
        <section className="space-y-2">
          <h2 className="font-black text-merah">Riwayat</h2>

          {(at ?? [])
            .filter((a) => a.submitted_at)
            .map((a) => (
              <Link
                key={a.id}
                href={`/ujian/hasil/${a.id}`}
                className="flex justify-between rounded-xl border-2 border-gray-200 p-3 font-semibold"
              >
                <span>
                  {new Date(a.submitted_at!).toLocaleDateString("id-ID")}
                </span>

                <span>
                  {a.score} · {a.passed ? "✅ Lulus" : "❌ Belum lulus"}
                </span>
              </Link>
            ))}
        </section>
      )}
    </div>
  );
}
