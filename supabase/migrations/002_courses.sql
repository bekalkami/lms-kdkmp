-- LMS KDKMP · Tahap B: kursus, modul, pelajaran, lembar kerja, progres
create type lesson_type as enum ('teks','video','pdf','infografis');

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique, title text not null, description text not null default '',
  jabatan_target jabatan_t[] not null default '{manajer,pengurus,pengawas,staf_gerai}',  -- jalur belajar per jabatan
  position int not null default 0, published boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null, position int not null default 0
);
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null, type lesson_type not null default 'teks',
  content_md text not null default '',        -- teks selalu ada, jadi bisa dibaca tanpa video
  video_url text, file_url text,
  duration_min int not null default 5, position int not null default 0
);
create table public.worksheets (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null, instructions text not null default '', items jsonb not null default '[]'
);
create table public.enrollments (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  primary key (user_id, course_id)
);
create table public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
create index on public.modules (course_id);
create index on public.lessons (module_id);

alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.worksheets enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;

-- Konten: semua pengguna login boleh baca kursus terbit; hanya admin pusat yang mengelola.
create policy courses_read on public.courses for select to authenticated using (published or my_role() = 'admin_pusat');
create policy modules_read on public.modules for select to authenticated
  using (exists (select 1 from public.courses c where c.id = course_id and (c.published or my_role() = 'admin_pusat')));
create policy lessons_read on public.lessons for select to authenticated
  using (exists (select 1 from public.modules m join public.courses c on c.id = m.course_id
                 where m.id = module_id and (c.published or my_role() = 'admin_pusat')));
create policy worksheets_read on public.worksheets for select to authenticated using (true);
create policy courses_admin on public.courses for all to authenticated using (my_role() = 'admin_pusat') with check (my_role() = 'admin_pusat');
create policy modules_admin on public.modules for all to authenticated using (my_role() = 'admin_pusat') with check (my_role() = 'admin_pusat');
create policy lessons_admin on public.lessons for all to authenticated using (my_role() = 'admin_pusat') with check (my_role() = 'admin_pusat');
create policy worksheets_admin on public.worksheets for all to authenticated using (my_role() = 'admin_pusat') with check (my_role() = 'admin_pusat');

-- Progres: milik sendiri; admin pusat & admin wilayah (wilayahnya) boleh melihat.
create policy enroll_self on public.enrollments for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy progress_self on public.lesson_progress for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy enroll_admin on public.enrollments for select to authenticated using (
  my_role() = 'admin_pusat' or (my_role() = 'admin_wilayah' and exists
    (select 1 from public.profiles p where p.id = user_id and p.regency = my_regency())));
create policy progress_admin on public.lesson_progress for select to authenticated using (
  my_role() = 'admin_pusat' or (my_role() = 'admin_wilayah' and exists
    (select 1 from public.profiles p where p.id = user_id and p.regency = my_regency())));
