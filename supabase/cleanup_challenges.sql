-- Remove the challenge_attempts table as the platform is now Upload-Only (Read-Only) for challenges.
-- Solving features have been disabled.

DROP TABLE IF EXISTS public.challenge_attempts;
