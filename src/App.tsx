import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navigation } from './components/Navigation';
import { Banner } from './components/Banner';
import { Hero } from './components/Hero';
import { ChaptersList } from './components/ChaptersList';
import { ChaptersGrid } from './components/ChaptersGrid';
import { ChapterReader } from './components/ChapterReader';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Footer } from './components/Footer';
import { SEO } from './components/SEO';
import axios from 'axios';
import { MangaInfo, Chapter, MangaStats } from './types/manga';

type AppState = 'home' | 'chapters' | 'reader' | 'characters' | 'favorites' | 'admin';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('home');
  const [currentChapterId, setCurrentChapterId] = useState<number | null>(null);
  const [mangaInfo, setMangaInfo] = useState<MangaInfo | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [mangaStats, setMangaStats] = useState<MangaStats | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get('/api/manga/all');
      const mangaData = response.data[0]; // Assuming one manga for now
      setMangaInfo(mangaData);
      setChapters(mangaData.chapters || []);
      setMangaStats({
        totalViews: mangaData.totalViews,
        totalChapters: mangaData.totalChapters,
        rating: mangaData.rating,
        followers: 0, // Add this to your model if needed
        monthlyViews: 0, // Add this to your model if needed
      });
    };
    fetchData();

    const siteTitle = localStorage.getItem('siteTitle');
    const siteDescription = localStorage.getItem('siteDescription');
    if (siteTitle) {
      document.title = siteTitle;
    }
    if (siteDescription) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', siteDescription);
      }
    }
  }, []);

  // PWA registration
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

  const handleNavigate = (page: string) => {
    if (page === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
      setCurrentState(page as AppState);
    }
    setCurrentChapterId(null);
  };

  const handleChapterClick = (chapterId: number) => {
    setCurrentChapterId(chapterId);
    setCurrentState('reader');
  };

  const handleReadNow = () => {
    setCurrentChapterId(1);
    setCurrentState('reader');
  };

  const currentChapter = currentChapterId ? chapters.find(c => c.id === currentChapterId) : null;
  const latestChapters = chapters ? chapters.slice(-5).reverse() : [];

  // SEO optimization based on current state
  const getSEOProps = () => {
    switch (currentState) {
      case 'reader':
        if (currentChapter) {
          return {
            title: `${currentChapter.title} - Chapter ${currentChapter.chapterNumber} | Akira Chronicles`,
            description: `Read ${currentChapter.title} online. Chapter ${currentChapter.chapterNumber} of Akira Chronicles manga with high-quality images and fast loading.`,
            type: 'article'
          };
        }
        break;
      case 'chapters':
        return {
          title: 'All Chapters - Akira Chronicles Manga',
          description: 'Browse all chapters of Akira Chronicles manga. Read online with the best manga reading experience.',
          type: 'website'
        };
      default:
        return {
          title: 'Akira Chronicles - Read Manga Online | Best Manga Reader',
          description: 'Read Akira Chronicles manga online with the best reading experience. Follow the epic story of Kaneda and Tetsuo in Neo-Tokyo. Updated regularly with new chapters.',
          type: 'website'
        };
    }
    return {};
  };

  const renderUserContent = () => {
    if (!mangaInfo || !mangaStats) {
      return <div>Loading...</div>;
    }
    switch (currentState) {
      case 'reader':
        if (currentChapter) {
          return (
            <ChapterReader
              chapter={currentChapter}
              allChapters={chapters}
              onNavigateHome={() => setCurrentState('home')}
              onNavigateChapter={handleChapterClick}
              onShowChaptersList={() => setCurrentState('chapters')}
            />
          );
        }
        return null;

      case 'chapters':
        return (
          <>
            <ChaptersList
              chapters={chapters}
              onChapterClick={handleChapterClick}
            />
            <Footer
              mangaInfo={mangaInfo}
              latestChapters={latestChapters}
              onChapterClick={handleChapterClick}
            />
          </>
        );

      case 'characters':
        return (
          <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-8">Characters</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {mangaInfo?.characters?.map((character) => (
                  <div key={character.id} className="bg-white rounded-lg shadow-md p-4 text-center">
                    <img src={character.image} alt={character.name} className="w-32 h-32 rounded-full mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900">{character.name}</h3>
                    <p className="text-slate-600 text-sm">{character.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'favorites':
        return (
          <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-8">Favorites</h1>
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-slate-600">Your favorite chapters will appear here...</p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <>
            <Banner
              title={mangaInfo.title}
              description={mangaInfo.synopsis}
              backgroundImage="https://picsum.photos/1200/400"
              onReadNow={handleReadNow}
            />
            <Hero
              mangaInfo={mangaInfo}
              mangaStats={mangaStats}
              onReadNow={handleReadNow}
            />
            <ChaptersGrid
              chapters={chapters}
              onChapterClick={handleChapterClick}
            />
            <Footer
              mangaInfo={mangaInfo}
              latestChapters={latestChapters}
              onChapterClick={handleChapterClick}
            />
          </>
        );
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
        <SEO {...getSEOProps()} />
        
        <Navigation
          currentPage={currentState}
          onNavigate={handleNavigate}
        />
        
        {isAdmin ? <AdminDashboard /> : renderUserContent()}
      </div>
    </ThemeProvider>
  );
}

export default App;
