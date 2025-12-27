-- Allow users to insert their own profile
create policy "Users can insert own profile"
on users for insert
with check (auth.uid() = id);
