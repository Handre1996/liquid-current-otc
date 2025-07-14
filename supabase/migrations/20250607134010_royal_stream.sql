/*
  # OTC Desk Schema Migration

  1. New Tables
    - `currencies` - Supported currencies (crypto and fiat)
    - `exchange_rates` - Current exchange rates with admin markup
    - `bank_accounts` - Client bank account details
    - `crypto_wallets` - Client crypto wallet details
    - `otc_quotes` - Trading quotes generated for clients
    - `otc_orders` - Actual trading orders
    - `transactions` - Transaction records
    - `admin_settings` - Admin configuration for fees and markups

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies for client and admin access

  3. Features
    - Support for multiple currencies
    - Dynamic pricing with admin markup
    - Bank account and wallet management
    - Quote generation and order processing
    - Transaction tracking
*/

-- Create currencies table
CREATE TABLE IF NOT EXISTS currencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('crypto', 'fiat')),
  symbol text,
  decimals integer DEFAULT 8,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create exchange rates table
CREATE TABLE IF NOT EXISTS exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency text NOT NULL,
  to_currency text NOT NULL,
  base_rate decimal(20,8) NOT NULL,
  buy_markup decimal(5,4) DEFAULT 0.02, -- 2% default markup
  sell_markup decimal(5,4) DEFAULT 0.02,
  final_buy_rate decimal(20,8) NOT NULL,
  final_sell_rate decimal(20,8) NOT NULL,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(from_currency, to_currency)
);

-- Create bank accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_holder_name text NOT NULL,
  bank_name text NOT NULL,
  account_number text NOT NULL,
  branch_code text,
  account_type text NOT NULL CHECK (account_type IN ('savings', 'current', 'transmission')),
  currency text NOT NULL DEFAULT 'ZAR',
  is_verified boolean DEFAULT false,
  proof_document_path text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create crypto wallets table
CREATE TABLE IF NOT EXISTS crypto_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  currency text NOT NULL,
  wallet_address text NOT NULL,
  wallet_type text NOT NULL CHECK (wallet_type IN ('exchange', 'personal')),
  exchange_name text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create OTC quotes table
CREATE TABLE IF NOT EXISTS otc_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quote_type text NOT NULL CHECK (quote_type IN ('buy', 'sell')),
  from_currency text NOT NULL,
  to_currency text NOT NULL,
  from_amount decimal(20,8) NOT NULL,
  to_amount decimal(20,8) NOT NULL,
  exchange_rate decimal(20,8) NOT NULL,
  admin_fee decimal(20,8) DEFAULT 0,
  withdrawal_fee decimal(20,8) DEFAULT 0,
  total_fee decimal(20,8) DEFAULT 0,
  net_amount decimal(20,8) NOT NULL,
  expires_at timestamptz NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create OTC orders table
CREATE TABLE IF NOT EXISTS otc_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quote_id uuid NOT NULL REFERENCES otc_quotes(id) ON DELETE CASCADE,
  order_type text NOT NULL CHECK (order_type IN ('buy', 'sell')),
  from_currency text NOT NULL,
  to_currency text NOT NULL,
  from_amount decimal(20,8) NOT NULL,
  to_amount decimal(20,8) NOT NULL,
  exchange_rate decimal(20,8) NOT NULL,
  total_fee decimal(20,8) NOT NULL,
  net_amount decimal(20,8) NOT NULL,
  bank_account_id uuid REFERENCES bank_accounts(id),
  crypto_wallet_id uuid REFERENCES crypto_wallets(id),
  payment_proof_path text,
  transaction_id text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'payment_pending', 'payment_confirmed', 'processing', 'completed', 'cancelled', 'failed')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES otc_orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'exchange')),
  currency text NOT NULL,
  amount decimal(20,8) NOT NULL,
  fee decimal(20,8) DEFAULT 0,
  net_amount decimal(20,8) NOT NULL,
  transaction_hash text,
  bank_reference text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE otc_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE otc_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for currencies (public read, admin write)
CREATE POLICY "Anyone can view active currencies"
  ON currencies FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage currencies"
  ON currencies FOR ALL
  TO authenticated
  USING (
    auth.email() LIKE '%@liquidcurrent.com' OR
    auth.email() LIKE '%@liquidcurrent.co.za'
  );

-- Create policies for exchange rates (public read, admin write)
CREATE POLICY "Anyone can view exchange rates"
  ON exchange_rates FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage exchange rates"
  ON exchange_rates FOR ALL
  TO authenticated
  USING (
    auth.email() LIKE '%@liquidcurrent.com' OR
    auth.email() LIKE '%@liquidcurrent.co.za'
  );

-- Create policies for bank accounts
CREATE POLICY "Users can manage their own bank accounts"
  ON bank_accounts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bank accounts"
  ON bank_accounts FOR SELECT
  TO authenticated
  USING (
    auth.email() LIKE '%@liquidcurrent.com' OR
    auth.email() LIKE '%@liquidcurrent.co.za'
  );

-- Create policies for crypto wallets
CREATE POLICY "Users can manage their own crypto wallets"
  ON crypto_wallets FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all crypto wallets"
  ON crypto_wallets FOR SELECT
  TO authenticated
  USING (
    auth.email() LIKE '%@liquidcurrent.com' OR
    auth.email() LIKE '%@liquidcurrent.co.za'
  );

-- Create policies for OTC quotes
CREATE POLICY "Users can manage their own quotes"
  ON otc_quotes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all quotes"
  ON otc_quotes FOR SELECT
  TO authenticated
  USING (
    auth.email() LIKE '%@liquidcurrent.com' OR
    auth.email() LIKE '%@liquidcurrent.co.za'
  );

-- Create policies for OTC orders
CREATE POLICY "Users can manage their own orders"
  ON otc_orders FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders"
  ON otc_orders FOR ALL
  TO authenticated
  USING (
    auth.email() LIKE '%@liquidcurrent.com' OR
    auth.email() LIKE '%@liquidcurrent.co.za'
  );

-- Create policies for transactions
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all transactions"
  ON transactions FOR ALL
  TO authenticated
  USING (
    auth.email() LIKE '%@liquidcurrent.com' OR
    auth.email() LIKE '%@liquidcurrent.co.za'
  );

-- Create policies for admin settings
CREATE POLICY "Admins can manage settings"
  ON admin_settings FOR ALL
  TO authenticated
  USING (
    auth.email() LIKE '%@liquidcurrent.com' OR
    auth.email() LIKE '%@liquidcurrent.co.za'
  );

-- Insert default currencies
INSERT INTO currencies (code, name, type, symbol, decimals) VALUES
('BTC', 'Bitcoin', 'crypto', '₿', 8),
('ETH', 'Ethereum', 'crypto', 'Ξ', 18),
('USDT', 'Tether', 'crypto', '₮', 6),
('USDC', 'USD Coin', 'crypto', '$', 6),
('LTC', 'Litecoin', 'crypto', 'Ł', 8),
('XRP', 'Ripple', 'crypto', 'XRP', 6),
('ADA', 'Cardano', 'crypto', '₳', 6),
('DOT', 'Polkadot', 'crypto', 'DOT', 10),
('LINK', 'Chainlink', 'crypto', 'LINK', 18),
('SOL', 'Solana', 'crypto', 'SOL', 9),
('ZAR', 'South African Rand', 'fiat', 'R', 2),
('NAD', 'Namibian Dollar', 'fiat', 'N$', 2);

-- Insert default admin settings
INSERT INTO admin_settings (setting_key, setting_value, description) VALUES
('default_buy_markup', '0.02', 'Default buy markup percentage (2%)'),
('default_sell_markup', '0.02', 'Default sell markup percentage (2%)'),
('admin_fee_percentage', '0.005', 'Admin fee percentage (0.5%)'),
('withdrawal_fee_zar', '50', 'Withdrawal fee for ZAR'),
('withdrawal_fee_nad', '50', 'Withdrawal fee for NAD'),
('quote_expiry_minutes', '15', 'Quote expiry time in minutes'),
('min_trade_amount_zar', '1000', 'Minimum trade amount in ZAR'),
('max_trade_amount_zar', '1000000', 'Maximum trade amount in ZAR');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies ON exchange_rates(from_currency, to_currency);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_user_id ON crypto_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_otc_quotes_user_id ON otc_quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_otc_quotes_status ON otc_quotes(status);
CREATE INDEX IF NOT EXISTS idx_otc_orders_user_id ON otc_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_otc_orders_status ON otc_orders(status);
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);