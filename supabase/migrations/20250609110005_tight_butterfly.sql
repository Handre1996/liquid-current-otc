/*
  # Add Audit Logging System

  1. New Tables
    - `audit_logs` - Track all important system actions
    - `user_sessions` - Track user login sessions
    - `system_notifications` - Internal notifications for admins
    
  2. Security
    - Enable RLS on all new tables
    - Add policies for admin access
    
  3. Features
    - Comprehensive audit trail
    - Session management
    - System notifications
*/

-- Create audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create user sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  ip_address inet,
  user_agent text,
  location_country text,
  location_city text,
  is_active boolean DEFAULT true,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create system notifications table
CREATE TABLE IF NOT EXISTS system_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  severity text DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  related_table text,
  related_id uuid,
  is_read boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create compliance reports table
CREATE TABLE IF NOT EXISTS compliance_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type text NOT NULL,
  report_period_start timestamptz NOT NULL,
  report_period_end timestamptz NOT NULL,
  generated_by uuid NOT NULL REFERENCES auth.users(id),
  file_path text,
  status text DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create trading limits table
CREATE TABLE IF NOT EXISTS trading_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  currency text NOT NULL,
  daily_limit numeric(20,8) DEFAULT 0,
  monthly_limit numeric(20,8) DEFAULT 0,
  daily_used numeric(20,8) DEFAULT 0,
  monthly_used numeric(20,8) DEFAULT 0,
  last_reset_daily timestamptz DEFAULT now(),
  last_reset_monthly timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, currency)
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_limits ENABLE ROW LEVEL SECURITY;

-- Audit logs policies
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    (jwt() ->> 'email') LIKE '%@liquidcurrent.com' OR 
    (jwt() ->> 'email') LIKE '%@liquidcurrent.co.za'
  );

-- User sessions policies
CREATE POLICY "Users can view their own sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (uid() = user_id);

CREATE POLICY "Admins can view all sessions"
  ON user_sessions
  FOR ALL
  TO authenticated
  USING (
    (jwt() ->> 'email') LIKE '%@liquidcurrent.com' OR 
    (jwt() ->> 'email') LIKE '%@liquidcurrent.co.za'
  );

-- System notifications policies
CREATE POLICY "Admins can manage notifications"
  ON system_notifications
  FOR ALL
  TO authenticated
  USING (
    (jwt() ->> 'email') LIKE '%@liquidcurrent.com' OR 
    (jwt() ->> 'email') LIKE '%@liquidcurrent.co.za'
  );

-- Compliance reports policies
CREATE POLICY "Admins can manage compliance reports"
  ON compliance_reports
  FOR ALL
  TO authenticated
  USING (
    (jwt() ->> 'email') LIKE '%@liquidcurrent.com' OR 
    (jwt() ->> 'email') LIKE '%@liquidcurrent.co.za'
  );

-- Trading limits policies
CREATE POLICY "Users can view their own limits"
  ON trading_limits
  FOR SELECT
  TO authenticated
  USING (uid() = user_id);

CREATE POLICY "Admins can manage all limits"
  ON trading_limits
  FOR ALL
  TO authenticated
  USING (
    (jwt() ->> 'email') LIKE '%@liquidcurrent.com' OR 
    (jwt() ->> 'email') LIKE '%@liquidcurrent.co.za'
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs(action_type);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_system_notifications_type ON system_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_system_notifications_read ON system_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_system_notifications_created_at ON system_notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_trading_limits_user_currency ON trading_limits(user_id, currency);
CREATE INDEX IF NOT EXISTS idx_trading_limits_active ON trading_limits(is_active);

-- Create function to automatically create trading limits for new users
CREATE OR REPLACE FUNCTION create_default_trading_limits()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default limits for major currencies
  INSERT INTO trading_limits (user_id, currency, daily_limit, monthly_limit)
  VALUES 
    (NEW.id, 'ZAR', 50000, 500000),
    (NEW.id, 'NAD', 50000, 500000),
    (NEW.id, 'BTC', 1, 10),
    (NEW.id, 'ETH', 10, 100),
    (NEW.id, 'USDT', 10000, 100000),
    (NEW.id, 'USDC', 10000, 100000)
  ON CONFLICT (user_id, currency) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create trading limits
CREATE TRIGGER create_user_trading_limits
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_trading_limits();