-- 1. Users table (Profile extension)
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  bio text,
  avatar_url text,
  skills text[],
  created_at timestamp default now()
);

-- 2. Communities table (Prebuilt only)
create table communities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  category text,
  created_at timestamp default now()
);

-- 3. Community Members table
create table community_members (
  user_id uuid references users(id) on delete cascade,
  community_id uuid references communities(id) on delete cascade,
  joined_at timestamp default now(),
  primary key (user_id, community_id)
);

-- 4. Posts table
create table posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  community_id uuid references communities(id),
  title text,
  content text,
  type text check (
    type in (
      'journey',
      'question',
      'tool',
      'job',
      'challenge',
      'highlight'
    )
  ),
  created_at timestamp default now()
);

-- 5. Comments table
create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references users(id),
  content text,
  created_at timestamp default now()
);

-- 6. Votes table
create table votes (
  user_id uuid references users(id),
  post_id uuid references posts(id),
  value int check (value in (1, -1)),
  primary key (user_id, post_id)
);

-- 7. Daily Highlights table
create table daily_highlights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  content text,
  created_at date default current_date
);

-- 8. Tools table
create table tools (
  id uuid primary key default gen_random_uuid(),
  name text,
  category text,
  description text,
  link text
);

-- 9. Job Posts table
create table job_posts (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references communities(id),
  company text,
  role text,
  stack text[],
  location text,
  apply_url text,
  created_at timestamp default now()
);

-- 10. Challenges table
create table challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  title text,
  description text,
  difficulty text,
  created_at timestamp default now()
);

-- Enable Row Level Security (RLS)
alter table users enable row level security;
alter table communities enable row level security;
alter table community_members enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;
alter table votes enable row level security;
alter table daily_highlights enable row level security;
alter table tools enable row level security;
alter table job_posts enable row level security;
alter table challenges enable row level security;

-- Policies

-- Users
create policy "Users can read all profiles"
on users for select using (true);

create policy "Users can update own profile"
on users for update using (auth.uid() = id);

-- Communities (Read-only for public, admins/service role can insert via dashboard/direct connection)
create policy "Anyone can read communities"
on communities for select using (true);

-- Community Membership
create policy "Join community"
on community_members for insert
with check (auth.uid() = user_id);

create policy "View memberships"
on community_members for select
using (true);

-- Posts
create policy "Create post only if member"
on posts for insert
with check (
  exists (
    select 1 from community_members
    where community_members.user_id = auth.uid()
    and community_members.community_id = posts.community_id
  )
);

create policy "Read all posts"
on posts for select using (true);

-- Comments
create policy "Comment if authenticated"
on comments for insert
with check (auth.uid() = user_id);

create policy "Read comments"
on comments for select using (true);

-- Votes
create policy "Vote if authenticated"
on votes for insert
with check (auth.uid() = user_id);

create policy "Update vote if authenticated"
on votes for update
using (auth.uid() = user_id);

create policy "Read votes"
on votes for select using (true);

-- Job Posts (Read only for users)
create policy "Read job posts"
on job_posts for select using (true);

-- Challenges (Read only for users)
create policy "Read challenges"
on challenges for select using (true);

-- Daily Highlights
create policy "Read highlights"
on daily_highlights for select using (true);

-- Tools
create policy "Read tools"
on tools for select using (true);

-- Storage (Bucket setup - to be done in dashboard, but policies here if applicable)
-- Note: Storage policies are usually handled in the storage schema, not public schema.
