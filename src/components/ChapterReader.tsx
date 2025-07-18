import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Home, List, Settings, Share2, BookOpen, Eye } from 'lucide-react';
import { Chapter } from '../types/manga';

interface ChapterReaderProps {
  chapter: Chapter;
  allChapters: Chapter[];
  onNavigateHome: () => void;
  onNavigateChapter: (chapterId: number) => void;
  onShowChaptersList: () => void;
  defaultChapterImage: string;
}

export const ChapterReader: React.FC<ChapterReaderProps> = ({
  chapter,
  allChapters,
  onNavigateHome,
  onNavigateChapter,
  onShowChaptersList,
  defaultChapterImage
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [readingMode, setReadingMode] = useState<'single' | 'continuous'>('single');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const currentChapterIndex = allChapters.findIndex(c => c.id === chapter.id);
  const previousChapter = currentChapterIndex > 0 ? allChapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex < allChapters.length - 1 ? allChapters[currentChapterIndex + 1] : null;

  const nextPage = useCallback(() => {
    if (currentPageIndex < chapter.pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    } else if (nextChapter) {
      onNavigateChapter(nextChapter.id);
    }
  }, [currentPageIndex, chapter.pages.length, nextChapter, onNavigateChapter]);

  const previousPage = useCallback(() => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    } else if (previousChapter) {
      onNavigateChapter(previousChapter.id);
    }
  }, [currentPageIndex, previousChapter, onNavigateChapter]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: chapter.title,
          text: `Check out ${chapter.title} from Akira Chronicles`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          previousPage();
          break;
        case 'ArrowRight':
          nextPage();
          break;
        case 'Escape':
          setIsFullscreen(false);
          break;
        case 'f':
          setIsFullscreen(!isFullscreen);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previousPage, nextPage, isFullscreen]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isFullscreen) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    } else {
      setShowControls(true);
    }
    return () => clearTimeout(timeout);
  }, [isFullscreen, currentPageIndex]);

  return (
    <div className={`min-h-screen bg-black ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className={`bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 transition-transform duration-300 ${
        isFullscreen && !showControls ? '-translate-y-full' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onNavigateHome}
                className="text-slate-300 hover:text-white transition-colors"
              >
                <Home className="h-5 w-5" />
              </button>
              <button
                onClick={onShowChaptersList}
                className="text-slate-300 hover:text-white transition-colors"
              >
                <List className="h-5 w-5" />
              </button>
              <div className="text-white">
                <span className="font-medium">Chapter {chapter.chapterNumber}</span>
                <span className="text-slate-400 ml-2">•</span>
                <span className="text-slate-400 ml-2">{chapter.title}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-slate-400 text-sm">
                {currentPageIndex + 1} / {chapter.pages.length}
              </span>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setReadingMode(readingMode === 'single' ? 'continuous' : 'single')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  <BookOpen className="h-5 w-5" />
                </button>
                
                <button
                  onClick={handleShare}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reading Area */}
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {readingMode === 'single' ? (
          <div className="relative max-w-4xl w-full">
            <img
              src={chapter.pages[currentPageIndex] || defaultChapterImage}
              alt={`Page ${currentPageIndex + 1}`}
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={() => setShowControls(!showControls)}
            />
            
            {/* Navigation Overlays */}
            <button
              onClick={previousPage}
              className="absolute left-0 top-0 w-1/3 h-full bg-transparent hover:bg-black/10 transition-colors z-10"
              aria-label="Previous page"
            />
            <button
              onClick={nextPage}
              className="absolute right-0 top-0 w-1/3 h-full bg-transparent hover:bg-black/10 transition-colors z-10"
              aria-label="Next page"
            />
          </div>
        ) : (
          <div className="max-w-4xl w-full space-y-4">
            {chapter.pages.map((page, index) => (
              <img
                key={index}
                src={page || defaultChapterImage}
                alt={`Page ${index + 1}`}
                className="w-full h-auto object-contain rounded-lg shadow-lg"
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className={`fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 transition-transform duration-300 ${
        isFullscreen && !showControls ? 'translate-y-full' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => previousChapter && onNavigateChapter(previousChapter.id)}
              disabled={!previousChapter}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous Chapter</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-slate-400">
                <Eye className="h-4 w-4" />
                <span className="text-sm">{chapter.views.toLocaleString()} views</span>
              </div>
              
              <div className="text-white text-sm">
                Page {currentPageIndex + 1} of {chapter.pages.length}
              </div>
            </div>
            
            <button
              onClick={() => nextChapter && onNavigateChapter(nextChapter.id)}
              disabled={!nextChapter}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">Next Chapter</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};