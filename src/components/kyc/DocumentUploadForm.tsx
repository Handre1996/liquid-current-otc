import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';

interface DocumentUploadFormProps {
  formData: {
    idType: string;
  };
  files: {
    idDocumentFront: File | null;
    idDocumentBack: File | null;
    proofOfAddress: File | null;
    selfie: File | null;
  };
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DocumentUploadForm({ 
  formData, 
  files, 
  handleFileChange 
}: DocumentUploadFormProps) {
  
  // Helper function to render document upload fields based on ID type
  const renderIdDocumentFields = () => {
    if (formData.idType === 'nationalId' || formData.idType === 'drivingLicense') {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="idDocumentFront">{formData.idType === 'nationalId' ? 'ID Document (Front)' : 'Driving License (Front)'}</Label>
            <div className="flex items-center justify-center w-full">
              <label htmlFor="idDocumentFront" className="flex flex-col items-center justify-center w-full h-32 border-2 border-brand-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-brand-500" />
                  <p className="text-xs text-brand-500">
                    {files.idDocumentFront ? files.idDocumentFront.name : `Upload Front of ${formData.idType === 'nationalId' ? 'ID' : 'License'}`}
                  </p>
                </div>
                <input 
                  id="idDocumentFront" 
                  name="idDocumentFront" 
                  type="file" 
                  className="hidden" 
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  required
                />
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="idDocumentBack">{formData.idType === 'nationalId' ? 'ID Document (Back)' : 'Driving License (Back)'}</Label>
            <div className="flex items-center justify-center w-full">
              <label htmlFor="idDocumentBack" className="flex flex-col items-center justify-center w-full h-32 border-2 border-brand-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-brand-500" />
                  <p className="text-xs text-brand-500">
                    {files.idDocumentBack ? files.idDocumentBack.name : `Upload Back of ${formData.idType === 'nationalId' ? 'ID' : 'License'}`}
                  </p>
                </div>
                <input 
                  id="idDocumentBack" 
                  name="idDocumentBack" 
                  type="file" 
                  className="hidden" 
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  required
                />
              </label>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-2">
          <Label htmlFor="idDocumentFront">Passport</Label>
          <div className="flex items-center justify-center w-full">
            <label htmlFor="idDocumentFront" className="flex flex-col items-center justify-center w-full h-32 border-2 border-brand-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-brand-500" />
                <p className="text-xs text-brand-500">
                  {files.idDocumentFront ? files.idDocumentFront.name : 'Upload Passport'}
                </p>
              </div>
              <input 
                id="idDocumentFront" 
                name="idDocumentFront" 
                type="file" 
                className="hidden" 
                accept="image/*,.pdf"
                onChange={handleFileChange}
                required
              />
            </label>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Document Upload</h3>
      <p className="text-sm text-gray-500">
        Please upload clear, legible scans or photos of the following documents:
      </p>
      
      <div className="grid grid-cols-1 gap-6">
        {renderIdDocumentFields()}
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="proofOfAddress">Proof of Address</Label>
            <div className="flex items-center justify-center w-full">
              <label htmlFor="proofOfAddress" className="flex flex-col items-center justify-center w-full h-32 border-2 border-brand-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-brand-500" />
                  <p className="text-xs text-brand-500">
                    {files.proofOfAddress ? files.proofOfAddress.name : "Upload Proof"}
                  </p>
                </div>
                <input 
                  id="proofOfAddress" 
                  name="proofOfAddress" 
                  type="file" 
                  className="hidden" 
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  required
                />
              </label>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="selfie">Selfie with ID</Label>
            <div className="flex items-center justify-center w-full">
              <label htmlFor="selfie" className="flex flex-col items-center justify-center w-full h-32 border-2 border-brand-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-brand-500" />
                  <p className="text-xs text-brand-500">
                    {files.selfie ? files.selfie.name : "Upload Selfie"}
                  </p>
                </div>
                <input 
                  id="selfie" 
                  name="selfie" 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
              </label>
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Accepted file formats: JPEG, PNG, PDF. Maximum file size: 5MB.
      </p>
    </div>
  );
}