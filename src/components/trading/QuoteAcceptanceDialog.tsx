import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { OTCQuote, BankAccount, CryptoWallet } from '@/types/trading';
import { toast } from 'sonner';
import { AlertTriangle, Info, Shield, Wallet, Building, CheckCircle } from 'lucide-react';

interface QuoteAcceptanceDialogProps {
  quote: OTCQuote | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (quoteId: string, bankAccountId?: string, cryptoWalletId?: string) => Promise<void>;
}

const QuoteAcceptanceDialog = ({ quote, isOpen, onClose, onAccept }: QuoteAcceptanceDialogProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [cryptoWallets, setCryptoWallets] = useState<CryptoWallet[]>([]);
  
  // Form state
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>('');
  const [selectedCryptoWallet, setSelectedCryptoWallet] = useState<string>('');
  const [walletOwnershipConfirmed, setWalletOwnershipConfirmed] = useState(false);
  const [walletType, setWalletType] = useState<'hosted' | 'unhosted' | ''>('');
  const [walletTypeUnderstood, setWalletTypeUnderstood] = useState(false);
  
  // New bank account form
  const [showAddBankForm, setShowAddBankForm] = useState(false);
  const [newBankAccount, setNewBankAccount] = useState({
    account_holder_name: '',
    bank_name: '',
    account_number: '',
    branch_code: '',
    account_type: 'savings' as const,
    currency: 'ZAR'
  });

  useEffect(() => {
    if (isOpen && user) {
      loadUserAccounts();
      resetForm();
    }
  }, [isOpen, user]);

  const resetForm = () => {
    setStep(1);
    setSelectedBankAccount('');
    setSelectedCryptoWallet('');
    setWalletOwnershipConfirmed(false);
    setWalletType('');
    setWalletTypeUnderstood(false);
    setShowAddBankForm(false);
    setNewBankAccount({
      account_holder_name: '',
      bank_name: '',
      account_number: '',
      branch_code: '',
      account_type: 'savings',
      currency: 'ZAR'
    });
    setActualOwnerDetails({
      ownerName: '',
      ownerSurname: '',
      ownerIdNumber: '',
      ownerIdType: 'nationalId',
      ownerAddress: '',
      ownerCity: '',
      ownerPostalCode: '',
      ownerCountry: ''
    });
  };

  const loadUserAccounts = async () => {
    if (!user) return;

    try {
      const [bankAccountsResponse, cryptoWalletsResponse] = await Promise.all([
        supabase
          .from('bank_accounts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('crypto_wallets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (bankAccountsResponse.error) throw bankAccountsResponse.error;
      if (cryptoWalletsResponse.error) throw cryptoWalletsResponse.error;

      setBankAccounts(bankAccountsResponse.data || []);
      setCryptoWallets(cryptoWalletsResponse.data || []);
    } catch (error) {
      console.error('Error loading user accounts:', error);
      toast.error('Failed to load account information');
    }
  };

  const addBankAccount = async () => {
    if (!user) return;

    if (!newBankAccount.account_holder_name || !newBankAccount.bank_name || !newBankAccount.account_number) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert({
          user_id: user.id,
          ...newBankAccount
        })
        .select()
        .single();

      if (error) throw error;

      setBankAccounts(prev => [data, ...prev]);
      setSelectedBankAccount(data.id);
      setShowAddBankForm(false);
      toast.success('Bank account added successfully');
    } catch (error) {
      console.error('Error adding bank account:', error);
      toast.error('Failed to add bank account');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = async () => {
    if (!quote) return;

    // Validation based on quote type
    if (quote.quote_type === 'sell') {
      // For selling crypto, user needs bank account
      if (!selectedBankAccount) {
        toast.error('Please select a bank account to receive payment');
        return;
      }
    } else {
      // For buying crypto, user needs crypto wallet
      if (!selectedCryptoWallet) {
        toast.error('Please select a crypto wallet to receive cryptocurrency');
        return;
      }
    }

    if (!walletOwnershipConfirmed) {
      toast.error('Please confirm wallet ownership');
      return;
    }

    if (!walletType) {
      toast.error('Please specify if your wallet is hosted or unhosted');
      return;
    }

    if (!walletTypeUnderstood) {
      toast.error('Please confirm you understand the wallet type explanation');
      return;
    }

    setLoading(true);
    try {
      await onAccept(
        quote.id,
        selectedBankAccount || undefined,
        selectedCryptoWallet || undefined
      );
      onClose();
    } catch (error) {
      console.error('Error accepting quote:', error);
    } finally {
      setLoading(false);
    }
  };

  const canProceedToStep2 = () => {
    if (!quote) return false;
    
    if (quote.quote_type === 'sell') {
      return selectedBankAccount !== '';
    } else {
      return selectedCryptoWallet !== '';
    }
  };

  const canAcceptQuote = () => {
    return canProceedToStep2() && 
           walletOwnershipConfirmed && 
           walletType !== '' && 
           walletTypeUnderstood;
  };

  if (!quote) return null;

  const formatCurrency = (amount: number, currency: string) => {
    const decimals = currency === 'BTC' || currency === 'ETH' ? 8 : 2;
    return `${amount.toFixed(decimals)} ${currency}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Accept Quote - Verification Required
          </DialogTitle>
          <DialogDescription>
            Complete the verification steps below to accept your trading quote
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quote Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quote Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Trade Type:</span>
                <Badge variant={quote.quote_type === 'buy' ? 'default' : 'secondary'}>
                  {quote.quote_type.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>From:</span>
                <span className="font-mono">{formatCurrency(quote.from_amount, quote.from_currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>To:</span>
                <span className="font-mono">{formatCurrency(quote.net_amount, quote.to_currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Exchange Rate:</span>
                <span className="font-mono">{quote.exchange_rate.toFixed(8)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Total Fees:</span>
                <span className="font-mono">-{formatCurrency(quote.total_fee, quote.to_currency)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Account Selection */}
          <Card className={step === 1 ? 'border-blue-500' : 'border-gray-200'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === 1 ? 'bg-blue-600 text-white' : canProceedToStep2() ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {canProceedToStep2() ? <CheckCircle className="h-4 w-4" /> : '1'}
                </div>
                Select Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quote.quote_type === 'sell' ? (
                // Selling crypto - need bank account
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building className="h-4 w-4" />
                    <span>Select where you want to receive your {quote.to_currency}</span>
                  </div>
                  
                  {bankAccounts.length > 0 ? (
                    <div className="space-y-2">
                      <Label>Select Bank Account</Label>
                      <Select value={selectedBankAccount} onValueChange={setSelectedBankAccount}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a bank account" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              <div className="flex items-center gap-2">
                                <span>{account.bank_name}</span>
                                <span className="text-gray-500">•••{account.account_number.slice(-4)}</span>
                                <span className="text-gray-500">({account.currency})</span>
                                {account.is_verified && (
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}

                  {!showAddBankForm ? (
                    <Button
                      variant="outline"
                      onClick={() => setShowAddBankForm(true)}
                      className="w-full"
                    >
                      + Add New Bank Account
                    </Button>
                  ) : (
                    <Card className="border-dashed">
                      <CardHeader>
                        <CardTitle className="text-sm">Add New Bank Account</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="account_holder_name">Account Holder Name</Label>
                            <Input
                              id="account_holder_name"
                              value={newBankAccount.account_holder_name}
                              onChange={(e) => setNewBankAccount(prev => ({ ...prev, account_holder_name: e.target.value }))}
                              placeholder="Full name"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="bank_name">Bank Name</Label>
                            <Input
                              id="bank_name"
                              value={newBankAccount.bank_name}
                              onChange={(e) => setNewBankAccount(prev => ({ ...prev, bank_name: e.target.value }))}
                              placeholder="e.g., Standard Bank"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="account_number">Account Number</Label>
                            <Input
                              id="account_number"
                              value={newBankAccount.account_number}
                              onChange={(e) => setNewBankAccount(prev => ({ ...prev, account_number: e.target.value }))}
                              placeholder="Account number"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="branch_code">Branch Code</Label>
                            <Input
                              id="branch_code"
                              value={newBankAccount.branch_code}
                              onChange={(e) => setNewBankAccount(prev => ({ ...prev, branch_code: e.target.value }))}
                              placeholder="Branch code"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={addBankAccount}
                            disabled={loading}
                            size="sm"
                          >
                            {loading ? 'Adding...' : 'Add Account'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowAddBankForm(false)}
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                // Buying crypto - need crypto wallet
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Wallet className="h-4 w-4" />
                    <span>Select where you want to receive your {quote.to_currency}</span>
                  </div>
                  
                  {cryptoWallets.length > 0 ? (
                    <div className="space-y-2">
                      <Label>Select Crypto Wallet</Label>
                      <Select value={selectedCryptoWallet} onValueChange={setSelectedCryptoWallet}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a crypto wallet" />
                        </SelectTrigger>
                        <SelectContent>
                          {cryptoWallets.filter(w => w.currency === quote.to_currency).map((wallet) => (
                            <SelectItem key={wallet.id} value={wallet.id}>
                              <div className="flex items-center gap-2">
                                <span>{wallet.currency}</span>
                                <span className="text-gray-500 font-mono">
                                  {wallet.wallet_address.slice(0, 6)}...{wallet.wallet_address.slice(-4)}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {wallet.wallet_type}
                                </Badge>
                                {wallet.is_verified && (
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Wallet className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No {quote.to_currency} wallets found</p>
                      <p className="text-sm">Please add a wallet in the Wallets tab first</p>
                    </div>
                  )}
                </div>
              )}

              {canProceedToStep2() && (
                <Button
                  onClick={() => setStep(2)}
                  className="w-full"
                >
                  Continue to Verification
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Wallet Verification */}
          {step >= 2 && (
            <Card className={step === 2 ? 'border-blue-500' : 'border-gray-200'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    step === 2 ? 'bg-blue-600 text-white' : canAcceptQuote() ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {canAcceptQuote() ? <CheckCircle className="h-4 w-4" /> : '2'}
                  </div>
                  Wallet Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Wallet Ownership Confirmation */}
                <div className="space-y-3">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Wallet Ownership</Label>
                    <RadioGroup 
                      value={walletOwnershipConfirmed ? 'yes' : ''} 
                      onValueChange={(value) => setWalletOwnershipConfirmed(value === 'yes')}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-3 border rounded-lg">
                          <RadioGroupItem value="yes" id="owner-confirm-yes" className="mt-1" />
                          <div className="space-y-1">
                            <Label htmlFor="owner-confirm-yes" className="font-medium">Yes, I own this wallet</Label>
                            <p className="text-sm text-gray-600">
                              I confirm that I am the owner of the cryptocurrency wallet being used for this transaction and have full control over it.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 border rounded-lg">
                          <RadioGroupItem value="no" id="owner-confirm-no" className="mt-1" />
                          <div className="space-y-1">
                            <Label htmlFor="owner-confirm-no" className="font-medium">No, this wallet belongs to someone else</Label>
                            <p className="text-sm text-gray-600">
                              This wallet belongs to another person and I have proper authorization to use it for this transaction.
                            </p>
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <Separator />

                {/* Wallet Type Selection */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Please select either option, is your wallet:</Label>
                  <RadioGroup value={walletType} onValueChange={(value) => setWalletType(value as 'hosted' | 'unhosted')}>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 p-3 border rounded-lg">
                        <RadioGroupItem value="hosted" id="hosted" className="mt-1" />
                        <div className="space-y-1">
                          <Label htmlFor="hosted" className="font-medium">Hosted</Label>
                          <p className="text-sm text-gray-600">
                            A wallet where a third party (exchange or service provider) controls the private keys. 
                            Examples: Binance, Coinbase, Luno, Kraken.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 border rounded-lg">
                        <RadioGroupItem value="unhosted" id="unhosted" className="mt-1" />
                        <div className="space-y-1">
                          <Label htmlFor="unhosted" className="font-medium">Unhosted</Label>
                          <p className="text-sm text-gray-600">
                            A wallet where you control the private keys and have full control. 
                            Examples: MetaMask, Ledger, Trust Wallet, hardware wallets.
                          </p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Understanding Confirmation */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="wallet-type-understood"
                      checked={walletTypeUnderstood}
                      onCheckedChange={setWalletTypeUnderstood}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="wallet-type-understood" className="text-sm font-medium">
                        Understanding Confirmation
                      </Label>
                      <p className="text-sm text-gray-600">
                        I understand the difference between hosted and unhosted wallets and have correctly classified my wallet type above.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Information Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-blue-800">
                        Why do we need this information?
                      </p>
                      <p className="text-sm text-blue-700">
                        This information helps us comply with regulatory requirements and ensure proper transaction processing. 
                        Different wallet types may have different processing times and requirements.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warning Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-yellow-800">
                  Important Notice
                </p>
                <p className="text-sm text-yellow-700">
                  By accepting this quote, you agree that all provided information is accurate and that you understand 
                  the risks associated with cryptocurrency trading. This transaction will be processed according to 
                  our terms of service and regulatory requirements.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAcceptQuote}
              disabled={!canAcceptQuote() || loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Processing...' : 'Accept Quote'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteAcceptanceDialog;