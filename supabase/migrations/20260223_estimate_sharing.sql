-- ============================================================
-- Estimate Sharing: share_token + shared_at columns
-- Allows sharing estimates publicly via a unique token link
-- ============================================================

-- Add share_token and shared_at to estimates
ALTER TABLE estimates
  ADD COLUMN IF NOT EXISTS share_token UUID UNIQUE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS shared_at TIMESTAMPTZ DEFAULT NULL;

-- Index for fast lookups by share_token
CREATE INDEX IF NOT EXISTS idx_estimates_share_token
  ON estimates(share_token) WHERE share_token IS NOT NULL;
