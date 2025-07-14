/*
  # Add SuperUser System

  1. New Tables
    - `user_profiles` - Extended user information including SuperUser status
    - `admin_quotes` - Manual quotes created by admins for SuperUsers

  2. Changes
    - Add SuperUser functionality
    - Add manual quote creation system
    - Add admin quote management

  3. Security
    - Enable RLS on new tables
    - Add policies for SuperUser access
    - Add policies for admin quote management
*/

-- Create user profiles table for SuperUser status
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_super_user boolean DEFAULT false,
  super_user_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create admin quotes table for manual quotes
CREATE TABLE IF NOT EXISTS admin_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL REFERENCES auth.users(id),
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
  admin_notes text,
  special_rate_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_quotes ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles"
  ON user_profiles FOR ALL
  TO authenticated
  USING (
    auth.email() LIKE '%@liquidcurrent.com' OR
    auth.email() LIKE '%@liquidcurrent.co.za'
  );

-- Policies for admin_quotes
CREATE POLICY "Users can view their own admin quotes"
  ON admin_quotes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own admin quotes"
  ON admin_quotes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all admin quotes"
  ON admin_quotes FOR ALL
  TO authenticated
  USING (
    auth.email() LIKE '%@liquidcurrent.com' OR
    auth.email() LIKE '%@liquidcurrent.co.za'
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_super_user ON user_profiles(is_super_user);
CREATE INDEX IF NOT EXISTS idx_admin_quotes_user_id ON admin_quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_quotes_admin_id ON admin_quotes(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_quotes_status ON admin_quotes(status);