-- LMS KDKMP · Tahap E1: laporan (otomatis dibatasi RLS) + jejak audit
create table public.audit_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null, detail jsonb not null default '{}', created_at timestamptz not null default now());
alter table public.audit_logs enable row level security;
create policy audit_insert on public.audit_logs for insert to authenticated
  with check (user_id = auth.uid() and my_role() in ('admin_wilayah', 'admin_pusat'));
create policy audit_read on public.audit_logs for select to authenticated using (my_role() = 'admin_pusat');

-- SECURITY INVOKER: admin wilayah otomatis hanya melihat peserta wilayahnya (RLS tabel profiles/attempts/dll tetap berlaku).
create function public.report_participants(p_course uuid, p_province text default null, p_regency text default null, p_kdkmp uuid default null)
returns table (user_id uuid, full_name text, jabatan text, kdkmp text, village text, regency text, province text,
               lessons_total int, lessons_done int, avg_score int, final_passed boolean, certificate_number text)
language sql stable security invoker set search_path = public as $$
  select p.id, p.full_name, p.jabatan::text, k.name, k.village, p.regency, p.province,
    (select count(*) from lessons l join modules m on m.id = l.module_id where m.course_id = p_course)::int,
    (select count(*) from lesson_progress lp join lessons l on l.id = lp.lesson_id join modules m on m.id = l.module_id
       where m.course_id = p_course and lp.user_id = p.id)::int,
    (select round(avg(best))::int from (select max(a.score) best from attempts a join quizzes z on z.id = a.quiz_id
       where a.user_id = p.id and z.course_id = p_course and a.submitted_at is not null and z.type <> 'pre' group by a.quiz_id) s),
    coalesce((select bool_or(a.passed) from attempts a join quizzes z on z.id = a.quiz_id
       where a.user_id = p.id and z.course_id = p_course and z.type = 'final' and a.submitted_at is not null), false),
    (select c.number from certificates c where c.user_id = p.id and c.course_id = p_course and c.revoked_at is null)
  from profiles p left join kdkmp k on k.id = p.kdkmp_id
  where p.role = 'peserta'
    and (p_province is null or p.province = p_province)
    and (p_regency is null or p.regency = p_regency)
    and (p_kdkmp is null or p.kdkmp_id = p_kdkmp)
  order by p.full_name, p.id
$$;
revoke execute on function public.report_participants(uuid, text, text, uuid) from public, anon;
grant execute on function public.report_participants(uuid, text, text, uuid) to authenticated;
