-- Create challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  description TEXT NOT NULL,
  input_format TEXT,
  output_format TEXT,
  examples TEXT, -- JSON or text representation of examples
  constraints TEXT,
  tags TEXT[],
  language_category TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_default BOOLEAN DEFAULT FALSE,
  submissions_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public challenges are viewable by everyone" 
ON public.challenges FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert challenges" 
ON public.challenges FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Users can update their own challenges" 
ON public.challenges FOR UPDATE 
TO authenticated 
USING (auth.uid() = created_by);

-- Create challenge submissions table (optional for now, but good to have structure)
-- For now, we will just track basic interaction or just listing, 
-- but objective mentions "User submissions" which usually means code submission.
-- "Allows users to submit their own challenges" -> This refers to creating a NEW challenge.
-- "Enable community participation (view, attempt)" -> Attempt might just be a local thing or simple text?
-- "Mark as Attempted" button is requested.

CREATE TABLE IF NOT EXISTS public.challenge_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'attempted', -- attempted, solved
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(challenge_id, user_id)
);

ALTER TABLE public.challenge_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own attempts"
ON public.challenge_attempts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attempts"
ON public.challenge_attempts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Seed Default Challenges
INSERT INTO public.challenges (title, difficulty, description, input_format, output_format, examples, constraints, tags, language_category, is_default, created_by)
VALUES 
(
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
),
(
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
),
(
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
);
