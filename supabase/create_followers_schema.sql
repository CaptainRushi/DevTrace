-- Create Followers Table
create table if not exists public.followers (
  follower_id uuid references public.users(id) on delete cascade not null,
  following_id uuid references public.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

-- Enable RLS
alter table public.followers enable row level security;

-- Policies
create policy "Anyone can read followers"
  on public.followers for select
  using (true);

create policy "Authenticated users can follow"
  on public.followers for insert
  with check (auth.uid() = follower_id);

create policy "Authenticated users can unfollow"
  on public.followers for delete
  using (auth.uid() = follower_id);

-- Indexes
create index if not exists idx_followers_follower_id on public.followers(follower_id);
create index if not exists idx_followers_following_id on public.followers(following_id);

-- Notifications Trigger (Optional but good for completeness based on previous prompt)
-- We will handle notification creation in the API for now to match previous pattern.
