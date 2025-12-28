-- Add expires_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_posts' AND column_name = 'expires_at') THEN
        ALTER TABLE public.job_posts ADD COLUMN expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + interval '7 days');
    END IF;
END $$;

-- RLS Policy to hide expired jobs (This ensures they "never appear in listings")
-- This acts as an immediate "soft delete" from the user's perspective.
-- We drop existing select policy if it exists to replace it, or just add a condition.
-- Since we have "Public can view job_posts", let's update it or add a new one.
-- Actually, it's cleaner to just update the existing policy OR add a filter to the frontend queries.
-- The prompt explicitly says: "All job fetch queries must include WHERE expires_at > NOW()".
-- So we will do that on the frontend/API layer. But an RLS policy is a safer backend enforcement.

-- Function to cleanup expired jobs (Can be called via CRON or Trigger)
CREATE OR REPLACE FUNCTION delete_expired_jobs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.job_posts WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: If pg_cron is available, schedule it.
-- SELECT cron.schedule('0 0 * * *', $$SELECT delete_expired_jobs()$$);
