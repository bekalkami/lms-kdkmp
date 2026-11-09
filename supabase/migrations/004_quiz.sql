-- LMS KDKMP · Tahap C: bank soal, kuis/ujian, percobaan. Kunci jawaban TIDAK pernah dikirim ke peserta;
-- semua penilaian dan timer dijalankan di database (fungsi SECURITY DEFINER).
create type quiz_type as enum ('modul','pre','post','final');

create table public.question_bank (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  body text not null, explanation text not null default '', created_at timestamptz not null default now());
create table public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.question_bank(id) on delete cascade,
  body text not null, is_correct boolean not null default false, position int not null default 0);
create unique index one_correct_option on public.question_options (question_id) where is_correct;
create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  type quiz_type not null, title text not null,
  time_limit_min int not null default 15 check (time_limit_min > 0),
  passing_score int not null default 70 check (passing_score between 0 and 100),
  question_count int not null default 10 check (question_count > 0),
  max_attempts int, position int not null default 0,
  unique (course_id, type, title));
create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  started_at timestamptz not null default now(), deadline timestamptz not null,
  submitted_at timestamptz, score int, passed boolean, question_ids uuid[] not null);
create table public.attempt_answers (
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  question_id uuid not null, option_id uuid not null, is_correct boolean,
  primary key (attempt_id, question_id));
create index on public.question_bank (course_id);
create index on public.question_options (question_id);
create index on public.attempts (user_id, quiz_id);

alter table public.question_bank enable row level security;
alter table public.question_options enable row level security;
alter table public.quizzes enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_answers enable row level security;

-- Peserta TIDAK bisa membaca bank soal/opsi (berisi kunci). Hanya admin pusat.
create policy bank_admin on public.question_bank for all to authenticated using (my_role() = 'admin_pusat') with check (my_role() = 'admin_pusat');
create policy options_admin on public.question_options for all to authenticated using (my_role() = 'admin_pusat') with check (my_role() = 'admin_pusat');
create policy quizzes_read on public.quizzes for select to authenticated using (true);
create policy quizzes_admin on public.quizzes for all to authenticated using (my_role() = 'admin_pusat') with check (my_role() = 'admin_pusat');
-- Percobaan: dibaca pemilik/admin; ditulis HANYA lewat fungsi di bawah (tidak ada policy insert/update).
create policy attempts_read on public.attempts for select to authenticated using (
  user_id = auth.uid() or my_role() = 'admin_pusat' or (my_role() = 'admin_wilayah' and exists
    (select 1 from public.profiles p where p.id = user_id and p.regency = my_regency())));
create policy answers_read on public.attempt_answers for select to authenticated using (
  exists (select 1 from public.attempts a where a.id = attempt_id and a.user_id = auth.uid()));

create function public.submit_attempt(p_attempt uuid) returns jsonb language plpgsql security definer set search_path = public as $$
declare a public.attempts; q public.quizzes; v_total int; v_ok int; v_score int; v_pass boolean;
begin
  select * into a from public.attempts where id = p_attempt and user_id = auth.uid() for update;
  if not found then raise exception 'Percobaan tidak ditemukan.'; end if;
  if a.submitted_at is not null then return jsonb_build_object('score', a.score, 'passed', a.passed); end if;
  select * into q from public.quizzes where id = a.quiz_id;
  update public.attempt_answers aa set is_correct = o.is_correct
    from public.question_options o where aa.attempt_id = a.id and o.id = aa.option_id;
  v_total := array_length(a.question_ids, 1);
  select count(*) into v_ok from public.attempt_answers where attempt_id = a.id and is_correct;
  v_score := round(100.0 * v_ok / v_total); v_pass := v_score >= q.passing_score;
  update public.attempts set submitted_at = now(), score = v_score, passed = v_pass where id = a.id;
  return jsonb_build_object('score', v_score, 'passed', v_pass);
end $$;

create function public.start_attempt(p_quiz uuid) returns uuid language plpgsql security definer set search_path = public as $$
declare q public.quizzes; a uuid; n int; ids uuid[]; tot int; done int;
begin
  if auth.uid() is null then raise exception 'Silakan masuk dulu.'; end if;
  select * into q from public.quizzes where id = p_quiz;
  if not found then raise exception 'Kuis tidak ditemukan.'; end if;
  select id into a from public.attempts where user_id = auth.uid() and quiz_id = p_quiz and submitted_at is null and deadline > now() order by started_at desc limit 1;
  if a is not null then return a; end if;   -- lanjutkan percobaan yang masih berjalan
  perform public.submit_attempt(id) from public.attempts where user_id = auth.uid() and quiz_id = p_quiz and submitted_at is null;  -- nilai yang kedaluwarsa
  if q.max_attempts is not null then
    select count(*) into n from public.attempts where user_id = auth.uid() and quiz_id = p_quiz;
    if n >= q.max_attempts then raise exception 'Batas percobaan sudah tercapai.'; end if;
  end if;
  if q.type = 'final' then
    select count(*), count(lp.lesson_id) into tot, done from public.lessons l join public.modules m on m.id = l.module_id
      left join public.lesson_progress lp on lp.lesson_id = l.id and lp.user_id = auth.uid() where m.course_id = q.course_id;
    if tot = 0 or done < tot then raise exception 'Selesaikan semua pelajaran dulu sebelum ujian akhir.'; end if;
  end if;
  select array_agg(id order by r) into ids from (select id, random() r from public.question_bank where course_id = q.course_id order by r limit q.question_count) s;
  if ids is null then raise exception 'Bank soal masih kosong.'; end if;
  insert into public.attempts (user_id, quiz_id, deadline, question_ids)
    values (auth.uid(), p_quiz, now() + make_interval(mins => q.time_limit_min), ids) returning id into a;
  return a;
end $$;

create function public.get_attempt(p_attempt uuid) returns jsonb language plpgsql security definer set search_path = public as $$
declare a public.attempts; q public.quizzes;
begin
  select * into a from public.attempts where id = p_attempt and user_id = auth.uid();
  if not found then raise exception 'Percobaan tidak ditemukan.'; end if;
  select * into q from public.quizzes where id = a.quiz_id;
  return jsonb_build_object('id', a.id, 'title', q.title, 'quiz_id', q.id, 'deadline', a.deadline, 'now', now(), 'submitted', a.submitted_at is not null,
    'questions', (select coalesce(jsonb_agg(jsonb_build_object('id', qb.id, 'body', qb.body,
        'options', (select jsonb_agg(jsonb_build_object('id', o.id, 'body', o.body) order by md5(a.id::text || o.id::text))
                    from public.question_options o where o.question_id = qb.id)) order by u.ord), '[]'::jsonb)
      from unnest(a.question_ids) with ordinality as u(qid, ord) join public.question_bank qb on qb.id = u.qid),
    'saved', (select coalesce(jsonb_object_agg(question_id, option_id), '{}'::jsonb) from public.attempt_answers where attempt_id = a.id));
end $$;

create function public.save_answer(p_attempt uuid, p_question uuid, p_option uuid) returns void language plpgsql security definer set search_path = public as $$
declare a public.attempts;
begin
  select * into a from public.attempts where id = p_attempt and user_id = auth.uid() for update;
  if not found or a.submitted_at is not null or now() > a.deadline + interval '15 seconds' then raise exception 'Jawaban tidak dapat disimpan (waktu habis atau sudah dikumpulkan).'; end if;
  if not (p_question = any (a.question_ids)) then raise exception 'Soal tidak valid.'; end if;
  if not exists (select 1 from public.question_options where id = p_option and question_id = p_question) then raise exception 'Pilihan tidak valid.'; end if;
  insert into public.attempt_answers (attempt_id, question_id, option_id) values (p_attempt, p_question, p_option)
    on conflict (attempt_id, question_id) do update set option_id = excluded.option_id;
end $$;

create function public.get_result(p_attempt uuid) returns jsonb language plpgsql security definer set search_path = public as $$
declare a public.attempts; q public.quizzes;
begin
  select * into a from public.attempts where id = p_attempt and user_id = auth.uid();
  if not found or a.submitted_at is null then raise exception 'Hasil belum tersedia.'; end if;
  select * into q from public.quizzes where id = a.quiz_id;
  return jsonb_build_object('title', q.title, 'quiz_id', q.id, 'score', a.score, 'passed', a.passed, 'passing', q.passing_score,
    'items', (select coalesce(jsonb_agg(jsonb_build_object('body', qb.body, 'explanation', qb.explanation, 'chosen', aa.option_id,
        'options', (select jsonb_agg(jsonb_build_object('id', o.id, 'body', o.body, 'correct', o.is_correct) order by o.position)
                    from public.question_options o where o.question_id = qb.id)) order by u.ord), '[]'::jsonb)
      from unnest(a.question_ids) with ordinality as u(qid, ord) join public.question_bank qb on qb.id = u.qid
      left join public.attempt_answers aa on aa.attempt_id = a.id and aa.question_id = qb.id));
end $$;

revoke execute on function public.start_attempt(uuid), public.get_attempt(uuid), public.save_answer(uuid, uuid, uuid), public.submit_attempt(uuid), public.get_result(uuid) from public, anon;
grant execute on function public.start_attempt(uuid), public.get_attempt(uuid), public.save_answer(uuid, uuid, uuid), public.submit_attempt(uuid), public.get_result(uuid) to authenticated;
