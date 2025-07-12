export interface Chapter {
  id: number;
  title: string;
  chapterNumber: number;
  releaseDate: string;
  pages: string[];
  views: number;
  isNew?: boolean;
}

export interface Character {
  id: number;
  name: string;
  image: string;
  description: string;
}

export interface MangaInfo {
  title: string;
  author: string;
  artist: string;
  status: 'ongoing' | 'completed' | 'hiatus';
  genres: string[];
  synopsis: string;
  coverImage: string;
  bannerImage: string;
  totalChapters: number;
  totalViews: number;
  rating: number;
  lastUpdated: string;
  characters?: Character[];
}

export interface MangaStats {
  totalViews: number;
  totalChapters: number;
  rating: number;
  followers: number;
  monthlyViews: number;
}