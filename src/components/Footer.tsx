import React from 'react';
import { BookOpen, Mail, Twitter, Facebook, Instagram, Shield, FileText, Users } from 'lucide-react';
import { Chapter, MangaInfo } from '../types/manga';

interface FooterProps {
  mangaInfo: MangaInfo;
  latestChapters: Chapter[];
  onChapterClick: (chapterId: number) => void;
}

export const Footer: React.FC<FooterProps> = ({ mangaInfo, latestChapters, onChapterClick }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-white border-t border-slate-800 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-blue-400 dark:text-blue-300" />
              <h3 className="text-xl font-bold">Akira Chronicles</h3>
            </div>
            <p className="text-slate-300 dark:text-slate-400 text-sm leading-relaxed">
              The ultimate destination for reading Akira Chronicles manga online. Experience the epic story of Neo-Tokyo with the best reading interface and regular updates.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 dark:text-slate-500 hover:text-blue-400 dark:hover:text-blue-300 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 dark:text-slate-500 hover:text-blue-400 dark:hover:text-blue-300 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Synopsis */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white dark:text-slate-100">Synopsis</h3>
            <p className="text-slate-300 dark:text-slate-400 text-sm leading-relaxed">
              {mangaInfo.synopsis.slice(0, 200)}...
            </p>
            <div className="space-y-2">
              <div className="text-sm text-slate-400 dark:text-slate-500">
                <span className="font-medium">Author:</span> {mangaInfo.author}
              </div>
              <div className="text-sm text-slate-400">
                <span className="font-medium">Status:</span> {mangaInfo.status}
              </div>
              <div className="text-sm text-slate-400 dark:text-slate-500">
                <span className="font-medium">Genres:</span> {mangaInfo.genres.join(', ')}
              </div>
            </div>
          </div>

          {/* Latest Chapters */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white dark:text-slate-100">Latest Chapters</h3>
            <div className="space-y-3">
              {latestChapters.slice(0, 5).map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => onChapterClick(chapter.id)}
                  className="block w-full text-left p-3 bg-slate-800 dark:bg-slate-900 hover:bg-slate-700 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-white dark:text-slate-100">
                        Chapter {chapter.chapterNumber}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(chapter.releaseDate).toLocaleDateString()}
                      </div>
                    </div>
                    {chapter.isNew && (
                      <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white dark:text-slate-100">Legal</h3>
            <div className="space-y-2">
              <a href="#" className="flex items-center space-x-2 text-slate-300 dark:text-slate-400 hover:text-white dark:hover:text-slate-200 transition-colors">
                <Shield className="h-4 w-4" />
                <span className="text-sm">DMCA Policy</span>
              </a>
              <a href="#" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                <FileText className="h-4 w-4" />
                <span className="text-sm">Privacy Policy</span>
              </a>
              <a href="#" className="flex items-center space-x-2 text-slate-300 dark:text-slate-400 hover:text-white dark:hover:text-slate-200 transition-colors">
                <FileText className="h-4 w-4" />
                <span className="text-sm">Terms of Service</span>
              </a>
              <a href="#" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                <Users className="h-4 w-4" />
                <span className="text-sm">About Us</span>
              </a>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-700 dark:border-slate-600">
              <div className="text-xs text-slate-400 dark:text-slate-500">
                <p>This site is for entertainment purposes only.</p>
                <p className="mt-1">All manga content is property of their respective creators.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-700 dark:border-slate-600">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-slate-400 dark:text-slate-500">
              © {currentYear} Akira Chronicles. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-400">
              <span>Total Views: {mangaInfo.totalViews.toLocaleString()}</span>
              <span>•</span>
              <span>Total Chapters: {mangaInfo.totalChapters}</span>
              <span>•</span>
              <span>Rating: {mangaInfo.rating}/5</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};