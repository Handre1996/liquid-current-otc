/*
  # Storage bucket setup for KYC documents

  1. Storage Configuration
    - Create `kyc_documents` bucket (private)
    - Set up RLS policies for document access
    
  2. Security Policies
    - Users can upload their own documents
    - Users can view their own documents  
    - Admins can access all documents
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