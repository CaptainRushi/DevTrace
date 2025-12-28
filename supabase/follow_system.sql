-- Follow System Database Implementation

-- 1. Create followers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.followers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    following_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id <> following_id)
);

-- 2. Add counter columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS followers_count integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS following_count integer DEFAULT 0;

-- 3. Enable RLS
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Everyone can view followers" ON public.followers;
    CREATE POLICY "Everyone can view followers" ON public.followers FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Authenticated users can follow" ON public.followers;
    CREATE POLICY "Authenticated users can follow" ON public.followers FOR INSERT WITH CHECK (auth.uid() = follower_id);
    
    DROP POLICY IF EXISTS "Users can unfollow" ON public.followers;
    CREATE POLICY "Users can unfollow" ON public.followers FOR DELETE USING (auth.uid() = follower_id);
END $$;

-- 5. Trigger function to maintain counts
CREATE OR REPLACE FUNCTION public.handle_user_follow_change()
RETURNS trigger AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Increase counts
        UPDATE public.users SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
        UPDATE public.users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    ELSIF (TG_OP = 'DELETE') THEN
        -- Decrease counts
        UPDATE public.users SET followers_count = GREATEST(0, followers_count - 1) WHERE id = OLD.following_id;
        UPDATE public.users SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger
DROP TRIGGER IF EXISTS tr_handle_user_follow_change ON public.followers;
CREATE TRIGGER tr_handle_user_follow_change
AFTER INSERT OR DELETE ON public.followers
FOR EACH ROW EXECUTE FUNCTION public.handle_user_follow_change();

-- 7. Initial sync of counts
UPDATE public.users u
SET 
  followers_count = (SELECT count(*) FROM public.followers WHERE following_id = u.id),
  following_count = (SELECT count(*) FROM public.followers WHERE follower_id = u.id);
