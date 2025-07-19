import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchSettings = async () => {
      const response = await axios.get('/api/settings');
      setSettings(response.data);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    const settingsArray = Object.entries(settings).map(([key, value]) => ({ key, value }));
    await axios.post('/api/settings', { settings: settingsArray });
    alert('Settings saved successfully!');
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Website Settings</h2>
      <div className="space-y-6">
        <div>
          <label htmlFor="siteTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Site Title</label>
          <input
            type="text"
            id="siteTitle"
            value={settings.siteTitle || ''}
            onChange={(e) => handleChange('siteTitle', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="siteDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Site Description</label>
          <textarea
            id="siteDescription"
            value={settings.siteDescription || ''}
            onChange={(e) => handleChange('siteDescription', e.target.value)}
            rows={4}
            className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="siteLogo" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Site Logo URL</label>
          <input
            type="text"
            id="siteLogo"
            value={settings.siteLogo || ''}
            onChange={(e) => handleChange('siteLogo', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="defaultBannerImage" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Default Banner Image URL</label>
          <input
            type="text"
            id="defaultBannerImage"
            value={settings.defaultBannerImage || ''}
            onChange={(e) => handleChange('defaultBannerImage', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="defaultHeroImage" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Default Hero Image URL</label>
          <input
            type="text"
            id="defaultHeroImage"
            value={settings.defaultHeroImage || ''}
            onChange={(e) => handleChange('defaultHeroImage', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="defaultChapterImage" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Default Chapter Image URL</label>
          <input
            type="text"
            id="defaultChapterImage"
            value={settings.defaultChapterImage || ''}
            onChange={(e) => handleChange('defaultChapterImage', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <button
            onClick={handleSave}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};