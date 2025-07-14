-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc_documents', 'kyc_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Note: Storage policies are managed by Supabase and don't require explicit RLS enabling
-- The policies will be created through the Supabase dashboard or via the service role