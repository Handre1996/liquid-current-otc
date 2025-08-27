import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Upload file to Supabase storage
export const uploadFile = async (file: File, submissionId: string, documentType: string, user: User | null) => {
  if (!file || !user?.id) {
    toast.error("Authentication required for file upload");
    throw new Error('Missing file or user authentication');
  }
  
  try {
    // Create a more predictable file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${documentType}_${submissionId}.${fileExt}`;
    const fullPath = `${user.id}/${submissionId}/${fileName}`;
    
    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('kyc_documents')
      .upload(fullPath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      throw uploadError;
    }
    
    return fullPath;
  } catch (error: any) {
    console.error("File upload error:", error);
    toast.error(`Upload failed: ${error.message || "Unknown error"}`);
    throw error;
  }
};

// Check if user has already submitted KYC
export const checkExistingSubmission = async (userId: string) => {
  if (!userId) {
    console.error("No user ID provided");
    return null;
  }

  try {
    const { data: submissions, error } = await supabase
      .from('kyc_submissions')
      .select('id, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error checking KYC submission:", error.message);
      return null;
    }
    
    // If no submissions found, return null
    if (!submissions || submissions.length === 0) {
      return null;
    }
    
    // First, check if there's an approved submission
    const approvedSubmission = submissions.find(sub => sub.status === 'approved');
    if (approvedSubmission) {
      return approvedSubmission;
    }
    
    // If no approved submission, return the most recent one
    return submissions[0];
  } catch (error: any) {
    console.error("Error checking existing submission:", error.message);
    return null;
  }
};