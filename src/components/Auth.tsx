import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        }
      } else {
        if (password !== confirmPassword) {
          setError('رمز عبور و تکرار آن یکسان نیستند');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('رمز عبور باید حداقل ۶ کاراکتر باشد');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, username, displayName);
        if (error) {
          setError(error.message);
        }
      }
    } catch (err) {
      setError('خطایی رخ داد. لطفا دوباره تلاش کنید');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">{isLogin ? 'ورود به حساب' : 'ثبت نام'}</h1>
          <p className="auth-subtitle">
            {isLogin ? 'به شبکه اجتماعی خوش آمدید' : 'عضو شبکه اجتماعی شوید'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="username">نام کاربری</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="username"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="displayName">نام نمایشی</label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  placeholder="نام شما"
                  className="form-input"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">ایمیل</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@email.com"
              className="form-input"
              dir="ltr"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">رمز عبور</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="form-input"
              dir="ltr"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">تکرار رمز عبور</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="form-input"
                dir="ltr"
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'لطفا صبر کنید...' : isLogin ? 'ورود' : 'ثبت نام'}
          </button>
        </form>

        <div className="auth-footer">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="toggle-button"
          >
            {isLogin ? 'حساب کاربری ندارید؟ ثبت نام کنید' : 'حساب دارید؟ وارد شوید'}
          </button>
        </div>
      </div>
    </div>
  );
};
