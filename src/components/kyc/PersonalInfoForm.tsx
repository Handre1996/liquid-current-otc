import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countryCodes } from '@/lib/constants';

interface PersonalInfoFormProps {
  formData: {
    firstName: string;
    surname: string;
    email: string;
    phone: string;
    idType: string;
    nationalIdNumber: string;
    countryCode: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRadioChange: (value: string) => void;
  handleSelectChange: (name: string, value: string) => void;
}

export default function PersonalInfoForm({ 
  formData, 
  handleInputChange, 
  handleRadioChange,
  handleSelectChange
}: PersonalInfoFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Personal Details</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input 
            id="firstName" 
            name="firstName" 
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="surname">Surname</Label>
          <Input 
            id="surname" 
            name="surname" 
            placeholder="Enter your surname"
            value={formData.surname}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            placeholder="Your email address"
            value={formData.email}
            onChange={handleInputChange}
            required
            readOnly
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="flex gap-2">
            <Select
              value={formData.countryCode}
              onValueChange={(value) => handleSelectChange('countryCode', value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select code" />
              </SelectTrigger>
              <SelectContent>
                {countryCodes.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <span className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span>{country.code}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input 
              id="phone" 
              name="phone" 
              placeholder="Phone number"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="flex-1"
            />
          </div>
          {formData.countryCode && (
            <p className="text-sm text-muted-foreground mt-1">
              {countryCodes.find(c => c.code === formData.countryCode)?.name}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>ID Document Type</Label>
          <RadioGroup 
            defaultValue="passport" 
            value={formData.idType}
            onValueChange={handleRadioChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="passport" id="passport" />
              <Label htmlFor="passport">Passport</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="nationalId" id="nationalId" />
              <Label htmlFor="nationalId">National ID</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="drivingLicense" id="drivingLicense" />
              <Label htmlFor="drivingLicense">Driving License</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
      
      {formData.idType === 'nationalId' && (
        <div className="space-y-2">
          <Label htmlFor="nationalIdNumber">National ID Number</Label>
          <Input 
            id="nationalIdNumber" 
            name="nationalIdNumber" 
            placeholder="Enter your National ID number"
            value={formData.nationalIdNumber}
            onChange={handleInputChange}
            required
            minLength={6}
          />
          <p className="text-sm text-gray-500">
            Please enter your valid National ID number (minimum 6 characters)
          </p>
        </div>
      )}

      {formData.idType === 'passport' && (
        <div className="space-y-2">
          <Label htmlFor="nationalIdNumber">Passport Number</Label>
          <Input 
            id="nationalIdNumber" 
            name="nationalIdNumber" 
            placeholder="Enter your Passport number"
            value={formData.nationalIdNumber}
            onChange={handleInputChange}
            required
            minLength={6}
          />
          <p className="text-sm text-gray-500">
            Please enter your valid Passport number (minimum 6 characters)
          </p>
        </div>
      )}
    </div>
  );
}