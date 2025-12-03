-- Add BANT and Risk fields to account_notes table
-- Migration: 0004_add_bant_and_risk.sql

-- Add BANT fields (Budget, Authority, Need, Timeline)
ALTER TABLE account_notes ADD COLUMN budget TEXT;
ALTER TABLE account_notes ADD COLUMN authority TEXT;
ALTER TABLE account_notes ADD COLUMN need TEXT;
ALTER TABLE account_notes ADD COLUMN timeline TEXT;

-- Add Risk field
ALTER TABLE account_notes ADD COLUMN risk TEXT;
ALTER TABLE account_notes ADD COLUMN risk_level TEXT CHECK(risk_level IN ('low', 'medium', 'high'));
