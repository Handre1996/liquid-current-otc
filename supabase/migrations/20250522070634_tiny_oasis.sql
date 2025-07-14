-- Update storage bucket to be public
UPDATE storage.buckets
SET public = true
WHERE id = 'kyc_documents';

-- Drop existing storage policies
DROP POLICY IF EXISTS "Enable upload access for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable read access for users to own documents" ON storage.objects;
DROP POLICY IF EXISTS "Enable all for admin users" ON storage.objects;

-- Create updated storage policies
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
TO public
USING (
  bucket_id = 'kyc_documents'
);

CREATE POLICY "Enable all for admin users"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'kyc_documents' AND
  (
    auth.jwt()->>'email' LIKE '%@liquidcurrent.com' OR
    auth.jwt()->>'email' LIKE '%@liquidcurrent.co.za'
  )
);