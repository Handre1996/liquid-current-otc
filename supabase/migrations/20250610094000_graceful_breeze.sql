/*
  # Fix users table RLS policy for user synchronization

  1. Security Updates
    - Update INSERT policy to allow users to insert their own profile during sync
    - Update UPDATE policy to use consistent casting for better compatibility
    - Ensure policies work correctly with the auth.uid() function during upsert operations

  The issue was that the existing policies were preventing the syncUserToDatabase function
  from working properly during user authentication flows.
*/

-- Drop existing policies to recreate them with proper permissions
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;

-- Create updated policies that work with the sync operation
CREATE POLICY "Users can insert their own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);