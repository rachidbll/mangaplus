import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Save, TestTube, Globe, Key, Link, Tag, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ScrapingService } from '../../services/scrapingService';
import { ApiSettings as ApiSettingsType } from '../../types/admin';

export const ApiSettings: React.FC = () => {
  const [settings, setSettings] = useState<ApiSettingsType>({
    url: '',
    username: '',
    password: '',
    paramName: 'anime'
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; chaptersFound: number; sampleChapters: string[]; error?: string; apiUrl?: string; corsIssue?: boolean; } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const scrapingService = useMemo(() => new ScrapingService(), []);

  const loadSettings = useCallback(() => {
    const stored = scrapingService.getStoredApiSettings();
    setSettings(stored);
  }, [scrapingService]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSettingChange = (field: keyof ApiSettingsType, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      scrapingService.saveApiSettings(settings);
      alert('API settings saved successfully!');
    } catch {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const testApiConnection = async () => {
    if (!settings.url || !settings.username || !settings.password) {
      alert('Please fill in all required fields before testing');
      return;
    }

    setTesting(true);
    setTestResult(null);

    // Save settings temporarily for testing
    scrapingService.saveApiSettings(settings);

    try {
      const result = await scrapingService.testApiConnection('test manga');
      setTestResult(result);
    } catch (e) {
      setTestResult({
        success: false,
        chaptersFound: 0,
        sampleChapters: [],
        error: `Test failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
        apiUrl: settings.url
      });
    } finally {
      setTesting(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      url: 'https://automation.cap.gakuenbabysitters.online/webhook-test/f1ed4c34-8867-48ef-a736-bf3de69a1237',
      username: 'admin',
      password: 'admin',
      paramName: 'anime'
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">API Settings</h2>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">API Configuration</h3>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                Configure the API endpoint and authentication details for manga chapter scraping.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Link className="inline h-4 w-4 mr-2" />
                API URL
              </label>
              <input
                type="url"
                value={settings.url}
                onChange={(e) => handleSettingChange('url', e.target.value)}
                placeholder="https://api.example.com/webhook"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                The complete URL of the API endpoint
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <Key className="inline h-4 w-4 mr-2" />
                  Username
                </label>
                <input
                  type="text"
                  value={settings.username}
                  onChange={(e) => handleSettingChange('username', e.target.value)}
                  placeholder="admin"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <Key className="inline h-4 w-4 mr-2" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={settings.password}
                    onChange={(e) => handleSettingChange('password', e.target.value)}
                    placeholder="password"
                    className="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Tag className="inline h-4 w-4 mr-2" />
                Parameter Name
              </label>
              <input
                type="text"
                value={settings.paramName}
                onChange={(e) => handleSettingChange('paramName', e.target.value)}
                placeholder="anime"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                The parameter name to send the manga name (e.g., 'anime', 'manga', 'title')
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>

              <button
                onClick={testApiConnection}
                disabled={testing}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors"
              >
                {testing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <TestTube className="h-4 w-4" />
                )}
                <span>{testing ? 'Testing...' : 'Test Connection'}</span>
              </button>

              <button
                onClick={resetToDefaults}
                className="flex items-center space-x-2 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
              >
                <span>Reset to Defaults</span>
              </button>
            </div>
          </div>

          {/* API Information & Test Results */}
          <div className="space-y-6">
            {/* API Request Example */}
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">API Request Example</h3>
              <div className="bg-slate-900 dark:bg-slate-800 rounded p-3 text-sm font-mono text-green-400 overflow-x-auto">
                <div className="text-slate-400">POST {settings.url || '[API_URL]'}</div>
                <div className="text-slate-400">Authorization: Basic {btoa(`${settings.username}:${settings.password}`)}</div>
                <div className="text-slate-400">Content-Type: application/json</div>
                <div className="text-slate-400">Body:</div>
                <pre className="text-green-400">{`{
  "${settings.paramName}": "manga_name",
  "search": true
}`}</pre>
              </div>
            </div>

            {/* Expected Response Format */}
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Expected Response Format</h3>
              <div className="bg-slate-900 dark:bg-slate-800 rounded p-3 text-sm font-mono text-blue-400 overflow-x-auto">
                <pre>{`[
  {
    "ch": "Chapter 1",
    "page": "["image_url_1"]"
  },
  {
    "ch": "Chapter 1", 
    "page": "["image_url_2"]"
  }
]`}</pre>
              </div>
            </div>

            {/* Test Results */}
            {testResult && (
              <div className={`rounded-lg p-4 ${
                testResult.success 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center space-x-2 mb-3">
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <h3 className={`font-semibold ${
                    testResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                  }`}>
                    {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                  </h3>
                </div>
                
                {testResult.corsIssue && (
                  <div className="mb-3 p-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="text-amber-700 dark:text-amber-300 text-sm">
                        <strong>CORS Issue Detected:</strong> The API call was successful but required a proxy due to CORS restrictions. 
                        This is normal for browser-based applications calling external APIs.
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className={testResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    <strong>API URL:</strong> {testResult.apiUrl}
                  </div>
                  
                  {testResult.success ? (
                    <>
                      <div className="text-green-600 dark:text-green-400">
                        <strong>Chapters Found:</strong> {testResult.chaptersFound}
                      </div>
                      {testResult.sampleChapters.length > 0 && (
                        <div className="text-green-600 dark:text-green-400">
                          <strong>Sample Chapters:</strong> {testResult.sampleChapters.join(', ')}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-red-600 dark:text-red-400">
                      <strong>Error:</strong> {testResult.error}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CORS Information */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">CORS Information</h3>
                  <div className="text-blue-800 dark:text-blue-200 text-sm space-y-2">
                    <p>
                      If you encounter CORS errors, this is normal for browser-based applications calling external APIs.
                    </p>
                    <p>
                      <strong>Solutions:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>The system will automatically try a proxy method if direct calls fail</li>
                      <li>For production, consider setting up your own backend proxy</li>
                      <li>Some APIs may need to be configured to allow your domain</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            {/* Usage Instructions */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Usage Instructions</h3>
                  <ol className="list-decimal list-inside text-amber-800 dark:text-amber-200 text-sm space-y-1">
                    <li>Configure the API URL and authentication details</li>
                    <li>Test the connection to verify settings</li>
                    <li>Save the settings once confirmed working</li>
                    <li>Go to Manage Manga to scrape chapters using these settings</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};