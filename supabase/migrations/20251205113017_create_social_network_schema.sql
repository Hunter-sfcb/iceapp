/*
  # Social Network Database Schema

  ## Overview
  Complete database schema for a social media platform with authentication,
  ranks, verified badges, and premium memberships.

  ## 1. New Tables
  
  ### `ranks`
  - `id` (uuid, primary key) - Unique identifier for each rank
  - `name` (text) - Name of the rank (e.g., "Owner", "Admin", "Member")
  - `color` (text) - Color code for the rank badge
  - `priority` (integer) - Priority level (higher = more powerful)
  - `created_at` (timestamptz) - When the rank was created
  
  ### `profiles`
  - `id` (uuid, primary key) - Links to auth.users
  - `user_id` (text, unique) - Numeric user ID (e.g., "100001")
  - `username` (text, unique) - Username
  - `display_name` (text) - Display name
  - `bio` (text) - User biography
  - `avatar_url` (text) - Profile picture URL
  - `rank_id` (uuid) - Foreign key to ranks table
  - `is_verified` (boolean) - Blue checkmark status
  - `is_premium` (boolean) - Premium membership status
  - `premium_until` (timestamptz) - Premium expiration date
  - `created_at` (timestamptz) - Account creation date
  
  ### `posts`
  - `id` (uuid, primary key) - Unique post identifier
  - `author_id` (uuid) - Foreign key to profiles
  - `content` (text) - Post content
  - `media_url` (text) - Optional media attachment
  - `likes_count` (integer) - Cached like count
  - `comments_count` (integer) - Cached comment count
  - `created_at` (timestamptz) - Post creation time
  
  ### `comments`
  - `id` (uuid, primary key) - Unique comment identifier
  - `post_id` (uuid) - Foreign key to posts
  - `author_id` (uuid) - Foreign key to profiles
  - `content` (text) - Comment content
  - `created_at` (timestamptz) - Comment creation time
  
  ### `likes`
  - `id` (uuid, primary key) - Unique like identifier
  - `post_id` (uuid) - Foreign key to posts
  - `user_id` (uuid) - Foreign key to profiles
  - `created_at` (timestamptz) - When the like was created
  - Unique constraint on (post_id, user_id)
  
  ### `follows`
  - `id` (uuid, primary key) - Unique follow identifier
  - `follower_id` (uuid) - User who is following
  - `following_id` (uuid) - User being followed
  - `created_at` (timestamptz) - Follow creation time
  - Unique constraint on (follower_id, following_id)

  ## 2. Security
  - Enable RLS on all tables
  - Users can read all public profiles and posts
  - Users can only edit their own profile and posts
  - Only owner (priority >= 1000) can manage ranks and verified badges
  - Users can create posts, comments, and likes if authenticated

  ## 3. Initial Data
  - Create "Owner" rank with highest priority (1000)
  - Create "Member" rank as default (priority 0)

  ## Important Notes
  - The first user to sign up will be automatically assigned as Owner
  - Numeric user IDs start from 100001 and increment
  - Premium status is time-based with expiration dates
*/

-- Create ranks table
CREATE TABLE IF NOT EXISTS ranks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text NOT NULL DEFAULT '#6B7280',
  priority integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  display_name text NOT NULL,
  bio text DEFAULT '',
  avatar_url text DEFAULT '',
  rank_id uuid REFERENCES ranks(id) DEFAULT NULL,
  is_verified boolean DEFAULT false,
  is_premium boolean DEFAULT false,
  premium_until timestamptz DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  media_url text DEFAULT '',
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Create sequence for numeric user IDs
CREATE SEQUENCE IF NOT EXISTS user_id_seq START 100001;

-- Insert default ranks
INSERT INTO ranks (name, color, priority) VALUES
  ('Owner', '#F59E0B', 1000),
  ('Admin', '#EF4444', 500),
  ('Moderator', '#8B5CF6', 100),
  ('Premium', '#3B82F6', 50),
  ('Member', '#6B7280', 0)
ON CONFLICT (name) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ranks table
CREATE POLICY "Anyone can view ranks"
  ON ranks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only owner can create ranks"
  ON ranks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      JOIN ranks ON profiles.rank_id = ranks.id
      WHERE profiles.id = auth.uid()
      AND ranks.priority >= 1000
    )
  );

CREATE POLICY "Only owner can update ranks"
  ON ranks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      JOIN ranks ON profiles.rank_id = ranks.id
      WHERE profiles.id = auth.uid()
      AND ranks.priority >= 1000
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      JOIN ranks ON profiles.rank_id = ranks.id
      WHERE profiles.id = auth.uid()
      AND ranks.priority >= 1000
    )
  );

CREATE POLICY "Only owner can delete ranks"
  ON ranks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      JOIN ranks ON profiles.rank_id = ranks.id
      WHERE profiles.id = auth.uid()
      AND ranks.priority >= 1000
    )
  );

-- RLS Policies for profiles table
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      -- Owner can change anything
      EXISTS (
        SELECT 1 FROM profiles p
        JOIN ranks r ON p.rank_id = r.id
        WHERE p.id = auth.uid()
        AND r.priority >= 1000
      )
      OR
      -- Regular users cannot change rank_id or is_verified
      (rank_id = (SELECT rank_id FROM profiles WHERE id = auth.uid())
       AND is_verified = (SELECT is_verified FROM profiles WHERE id = auth.uid()))
    )
  );

-- RLS Policies for posts table
CREATE POLICY "Anyone can view posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- RLS Policies for comments table
CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- RLS Policies for likes table
CREATE POLICY "Anyone can view likes"
  ON likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create likes"
  ON likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for follows table
CREATE POLICY "Anyone can view follows"
  ON follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create follows"
  ON follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own follows"
  ON follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_user_id text;
  member_rank_id uuid;
  owner_rank_id uuid;
  is_first_user boolean;
BEGIN
  -- Generate numeric user ID
  new_user_id := nextval('user_id_seq')::text;
  
  -- Get rank IDs
  SELECT id INTO member_rank_id FROM ranks WHERE name = 'Member';
  SELECT id INTO owner_rank_id FROM ranks WHERE name = 'Owner';
  
  -- Check if this is the first user
  is_first_user := NOT EXISTS (SELECT 1 FROM profiles LIMIT 1);
  
  -- Create profile
  INSERT INTO public.profiles (id, user_id, username, display_name, rank_id)
  VALUES (
    NEW.id,
    new_user_id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user' || new_user_id),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'User ' || new_user_id),
    CASE WHEN is_first_user THEN owner_rank_id ELSE member_rank_id END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update post counts
CREATE OR REPLACE FUNCTION public.update_post_counts()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'likes' THEN
      UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_TABLE_NAME = 'comments' THEN
      UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'likes' THEN
      UPDATE posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
    ELSIF TG_TABLE_NAME = 'comments' THEN
      UPDATE posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for post counts
DROP TRIGGER IF EXISTS on_like_change ON likes;
CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_counts();

DROP TRIGGER IF EXISTS on_comment_change ON comments;
CREATE TRIGGER on_comment_change
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_counts();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);