-- Open Source Stars and Star Count System

-- 1. Add star_count to open_source_projects if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'open_source_projects' AND column_name = 'star_count') THEN
        ALTER TABLE public.open_source_projects ADD COLUMN star_count integer DEFAULT 0;
    END IF;
END $$;

-- 2. Create open_source_stars table
CREATE TABLE IF NOT EXISTS public.open_source_stars (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid REFERENCES public.open_source_projects(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(project_id, user_id)
);

-- 3. Enable RLS
ALTER TABLE public.open_source_stars ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for stars
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Everyone can view stars" ON public.open_source_stars;
    CREATE POLICY "Everyone can view stars" ON public.open_source_stars FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Authenticated users can toggle stars" ON public.open_source_stars;
    CREATE POLICY "Authenticated users can toggle stars" ON public.open_source_stars FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can remove own stars" ON public.open_source_stars;
    CREATE POLICY "Users can remove own stars" ON public.open_source_stars FOR DELETE USING (auth.uid() = user_id);
END $$;

-- 5. Trigger function to maintain star_count
CREATE OR REPLACE FUNCTION public.handle_project_star_change()
RETURNS trigger AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.open_source_projects 
        SET star_count = star_count + 1 
        WHERE id = NEW.project_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.open_source_projects 
        SET star_count = star_count - 1 
        WHERE id = OLD.project_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger
DROP TRIGGER IF EXISTS tr_handle_project_star_change ON public.open_source_stars;
CREATE TRIGGER tr_handle_project_star_change
AFTER INSERT OR DELETE ON public.open_source_stars
FOR EACH ROW EXECUTE FUNCTION public.handle_project_star_change();

-- 7. Sync existing counts (if any)
UPDATE public.open_source_projects p
SET star_count = (
    SELECT count(*) 
    FROM public.open_source_stars s 
    WHERE s.project_id = p.id
);
