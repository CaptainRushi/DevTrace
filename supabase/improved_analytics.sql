-- Add counter columns to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS bookmarks_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0;

-- Add counter columns to users (profiles) table
ALTER TABLE users ADD COLUMN IF NOT EXISTS posts_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS likes_received INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS comments_received INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bookmarks_received INTEGER DEFAULT 0;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_engagement_score ON posts(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Function to calculate engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.engagement_score := (NEW.likes_count * 1) + (NEW.comments_count * 2) + (NEW.bookmarks_count * 3);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update engagement score on post change
CREATE TRIGGER tr_update_engagement_score
BEFORE INSERT OR UPDATE OF likes_count, comments_count, bookmarks_count
ON posts
FOR EACH ROW
EXECUTE FUNCTION calculate_engagement_score();

-- Function to handle post creation/deletion
CREATE OR REPLACE FUNCTION handle_post_lifecycle()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users SET posts_count = posts_count + 1 WHERE id = NEW.user_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE users SET posts_count = posts_count - 1 WHERE id = OLD.user_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_post_lifecycle
AFTER INSERT OR DELETE ON posts
FOR EACH ROW EXECUTE FUNCTION handle_post_lifecycle();

-- Function to handle like (votes) events
CREATE OR REPLACE FUNCTION handle_vote_events()
RETURNS TRIGGER AS $$
DECLARE
    target_post_author_id UUID;
BEGIN
    IF TG_OP = 'INSERT' AND NEW.value = 1 THEN
        -- Increment post likes
        UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id RETURNING user_id INTO target_post_author_id;
        -- Increment profile likes_received
        UPDATE users SET likes_received = likes_received + 1 WHERE id = target_post_author_id;
    ELSIF TG_OP = 'DELETE' AND OLD.value = 1 THEN
        -- Decrement post likes
        UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id RETURNING user_id INTO target_post_author_id;
        -- Decrement profile likes_received
        UPDATE users SET likes_received = likes_received - 1 WHERE id = target_post_author_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_vote_events
AFTER INSERT OR DELETE ON votes
FOR EACH ROW EXECUTE FUNCTION handle_vote_events();

-- Function to handle comment events
CREATE OR REPLACE FUNCTION handle_comment_events()
RETURNS TRIGGER AS $$
DECLARE
    target_post_author_id UUID;
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id RETURNING user_id INTO target_post_author_id;
        UPDATE users SET comments_received = comments_received + 1 WHERE id = target_post_author_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id RETURNING user_id INTO target_post_author_id;
        UPDATE users SET comments_received = comments_received - 1 WHERE id = target_post_author_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_comment_events
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION handle_comment_events();

-- Function to handle bookmark events
CREATE OR REPLACE FUNCTION handle_bookmark_events()
RETURNS TRIGGER AS $$
DECLARE
    target_post_author_id UUID;
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET bookmarks_count = bookmarks_count + 1 WHERE id = NEW.post_id RETURNING user_id INTO target_post_author_id;
        UPDATE users SET bookmarks_received = bookmarks_received + 1 WHERE id = target_post_author_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET bookmarks_count = bookmarks_count - 1 WHERE id = OLD.post_id RETURNING user_id INTO target_post_author_id;
        UPDATE users SET bookmarks_received = bookmarks_received - 1 WHERE id = target_post_author_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_bookmark_events
AFTER INSERT OR DELETE ON post_bookmarks
FOR EACH ROW EXECUTE FUNCTION handle_bookmark_events();

-- Sync existing data (One-time run)
UPDATE posts p
SET 
  likes_count = (SELECT count(*) FROM votes v WHERE v.post_id = p.id AND v.value = 1),
  comments_count = (SELECT count(*) FROM comments c WHERE c.post_id = p.id),
  bookmarks_count = (SELECT count(*) FROM post_bookmarks b WHERE b.post_id = p.id);

UPDATE users u
SET
  posts_count = (SELECT count(*) FROM posts p WHERE p.user_id = u.id),
  likes_received = (SELECT COALESCE(SUM(p.likes_count), 0) FROM posts p WHERE p.user_id = u.id),
  comments_received = (SELECT COALESCE(SUM(p.comments_count), 0) FROM posts p WHERE p.user_id = u.id),
  bookmarks_received = (SELECT COALESCE(SUM(p.bookmarks_count), 0) FROM posts p WHERE p.user_id = u.id);
