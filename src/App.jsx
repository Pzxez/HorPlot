import React, { useState, useEffect } from 'react'
import { auth } from './firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Characters from './pages/Characters'
import Timeline from './pages/Timeline'
import VocabBank from './pages/VocabBank'
import WritingRoom from './pages/WritingRoom'
import Auth from './pages/Auth'
import Premium from './pages/Premium'
import Toast from './components/Toast'

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [language, setLanguage] = useState('TH');
  const [selectedProjectId, setSelectedProjectId] = useState(localStorage.getItem('selectedProjectId'));
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSelectProject = (id) => {
    setSelectedProjectId(id);
    localStorage.setItem('selectedProjectId', id);
    setActiveTab('dashboard');
    showToast(language === 'TH' ? 'เลือกนิยายเรียบร้อยแล้ว' : 'Novel selected successfully');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard language={language} onSelectProject={handleSelectProject} selectedProjectId={selectedProjectId} showToast={showToast} />;
      case 'characters':
        return <Characters language={language} projectId={selectedProjectId} showToast={showToast} />;
      case 'writing':
        return <WritingRoom language={language} projectId={selectedProjectId} showToast={showToast} />;
      case 'timeline':
        return <Timeline language={language} projectId={selectedProjectId} showToast={showToast} />;
      case 'vocab':
        return <VocabBank language={language} setLanguage={setLanguage} projectId={selectedProjectId} showToast={showToast} />;
      case 'premium':
        return <Premium showToast={showToast} />;
      default:
        return <Dashboard language={language} onSelectProject={handleSelectProject} selectedProjectId={selectedProjectId} showToast={showToast} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-mesh-4)] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-3xl bg-accent-primary/20 mb-4" />
          <div className="h-4 w-32 bg-accent-primary/10 rounded-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="flex bg-[var(--bg-mesh-4)] min-h-screen text-[var(--text-main)] overflow-x-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} language={language} setLanguage={setLanguage} selectedProjectId={selectedProjectId} />
      <main className="flex-1 p-6 md:p-12 overflow-y-auto w-full">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default App
