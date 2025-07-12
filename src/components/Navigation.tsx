import React, { useState, useEffect } from 'react';
import { Menu, X, Home, Users, BookOpen, Heart, Search, Sun, Moon, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [siteLogo, setSiteLogo] = useState('');

  useEffect(() => {
    const logo = localStorage.getItem('siteLogo');
    if (logo) {
      setSiteLogo(logo);
    }
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chapters', label: 'Chapters', icon: BookOpen },
    { id: 'characters', label: 'Characters', icon: Users },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'admin', label: 'Admin', icon: Settings },
  ];

  return (
    <>
      <nav className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-800 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate('home')}
                className="flex items-center space-x-2 text-white hover:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                {siteLogo ? (
                  <img src={siteLogo} alt="Site Logo" className="h-8 w-8" />
                ) : (
                  <BookOpen className="h-8 w-8" />
                )}
                <span className="text-xl font-bold">Akira Chronicles</span>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      currentPage === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              
              <div className="flex items-center space-x-2 bg-slate-800 dark:bg-slate-700 rounded-lg px-3 py-2">
                <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search chapters..."
                  className="bg-transparent text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none w-40"
                />
              </div>
              
              <button
                onClick={toggleTheme}
                className="text-slate-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-700"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-300 hover:text-white transition-colors p-2"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900/98 dark:bg-slate-950/98 backdrop-blur-sm border-t border-slate-800 dark:border-slate-700">
            <div className="px-4 py-2 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center space-x-3 w-full px-3 py-3 rounded-lg transition-colors ${
                      currentPage === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              
              <div className="flex items-center space-x-3 bg-slate-800 dark:bg-slate-700 rounded-lg px-3 py-3 mt-2">
                <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search chapters..."
                  className="bg-transparent text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none flex-1"
                />
              </div>
              
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-3 w-full px-3 py-3 rounded-lg transition-colors text-slate-300 hover:text-white hover:bg-slate-800 dark:hover:bg-slate-700"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <span>Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};