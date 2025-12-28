-- 1. Add role column to users (if not exists)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Fix 'votes' table to allow cascading delete
-- First, identify and drop the old constraint
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'votes_post_id_fkey') THEN
        ALTER TABLE public.votes DROP CONSTRAINT votes_post_id_fkey;
    END IF;
END $$;

-- Re-add with CASCADE
ALTER TABLE public.votes 
ADD CONSTRAINT votes_post_id_fkey 
FOREIGN KEY (post_id) 
REFERENCES public.posts(id) 
ON DELETE CASCADE;

-- 3. Enable DELETE policy for posts
DROP POLICY IF EXISTS "Owners and admins can delete posts" ON public.posts;
CREATE POLICY "Owners and admins can delete posts" ON public.posts
    FOR DELETE USING (
        auth.uid() = user_id 
        OR (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'moderator')
    );

-- 4. Ensure UPDATE policy is present
DROP POLICY IF EXISTS "Owners can update posts" ON public.posts;
CREATE POLICY "Owners can update posts" ON public.posts
    FOR UPDATE USING (
        auth.uid() = user_id
    ) WITH CHECK (
        auth.uid() = user_id
    );
