/*
  # Add missing tables for complete OTC trading functionality

  1. New Tables
    - `users` table to store user profile information
    - Update existing tables with proper relationships
    
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
    
  3. Indexes
    - Add performance indexes for common queries
*/

-- Create users table if it doesn't exist (for user profile management)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text,
  surname text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_sign_in_at timestamptz,
  email_confirmed_at timestamptz,
  is_active boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for users table
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'email'::text) ~~ '%@liquidcurrent.com'::text OR
    (auth.jwt() ->> 'email'::text) ~~ '%@liquidcurrent.co.za'::text
  );

-- Update kyc_submissions table to use proper user references
DO $$
BEGIN
  -- Add first_name and surname columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'kyc_submissions' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE kyc_submissions ADD COLUMN first_name text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'kyc_submissions' AND column_name = 'surname'
  ) THEN
    ALTER TABLE kyc_submissions ADD COLUMN surname text NOT NULL DEFAULT '';
  END IF;

  -- Add national_id_number column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'kyc_submissions' AND column_name = 'national_id_number'
  ) THEN
    ALTER TABLE kyc_submissions ADD COLUMN national_id_number text;
  END IF;
END $$;

-- Add constraint for national_id_number validation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'kyc_submissions' AND constraint_name = 'valid_national_id_number'
  ) THEN
    ALTER TABLE kyc_submissions ADD CONSTRAINT valid_national_id_number 
    CHECK (national_id_number IS NULL OR length(national_id_number) >= 6);
  END IF;
END $$;

-- Update kyc_documents table to include status tracking
DO $$
BEGIN
  -- Add document_type_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'kyc_documents' AND column_name = 'document_type_id'
  ) THEN
    ALTER TABLE kyc_documents ADD COLUMN document_type_id uuid;
  END IF;

  -- Add status_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'kyc_documents' AND column_name = 'status_id'
  ) THEN
    ALTER TABLE kyc_documents ADD COLUMN status_id uuid;
  END IF;

  -- Add verified_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'kyc_documents' AND column_name = 'verified_at'
  ) THEN
    ALTER TABLE kyc_documents ADD COLUMN verified_at timestamptz;
  END IF;

  -- Add verified_by column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'kyc_documents' AND column_name = 'verified_by'
  ) THEN
    ALTER TABLE kyc_documents ADD COLUMN verified_by uuid;
  END IF;
END $$;

-- Add foreign key constraints for kyc_documents if they don't exist
DO $$
BEGIN
  -- Add foreign key to document_types
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'kyc_documents' AND constraint_name = 'kyc_documents_document_type_id_fkey'
  ) THEN
    ALTER TABLE kyc_documents ADD CONSTRAINT kyc_documents_document_type_id_fkey 
    FOREIGN KEY (document_type_id) REFERENCES document_types(id);
  END IF;

  -- Add foreign key to document_statuses
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'kyc_documents' AND constraint_name = 'kyc_documents_status_id_fkey'
  ) THEN
    ALTER TABLE kyc_documents ADD CONSTRAINT kyc_documents_status_id_fkey 
    FOREIGN KEY (status_id) REFERENCES document_statuses(id);
  END IF;

  -- Add foreign key to users for verified_by
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'kyc_documents' AND constraint_name = 'kyc_documents_verified_by_fkey'
  ) THEN
    ALTER TABLE kyc_documents ADD CONSTRAINT kyc_documents_verified_by_fkey 
    FOREIGN KEY (verified_by) REFERENCES users(id);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_user_status ON kyc_submissions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_submission_type ON kyc_documents(submission_id, document_type);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON kyc_documents(status_id);

-- Insert default document types if they don't exist
INSERT INTO document_types (name, description, required) VALUES
  ('ID Front', 'Front side of identification document', true),
  ('ID Back', 'Back side of identification document', false),
  ('Passport', 'Passport identification document', true),
  ('Proof of Address', 'Utility bill or bank statement as proof of address', true),
  ('Selfie with ID', 'Selfie holding identification document', true),
  ('Bank Statement', 'Recent bank statement', false),
  ('Proof of Income', 'Salary slip or proof of income', false)
ON CONFLICT (name) DO NOTHING;

-- Insert default document statuses if they don't exist
INSERT INTO document_statuses (name, description) VALUES
  ('Pending', 'Document uploaded and awaiting review'),
  ('Under Review', 'Document is being reviewed by admin'),
  ('Approved', 'Document has been approved'),
  ('Rejected', 'Document has been rejected and needs to be re-uploaded'),
  ('Expired', 'Document has expired and needs to be updated')
ON CONFLICT (name) DO NOTHING;

-- Update RLS policies for kyc_documents
DROP POLICY IF EXISTS "Allow public reads" ON kyc_documents;
DROP POLICY IF EXISTS "Allow authenticated inserts" ON kyc_documents;

CREATE POLICY "Users can view their own documents"
  ON kyc_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM kyc_submissions 
      WHERE kyc_submissions.id = kyc_documents.submission_id 
      AND kyc_submissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload their own documents"
  ON kyc_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM kyc_submissions 
      WHERE kyc_submissions.id = kyc_documents.submission_id 
      AND kyc_submissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all documents"
  ON kyc_documents
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'email'::text) ~~ '%@liquidcurrent.com'::text OR
    (auth.jwt() ->> 'email'::text) ~~ '%@liquidcurrent.co.za'::text
  );