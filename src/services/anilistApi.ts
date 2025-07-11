import axios from 'axios';
import { AniListManga } from '../types/admin';

const ANILIST_API_URL = 'https://graphql.anilist.co';

const MANGA_QUERY = `
  query ($search: String, $id: Int) {
    Media(search: $search, id: $id, type: MANGA) {
      id
      title {
        romaji
        english
        native
      }
      description
      coverImage {
        large
        medium
      }
      bannerImage
      genres
      status
      chapters
      volumes
      averageScore
      popularity
      staff(perPage: 10) {
        nodes {
          name {
            full
          }
          primaryOccupations
        }
      }
      startDate {
        year
        month
        day
      }
    }
  }
`;

const SEARCH_MANGA_QUERY = `
  query ($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
      }
      media(search: $search, type: MANGA, sort: POPULARITY_DESC) {
        id
        title {
          romaji
          english
          native
        }
        description
        coverImage {
          large
          medium
        }
        bannerImage
        genres
        status
        chapters
        volumes
        averageScore
        popularity
        staff(perPage: 5) {
          nodes {
            name {
              full
            }
            primaryOccupations
          }
        }
        startDate {
          year
          month
          day
        }
      }
    }
  }
`;

export class AniListService {
  private async makeRequest(query: string, variables: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      const response = await axios.post(ANILIST_API_URL, {
        query,
        variables
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data;
    } catch (error) {
      console.error('AniList API Error:', error);
      throw error;
    }
  }

  async searchManga(searchTerm: string, page: number = 1, perPage: number = 20): Promise<{
    manga: AniListManga[];
    pageInfo: {
      total: number;
      currentPage: number;
      lastPage: number;
      hasNextPage: boolean;
    };
  }> {
    const data = await this.makeRequest(SEARCH_MANGA_QUERY, {
      search: searchTerm,
      page,
      perPage
    });

    return {
      manga: data.Page.media,
      pageInfo: data.Page.pageInfo
    };
  }

  async getMangaById(id: number): Promise<AniListManga> {
    const data = await this.makeRequest(MANGA_QUERY, { id });
    return data.Media;
  }

  async getMangaBySearch(searchTerm: string): Promise<AniListManga> {
    const data = await this.makeRequest(MANGA_QUERY, { search: searchTerm });
    return data.Media;
  }

  formatMangaForApp(anilistManga: AniListManga) {
    const author = anilistManga.staff?.nodes?.find(
      staff => staff.primaryOccupations?.includes('Story & Art') || 
               staff.primaryOccupations?.includes('Story')
    )?.name?.full || 'Unknown';

    const artist = anilistManga.staff?.nodes?.find(
      staff => staff.primaryOccupations?.includes('Art') || 
               staff.primaryOccupations?.includes('Story & Art')
    )?.name?.full || author;

    return {
      title: anilistManga.title.english || anilistManga.title.romaji,
      author,
      artist,
      status: anilistManga.status.toLowerCase().replace('_', ' '),
      genres: anilistManga.genres || [],
      synopsis: anilistManga.description?.replace(/<[^>]*>/g, '') || '',
      coverImage: anilistManga.coverImage?.large || '',
      bannerImage: anilistManga.bannerImage || anilistManga.coverImage?.large || '',
      totalChapters: anilistManga.chapters || 0,
      rating: anilistManga.averageScore ? anilistManga.averageScore / 10 : 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  }
}