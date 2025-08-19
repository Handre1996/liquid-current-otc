import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import PersonalInfoForm from '@/components/kyc/PersonalInfoForm';
import AddressInfoForm from '@/components/kyc/AddressInfoForm';
import SourceOfFundsForm from '@/components/kyc/SourceOfFundsForm';
import DocumentUploadForm from '@/components/kyc/DocumentUploadForm';
import { uploadFile, checkExistingSubmission } from '@/utils/kycUtils';
import { supabase } from '@/integrations/supabase/client';

export default function KycForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    email: user?.email || '',
    phone: '',
    countryCode: '+27', // Default to South Africa
    idType: 'passport',
    nationalIdNumber: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'South Africa',
    sourceOfFunds: '',
    otherSourceDescription: '',
  });

  const [files, setFiles] = useState({
    idDocumentFront: null,
    idDocumentBack: null,
    proofOfAddress: null,
    selfie: null
  });

  useEffect(() => {
    const checkKycStatus = async () => {
      if (!user) return;
      
      setCheckingStatus(true);
      try {
        const submission = await checkExistingSubmission(user.id);
        
        if (submission) {
          toast.info("You have already submitted your KYC documents");
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error("Error checking KYC status:", error);
      } finally {
        setCheckingStatus(false);
      }
    };
    
    checkKycStatus();
  }, [user, navigate]);

  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email || '' }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      idType: value,
      nationalIdNumber: ''
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList[0]) {
      setFiles((prev) => ({ ...prev, [name]: fileList[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Authentication required. Please sign in.");
      navigate('/login', { state: { from: '/kyc' } });
      return;
    }
    
    setIsSubmitting(true);
    const submissionToast = toast.loading('Submitting KYC documents...');

    try {
      if (!files.idDocumentFront) {
        throw new Error("ID document front is required");
      }
      
      if (formData.idType === 'nationalId') {
        if (!formData.nationalIdNumber) {
          throw new Error("National ID number is required");
        }
        if (!files.idDocumentBack) {
          throw new Error("ID document back is required for National ID");
        }
      }

      if (formData.idType === 'passport' && !formData.nationalIdNumber) {
        throw new Error("Passport number is required");
      }
      
      if (!files.proofOfAddress) {
        throw new Error("Proof of address is required");
      }
      
      if (!files.selfie) {
        throw new Error("Selfie with ID is required");
      }
      
      const submissionData = {
        user_id: user.id,
        first_name: formData.firstName,
        surname: formData.surname,
        email: formData.email,
        phone: `${formData.countryCode}${formData.phone}`,
        id_type: formData.idType,
        national_id_number: formData.nationalIdNumber || null,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postalCode,
        country: formData.country,
        source_of_funds: formData.sourceOfFunds,
        other_source_description: formData.sourceOfFunds === 'other' ? formData.otherSourceDescription : null,
        status: 'pending',
      };
      
      const { data: submission, error: submissionError } = await supabase
        .from('kyc_submissions')
        .insert(submissionData)
        .select()
        .single();
      
      if (submissionError) {
        throw new Error(`Submission error: ${submissionError.message || 'Unknown error'}`);
      }
      
      const submissionId = submission.id;
      const documentUploads = [];
      
      if (files.idDocumentFront) {
        const path = await uploadFile(files.idDocumentFront, submissionId, 'id_front', user);
        if (path) {
          documentUploads.push({
            submission_id: submissionId,
            document_type: 'id_front',
            file_path: path
          });
        }
      }
      
      if (formData.idType === 'nationalId' && files.idDocumentBack) {
        const path = await uploadFile(files.idDocumentBack, submissionId, 'id_back', user);
        if (path) {
          documentUploads.push({
            submission_id: submissionId,
            document_type: 'id_back',
            file_path: path
          });
        }
      }
      
      if (files.proofOfAddress) {
        const path = await uploadFile(files.proofOfAddress, submissionId, 'proof_of_address', user);
        if (path) {
          documentUploads.push({
            submission_id: submissionId,
            document_type: 'proof_of_address',
            file_path: path
          });
        }
      }
      
      if (files.selfie) {
        const path = await uploadFile(files.selfie, submissionId, 'selfie', user);
        if (path) {
          documentUploads.push({
            submission_id: submissionId,
            document_type: 'selfie',
            file_path: path
          });
        }
      }
      
      if (documentUploads.length > 0) {
        const { error: documentsError } = await supabase
          .from('kyc_documents')
          .insert(documentUploads);
        
        if (documentsError) {
          throw new Error(`Document error: ${documentsError.message || 'Unknown error'}`);
        }
      }
      
      toast.dismiss(submissionToast);
      toast.success("Your KYC documents have been submitted successfully", {
        description: "We will review your documents and notify you once verified."
      });
      
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast.dismiss(submissionToast);
      toast.error(error.message || "Failed to submit KYC documents");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="animate-pulse text-lg">Checking KYC status...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-heading font-bold text-navy dark:text-foam mb-8">Complete Your KYC Process</h1>
          
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-navy dark:text-foam">Personal Information</CardTitle>
              <CardDescription>
                Please provide your details as they appear on your official documents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <PersonalInfoForm 
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleRadioChange={handleRadioChange}
                    handleSelectChange={handleSelectChange}
                  />

                  <Separator />

                  <AddressInfoForm 
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />

                  <Separator />

                  <SourceOfFundsForm 
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSelectChange={handleSelectChange}
                  />

                  <Separator />

                  <DocumentUploadForm 
                    formData={formData}
                    files={files}
                    handleFileChange={handleFileChange}
                  />

                  <div className="bg-brand-50 rounded-lg p-4 border border-brand-100">
                  <div className="bg-gradient-to-r from-foam/20 to-ivory/50 dark:from-teal/20 dark:to-navy/30 rounded-lg p-4 border border-foam/50 dark:border-teal/30">
                    <p className="text-sm font-body text-navy dark:text-foam">
                      By submitting this form, you confirm that all information provided is accurate and that you consent to Liquid Current OTC Desk processing your personal data in accordance with our privacy policy and applicable regulations.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-navy to-teal hover:from-navy/90 hover:to-teal/90 text-blanc font-body"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Documents"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
  )
}