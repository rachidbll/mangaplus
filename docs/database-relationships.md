# Database Relationships and Design Patterns

## Entity Relationship Overview

```
Users (1) ←→ (M) User_Favorites ←→ (1) Manga
Users (1) ←→ (M) Reading_History ←→ (1) Chapters ←→ (1) Manga
Users (1) ←→ (M) Comments ←→ (1) Chapters
Users (1) ←→ (M) Comment_Reactions ←→ (1) Comments
Users (1) ←→ (M) Scraping_Jobs ←→ (1) Manga
Users (1) ←→ (M) User_Sessions
Users (1) ←→ (M) Notifications

Manga (1) ←→ (M) Chapters ←→ (M) Chapter_Pages
Manga (M) ←→ (M) Manga_Genres ←→ (M) Genres
Manga (1) ←→ (M) Chapter_Views ←→ (1) Chapters

Scraping_Jobs (1) ←→ (M) Scraping_Job_Logs
```

## Key Design Patterns

### 1. User Management
- **Authentication**: JWT-based with session tracking
- **Roles**: Simple role-based access (user/admin)
- **Preferences**: JSON field for flexible user settings

### 2. Content Hierarchy
```
Manga → Chapters → Pages
```
- Manga contains metadata and overall information
- Chapters represent individual reading units
- Pages contain actual content images

### 3. User Engagement
- **Favorites**: Many-to-many relationship between users and manga
- **Reading History**: Tracks progress through chapters
- **Comments**: Hierarchical commenting system with reactions
- **Views**: Separate tracking for analytics

### 4. Content Management
- **Scraping Jobs**: Async job processing for content import
- **Job Logs**: Detailed logging for debugging and monitoring
- **API Settings**: Configurable scraping parameters

## Performance Considerations

### Indexing Strategy
1. **Primary Access Patterns**:
   - Manga by slug (unique index)
   - Chapters by manga and number (composite index)
   - User reading history by user and date (composite index)

2. **Search Optimization**:
   - Full-text search on manga title, author, description
   - Genre filtering through junction table
   - Status and rating filtering

3. **Analytics Queries**:
   - View counting and aggregation
   - Popular content identification
   - User engagement metrics

### Caching Strategy
1. **Application Level**:
   - Manga metadata (Redis)
   - Chapter lists (Redis)
   - User sessions (Redis)

2. **Database Level**:
   - Query result caching
   - Materialized views for complex aggregations

## Data Integrity Rules

### Constraints
1. **Referential Integrity**:
   - Cascade deletes for dependent data
   - Null handling for optional relationships

2. **Business Rules**:
   - Unique manga slugs
   - Unique chapter numbers per manga
   - Valid email formats
   - Positive view counts

### Validation
1. **Input Validation**:
   - Email format validation
   - URL format validation
   - Image dimension constraints

2. **Data Consistency**:
   - Chapter count synchronization
   - View count aggregation
   - Rating calculations

## Scalability Considerations

### Horizontal Scaling
1. **Read Replicas**:
   - Separate read/write operations
   - Geographic distribution

2. **Sharding Strategy**:
   - Shard by manga_id for chapter data
   - Shard by user_id for user data

### Vertical Scaling
1. **Table Partitioning**:
   - Partition chapter_views by date
   - Partition reading_history by user_id

2. **Archive Strategy**:
   - Move old view data to archive tables
   - Compress historical data

## Security Measures

### Data Protection
1. **Sensitive Data**:
   - Password hashing (bcrypt)
   - API key encryption
   - PII data handling

2. **Access Control**:
   - Row-level security for user data
   - Admin-only access to scraping functions
   - Rate limiting on API endpoints

### Audit Trail
1. **Change Tracking**:
   - Created/updated timestamps
   - User action logging
   - Admin operation tracking

2. **Data Retention**:
   - Log rotation policies
   - GDPR compliance measures
   - Data anonymization procedures