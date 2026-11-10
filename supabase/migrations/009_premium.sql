-- LMS KDKMP · Tahap G: konten premium, trial license, pesanan QRIS
-- Atur harga kursus (contoh):
--   update courses set is_premium = true, price_idr = 149000, trial_days = 7, access_days = 365 where slug = '...';
--   access_days NULL = akses seumur hidup. Tandai pelajaran contoh gratis: update lessons set is_preview = true where id = '...';

alter table public.courses
  add column is_premium boolean not null default false,
  add column price_idr int not null default 0 check (price_idr >= 0),
  add column trial_days int not null default 0 check (trial_days >= 0),
  add column access_days int check (access_days is null or access_days > 0);
alter table public.lessons add column is_preview boolean not null default false;

create type entitlement_kind as enum ('trial', 'paid');
create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  kind entitlement_kind not null,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,                 -- NULL = tanpa batas
  order_id uuid,
  created_at timestamptz not null default now(),
  unique (user_id, course_id, kind)       -- 1 trial per akun per kursus
);
create table public.trial_claims (        -- 1 trial per EMAIL (kanonik) per kursus, lintas akun
  email_canonical text not null,
  course_id uuid not null references public.courses(id) on delete cascade,
  claimed_at timestamptz not null default now(),
  primary key (email_canonical, course_id)
);
create type order_status as enum ('pending', 'paid', 'expired', 'failed');
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id),
  amount_idr int not null check (amount_idr > 0),   -- harga dibekukan saat pesanan dibuat
  status order_status not null default 'pending',
  provider text not null default 'midtrans',
  qr_string text,
  expires_at timestamptz not null,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.orders (user_id, created_at desc);
create table public.payment_events (
  id bigint generated always as identity primary key,
  order_id uuid, provider text not null, payload jsonb not null,
  received_at timestamptz not null default now()
);

alter table public.entitlements enable row level security;
alter table public.trial_claims enable row level security;
alter table public.orders enable row level security;
alter table public.payment_events enable row level security;
create policy ent_read on public.entitlements for select to authenticated using (user_id = auth.uid() or my_role() = 'admin_pusat');
create policy orders_read on public.orders for select to authenticated using (user_id = auth.uid() or my_role() = 'admin_pusat');
create policy events_read on public.payment_events for select to authenticated using (my_role() = 'admin_pusat');
-- Tidak ada policy tulis di tabel-tabel ini: hanya fungsi di bawah dan server (service role).

create function public.has_access(p_course uuid) returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select not c.is_premium from public.courses c where c.id = p_course), false)
      or coalesce(public.my_role() = 'admin_pusat', false)
      or exists (select 1 from public.entitlements e
                 where e.user_id = auth.uid() and e.course_id = p_course and (e.expires_at is null or e.expires_at > now()))
$$;
grant execute on function public.has_access(uuid) to authenticated;

-- Gerbang konten di database (bukan hanya di tampilan)
drop policy lessons_read on public.lessons;
create policy lessons_read on public.lessons for select to authenticated using (
  my_role() = 'admin_pusat' or exists (
    select 1 from public.modules m join public.courses c on c.id = m.course_id
    where m.id = lessons.module_id and c.published and (lessons.is_preview or public.has_access(c.id))));
drop policy worksheets_read on public.worksheets;
create policy worksheets_read on public.worksheets for select to authenticated using (
  my_role() = 'admin_pusat' or exists (
    select 1 from public.modules m join public.courses c on c.id = m.course_id
    where m.id = worksheets.module_id and c.published and public.has_access(c.id)));

create function public.start_trial(p_course uuid) returns timestamptz language plpgsql security definer set search_path = public as $$
declare c public.courses; ev public.email_verified; exp timestamptz;
begin
  if auth.uid() is null then raise exception 'Silakan masuk dulu.'; end if;
  select * into c from public.courses where id = p_course and published;
  if not found or not c.is_premium then raise exception 'Kursus ini tidak memerlukan trial.'; end if;
  if c.trial_days <= 0 then raise exception 'Kursus ini tidak menyediakan trial.'; end if;
  select * into ev from public.email_verified where user_id = auth.uid();
  if not found then raise exception 'Verifikasi email dulu sebelum mencoba trial.'; end if;
  begin
    insert into public.trial_claims (email_canonical, course_id) values (ev.email_canonical, p_course);
  exception when unique_violation then
    raise exception 'Trial untuk kursus ini sudah pernah dipakai.';
  end;
  exp := now() + make_interval(days => c.trial_days);
  insert into public.entitlements (user_id, course_id, kind, expires_at) values (auth.uid(), p_course, 'trial', exp);
  return exp;
end $$;
grant execute on function public.start_trial(uuid) to authenticated;

-- Dipanggil HANYA oleh server setelah pembayaran terverifikasi ke gateway. Aman dipanggil berulang.
create function public.fulfill_order(p_order uuid) returns boolean language plpgsql security definer set search_path = public as $$
declare o public.orders; c public.courses; base timestamptz; had boolean; exp timestamptz;
begin
  select * into o from public.orders where id = p_order for update;
  if not found then return false; end if;
  if o.status = 'paid' then return true; end if;
  select * into c from public.courses where id = o.course_id;
  update public.orders set status = 'paid', paid_at = now() where id = o.id;
  select expires_at into base from public.entitlements where user_id = o.user_id and course_id = o.course_id and kind = 'paid';
  had := found;
  if (had and base is null) or c.access_days is null then exp := null;
  else exp := greatest(coalesce(base, now()), now()) + make_interval(days => c.access_days);
  end if;
  insert into public.entitlements (user_id, course_id, kind, expires_at, order_id)
    values (o.user_id, o.course_id, 'paid', exp, o.id)
    on conflict (user_id, course_id, kind) do update set expires_at = excluded.expires_at, order_id = excluded.order_id;
  return true;
end $$;
revoke execute on function public.fulfill_order(uuid) from public, anon, authenticated;
grant execute on function public.fulfill_order(uuid) to service_role;

-- Ujian/kuis kursus premium hanya untuk yang punya akses
create or replace function public.start_attempt(p_quiz uuid) returns uuid language plpgsql security definer set search_path = public as $$
declare q public.quizzes; a uuid; n int; ids uuid[]; tot int; done int;
begin
  if auth.uid() is null then raise exception 'Silakan masuk dulu.'; end if;
  select * into q from public.quizzes where id = p_quiz;
  if not found then raise exception 'Kuis tidak ditemukan.'; end if;
  if not public.has_access(q.course_id) then raise exception 'Kursus ini premium. Aktifkan trial atau beli akses dulu.'; end if;
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
