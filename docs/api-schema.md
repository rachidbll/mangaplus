# Backend-Frontend API Schema

## Authentication Endpoints

### POST /api/auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "user123",
      "role": "user|admin",
      "created_at": "2024-01-15T10:30:00Z"
    },
    "token": "jwt_token_here",
    "expires_in": 86400
  }
}
```

### POST /api/auth/register
**Request:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user_id": 123
  }
}
```

## Manga Management Endpoints

### GET /api/manga
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search term
- `genre`: Filter by genre
- `status`: Filter by status (ongoing|completed|hiatus)
- `sort`: Sort by (title|rating|updated_at|views)
- `order`: Sort order (asc|desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "manga": [
      {
        "id": 1,
        "title": "Akira Chronicles",
        "slug": "akira-chronicles",
        "author": "Katsuhiro Otomo",
        "artist": "Katsuhiro Otomo",
        "description": "Set in a dystopian 2019...",
        "cover_image": "https://example.com/cover.jpg",
        "banner_image": "https://example.com/banner.jpg",
        "status": "completed",
        "rating": 4.8,
        "total_views": 2500000,
        "total_chapters": 120,
        "genres": ["Action", "Sci-Fi", "Thriller"],
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-15T10:30:00Z",
        "latest_chapter": {
          "id": 120,
          "chapter_number": 120,
          "title": "Final Battle",
          "release_date": "2024-01-15T00:00:00Z"
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 100,
      "per_page": 20,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

### GET /api/manga/{id}
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Akira Chronicles",
    "slug": "akira-chronicles",
    "author": "Katsuhiro Otomo",
    "artist": "Katsuhiro Otomo",
    "description": "Full description...",
    "cover_image": "https://example.com/cover.jpg",
    "banner_image": "https://example.com/banner.jpg",
    "status": "completed",
    "rating": 4.8,
    "total_views": 2500000,
    "total_chapters": 120,
    "genres": ["Action", "Sci-Fi", "Thriller"],
    "anilist_id": 30,
    "mal_id": 71,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "chapters": [
      {
        "id": 1,
        "chapter_number": 1,
        "title": "The Beginning",
        "page_count": 20,
        "views": 45000,
        "release_date": "2024-01-01T00:00:00Z",
        "is_new": false
      }
    ]
  }
}
```

### POST /api/manga (Admin only)
**Request:**
```json
{
  "title": "New Manga",
  "author": "Author Name",
  "artist": "Artist Name",
  "description": "Manga description",
  "cover_image": "https://example.com/cover.jpg",
  "banner_image": "https://example.com/banner.jpg",
  "status": "ongoing",
  "genres": ["Action", "Adventure"],
  "anilist_id": 12345,
  "mal_id": 67890
}
```

**Response:**
```json
{
  "success": true,
  "message": "Manga created successfully",
  "data": {
    "id": 2,
    "slug": "new-manga"
  }
}
```

## Chapter Management Endpoints

### GET /api/manga/{manga_id}/chapters
**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `sort`: Sort by (chapter_number|release_date|views)
- `order`: Sort order (asc|desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "chapters": [
      {
        "id": 1,
        "manga_id": 1,
        "chapter_number": 1,
        "title": "The Beginning",
        "page_count": 20,
        "views": 45000,
        "release_date": "2024-01-01T00:00:00Z",
        "is_new": false,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 6,
      "total_items": 120,
      "per_page": 20
    }
  }
}
```

### GET /api/chapters/{id}
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "manga_id": 1,
    "manga": {
      "id": 1,
      "title": "Akira Chronicles",
      "slug": "akira-chronicles"
    },
    "chapter_number": 1,
    "title": "The Beginning",
    "page_count": 20,
    "views": 45000,
    "release_date": "2024-01-01T00:00:00Z",
    "is_new": false,
    "pages": [
      {
        "id": 1,
        "page_number": 1,
        "image_url": "https://example.com/page1.jpg",
        "image_width": 800,
        "image_height": 1200
      }
    ],
    "navigation": {
      "previous_chapter": {
        "id": null,
        "chapter_number": null,
        "title": null
      },
      "next_chapter": {
        "id": 2,
        "chapter_number": 2,
        "title": "Chapter 2"
      }
    }
  }
}
```

### POST /api/chapters/{id}/view
**Request:**
```json
{
  "user_id": 123,
  "page_number": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "View recorded",
  "data": {
    "total_views": 45001
  }
}
```

## User Management Endpoints

### GET /api/users/{id}/favorites
**Response:**
```json
{
  "success": true,
  "data": {
    "favorites": [
      {
        "id": 1,
        "manga": {
          "id": 1,
          "title": "Akira Chronicles",
          "slug": "akira-chronicles",
          "cover_image": "https://example.com/cover.jpg",
          "latest_chapter": 120
        },
        "added_at": "2024-01-10T00:00:00Z"
      }
    ]
  }
}
```

### POST /api/users/{id}/favorites
**Request:**
```json
{
  "manga_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Manga added to favorites"
}
```

### GET /api/users/{id}/reading-history
**Response:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": 1,
        "manga": {
          "id": 1,
          "title": "Akira Chronicles",
          "cover_image": "https://example.com/cover.jpg"
        },
        "chapter": {
          "id": 15,
          "chapter_number": 15,
          "title": "Chapter 15"
        },
        "last_page": 8,
        "progress_percentage": 40,
        "last_read_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

## Admin Endpoints

### GET /api/admin/scraping-jobs
**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": 1,
        "manga_id": 1,
        "manga_title": "Akira Chronicles",
        "status": "completed|running|failed|pending",
        "total_chapters": 120,
        "scraped_chapters": 120,
        "failed_chapters": 0,
        "started_at": "2024-01-01T00:00:00Z",
        "completed_at": "2024-01-01T02:30:00Z",
        "error_message": null
      }
    ]
  }
}
```

### POST /api/admin/scraping-jobs
**Request:**
```json
{
  "manga_id": 1,
  "api_manga_name": "akira chronicles",
  "selected_chapters": [1, 2, 3],
  "scrape_all": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Scraping job started",
  "data": {
    "job_id": 123
  }
}
```

### GET /api/admin/scraping-jobs/{id}/status
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "status": "running",
    "progress": {
      "total_chapters": 120,
      "scraped_chapters": 45,
      "current_chapter": "Chapter 46",
      "percentage": 37.5
    },
    "estimated_completion": "2024-01-15T12:00:00Z"
  }
}
```

## Search Endpoints

### GET /api/search
**Query Parameters:**
- `q`: Search query
- `type`: Search type (manga|chapter|all)
- `limit`: Results limit

**Response:**
```json
{
  "success": true,
  "data": {
    "manga": [
      {
        "id": 1,
        "title": "Akira Chronicles",
        "slug": "akira-chronicles",
        "cover_image": "https://example.com/cover.jpg",
        "author": "Katsuhiro Otomo",
        "rating": 4.8,
        "total_chapters": 120
      }
    ],
    "chapters": [
      {
        "id": 15,
        "manga_id": 1,
        "manga_title": "Akira Chronicles",
        "chapter_number": 15,
        "title": "Chapter 15",
        "release_date": "2024-01-05T00:00:00Z"
      }
    ],
    "total_results": 25
  }
}
```

## Error Response Format

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Email format is invalid"
    }
  }
}
```

## Common Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMITED`: Too many requests
- `SERVER_ERROR`: Internal server error
- `SCRAPING_ERROR`: External API scraping failed