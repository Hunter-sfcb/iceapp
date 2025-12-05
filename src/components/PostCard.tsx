import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Post } from '../types';

interface PostCardProps {
  post: Post;
  onUpdate: () => void;
}

export const PostCard = ({ post, onUpdate }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();

  const handleLike = async () => {
    if (!profile) return;

    if (post.is_liked) {
      await supabase
        .from('likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', profile.id);
    } else {
      await supabase.from('likes').insert({
        post_id: post.id,
        user_id: profile.id,
      });
    }
    onUpdate();
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !profile) return;

    setLoading(true);
    await supabase.from('comments').insert({
      post_id: post.id,
      author_id: profile.id,
      content: comment.trim(),
    });

    setComment('');
    setLoading(false);
    onUpdate();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'همین الان';
    if (diff < 3600) return `${Math.floor(diff / 60)} دقیقه پیش`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ساعت پیش`;
    return `${Math.floor(diff / 86400)} روز پیش`;
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author">
          <div className="avatar">
            {post.author?.display_name?.charAt(0) || 'U'}
          </div>
          <div className="author-info">
            <div className="author-name">
              <span className="display-name">{post.author?.display_name}</span>
              {post.author?.is_verified && (
                <span className="verified-badge" title="تایید شده">✓</span>
              )}
              {post.author?.rank && (
                <span
                  className="rank-badge"
                  style={{ backgroundColor: post.author.rank.color }}
                >
                  {post.author.rank.name}
                </span>
              )}
              {post.author?.is_premium && (
                <span className="premium-badge" title="کاربر پرمیوم">★</span>
              )}
            </div>
            <div className="post-meta">
              <span className="username">@{post.author?.username}</span>
              <span className="user-id">#{post.author?.user_id}</span>
              <span className="post-time">{formatDate(post.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="post-content">
        <p>{post.content}</p>
      </div>

      <div className="post-actions">
        <button
          onClick={handleLike}
          className={`action-button ${post.is_liked ? 'liked' : ''}`}
        >
          <span className="icon">{post.is_liked ? '❤️' : '🤍'}</span>
          <span>{post.likes_count}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="action-button"
        >
          <span className="icon">💬</span>
          <span>{post.comments_count}</span>
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <form onSubmit={handleComment} className="comment-form">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="نظر خود را بنویسید..."
              className="comment-input"
            />
            <button type="submit" disabled={loading} className="comment-button">
              ارسال
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
