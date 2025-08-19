/*
  # Fix KYC Policies

  1. Changes
    - Drops existing policies with proper error handling
    - Recreates policies for kyc_submissions and kyc_documents
    - Sets up storage policies for kyc_documents bucket
  
  2. Security
    - Enables proper access control for users to their own submissions
    - Grants admin users full access to all submissions
*/

-- Drop existing policies with IF EXISTS to avoid errors
DO $$
BEGIN
  -- Drop policies for kyc_submissions
  DROP POLICY IF EXISTS "Users can create their own submissions" ON kyc_submissions;
  DROP POLICY IF EXISTS "Users can insert their own submissions" ON kyc_submissions;
  DROP POLICY IF EXISTS "Users can insert their own kyc submissions" ON kyc_submissions;
  DROP POLICY IF EXISTS "Users can update their own kyc submissions" ON kyc_submissions;
  DROP POLICY IF EXISTS "Users can view their own kyc submissions" ON kyc_submissions;
  DROP POLICY IF EXISTS "Users can view their own submissions" ON kyc_submissions;
  DROP POLICY IF EXISTS "Admins can view all submissions" ON kyc_submissions;
  DROP POLICY IF EXISTS "Admins can update all submissions" ON kyc_submissions;
  DROP POLICY IF EXISTS "Enable insert for authenticated users" ON kyc_submissions;
  DROP POLICY IF EXISTS "Enable select for users own submissions" ON kyc_submissions;
  DROP POLICY IF EXISTS "Enable update for users own submissions" ON kyc_submissions;
  DROP POLICY IF EXISTS "Enable all for admin users" ON kyc_submissions;

  -- Drop policies for kyc_documents
  DROP POLICY IF EXISTS "Users can insert their own documents" ON kyc_documents;
  DROP POLICY IF EXISTS "Users can insert their own kyc documents" ON kyc_documents;
  DROP POLICY IF EXISTS "Users can view their own documents" ON kyc_documents;
  DROP POLICY IF EXISTS "Users can view their own kyc documents" ON kyc_documents;
  DROP POLICY IF EXISTS "Admin users can view all kyc documents" ON kyc_documents;
  DROP POLICY IF EXISTS "Admins can view all documents" ON kyc_documents;
  DROP POLICY IF EXISTS "Admins can update document verification" ON kyc_documents;
  DROP POLICY IF EXISTS "Admins can verify documents" ON kyc_documents;
  DROP POLICY IF EXISTS "Enable insert for authenticated users" ON kyc_documents;
  DROP POLICY IF EXISTS "Enable select for users own documents" ON kyc_documents;
  DROP POLICY IF EXISTS "Enable all for admin users" ON kyc_documents;
END
$$;

-- Recreate policies for kyc_submissions with unique names
CREATE POLICY "User insert kyc submissions" ON kyc_submissions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User select own kyc submissions" ON kyc_submissions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "User update own kyc submissions" ON kyc_submissions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin manage all kyc submissions" ON kyc_submissions
  FOR ALL TO authenticated
  USING (
    auth.jwt()->>'email' LIKE '%@liquidcurrent.com' OR 
    auth.jwt()->>'email' LIKE '%@liquidcurrent.co.za'
  );

-- Recreate policies for kyc_documents with unique names
CREATE POLICY "User insert kyc documents" ON kyc_documents
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM kyc_submissions
      WHERE id = kyc_documents.submission_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "User select own kyc documents" ON kyc_documents
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM kyc_submissions
      WHERE id = kyc_documents.submission_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admin manage all kyc documents" ON kyc_documents
  FOR ALL TO authenticated
  USING (
    auth.jwt()->>'email' LIKE '%@liquidcurrent.com' OR 
    auth.jwt()->>'email' LIKE '%@liquidcurrent.co.za'
  );

-- Storage policies for kyc_documents bucket
DO $$
BEGIN
  -- Create storage bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('kyc_documents', 'kyc_documents', false)
  ON CONFLICT (id) DO NOTHING;

  -- Drop existing storage policies
  DELETE FROM storage.policies WHERE bucket_id = 'kyc_documents';

  -- Insert new storage policies
  INSERT INTO storage.policies (bucket_id, name, definition)
  VALUES
    (
      'kyc_documents',
      'Enable upload for authenticated users',
      jsonb_build_object(
        'role', 'authenticated',
        'operation', 'INSERT',
        'check', '(auth.uid() IS NOT NULL)'
      )
    ),
    (
      'kyc_documents',
      'Enable read for users own documents',
      jsonb_build_object(
        'role', 'authenticated',
        'operation', 'SELECT',
        'check', '(auth.uid() IS NOT NULL)'
      )
    ),
    (
      'kyc_documents',
      'Enable all for admin users',
      jsonb_build_object(
        'role', 'authenticated',
        'operation', 'ALL',
        'check', '(auth.jwt()->>''email'' LIKE ''%@liquidcurrent.com'' OR auth.jwt()->>''email'' LIKE ''%@liquidcurrent.co.za'')'
      )
    );
END $$;