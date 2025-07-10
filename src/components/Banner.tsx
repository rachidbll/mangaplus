import React from 'react';
import { Play, BookOpen, Star, Clock } from 'lucide-react';

interface BannerProps {
  title: string;
  description: string;
  backgroundImage: string;
  onReadNow: () => void;
}

export const Banner: React.FC<BannerProps> = ({ title, description, backgroundImage, onReadNow }) => {
  return (
    <div className="relative h-96 overflow-hidden dark:border-b dark:border-slate-800">
      <div className="absolute inset-0">
        <img
          src={backgroundImage}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="max-w-2xl space-y-6">
          <div className="flex items-center space-x-4">
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              Featured
            </span>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-yellow-400 font-medium">4.8</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            {title}
          </h1>
          
          <p className="text-lg text-slate-200 leading-relaxed">
            {description}
          </p>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onReadNow}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 group"
            >
              <BookOpen className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>Read Now</span>
            </button>
            
            <button className="bg-white/10 backdrop-blur-sm hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2">
              <Play className="h-5 w-5" />
              <span>Preview</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-slate-300 dark:text-slate-400">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Updated weekly</span>
            </div>
            <span>•</span>
            <span>120 Chapters</span>
            <span>•</span>
            <span>2.5M Views</span>
          </div>
        </div>
      </div>
    </div>
  );
};