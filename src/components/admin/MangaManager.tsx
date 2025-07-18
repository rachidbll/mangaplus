import React, { useState, useEffect } from 'react';
import { Trash2, Download, RefreshCw, CheckCircle, XCircle, Play, Pause, Search, Grid } from 'lucide-react';
import { AdminManga, SearchResult } from '../../types/admin';
import { ScrapingService } from '../../services/scrapingService';
import axios from 'axios';

export const MangaManager: React.FC = () => {
  const [mangaList, setMangaList] = useState<AdminManga[]>([]);
  const [selectedManga, setSelectedManga] = useState<AdminManga | null>(null);
  const [scraping, setScraping] = useState(false);
  const [scrapingProgress, setScrapingProgress] = useState<string>('');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [availableChapters, setAvailableChapters] = useState<string[]>([]);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{ success: boolean; chaptersFound: number; sampleChapters: string[]; error?: string; apiUrl?: string; corsIssue?: boolean; } | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedSearchResult, setSelectedSearchResult] = useState<SearchResult | null>(null);

  const scrapingService = new ScrapingService();

  useEffect(() => {
    loadMangaList();
  }, []);

  const loadMangaList = async () => {
    const response = await axios.get('/api/manga');
    setMangaList(response.data);
  };

  const deleteManga = async (mangaId: string) => {
    if (confirm('Are you sure you want to delete this manga? This action cannot be undone.')) {
      await axios.delete(`/api/manga/${mangaId}`);
      loadMangaList();
      if (selectedManga?.id === mangaId) {
        setSelectedManga(null);
      }
    }
  };

  const testApiConnection = async (manga: AdminManga) => {
    setTestingConnection(true);
    setConnectionResult(null);

    try {
      const result = await scrapingService.testApiConnection(manga.apiMangaName);
      setConnectionResult(result);
      
      if (result.success) {
        setAvailableChapters(result.sampleChapters);
      }
    } catch (error) {
      setConnectionResult({
        success: false,
        chaptersFound: 0,
        sampleChapters: [],
        error: `Connection test failed: ${error}`
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const scrapeChapters = async (manga: AdminManga, selectedOnly: boolean = false) => {
    setScraping(true);
    setScrapingProgress('Starting API-based scraping...');

    try {
      const chaptersToScrape = selectedOnly ? selectedChapters : undefined;
      setScrapingProgress(`Fetching chapters from API...`);
      
      const scrapedChapters = await scrapingService.scrapeChaptersFromApi(
        manga.apiMangaName, 
        chaptersToScrape
      );
      
      setScrapingProgress(`Successfully scraped ${scrapedChapters.length} chapters!`);
      
      // Update manga with scraped chapters
      const updatedManga = {
        ...manga,
        chapters: scrapedChapters,
        scrapingProgress: {
          totalChapters: scrapedChapters.length,
          scrapedChapters: scrapedChapters.length,
          failedChapters: [],
          lastScrapedAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      };

      await axios.put(`/api/manga/${manga.id}`, updatedManga);
      loadMangaList();
      setSelectedManga(updatedManga);

      setTimeout(() => {
        setScrapingProgress('');
        setScraping(false);
      }, 2000);

    } catch (error) {
      setScrapingProgress(`Scraping failed: ${error}`);
      setTimeout(() => {
        setScrapingProgress('');
        setScraping(false);
      }, 3000);
    }
  };

  const updateApiMangaName = async (manga: AdminManga, newName: string) => {
    const updatedManga = {
      ...manga,
      apiMangaName: newName,
      updatedAt: new Date().toISOString()
    };

    await axios.put(`/api/manga/${manga.id}`, updatedManga);
    loadMangaList();
    setSelectedManga(updatedManga);
  };

  const exportMangaData = (manga: AdminManga) => {
    const appData = {
      mangaInfo: {
        title: manga.title,
        author: manga.author,
        artist: manga.artist,
        status: manga.status,
        genres: manga.genres,
        synopsis: manga.description,
        coverImage: manga.coverImage,
        bannerImage: manga.bannerImage,
        totalChapters: manga.chapters ? manga.chapters.length : 0,
        totalViews: 0,
        rating: manga.rating,
        lastUpdated: manga.updatedAt.split('T')[0]
      },
      chapters: manga.chapters ? manga.chapters.map((chapter, index) => ({
        id: index + 1,
        title: chapter.title,
        chapterNumber: chapter.chapterNumber,
        releaseDate: new Date().toISOString().split('T')[0],
        pages: chapter.pages,
        views: Math.floor(Math.random() * 10000) + 1000,
        isNew: manga.chapters && index >= manga.chapters.length - 3
      })) : []
    };

    const dataStr = JSON.stringify(appData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${manga.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_data.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const handleChapterSelection = (chapter: string, checked: boolean) => {
    if (checked) {
      setSelectedChapters([...selectedChapters, chapter]);
    } else {
      setSelectedChapters(selectedChapters.filter(c => c !== chapter));
    }
  };

  const selectAllChapters = () => {
    setSelectedChapters([...availableChapters]);
  };

  const clearSelection = () => {
    setSelectedChapters([]);
  };

  const searchAvailableManga = async (manga: AdminManga) => {
    setSearching(true);
    setSearchResults([]);
    setSelectedSearchResult(null);

    try {
      const results = await scrapingService.searchManga(manga.apiMangaName);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Manage Manga</h2>
        
        {mangaList.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400 mb-4">No manga imported yet.</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Use the Search tab to import manga from AniList.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Manga List */}
            <div className="lg:col-span-1">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Imported Manga</h3>
              <div className="space-y-3">
                {mangaList.map((manga) => (
                  <div
                    key={manga.id}
                    onClick={() => setSelectedManga(manga)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedManga?.id === manga.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <img
                        src={manga.coverImage}
                        alt={manga.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900 dark:text-white truncate">
                          {manga.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center space-x-1">
                            {manga.scrapingProgress.scrapedChapters > 0 ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {manga.scrapingProgress.scrapedChapters} chapters
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          Updated: {new Date(manga.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manga Details */}
            <div className="lg:col-span-2">
              {selectedManga ? (
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <img
                        src={selectedManga.coverImage}
                        alt={selectedManga.title}
                        className="w-24 h-32 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                          {selectedManga.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-2">
                          by {selectedManga.author}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                          <span>{selectedManga.status}</span>
                          <span>•</span>
                          <span>{selectedManga.scrapingProgress.scrapedChapters} chapters scraped</span>
                          <span>•</span>
                          <span>Rating: {selectedManga.rating}/10</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteManga(selectedManga.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Delete manga"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  {/* API Configuration */}
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">API Configuration</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Manga Name for API
                        </label>
                        <input
                          type="text"
                          value={selectedManga.apiMangaName}
                          onChange={(e) => updateApiMangaName(selectedManga, e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          placeholder="Enter manga name for API requests"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          This name will be used in API requests to fetch chapters
                        </p>
                      </div>
                      
                      <button
                        onClick={() => testApiConnection(selectedManga)}
                        disabled={testingConnection}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors"
                      >
                        {testingConnection ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        <span>{testingConnection ? 'Testing...' : 'Test API Connection'}</span>
                      </button>
                      
                      <button
                        onClick={() => searchAvailableManga(selectedManga)}
                        disabled={searching}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors"
                      >
                        {searching ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                        <span>{searching ? 'Searching...' : 'Search Available Manga'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                        <Grid className="h-5 w-5" />
                        <span>Available Manga ({searchResults.length} found)</span>
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {searchResults.map((result, index) => (
                          <div
                            key={index}
                            onClick={() => setSelectedSearchResult(result)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedSearchResult?.href === result.href
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                            }`}
                          >
                            <div className="flex space-x-3">
                              <img
                                src={result.image}
                                alt={result.title}
                                className="w-16 h-20 object-cover rounded"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64x80?text=No+Image';
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-slate-900 dark:text-white text-sm mb-1 truncate">
                                  {result.title}
                                </h5>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                  {result.chapters}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">
                                  {result.status} • {result.type}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {result.genres.slice(0, 3).map((genre, i) => (
                                    <span
                                      key={i}
                                      className="text-xs bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 px-1 py-0.5 rounded"
                                    >
                                      {genre}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            {selectedSearchResult?.href === result.href && (
                              <div className="mt-2 flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-xs font-medium">Selected for scraping</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {selectedSearchResult && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="text-blue-700 dark:text-blue-300 text-sm">
                            <strong>Selected:</strong> {selectedSearchResult.title} 
                            <span className="ml-2 text-blue-600 dark:text-blue-400">
                              (API name: "{selectedSearchResult.name}")
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {searchResults.length === 0 && searching === false && connectionResult && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <p className="text-amber-700 dark:text-amber-300 text-sm">
                        No manga found with the name "{selectedManga.apiMangaName}". Try adjusting the manga name or search for available options.
                      </p>
                    </div>
                  )}

                  {/* Connection Test Results */}
                  {connectionResult && (
                    <div className={`rounded-lg p-4 ${
                      connectionResult.success 
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    }`}>
                      <div className="flex items-center space-x-2 mb-2">
                        {connectionResult.success ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <h4 className={`font-medium ${
                          connectionResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                        }`}>
                          {connectionResult.success ? 'Connection Successful' : 'Connection Failed'}
                        </h4>
                      </div>
                      
                      {connectionResult.success ? (
                        <div>
                          <p className="text-green-600 dark:text-green-400 text-sm mb-2">
                            Found {connectionResult.chaptersFound} chapters
                            {connectionResult.corsIssue && ' (via proxy due to CORS)'}
                          </p>
                          {connectionResult.sampleChapters.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Sample chapters:</p>
                              <div className="space-y-1">
                                {connectionResult.sampleChapters.map((chapter: string, index: number) => (
                                  <label key={index} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={selectedChapters.includes(chapter)}
                                      onChange={(e) => handleChapterSelection(chapter, e.target.checked)}
                                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-green-600 dark:text-green-400">{chapter}</span>
                                  </label>
                                ))}
                              </div>
                              
                              <div className="flex space-x-2 mt-3">
                                <button
                                  onClick={selectAllChapters}
                                  className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                >
                                  Select All
                                </button>
                                <button
                                  onClick={clearSelection}
                                  className="text-xs px-2 py-1 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors"
                                >
                                  Clear Selection
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-red-600 dark:text-red-400 text-sm">
                          {connectionResult.error}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => scrapeChapters(selectedManga, false)}
                      disabled={scraping}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors"
                    >
                      {scraping ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      <span>{scraping ? 'Scraping...' : 'Scrape All Chapters'}</span>
                    </button>

                    <button
                      onClick={() => scrapeChapters(selectedManga, true)}
                      disabled={scraping || selectedChapters.length === 0}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors"
                    >
                      {scraping ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Pause className="h-4 w-4" />
                      )}
                      <span>Scrape Selected ({selectedChapters.length})</span>
                    </button>

                    <button
                      onClick={() => exportMangaData(selectedManga)}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export Data</span>
                    </button>
                    
                    {selectedSearchResult && (
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Will scrape: <strong>{selectedSearchResult.title}</strong>
                      </div>
                    )}
                  </div>

                  {/* Scraping Progress */}
                  {scrapingProgress && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-blue-700 dark:text-blue-300">{scrapingProgress}</p>
                    </div>
                  )}

                  {/* Scraping Statistics */}
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Scraping Statistics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {selectedManga.scrapingProgress.scrapedChapters}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Scraped</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {selectedManga.scrapingProgress.failedChapters.length}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Failed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {selectedManga.chapters ? selectedManga.chapters.reduce((total, ch) => total + ch.pages.length, 0) : 0}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Total Pages</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {selectedManga.scrapingProgress.lastScrapedAt ? 
                            new Date(selectedManga.scrapingProgress.lastScrapedAt).toLocaleDateString() : 
                            'Never'
                          }
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Last Scraped</div>
                      </div>
                    </div>
                  </div>

                  {/* Chapters List */}
                  {selectedManga.chapters && selectedManga.chapters.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
                        Scraped Chapters ({selectedManga.chapters.length})
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedManga.chapters.map((chapter, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                          >
                            <div>
                              <h5 className="font-medium text-slate-900 dark:text-white">
                                {chapter.title}
                              </h5>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {chapter.pages.length} pages
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-xs text-slate-400 dark:text-slate-500">
                                Complete
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500 dark:text-slate-400">
                    Select a manga from the list to view details and manage chapters.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};