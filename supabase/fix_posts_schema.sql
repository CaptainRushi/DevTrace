-- Ensure community_id exists in posts
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'community_id') THEN
        ALTER TABLE public.posts ADD COLUMN community_id UUID REFERENCES public.communities(id);
    END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to INSERT posts
DROP POLICY IF EXISTS "Users can create posts" ON public.posts;
CREATE POLICY "Users can create posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow everyone to READ posts (if not already set)
DROP POLICY IF EXISTS "Everyone can select posts" ON public.posts;
CREATE POLICY "Everyone can select posts" ON public.posts
    FOR SELECT USING (true);
