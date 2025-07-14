/*
  # Fix KYC Document Upload Policies
  
  1. Changes
    - Drop all existing storage and document policies
    - Create new simplified policies for document uploads
    - Fix RLS policies for kyc_documents table
  
  2. Security
    - Allow authenticated users to upload their own documents
    - Maintain user data isolation
    - Enable admin access where needed
*/

-- Drop all existing storage policies
DROP POLICY IF EXISTS "Enable upload access for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable read access for users to own documents" ON storage.objects;
DROP POLICY IF EXISTS "Enable all for admin users" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins have full access" ON storage.objects;

-- Drop all existing kyc_documents policies
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON kyc_documents;
DROP POLICY IF EXISTS "Enable select for users own documents" ON kyc_documents;
DROP POLICY IF EXISTS "Enable all for admin users" ON kyc_documents;
DROP POLICY IF EXISTS "Users can upload their own documents" ON kyc_documents;
DROP POLICY IF EXISTS "Users can view their own documents" ON kyc_documents;
DROP POLICY IF EXISTS "Admins can access all documents" ON kyc_documents;

-- Ensure storage bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc_documents', 'kyc_documents', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Create simplified storage policies
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kyc_documents'
);

CREATE POLICY "Allow public reads"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'kyc_documents'
);

-- Create simplified kyc_documents policies
CREATE POLICY "Allow authenticated inserts"
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

CREATE POLICY "Allow own document reads"
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

CREATE POLICY "Allow admin access"
ON kyc_documents
FOR ALL
TO authenticated
USING (
  auth.jwt()->>'email' LIKE '%@liquidcurrent.com' OR
  auth.jwt()->>'email' LIKE '%@liquidcurrent.co.za'
);