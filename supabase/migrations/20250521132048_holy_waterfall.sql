/*
  # Fix Storage Policies for KYC Documents
  
  1. Changes
    - Drop and recreate storage policies with correct permissions
    - Add policies for document uploads and access
    - Fix RLS policies for kyc_documents table
  
  2. Security
    - Users can upload and access their own documents
    - Admins can access all documents
    - Proper bucket access control
*/

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read all documents" ON storage.objects;

-- Create storage bucket policies
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

CREATE POLICY "Users can insert their own documents"
ON kyc_documents FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM kyc_submissions
    WHERE kyc_submissions.id = submission_id
    AND kyc_submissions.user_id = auth.uid()
  )
);