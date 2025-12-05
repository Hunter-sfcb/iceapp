export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      ranks: {
        Row: {
          id: string
          name: string
          color: string
          priority: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string
          priority?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          priority?: number
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          username: string
          display_name: string
          bio: string
          avatar_url: string
          rank_id: string | null
          is_verified: boolean
          is_premium: boolean
          premium_until: string | null
          created_at: string
        }
        Insert: {
          id: string
          user_id: string
          username: string
          display_name: string
          bio?: string
          avatar_url?: string
          rank_id?: string | null
          is_verified?: boolean
          is_premium?: boolean
          premium_until?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          display_name?: string
          bio?: string
          avatar_url?: string
          rank_id?: string | null
          is_verified?: boolean
          is_premium?: boolean
          premium_until?: string | null
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          author_id: string
          content: string
          media_url: string
          likes_count: number
          comments_count: number
          created_at: string
        }
        Insert: {
          id?: string
          author_id: string
          content: string
          media_url?: string
          likes_count?: number
          comments_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          content?: string
          media_url?: string
          likes_count?: number
          comments_count?: number
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          content?: string
          created_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
    }
  }
}
