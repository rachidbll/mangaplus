import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, Eye, BookOpen, ChevronRight, SortAsc, SortDesc } from 'lucide-react';
import { Chapter } from '../types/manga';

interface ChaptersGridProps {
  chapters: Chapter[];
  onChapterClick: (chapterId: number) => void;
}

type SortOption = 'newest' | 'oldest' | 'views' | 'chapter';
type SortOrder = 'asc' | 'desc';

export const ChaptersGrid: React.FC<ChaptersGridProps> = ({ chapters, onChapterClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedChapters = useMemo(() => {
    const filtered = chapters.filter(chapter => 
      chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chapter.chapterNumber.toString().includes(searchTerm)
    );

    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'newest':
          comparison = new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
          break;
        case 'oldest':
          comparison = new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
          break;
        case 'views':
          comparison = b.views - a.views;
          break;
        case 'chapter':
          comparison = a.chapterNumber - b.chapterNumber;
          break;
      }
      
      return sortOrder === 'desc' ? comparison : -comparison;
    });
  }, [chapters, searchTerm, sortBy, sortOrder]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleSortChange = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900" id="all-chapters">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            All Chapters
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Browse through all {chapters.length} chapters of Akira Chronicles. Use search and filters to find specific chapters quickly.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search chapters by title or number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              />
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
              >
                <Filter className="h-4 w-4" />
                <span>Sort</span>
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Sort Options */}
          {showFilters && (
            <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-4">
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'newest' as SortOption, label: 'Release Date' },
                  { key: 'chapter' as SortOption, label: 'Chapter Number' },
                  { key: 'views' as SortOption, label: 'Views' }
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => handleSortChange(option.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      sortBy === option.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {option.label}
                    {sortBy === option.key && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-slate-600 dark:text-slate-400">
            Showing {filteredAndSortedChapters.length} of {chapters.length} chapters
          </p>
        </div>

        {/* Chapters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedChapters.map((chapter) => (
            <article
              key={chapter.id}
              onClick={() => onChapterClick(chapter.id)}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg dark:shadow-slate-900/20 transition-all duration-300 cursor-pointer group border border-slate-200 dark:border-slate-700"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Chapter {chapter.chapterNumber}
                      </span>
                      {chapter.isNew && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          New
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {chapter.title}
                    </h3>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(chapter.releaseDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{formatNumber(chapter.views)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {chapter.pages.length} pages
                    </span>
                    <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 text-sm font-medium">
                      <BookOpen className="h-3 w-3" />
                      <span>Read</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredAndSortedChapters.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">No chapters found</h3>
            <p className="text-slate-500 dark:text-slate-400">Try adjusting your search terms or filters</p>
          </div>
        )}

      </div>
    </section>
  );
};