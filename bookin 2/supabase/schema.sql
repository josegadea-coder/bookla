-- Bookin: lab equipment booking schema
-- Run this in the Supabase SQL editor (or via `supabase db push`)

-- ─────────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists btree_gist; -- needed for the exclusion constraint below

-- ─────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────

create table labs (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Extends Supabase's built-in auth.users with app-specific fields
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'member' check (role in ('member', 'lab_admin', 'super_admin')),
  lab_id uuid references labs(id) on delete set null,
  created_at timestamptz not null default now()
);

create table equipment (
  id uuid primary key default uuid_generate_v4(),
  lab_id uuid not null references labs(id) on delete cascade,
  name text not null,
  category text not null default 'general',
  location text not null default '',
  status text not null default 'active' check (status in ('active', 'maintenance', 'retired')),
  min_booking_minutes int not null default 15,
  max_booking_minutes int not null default 480,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table bookings (
  id uuid primary key default uuid_generate_v4(),
  equipment_id uuid not null references equipment(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  purpose text not null default '',
  created_at timestamptz not null default now(),
  constraint valid_time_range check (end_time > start_time)
);

-- Admin-defined blackout windows (maintenance, cleaning, etc.)
create table equipment_blackouts (
  id uuid primary key default uuid_generate_v4(),
  equipment_id uuid not null references equipment(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  reason text not null default 'Maintenance',
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  constraint valid_blackout_range check (end_time > start_time)
);

-- ─────────────────────────────────────────────
-- Conflict prevention (this is what makes first-come-first-served safe)
-- Postgres exclusion constraint: no two ACTIVE bookings for the same
-- equipment can have overlapping time ranges. This is enforced at the
-- database level, so it holds even under concurrent requests.
-- ─────────────────────────────────────────────

alter table bookings
  add constraint no_overlapping_bookings
  exclude using gist (
    equipment_id with =,
    tstzrange(start_time, end_time) with &&
  )
  where (status = 'confirmed');

-- ─────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────

create index idx_equipment_lab on equipment(lab_id);
create index idx_bookings_equipment on bookings(equipment_id);
create index idx_bookings_user on bookings(user_id);
create index idx_bookings_time on bookings(start_time, end_time);
create index idx_blackouts_equipment on equipment_blackouts(equipment_id);

-- ─────────────────────────────────────────────
-- Auto-create a profile row when someone signs up
-- ─────────────────────────────────────────────

create function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────

alter table labs enable row level security;
alter table profiles enable row level security;
alter table equipment enable row level security;
alter table bookings enable row level security;
alter table equipment_blackouts enable row level security;

-- Labs: everyone signed in can see the list of labs (institution-wide visibility)
create policy "Labs are viewable by all authenticated users"
  on labs for select
  using (auth.role() = 'authenticated');

-- Profiles: users can see all profiles (needed to show "booked by X"), but only edit their own
create policy "Profiles are viewable by authenticated users"
  on profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Equipment: viewable institution-wide; only lab_admin/super_admin can modify
create policy "Equipment is viewable by all authenticated users"
  on equipment for select
  using (auth.role() = 'authenticated');

create policy "Admins can insert equipment"
  on equipment for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('lab_admin', 'super_admin')
    )
  );

create policy "Admins can update equipment"
  on equipment for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('lab_admin', 'super_admin')
    )
  );

create policy "Admins can delete equipment"
  on equipment for delete
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('lab_admin', 'super_admin')
    )
  );

-- Bookings: viewable by all (so people can see what's taken); users create/cancel their own,
-- admins can cancel any booking on equipment in their lab
create policy "Bookings are viewable by all authenticated users"
  on bookings for select
  using (auth.role() = 'authenticated');

create policy "Users can create their own bookings"
  on bookings for insert
  with check (auth.uid() = user_id);

create policy "Users can cancel their own bookings"
  on bookings for update
  using (auth.uid() = user_id);

create policy "Admins can update any booking"
  on bookings for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('lab_admin', 'super_admin')
    )
  );

-- Blackouts: viewable by all, only admins can create/manage
create policy "Blackouts are viewable by all authenticated users"
  on equipment_blackouts for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage blackouts"
  on equipment_blackouts for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('lab_admin', 'super_admin')
    )
  );

create policy "Admins can delete blackouts"
  on equipment_blackouts for delete
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('lab_admin', 'super_admin')
    )
  );

-- ─────────────────────────────────────────────
-- Seed data (optional — remove for production)
-- ─────────────────────────────────────────────

insert into labs (name) values
  ('Molecular Biology Lab'),
  ('Materials Science Lab'),
  ('Imaging Core Facility');
