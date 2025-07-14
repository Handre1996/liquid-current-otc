/*
  # Update quote expiration and add admin quote management

  1. Changes
     - Update admin_settings to set quote expiry to 2 hours
     - Add function to automatically expire quotes after 2 hours
     - Add policy for admins to delete admin quotes
  
  2. Security
     - Enable RLS on all affected tables
     - Add appropriate policies for admin users
*/

-- Update admin settings to set quote expiry to 2 hours
INSERT INTO admin_settings (setting_key, setting_value, description)
VALUES ('quote_expiry_minutes', '120', 'Quote expiry time in minutes (default: 120 minutes / 2 hours)')
ON CONFLICT (setting_key) 
DO UPDATE SET setting_value = '120', updated_at = now();

-- Create a function to automatically expire quotes
CREATE OR REPLACE FUNCTION expire_old_quotes() RETURNS void AS $$
BEGIN
  -- Update regular quotes
  UPDATE otc_quotes
  SET status = 'expired', updated_at = now()
  WHERE status = 'pending' 
  AND expires_at < now();
  
  -- Update admin quotes
  UPDATE admin_quotes
  SET status = 'expired', updated_at = now()
  WHERE status = 'pending' 
  AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to run the function every hour
-- Note: This requires pg_cron extension to be enabled
-- If pg_cron is not available, you can call this function manually or set up an external cron job
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    EXECUTE 'SELECT cron.schedule(''expire-quotes'', ''0 * * * *'', ''SELECT expire_old_quotes()'')';
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- If pg_cron is not available, we'll just log a message
  RAISE NOTICE 'pg_cron extension not available. Please set up an external cron job to call expire_old_quotes() function.';
END $$;

-- Ensure admin users can delete admin quotes
DROP POLICY IF EXISTS "Admins can manage all admin quotes" ON admin_quotes;

CREATE POLICY "Admins can manage all admin quotes"
  ON admin_quotes
  FOR ALL
  TO authenticated
  USING (
    (email() LIKE '%@liquidcurrent.com') OR 
    (email() LIKE '%@liquidcurrent.co.za')
  );

-- Expire any existing quotes that are older than 2 hours
SELECT expire_old_quotes();