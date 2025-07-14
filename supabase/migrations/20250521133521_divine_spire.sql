/*
  # Fix KYC Document Upload Policies

  1. Changes
    - Update storage policies to allow proper file uploads
    - Fix document submission policies
    - Ensure proper bucket access control
  
  2. Security
    - Allow authenticated users to upload their own documents
    - Maintain user data isolation
    - Enable admin access where needed
*/

-- Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Enable upload access for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable read access for users to own documents" ON storage.objects;
DROP POLICY IF EXISTS "Enable all for admin users" ON storage.objects;

-- Create storage policies with proper permissions
CREATE POLICY "Enable upload access for authenticated users"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kyc_documents' AND
  auth.uid()::text = SPLIT_PART(name, '/', 1)
);

CREATE POLICY "Enable read access for users to own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc_documents' AND
  (
    auth.uid()::text = SPLIT_PART(name, '/', 1) OR
    auth.jwt()->>'email' LIKE '%@liquidcurrent.com' OR
    auth.jwt()->>'email' LIKE '%@liquidcurrent.co.za'
  )
);

CREATE POLICY "Enable delete for users own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'kyc_documents' AND
  auth.uid()::text = SPLIT_PART(name, '/', 1)
);

-- Drop existing document policies
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON kyc_documents;
DROP POLICY IF EXISTS "Enable select for users own documents" ON kyc_documents;
DROP POLICY IF EXISTS "Enable all for admin users" ON kyc_documents;

-- Create updated document policies
CREATE POLICY "Enable insert for authenticated users"
ON kyc_documents
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM kyc_submissions
    WHERE kyc_submissions.id = submission_id
    AND kyc_submissions.user_id = auth.uid()
  )
);

CREATE POLICY "Enable select for users own documents"
ON kyc_documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM kyc_submissions
    WHERE kyc_submissions.id = submission_id
    AND kyc_submissions.user_id = auth.uid()
  )
);

CREATE POLICY "Enable all for admin users"
ON kyc_documents
FOR ALL
TO authenticated
USING (
  auth.jwt()->>'email' LIKE '%@liquidcurrent.com' OR
  auth.jwt()->>'email' LIKE '%@liquidcurrent.co.za'
);

-- Ensure storage bucket exists and is properly configured
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'kyc_documents'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('kyc_documents', 'kyc_documents', false);
  END IF;
END $$;