-- LMS KDKMP · Tahap A: peran, profil, KDKMP, RLS
create type app_role as enum ('peserta','fasilitator','admin_wilayah','admin_pusat');
create type jabatan_t as enum ('manajer','pengurus','pengawas','staf_gerai');

create table public.kdkmp (
  id uuid primary key default gen_random_uuid(),
  name text not null, village text not null, regency text not null, province text not null,
  created_at timestamptz not null default now(),
  unique (name, regency)
);
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null, phone text,
  jabatan jabatan_t not null default 'staf_gerai',
  role app_role not null default 'peserta',
  kdkmp_id uuid references public.kdkmp(id),
  regency text, province text,
  created_at timestamptz not null default now()
);
create index on public.profiles (regency);
create index on public.profiles (kdkmp_id);

create function public.my_role() returns app_role language sql stable security definer set search_path = public
  as $$ select role from public.profiles where id = auth.uid() $$;
create function public.my_regency() returns text language sql stable security definer set search_path = public
  as $$ select regency from public.profiles where id = auth.uid() $$;

-- Pendaftar publik SELALU 'peserta'; peran lain hanya diubah admin pusat.
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare k uuid; m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  if coalesce(m->>'kdkmp_name','') <> '' then
    insert into public.kdkmp (name, village, regency, province)
    values (m->>'kdkmp_name', coalesce(m->>'village',''), coalesce(m->>'regency',''), coalesce(m->>'province',''))
    on conflict (name, regency) do update set name = excluded.name returning id into k;
  end if;
  insert into public.profiles (id, full_name, phone, jabatan, kdkmp_id, regency, province)
  values (new.id, coalesce(nullif(m->>'full_name',''),'Peserta'), m->>'phone',
          coalesce(nullif(m->>'jabatan',''),'staf_gerai')::jabatan_t, k, m->>'regency', m->>'province');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.kdkmp enable row level security;
alter table public.profiles enable row level security;

create policy kdkmp_read on public.kdkmp for select to authenticated using (true);
create policy kdkmp_admin on public.kdkmp for all to authenticated
  using (my_role() = 'admin_pusat') with check (my_role() = 'admin_pusat');

create policy profiles_read on public.profiles for select to authenticated using (
  id = auth.uid() or my_role() = 'admin_pusat'
  or (my_role() = 'admin_wilayah' and regency = my_regency()));
-- Peserta boleh ubah profilnya sendiri, tapi TIDAK boleh mengubah peran/wilayah-nya.
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid() and role = my_role());
create policy profiles_admin_all on public.profiles for all to authenticated
  using (my_role() = 'admin_pusat') with check (my_role() = 'admin_pusat');
