
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddressInfoFormProps {
  formData: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AddressInfoForm({ formData, handleInputChange }: AddressInfoFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Residential Address</h3>
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="address">Street Address</Label>
          <Input 
            id="address" 
            name="address" 
            placeholder="Your street address"
            value={formData.address}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input 
            id="city" 
            name="city" 
            placeholder="City"
            value={formData.city}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input 
            id="postalCode" 
            name="postalCode" 
            placeholder="Postal Code"
            value={formData.postalCode}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input 
            id="country" 
            name="country" 
            placeholder="Country"
            value={formData.country}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
    </div>
  );
}
