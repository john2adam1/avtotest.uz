-- ==============================================================================
-- 2026 MASTER SCHEMA (COMPLEX CONSOLIDATION)
-- ==============================================================================
-- Run this script in the Supabase SQL Editor.
-- This script contains ALL previous updates, dual-language support,
-- and the bulk ticket division logic.
-- ==============================================================================

-- 1. CLEANUP (Optional - Use with caution)
-- DROP TABLE IF EXISTS user_settings CASCADE;
-- DROP TABLE IF EXISTS exam_statistics CASCADE;
-- DROP TABLE IF EXISTS ticket_statistics CASCADE;
-- DROP TABLE IF EXISTS topic_statistics CASCADE;
-- DROP TABLE IF EXISTS carousel_images CASCADE;
-- DROP TABLE IF EXISTS site_content CASCADE;
-- DROP TABLE IF EXISTS ticket_tests CASCADE;
-- DROP TABLE IF EXISTS test_results CASCADE;
-- DROP TABLE IF EXISTS tickets CASCADE;
-- DROP TABLE IF EXISTS tests CASCADE;
-- DROP TABLE IF EXISTS topics CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- 2. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 3. TABLES
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

-- Topics (Mavzular)
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
  
  -- Latin Content
  question TEXT NOT NULL,
  answers TEXT[] NOT NULL,
  explanation_title TEXT,
  explanation_text TEXT,
  audio_url TEXT,
  
  -- Cyrillic Content
  question_cyrl TEXT,
  answers_cyrl TEXT[],
  explanation_title_cyrl TEXT,
  explanation_text_cyrl TEXT,
  audio_url_cyrl TEXT,
  
  correct_answer INTEGER NOT NULL,
  time_limit INTEGER NOT NULL DEFAULT 300,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets (Biletlar)
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket Tests (Relationship)
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

-- Site Content (Contacts, etc)
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

-- Statistics
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
  language TEXT NOT NULL DEFAULT 'uz-lat' CHECK (language IN ('uz-lat', 'uz-cyr')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. RLS POLICIES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read topics" ON topics FOR SELECT USING (true);
CREATE POLICY "Admin manage topics" ON topics FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tests" ON tests FOR SELECT USING (true);
CREATE POLICY "Admin manage tests" ON tests FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tickets" ON tickets FOR SELECT USING (true);
CREATE POLICY "Admin manage tickets" ON tickets FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE ticket_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read ticket_tests" ON ticket_tests FOR SELECT USING (true);
CREATE POLICY "Admin manage ticket_tests" ON ticket_tests FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own results" ON test_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own results" ON test_results FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site_content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Admin manage site_content" ON site_content FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE carousel_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read carousel_images" ON carousel_images FOR SELECT USING (true);
CREATE POLICY "Admin manage carousel_images" ON carousel_images FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE topic_statistics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read/write own topic_stats" ON topic_statistics FOR ALL USING (auth.uid() = user_id);

ALTER TABLE ticket_statistics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read/write own ticket_stats" ON ticket_statistics FOR ALL USING (auth.uid() = user_id);

ALTER TABLE exam_statistics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read/write own exam_stats" ON exam_statistics FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 5. BULK TOOLS (AUTOMATION)
-- ============================================

-- Function to divide all unassigned tests into tickets of X questions
CREATE OR REPLACE FUNCTION divide_tests_into_tickets(p_tests_per_ticket INTEGER DEFAULT 20)
RETURNS TEXT AS $$
DECLARE
    v_test_record RECORD;
    v_ticket_id UUID;
    v_ticket_counter INTEGER := 0;
    v_test_in_ticket_counter INTEGER := 0;
    v_ticket_title TEXT;
BEGIN
    -- This loops through all tests that are NOT currently assigned to any ticket
    FOR v_test_record IN (
        SELECT id FROM tests t
        WHERE NOT EXISTS (SELECT 1 FROM ticket_tests tt WHERE tt.test_id = t.id)
        ORDER BY created_at ASC
    ) LOOP
        -- Every time we hit the limit, start a new ticket
        IF v_test_in_ticket_counter % p_tests_per_ticket = 0 THEN
            v_ticket_counter := v_ticket_counter + 1;
            v_ticket_title := 'Bilet ' || v_ticket_counter;
            
            INSERT INTO tickets (title, is_public)
            VALUES (v_ticket_title, true)
            RETURNING id INTO v_ticket_id;
            
            v_test_in_ticket_counter := 0;
        END IF;
        
        -- Assign test to the current ticket
        INSERT INTO ticket_tests (ticket_id, test_id, order_index)
        VALUES (v_ticket_id, v_test_record.id, v_test_in_ticket_counter);
        
        v_test_in_ticket_counter := v_test_in_ticket_counter + 1;
    END LOOP;
    
    RETURN 'Processed and created ' || v_ticket_counter || ' new tickets.';
END;
$$ LANGUAGE plpgsql;

-- To run this: SELECT divide_tests_into_tickets(20);

-- ============================================
-- 6. TRIGGERS & STORAGE
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO storage.buckets (id, name, public) VALUES ('test-images', 'test-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('test-audio', 'test-audio', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Storage Access" ON storage.objects;
CREATE POLICY "Storage Select" ON storage.objects FOR SELECT USING (bucket_id IN ('test-images', 'test-audio'));
CREATE POLICY "Storage Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('test-images', 'test-audio') AND auth.role() = 'authenticated');
CREATE POLICY "Storage Update" ON storage.objects FOR UPDATE USING (bucket_id IN ('test-images', 'test-audio') AND auth.role() = 'authenticated');
CREATE POLICY "Storage Delete" ON storage.objects FOR DELETE USING (bucket_id IN ('test-images', 'test-audio') AND auth.role() = 'authenticated');

-- Default Contact Info
INSERT INTO site_content (type, content)
VALUES (
  'contact', 
  '{
    "phone": "+998 90 123 45 67",
    "telegram": "@sarvar_avtotest",
    "telegram_link": "https://t.me/sarvar_avtotest",
    "address": "Toshkent"
  }'::jsonb
) ON CONFLICT (type) DO NOTHING;

-- DONE
