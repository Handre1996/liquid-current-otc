/*
  # Add National ID Number field
  
  1. Changes
    - Add national_id_number column to kyc_submissions table
    - Add validation check for national_id_number format
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add national_id_number column to kyc_submissions
ALTER TABLE kyc_submissions
ADD COLUMN IF NOT EXISTS national_id_number text;

-- Add a check constraint for basic ID number format validation
ALTER TABLE kyc_submissions
ADD CONSTRAINT valid_national_id_number 
CHECK (
  national_id_number IS NULL OR 
  LENGTH(national_id_number) >= 6
);