/*
  # Fix users table RLS policy for INSERT operations

  1. Security Changes
    - Add INSERT policy for authenticated users to create their own user records
    - This allows the syncUserToDatabase function to work properly during authentication

  The policy ensures users can only insert records where the id matches their auth.uid(),
  maintaining security while allowing proper user synchronization.
*/

-- Add INSERT policy for authenticated users to create their own records
CREATE POLICY "Users can insert their own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);