import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Profile, Rank } from '../types';

export const AdminPanel = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRankName, setNewRankName] = useState('');
  const [newRankColor, setNewRankColor] = useState('#6B7280');
  const [newRankPriority, setNewRankPriority] = useState(0);

  const isOwner = profile?.rank && (profile.rank as Rank).priority >= 1000;

  useEffect(() => {
    if (isOwner) {
      fetchData();
    }
  }, [isOwner]);

  const fetchData = async () => {
    setLoading(true);

    const [usersData, ranksData] = await Promise.all([
      supabase.from('profiles').select('*, rank:ranks(*)').order('created_at', { ascending: false }),
      supabase.from('ranks').select('*').order('priority', { ascending: false })
    ]);

    if (usersData.data) setUsers(usersData.data as Profile[]);
    if (ranksData.data) setRanks(ranksData.data);

    setLoading(false);
  };

  const createRank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRankName.trim()) return;

    const { error } = await supabase.from('ranks').insert({
      name: newRankName,
      color: newRankColor,
      priority: newRankPriority,
    });

    if (!error) {
      setNewRankName('');
      setNewRankColor('#6B7280');
      setNewRankPriority(0);
      fetchData();
    }
  };

  const updateUserRank = async (userId: string, rankId: string | null) => {
    await supabase
      .from('profiles')
      .update({ rank_id: rankId })
      .eq('id', userId);
    fetchData();
  };

  const toggleVerified = async (userId: string, currentStatus: boolean) => {
    await supabase
      .from('profiles')
      .update({ is_verified: !currentStatus })
      .eq('id', userId);
    fetchData();
  };

  const togglePremium = async (userId: string, currentStatus: boolean) => {
    const premiumUntil = currentStatus ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from('profiles')
      .update({
        is_premium: !currentStatus,
        premium_until: premiumUntil,
      })
      .eq('id', userId);
    fetchData();
  };

  if (!isOwner) {
    return (
      <div className="admin-panel">
        <div className="access-denied">
          <h2>دسترسی محدود</h2>
          <p>فقط مالک سایت می‌تواند به این بخش دسترسی داشته باشد</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <h2 className="admin-title">پنل مدیریت</h2>

      <div className="admin-section">
        <h3 className="section-title">ایجاد رنک جدید</h3>
        <form onSubmit={createRank} className="rank-form">
          <div className="form-row">
            <input
              type="text"
              value={newRankName}
              onChange={(e) => setNewRankName(e.target.value)}
              placeholder="نام رنک"
              className="form-input"
              required
            />
            <input
              type="color"
              value={newRankColor}
              onChange={(e) => setNewRankColor(e.target.value)}
              className="color-input"
            />
            <input
              type="number"
              value={newRankPriority}
              onChange={(e) => setNewRankPriority(Number(e.target.value))}
              placeholder="اولویت"
              className="form-input priority-input"
            />
            <button type="submit" className="create-button">
              ایجاد
            </button>
          </div>
        </form>
      </div>

      <div className="admin-section">
        <h3 className="section-title">رنک‌های موجود</h3>
        <div className="ranks-list">
          {ranks.map((rank) => (
            <div key={rank.id} className="rank-item">
              <div
                className="rank-color"
                style={{ backgroundColor: rank.color }}
              ></div>
              <span className="rank-name">{rank.name}</span>
              <span className="rank-priority">اولویت: {rank.priority}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-section">
        <h3 className="section-title">مدیریت کاربران</h3>
        <div className="users-table">
          {users.map((user) => (
            <div key={user.id} className="user-row">
              <div className="user-info-cell">
                <div className="user-name-row">
                  <span className="user-display-name">{user.display_name}</span>
                  {user.is_verified && <span className="verified-badge">✓</span>}
                  {user.is_premium && <span className="premium-badge">★</span>}
                </div>
                <div className="user-meta-row">
                  <span className="username">@{user.username}</span>
                  <span className="user-id">#{user.user_id}</span>
                </div>
              </div>
              <div className="user-actions">
                <select
                  value={user.rank_id || ''}
                  onChange={(e) => updateUserRank(user.id, e.target.value || null)}
                  className="rank-select"
                >
                  <option value="">بدون رنک</option>
                  {ranks.map((rank) => (
                    <option key={rank.id} value={rank.id}>
                      {rank.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => toggleVerified(user.id, user.is_verified)}
                  className={`action-btn ${user.is_verified ? 'active' : ''}`}
                  title="تایید کاربر"
                >
                  ✓
                </button>
                <button
                  onClick={() => togglePremium(user.id, user.is_premium)}
                  className={`action-btn ${user.is_premium ? 'active' : ''}`}
                  title="پرمیوم"
                >
                  ★
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
