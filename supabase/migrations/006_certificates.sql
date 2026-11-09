-- LMS KDKMP · Tahap D: sertifikat otomatis + verifikasi publik
create sequence public.certificate_seq;
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,                 -- nomor tercetak, mis. LMS-KDKMP/2026/000001
  qr_token text not null unique,               -- token acak tak tertebak, dipakai di QR
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  attempt_id uuid not null references public.attempts(id),
  recipient_name text not null, course_title text not null, jabatan text, kdkmp_name text, score int,  -- salinan (snapshot)
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,                      -- admin pusat dapat mencabut
  unique (user_id, course_id)
);
alter table public.certificates enable row level security;
create policy cert_read on public.certificates for select to authenticated using (
  user_id = auth.uid() or my_role() = 'admin_pusat' or (my_role() = 'admin_wilayah' and exists
    (select 1 from public.profiles p where p.id = user_id and p.regency = my_regency())));
create policy cert_admin_update on public.certificates for update to authenticated using (my_role() = 'admin_pusat') with check (my_role() = 'admin_pusat');
-- Tidak ada policy insert: sertifikat hanya terbit lewat fungsi di bawah.

create function public.issue_certificate_internal(p_attempt uuid) returns uuid language plpgsql security definer set search_path = public as $$
declare a public.attempts; q public.quizzes; p public.profiles; c public.courses; k public.kdkmp; cid uuid;
begin
  select * into a from public.attempts where id = p_attempt;
  select * into q from public.quizzes where id = a.quiz_id;
  if q.type <> 'final' or a.passed is not true then return null; end if;   -- hanya ujian akhir yang lulus
  select id into cid from public.certificates where user_id = a.user_id and course_id = q.course_id;
  if cid is not null then return cid; end if;
  select * into p from public.profiles where id = a.user_id;
  select * into c from public.courses where id = q.course_id;
  select * into k from public.kdkmp where id = p.kdkmp_id;
  insert into public.certificates (number, qr_token, user_id, course_id, attempt_id, recipient_name, course_title, jabatan, kdkmp_name, score)
  values ('LMS-KDKMP/' || to_char(now(), 'YYYY') || '/' || lpad(nextval('public.certificate_seq')::text, 6, '0'),
          substr(replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''), 1, 24),
          a.user_id, q.course_id, a.id, coalesce(p.full_name, 'Peserta'), c.title, p.jabatan::text, k.name, a.score)
  on conflict (user_id, course_id) do nothing returning id into cid;
  return cid;
end $$;
revoke execute on function public.issue_certificate_internal(uuid) from public, anon, authenticated;

-- submit_attempt: sama seperti Tahap C + terbitkan sertifikat bila lulus ujian akhir
create or replace function public.submit_attempt(p_attempt uuid) returns jsonb language plpgsql security definer set search_path = public as $$
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
  perform public.issue_certificate_internal(a.id);
  return jsonb_build_object('score', v_score, 'passed', v_pass);
end $$;

-- Verifikasi publik. Lewat token QR: data lengkap. Lewat nomor: nama disamarkan
-- (nomor berurutan, jadi tidak boleh dipakai untuk menjaring nama orang).
create function public.verify_certificate(p_code text) returns jsonb language plpgsql security definer set search_path = public as $$
declare c public.certificates; by_token boolean; nm text;
begin
  select * into c from public.certificates where qr_token = trim(p_code);
  by_token := found;
  if not by_token then select * into c from public.certificates where number = trim(p_code); end if;
  if not found or c.revoked_at is not null then return jsonb_build_object('valid', false); end if;
  nm := c.recipient_name;
  if not by_token then
    nm := split_part(nm, ' ', 1) || case when position(' ' in nm) > 0 then ' ' || left(trim(substr(nm, position(' ' in nm))), 1) || '.' else '' end;
  end if;
  return jsonb_build_object('valid', true, 'masked', not by_token, 'number', c.number, 'name', nm, 'course', c.course_title,
    'jabatan', c.jabatan, 'kdkmp', case when by_token then c.kdkmp_name end, 'issued_at', c.issued_at);
end $$;
revoke execute on function public.verify_certificate(text) from public;
grant execute on function public.verify_certificate(text) to anon, authenticated;
