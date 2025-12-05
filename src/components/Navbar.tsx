import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {
  const { profile, signOut } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1 className="brand-title">شبکه اجتماعی</h1>
        </div>

        <div className="navbar-user">
          {profile && (
            <>
              <div className="user-info">
                <div className="user-display">
                  <span className="user-name">{profile.display_name}</span>
                  {profile.is_verified && (
                    <span className="verified-badge">✓</span>
                  )}
                  {profile.is_premium && (
                    <span className="premium-badge">★</span>
                  )}
                </div>
                <div className="user-meta">
                  <span className="user-username">@{profile.username}</span>
                  <span className="user-id">#{profile.user_id}</span>
                  {profile.rank && (
                    <span
                      className="rank-badge"
                      style={{ backgroundColor: profile.rank.color }}
                    >
                      {profile.rank.name}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={signOut} className="signout-button">
                خروج
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
