import React, { useState, useEffect } from 'react';
import { Banner } from './Banner';
import { Hero } from './Hero';
import { ChaptersList } from './ChaptersList';
import { ChaptersGrid } from './ChaptersGrid';
import { ChapterReader } from './ChapterReader';
import { Footer } from './Footer';
import { SEO } from './SEO';
import axios from 'axios';
import { MangaInfo, Chapter, MangaStats, Character } from '../types/manga';

type UserState = 'home' | 'chapters' | 'reader' | 'characters' | 'favorites';

interface UserViewProps {
  currentState: UserState;
  setCurrentState: (state: UserState) => void;
  mangaInfo: MangaInfo | null;
  chapters: Chapter[];
  mangaStats: MangaStats | null;
}

export const UserView: React.FC<UserViewProps> = ({ currentState, setCurrentState, mangaInfo, chapters, mangaStats }) => {
  const [currentChapterId, setCurrentChapterId] = useState<number | null>(null);
  const [defaultBannerImage, setDefaultBannerImage] = useState('https://picsum.photos/1200/400');
  const [defaultHeroImage, setDefaultHeroImage] = useState('https://picsum.photos/400/600');
  const [defaultChapterImage, setDefaultChapterImage] = useState('https://picsum.photos/800/1200');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/api/settings');
        const settings = response.data;
        if (settings.siteTitle) {
          document.title = settings.siteTitle;
        }
        if (settings.siteDescription) {
          const metaDescription = document.querySelector('meta[name="description"]');
          if (metaDescription) {
            metaDescription.setAttribute('content', settings.siteDescription);
          }
        }
        if (settings.defaultBannerImage) {
          setDefaultBannerImage(settings.defaultBannerImage);
        }
        if (settings.defaultHeroImage) {
          setDefaultHeroImage(settings.defaultHeroImage);
        }
        if (settings.defaultChapterImage) {
          setDefaultChapterImage(settings.defaultChapterImage);
        }
      } catch (error) {
        console.error("Error fetching settings", error);
      }
    };
    fetchSettings();
  }, []);

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
            defaultChapterImage={defaultChapterImage}
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
            defaultChapterImage={defaultChapterImage}
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
              {(mangaInfo?.characters || []).map((character: Character) => (
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
          <SEO {...getSEOProps()} />
          <Banner
            title={mangaInfo.title}
            description={mangaInfo.synopsis}
            backgroundImage={mangaInfo.bannerImage || defaultBannerImage}
            onReadNow={handleReadNow}
          />
          <Hero
            mangaInfo={mangaInfo}
            mangaStats={mangaStats}
            onReadNow={handleReadNow}
            defaultHeroImage={mangaInfo.coverImage || defaultHeroImage}
          />
          <ChaptersGrid
            chapters={chapters}
            onChapterClick={handleChapterClick}
            defaultChapterImage={defaultChapterImage}
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

