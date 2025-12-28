-- 1. Ensure the table has the correct structure and constraints
DO $$ 
BEGIN
    -- Ensure posted_date is DATE and UNIQUE
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_highlights' AND column_name = 'posted_date') THEN
        ALTER TABLE public.daily_highlights ADD COLUMN posted_date DATE DEFAULT CURRENT_DATE;
    END IF;
    
    -- Ensure UNIQUE constraint on posted_date
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'daily_highlights' AND constraint_name = 'daily_highlights_one_per_day') THEN
        ALTER TABLE public.daily_highlights ADD CONSTRAINT daily_highlights_one_per_day UNIQUE (posted_date);
    END IF;
END $$;

-- 2. Create the Clean and Fetch Function (Option B: On-Read Cleanup)
CREATE OR REPLACE FUNCTION get_current_highlights()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    -- Automatically delete highlights older than yesterday
    DELETE FROM public.daily_highlights 
    WHERE posted_date < (CURRENT_DATE - INTERVAL '1 day')::DATE;

    -- Fetch Today and Yesterday with author details
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
        ORDER BY dh.posted_date DESC
        LIMIT 2
    ) h;

    RETURN coalesce(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Security: Grant access to authenticated users
GRANT EXECUTE ON FUNCTION get_current_highlights() TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_highlights() TO anon;
