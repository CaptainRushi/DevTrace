-- Replace tags with hashtags in posts table

-- Add hashtags column
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS hashtags text[] DEFAULT '{}';

-- Remove tags column (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'tags') THEN
        ALTER TABLE public.posts DROP COLUMN tags;
    END IF;
END $$;

-- Update RLS policies if necessary (Read all posts is already enabled)
-- Ensure new column is accessible
GRANT SELECT, INSERT, UPDATE ON TABLE public.posts TO authenticated;
GRANT SELECT ON TABLE public.posts TO anon;
