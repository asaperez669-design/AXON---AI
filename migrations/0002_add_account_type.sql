-- Add account_type field to territory_plans table
ALTER TABLE territory_plans ADD COLUMN account_type TEXT DEFAULT 'growth';

-- Update existing records to have proper account types
UPDATE territory_plans SET account_type = 'growth' WHERE account_type IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_territory_plans_account_type ON territory_plans(account_type);
