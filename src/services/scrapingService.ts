import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedChapter, ApiSettings, SearchResult } from '../types/admin';

interface ApiResponse {
  ch: string;
  page: string; // JSON string containing array of image URLs
}

export class ScrapingService {
  private getApiSettings(): ApiSettings {
    const stored = localStorage.getItem('apiSettings');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Default settings
    return {
      url: 'https://automation.cap.gakuenbabysitters.online/webhook-test/f1ed4c34-8867-48ef-a736-bf3de69a1237',
      username: 'admin',
      password: 'admin',
      paramName: 'anime'
    };
  }

  async fetchChaptersFromApi(mangaName: string, isSearch: boolean = true): Promise<ApiResponse[]> {
    const settings = this.getApiSettings();
    
    try {
      const url = new URL(settings.url);
      const body = {
        [settings.paramName]: mangaName,
        search: isSearch,
      };

      const config = {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${settings.username}:${settings.password}`)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        mode: 'cors' as RequestMode,
      };

      const response = await fetch(url.toString(), config);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (e: unknown) {
      console.error('API request failed:', e);
      
      // Provide more specific error messages
      if (e instanceof TypeError && e.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to API. This might be due to CORS restrictions or the server being unavailable.');
      } else if (e instanceof Error) {
        throw new Error(`API request failed: ${e.message}`);
      } else {
        throw new Error('Unknown error occurred while fetching from API');
      }
    }
  }

  // Alternative method using a proxy approach
  async fetchChaptersFromApiWithProxy(mangaName: string, isSearch: boolean = true): Promise<ApiResponse[]> {
    const settings = this.getApiSettings();
    
    try {
      // Use a CORS proxy service for testing
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const targetUrl = new URL(settings.url);
      const requestData = {
        [settings.paramName]: mangaName,
        search: isSearch,
      };
      
      const response = await axios.post(`${proxyUrl}${targetUrl.toString()}`, requestData, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Authorization': `Basic ${btoa(`${settings.username}:${settings.password}`)}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      return response.data;
    } catch (e: unknown) {
      console.error('API request failed:', e);
      
      if (axios.isAxiosError(e)) {
        if (e.code === 'ERR_NETWORK') {
          throw new Error('Network error: Unable to connect to API. This might be due to CORS restrictions.');
        } else if (e.response) {
          throw new Error(`HTTP ${e.response.status}: ${e.response.statusText}`);
        } else {
          throw new Error(`Request failed: ${e.message}`);
        }
      } else {
        throw new Error(`Failed to fetch chapters from API: ${e}`);
      }
    }
  }

  private parseApiResponse(apiData: ApiResponse[]): ScrapedChapter[] {
    const chaptersMap = new Map<string, string[]>();

    // Group pages by chapter
    apiData.forEach(item => {
      const chapterName = item.ch;
      const pageUrls = JSON.parse(item.page);
      
      if (!chaptersMap.has(chapterName)) {
        chaptersMap.set(chapterName, []);
      }
      
      chaptersMap.get(chapterName)!.push(...pageUrls);
    });

    // Convert to ScrapedChapter format
    const chapters: ScrapedChapter[] = [];
    chaptersMap.forEach((pages, chapterName) => {
      const chapterNumber = this.extractChapterNumber(chapterName) || chapters.length + 1;
      
      chapters.push({
        title: chapterName,
        url: '', // Not needed for API-based scraping
        chapterNumber,
        pages: pages.sort() // Sort pages to ensure correct order
      });
    });

    return chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
  }

  async scrapeChaptersFromApi(mangaName: string, selectedChapters?: string[]): Promise<ScrapedChapter[]> {
    let apiData: ApiResponse[];
    
    try {
      apiData = await this.fetchChaptersFromApi(mangaName, false); // search=false for scraping
    } catch (e: unknown) {
      // If direct method fails for any reason, try proxy method
      console.log('Direct API call failed, trying proxy method...');
      apiData = await this.fetchChaptersFromApiWithProxy(mangaName, false); // search=false for scraping
    }
    
    const allChapters = this.parseApiResponse(apiData);

    if (selectedChapters && selectedChapters.length > 0) {
      return allChapters.filter(chapter => 
        selectedChapters.includes(chapter.title) || 
        selectedChapters.includes(`Chapter ${chapter.chapterNumber}`)
      );
    }

    return allChapters;
  }

  async testApiConnection(mangaName: string): Promise<{
    success: boolean;
    chaptersFound: number;
    sampleChapters: string[];
    error?: string;
    apiUrl?: string;
    corsIssue?: boolean;
  }> {
    const settings = this.getApiSettings();
    
    try {
      let apiData: ApiResponse[];
      let usedProxy = false;
      
      try {
        apiData = await this.fetchChaptersFromApi(mangaName, true); // search=true for testing
      } catch (e: unknown) {
        // If direct method fails for any reason, try proxy method
        console.log('Direct API call failed, trying proxy method...');
        usedProxy = true;
        apiData = await this.fetchChaptersFromApiWithProxy(mangaName, true); // search=true for testing
      }
      
      const chapters = this.parseApiResponse(apiData);
      
      return {
        success: true,
        chaptersFound: chapters.length,
        sampleChapters: chapters.slice(0, 5).map(ch => ch.title),
        apiUrl: settings.url,
        corsIssue: usedProxy
      };
    } catch (e: unknown) {
      // If both methods fail, it's likely a CORS or connectivity issue
      const corsIssue = true;
      
      return {
        success: false,
        chaptersFound: 0,
        sampleChapters: [],
        error: e instanceof Error ? e.message : 'Unknown error',
        apiUrl: settings.url,
        corsIssue
      };
    }
  }

  saveApiSettings(settings: ApiSettings): void {
    localStorage.setItem('apiSettings', JSON.stringify(settings));
  }

  getStoredApiSettings(): ApiSettings {
    return this.getApiSettings();
  }

  private extractChapterNumber(title: string): number | null {
    const match = title.match(/chapter\s*(\d+)/i) || title.match(/ch\s*(\d+)/i) || title.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  async searchManga(mangaName: string): Promise<SearchResult[]> {
    try {
      const apiData = await this.fetchChaptersFromApi(mangaName, true); // search=true for searching
      
      // If we get a successful response, try to parse it as HTML
      if (typeof apiData === 'string') {
        const $ = cheerio.load(apiData);
        const results: SearchResult[] = [];

        $('.manga_search_item').each((index, element) => {
          const title = $(element).find('h3 a').text();
          const href = $(element).find('h3 a').attr('href');
          const chapters = $(element).find('div:contains("Chapters Published")').text();
          const status = $(element).find('div:contains("Chapters Published")').text().includes('Ongoing') ? 'Ongoing' : 'Completed';
          const type = $(element).find('strong').text();
          const genres = $(element).find('div:contains("Action"), div:contains("Adventure"), div:contains("Comedy"), div:contains("Drama"), div:contains("Fantasy")').text().split(', ').filter(Boolean).map(genre => genre.trim());
          const image = $(element).find('img').attr('src') || 'https://via.placeholder.com/64x80?text=No+Image'; // Placeholder if no image

          if (title && href) {
            results.push({
              name: title.toLowerCase().replace(/[^a-z0-9]/g, '_'),
              title,
              href,
              image,
              chapters,
              status,
              type,
              genres
            });
          }
        });
        return results;
      } else if (Array.isArray(apiData)) {
        // If it's an array of ApiResponse, convert to SearchResult
        return apiData.map(item => ({
          name: item.ch.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          title: item.ch,
          href: '', // API response doesn't provide href directly
          image: item.page ? JSON.parse(item.page)[0] : 'https://via.placeholder.com/64x80?text=No+Image',
          chapters: '', // API response doesn't provide chapters directly
          status: '', // API response doesn't provide status directly
          type: '', // API response doesn't provide type directly
          genres: [] // API response doesn't provide genres directly
        }));
      }
      
      return [];
    } catch (e: unknown) {
      console.error('Search failed:', e);
      return [];
    }
  }

  // Legacy methods for backward compatibility
  async scrapeChapterList(): Promise<Array<{ title: string; url: string; chapterNumber: number }>> {
    throw new Error('Legacy scraping method deprecated. Use API-based scraping instead.');
  }

  async scrapeFullChapter(): Promise<string[]> {
    throw new Error('Legacy scraping method deprecated. Use API-based scraping instead.');
  }

  async validateConfig(): Promise<{
    isValid: boolean;
    errors: string[];
    samples: {
      chapterLinks: string[];
      chapterTitles: string[];
      samplePages: string[];
    };
  }> {
    return {
      isValid: false,
      errors: ['Legacy scraping configuration deprecated. Use API-based scraping instead.'],
      samples: {
        chapterLinks: [],
        chapterTitles: [],
        samplePages: []
      }
    };
  }
}