
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface SourceOfFundsFormProps {
  formData: {
    sourceOfFunds: string;
    otherSourceDescription: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
}

export default function SourceOfFundsForm({ 
  formData, 
  handleInputChange, 
  handleSelectChange 
}: SourceOfFundsFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Source of Funds</h3>
      <div className="space-y-2">
        <Label htmlFor="sourceOfFunds">Primary Source of Funds</Label>
        <Select 
          value={formData.sourceOfFunds} 
          onValueChange={(value) => handleSelectChange('sourceOfFunds', value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your source of funds" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="employment">Employment Income</SelectItem>
            <SelectItem value="business">Business Income</SelectItem>
            <SelectItem value="investment">Investment Income</SelectItem>
            <SelectItem value="savings">Savings</SelectItem>
            <SelectItem value="gift">Gift/Inheritance</SelectItem>
            <SelectItem value="loan">Loan Proceeds</SelectItem>
            <SelectItem value="crypto">Sale of Crypto Assets</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {formData.sourceOfFunds === 'other' && (
        <div className="space-y-2">
          <Label htmlFor="otherSourceDescription">Please specify your source of funds</Label>
          <Textarea 
            id="otherSourceDescription" 
            name="otherSourceDescription" 
            placeholder="Please provide details about your source of funds"
            value={formData.otherSourceDescription}
            onChange={handleInputChange}
            required={formData.sourceOfFunds === 'other'}
          />
        </div>
      )}
    </div>
  );
}
