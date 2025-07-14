/*
  # Fix Exchange Rates Policies

  1. Changes
     - Drop existing policies before recreating them to avoid conflicts
     - Ensure the email() function exists for admin checks
     - Create policies for exchange rates table with proper permissions

  2. Security
     - Enable RLS on exchange_rates table
     - Allow public read access to exchange rates
     - Restrict management to admin users only
*/

-- Enable RLS on exchange_rates table if not already enabled
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view exchange rates" ON exchange_rates;
DROP POLICY IF EXISTS "Admins can manage exchange rates" ON exchange_rates;

-- Check if email() function exists, create it if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    JOIN pg_namespace ON pg_namespace.oid = pg_proc.pronamespace
    WHERE proname = 'email' AND nspname = 'public'
  ) THEN
    -- Helper function to get user email from JWT
    CREATE OR REPLACE FUNCTION email() 
    RETURNS text AS $$
    BEGIN
      RETURN (current_setting('request.jwt.claims', true)::json->>'email');
    EXCEPTION WHEN OTHERS THEN
      RETURN '';
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  END IF;
END
$$;

-- Create policies for exchange_rates table
CREATE POLICY "Anyone can view exchange rates"
  ON exchange_rates
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage exchange rates"
  ON exchange_rates
  FOR ALL
  TO authenticated
  USING (
    (email() LIKE '%@liquidcurrent.com') OR 
    (email() LIKE '%@liquidcurrent.co.za')
  );