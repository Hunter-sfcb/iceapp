import { useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { Navbar } from './components/Navbar';
import { Feed } from './components/Feed';
import { AdminPanel } from './components/AdminPanel';
import { useState } from 'react';

function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'admin'>('feed');

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-large"></div>
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="app">
      <Navbar />
      <div className="main-container">
        <div className="tabs">
          <button
            onClick={() => setActiveTab('feed')}
            className={`tab ${activeTab === 'feed' ? 'active' : ''}`}
          >
            خانه
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`tab ${activeTab === 'admin' ? 'active' : ''}`}
          >
            پنل مدیریت
          </button>
        </div>
        <div className="content">
          {activeTab === 'feed' ? <Feed /> : <AdminPanel />}
        </div>
      </div>
    </div>
  );
}

export default App;
