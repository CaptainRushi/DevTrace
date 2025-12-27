-- Create job_posts Table
CREATE TABLE IF NOT EXISTS public.job_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT CHECK (type IN ('full-time', 'remote', 'freelance', 'internship', 'contract')),
    description TEXT NOT NULL,
    apply_link TEXT NOT NULL,
    stack TEXT[], -- Tech stack tags
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.job_posts ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public can view job_posts" ON public.job_posts;
CREATE POLICY "Public can view job_posts" ON public.job_posts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can post jobs" ON public.job_posts;
CREATE POLICY "Authenticated users can post jobs" ON public.job_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);


DROP POLICY IF EXISTS "Users can update own jobs" ON public.job_posts;
CREATE POLICY "Users can update own jobs" ON public.job_posts
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own jobs" ON public.job_posts;
CREATE POLICY "Users can delete own jobs" ON public.job_posts
    FOR DELETE USING (auth.uid() = user_id);
