-- Add banner_url column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS banner_url text;

-- Allow public read access to banners (assuming images are public)
-- (Users/Avatars bucket policies usually handle storage access)
-- This migration just updates the table schema.
