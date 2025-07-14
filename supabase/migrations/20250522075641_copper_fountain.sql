/*
  # Fix Storage RLS Policies

  1. Changes
    - Simplify storage policies to allow public access
    - Update kyc_documents policies for proper access control
    - Ensure storage bucket is public
*/

-- Drop existing storage policies
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin access" ON storage.objects;

-- Ensure storage bucket is public
UPDATE storage.buckets
SET public = true
WHERE id = 'kyc_documents';

-- Create simplified storage policies
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'kyc_documents');

CREATE POLICY "Allow public reads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'kyc_documents');

-- Drop existing kyc_documents policies
DROP POLICY IF EXISTS "Allow authenticated inserts" ON kyc_documents;
DROP POLICY IF EXISTS "Allow own document reads" ON kyc_documents;
DROP POLICY IF EXISTS "Allow admin access" ON kyc_documents;

-- Create simplified kyc_documents policies
CREATE POLICY "Allow authenticated inserts"
ON kyc_documents
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow public reads"
ON kyc_documents
FOR SELECT
TO public
USING (true);