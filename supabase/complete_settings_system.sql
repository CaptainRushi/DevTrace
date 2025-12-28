-- Comprehensive Settings & Deletion System

-- 1. Create User Notification Settings
DROP TABLE IF EXISTS public.user_appearance_settings;
CREATE TABLE IF NOT EXISTS public.user_notification_settings (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  likes_enabled boolean DEFAULT true,
  comments_enabled boolean DEFAULT true,
  replies_enabled boolean DEFAULT true,
  contributions_enabled boolean DEFAULT true,
  system_enabled boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- 2. Create User Privacy Settings
CREATE TABLE IF NOT EXISTS public.user_privacy_settings (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  profile_visibility text DEFAULT 'public' CHECK (profile_visibility IN ('public', 'limited')),
  show_email boolean DEFAULT false,
  allow_indexing boolean DEFAULT true,
  allow_follow boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);


-- Enable RLS
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_privacy_settings ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view own notification settings" ON public.user_notification_settings;
    CREATE POLICY "Users can view own notification settings" ON public.user_notification_settings FOR SELECT USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can update own notification settings" ON public.user_notification_settings;
    CREATE POLICY "Users can update own notification settings" ON public.user_notification_settings FOR UPDATE USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can insert own notification settings" ON public.user_notification_settings;
    CREATE POLICY "Users can insert own notification settings" ON public.user_notification_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can view own privacy settings" ON public.user_privacy_settings;
    CREATE POLICY "Users can view own privacy settings" ON public.user_privacy_settings FOR SELECT USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can update own privacy settings" ON public.user_privacy_settings;
    CREATE POLICY "Users can update own privacy settings" ON public.user_privacy_settings FOR UPDATE USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can insert own privacy settings" ON public.user_privacy_settings;
    CREATE POLICY "Users can insert own privacy settings" ON public.user_privacy_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
END $$;

-- 4. Fix Cascading Deletes for Existing Tables
DO $$ 
BEGIN
    -- Posts
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'user_id') THEN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'posts_user_id_fkey') THEN
            ALTER TABLE public.posts DROP CONSTRAINT posts_user_id_fkey;
        END IF;
        ALTER TABLE public.posts ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    -- Comments
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'user_id') THEN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'comments_user_id_fkey') THEN
            ALTER TABLE public.comments DROP CONSTRAINT comments_user_id_fkey;
        END IF;
        ALTER TABLE public.comments ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    -- Votes User ref
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'votes' AND column_name = 'user_id') THEN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'votes_user_id_fkey') THEN
            ALTER TABLE public.votes DROP CONSTRAINT votes_user_id_fkey;
        END IF;
        ALTER TABLE public.votes ADD CONSTRAINT votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    -- Challenges
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'challenges' AND column_name = 'user_id') THEN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'challenges_user_id_fkey') THEN
            ALTER TABLE public.challenges DROP CONSTRAINT challenges_user_id_fkey;
        END IF;
        ALTER TABLE public.challenges ADD CONSTRAINT challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    -- Daily Highlights (Check both user_id and posted_by)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_highlights' AND column_name = 'posted_by') THEN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'daily_highlights_posted_by_fkey') THEN
            ALTER TABLE public.daily_highlights DROP CONSTRAINT daily_highlights_posted_by_fkey;
        END IF;
        ALTER TABLE public.daily_highlights ADD CONSTRAINT daily_highlights_posted_by_fkey FOREIGN KEY (posted_by) REFERENCES public.users(id) ON DELETE CASCADE;
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_highlights' AND column_name = 'user_id') THEN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'daily_highlights_user_id_fkey') THEN
            ALTER TABLE public.daily_highlights DROP CONSTRAINT daily_highlights_user_id_fkey;
        END IF;
        ALTER TABLE public.daily_highlights ADD CONSTRAINT daily_highlights_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    -- Bookmarks (Check both table names and columns)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'post_bookmarks' AND column_name = 'user_id') THEN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'post_bookmarks_user_id_fkey') THEN
            ALTER TABLE public.post_bookmarks DROP CONSTRAINT post_bookmarks_user_id_fkey;
        END IF;
        ALTER TABLE public.post_bookmarks ADD CONSTRAINT post_bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookmarks' AND column_name = 'user_id') THEN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'bookmarks_user_id_fkey') THEN
            ALTER TABLE public.bookmarks DROP CONSTRAINT bookmarks_user_id_fkey;
        END IF;
        ALTER TABLE public.bookmarks ADD CONSTRAINT bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

END $$;

-- 5. Update handle_new_user to populate all settings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, username, avatar_url, bio, skills)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id),
    'New member',
    '{}'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create default settings
  INSERT INTO public.user_notification_settings (user_id) VALUES (new.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_privacy_settings (user_id) VALUES (new.id) ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Account Deletion RPC
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void AS $$
DECLARE
  target_user_id uuid;
BEGIN
  target_user_id := auth.uid();
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Delete from public.users (cascades to all other public tables including settings)
  DELETE FROM public.users WHERE id = target_user_id;
  
  -- Delete from auth.users
  -- NOTE: This requires the function to be owned by a superuser or have sufficient bypassrls/service_role permissions
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
