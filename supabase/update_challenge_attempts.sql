-- Add solution columns to challenge_attempts table if they don't exist
ALTER TABLE public.challenge_attempts
ADD COLUMN IF NOT EXISTS solution_code TEXT,
ADD COLUMN IF NOT EXISTS language TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Ensure status check includes 'draft', 'attempted', 'solved'
ALTER TABLE public.challenge_attempts DROP CONSTRAINT IF EXISTS challenge_attempts_status_check;
ALTER TABLE public.challenge_attempts ADD CONSTRAINT challenge_attempts_status_check CHECK (status IN ('draft', 'attempted', 'solved'));
