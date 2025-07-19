# API Integration Guide

## Frontend-Backend Integration

### Authentication Flow

```typescript
// Frontend: Login request
const loginUser = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store JWT token
    localStorage.setItem('auth_token', data.data.token);
    // Update user context
    setUser(data.data.user);
  }
  
  return data;
};

// Backend: Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Access token required' }
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Invalid token' }
      });
    }
    req.user = user;
    next();
  });
};
```

### Data Fetching Patterns

```typescript
// Frontend: Custom hook for manga data
const useManga = (mangaId: string) => {
  const [manga, setManga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchManga = async () => {
      try {
        const response = await fetch(`/api/manga/${mangaId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });
        
        const data = await response.json();
        
        if (data.success) {
          setManga(data.data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError({ code: 'NETWORK_ERROR', message: 'Failed to fetch manga' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchManga();
  }, [mangaId]);
  
  return { manga, loading, error };
};

// Frontend: Pagination hook
const usePaginatedManga = (page: number, filters: any) => {
  const [data, setData] = useState({ manga: [], pagination: null });
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchManga = async () => {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...filters,
      });
      
      const response = await fetch(`/api/manga?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
      setLoading(false);
    };
    
    fetchManga();
  }, [page, filters]);
  
  return { ...data, loading };
};
```

### Real-time Updates

```typescript
// Frontend: WebSocket connection for scraping progress
const useScrapingProgress = (jobId: string) => {
  const [progress, setProgress] = useState(null);
  
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080/api/scraping-jobs/${jobId}/progress`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setProgress(data);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    return () => ws.close();
  }, [jobId]);
  
  return progress;
};

// Backend: WebSocket handler
const handleScrapingProgress = (ws, jobId) => {
  const interval = setInterval(async () => {
    const job = await ScrapingJob.findById(jobId);
    
    if (job) {
      ws.send(JSON.stringify({
        id: job.id,
        status: job.status,
        progress: {
          total_chapters: job.total_chapters,
          scraped_chapters: job.scraped_chapters,
          percentage: job.progress_percentage,
        },
      }));
      
      if (job.status === 'completed' || job.status === 'failed') {
        clearInterval(interval);
        ws.close();
      }
    }
  }, 1000);
};
```

### Error Handling

```typescript
// Frontend: Global error handler
const ApiError = {
  handle: (error: any) => {
    switch (error.code) {
      case 'UNAUTHORIZED':
        // Redirect to login
        window.location.href = '/login';
        break;
      case 'VALIDATION_ERROR':
        // Show form validation errors
        showValidationErrors(error.details);
        break;
      case 'RATE_LIMITED':
        // Show rate limit message
        showToast('Too many requests. Please try again later.', 'warning');
        break;
      default:
        // Show generic error
        showToast('An unexpected error occurred.', 'error');
    }
  },
};

// Frontend: API client with error handling
class ApiClient {
  private baseURL = '/api';
  
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('auth_token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };
    
    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!data.success) {
        ApiError.handle(data.error);
        throw new Error(data.error.message);
      }
      
      return data.data;
    } catch (error) {
      if (error instanceof TypeError) {
        // Network error
        showToast('Network error. Please check your connection.', 'error');
      }
      throw error;
    }
  }
  
  async get(endpoint: string) {
    return this.request(endpoint);
  }
  
  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
```

### State Management Integration

```typescript
// Frontend: Redux/Zustand store for manga data
interface MangaStore {
  manga: Manga[];
  currentManga: Manga | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchManga: (filters?: any) => Promise<void>;
  fetchMangaById: (id: string) => Promise<void>;
  addToFavorites: (mangaId: string) => Promise<void>;
  removeFromFavorites: (mangaId: string) => Promise<void>;
}

const useMangaStore = create<MangaStore>((set, get) => ({
  manga: [],
  currentManga: null,
  loading: false,
  error: null,
  
  fetchManga: async (filters = {}) => {
    set({ loading: true, error: null });
    
    try {
      const data = await apiClient.get(`/manga?${new URLSearchParams(filters)}`);
      set({ manga: data.manga, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  fetchMangaById: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      const manga = await apiClient.get(`/manga/${id}`);
      set({ currentManga: manga, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  addToFavorites: async (mangaId: string) => {
    try {
      await apiClient.post(`/users/favorites`, { manga_id: mangaId });
      // Update local state
      const { currentManga } = get();
      if (currentManga && currentManga.id === mangaId) {
        set({ currentManga: { ...currentManga, is_favorited: true } });
      }
    } catch (error) {
      set({ error: error.message });
    }
  },
}));
```

### Performance Optimization

```typescript
// Frontend: Infinite scrolling for manga list
const useInfiniteScroll = (fetchMore: () => void) => {
  const [isFetching, setIsFetching] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isFetching) return;
      setIsFetching(true);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFetching]);
  
  useEffect(() => {
    if (!isFetching) return;
    fetchMore();
    setIsFetching(false);
  }, [isFetching, fetchMore]);
  
  return [isFetching, setIsFetching];
};

// Frontend: Image lazy loading
const LazyImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [imageSrc, setImageSrc] = useState('');
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  
  useEffect(() => {
    let observer: IntersectionObserver;
    
    if (imageRef && imageSrc !== src) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.unobserve(imageRef);
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(imageRef);
    }
    
    return () => {
      if (observer && observer.unobserve) {
        observer.unobserve(imageRef);
      }
    };
  }, [imageRef, imageSrc, src]);
  
  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      className="transition-opacity duration-300"
      style={{ opacity: imageSrc ? 1 : 0 }}
    />
  );
};
```

## Backend Implementation Examples

### Express.js Route Handlers

```javascript
// Backend: Manga routes
const express = require('express');
const router = express.Router();

// GET /api/manga
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      genre,
      status,
      sort = 'updated_at',
      order = 'desc'
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT m.*, GROUP_CONCAT(g.name) as genres
      FROM manga m
      LEFT JOIN manga_genres mg ON m.id = mg.manga_id
      LEFT JOIN genres g ON mg.genre_id = g.id
      WHERE m.is_active = true
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (m.title LIKE ? OR m.author LIKE ? OR m.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (genre) {
      query += ` AND g.slug = ?`;
      params.push(genre);
    }
    
    if (status) {
      query += ` AND m.status = ?`;
      params.push(status);
    }
    
    query += ` GROUP BY m.id ORDER BY m.${sort} ${order} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const manga = await db.query(query, params);
    
    // Get total count for pagination
    const countQuery = `SELECT COUNT(DISTINCT m.id) as total FROM manga m WHERE m.is_active = true`;
    const [{ total }] = await db.query(countQuery);
    
    res.json({
      success: true,
      data: {
        manga: manga.map(m => ({
          ...m,
          genres: m.genres ? m.genres.split(',') : []
        })),
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          per_page: parseInt(limit),
          has_next: page * limit < total,
          has_prev: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch manga'
      }
    });
  }
});

// POST /api/admin/scraping-jobs
router.post('/admin/scraping-jobs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { manga_id, api_manga_name, selected_chapters, scrape_all } = req.body;
    
    // Validate input
    if (!manga_id || !api_manga_name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'manga_id and api_manga_name are required'
        }
      });
    }
    
    // Create scraping job
    const job = await ScrapingJob.create({
      manga_id,
      user_id: req.user.id,
      job_type: scrape_all ? 'full_scrape' : 'selective_scrape',
      api_manga_name,
      selected_chapters: selected_chapters || null,
      status: 'pending'
    });
    
    // Queue the job for processing
    await scrapingQueue.add('scrape-manga', {
      jobId: job.id,
      mangaId: manga_id,
      apiMangaName: api_manga_name,
      selectedChapters: selected_chapters,
      scrapeAll: scrape_all
    });
    
    res.json({
      success: true,
      message: 'Scraping job started',
      data: {
        job_id: job.id
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to start scraping job'
      }
    });
  }
});
```

This comprehensive schema provides a solid foundation for building a scalable manga reading platform with proper separation of concerns, data integrity, and performance optimization.