-- Add category column to tests table
ALTER TABLE tests ADD COLUMN IF NOT EXISTS category TEXT;
