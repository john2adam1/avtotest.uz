-- ==============================================================================
-- 2026 CONSOLIDATED PRODUCTION SCHEMA
-- ==============================================================================
-- This script merges the STABLE SCHEMA and HOTFIXES into a single source of truth.
-- It is idempotent and safe to run multiple times.
-- 
-- UPDATES:
-- 1. Flexible Answers: Min 2, Max unlimited.
-- 2. Correct Answer Validation: Must be within bounds of the answers array.
-- 3. Simplified Ticket Insertion: Removed concurrency locking (pg_advisory_xact_lock).
-- 4. Hardened RLS & Admin Logic Separation.
-- ==============================================================================

-- 1. EXTENSIONS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. HELPERS (SECURITY DEFINER)
-- ==============================================================================

-- Check if current user is admin
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Check if current user has premium access
CREATE OR REPLACE FUNCTION has_premium_access() 
RETURNS BOOLEAN AS $$
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

-- Update timestamp helper
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. TABLES
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
  
  -- Latin Content
  question TEXT NOT NULL,
  answers TEXT[] NOT NULL,
  explanation_text TEXT,
  audio_url TEXT,
  
  -- Cyrillic Content
  question_cyrl TEXT,
  answers_cyrl TEXT[],
  explanation_text_cyrl TEXT,
  audio_url_cyrl TEXT,
  
  correct_answer INTEGER NOT NULL, -- 0-based index
  time_limit INTEGER NOT NULL DEFAULT 300,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cleanup unused columns from tests
ALTER TABLE tests DROP COLUMN IF EXISTS explanation_title;
ALTER TABLE tests DROP COLUMN IF EXISTS explanation_title_cyrl;

-- Apply Flexible Answer Constraints
ALTER TABLE tests DROP CONSTRAINT IF EXISTS check_answers_count;
ALTER TABLE tests ADD CONSTRAINT check_answers_count CHECK (array_length(answers, 1) >= 2);

ALTER TABLE tests DROP CONSTRAINT IF EXISTS check_answers_cyrl_count;
ALTER TABLE tests ADD CONSTRAINT check_answers_cyrl_count CHECK (answers_cyrl IS NULL OR array_length(answers_cyrl, 1) >= 2);

ALTER TABLE tests DROP CONSTRAINT IF EXISTS check_correct_answer_bounds;
ALTER TABLE tests ADD CONSTRAINT check_correct_answer_bounds CHECK (correct_answer >= 0 AND correct_answer < array_length(answers, 1));

-- Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cleanup unused columns from tickets
ALTER TABLE tickets DROP COLUMN IF EXISTS description;

-- Ticket Tests (Relationship)
CREATE TABLE IF NOT EXISTS ticket_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ticket_id, test_id)
);

-- Apply Ticket Constraints
ALTER TABLE ticket_tests DROP CONSTRAINT IF EXISTS unique_ticket_order;
ALTER TABLE ticket_tests ADD CONSTRAINT unique_ticket_order UNIQUE (ticket_id, order_index);

-- Other Supporting Tables
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

CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carousel_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- 4. FUNCTIONAL LOGIC (TRIGGERS)
-- ==============================================================================

-- A. USER PROTECTION
CREATE OR REPLACE FUNCTION protect_critical_user_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF auth.role() = 'service_role' OR auth.uid() IS NULL THEN
        RETURN NEW;
    END IF;

    IF NOT is_admin() THEN
        IF NEW.role IS DISTINCT FROM OLD.role THEN
            RAISE EXCEPTION 'Unauthorized: Role change forbidden.';
        END IF;
        IF NEW.subscription_end IS DISTINCT FROM OLD.subscription_end THEN
            RAISE EXCEPTION 'Unauthorized: Subscription change forbidden.';
        END IF;
        IF NEW.trial_end IS DISTINCT FROM OLD.trial_end THEN
            RAISE EXCEPTION 'Unauthorized: Trial change forbidden.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_protect_user_fields ON users;
CREATE TRIGGER trigger_protect_user_fields
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION protect_critical_user_fields();

-- B. TICKET INSERTION (SIMPLIFIED - NO ADVISORY LOCKS)
CREATE OR REPLACE FUNCTION manage_ticket_insert()
RETURNS TRIGGER AS $$
DECLARE
    v_count INTEGER;
    v_next_index INTEGER;
BEGIN
    -- 1. Check Capacity (Strict 20-test limit)
    SELECT count(*) INTO v_count 
    FROM ticket_tests 
    WHERE ticket_id = NEW.ticket_id;

    IF v_count >= 20 THEN
        RAISE EXCEPTION 'Ticket overflow: Max 20 tests allowed per ticket.';
    END IF;

    -- 2. Auto-increment Order Index
    SELECT COALESCE(MAX(order_index), -1) + 1 INTO v_next_index
    FROM ticket_tests 
    WHERE ticket_id = NEW.ticket_id;

    NEW.order_index := v_next_index;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_manage_ticket_insert ON ticket_tests;
CREATE TRIGGER trigger_manage_ticket_insert
BEFORE INSERT ON ticket_tests
FOR EACH ROW
EXECUTE FUNCTION manage_ticket_insert();

-- C. UPDATED_AT TIMESTAMP
DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- D. AUTOMATIC TICKET CREATION (Assign new tests to tickets automatically)
DROP TRIGGER IF EXISTS trigger_auto_assign_test_to_ticket ON tests;
DROP FUNCTION IF EXISTS auto_assign_test_to_ticket();

CREATE OR REPLACE FUNCTION auto_assign_test_to_ticket()
RETURNS TRIGGER AS $$
DECLARE
    latest_ticket_id UUID;
    current_count INT;
    next_ticket_num INT;
BEGIN
    SELECT t.id, 
           (SELECT count(*) FROM ticket_tests tt WHERE tt.ticket_id = t.id) as test_count
    INTO latest_ticket_id, current_count
    FROM tickets t
    ORDER BY COALESCE(NULLIF(regexp_replace(t.title, '\D', '', 'g'), '')::INT, 0) DESC
    LIMIT 1;

    IF latest_ticket_id IS NULL OR current_count >= 20 THEN
        SELECT COALESCE(MAX(NULLIF(regexp_replace(title, '\D', '', 'g'), '')::INT), 0)
        INTO next_ticket_num
        FROM tickets;
        
        next_ticket_num := next_ticket_num + 1;
        
        INSERT INTO tickets (title, is_public)
        VALUES ('Bilet #' || next_ticket_num, FALSE)
        RETURNING id INTO latest_ticket_id;
        
        current_count := 0;
    END IF;

    INSERT INTO ticket_tests (ticket_id, test_id, order_index)
    VALUES (latest_ticket_id, NEW.id, current_count);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_auto_assign_test_to_ticket
AFTER INSERT ON tests
FOR EACH ROW
EXECUTE FUNCTION auto_assign_test_to_ticket();

-- E. MANUAL SYNC FUNCTION (Batch group unassigned tests)
DROP FUNCTION IF EXISTS divide_tests_into_tickets(INT);

CREATE OR REPLACE FUNCTION divide_tests_into_tickets(batch_size INT DEFAULT 20)
RETURNS VOID AS $$
DECLARE
    test_id_record RECORD;
    current_ticket_id UUID;
    current_batch_count INT := 0;
    ticket_num INT;
BEGIN
    SELECT COALESCE(MAX(NULLIF(regexp_replace(title, '\D', '', 'g'), '')::INT), 0) 
    INTO ticket_num 
    FROM tickets;
    
    FOR test_id_record IN 
        SELECT id FROM tests 
        WHERE id NOT IN (SELECT test_id FROM ticket_tests)
        ORDER BY created_at ASC
    LOOP
        IF current_batch_count = 0 THEN
            ticket_num := ticket_num + 1;
            INSERT INTO tickets (title, is_public) 
            VALUES ('Bilet #' || ticket_num, FALSE)
            RETURNING id INTO current_ticket_id;
        END IF;
        
        INSERT INTO ticket_tests (ticket_id, test_id)
        VALUES (current_ticket_id, test_id_record.id);
        
        current_batch_count := current_batch_count + 1;
        
        IF current_batch_count >= batch_size THEN
            current_batch_count := 0;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS POLICIES (HARDENED)
-- ==============================================================================

-- Admin-only logic: Ensure users don't see admin-only data or functionality paths.

-- USERS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Read users" ON users;
CREATE POLICY "Read users" ON users FOR SELECT USING (auth.uid() = id OR is_admin());

DROP POLICY IF EXISTS "Admin update users" ON users;
CREATE POLICY "Admin update users" ON users FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "User self update" ON users;
CREATE POLICY "User self update" ON users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "User insert own profile" ON users;
CREATE POLICY "User insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- TOPICS
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Read topics" ON topics;
CREATE POLICY "Read topics" ON topics FOR SELECT USING (is_public OR has_premium_access());

DROP POLICY IF EXISTS "Admin manage topics" ON topics;
CREATE POLICY "Admin manage topics" ON topics FOR ALL USING (is_admin());

-- TICKETS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Read tickets" ON tickets;
CREATE POLICY "Read tickets" ON tickets FOR SELECT USING (is_public OR has_premium_access());

DROP POLICY IF EXISTS "Admin manage tickets" ON tickets;
CREATE POLICY "Admin manage tickets" ON tickets FOR ALL USING (is_admin());

-- TICKET_TESTS
ALTER TABLE ticket_tests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Read ticket_tests" ON ticket_tests;
CREATE POLICY "Read ticket_tests" ON ticket_tests FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tickets t 
    WHERE t.id = ticket_tests.ticket_id 
    AND (t.is_public OR has_premium_access())
  )
);

DROP POLICY IF EXISTS "Admin manage ticket_tests" ON ticket_tests;
CREATE POLICY "Admin manage ticket_tests" ON ticket_tests FOR ALL USING (is_admin());

-- TESTS
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Read tests" ON tests;
CREATE POLICY "Read tests" ON tests FOR SELECT USING (
  has_premium_access()
  OR EXISTS (SELECT 1 FROM topics t WHERE t.id = tests.topic_id AND t.is_public)
  OR EXISTS (SELECT 1 FROM ticket_tests tt JOIN tickets t ON t.id = tt.ticket_id WHERE tt.test_id = tests.id AND t.is_public)
);

DROP POLICY IF EXISTS "Admin manage tests" ON tests;
CREATE POLICY "Admin manage tests" ON tests FOR ALL USING (is_admin());

-- STATS & RESULTS
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own results" ON test_results;
CREATE POLICY "Users manage own results" ON test_results FOR ALL USING (auth.uid() = user_id);

ALTER TABLE topic_statistics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own topic_stats" ON topic_statistics;
CREATE POLICY "Users manage own topic_stats" ON topic_statistics FOR ALL USING (auth.uid() = user_id);

ALTER TABLE ticket_statistics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own ticket_stats" ON ticket_statistics;
CREATE POLICY "Users manage own ticket_stats" ON ticket_statistics FOR ALL USING (auth.uid() = user_id);

ALTER TABLE exam_statistics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own exam_stats" ON exam_statistics;
CREATE POLICY "Users manage own exam_stats" ON exam_statistics FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own settings" ON user_settings;
CREATE POLICY "Users manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- CONTENT & CAROUSEL
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

-- 6. STORAGE
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('test-images', 'test-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('test-audio', 'test-audio', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Storage Select" ON storage.objects;
CREATE POLICY "Storage Select" ON storage.objects FOR SELECT USING (bucket_id IN ('test-images', 'test-audio'));

DROP POLICY IF EXISTS "Storage Insert" ON storage.objects;
CREATE POLICY "Storage Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('test-images', 'test-audio') AND is_admin());

DROP POLICY IF EXISTS "Storage Update" ON storage.objects;
CREATE POLICY "Storage Update" ON storage.objects FOR UPDATE USING (bucket_id IN ('test-images', 'test-audio') AND is_admin());

DROP POLICY IF EXISTS "Storage Delete" ON storage.objects;
CREATE POLICY "Storage Delete" ON storage.objects FOR DELETE USING (bucket_id IN ('test-images', 'test-audio') AND is_admin());

-- 7. SEED DATA
-- ==============================================================================
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
