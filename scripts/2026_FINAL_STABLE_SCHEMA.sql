-- ==============================================================================
-- 2026 FINAL STABLE SCHEMA (CONSOLIDATED & HARDENED)
-- ==============================================================================
-- Run this script in the Supabase SQL Editor.
-- This is the SINGLE SOURCE OF TRUTH for the AvtoTest database schema.
-- 
-- FEATURES:
-- 1. Full Schema (Users, Topics, Tests, Tickets, Statistics).
-- 2. Stable Ticket Logic (Strict 20-test limit, no auto-reshuffling).
-- 3. Concurrency Safety (Explicit locking).
-- 4. HARDENED SECURITY:
--    - Prevent Role Escalation (Users cannot make themselves admin).
--    - Privacy (Public users cannot see other users' data).
--    - Content Access (Premium/Subscription enforcement).
-- ==============================================================================

-- 1. EXTENSIONS & HELPERS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper: Check if current user is admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Helper: Check if current user has premium access (Admin or Active Subscription/Trial)
CREATE OR REPLACE FUNCTION has_premium_access() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND (
        role = 'admin' 
        OR subscription_end > NOW() 
        OR trial_end > NOW()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
-- 2. TABLES
-- ==============================================================================

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
  is_public BOOLEAN NOT NULL DEFAULT FALSE, -- Premium by default
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
-- 3. SECURITY TRIGGERS (ROLE PROTECTION)
-- ============================================

-- Prevent users from escalating their privileges
CREATE OR REPLACE FUNCTION protect_critical_user_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- If the user is NOT an admin, they cannot change critical fields
    IF NOT is_admin() THEN
        IF NEW.role IS DISTINCT FROM OLD.role THEN
            RAISE EXCEPTION 'You are not authorized to change your role.';
        END IF;
        IF NEW.subscription_end IS DISTINCT FROM OLD.subscription_end THEN
            RAISE EXCEPTION 'You are not authorized to change your subscription status.';
        END IF;
        IF NEW.trial_end IS DISTINCT FROM OLD.trial_end THEN
            RAISE EXCEPTION 'You are not authorized to change your trial period.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_protect_user_fields ON users;
CREATE TRIGGER trigger_protect_user_fields
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION protect_critical_user_fields();

-- ============================================
-- 4. RLS POLICIES (HARDENED)
-- ============================================

-- USERS
-- Privacy: Users see only themselves. Admins see all.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read users" ON users;
DROP POLICY IF EXISTS "Read users" ON users;
CREATE POLICY "Read users" ON users FOR SELECT USING (
  auth.uid() = id OR is_admin()
);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
-- Split Update Policies
DROP POLICY IF EXISTS "Admin update users" ON users;
CREATE POLICY "Admin update users" ON users FOR UPDATE USING (
  is_admin()
);
DROP POLICY IF EXISTS "User self update" ON users;
CREATE POLICY "User self update" ON users FOR UPDATE USING (
  auth.uid() = id
);
DROP POLICY IF EXISTS "User insert own profile" ON users;
CREATE POLICY "User insert own profile" ON users FOR INSERT WITH CHECK (
  auth.uid() = id
);
-- Note: The `trigger_protect_user_fields` handles the column-level security for self-updates.

-- TOPICS
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read topics" ON topics;
DROP POLICY IF EXISTS "Read topics" ON topics;
CREATE POLICY "Read topics" ON topics FOR SELECT USING (
  is_public OR has_premium_access()
);
DROP POLICY IF EXISTS "Admin manage topics" ON topics;
CREATE POLICY "Admin manage topics" ON topics FOR ALL USING (
  is_admin()
);

-- TICKETS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read tickets" ON tickets;
DROP POLICY IF EXISTS "Read tickets" ON tickets;
CREATE POLICY "Read tickets" ON tickets FOR SELECT USING (
  is_public OR has_premium_access()
);
DROP POLICY IF EXISTS "Admin manage tickets" ON tickets;
CREATE POLICY "Admin manage tickets" ON tickets FOR ALL USING (
  is_admin()
);

-- TICKET_TESTS
-- Visible if the parent ticket is visible
ALTER TABLE ticket_tests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read ticket_tests" ON ticket_tests;
DROP POLICY IF EXISTS "Read ticket_tests" ON ticket_tests;
CREATE POLICY "Read ticket_tests" ON ticket_tests FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tickets t 
    WHERE t.id = ticket_tests.ticket_id 
    AND (t.is_public OR has_premium_access())
  )
);
DROP POLICY IF EXISTS "Admin manage ticket_tests" ON ticket_tests;
CREATE POLICY "Admin manage ticket_tests" ON ticket_tests FOR ALL USING (
  is_admin()
);

-- TESTS
-- Visible if (Admin) OR (Premium User) OR (Linked to Public Topic) OR (Linked to Public Ticket)
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read tests" ON tests;
DROP POLICY IF EXISTS "Read tests" ON tests;
CREATE POLICY "Read tests" ON tests FOR SELECT USING (
  -- 1. Premium users (Admins included) see everything
  has_premium_access()
  OR
  -- 2. Tests in Public Topics
  EXISTS (
    SELECT 1 FROM topics t 
    WHERE t.id = tests.topic_id 
    AND t.is_public
  )
  OR
  -- 3. Tests in Public Tickets
  EXISTS (
    SELECT 1 FROM ticket_tests tt
    JOIN tickets t ON t.id = tt.ticket_id
    WHERE tt.test_id = tests.id 
    AND t.is_public
  )
);
DROP POLICY IF EXISTS "Admin manage tests" ON tests;
CREATE POLICY "Admin manage tests" ON tests FOR ALL USING (
  is_admin()
);

-- RESULTS & STATS (User Private)
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own results" ON test_results;
CREATE POLICY "Users read own results" ON test_results FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users create own results" ON test_results;
CREATE POLICY "Users create own results" ON test_results FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE topic_statistics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read/write own topic_stats" ON topic_statistics;
CREATE POLICY "Users read/write own topic_stats" ON topic_statistics FOR ALL USING (auth.uid() = user_id);

ALTER TABLE ticket_statistics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read/write own ticket_stats" ON ticket_statistics;
CREATE POLICY "Users read/write own ticket_stats" ON ticket_statistics FOR ALL USING (auth.uid() = user_id);

ALTER TABLE exam_statistics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read/write own exam_stats" ON exam_statistics;
CREATE POLICY "Users read/write own exam_stats" ON exam_statistics FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own settings" ON user_settings;
CREATE POLICY "Users manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- CONTENT (Public Read / Admin Write)
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read site_content" ON site_content;
CREATE POLICY "Public read site_content" ON site_content FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage site_content" ON site_content;
CREATE POLICY "Admin manage site_content" ON site_content FOR ALL USING (is_admin());

ALTER TABLE carousel_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read carousel_images" ON carousel_images;
CREATE POLICY "Public read carousel_images" ON carousel_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage carousel_images" ON carousel_images;
CREATE POLICY "Admin manage carousel_images" ON carousel_images FOR ALL USING (is_admin());

-- ============================================
-- 5. TICKET LOGIC (STABLE & CONCURRENCY SAFE)
-- ============================================

-- A. CLEANUP OLD LOGIC
DROP TRIGGER IF EXISTS trigger_reorganize_tickets ON tests;
DROP FUNCTION IF EXISTS reorganize_tickets;
DROP TRIGGER IF EXISTS trigger_check_ticket_capacity ON ticket_tests;
DROP FUNCTION IF EXISTS check_ticket_capacity;
DROP TRIGGER IF EXISTS trigger_set_ticket_order_index ON ticket_tests;
DROP FUNCTION IF EXISTS set_ticket_order_index;

-- B. UNIQUE CONSTRAINT
-- Remove duplicates if any exist (keeping the one with smallest ID)
DELETE FROM ticket_tests a USING ticket_tests b
WHERE a.id > b.id 
AND a.ticket_id = b.ticket_id 
AND a.order_index = b.order_index;

ALTER TABLE ticket_tests DROP CONSTRAINT IF EXISTS unique_ticket_order;
ALTER TABLE ticket_tests ADD CONSTRAINT unique_ticket_order UNIQUE (ticket_id, order_index);

-- C. MANAGE TICKET INSERT (LOCKING TRIGGER)
CREATE OR REPLACE FUNCTION manage_ticket_insert()
RETURNS TRIGGER AS $$
DECLARE
    v_count INTEGER;
    v_next_index INTEGER;
    v_lock_key BIGINT;
BEGIN
    -- Serialize inserts for this specific ticket
    -- FIX: Type Safety - Explicitly cast hashtext result to BIGINT
    v_lock_key := hashtext(NEW.ticket_id::text)::bigint;
    PERFORM pg_advisory_xact_lock(v_lock_key);

    -- 1. Check Capacity
    SELECT count(*) INTO v_count 
    FROM ticket_tests 
    WHERE ticket_id = NEW.ticket_id;

    IF v_count >= 20 THEN
        RAISE EXCEPTION 'Ticket is full (Max 20 tests). Please select another ticket.';
    END IF;

    -- 2. Assign Order Index
    -- Use COALESCE(MAX, -1) + 1 for 0-based indexing (0..19)
    SELECT COALESCE(MAX(order_index), -1) + 1 INTO v_next_index
    FROM ticket_tests 
    WHERE ticket_id = NEW.ticket_id;

    NEW.order_index := v_next_index;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_manage_ticket_insert ON ticket_tests;
CREATE TRIGGER trigger_manage_ticket_insert
BEFORE INSERT ON ticket_tests
FOR EACH ROW
EXECUTE FUNCTION manage_ticket_insert();

-- ============================================
-- 6. OTHER TRIGGERS & STORAGE
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('test-images', 'test-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('test-audio', 'test-audio', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Storage Select" ON storage.objects;
DROP POLICY IF EXISTS "Storage Insert" ON storage.objects;
DROP POLICY IF EXISTS "Storage Update" ON storage.objects;
DROP POLICY IF EXISTS "Storage Delete" ON storage.objects;

CREATE POLICY "Storage Select" ON storage.objects FOR SELECT USING (bucket_id IN ('test-images', 'test-audio'));
CREATE POLICY "Storage Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('test-images', 'test-audio') AND is_admin());
CREATE POLICY "Storage Update" ON storage.objects FOR UPDATE USING (bucket_id IN ('test-images', 'test-audio') AND is_admin());
CREATE POLICY "Storage Delete" ON storage.objects FOR DELETE USING (bucket_id IN ('test-images', 'test-audio') AND is_admin());

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
