import { Chapter, MangaInfo, MangaStats } from '../types/manga';

export const mangaInfo: MangaInfo = {
  title: "Akira Chronicles",
  author: "Katsuhiro Otomo",
  artist: "Katsuhiro Otomo",
  status: "completed",
  genres: ["Action", "Sci-Fi", "Thriller", "Drama"],
  synopsis: "Set in a dystopian 2019, Akira tells the story of Shōtarō Kaneda, a leader of a biker gang whose childhood friend Tetsuo Shima acquires incredible telekinetic powers after a motorcycle accident. The story takes place in the post-apocalyptic settlement of Neo-Tokyo.",
  coverImage: "https://images.pexels.com/photos/6208086/pexels-photo-6208086.jpeg?auto=compress&cs=tinysrgb&w=800",
  bannerImage: "https://images.pexels.com/photos/6208086/pexels-photo-6208086.jpeg?auto=compress&cs=tinysrgb&w=1200",
  totalChapters: 120,
  totalViews: 2500000,
  rating: 4.8,
  lastUpdated: "2024-01-15"
};

export const mangaStats: MangaStats = {
  totalViews: 2500000,
  totalChapters: 120,
  rating: 4.8,
  followers: 45000,
  monthlyViews: 125000
};

export const chapters: Chapter[] = Array.from({ length: 120 }, (_, i) => ({
  id: i + 1,
  title: `The ${i === 0 ? 'Beginning' : i === 119 ? 'Final Battle' : `Chapter ${i + 1}`}`,
  chapterNumber: i + 1,
  releaseDate: new Date(2023, 0, 1 + i).toISOString().split('T')[0],
  pages: Array.from({ length: 20 }, (_, j) => 
    `https://images.pexels.com/photos/${6208086 + (i * 20) + j}/pexels-photo-${6208086 + (i * 20) + j}.jpeg?auto=compress&cs=tinysrgb&w=800`
  ),
  views: Math.floor(Math.random() * 50000) + 10000,
  isNew: i >= 117
}));