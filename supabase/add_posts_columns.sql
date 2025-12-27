ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS type TEXT; -- Ensuring 'type' exists as used in logic
