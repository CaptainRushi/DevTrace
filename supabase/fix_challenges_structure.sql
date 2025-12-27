-- Fix challenges table structure to match frontend
DO $$
BEGIN
    -- Rename created_by to user_id if it exists (for consistency with other tables)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'created_by') THEN
        ALTER TABLE public.challenges RENAME COLUMN created_by TO user_id;
    END IF;

    -- Add solution column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'solution') THEN
        ALTER TABLE public.challenges ADD COLUMN solution TEXT;
    END IF;

     -- Ensure user_id column exists if it wasn't renamed (e.g. table created differently)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'user_id') THEN
        ALTER TABLE public.challenges ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Enable RLS (just in case)
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Recreate Policies to ensure they reference user_id
DROP POLICY IF EXISTS "Authenticated users can insert challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can update their own challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can delete their own challenges" ON public.challenges;

CREATE POLICY "Authenticated users can insert challenges" 
ON public.challenges FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges" 
ON public.challenges FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own challenges" 
ON public.challenges FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Ensure public read access
DROP POLICY IF EXISTS "Public challenges are viewable by everyone" ON public.challenges;
CREATE POLICY "Public challenges are viewable by everyone" 
ON public.challenges FOR SELECT 
USING (true);
