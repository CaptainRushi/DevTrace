-- Create Project Contributions table
create table if not exists public.project_contributions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.open_source_projects(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  contribution_type text not null check (contribution_type in ('Issue', 'PR', 'Idea', 'Docs', 'Other')),
  reference_url text,
  description text,
  status text not null default 'submitted' check (status in ('submitted', 'accepted', 'rejected', 'merged')),
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.project_contributions enable row level security;

-- Policies

-- Everyone can read contributions (Transparency)
create policy "Everyone can view project contributions"
  on public.project_contributions for select
  using (true);

-- Authenticated users can log their own contributions
create policy "Authenticated users can log contributions"
  on public.project_contributions for insert
  with check (auth.uid() = user_id);

-- Contributors can update their own contribution details (e.g. fix url)
create policy "Contributors can update own contributions"
  on public.project_contributions for update
  using (auth.uid() = user_id);

-- Project owners can update status of contributions to their projects
create policy "Project owners can manage contributions"
  on public.project_contributions for update
  using (
    exists (
      select 1 from public.open_source_projects
      where open_source_projects.id = project_contributions.project_id
      and open_source_projects.created_by = auth.uid()
    )
  );

-- Indexes
create index if not exists idx_contributions_project_id on public.project_contributions(project_id);
create index if not exists idx_contributions_user_id on public.project_contributions(user_id);
