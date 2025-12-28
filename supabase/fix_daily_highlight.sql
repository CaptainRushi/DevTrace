-- Fix Daily Highlight Logic: Per-User, Not Global

-- 1. Drop the INCORRECT global constraint (if exists)
ALTER TABLE public.daily_highlights DROP CONSTRAINT IF EXISTS daily_highlights_one_per_day;

-- 2. Add the CORRECT per-user constraint (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'daily_highlights' 
        AND constraint_name = 'daily_highlights_one_per_user_per_day'
    ) THEN
        ALTER TABLE public.daily_highlights 
        ADD CONSTRAINT daily_highlights_one_per_user_per_day UNIQUE (posted_by, posted_date);
    END IF;
END $$;

-- 3. Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_daily_highlights_user_date ON public.daily_highlights(posted_by, posted_date);

-- 4. Add DELETE policy (so users can manage their own highlights if needed)
DROP POLICY IF EXISTS "Users can delete their own highlights" ON public.daily_highlights;
CREATE POLICY "Users can delete their own highlights" 
ON public.daily_highlights FOR DELETE 
USING (auth.uid() = posted_by);

-- 5. Update the RPC function to support multiple highlights per day (from different users)
CREATE OR REPLACE FUNCTION get_current_highlights()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    -- Automatically delete highlights older than yesterday
    DELETE FROM public.daily_highlights 
    WHERE posted_date < (CURRENT_DATE - INTERVAL '1 day')::DATE;

    -- Fetch Today and Yesterday with author details (all users)
    SELECT jsonb_agg(h) INTO result
    FROM (
        SELECT 
            dh.id,
            dh.content,
            dh.posted_date,
            dh.created_at,
            dh.posted_by,
            jsonb_build_object(
                'id', u.id,
                'username', u.username,
                'avatar_url', u.avatar_url
            ) as user
        FROM public.daily_highlights dh
        LEFT JOIN public.users u ON dh.posted_by = u.id
        WHERE dh.posted_date >= (CURRENT_DATE - INTERVAL '1 day')::DATE
        ORDER BY dh.posted_date DESC, dh.created_at DESC
    ) h;

    RETURN coalesce(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Ensure proper permissions
GRANT EXECUTE ON FUNCTION get_current_highlights() TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_highlights() TO anon;
