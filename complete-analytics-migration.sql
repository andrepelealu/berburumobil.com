-- Complete Analytics Migration
-- This file contains ALL database changes needed for the analytics system
-- Run this SQL in your Supabase SQL Editor

-- 1. Add ai_analysis column to existing blog_articles table
ALTER TABLE blog_articles 
ADD COLUMN IF NOT EXISTS ai_analysis JSONB;

-- 2. Create all analytics tables

-- Page visits tracking
CREATE TABLE IF NOT EXISTS analytics_page_visits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id VARCHAR(100) NOT NULL,
  user_agent TEXT,
  ip_address INET,
  country VARCHAR(100),
  city VARCHAR(100),
  region VARCHAR(100),
  page_path VARCHAR(500) NOT NULL,
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  device_type VARCHAR(50), -- mobile, desktop, tablet
  browser VARCHAR(100),
  os VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique daily visitors
CREATE TABLE IF NOT EXISTS analytics_daily_visitors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  ip_address INET,
  country VARCHAR(100),
  first_visit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_page_views INTEGER DEFAULT 1,
  UNIQUE(date, session_id)
);

-- Form submissions tracking
CREATE TABLE IF NOT EXISTS analytics_form_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id VARCHAR(100) NOT NULL,
  form_type VARCHAR(50) NOT NULL, -- 'booking', 'contact', etc.
  ip_address INET,
  country VARCHAR(100),
  city VARCHAR(100),
  form_data JSONB, -- Store form fields (excluding sensitive data)
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Analysis tracking
CREATE TABLE IF NOT EXISTS analytics_ai_analysis (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id VARCHAR(100) NOT NULL,
  ip_address INET,
  country VARCHAR(100),
  city VARCHAR(100),
  car_url TEXT NOT NULL,
  platform VARCHAR(50), -- 'olx', 'mobil123', 'facebook', etc.
  analysis_success BOOLEAN DEFAULT true,
  processing_time_ms INTEGER,
  ai_score INTEGER,
  confidence_level INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions tracking
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id VARCHAR(100) UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  country VARCHAR(100),
  city VARCHAR(100),
  region VARCHAR(100),
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_page_views INTEGER DEFAULT 1,
  session_duration_seconds INTEGER DEFAULT 0
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_page_visits_created_at ON analytics_page_visits(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_page_visits_session ON analytics_page_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_page_visits_country ON analytics_page_visits(country);

CREATE INDEX IF NOT EXISTS idx_analytics_daily_visitors_date ON analytics_daily_visitors(date);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_visitors_country ON analytics_daily_visitors(country);

CREATE INDEX IF NOT EXISTS idx_analytics_form_submissions_created_at ON analytics_form_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_form_submissions_type ON analytics_form_submissions(form_type);
CREATE INDEX IF NOT EXISTS idx_analytics_form_submissions_country ON analytics_form_submissions(country);

CREATE INDEX IF NOT EXISTS idx_analytics_ai_analysis_created_at ON analytics_ai_analysis(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_ai_analysis_platform ON analytics_ai_analysis(platform);
CREATE INDEX IF NOT EXISTS idx_analytics_ai_analysis_country ON analytics_ai_analysis(country);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_first_seen_at ON analytics_sessions(first_seen_at);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_session_id ON analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_country ON analytics_sessions(country);

-- 4. Enable Row Level Security
ALTER TABLE analytics_page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for analytics (allow insert from app)
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow public insert to analytics_page_visits" ON analytics_page_visits;
    DROP POLICY IF EXISTS "Allow public insert to analytics_daily_visitors" ON analytics_daily_visitors;
    DROP POLICY IF EXISTS "Allow public upsert to analytics_daily_visitors" ON analytics_daily_visitors;
    DROP POLICY IF EXISTS "Allow public insert to analytics_form_submissions" ON analytics_form_submissions;
    DROP POLICY IF EXISTS "Allow public insert to analytics_ai_analysis" ON analytics_ai_analysis;
    DROP POLICY IF EXISTS "Allow public insert to analytics_sessions" ON analytics_sessions;
    DROP POLICY IF EXISTS "Allow public upsert to analytics_sessions" ON analytics_sessions;
    
    -- Create new policies
    CREATE POLICY "Allow public insert to analytics_page_visits" ON analytics_page_visits
      FOR INSERT WITH CHECK (true);

    CREATE POLICY "Allow public insert to analytics_daily_visitors" ON analytics_daily_visitors
      FOR INSERT WITH CHECK (true);
      
    CREATE POLICY "Allow public upsert to analytics_daily_visitors" ON analytics_daily_visitors
      FOR UPDATE USING (true);

    CREATE POLICY "Allow public insert to analytics_form_submissions" ON analytics_form_submissions
      FOR INSERT WITH CHECK (true);

    CREATE POLICY "Allow public insert to analytics_ai_analysis" ON analytics_ai_analysis
      FOR INSERT WITH CHECK (true);

    CREATE POLICY "Allow public insert to analytics_sessions" ON analytics_sessions
      FOR INSERT WITH CHECK (true);
      
    CREATE POLICY "Allow public upsert to analytics_sessions" ON analytics_sessions
      FOR UPDATE USING (true);
END $$;

-- 6. Verify the migration completed successfully
SELECT 'Analytics migration completed successfully!' as status;

-- 7. Show all analytics tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE 'analytics_%' 
AND table_schema = 'public';

-- 8. Useful queries to check your analytics data:

-- Total AI analyses
-- SELECT COUNT(*) as total_ai_analyses FROM analytics_ai_analysis;

-- Daily AI usage
-- SELECT created_at::date as date, COUNT(*) as analyses 
-- FROM analytics_ai_analysis 
-- GROUP BY created_at::date 
-- ORDER BY date DESC;

-- AI usage by platform
-- SELECT platform, COUNT(*) as count, 
--        ROUND(AVG(ai_score)) as avg_score
-- FROM analytics_ai_analysis 
-- WHERE analysis_success = true
-- GROUP BY platform;

-- Daily page views
-- SELECT created_at::date as date, COUNT(*) as page_views 
-- FROM analytics_page_visits 
-- GROUP BY created_at::date 
-- ORDER BY date DESC;

-- Form submissions by type
-- SELECT form_type, COUNT(*) as submissions,
--        COUNT(*) FILTER (WHERE success = true) as successful
-- FROM analytics_form_submissions 
-- GROUP BY form_type;