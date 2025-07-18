import React from 'react';
import { Star, Eye, BookOpen, Calendar, Users, TrendingUp } from 'lucide-react';
import { MangaInfo, MangaStats } from '../types/manga';

interface HeroProps {
  mangaInfo: MangaInfo;
  mangaStats: MangaStats;
  onReadNow: () => void;
  defaultHeroImage: string;
}

export const Hero: React.FC<HeroProps> = ({ mangaInfo, mangaStats, onReadNow, defaultHeroImage }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="relative min-h-[70vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/22000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                  {mangaInfo.status ? mangaInfo.status.charAt(0).toUpperCase() + mangaInfo.status.slice(1) : ''}
                </span>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-yellow-400 font-medium">{mangaInfo.rating}</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                {mangaInfo.title}
              </h1>
              
              <p className="text-slate-300 dark:text-slate-400 text-lg leading-relaxed">
                {mangaInfo.synopsis}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {mangaInfo.genres && mangaInfo.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-slate-700 dark:bg-slate-800 text-slate-200 dark:text-slate-300 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Eye className="h-5 w-5 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white">{formatNumber(mangaStats.totalViews)}</div>
                <div className="text-slate-400 text-sm">Total Views</div>
              </div>
              
              <div className="bg-slate-800/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="h-5 w-5 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white">{mangaStats.totalChapters}</div>
                <div className="text-slate-400 text-sm">Chapters</div>
              </div>
              
              <div className="bg-slate-800/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-5 w-5 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">{formatNumber(mangaStats.followers)}</div>
                <div className="text-slate-400 text-sm">Followers</div>
              </div>
              
              <div className="bg-slate-800/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-white">{formatNumber(mangaStats.monthlyViews)}</div>
                <div className="text-slate-400 text-sm">Monthly</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onReadNow}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 group"
              >
                <BookOpen className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Start Reading</span>
              </button>
              
              <button className="bg-slate-700 hover:bg-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Add to Favorites</span>
              </button>
            </div>

            {/* Author Info */}
            <div className="flex items-center space-x-4 text-slate-400 dark:text-slate-500">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>By {mangaInfo.author || 'Unknown'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>•</span>
                <span>Updated {mangaInfo.lastUpdated ? new Date(mangaInfo.lastUpdated).toLocaleDateString() : 'Unknown'}</span>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src={defaultHeroImage}
                alt={mangaInfo.title || ''}
                className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent rounded-2xl blur-xl transform scale-110" />
          </div>
        </div>
      </div>
    </div>
  );
};