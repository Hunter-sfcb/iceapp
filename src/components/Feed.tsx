import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Post } from '../types';
import { PostCard } from './PostCard';
import { CreatePost } from './CreatePost';

export const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_author_id_fkey(
          *,
          rank:ranks(*)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      const postsWithLikes = await Promise.all(
        data.map(async (post) => {
          if (profile) {
            const { data: like } = await supabase
              .from('likes')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', profile.id)
              .maybeSingle();

            return { ...post, is_liked: !!like };
          }
          return { ...post, is_liked: false };
        })
      );
      setPosts(postsWithLikes as Post[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [profile]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="feed-container">
      <CreatePost onPostCreated={fetchPosts} />
      <div className="posts-list">
        {posts.length === 0 ? (
          <div className="empty-state">
            <p>هنوز پستی وجود ندارد</p>
            <p className="empty-subtitle">اولین پست را شما ایجاد کنید!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={fetchPosts} />
          ))
        )}
      </div>
    </div>
  );
};
