import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import {
  simpanKursus, hapusKursus, simpanModul, hapusModul,
  simpanMateri, hapusMateri, simpanKuis, hapusKuis,
  simpanSoal, hapusSoal,
} from "./actions";

export const dynamic = "force-dynamic";
type SP = { course?: string };
const field = "input";
const btn = "rounded-xl bg-merah px-4 py-3 font-bold text-white";
const danger = "rounded-xl border-2 border-red-300 px-4 py-2 font-bold text-red-700";
const box = "space-y-3 rounded-2xl border-2 border-gray-200 p-4";
const label = "block text-sm font-bold text-gray-600";
function Input({ name, label: title, value = "", type = "text", required = false }: {name:string;label:string;value?:string|number;type?:string;required?:boolean}) {
  return <label className={label}>{title}<input className={field+" mt-1"} name={name} type={type} defaultValue={value} required={required}/></label>;
}
function Textarea({ name, label: title, value = "" }: {name:string;label:string;value?:string}) {
  return <label className={label}>{title}<textarea className={field+" mt-1 min-h-24"} name={name} defaultValue={value}/></label>;
}
function CourseSelect({ courses, name="course_id", value="" }: {courses:any[];name?:string;value?:string}) {
  return <label className={label}>Kursus<select className={field+" mt-1"} name={name} defaultValue={value} required>
    <option value="">Pilih kursus</option>{courses.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label>;
}
function ModuleSelect({ modules, value="" }: {modules:any[];value?:string}) {
  return <label className={label}>Modul<select className={field+" mt-1"} name="module_id" defaultValue={value} required>
    <option value="">Pilih modul</option>{modules.map(m=><option key={m.id} value={m.id}>{m.course_title} — {m.title}</option>)}</select></label>;
}
function Delete({ action, id, text="Hapus" }: {action:(fd:FormData)=>void;id:string;text?:string}) {
  return <form action={action}><input type="hidden" name="id" value={id}/><button className={danger} type="submit">{text}</button></form>;
}
export default async function AdminKonten({searchParams}:{searchParams:SP}) {
  const sb = supabaseServer();
  const {data:{user}} = await sb.auth.getUser();
  if(!user) redirect("/login");
  const {data:profile}=await sb.from("profiles").select("role").eq("id",user.id).single();
  if(profile?.role!=="admin_pusat") redirect("/dasbor");

  const [{data:courses},{data:modules},{data:quizzes},{data:questions}] = await Promise.all([
    sb.from("courses").select("*").order("position"),
    sb.from("modules").select("id,course_id,title,position,courses(title)").order("position"),
    sb.from("quizzes").select("*").order("position"),
    sb.from("question_bank").select("id,course_id,body,explanation,question_options(id,body,is_correct,position)").order("created_at",{ascending:false}).limit(300),
  ]);
  const cs=courses??[], ms=(modules??[]).map((m:any)=>({...m,course_title:Array.isArray(m.courses)?m.courses[0]?.title:m.courses?.title}));
  const courseId=searchParams.course && cs.some(c=>c.id===searchParams.course)?searchParams.course:cs[0]?.id;
  const active=cs.find(c=>c.id===courseId);
  const selectedModules=ms.filter(m=>m.course_id===courseId);
  const moduleIds=selectedModules.map(m=>m.id);
  const [{data:lessons},{data:quizAttempts},{data:questionAttempts}] = await Promise.all([
    moduleIds.length?sb.from("lessons").select("*").in("module_id",moduleIds).order("position") : Promise.resolve({data:[] as any[]}),
    sb.from("attempts").select("quiz_id"),
    sb.from("attempts").select("question_ids"),
  ]);
  const qs=(quizzes??[]).filter(q=>q.course_id===courseId);
  const qbank=(questions??[]).filter(q=>q.course_id===courseId);
  const attemptedQuiz=new Set((quizAttempts??[]).map(a=>a.quiz_id));
  const usedQuestions=new Set((questionAttempts??[]).flatMap(a=>a.question_ids??[]));
  const tab=(name:string)=>`/admin/konten${courseId?`?course=${courseId}`:""}#${name}`;

  return <div className="space-y-6">
    <Link href="/dasbor" className="font-bold text-merah underline">← Dasbor</Link>
    <header><p className="text-sm font-bold uppercase text-merah">Admin pusat</p><h1 className="text-2xl font-black">Kelola Konten LMS</h1>
      <p className="mt-1 text-sm text-gray-600">Atur kursus, modul, materi, ujian, dan bank soal. Perubahan langsung tersimpan ke Supabase.</p></header>

    <section className={box} id="kursus">
      <h2 className="text-lg font-black text-merah">1. Kursus</h2>
      <form action={simpanKursus} className="grid gap-3 md:grid-cols-2">
        <Input name="slug" label="Slug (URL)" required/><Input name="title" label="Judul kursus" required/>
        <Textarea name="description" label="Deskripsi singkat"/><Input name="position" label="Urutan" type="number" value={cs.length+1}/>
        <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="published" defaultChecked/> Terbitkan kursus</label>
        <button className={btn}>+ Tambah kursus</button>
      </form>
      <div className="space-y-2">{cs.map(c=><details key={c.id} className="rounded-xl bg-gray-50 p-3">
        <summary className="cursor-pointer font-bold">{c.position}. {c.title} <span className="text-xs text-gray-500">({c.published?"Terbit":"Draft"})</span></summary>
        <form action={simpanKursus} className="mt-3 grid gap-3">
          <input type="hidden" name="id" value={c.id}/><Input name="slug" label="Slug" value={c.slug} required/>
          <Input name="title" label="Judul" value={c.title} required/><Textarea name="description" label="Deskripsi" value={c.description}/>
          <Input name="position" label="Urutan" type="number" value={c.position}/>
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="published" defaultChecked={c.published}/> Terbitkan kursus</label>
          <button className={btn}>Simpan perubahan</button>
        </form><div className="mt-2"><Delete action={hapusKursus} id={c.id}/></div>
      </details>)}</div>
    </section>

    <section className={box}>
      <h2 className="text-lg font-black text-merah">Pilih kursus yang akan dikelola</h2>
      <form className="flex gap-2"><select name="course" className={field+" flex-1"} defaultValue={courseId??""}>{cs.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select><button className={btn}>Buka</button></form>
      {!active&&<p>Tambahkan kursus terlebih dahulu.</p>}
    </section>

    {active&&<>
    <nav className="flex flex-wrap gap-2 text-sm font-bold">
      {[["Modul & Materi","modul"],["Kuis & Ujian","kuis"],["Bank Soal","soal"]].map(([t,id])=><a key={id} href={tab(id)} className="rounded-full border-2 border-merah px-3 py-2 text-merah">{t}</a>)}
    </nav>
    <section className={box} id="modul">
      <h2 className="text-lg font-black text-merah">2. Modul dan Materi</h2>
      <form action={simpanModul} className="grid gap-3 md:grid-cols-3">
        <input type="hidden" name="course_id" value={courseId}/><Input name="title" label="Nama modul baru" required/><Input name="position" label="Urutan" type="number" value={selectedModules.length+1}/><button className={btn}>+ Tambah modul</button>
      </form>
      {selectedModules.map(m=><div key={m.id} className="space-y-3 rounded-xl bg-gray-50 p-3">
        <details><summary className="cursor-pointer font-bold">Modul {m.position}: {m.title}</summary>
          <form action={simpanModul} className="mt-3 grid gap-2 md:grid-cols-3"><input type="hidden" name="id" value={m.id}/><input type="hidden" name="course_id" value={courseId}/><Input name="title" label="Nama modul" value={m.title} required/><Input name="position" label="Urutan" type="number" value={m.position}/><button className={btn}>Simpan modul</button></form>
          <div className="mt-2"><Delete action={hapusModul} id={m.id}/></div>
        </details>
        {(lessons??[]).filter(l=>l.module_id===m.id).map(l=><details key={l.id} className="rounded-xl border bg-white p-3">
          <summary className="cursor-pointer font-semibold">{l.position}. {l.title} <span className="text-xs text-gray-500">· {l.type}</span></summary>
          <form action={simpanMateri} className="mt-3 space-y-3">
            <input type="hidden" name="id" value={l.id}/><input type="hidden" name="module_id" value={m.id}/>
            <Input name="title" label="Judul materi" value={l.title} required/>
            <div className="grid grid-cols-2 gap-2"><label className={label}>Jenis materi<select className={field+" mt-1"} name="type" defaultValue={l.type}><option value="teks">Teks</option><option value="video">Video</option><option value="pdf">PDF</option><option value="infografis">Infografis</option></select></label><Input name="duration_min" label="Durasi (menit)" type="number" value={l.duration_min}/><Input name="position" label="Urutan" type="number" value={l.position}/></div>
            <Textarea name="content_md" label="Isi materi (Markdown)" value={l.content_md}/>
            <Input name="video_url" label="URL video (opsional)" value={l.video_url??""}/><Input name="file_url" label="URL file PDF/gambar (opsional)" value={l.file_url??""}/>
            <button className={btn}>Simpan materi</button>
          </form><div className="mt-2"><Delete action={hapusMateri} id={l.id}/></div>
        </details>)}
        <details className="rounded-xl border-2 border-dashed border-merah bg-white p-3"><summary className="cursor-pointer font-bold text-merah">+ Tambah materi ke modul ini</summary>
          <form action={simpanMateri} className="mt-3 space-y-3"><input type="hidden" name="module_id" value={m.id}/>
            <Input name="title" label="Judul materi" required/>
            <div className="grid grid-cols-2 gap-2"><label className={label}>Jenis<select name="type" className={field+" mt-1"}><option value="teks">Teks</option><option value="video">Video</option><option value="pdf">PDF</option><option value="infografis">Infografis</option></select></label><Input name="duration_min" label="Durasi (menit)" type="number" value={5}/><Input name="position" label="Urutan" type="number" value={(lessons??[]).filter(l=>l.module_id===m.id).length+1}/></div>
            <Textarea name="content_md" label="Isi materi (Markdown)"/><Input name="video_url" label="URL video (opsional)"/><Input name="file_url" label="URL file (opsional)"/><button className={btn}>Tambah materi</button>
          </form>
        </details>
      </div>)}
    </section>

    <section className={box} id="kuis">
      <h2 className="text-lg font-black text-merah">3. Pengaturan Kuis dan Ujian</h2>
      <form action={simpanKuis} className="grid gap-3 md:grid-cols-2">
        <input type="hidden" name="course_id" value={courseId}/><Input name="title" label="Nama kuis/ujian" required/>
        <label className={label}>Jenis<select className={field+" mt-1"} name="type"><option value="pre">Pre-test</option><option value="modul">Kuis modul</option><option value="post">Post-test</option><option value="final">Ujian akhir</option></select></label>
        <Input name="time_limit_min" label="Waktu (menit)" type="number" value={15}/><Input name="passing_score" label="Nilai minimum lulus (0–100)" type="number" value={70}/>
        <Input name="question_count" label="Jumlah soal per ujian" type="number" value={10}/><Input name="max_attempts" label="Batas percobaan (kosong = tanpa batas)" type="number"/>
        <Input name="position" label="Urutan" type="number" value={qs.length+1}/><button className={btn}>+ Tambah kuis/ujian</button>
      </form>
      <div className="space-y-2">{qs.map(q=><details key={q.id} className="rounded-xl bg-gray-50 p-3">
        <summary className="cursor-pointer font-bold">{q.title} <span className="text-xs text-gray-500">· {q.type} · {q.question_count} soal</span></summary>
        <form action={simpanKuis} className="mt-3 grid gap-3 md:grid-cols-2"><input type="hidden" name="id" value={q.id}/><input type="hidden" name="course_id" value={courseId}/>
          <Input name="title" label="Judul" value={q.title} required/><label className={label}>Jenis<select name="type" className={field+" mt-1"} defaultValue={q.type}><option value="pre">Pre-test</option><option value="modul">Kuis modul</option><option value="post">Post-test</option><option value="final">Ujian akhir</option></select></label>
          <Input name="time_limit_min" label="Waktu (menit)" type="number" value={q.time_limit_min}/><Input name="passing_score" label="Nilai minimum" type="number" value={q.passing_score}/>
          <Input name="question_count" label="Jumlah soal" type="number" value={q.question_count}/><Input name="max_attempts" label="Batas percobaan (kosong = tanpa batas)" type="number" value={q.max_attempts??""}/>
          <Input name="position" label="Urutan" type="number" value={q.position}/><button className={btn}>Simpan pengaturan</button>
        </form>{attemptedQuiz.has(q.id)&&<p className="mt-2 text-xs text-gray-600">Kuis sudah memiliki riwayat peserta; pengaturan dapat diubah, tetapi kuis tidak dapat dihapus.</p>}
        {!attemptedQuiz.has(q.id)&&<div className="mt-2"><Delete action={hapusKuis} id={q.id}/></div>}
      </details>)}</div>
    </section>

    <section className={box} id="soal">
      <h2 className="text-lg font-black text-merah">4. Bank Soal</h2>
      <p className="text-sm text-gray-600">Setiap soal memakai empat pilihan dan satu jawaban benar. Soal baru otomatis tersedia untuk kuis kursus ini.</p>
      <details open className="rounded-xl bg-merah-muda p-3"><summary className="cursor-pointer font-bold text-merah">+ Tambah soal baru</summary>
        <form action={simpanSoal} className="mt-3 space-y-3"><input type="hidden" name="course_id" value={courseId}/>
          <Textarea name="body" label="Pertanyaan" /><Input name="option1" label="Pilihan A" required/><Input name="option2" label="Pilihan B" required/><Input name="option3" label="Pilihan C" required/><Input name="option4" label="Pilihan D" required/>
          <label className={label}>Jawaban benar<select className={field+" mt-1"} name="correct"><option value="1">A</option><option value="2">B</option><option value="3">C</option><option value="4">D</option></select></label>
          <Textarea name="explanation" label="Pembahasan jawaban"/>
          <button className={btn}>Simpan soal</button>
        </form>
      </details>
      <p className="font-bold">{qbank.length} soal pada kursus ini (maksimal 300 ditampilkan).</p>
      <div className="space-y-2">{qbank.map((q:any,i:number)=>{
        const opts=[...(q.question_options??[])].sort((a:any,b:any)=>a.position-b.position);
        const used=usedQuestions.has(q.id);
        return <details key={q.id} className="rounded-xl bg-gray-50 p-3">
          <summary className="cursor-pointer font-semibold">{i+1}. {q.body} {used&&<span className="text-xs text-gray-500">· sudah dipakai ujian</span>}</summary>
          <ul className="my-2 space-y-1 text-sm">{opts.map((o:any,j:number)=><li key={o.id}>{String.fromCharCode(65+j)}. {o.body} {o.is_correct?"✓ benar":""}</li>)}</ul>
          {used?<p className="text-sm text-gray-600">Soal ini dikunci karena sudah masuk riwayat ujian. Tambahkan soal baru jika ingin menggantinya.</p>:<><form action={simpanSoal} className="space-y-3"><input type="hidden" name="id" value={q.id}/><input type="hidden" name="course_id" value={courseId}/>
            <Textarea name="body" label="Pertanyaan" value={q.body}/>
            {[0,1,2,3].map(j=><Input key={j} name={`option${j+1}`} label={`Pilihan ${String.fromCharCode(65+j)}`} value={opts[j]?.body??""} required/>)}
            <label className={label}>Jawaban benar<select name="correct" className={field+" mt-1"} defaultValue={Math.max(1,opts.findIndex((o:any)=>o.is_correct)+1)}>{[1,2,3,4].map(j=><option key={j} value={j}>{String.fromCharCode(64+j)}</option>)}</select></label>
            <Textarea name="explanation" label="Pembahasan" value={q.explanation}/><button className={btn}>Simpan perubahan soal</button>
          </form><div className="mt-2"><Delete action={hapusSoal} id={q.id}/></div></>}
        </details>;
      })}</div>
    </section>
    </>}
    <p className="text-xs text-gray-500">Akses halaman ini hanya untuk admin pusat. Data ujian dan sertifikat peserta tidak dihapus oleh perubahan konten.</p>
  </div>;
}
