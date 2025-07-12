import React, { useState } from 'react';

export const Settings: React.FC = () => {
  const [siteTitle, setSiteTitle] = useState('Akira Chronicles');
  const [siteDescription, setSiteDescription] = useState('Read Akira Chronicles manga online with the best reading experience. Follow the epic story of Kaneda and Tetsuo in Neo-Tokyo.');
  const [siteLogo, setSiteLogo] = useState('');

  const handleSave = () => {
    // Save settings to local storage or an API endpoint
    localStorage.setItem('siteTitle', siteTitle);
    localStorage.setItem('siteDescription', siteDescription);
    localStorage.setItem('siteLogo', siteLogo);
    alert('Settings saved successfully!');
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
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="siteDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Site Description</label>
          <textarea
            id="siteDescription"
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            rows={4}
            className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="siteLogo" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Site Logo URL</label>
          <input
            type="text"
            id="siteLogo"
            value={siteLogo}
            onChange={(e) => setSiteLogo(e.target.value)}
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