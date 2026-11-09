import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import AttemptForm from "@/components/AttemptForm";
export default async function Mengerjakan({ params }: { params: { id: string } }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data, error } = await sb.rpc("get_attempt", { p_attempt: params.id });
  if (error || !data) redirect("/kursus");
  if (data.submitted) redirect(`/ujian/hasil/${params.id}`);
  if (new Date(data.now).getTime() > new Date(data.deadline).getTime() + 15000) { // waktu habis saat halaman tertutup
    await sb.rpc("submit_attempt", { p_attempt: params.id }); redirect(`/ujian/hasil/${params.id}`);
  }
  return (<div className="space-y-4"><h1 className="text-2xl font-black">{data.title}</h1>
    <AttemptForm attemptId={params.id} deadline={data.deadline} serverNow={data.now} questions={data.questions} saved={data.saved} /></div>);
}
