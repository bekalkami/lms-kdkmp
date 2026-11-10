-- LMS KDKMP · Tahap F: verifikasi email bertahap (kode 6 digit), dipakai untuk trial & pembayaran
-- Login nomor WA tetap tanpa verifikasi. Email asli hanya diminta saat peserta mau trial/bayar.

create table public.email_verified (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  email_canonical text not null unique,   -- gmail: titik & +alias dibuang, supaya 1 orang = 1 trial
  verified_at timestamptz not null default now()
);
alter table public.email_verified enable row level security;
create policy email_verified_read on public.email_verified for select to authenticated using (user_id = auth.uid());
-- Tidak ada policy tulis: hanya server (service role) yang mengisi, setelah kode benar.

create table public.email_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  email_canonical text not null,
  code_hash text not null,                -- hash kode, bukan kode asli
  expires_at timestamptz not null,
  attempts int not null default 0,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.email_codes (user_id, created_at desc);
alter table public.email_codes enable row level security;   -- sengaja tanpa policy: tertutup untuk klien

create function public.is_email_verified() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.email_verified where user_id = auth.uid())
$$;
grant execute on function public.is_email_verified() to authenticated;
