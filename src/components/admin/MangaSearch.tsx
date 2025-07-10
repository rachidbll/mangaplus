import React, { useState } from 'react';
import { Search, ExternalLink, Star, Calendar, BookOpen, User, Palette, Download } from 'lucide-react';
import { AniListService } from '../../services/anilistApi';
import { AniListManga } from '../../types/admin';
import axios from 'axios';

export const MangaSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<AniListManga[]>([]);
  const [selectedManga, setSelectedManga] = useState<AniListManga | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const anilistService = new AniListService();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const result = await anilistService.searchManga(searchTerm);
      setSearchResults(result.manga);
    } catch (err) {
      setError('Failed to search manga. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleImportManga = async (manga: AniListManga) => {
    const formattedManga = anilistService.formatMangaForApp(manga);
    
    const newManga = {
      anilistId: manga.id,
      ...formattedManga,
      apiMangaName: formattedManga.title.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim(),
      chapters: [],
      scrapingProgress: {
        totalChapters: 0,
        scrapedChapters: 0,
        failedChapters: [],
      },
    };

    await axios.post('/api/manga', newManga);
    
    alert('Manga imported successfully! Go to Manage Manga tab to configure API settings and scrape chapters.');
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getAuthor = (manga: AniListManga) => {
    return manga.staff?.nodes?.find(
      staff => staff.primaryOccupations?.includes('Story & Art') || 
               staff.primaryOccupations?.includes('Story')
    )?.name?.full || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Search AniList Database</h2>
        
        {/* Search Input */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search for manga by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !searchTerm.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Search className="h-5 w-5" />
            )}
            <span>{loading ? 'Searching...' : 'Search'}</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((manga) => (
              <div
                key={manga.id}
                className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedManga(manga)}
              >
                <div className="flex space-x-4">
                  <img
                    src={manga.coverImage?.medium || ''}
                    alt={manga.title.english || manga.title.romaji}
                    className="w-16 h-20 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1 truncate">
                      {manga.title.english || manga.title.romaji}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                      {formatStatus(manga.status)}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3" />
                        <span>{manga.averageScore ? (manga.averageScore / 10).toFixed(1) : 'N/A'}</span>
                      </div>
                      <span>•</span>
                      <span>{manga.chapters || 'Unknown'} ch</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Manga Details */}
      {selectedManga && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Manga Details</h3>
            <button
              onClick={() => setSelectedManga(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <img
                src={selectedManga.coverImage?.large || ''}
                alt={selectedManga.title.english || selectedManga.title.romaji}
                className="w-full max-w-sm mx-auto rounded-lg shadow-md"
              />
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div>
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {selectedManga.title.english || selectedManga.title.romaji}
                </h4>
                {selectedManga.title.native && (
                  <p className="text-slate-600 dark:text-slate-400 mb-2">{selectedManga.title.native}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Author:</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {getAuthor(selectedManga)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Status:</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {formatStatus(selectedManga.status)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Rating:</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {selectedManga.averageScore ? (selectedManga.averageScore / 10).toFixed(1) : 'N/A'}/10
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Chapters:</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {selectedManga.chapters || 'Unknown'}
                  </span>
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-slate-900 dark:text-white mb-2">Genres</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedManga.genres?.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-slate-900 dark:text-white mb-2">Description</h5>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {selectedManga.description?.replace(/<[^>]*>/g, '') || 'No description available.'}
                </p>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => handleImportManga(selectedManga)}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Import Manga</span>
                </button>
                
                <a
                  href={`https://anilist.co/manga/${selectedManga.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View on AniList</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};