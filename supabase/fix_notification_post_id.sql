-- Fix Notification Foreign Key Violation & Robust Schema
-- 1. CLEANUP ORPHANED DATA FIRST (CRITICAL)
-- Delete notifications pointing to non-existent posts
DELETE FROM public.notifications 
WHERE entity_type = 'post' 
AND entity_id NOT IN (SELECT id FROM public.posts);

-- Delete notifications pointing to non-existent comments
DELETE FROM public.notifications 
WHERE (entity_type = 'comment' OR type = 'reply')
AND entity_id NOT IN (SELECT id FROM public.comments);

-- 2. Add Columns with Constraints
DO $$ 
BEGIN
    -- target_post_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'target_post_id') THEN
        ALTER TABLE public.notifications ADD COLUMN target_post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE;
    END IF;

    -- target_comment_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'target_comment_id') THEN
        ALTER TABLE public.notifications ADD COLUMN target_comment_id uuid REFERENCES public.comments(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Safe Backfill (Only update if Parent exists)

-- A. For 'post' type: target is the entity itself
UPDATE public.notifications
SET target_post_id = entity_id
WHERE entity_type = 'post' 
AND target_post_id IS NULL
-- Double check existence to be absolutely sure despite cleanup
AND entity_id IN (SELECT id FROM public.posts);

-- B. For 'comment' types: target post is derived from comment
UPDATE public.notifications n
SET 
  target_post_id = c.post_id,
  target_comment_id = n.entity_id
FROM public.comments c
WHERE n.entity_type = 'comment' 
  AND n.entity_id = c.id
  AND n.target_post_id IS NULL
  -- Ensure the comment's parent post actually exists
  AND c.post_id IN (SELECT id FROM public.posts);

-- C. For 'reply' types: target post is derived from comment
UPDATE public.notifications n
SET 
  target_post_id = c.post_id,
  target_comment_id = n.entity_id
FROM public.comments c
WHERE n.type = 'reply' 
  AND n.entity_id = c.id
  AND n.target_post_id IS NULL
  AND c.post_id IN (SELECT id FROM public.posts);

-- 4. Final Cleanup of Unfixable Notifications (Optional but recommended)
-- If a notification still has no target_post_id but is of type post/comment, it's broken.
DELETE FROM public.notifications 
WHERE (entity_type IN ('post', 'comment') OR type = 'reply')
AND target_post_id IS NULL;

-- 5. Create Index
CREATE INDEX IF NOT EXISTS idx_notifications_target_post_id ON public.notifications(target_post_id);
