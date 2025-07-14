-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can create their own submissions" ON kyc_submissions;
DROP POLICY IF EXISTS "Users can insert their own submissions" ON kyc_submissions;
DROP POLICY IF EXISTS "Users can insert their own kyc submissions" ON kyc_submissions;
DROP POLICY IF EXISTS "Users can update their own kyc submissions" ON kyc_submissions;
DROP POLICY IF EXISTS "Users can view their own kyc submissions" ON kyc_submissions;
DROP POLICY IF EXISTS "Users can view their own submissions" ON kyc_submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON kyc_submissions;
DROP POLICY IF EXISTS "Admins can update all submissions" ON kyc_submissions;

DROP POLICY IF EXISTS "Users can insert their own documents" ON kyc_documents;
DROP POLICY IF EXISTS "Users can insert their own kyc documents" ON kyc_documents;
DROP POLICY IF EXISTS "Users can view their own documents" ON kyc_documents;
DROP POLICY IF EXISTS "Users can view their own kyc documents" ON kyc_documents;
DROP POLICY IF EXISTS "Admin users can view all kyc documents" ON kyc_documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON kyc_documents;
DROP POLICY IF EXISTS "Admins can update document verification" ON kyc_documents;
DROP POLICY IF EXISTS "Admins can verify documents" ON kyc_documents;

-- Recreate policies for kyc_submissions
CREATE POLICY "Enable insert for authenticated users" ON kyc_submissions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable select for users own submissions" ON kyc_submissions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Enable update for users own submissions" ON kyc_submissions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable all for admin users" ON kyc_submissions
  FOR ALL TO authenticated
  USING (
    auth.jwt()->>'email' LIKE '%@liquidcurrent.com' OR 
    auth.jwt()->>'email' LIKE '%@liquidcurrent.co.za'
  );

-- Recreate policies for kyc_documents
CREATE POLICY "Enable insert for authenticated users" ON kyc_documents
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM kyc_submissions
      WHERE id = kyc_documents.submission_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Enable select for users own documents" ON kyc_documents
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM kyc_submissions
      WHERE id = kyc_documents.submission_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Enable all for admin users" ON kyc_documents
  FOR ALL TO authenticated
  USING (
    auth.jwt()->>'email' LIKE '%@liquidcurrent.com' OR 
    auth.jwt()->>'email' LIKE '%@liquidcurrent.co.za'
  );

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc_documents', 'kyc_documents', false)
ON CONFLICT (id) DO NOTHING;