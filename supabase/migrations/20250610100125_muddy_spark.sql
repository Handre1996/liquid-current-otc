-- Enable RLS on exchange_rates table if not already enabled
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view exchange rates" ON exchange_rates;
DROP POLICY IF EXISTS "Admins can manage exchange rates" ON exchange_rates;

-- Helper function to get user email from JWT
CREATE OR REPLACE FUNCTION email() 
RETURNS text AS $$
BEGIN
  RETURN (current_setting('request.jwt.claims', true)::json->>'email');
EXCEPTION WHEN OTHERS THEN
  RETURN '';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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