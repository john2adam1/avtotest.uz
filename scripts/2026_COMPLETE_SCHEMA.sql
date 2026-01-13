-- ==============================================================================
-- 2026 COMPLETE SCHEMA
-- ==============================================================================
-- Run this script in the Supabase SQL Editor.
-- It is designed to be safe to run multiple times (idempotent).
-- It fixes:
-- 1. "Trigger already exists" errors.
-- 2. "Permission denied" errors (adds RLS policies for all tables).
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. TABLES (Create if not exists)
-- ============================================

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  trial_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() + INTERVAL '3 days',
  subscription_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_name TEXT,
  last_name TEXT,
  phone TEXT UNIQUE NOT NULL,
  active_device_id UUID,
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Topics
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tests
CREATE TABLE IF NOT EXISTS tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  audio_url TEXT,
  question TEXT NOT NULL,
  answers TEXT[] NOT NULL,
  correct_answer INTEGER NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),
  time_limit INTEGER NOT NULL DEFAULT 300,
  explanation_title TEXT,
  explanation_text TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket Tests
CREATE TABLE IF NOT EXISTS ticket_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ticket_id, test_id)
);

-- Test Results
CREATE TABLE IF NOT EXISTS test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  wrong_answers INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site Content
CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Carousel Images
CREATE TABLE IF NOT EXISTS carousel_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Statistics Tables
CREATE TABLE IF NOT EXISTS topic_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  correct_count INTEGER NOT NULL DEFAULT 0,
  wrong_count INTEGER NOT NULL DEFAULT 0,
  unanswered_count INTEGER NOT NULL DEFAULT 0,
  percentage INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

CREATE TABLE IF NOT EXISTS ticket_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  correct_count INTEGER NOT NULL DEFAULT 0,
  wrong_count INTEGER NOT NULL DEFAULT 0,
  unanswered_count INTEGER NOT NULL DEFAULT 0,
  percentage INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, ticket_id)
);

CREATE TABLE IF NOT EXISTS exam_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exam_type INTEGER NOT NULL CHECK (exam_type IN (20, 50, 100)),
  correct_count INTEGER NOT NULL DEFAULT 0,
  wrong_count INTEGER NOT NULL DEFAULT 0,
  unanswered_count INTEGER NOT NULL DEFAULT 0,
  percentage INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, exam_type)
);

CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  question_font_size INTEGER NOT NULL DEFAULT 16,
  answer_font_size INTEGER NOT NULL DEFAULT 14,
  language TEXT NOT NULL DEFAULT 'uz-lat' CHECK (language IN ('uz-lat', 'uz-cyr', 'ru')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. RLS POLICIES (Fixes "Permission Denied")
-- ============================================

-- Helper macro to enable RLS and add basic policies
-- We'll just write them out explicitly for clarity and robustness.

-- USERS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read users" ON users;
CREATE POLICY "Public read users" ON users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- TOPICS
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read topics" ON topics;
CREATE POLICY "Public read topics" ON topics FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage topics" ON topics;
CREATE POLICY "Admin manage topics" ON topics FOR ALL USING (auth.role() = 'authenticated');

-- TESTS
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read tests" ON tests;
CREATE POLICY "Public read tests" ON tests FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage tests" ON tests;
CREATE POLICY "Admin manage tests" ON tests FOR ALL USING (auth.role() = 'authenticated');

-- TICKETS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read tickets" ON tickets;
CREATE POLICY "Public read tickets" ON tickets FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage tickets" ON tickets;
CREATE POLICY "Admin manage tickets" ON tickets FOR ALL USING (auth.role() = 'authenticated');

-- TICKET TESTS
ALTER TABLE ticket_tests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read ticket_tests" ON ticket_tests;
CREATE POLICY "Public read ticket_tests" ON ticket_tests FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage ticket_tests" ON ticket_tests;
CREATE POLICY "Admin manage ticket_tests" ON ticket_tests FOR ALL USING (auth.role() = 'authenticated');

-- TEST RESULTS
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own results" ON test_results;
CREATE POLICY "Users read own results" ON test_results FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users create own results" ON test_results;
CREATE POLICY "Users create own results" ON test_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- SITE CONTENT
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read site_content" ON site_content;
CREATE POLICY "Public read site_content" ON site_content FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage site_content" ON site_content;
CREATE POLICY "Admin manage site_content" ON site_content FOR ALL USING (auth.role() = 'authenticated');

-- CAROUSEL IMAGES
ALTER TABLE carousel_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read carousel_images" ON carousel_images;
CREATE POLICY "Public read carousel_images" ON carousel_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage carousel_images" ON carousel_images;
CREATE POLICY "Admin manage carousel_images" ON carousel_images FOR ALL USING (auth.role() = 'authenticated');

-- STATISTICS (TOPIC)
ALTER TABLE topic_statistics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own topic_statistics" ON topic_statistics;
CREATE POLICY "Users read own topic_statistics" ON topic_statistics FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage own topic_statistics" ON topic_statistics;
CREATE POLICY "Users manage own topic_statistics" ON topic_statistics FOR ALL USING (auth.uid() = user_id);

-- STATISTICS (TICKET)
ALTER TABLE ticket_statistics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own ticket_statistics" ON ticket_statistics;
CREATE POLICY "Users read own ticket_statistics" ON ticket_statistics FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage own ticket_statistics" ON ticket_statistics;
CREATE POLICY "Users manage own ticket_statistics" ON ticket_statistics FOR ALL USING (auth.uid() = user_id);

-- STATISTICS (EXAM)
ALTER TABLE exam_statistics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own exam_statistics" ON exam_statistics;
CREATE POLICY "Users read own exam_statistics" ON exam_statistics FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage own exam_statistics" ON exam_statistics;
CREATE POLICY "Users manage own exam_statistics" ON exam_statistics FOR ALL USING (auth.uid() = user_id);

-- USER SETTINGS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own user_settings" ON user_settings;
CREATE POLICY "Users read own user_settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage own user_settings" ON user_settings;
CREATE POLICY "Users manage own user_settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 4. TRIGGERS (Fixes "Trigger Already Exists")
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper to safely drop and create triggers
DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_topic_statistics_updated_at ON topic_statistics;
CREATE TRIGGER update_topic_statistics_updated_at BEFORE UPDATE ON topic_statistics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ticket_statistics_updated_at ON ticket_statistics;
CREATE TRIGGER update_ticket_statistics_updated_at BEFORE UPDATE ON ticket_statistics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_exam_statistics_updated_at ON exam_statistics;
CREATE TRIGGER update_exam_statistics_updated_at BEFORE UPDATE ON exam_statistics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Site content trigger
CREATE OR REPLACE FUNCTION update_site_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_site_content_updated_at ON site_content;
CREATE TRIGGER trigger_update_site_content_updated_at BEFORE UPDATE ON site_content FOR EACH ROW EXECUTE FUNCTION update_site_content_updated_at();

-- ============================================
-- 5. STORAGE & DEFAULT DATA
-- ============================================

-- Default Contact Info
INSERT INTO site_content (type, content)
VALUES (
  'contact', 
  '{
    "phone": "+998 90 123 45 67",
    "telegram": "Telegram orqali yozish",
    "telegram_link": "https://t.me/sarvar_avtotest",
    "address": "Toshkent shahri"
  }'::jsonb
)
ON CONFLICT (type) DO NOTHING;

-- Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('test-images', 'test-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('test-audio', 'test-audio', true) ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- Drop existing first
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete audio" ON storage.objects;

-- Create Policies
CREATE POLICY "Public can view images" ON storage.objects FOR SELECT USING (bucket_id = 'test-images');
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'test-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update images" ON storage.objects FOR UPDATE USING (bucket_id = 'test-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete images" ON storage.objects FOR DELETE USING (bucket_id = 'test-images' AND auth.role() = 'authenticated');

CREATE POLICY "Public can view audio" ON storage.objects FOR SELECT USING (bucket_id = 'test-audio');
CREATE POLICY "Authenticated users can upload audio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'test-audio' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update audio" ON storage.objects FOR UPDATE USING (bucket_id = 'test-audio' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete audio" ON storage.objects FOR DELETE USING (bucket_id = 'test-audio' AND auth.role() = 'authenticated');

--------------------------------------------------------------------------------
-- DONE
--------------------------------------------------------------------------------
