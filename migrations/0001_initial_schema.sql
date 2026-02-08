-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free', -- free, pro, enterprise
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

-- Social media accounts connected by users
CREATE TABLE IF NOT EXISTS social_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  platform TEXT NOT NULL, -- facebook, instagram, twitter, linkedin, tiktok, etc.
  account_name TEXT NOT NULL,
  account_id TEXT NOT NULL, -- Platform-specific account ID
  access_token TEXT NOT NULL, -- Encrypted OAuth token
  refresh_token TEXT,
  token_expires_at DATETIME,
  profile_picture_url TEXT,
  follower_count INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_synced DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Scheduled posts
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT, -- JSON array of media URLs
  platforms TEXT NOT NULL, -- JSON array of platform IDs
  status TEXT DEFAULT 'draft', -- draft, scheduled, published, failed
  scheduled_time DATETIME,
  published_time DATETIME,
  engagement_score INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Post analytics per platform
CREATE TABLE IF NOT EXISTS post_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  social_account_id INTEGER NOT NULL,
  platform_post_id TEXT, -- ID from the social platform
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagement_rate REAL DEFAULT 0.0,
  synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (social_account_id) REFERENCES social_accounts(id) ON DELETE CASCADE
);

-- Content library
CREATE TABLE IF NOT EXISTS media_library (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- image, video, document
  file_url TEXT NOT NULL, -- R2 storage URL
  file_size INTEGER,
  tags TEXT, -- JSON array of tags
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Hashtag pools
CREATE TABLE IF NOT EXISTS hashtag_pools (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  pool_name TEXT NOT NULL,
  hashtags TEXT NOT NULL, -- JSON array of hashtags
  category TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Competitor tracking
CREATE TABLE IF NOT EXISTS competitors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  platform TEXT NOT NULL,
  competitor_name TEXT NOT NULL,
  competitor_id TEXT NOT NULL,
  follower_count INTEGER DEFAULT 0,
  avg_engagement_rate REAL DEFAULT 0.0,
  last_synced DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Trend alerts
CREATE TABLE IF NOT EXISTS trends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  keyword TEXT NOT NULL,
  platform TEXT,
  trend_score INTEGER DEFAULT 0,
  detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Team collaboration
CREATE TABLE IF NOT EXISTS team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL, -- Owner
  member_email TEXT NOT NULL,
  role TEXT DEFAULT 'viewer', -- viewer, editor, admin
  invited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  accepted_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Unified inbox messages
CREATE TABLE IF NOT EXISTS inbox_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  social_account_id INTEGER NOT NULL,
  platform_message_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  message_text TEXT,
  message_type TEXT DEFAULT 'comment', -- comment, dm, mention
  replied INTEGER DEFAULT 0,
  reply_text TEXT,
  received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (social_account_id) REFERENCES social_accounts(id) ON DELETE CASCADE
);

-- AI-generated content cache
CREATE TABLE IF NOT EXISTS ai_content_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  prompt TEXT NOT NULL,
  content_type TEXT NOT NULL, -- caption, hashtag, bio
  generated_content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_time ON posts(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_post_analytics_post_id ON post_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_media_library_user_id ON media_library(user_id);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_user_id ON inbox_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_replied ON inbox_messages(replied);
