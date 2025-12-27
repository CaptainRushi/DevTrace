-- POLICY FOR STORAGE OBJECTS (Avatars)
-- 1. Allow public read access to the avatars bucket
create policy "Avatar Public Read"
on storage.objects for select
using ( bucket_id = 'avatars' );

-- 2. Allow authenticated users to upload their own avatar
-- Restrict folder name to match user ID for security
create policy "Avatar Upload Own Folder"
on storage.objects for insert
with check (
  bucket_id = 'avatars' 
  and auth.uid() = (storage.foldername(name))[1]::uuid
);

-- 3. Allow users to update their own avatar
create policy "Avatar Update Own Folder"
on storage.objects for update
using (
  bucket_id = 'avatars' 
  and auth.uid() = (storage.foldername(name))[1]::uuid
);

-- 4. Allow users to delete their own avatar
create policy "Avatar Delete Own Folder"
on storage.objects for delete
using (
  bucket_id = 'avatars' 
  and auth.uid() = (storage.foldername(name))[1]::uuid
);
