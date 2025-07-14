/*
  # Create trading limits table

  1. New Tables
    - `trading_limits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `currency` (text, currency code)
      - `daily_limit` (numeric, daily trading limit)
      - `monthly_limit` (numeric, monthly trading limit)
      - `daily_used` (numeric, amount used today)
      - `monthly_used` (numeric, amount used this month)
      - `last_reset_daily` (timestamp, last daily reset)
      - `last_reset_monthly` (timestamp, last monthly reset)
      - `is_active` (boolean, whether limit is active)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `trading_limits` table
    - Add policies for admins to manage all limits
    - Add policies for users to view their own limits

  3. Indexes
    - Index on user_id for efficient queries
    - Index on currency for filtering
    - Index on is_active for status filtering
*/

CREATE TABLE IF NOT EXISTS trading_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  currency text NOT NULL,
  daily_limit numeric(20,8) NOT NULL DEFAULT 0,
  monthly_limit numeric(20,8) NOT NULL DEFAULT 0,
  daily_used numeric(20,8) NOT NULL DEFAULT 0,
  monthly_used numeric(20,8) NOT NULL DEFAULT 0,
  last_reset_daily timestamptz DEFAULT now(),
  last_reset_monthly timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trading_limits_user_id ON trading_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_limits_currency ON trading_limits(currency);
CREATE INDEX IF NOT EXISTS idx_trading_limits_active ON trading_limits(is_active);
CREATE INDEX IF NOT EXISTS idx_trading_limits_user_currency ON trading_limits(user_id, currency);

-- Enable RLS
ALTER TABLE trading_limits ENABLE ROW LEVEL SECURITY;

-- Policies for admins (liquidcurrent.com and liquidcurrent.co.za emails)
CREATE POLICY "Admins can manage all trading limits"
  ON trading_limits
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'email')::text LIKE '%@liquidcurrent.com' OR
    (auth.jwt() ->> 'email')::text LIKE '%@liquidcurrent.co.za'
  );

-- Policy for users to view their own limits
CREATE POLICY "Users can view their own trading limits"
  ON trading_limits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add constraint to ensure positive limits
ALTER TABLE trading_limits ADD CONSTRAINT trading_limits_positive_limits 
  CHECK (daily_limit >= 0 AND monthly_limit >= 0 AND daily_used >= 0 AND monthly_used >= 0);

-- Add unique constraint to prevent duplicate limits for same user/currency
ALTER TABLE trading_limits ADD CONSTRAINT trading_limits_user_currency_unique 
  UNIQUE (user_id, currency);