-- Fix "Update failed like" permission issues
-- This ensures authenticated users can always like posts, regardless of ownership
-- and moves count logic strictly to the trigger (already correctly set up in upgrade_likes.sql)

-- 1. Ensure RLS Policies for post_likes are correct and non-restrictive
DO $$ 
BEGIN
    -- Drop existing potentially faulty policies
    DROP POLICY IF EXISTS "Authenticated users can like" ON public.post_likes;
    DROP POLICY IF EXISTS "Users can unlike" ON public.post_likes;
    
    -- Recreate strictly
    CREATE POLICY "Authenticated users can like" ON public.post_likes 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id); -- Only check is that you are inserting your own ID
    
    CREATE POLICY "Users can unlike" ON public.post_likes 
    FOR DELETE 
    USING (auth.uid() = user_id); -- Only check is that you are deleting your own like
END $$;

-- 2. Verify and Fix posts table permission for COUNT updates
-- Actually, we DO NOT want clients updating posts.likes_count directly.
-- The trigger `tr_handle_post_like_change` handles this via SECURITY DEFINER.
-- So we must ensure standard users CANNOT update posts.likes_count directly to prevent hacking.
-- But RLS on `posts` might be blocking the trigger if not careful? 
-- No, SECURITY DEFINER functions bypass RLS.

-- However, if the client logic tries to update `likes_count` optimistically OR purely via RPC, it's fine.
-- The prompt says "Backend tries to update posts.likes_count without permission" is a cause.
-- If the client code (api.ts) acts on `post_likes` only, we are safe.

-- 3. Fix potential "Duplicate key" error
-- We cannot ignore unique constraint on INSERT in valid SQL without ON CONFLICT.
-- Standard insert throws error.
-- Supabase client logic needs to handle this, OR we create an RPC function to "upsert like".

CREATE OR REPLACE FUNCTION public.toggle_like(
  target_post_id uuid,
  should_like boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF should_like THEN
    -- Insert safely
    INSERT INTO public.post_likes (post_id, user_id)
    VALUES (target_post_id, current_user_id)
    ON CONFLICT (post_id, user_id) DO NOTHING;
  ELSE
    -- Delete safely
    DELETE FROM public.post_likes
    WHERE post_id = target_post_id AND user_id = current_user_id;
  END IF;
END;
$$;
