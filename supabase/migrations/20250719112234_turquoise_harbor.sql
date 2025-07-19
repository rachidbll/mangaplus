-- MySQL Database Schema for Manga Reading Platform

-- Users table
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    email_verified_at TIMESTAMP NULL,
    avatar_url VARCHAR(500) NULL,
    preferences JSON NULL, -- Reading preferences, theme, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role)
);

-- Genres table
CREATE TABLE genres (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_slug (slug)
);

-- Manga table
CREATE TABLE manga (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    author VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    cover_image VARCHAR(500) NOT NULL,
    banner_image VARCHAR(500) NULL,
    status ENUM('ongoing', 'completed', 'hiatus', 'cancelled') DEFAULT 'ongoing',
    rating DECIMAL(3,2) DEFAULT 0.00, -- 0.00 to 10.00
    total_views BIGINT UNSIGNED DEFAULT 0,
    total_chapters INT UNSIGNED DEFAULT 0,
    anilist_id INT UNSIGNED NULL,
    mal_id INT UNSIGNED NULL,
    api_manga_name VARCHAR(255) NULL, -- Name used for API scraping
    scraping_source VARCHAR(255) NULL, -- Source website/API
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_rating (rating),
    INDEX idx_total_views (total_views),
    INDEX idx_featured (is_featured),
    INDEX idx_active (is_active),
    INDEX idx_anilist (anilist_id),
    INDEX idx_mal (mal_id),
    FULLTEXT idx_search (title, author, description)
);

-- Manga genres junction table
CREATE TABLE manga_genres (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    manga_id BIGINT UNSIGNED NOT NULL,
    genre_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (manga_id) REFERENCES manga(id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE,
    UNIQUE KEY unique_manga_genre (manga_id, genre_id),
    INDEX idx_manga_id (manga_id),
    INDEX idx_genre_id (genre_id)
);

-- Chapters table
CREATE TABLE chapters (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    manga_id BIGINT UNSIGNED NOT NULL,
    chapter_number DECIMAL(8,2) NOT NULL, -- Supports decimal chapters like 1.5
    title VARCHAR(255) NOT NULL,
    page_count INT UNSIGNED DEFAULT 0,
    views BIGINT UNSIGNED DEFAULT 0,
    release_date DATE NOT NULL,
    is_new BOOLEAN DEFAULT TRUE,
    source_url VARCHAR(500) NULL, -- Original URL from scraping
    scraping_status ENUM('pending', 'scraping', 'completed', 'failed') DEFAULT 'pending',
    scraping_error TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (manga_id) REFERENCES manga(id) ON DELETE CASCADE,
    UNIQUE KEY unique_manga_chapter (manga_id, chapter_number),
    INDEX idx_manga_id (manga_id),
    INDEX idx_chapter_number (chapter_number),
    INDEX idx_release_date (release_date),
    INDEX idx_views (views),
    INDEX idx_is_new (is_new),
    INDEX idx_scraping_status (scraping_status)
);

-- Chapter pages table
CREATE TABLE chapter_pages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    chapter_id BIGINT UNSIGNED NOT NULL,
    page_number INT UNSIGNED NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_width INT UNSIGNED NULL,
    image_height INT UNSIGNED NULL,
    file_size INT UNSIGNED NULL, -- In bytes
    alt_text VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    UNIQUE KEY unique_chapter_page (chapter_id, page_number),
    INDEX idx_chapter_id (chapter_id),
    INDEX idx_page_number (page_number)
);

-- User favorites table
CREATE TABLE user_favorites (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    manga_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (manga_id) REFERENCES manga(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_favorite (user_id, manga_id),
    INDEX idx_user_id (user_id),
    INDEX idx_manga_id (manga_id)
);

-- Reading history table
CREATE TABLE reading_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    manga_id BIGINT UNSIGNED NOT NULL,
    chapter_id BIGINT UNSIGNED NOT NULL,
    last_page INT UNSIGNED DEFAULT 1,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00, -- 0.00 to 100.00
    reading_time_seconds INT UNSIGNED DEFAULT 0, -- Time spent reading
    last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (manga_id) REFERENCES manga(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_chapter (user_id, chapter_id),
    INDEX idx_user_id (user_id),
    INDEX idx_manga_id (manga_id),
    INDEX idx_chapter_id (chapter_id),
    INDEX idx_last_read (last_read_at)
);

-- Chapter views tracking table
CREATE TABLE chapter_views (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    chapter_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NULL, -- NULL for anonymous views
    ip_address VARCHAR(45) NULL, -- IPv4 or IPv6
    user_agent TEXT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_chapter_id (chapter_id),
    INDEX idx_user_id (user_id),
    INDEX idx_viewed_at (viewed_at),
    INDEX idx_ip_address (ip_address)
);

-- Scraping jobs table
CREATE TABLE scraping_jobs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    manga_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL, -- Admin who started the job
    job_type ENUM('full_scrape', 'selective_scrape', 'update_scrape') NOT NULL,
    status ENUM('pending', 'running', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    total_chapters INT UNSIGNED DEFAULT 0,
    scraped_chapters INT UNSIGNED DEFAULT 0,
    failed_chapters INT UNSIGNED DEFAULT 0,
    selected_chapters JSON NULL, -- Array of chapter numbers for selective scraping
    api_manga_name VARCHAR(255) NOT NULL,
    scraping_source VARCHAR(255) NOT NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    error_message TEXT NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    estimated_completion TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (manga_id) REFERENCES manga(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_manga_id (manga_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_job_type (job_type),
    INDEX idx_started_at (started_at),
    INDEX idx_completed_at (completed_at)
);

-- Scraping job logs table
CREATE TABLE scraping_job_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT UNSIGNED NOT NULL,
    chapter_id BIGINT UNSIGNED NULL,
    log_level ENUM('info', 'warning', 'error', 'debug') NOT NULL,
    message TEXT NOT NULL,
    context JSON NULL, -- Additional context data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_id) REFERENCES scraping_jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL,
    INDEX idx_job_id (job_id),
    INDEX idx_chapter_id (chapter_id),
    INDEX idx_log_level (log_level),
    INDEX idx_created_at (created_at)
);

-- API settings table (for admin configuration)
CREATE TABLE api_settings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT NULL,
    is_encrypted BOOLEAN DEFAULT FALSE,
    updated_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_setting_key (setting_key),
    INDEX idx_updated_by (updated_by)
);

-- User sessions table (for JWT token management)
CREATE TABLE user_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    device_info JSON NULL, -- Browser, OS, etc.
    ip_address VARCHAR(45) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_token (token_hash),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_last_activity (last_activity)
);

-- Comments table (for chapter comments)
CREATE TABLE comments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    chapter_id BIGINT UNSIGNED NOT NULL,
    parent_id BIGINT UNSIGNED NULL, -- For nested comments
    content TEXT NOT NULL,
    is_spoiler BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    likes_count INT UNSIGNED DEFAULT 0,
    dislikes_count INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_chapter_id (chapter_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_created_at (created_at),
    INDEX idx_approved (is_approved)
);

-- Comment reactions table
CREATE TABLE comment_reactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    comment_id BIGINT UNSIGNED NOT NULL,
    reaction_type ENUM('like', 'dislike') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_comment_reaction (user_id, comment_id),
    INDEX idx_user_id (user_id),
    INDEX idx_comment_id (comment_id),
    INDEX idx_reaction_type (reaction_type)
);

-- Notifications table
CREATE TABLE notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    type ENUM('new_chapter', 'comment_reply', 'system_announcement') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON NULL, -- Additional notification data
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- Insert default genres
INSERT INTO genres (name, slug, description) VALUES
('Action', 'action', 'High-energy scenes with fighting and adventure'),
('Adventure', 'adventure', 'Journey and exploration themes'),
('Comedy', 'comedy', 'Humorous and funny content'),
('Drama', 'drama', 'Serious and emotional storylines'),
('Fantasy', 'fantasy', 'Magical and supernatural elements'),
('Horror', 'horror', 'Scary and frightening content'),
('Mystery', 'mystery', 'Puzzles and unknown elements to solve'),
('Romance', 'romance', 'Love and relationship focused'),
('Sci-Fi', 'sci-fi', 'Science fiction and futuristic themes'),
('Slice of Life', 'slice-of-life', 'Everyday life and realistic situations'),
('Sports', 'sports', 'Athletic and competitive activities'),
('Supernatural', 'supernatural', 'Beyond natural world phenomena'),
('Thriller', 'thriller', 'Suspenseful and intense storylines'),
('Psychological', 'psychological', 'Mental and emotional complexity'),
('Historical', 'historical', 'Set in past time periods'),
('School', 'school', 'Educational institution settings'),
('Martial Arts', 'martial-arts', 'Fighting techniques and combat'),
('Mecha', 'mecha', 'Giant robots and mechanical suits'),
('Military', 'military', 'Armed forces and warfare'),
('Music', 'music', 'Musical themes and performances');

-- Insert default API settings
INSERT INTO api_settings (setting_key, setting_value, description, updated_by) VALUES
('scraping_api_url', '', 'Main API endpoint for manga scraping', 1),
('scraping_api_username', '', 'Username for API authentication', 1),
('scraping_api_password', '', 'Password for API authentication', 1),
('scraping_rate_limit', '10', 'Requests per minute for scraping', 1),
('max_concurrent_jobs', '3', 'Maximum concurrent scraping jobs', 1),
('default_image_quality', 'high', 'Default image quality for scraping', 1),
('enable_auto_scraping', 'false', 'Enable automatic chapter scraping', 1),
('notification_email', '', 'Email for system notifications', 1);

-- Create indexes for better performance
CREATE INDEX idx_manga_updated_featured ON manga(updated_at, is_featured);
CREATE INDEX idx_chapters_manga_number ON chapters(manga_id, chapter_number);
CREATE INDEX idx_reading_history_user_updated ON reading_history(user_id, last_read_at);
CREATE INDEX idx_chapter_views_date ON chapter_views(viewed_at, chapter_id);

-- Create views for common queries
CREATE VIEW manga_with_stats AS
SELECT 
    m.*,
    COUNT(DISTINCT c.id) as actual_chapter_count,
    MAX(c.release_date) as latest_chapter_date,
    AVG(c.views) as avg_chapter_views,
    SUM(c.views) as total_chapter_views
FROM manga m
LEFT JOIN chapters c ON m.id = c.manga_id
WHERE m.is_active = TRUE
GROUP BY m.id;

CREATE VIEW popular_manga AS
SELECT 
    m.*,
    COUNT(DISTINCT uf.user_id) as favorites_count,
    COUNT(DISTINCT rh.user_id) as readers_count
FROM manga m
LEFT JOIN user_favorites uf ON m.id = uf.manga_id
LEFT JOIN reading_history rh ON m.id = rh.manga_id
WHERE m.is_active = TRUE
GROUP BY m.id
ORDER BY m.total_views DESC, favorites_count DESC;

CREATE VIEW recent_chapters AS
SELECT 
    c.*,
    m.title as manga_title,
    m.slug as manga_slug,
    m.cover_image as manga_cover
FROM chapters c
JOIN manga m ON c.manga_id = m.id
WHERE m.is_active = TRUE
ORDER BY c.release_date DESC, c.created_at DESC;