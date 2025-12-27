-- Add optional solution column to challenges table
ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS solution TEXT;
