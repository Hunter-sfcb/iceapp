import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CreatePostProps {
  onPostCreated: () => void;
}

export const CreatePost = ({ onPostCreated }: CreatePostProps) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !profile) return;

    setLoading(true);
    const { error } = await supabase.from('posts').insert({
      author_id: profile.id,
      content: content.trim(),
    });

    if (!error) {
      setContent('');
      onPostCreated();
    }
    setLoading(false);
  };

  return (
    <div className="create-post">
      <form onSubmit={handleSubmit} className="create-post-form">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="چه چیزی در ذهن شماست؟"
          className="create-post-textarea"
          rows={3}
          maxLength={500}
        />
        <div className="create-post-footer">
          <span className="character-count">
            {content.length}/500
          </span>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="post-button"
          >
            {loading ? 'در حال ارسال...' : 'ارسال پست'}
          </button>
        </div>
      </form>
    </div>
  );
};
