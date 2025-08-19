/*
  # Fix Storage Policies for KYC Documents

  1. Changes
    - Create kyc_documents storage bucket if it doesn't exist
    - Update storage bucket policies to allow proper access
    - Fix RLS policies for document uploads

  2. Security
    - Enable proper access control for authenticated users
    - Allow admin access for liquidcurrent.com emails
    - Maintain data security while allowing necessary operations
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc_documents', 'kyc_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the kyc_documents bucket
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'kyc_documents' AND
  (auth.uid())::text = (SPLIT_PART(name, '/', 1))
);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'kyc_documents' AND
  (auth.uid())::text = (SPLIT_PART(name, '/', 1))
);

CREATE POLICY "Admins can access all documents"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'kyc_documents' AND
  (
    auth.email() LIKE '%@liquidcurrent.com' OR
    auth.email() LIKE '%@liquidcurrent.co.za'
  )
);

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;