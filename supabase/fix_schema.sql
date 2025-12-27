-- Fix challenges table columns (schema already existed but missed new columns)

ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS input_format TEXT,
ADD COLUMN IF NOT EXISTS output_format TEXT,
ADD COLUMN IF NOT EXISTS examples TEXT,
ADD COLUMN IF NOT EXISTS constraints TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS language_category TEXT,
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS submissions_count INTEGER DEFAULT 0;

-- Ensure difficulty check
ALTER TABLE public.challenges DROP CONSTRAINT IF EXISTS challenges_difficulty_check;
ALTER TABLE public.challenges ADD CONSTRAINT challenges_difficulty_check CHECK (difficulty IN ('easy', 'medium', 'hard'));

-- Create challenge submissions table (if not exists)
CREATE TABLE IF NOT EXISTS public.challenge_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'attempted',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(challenge_id, user_id)
);

-- Enable RLS for attempts
ALTER TABLE public.challenge_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own attempts" ON public.challenge_attempts;
CREATE POLICY "Users can view their own attempts"
ON public.challenge_attempts FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own attempts" ON public.challenge_attempts;
CREATE POLICY "Users can insert their own attempts"
ON public.challenge_attempts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Seed Data (Using user_id instead of created_by)
INSERT INTO public.challenges (title, difficulty, description, input_format, output_format, examples, constraints, tags, language_category, is_default, user_id)
SELECT 
  'Two Sum', 
  'easy', 
  'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.', 
  'Array of integers nums, Integer target', 
  'Array of 2 integers', 
  '[{"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]"}]', 
  '2 <= nums.length <= 10^4', 
  ARRAY['array', 'hash-table'], 
  'DSA', 
  TRUE, 
  NULL
WHERE NOT EXISTS (
    SELECT 1 FROM public.challenges WHERE title = 'Two Sum'
);

INSERT INTO public.challenges (title, difficulty, description, input_format, output_format, examples, constraints, tags, language_category, is_default, user_id)
SELECT
  'Reverse String', 
  'easy', 
  'Write a function that reverses a string. The input string is given as an array of characters `s`. You must do this by modifying the input array in-place with O(1) extra memory.', 
  'Array of characters s', 
  'Reversed array s', 
  '[{"input": "s = [\"h\",\"e\",\"l\",\"l\",\"o\"]", "output": "[\"o\",\"l\",\"l\",\"e\",\"h\"]"}]', 
  '1 <= s.length <= 10^5', 
  ARRAY['string', 'two-pointers'], 
  'DSA', 
  TRUE, 
  NULL
WHERE NOT EXISTS (
    SELECT 1 FROM public.challenges WHERE title = 'Reverse String'
);

INSERT INTO public.challenges (title, difficulty, description, input_format, output_format, examples, constraints, tags, language_category, is_default, user_id)
SELECT
  'LRU Cache', 
  'medium', 
  'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with `get` and `put` operations.', 
  'Capacity integer', 
  'Void or Integer', 
  '[{"input": "LRUCache(2), put(1,1), put(2,2), get(1)", "output": "1"}]', 
  '1 <= capacity <= 3000', 
  ARRAY['design', 'hash-table', 'linked-list'], 
  'DSA', 
  TRUE, 
  NULL
WHERE NOT EXISTS (
    SELECT 1 FROM public.challenges WHERE title = 'LRU Cache'
);
