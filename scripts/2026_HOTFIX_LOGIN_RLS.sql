-- ==============================================================================
-- 2026 HOTFIX: LOGIN & RLS SECURITY
-- ==============================================================================
-- Run this script to fix "Login and Auth Error" without resetting the whole schema.

-- 1. FIX: Allow users to insert their own profile (Critical for some registration flows)
DROP POLICY IF EXISTS "User insert own profile" ON users;
CREATE POLICY "User insert own profile" ON users FOR INSERT WITH CHECK (
  auth.uid() = id
);

-- 2. FIX: Prevent Function Hijacking & Recursion Risk
ALTER FUNCTION is_admin() SET search_path = public;
ALTER FUNCTION has_premium_access() SET search_path = public;

-- 3. FIX: Ensure Manage Ticket Trigger is Safe
CREATE OR REPLACE FUNCTION manage_ticket_insert()
RETURNS TRIGGER AS $$
DECLARE
    v_count INTEGER;
    v_next_index INTEGER;
    v_lock_key BIGINT;
BEGIN
    -- Serialize inserts for this specific ticket
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
    SELECT COALESCE(MAX(order_index), -1) + 1 INTO v_next_index
    FROM ticket_tests 
    WHERE ticket_id = NEW.ticket_id;

    NEW.order_index := v_next_index;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- DONE
