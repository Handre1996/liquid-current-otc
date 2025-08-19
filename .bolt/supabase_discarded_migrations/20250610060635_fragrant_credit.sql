/*
  # Enhanced Trading Platform Features

  1. New Tables
    - `price_alerts` - User price alerts for currency pairs
    - `trading_fees` - Dynamic fee structure based on user tiers
    - `referral_system` - Referral program for users
    - `api_keys` - API access for institutional users
    - `market_data` - Historical market data tracking
    - `withdrawal_requests` - Withdrawal request management

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies for user access control
    - Admin policies for management access

  3. Features
    - Tiered fee structure (standard, premium, vip, institutional)
    - Price alert system with notifications
    - Referral tracking and rewards
    - API key management for institutional access
    - Market data storage for analytics
    - Withdrawal request workflow
</parameter>

-- Create price alerts table
CREATE TABLE IF NOT EXISTS price_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  currency_pair text NOT NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('above', 'below')),
  target_price numeric(20,8) NOT NULL,
  current_price numeric(20,8),
  is_active boolean DEFAULT true,
  triggered_at timestamptz,
  notification_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trading fees table for dynamic fee structure
CREATE TABLE IF NOT EXISTS trading_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_tier text DEFAULT 'standard' CHECK (user_tier IN ('standard', 'premium', 'vip', 'institutional')),
  currency_type text NOT NULL CHECK (currency_type IN ('crypto', 'fiat')),
  transaction_type text NOT NULL CHECK (transaction_type IN ('buy', 'sell', 'swap')),
  volume_min numeric(20,8) DEFAULT 0,
  volume_max numeric(20,8),
  fee_percentage numeric(5,4) NOT NULL,
  fixed_fee numeric(20,8) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create referral system table
CREATE TABLE IF NOT EXISTS referral_system (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  reward_percentage numeric(5,4) DEFAULT 0.001,
  total_earned numeric(20,8) DEFAULT 0,
  last_reward_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(referrer_id, referee_id)
);

-- Create API keys table for institutional access
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_name text NOT NULL,
  api_key text UNIQUE NOT NULL,
  api_secret text NOT NULL,
  permissions jsonb DEFAULT '{"read": true, "trade": false, "withdraw": false}',
  ip_whitelist text[],
  is_active boolean DEFAULT true,
  last_used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create market data table for historical tracking
CREATE TABLE IF NOT EXISTS market_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  currency_pair text NOT NULL,
  price numeric(20,8) NOT NULL,
  volume_24h numeric(20,8),
  change_24h numeric(10,4),
  high_24h numeric(20,8),
  low_24h numeric(20,8),
  market_cap numeric(20,2),
  data_source text DEFAULT 'coingecko',
  recorded_at timestamptz DEFAULT now()
);

-- Create withdrawal requests table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES otc_orders(id) ON DELETE SET NULL,
  currency text NOT NULL,
  amount numeric(20,8) NOT NULL,
  destination_type text NOT NULL CHECK (destination_type IN ('bank_account', 'crypto_wallet')),
  destination_id uuid,
  withdrawal_fee numeric(20,8) DEFAULT 0,
  net_amount numeric(20,8) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected', 'cancelled')),
  admin_notes text,
  processed_by uuid REFERENCES auth.users(id),
  processed_at timestamptz,
  transaction_hash text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_system ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Price alerts policies
CREATE POLICY "Users can manage their own price alerts"
  ON price_alerts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all price alerts"
  ON price_alerts
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') LIKE '%@liquidcurrent.com' OR 
    (auth.jwt() ->> 'email') LIKE '%@liquidcurrent.co.za'
  );

-- Trading fees policies
CREATE POLICY "Anyone can view trading fees"
  ON trading_fees
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage trading fees"
  ON trading_fees
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') LIKE '%@liquidcurrent.com' OR 
    (auth.jwt() ->> 'email') LIKE '%@liquidcurrent.co.za'
  );

-- Referral system policies
CREATE POLICY "Users can view their referral data"
  ON referral_system
  FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "Users can create referrals"
  ON referral_system
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Admins can manage all referrals"
  ON referral_system
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') LIKE '%@liquidcurrent.com' OR 
    (auth.jwt() ->> 'email') LIKE '%@liquidcurrent.co.za'
  );

-- API keys policies
CREATE POLICY "Users can manage their own API keys"
  ON api_keys
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all API keys"
  ON api_keys
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') LIKE '%@liquidcurrent.com' OR 
    (auth.jwt() ->> 'email') LIKE '%@liquidcurrent.co.za'
  );

-- Market data policies
CREATE POLICY "Anyone can view market data"
  ON market_data
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage market data"
  ON market_data
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') LIKE '%@liquidcurrent.com' OR 
    (auth.jwt() ->> 'email') LIKE '%@liquidcurrent.co.za'
  );

-- Withdrawal requests policies
CREATE POLICY "Users can manage their own withdrawal requests"
  ON withdrawal_requests
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all withdrawal requests"
  ON withdrawal_requests
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') LIKE '%@liquidcurrent.com' OR 
    (auth.jwt() ->> 'email') LIKE '%@liquidcurrent.co.za'
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON price_alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_price_alerts_currency_pair ON price_alerts(currency_pair);

CREATE INDEX IF NOT EXISTS idx_trading_fees_tier_type ON trading_fees(user_tier, currency_type, transaction_type);
CREATE INDEX IF NOT EXISTS idx_trading_fees_active ON trading_fees(is_active);

CREATE INDEX IF NOT EXISTS idx_referral_system_referrer ON referral_system(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_system_referee ON referral_system(referee_id);
CREATE INDEX IF NOT EXISTS idx_referral_system_code ON referral_system(referral_code);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(api_key);

CREATE INDEX IF NOT EXISTS idx_market_data_pair_time ON market_data(currency_pair, recorded_at);
CREATE INDEX IF NOT EXISTS idx_market_data_recorded_at ON market_data(recorded_at);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON withdrawal_requests(created_at);

-- Insert default trading fees
INSERT INTO trading_fees (user_tier, currency_type, transaction_type, volume_min, volume_max, fee_percentage, fixed_fee) VALUES
-- Standard tier
('standard', 'crypto', 'buy', 0, 10000, 0.0050, 0),
('standard', 'crypto', 'sell', 0, 10000, 0.0050, 0),
('standard', 'crypto', 'swap', 0, 10000, 0.0030, 0),
('standard', 'fiat', 'buy', 0, 50000, 0.0050, 50),
('standard', 'fiat', 'sell', 0, 50000, 0.0050, 50),

-- Premium tier (lower fees for higher volumes)
('premium', 'crypto', 'buy', 10000, 100000, 0.0040, 0),
('premium', 'crypto', 'sell', 10000, 100000, 0.0040, 0),
('premium', 'crypto', 'swap', 10000, 100000, 0.0025, 0),
('premium', 'fiat', 'buy', 50000, 500000, 0.0040, 25),
('premium', 'fiat', 'sell', 50000, 500000, 0.0040, 25),

-- VIP tier (lowest fees for highest volumes)
('vip', 'crypto', 'buy', 100000, NULL, 0.0025, 0),
('vip', 'crypto', 'sell', 100000, NULL, 0.0025, 0),
('vip', 'crypto', 'swap', 100000, NULL, 0.0015, 0),
('vip', 'fiat', 'buy', 500000, NULL, 0.0025, 0),
('vip', 'fiat', 'sell', 500000, NULL, 0.0025, 0),

-- Institutional tier (custom rates)
('institutional', 'crypto', 'buy', 0, NULL, 0.0015, 0),
('institutional', 'crypto', 'sell', 0, NULL, 0.0015, 0),
('institutional', 'crypto', 'swap', 0, NULL, 0.0010, 0),
('institutional', 'fiat', 'buy', 0, NULL, 0.0015, 0),
('institutional', 'fiat', 'sell', 0, NULL, 0.0015, 0)
ON CONFLICT DO NOTHING;