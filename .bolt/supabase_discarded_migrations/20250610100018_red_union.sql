/*
  # Add exchange rates policies for admin users

  1. Changes
     - Add policies for exchange_rates table to allow admin users to manage rates
  
  2. Security
     - Enable RLS on exchange_rates table
     - Add appropriate policies for admin users
*/

-- Enable RLS on exchange_rates table if not already enabled
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

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

-- Helper function to get user email from JWT
CREATE OR REPLACE FUNCTION email() 
RETURNS text AS $$
BEGIN
  RETURN (current_setting('request.jwt.claims', true)::json->>'email');
EXCEPTION WHEN OTHERS THEN
  RETURN '';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;