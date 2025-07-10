export interface AniListManga {
  id: number;
  title: {
    romaji: string;
    english: string;
    native: string;
  };
  description: string;
  coverImage: {
    large: string;
    medium: string;
  };
  bannerImage: string;
  genres: string[];
  status: 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';
  chapters: number;
  volumes: number;
  averageScore: number;
  popularity: number;
  staff: {
    nodes: Array<{
      name: {
        full: string;
      };
      primaryOccupations: string[];
    }>;
  };
  startDate: {
    year: number;
    month: number;
    day: number;
  };
}

export interface ScrapingConfig {
  baseUrl: string;
  chapterListSelector: string;
  chapterLinkSelector: string;
  chapterTitleSelector: string;
  pageImageSelector: string;
  nextPageSelector?: string;
}

export interface ScrapedChapter {
  title: string;
  url: string;
  chapterNumber: number;
  pages: string[];
}

export interface AdminManga {
  id: string;
  anilistId?: number;
  title: string;
  description: string;
  coverImage: string;
  bannerImage: string;
  genres: string[];
  status: string;
  author: string;
  artist: string;
  totalChapters: number;
  rating: number;
  apiMangaName: string; // Name used for API requests
  scrapingConfig?: ScrapingConfig; // Keep for backward compatibility
  chapters: ScrapedChapter[];
  scrapingProgress: {
    totalChapters: number;
    scrapedChapters: number;
    failedChapters: string[];
    lastScrapedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiSettings {
  url: string;
  username: string;
  password: string;
  paramName: string; // The parameter name to send (e.g., 'anime')
}

export interface SearchResult {
  name: string;
  title: string;
  href: string;
  image: string;
  chapters: string;
  status: string;
  type: string;
  genres: string[];
}

export interface SearchResponse {
  status: 'found' | 'no found';
  results?: SearchResult[];
  html?: string;
}