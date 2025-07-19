import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navigation } from './components/Navigation';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserView } from './components/UserView';
import { MangaInfo } from './types/manga';

type AppState = 'home' | 'chapters' | 'reader' | 'characters' | 'favorites' | 'admin';

function App() {
  const [currentView, setCurrentView] = useState<AppState>('home');
  const [mangaInfo, setMangaInfo] = useState<MangaInfo | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  const handleNavigate = (page: AppState) => {
    setCurrentView(page);
  };

  const isAdmin = currentView === 'admin';

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
        <Navigation
          currentPage={currentView}
          onNavigate={handleNavigate}
          mangaInfo={mangaInfo}
        />
        
        {isAdmin ? (
          <AdminDashboard />
        ) : (
          <UserView 
            currentState={currentView}
            setCurrentState={handleNavigate}
            setMangaInfo={setMangaInfo}
          />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
