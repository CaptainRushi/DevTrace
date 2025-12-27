-- Drop table if exists to reset schema correctly
DROP TABLE IF EXISTS public.daily_highlights;

CREATE TABLE public.daily_highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    posted_by UUID NOT NULL,
    posted_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT daily_highlights_content_length CHECK (char_length(content) <= 200),
    CONSTRAINT daily_highlights_one_per_day UNIQUE (posted_date),
    CONSTRAINT daily_highlights_posted_by_fkey FOREIGN KEY (posted_by) REFERENCES public.users(id)
);

-- RLS Policies
ALTER TABLE public.daily_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view highlights"
ON public.daily_highlights FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create highlight"
ON public.daily_highlights FOR INSERT
WITH CHECK (auth.uid() = posted_by);
