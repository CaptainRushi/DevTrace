-- Create Post Bookmarks Table
CREATE TABLE IF NOT EXISTS public.post_bookmarks (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
);

-- Create Comment Reactions Table
CREATE TABLE IF NOT EXISTS public.comment_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT CHECK (reaction_type IN ('like', 'heart', 'fire')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- Enable RLS
ALTER TABLE public.post_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

-- Policies for Bookmarks
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.post_bookmarks;
CREATE POLICY "Users can view their own bookmarks" ON public.post_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can bookmark posts" ON public.post_bookmarks;
CREATE POLICY "Users can bookmark posts" ON public.post_bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unbookmark posts" ON public.post_bookmarks;
CREATE POLICY "Users can unbookmark posts" ON public.post_bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for Comment Reactions
DROP POLICY IF EXISTS "Everyone can view reactions" ON public.comment_reactions;
CREATE POLICY "Everyone can view reactions" ON public.comment_reactions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can react to comments" ON public.comment_reactions;
CREATE POLICY "Users can react to comments" ON public.comment_reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their reaction" ON public.comment_reactions;
CREATE POLICY "Users can update their reaction" ON public.comment_reactions
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their reaction" ON public.comment_reactions;
CREATE POLICY "Users can remove their reaction" ON public.comment_reactions
    FOR DELETE USING (auth.uid() = user_id);
