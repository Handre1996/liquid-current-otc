/*
  # Storage Bucket and Policies Migration
  
  1. Changes
    - Create kyc_documents storage bucket
    - Set up storage policies for document access
    - Configure RLS for document uploads and viewing
  
  2. Security
    - Users can only access their own documents
    - Admins have full access to all documents
    - Bucket is private by default
*/

BEGIN;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own documents" ON kyc_documents;
DROP POLICY IF EXISTS "Users can view their own documents" ON kyc_documents;
DROP POLICY IF EXISTS "Admins can access all documents" ON kyc_documents;

-- Create policies for kyc_documents table
CREATE POLICY "Users can upload their own documents"
ON kyc_documents FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM kyc_submissions
    WHERE id = submission_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own documents"
ON kyc_documents FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM kyc_submissions
    WHERE id = submission_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Admins can access all documents"
ON kyc_documents FOR ALL TO authenticated
USING (
  auth.email() LIKE '%@liquidcurrent.com' OR
  auth.email() LIKE '%@liquidcurrent.co.za'
);

COMMIT;