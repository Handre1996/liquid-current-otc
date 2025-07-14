/*
  # Fix Storage Access and Document Viewing
  
  1. Changes
    - Update storage policies to allow proper access
    - Add policies for document viewing
    - Ensure proper bucket setup
  
  2. Security
    - Maintain secure access controls
    - Allow admin access to all documents
    - Enable proper file viewing
*/

-- Ensure storage bucket exists and is public
UPDATE storage.buckets
SET public = true
WHERE id = 'kyc_documents';

-- Drop existing storage policies
DROP POLICY IF EXISTS "Enable upload access for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable read access for users to own documents" ON storage.objects;

-- Create new storage policies
CREATE POLICY "Enable upload access for authenticated users"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'kyc_documents' AND
  (auth.uid())::text = (SPLIT_PART(name, '/', 1))
);

CREATE POLICY "Enable read access for users to own documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'kyc_documents' AND
  (
    (auth.uid())::text = (SPLIT_PART(name, '/', 1)) OR
    (auth.email() LIKE '%@liquidcurrent.com') OR
    (auth.email() LIKE '%@liquidcurrent.co.za')
  )
);

-- Update kyc_documents table policies
DROP POLICY IF EXISTS "Users can insert their own documents" ON kyc_documents;
DROP POLICY IF EXISTS "Users can view their own kyc documents" ON kyc_documents;
DROP POLICY IF EXISTS "Admin users can view all kyc documents" ON kyc_documents;

CREATE POLICY "Users can insert their own documents"
ON kyc_documents FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM kyc_submissions
    WHERE kyc_submissions.id = submission_id
    AND kyc_submissions.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own kyc documents"
ON kyc_documents FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM kyc_submissions
    WHERE kyc_submissions.id = submission_id
    AND kyc_submissions.user_id = auth.uid()
  )
);

CREATE POLICY "Admin users can view all kyc documents"
ON kyc_documents FOR SELECT TO authenticated
USING (
  auth.email() LIKE '%@liquidcurrent.com' OR
  auth.email() LIKE '%@liquidcurrent.co.za'
);