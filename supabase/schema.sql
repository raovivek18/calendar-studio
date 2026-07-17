-- Flowboard Supabase Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-------------------------------------------------------------------------------
-- 1. PROFILES
-------------------------------------------------------------------------------
CREATE TABLE profiles (
  -- We use clerk_user_id as the primary key since it's the primary identifier
  clerk_user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = clerk_user_id);
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = clerk_user_id);
-- Insert is usually handled by service role or synchronous upsert from Server Component
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = clerk_user_id);

-------------------------------------------------------------------------------
-- 2. POSTS
-------------------------------------------------------------------------------
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES profiles(clerk_user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL,
  status TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can perform all actions on their own posts" ON posts
  FOR ALL USING (auth.uid() = user_id);

-------------------------------------------------------------------------------
-- 3. TAGS
-------------------------------------------------------------------------------
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES profiles(clerk_user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can perform all actions on their own tags" ON tags
  FOR ALL USING (auth.uid() = user_id);

-------------------------------------------------------------------------------
-- 4. POST_TAGS
-------------------------------------------------------------------------------
CREATE TABLE post_tags (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
-- For post_tags, we need to join with posts to check ownership
CREATE POLICY "Users can perform all actions on their own post_tags" ON post_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM posts WHERE posts.id = post_tags.post_id AND posts.user_id = auth.uid()
    )
  );

-------------------------------------------------------------------------------
-- 5. ATTACHMENTS
-------------------------------------------------------------------------------
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can perform all actions on their own attachments" ON attachments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM posts WHERE posts.id = attachments.post_id AND posts.user_id = auth.uid()
    )
  );

-------------------------------------------------------------------------------
-- 6. ACTIVITY LOGS
-------------------------------------------------------------------------------
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES profiles(clerk_user_id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can perform all actions on their own activity_logs" ON activity_logs
  FOR ALL USING (auth.uid() = user_id);

-------------------------------------------------------------------------------
-- HELPER FUNCTION FOR UPDATED_AT
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
