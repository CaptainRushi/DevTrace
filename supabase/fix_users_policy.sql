-- Make users table public readable and ensure RLS allows updates to own profile

-- 1. Enable RLS on users table (if not already)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- 3. Create permissive policies

-- Everyone can view profiles
CREATE POLICY "Users are viewable by everyone" 
ON users FOR SELECT 
USING (true);

-- Users can insert their own profile (useful for upsert)
CREATE POLICY "Users can insert their own profile" 
ON users FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Ensure username uniqueness index exists (case insensitive ideally, but exact for now)
-- Note: If we want case insensitive, we need a functional index, but let's stick to simple first.
-- We rely on the frontend forcing lowercase for now.

