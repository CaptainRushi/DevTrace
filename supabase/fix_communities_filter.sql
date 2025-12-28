-- Communities Filter System Enhancement
-- 1. Ensure columns exist on communities table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'communities' AND column_name = 'is_featured') THEN
        ALTER TABLE public.communities ADD COLUMN is_featured boolean DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'communities' AND column_name = 'member_count') THEN
        ALTER TABLE public.communities ADD COLUMN member_count integer DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'communities' AND column_name = 'icon') THEN
        ALTER TABLE public.communities ADD COLUMN icon text;
    END IF;
END $$;

-- 2. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_communities_category ON public.communities(category);
CREATE INDEX IF NOT EXISTS idx_communities_created_at ON public.communities(created_at);
CREATE INDEX IF NOT EXISTS idx_communities_member_count ON public.communities(member_count);
CREATE INDEX IF NOT EXISTS idx_communities_is_featured ON public.communities(is_featured);
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON public.community_members(user_id);

-- 3. Trigger to Maintain member_count
CREATE OR REPLACE FUNCTION public.maintain_community_member_count()
RETURNS trigger AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.communities 
        SET member_count = member_count + 1 
        WHERE id = NEW.community_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.communities 
        SET member_count = member_count - 1 
        WHERE id = OLD.community_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_maintain_community_member_count ON public.community_members;
CREATE TRIGGER tr_maintain_community_member_count
AFTER INSERT OR DELETE ON public.community_members
FOR EACH ROW EXECUTE FUNCTION public.maintain_community_member_count();

-- 4. Sync existing counts (One-time corrective update)
UPDATE public.communities c
SET member_count = (
    SELECT count(*) 
    FROM public.community_members cm 
    WHERE cm.community_id = c.id
);
