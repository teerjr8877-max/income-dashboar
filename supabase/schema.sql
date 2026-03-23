create table if not exists public.households (
  id uuid primary key,
  name text not null,
  slug text not null unique,
  invite_code_hash text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  display_name text,
  owner_label text not null check (owner_label in ('JR', 'Lisa', 'Joint')),
  role text not null default 'member',
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create table if not exists public.household_workspaces (
  household_id uuid primary key references public.households(id) on delete cascade,
  version bigint not null default 1,
  payload jsonb not null,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.household_workspaces enable row level security;

create policy "members can read their household"
on public.households for select
using (
  exists (
    select 1 from public.household_members hm
    where hm.household_id = households.id and hm.user_id = auth.uid()
  )
);

create policy "members can create household"
on public.households for insert
with check (created_by = auth.uid());

create policy "members can update their household"
on public.households for update
using (
  exists (
    select 1 from public.household_members hm
    where hm.household_id = households.id and hm.user_id = auth.uid()
  )
);

create policy "members can manage their membership"
on public.household_members for all
using (
  household_id in (
    select household_id from public.household_members where user_id = auth.uid()
  ) or user_id = auth.uid()
)
with check (
  household_id in (
    select household_id from public.household_members where user_id = auth.uid()
  ) or user_id = auth.uid()
);

create policy "members can read workspace"
on public.household_workspaces for select
using (
  household_id in (
    select household_id from public.household_members where user_id = auth.uid()
  )
);

create policy "members can update workspace"
on public.household_workspaces for insert
with check (
  household_id in (
    select household_id from public.household_members where user_id = auth.uid()
  )
);

create policy "members can patch workspace"
on public.household_workspaces for update
using (
  household_id in (
    select household_id from public.household_members where user_id = auth.uid()
  )
);
