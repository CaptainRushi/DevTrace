-- Create Open Source Projects table
create table if not exists public.open_source_projects (
  id uuid primary key default gen_random_uuid(),
  project_name text not null,
  repo_url text not null,
  description text not null,
  tech_stack text[] default '{}',
  contribution_type text,
  license text,
  hashtags text[] default '{}',
  created_by uuid references public.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  
  constraint valid_repo_url check (repo_url ~* '^https?:\/\/(www\.)?(github\.com|gitlab\.com)\/.*')
);

-- Enable RLS
alter table public.open_source_projects enable row level security;

-- RLS Policies

-- Everyone can view
create policy "Everyone can view open source projects"
  on public.open_source_projects for select
  using (true);

-- Authenticated users can insert
create policy "Authenticated users can add projects"
  on public.open_source_projects for insert
  with check (auth.uid() = created_by);

-- Users can update their own projects
create policy "Users can update own projects"
  on public.open_source_projects for update
  using (auth.uid() = created_by);

-- Users can delete their own projects
create policy "Users can delete own projects"
  on public.open_source_projects for delete
  using (auth.uid() = created_by);

-- Add indexes for common filters
create index if not exists idx_open_source_tech_stack on public.open_source_projects using gin(tech_stack);
create index if not exists idx_open_source_created_at on public.open_source_projects(created_at desc);
create index if not exists idx_open_source_contribution_type on public.open_source_projects(contribution_type);
