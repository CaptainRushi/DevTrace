-- Allow users to insert their own profile
-- This is necessary for UPSERT operations where the row might not exist yet.
-- The Policy "Users can update own profile" handles the UPDATE part of UPSERT.
-- This handles the INSERT part.

create policy "Users can insert own profile"
on users for insert
with check (auth.uid() = id);
