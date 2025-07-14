/*
  # Fix Storage Policies for KYC Documents

  1. Changes
    - Create storage bucket if it doesn't exist
    - Enable RLS on the bucket
    - Add policies for authenticated users to:
      - Upload files to their own directory
      - Read their own files
      - Delete their own files
    - Add policies for admin users to access all files
  
  2. Security
    - Ensures users can only access their own documents
    - Admins have full access to all documents
    - Paths are validated to match user ID
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
SELECT 'kyc_documents', 'kyc_documents'
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'kyc_documents'
);

-- Enable RLS
UPDATE storage.buckets
SET public = false
WHERE id = 'kyc_documents';

-- Remove existing policies if any
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins have full access" ON storage.objects;

-- Create policy for users to upload their own documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'kyc_documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy for users to read their own documents
CREATE POLICY "Users can read their own documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'kyc_documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy for users to delete their own documents
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'kyc_documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy for admin access
CREATE POLICY "Admins have full access"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'kyc_documents' AND
  (
    auth.jwt() ->> 'email' LIKE '%@liquidcurrent.com' OR
    auth.jwt() ->> 'email' LIKE '%@liquidcurrent.co.za'
  )
);