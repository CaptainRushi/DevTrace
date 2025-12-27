-- Create User Settings table
create table if not exists public.user_settings (
  user_id uuid primary key references public.users(id) on delete cascade not null,
  notification_preferences jsonb default '{"email_digest": true, "push_mentions": true, "push_likes": true}'::jsonb,
  privacy_preferences jsonb default '{"show_email": false, "profile_visibility": "public"}'::jsonb,
  appearance_preferences jsonb default '{"theme": "system", "sidebar_expanded": false}'::jsonb,
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.user_settings enable row level security;

-- Policies
drop policy if exists "Users can view own settings" on public.user_settings;
create policy "Users can view own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update own settings" on public.user_settings;
create policy "Users can update own settings"
  on public.user_settings for update
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own settings" on public.user_settings;
create policy "Users can insert own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

-- Auto-create settings profile on user creation (Trigger)
create or replace function public.handle_new_user_settings()
returns trigger as $$
begin
  insert into public.user_settings (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create settings row when a new user is inserted into public.users
-- Note: Assuming public.users is populated by another trigger from auth.users, or handled by the app.
-- If public.users is the main profile table, we can attach this.
-- Be careful not to duplicate triggers if one already exists for profiles.
-- For safety, allow insert via API if not exists.
