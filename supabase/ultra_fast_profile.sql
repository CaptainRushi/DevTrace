-- Ultra-Fast Profile Metrics (Cached Counters)

-- 1. Add missing counters to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS challenges_count integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS communities_count integer DEFAULT 0;

-- 2. Trigger Function for Challenges Count
CREATE OR REPLACE FUNCTION public.handle_challenge_count_change()
RETURNS trigger AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.users SET challenges_count = challenges_count + 1 WHERE id = NEW.user_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.users SET challenges_count = GREATEST(0, challenges_count - 1) WHERE id = OLD.user_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger Function for Community Memberships Count
CREATE OR REPLACE FUNCTION public.handle_community_count_change()
RETURNS trigger AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.users SET communities_count = communities_count + 1 WHERE id = NEW.user_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.users SET communities_count = GREATEST(0, communities_count - 1) WHERE id = OLD.user_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Attach Triggers
DROP TRIGGER IF EXISTS tr_handle_challenge_count_change ON public.challenges;
CREATE TRIGGER tr_handle_challenge_count_change
AFTER INSERT OR DELETE ON public.challenges
FOR EACH ROW EXECUTE FUNCTION public.handle_challenge_count_change();

DROP TRIGGER IF EXISTS tr_handle_community_count_change ON public.community_members;
CREATE TRIGGER tr_handle_community_count_change
AFTER INSERT OR DELETE ON public.community_members
FOR EACH ROW EXECUTE FUNCTION public.handle_community_count_change();

-- 5. Sync existing data
UPDATE public.users u
SET challenges_count = (SELECT count(*) FROM public.challenges WHERE user_id = u.id),
    communities_count = (SELECT count(*) FROM public.community_members WHERE user_id = u.id);

-- 6. Direct Profile Access Index
CREATE INDEX IF NOT EXISTS idx_users_username_lower ON public.users (lower(username));
