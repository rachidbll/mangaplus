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
}

export const UserView: React.FC<UserViewProps> = ({ currentState, setCurrentState }) => {
  const [currentChapterId, setCurrentChapterId] = useState<number | null>(null);
  const [mangaInfo, setMangaInfo] = useState<MangaInfo | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [mangaStats, setMangaStats] = useState<MangaStats | null>(null);
  const [defaultBannerImage, setDefaultBannerImage] = useState('https://picsum.photos/1200/400');
  const [defaultHeroImage, setDefaultHeroImage] = useState('https://picsum.photos/400/600');
  const [defaultChapterImage, setDefaultChapterImage] = useState('https://picsum.photos/800/1200');

  useEffect(() => {
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
            totalViews: 2500000,
            rating: 4.8,
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
            totalViews: 2500000,
            rating: 4.8,
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

    const siteTitle = localStorage.getItem('siteTitle');
    const siteDescription = localStorage.getItem('siteDescription');
    const storedDefaultBannerImage = localStorage.getItem('defaultBannerImage');
    const storedDefaultHeroImage = localStorage.getItem('defaultHeroImage');
    const storedDefaultChapterImage = localStorage.getItem('defaultChapterImage');

    if (siteTitle) {
      document.title = siteTitle;
    }
    if (siteDescription) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', siteDescription);
      }
    }
    if (storedDefaultBannerImage) {
      setDefaultBannerImage(storedDefaultBannerImage);
    }
    if (storedDefaultHeroImage) {
      setDefaultHeroImage(storedDefaultHeroImage);
    }
    if (storedDefaultChapterImage) {
      setDefaultChapterImage(storedDefaultChapterImage);
    }
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
