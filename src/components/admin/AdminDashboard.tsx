import React, { useState } from 'react';
import { Settings, Database, Search, BookOpen, Globe } from 'lucide-react';
import { MangaSearch } from './MangaSearch';
import { ApiSettings } from './ApiSettings';
import { MangaManager } from './MangaManager';
import { Settings as SettingsComponent } from './Settings';

type AdminTab = 'search' | 'api-settings' | 'manage' | 'settings';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('search');
  const [showSettingsNotification, setShowSettingsNotification] = useState(false);

  useEffect(() => {
    const siteTitle = localStorage.getItem('siteTitle');
    if (!siteTitle || siteTitle === 'Akira Chronicles') {
      setShowSettingsNotification(true);
    }
  }, []);

  const tabs = [
    { id: 'search' as AdminTab, label: 'Search Manga', icon: Search },
    { id: 'api-settings' as AdminTab, label: 'API Settings', icon: Globe },
    { id: 'manage' as AdminTab, label: 'Manage Manga', icon: Database },
    { id: 'settings' as AdminTab, label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'search':
        return <MangaSearch />;
      case 'api-settings':
        return <ApiSettings />;
      case 'manage':
        return <MangaManager />;
      case 'settings':
        return <SettingsComponent />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Manga Management System
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showSettingsNotification && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <Settings className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Welcome to the admin dashboard. Please update the site information in the settings tab.
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Quick Stats */}
            <div className="mt-6 bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Total Manga</span>
                  <span className="font-semibold text-slate-900 dark:text-white">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Total Chapters</span>
                  <span className="font-semibold text-slate-900 dark:text-white">120</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Active Scrapers</span>
                  <span className="font-semibold text-slate-900 dark:text-white">0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};