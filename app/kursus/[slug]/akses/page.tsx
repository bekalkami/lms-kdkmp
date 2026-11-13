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
  const err = searchParams.e && (
    <div role="alert" className="glass-panel p-4 border-red-300/60 bg-red-500/10 text-red-700 dark:text-red-300 text-sm font-semibold">
      {searchParams.e}
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <div>
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
            AKSES KURSUS PREMIUM
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          {c!.title}
        </h1>
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          {c!.description}
        </p>
      </div>

      {err}

      {boleh.data ? (
        <div className="glass-panel p-6 sm:p-8 space-y-4 border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
              Akses Kursus Aktif
            </h2>
          </div>
          <div className="space-y-1.5 text-sm text-neutral-700 dark:text-neutral-300">
            {aktif.map((e, i) => (
              <p key={i}>
                Status {e.kind === "paid" ? "Pembelian Penuh" : "Periode Trial"}:{" "}
                <b className="font-semibold text-neutral-900 dark:text-white">
                  {e.expires_at ? `Berlaku hingga ${tgl(e.expires_at)}` : "Akses Tanpa Batas Waktu"}
                </b>
              </p>
            ))}
          </div>
          <Link href={`/kursus/${params.slug}`} className="btn-apple-primary w-full py-3">
            Mulai Belajar Sekarang →
          </Link>
        </div>
      ) : (
        <div className="glass-panel p-6 sm:p-8 space-y-6">
          <div className="space-y-1 text-center py-2">
            <span className="text-xs font-bold uppercase tracking-wider text-apple-blue">
              Paket Pembelajaran Penuh
            </span>
            <div className="text-4xl font-black text-neutral-900 dark:text-white">
              {rp(c!.price_idr)}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {c!.access_days ? `Masa aktif akses ${c!.access_days} hari` : "Akses permanen tanpa batas waktu"} · Pembayaran instan via QRIS
            </p>
          </div>

          {!ver.data && (
            <div className="rounded-2xl border border-dashed border-amber-400 bg-amber-500/10 p-5 space-y-3">
              <h4 className="font-bold text-amber-800 dark:text-amber-300 text-sm">
                📧 Verifikasi Email Diperlukan
              </h4>
              <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
                Untuk keamanan akun dan klaim sertifikat pelatihan, silakan konfirmasi email Anda terlebih dahulu sebelum memulai trial atau pembelian.
              </p>
              <Link
                href={`/akun/email?next=${encodeURIComponent(`/kursus/${params.slug}/akses`)}`}
                className="btn-apple-primary w-full py-2.5 text-xs font-bold"
              >
                Verifikasi Email Sekarang →
              </Link>
            </div>
          )}

          {ver.data && (
            <div className="space-y-3 pt-2">
              {c!.trial_days > 0 && !trialPernah && (
                <form action={mulaiTrial}>
                  <input type="hidden" name="slug" value={params.slug} />
                  <input type="hidden" name="courseId" value={c!.id} />
                  <button type="submit" className="btn-apple-secondary w-full py-3 text-sm font-semibold">
                    Coba Akses Trial Gratis {c!.trial_days} Hari
                  </button>
                </form>
              )}

              {trialPernah && (
                <p className="text-center text-xs text-neutral-400">
                  Periode trial untuk kursus ini telah digunakan sebelumnya.
                </p>
              )}

              <form action={beliAkses}>
                <input type="hidden" name="slug" value={params.slug} />
                <input type="hidden" name="courseId" value={c!.id} />
                <button type="submit" className="btn-apple-primary w-full py-3.5 text-sm font-bold shadow-lg shadow-apple-blue/20">
                  Beli Akses Penuh · {rp(c!.price_idr)}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
