export interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  rank_id: string | null;
  is_verified: boolean;
  is_premium: boolean;
  premium_until: string | null;
  created_at: string;
  rank?: Rank;
}

export interface Rank {
  id: string;
  name: string;
  color: string;
  priority: number;
  created_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  media_url: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author?: Profile;
  is_liked?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: Profile;
}
