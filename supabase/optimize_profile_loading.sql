-- Profile Loading Performance Optimization

-- 1. Create indices for frequent profile queries
CREATE INDEX IF NOT EXISTS idx_posts_user_id_created_at ON public.posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id_post_id ON public.post_likes(user_id, post_id);
CREATE INDEX IF NOT EXISTS idx_post_bookmarks_user_id_post_id ON public.post_bookmarks(user_id, post_id);
CREATE INDEX IF NOT EXISTS idx_challenges_user_id ON public.challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_privacy_settings_user_id ON public.user_privacy_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON public.community_members(user_id);

-- 2. Analyze tables to update statistics for the query planner
ANALYZE public.users;
ANALYZE public.posts;
ANALYZE public.post_likes;
ANALYZE public.post_bookmarks;
ANALYZE public.challenges;
