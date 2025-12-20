-- Add is_visible column to categories table
ALTER TABLE categories 
ADD COLUMN is_visible BOOLEAN DEFAULT TRUE;

-- Update existing records to be visible by default
UPDATE categories SET is_visible = TRUE WHERE is_visible IS NULL;
