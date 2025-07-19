import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navigation } from './components/Navigation';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserView } from './components/UserView';
import { MangaInfo, Chapter, MangaStats } from './types/manga';
import axios from 'axios';

type AppState = 'home' | 'chapters' | 'reader' | 'characters' | 'favorites' | 'admin';

function App() {
  const [currentView, setCurrentView] = useState<AppState>('home');
  const [mangaInfo, setMangaInfo] = useState<MangaInfo | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [mangaStats, setMangaStats] = useState<MangaStats | null>(null);

  useEffect(() => {
    // PWA registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    const fetchData = async () => {
      try {
        const response = await axios.get('/api/manga/all');
        if (response.data && response.data.length > 0) {
          const mangaData = response.data[0]; // Assuming one manga for now
          setMangaInfo(mangaData);
          setChapters((mangaData.chapters || []).map((chapter: Chapter) => ({
            ...chapter,
            chapterNumber: chapter.chapterNumber || 0,
            views: chapter.views || 0,
          })));
          setMangaStats({
            totalViews: mangaData.totalViews || 0,
            totalChapters: mangaData.totalChapters || 0,
            rating: mangaData.rating || 0,
            followers: 0, // Add this to your model if needed
            monthlyViews: 0, // Add this to your model if needed
          });
        } else {
          // Set mock data if API returns no data
          setMangaInfo({
            title: "Akira",
            author: "Katsuhiro Otomo",
            artist: "Katsuhiro Otomo",
            status: "completed",
            genres: ["Action", "Sci-Fi"],
            synopsis: "A secret military project endangers Neo-Tokyo when it turns a biker gang member into a rampaging psychic psychopath who can only be stopped by two teenagers and a group of psychics.",
            coverImage: 'https://picsum.photos/400/600',
            bannerImage: 'https://picsum.photos/1200/400',
            totalChapters: 120,
            rating: 4.5,
            lastUpdated: "2024-01-15",
            characters: [],
          });
          setChapters(Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            title: `Chapter ${i + 1}`,
            chapterNumber: i + 1,
            views: Math.floor(Math.random() * 1000),
            releaseDate: new Date().toISOString(),
            pages: ['https://picsum.photos/800/1200']
          })));
          setMangaStats({
            totalViews: 10000,
            totalChapters: 120,
            rating: 4.5,
            followers: 1000,
            monthlyViews: 500
          });
        }
      } catch (error) {
        console.error("Error fetching data, using mock data", error);
        // Set mock data on error
        setMangaInfo({
          title: "Akira",
          author: "Katsuhiro Otomo",
          artist: "Katsuhiro Otomo",
          status: "completed",
          genres: ["Action", "Sci-Fi"],
          synopsis: "A secret military project endangers Neo-Tokyo when it turns a biker gang member into a rampaging psychic psychopath who can only be stopped by two teenagers and a group of psychics.",
          coverImage: 'https://picsum.photos/400/600',
          bannerImage: 'https://picsum.photos/1200/400',
          totalChapters: 120,
          rating: 4.5,
          lastUpdated: "2024-01-15",
          characters: [],
        });
        setChapters(Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          title: `Chapter ${i + 1}`,
          chapterNumber: i + 1,
          views: Math.floor(Math.random() * 1000),
          releaseDate: new Date().toISOString(),
          pages: ['https://picsum.photos/800/1200']
        })));
        setMangaStats({
          totalViews: 10000,
          totalChapters: 120,
          rating: 4.5,
          followers: 1000,
          monthlyViews: 500
        });
      }
    };
    fetchData();
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
            mangaInfo={mangaInfo}
            chapters={chapters}
            mangaStats={mangaStats}
          />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
