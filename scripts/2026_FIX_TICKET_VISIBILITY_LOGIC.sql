-- ==============================================================================
-- 2026 FIX TICKET VISIBILITY LOGIC
-- ==============================================================================
-- This script updates the reorganize_tickets function to set new tickets 
-- to Premium (is_public = false) by default.
-- ==============================================================================

CREATE OR REPLACE FUNCTION reorganize_tickets()
RETURNS TRIGGER AS $$
DECLARE
    v_test_record RECORD;
    v_ticket_id UUID;
    v_ticket_counter INTEGER := 0;
    v_test_in_ticket_counter INTEGER := 0;
    v_total_tests INTEGER;
    v_target_tickets INTEGER;
BEGIN
    -- 1. Calculate how many tickets we need
    SELECT count(*) INTO v_total_tests FROM tests;
    v_target_tickets := ceil(v_total_tests::float / 20);

    -- 2. Create or sync tickets count
    -- Delete excess tickets
    DELETE FROM tickets 
    WHERE id NOT IN (
        SELECT id FROM tickets 
        ORDER BY created_at ASC 
        LIMIT v_target_tickets
    );

    -- Add missing tickets (Set to Premium by default)
    WHILE (SELECT count(*) FROM tickets) < v_target_tickets LOOP
        INSERT INTO tickets (title, is_public)
        VALUES ('Bilet ' || ((SELECT count(*) FROM tickets) + 1), false);
    END LOOP;

    -- 3. Clear all assignments (re-shuffle)
    DELETE FROM ticket_tests;

    -- 4. Re-assign tests sequentially
    FOR v_test_record IN (
        SELECT id FROM tests ORDER BY created_at ASC
    ) LOOP
        -- Every 20 tests, move to next ticket
        IF v_test_in_ticket_counter % 20 = 0 THEN
            v_ticket_counter := v_ticket_counter + 1;
            SELECT id INTO v_ticket_id FROM tickets ORDER BY created_at ASC OFFSET (v_ticket_counter - 1) LIMIT 1;
        END IF;
        
        -- Assign test to the current ticket
        INSERT INTO ticket_tests (ticket_id, test_id, order_index)
        VALUES (v_ticket_id, v_test_record.id, v_test_in_ticket_counter % 20);
        
        v_test_in_ticket_counter := v_test_in_ticket_counter + 1;
    END LOOP;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
