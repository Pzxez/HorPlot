import React, { useState, useEffect } from 'react'
import { auth } from './firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Characters from './pages/Characters'
import Timeline from './pages/Timeline'
import VocabBank from './pages/VocabBank'
import WritingRoom from './pages/WritingRoom'
import Auth from './pages/Auth'
import Premium from './pages/Premium'
import RelationshipMap from './pages/RelationshipMap'
import Footer from './components/Footer'
import Toast from './components/Toast'
import TermsModal from './components/TermsModal'
import { usePremiumStatus } from './hooks/usePremiumStatus'

import { getProject } from './firebase/projectService'

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [language, setLanguage] = useState('TH');
  const [selectedProjectId, setSelectedProjectId] = useState(localStorage.getItem('selectedProjectId'));
  const [selectedProject, setSelectedProject] = useState(null);
  const [toast, setToast] = useState(null);

  const { isPremium, purchasedFeatures, hasAcceptedTerms, loading: premiumLoading } = usePremiumStatus(user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setSelectedProjectId(null);
        setSelectedProject(null);
        localStorage.removeItem('selectedProjectId');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch project details when ID changes or on init
  useEffect(() => {
    const fetchProject = async () => {
      if (selectedProjectId) {
        const project = await getProject(selectedProjectId);
        if (project) {
          setSelectedProject(project);
        } else {
          // If project not found (e.g., deleted), clear selection
          setSelectedProjectId(null);
          setSelectedProject(null);
          localStorage.removeItem('selectedProjectId');
        }
      } else {
        setSelectedProject(null);
      }
    };
    fetchProject();
  }, [selectedProjectId]);

  const showToast = React.useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const handleSelectProject = async (id) => {
    setSelectedProjectId(id);
    localStorage.setItem('selectedProjectId', id);
    // Project details will be fetched by the useEffect
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
        return <Premium showToast={showToast} isPremium={isPremium} purchasedFeatures={purchasedFeatures} setActiveTab={setActiveTab} />;
      case 'relationship-map':
        return <RelationshipMap projectId={selectedProjectId} language={language} showToast={showToast} />;
      default:
        return <Dashboard language={language} onSelectProject={handleSelectProject} selectedProjectId={selectedProjectId} showToast={showToast} />;
    }
  };

  if (loading || (user && premiumLoading)) {
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

  // Legal Gate: Block everything if user exists but hasn't accepted terms
  if (user && !hasAcceptedTerms) {
    return <TermsModal user={user} language={language} showToast={showToast} />;
  }

  return (
    <div className="flex flex-col bg-[var(--bg-mesh-4)] min-h-screen text-[var(--text-main)] overflow-x-hidden">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        selectedProjectId={selectedProjectId}
        selectedProject={selectedProject}
        isPremium={isPremium}
        purchasedFeatures={purchasedFeatures}
        showToast={showToast}
      />
      <main className="flex-1 p-6 md:p-12 w-full flex flex-col">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
          {renderContent()}
        </div>
      </main>
      <Footer />
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
