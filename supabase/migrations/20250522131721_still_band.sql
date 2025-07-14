-- Add first_name and surname columns to kyc_submissions
ALTER TABLE kyc_submissions
ADD COLUMN first_name text,
ADD COLUMN surname text;

-- Update existing records to split full_name into first_name and surname
UPDATE kyc_submissions
SET 
  first_name = SPLIT_PART(full_name, ' ', 1),
  surname = SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
WHERE full_name IS NOT NULL;

-- Make first_name and surname required
ALTER TABLE kyc_submissions
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN surname SET NOT NULL;

-- Drop the full_name column
ALTER TABLE kyc_submissions
DROP COLUMN full_name;