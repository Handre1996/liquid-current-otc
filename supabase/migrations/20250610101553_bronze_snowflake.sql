/*
  # Fix Exchange Rates Table Policies

  1. Security
    - Enable RLS on exchange_rates table
    - Add policy for public read access to exchange rates
    - Add policy for admin management of exchange rates
  
  2. Functions
    - Create email() helper function for admin authentication
*/

-- Enable RLS on exchange_rates table if not already enabled
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view exchange rates" ON exchange_rates;
DROP POLICY IF EXISTS "Admins can manage exchange rates" ON exchange_rates;

-- Check if email() function exists, create it if it doesn't
DO $function_check$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    JOIN pg_namespace ON pg_namespace.oid = pg_proc.pronamespace
    WHERE proname = 'email' AND nspname = 'public'
  ) THEN
    -- Helper function to get user email from JWT
    EXECUTE '
      CREATE OR REPLACE FUNCTION email() 
      RETURNS text AS $func$
      BEGIN
        RETURN (current_setting(''request.jwt.claims'', true)::json->>''email'');
      EXCEPTION WHEN OTHERS THEN
        RETURN '''';
      END;
      $func$ LANGUAGE plpgsql SECURITY DEFINER;
    ';
  END IF;
END
$function_check$;

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