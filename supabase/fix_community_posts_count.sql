-- Fix Community Post Counts
-- 1. Ensure column exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'communities' AND column_name = 'posts_count') THEN
        ALTER TABLE public.communities ADD COLUMN posts_count integer DEFAULT 0;
    END IF;
END $$;

-- 2. Index for sorting/filter performance
CREATE INDEX IF NOT EXISTS idx_communities_posts_count ON public.communities(posts_count);

-- 3. Trigger to Maintain posts_count atomically
CREATE OR REPLACE FUNCTION public.maintain_community_posts_count()
RETURNS trigger AS $$
BEGIN
    IF (TG_OP = 'INSERT') AND NEW.community_id IS NOT NULL THEN
        UPDATE public.communities 
        SET posts_count = posts_count + 1 
        WHERE id = NEW.community_id;
    ELSIF (TG_OP = 'DELETE') AND OLD.community_id IS NOT NULL THEN
        UPDATE public.communities 
        SET posts_count = GREATEST(posts_count - 1, 0)
        WHERE id = OLD.community_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Apply trigger to posts table
DROP TRIGGER IF EXISTS tr_maintain_community_posts_count ON public.posts;
CREATE TRIGGER tr_maintain_community_posts_count
AFTER INSERT OR DELETE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.maintain_community_posts_count();

-- 5. Backfill/Sync existing counts (Corrective Update)
UPDATE public.communities c
SET posts_count = (
    SELECT count(*) 
    FROM public.posts p 
    WHERE p.community_id = c.id
);
