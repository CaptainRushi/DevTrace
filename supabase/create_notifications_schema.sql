-- Create Notifications Table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  actor_id uuid references public.users(id) on delete cascade,
  type text not null check (type in ('like', 'comment', 'reply', 'bookmark', 'contribution', 'system')),
  entity_id uuid not null, -- ID of the post, comment, project, etc.
  entity_type text not null check (entity_type in ('post', 'comment', 'project', 'job', 'challenge')), -- Helper to know which table to query
  is_read boolean default false,
  message text, -- Optional custom message or fallback
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Policies
create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Only system or trigger should insert, but we allow authenticated for now to simplify client-side logic if needed, 
-- though ideally this is done via Database Triggers. 
-- For this implementation, we will allow inserts effectively so the API service can create them.
create policy "Authenticated users can insert notifications"
  on public.notifications for insert
  with check (auth.role() = 'authenticated'); 

-- Indexes
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_created_at on public.notifications(created_at desc);
create index if not exists idx_notifications_unread on public.notifications(user_id) where is_read = false;

-- Add triggers for automatic notification creation (Optional but recommended for consistency)
-- For now, we will handle creation in the API service layer as per the prompt instructions implies "Create notifications for...".
-- But real-time robust systems usually use DB triggers. We will stick to API for simplicity and explicit control unless requested.
