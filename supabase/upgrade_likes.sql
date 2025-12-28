-- Like Counter Logic Redesign (Accurate & Scalable)

-- 1. Create post_likes source of truth table
CREATE TABLE IF NOT EXISTS public.post_likes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(post_id, user_id)
);

-- 2. Add cached counters to posts and users tables
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS likes_received integer DEFAULT 0;

-- 3. Enable RLS
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Anyone can view post likes" ON public.post_likes;
    CREATE POLICY "Anyone can view post likes" ON public.post_likes FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Authenticated users can like" ON public.post_likes;
    CREATE POLICY "Authenticated users can like" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can unlike" ON public.post_likes;
    CREATE POLICY "Users can unlike" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);
END $$;

-- 5. Atomic Trigger Function to maintain stats
CREATE OR REPLACE FUNCTION public.handle_post_like_change()
RETURNS trigger AS $$
DECLARE
    post_owner_id uuid;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Get post owner for analytics
        SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
        
        -- Increment post likes_count (Cached)
        UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        
        -- Increment post owner likes_received (Analytics)
        IF post_owner_id IS NOT NULL THEN
            UPDATE public.users SET likes_received = likes_received + 1 WHERE id = post_owner_id;
        END IF;
        
    ELSIF (TG_OP = 'DELETE') THEN
        -- Get post owner for analytics
        SELECT user_id INTO post_owner_id FROM public.posts WHERE id = OLD.post_id;
        
        -- Decrement post likes_count (Prevent negative counts)
        UPDATE public.posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
        
        -- Decrement post owner likes_received
        IF post_owner_id IS NOT NULL THEN
            UPDATE public.users SET likes_received = GREATEST(0, likes_received - 1) WHERE id = post_owner_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Attach Trigger
DROP TRIGGER IF EXISTS tr_handle_post_like_change ON public.post_likes;
CREATE TRIGGER tr_handle_post_like_change
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.handle_post_like_change();

-- 7. Performance Indexing
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_id ON public.posts(id);

-- 8. Data Migration & Sync (Convert existing votes to likes)
INSERT INTO public.post_likes (post_id, user_id)
SELECT post_id, user_id FROM public.votes WHERE value = 1
ON CONFLICT (post_id, user_id) DO NOTHING;

-- Initial count synchronization
UPDATE public.posts p
SET likes_count = (SELECT count(*) FROM public.post_likes WHERE post_id = p.id);

UPDATE public.users u
SET likes_received = (
    SELECT coalesce(sum(likes_count), 0)
    FROM public.posts
    WHERE user_id = u.id
);
