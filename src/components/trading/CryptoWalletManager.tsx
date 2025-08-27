import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CryptoWallet, Currency } from '@/types/trading';
import { toast } from 'sonner';
import { Plus, Upload, Check, X, Info, AlertTriangle, Network, Wallet } from 'lucide-react';

interface CryptoWalletManagerProps {
  currencies: Currency[];
}

// Chain/Network options for cryptocurrencies
const CRYPTO_CHAINS: Record<string, Array<{ id: string; name: string; description: string }>> = {
  'USDT': [
    { id: 'erc20', name: 'ERC20', description: 'Ethereum Network' },
    { id: 'trc20', name: 'TRC20', description: 'Tron Network' },
    { id: 'bep20', name: 'BEP20', description: 'Binance Smart Chain' },
    { id: 'polygon', name: 'Polygon', description: 'Polygon Network' }
  ],
  'USDC': [
    { id: 'erc20', name: 'ERC20', description: 'Ethereum Network' },
    { id: 'bep20', name: 'BEP20', description: 'Binance Smart Chain' },
    { id: 'polygon', name: 'Polygon', description: 'Polygon Network' },
    { id: 'solana', name: 'SPL', description: 'Solana Network' }
  ],
  'ETH': [
    { id: 'erc20', name: 'ERC20', description: 'Ethereum Mainnet' },
    { id: 'bep20', name: 'BEP20', description: 'Binance Smart Chain (Wrapped)' },
    { id: 'polygon', name: 'Polygon', description: 'Polygon Network (Wrapped)' }
  ],
  'BTC': [
    { id: 'bitcoin', name: 'Bitcoin', description: 'Bitcoin Mainnet' },
    { id: 'bep20', name: 'BEP20', description: 'Binance Smart Chain (Wrapped)' }
  ],
  'LTC': [
    { id: 'litecoin', name: 'Litecoin', description: 'Litecoin Mainnet' }
  ],
  'XRP': [
    { id: 'xrpl', name: 'XRPL', description: 'XRP Ledger' },
    { id: 'bep20', name: 'BEP20', description: 'Binance Smart Chain (Wrapped)' }
  ],
  'ADA': [
    { id: 'cardano', name: 'Cardano', description: 'Cardano Mainnet' },
    { id: 'bep20', name: 'BEP20', description: 'Binance Smart Chain (Wrapped)' }
  ],
  'DOT': [
    { id: 'polkadot', name: 'Polkadot', description: 'Polkadot Mainnet' },
    { id: 'bep20', name: 'BEP20', description: 'Binance Smart Chain (Wrapped)' }
  ],
  'LINK': [
    { id: 'erc20', name: 'ERC20', description: 'Ethereum Network' },
    { id: 'bep20', name: 'BEP20', description: 'Binance Smart Chain' }
  ],
  'SOL': [
    { id: 'solana', name: 'Solana', description: 'Solana Mainnet' },
    { id: 'bep20', name: 'BEP20', description: 'Binance Smart Chain (Wrapped)' }
  ]
};

const CryptoWalletManager = ({ currencies }: CryptoWalletManagerProps) => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingWallet, setIsAddingWallet] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const [newWallet, setNewWallet] = useState({
    currency: '',
    chain: '',
    wallet_address: '',
    wallet_type: 'personal' as const,
    exchange_name: ''
  });

  // Verification state
  const [walletOwnershipConfirmed, setWalletOwnershipConfirmed] = useState(false);
  const [isWalletOwner, setIsWalletOwner] = useState<'yes' | 'no' | ''>('');
  const [actualOwnerDetails, setActualOwnerDetails] = useState({
    ownerName: '',
    ownerSurname: '',
    ownerIdNumber: '',
    ownerIdType: 'nationalId' as 'nationalId' | 'passport',
    ownerAddress: '',
    ownerCity: '',
    ownerPostalCode: '',
    ownerCountry: ''
  });
  const [walletTypeClassification, setWalletTypeClassification] = useState<'hosted' | 'unhosted' | ''>('');
  const [walletTypeUnderstood, setWalletTypeUnderstood] = useState(false);

  useEffect(() => {
    if (user) {
      loadWallets();
    }
  }, [user]);

  const loadWallets = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crypto_wallets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWallets(data || []);
    } catch (error) {
      console.error('Error loading wallets:', error);
      toast.error('Failed to load crypto wallets');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewWallet({
      currency: '',
      chain: '',
      wallet_address: '',
      wallet_type: 'personal',
      exchange_name: ''
    });
    setWalletOwnershipConfirmed(false);
    setIsWalletOwner('');
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
    setWalletTypeClassification('');
    setWalletTypeUnderstood(false);
  };

  const getAvailableChains = () => {
    if (!newWallet.currency) return [];
    return CRYPTO_CHAINS[newWallet.currency] || [];
  };

  const shouldShowChainSelection = () => {
    return newWallet.currency !== '' && newWallet.currency in CRYPTO_CHAINS;
  };

  const canAddWallet = () => {
    const basicFieldsValid = newWallet.currency && 
                            newWallet.wallet_address && 
                            isWalletOwner !== '' &&
                            (isWalletOwner === 'yes' || (
                              actualOwnerDetails.ownerName &&
                              actualOwnerDetails.ownerSurname &&
                              actualOwnerDetails.ownerIdNumber
                            )) &&
                            walletTypeClassification !== '' && 
                            walletTypeUnderstood &&
                            (newWallet.wallet_type !== 'exchange' || newWallet.exchange_name);
    
    // If chain selection is required, check if chain is selected
    const chainValid = !shouldShowChainSelection() || newWallet.chain !== '';
    
    return basicFieldsValid && chainValid;
  };

  const addWallet = async () => {
    if (!user) return;

    if (!canAddWallet()) {
      toast.error('Please complete all required fields and confirmations');
      return;
    }

    setIsAddingWallet(true);
    try {
      const { data, error } = await supabase
        .from('crypto_wallets')
        .insert({
          user_id: user.id,
          currency: newWallet.currency,
          wallet_address: newWallet.wallet_address,
          wallet_type: newWallet.wallet_type,
          exchange_name: newWallet.wallet_type === 'exchange' ? newWallet.exchange_name : null
        })
        .select()
        .single();

      if (error) throw error;

      setWallets(prev => [data, ...prev]);
      resetForm();
      setShowAddDialog(false);
      toast.success('Crypto wallet added successfully');
    } catch (error) {
      console.error('Error adding wallet:', error);
      toast.error('Failed to add crypto wallet');
    } finally {
      setIsAddingWallet(false);
    }
  };

  const getCurrencyInfo = (code: string) => {
    return currencies.find(c => c.code === code);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crypto Wallets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Crypto Wallets</CardTitle>
            <CardDescription>
              Manage your cryptocurrency wallet addresses
            </CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" onClick={resetForm}>
                <Plus className="h-4 w-4" />
                Add Wallet
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Crypto Wallet</DialogTitle>
                <DialogDescription>
                  Add a cryptocurrency wallet address for receiving payments
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Basic Wallet Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Wallet Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Cryptocurrency</Label>
                      <Select
                        value={newWallet.currency}
                        onValueChange={(value) => setNewWallet(prev => ({ ...prev, currency: value, chain: '' }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select cryptocurrency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.id} value={currency.code}>
                              {currency.symbol} {currency.name} ({currency.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Chain/Network Selection */}
                    {shouldShowChainSelection() && (
                      <div className="space-y-2">
                        <Label htmlFor="chain" className="flex items-center gap-2">
                          <Network className="h-4 w-4" />
                          Blockchain Network
                        </Label>
                        <Select
                          value={newWallet.chain}
                          onValueChange={(value) => setNewWallet(prev => ({ ...prev, chain: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${newWallet.currency} network`} />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableChains().map((chain) => (
                              <SelectItem key={chain.id} value={chain.id}>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold">{chain.name}</span>
                                  <span className="text-gray-500">({chain.description})</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <Network className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-700">
                              <p className="font-medium mb-1">Network Selection Important!</p>
                              <p>Make sure to select the correct network that matches your wallet. Sending to the wrong network may result in permanent loss of funds.</p>
                              <ul className="mt-2 space-y-1 text-xs">
                                <li>• <strong>ERC20:</strong> Ethereum network (higher fees)</li>
                                <li>• <strong>TRC20:</strong> Tron network (lower fees)</li>
                                <li>• <strong>BEP20:</strong> Binance Smart Chain (low fees)</li>
                                <li>• <strong>Polygon:</strong> Polygon network (very low fees)</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="wallet_address">Wallet Address</Label>
                      <Input
                        id="wallet_address"
                        value={newWallet.wallet_address}
                        onChange={(e) => setNewWallet(prev => ({ ...prev, wallet_address: e.target.value }))}
                        placeholder="Enter wallet address"
                        className="font-mono"
                      />
                      {shouldShowChainSelection() && newWallet.chain && (
                        <p className="text-xs text-gray-500">
                          Make sure this address is compatible with {CRYPTO_CHAINS[newWallet.currency]?.find(c => c.id === newWallet.chain)?.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label>Wallet Type</Label>
                      <RadioGroup
                        value={newWallet.wallet_type}
                        onValueChange={(value) => setNewWallet(prev => ({ ...prev, wallet_type: value as any }))}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="personal" id="personal" />
                          <Label htmlFor="personal">Personal Wallet (Self-custody)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="exchange" id="exchange" />
                          <Label htmlFor="exchange">Exchange Wallet</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {newWallet.wallet_type === 'exchange' && (
                      <div className="space-y-2">
                        <Label htmlFor="exchange_name">Exchange Name</Label>
                        <Input
                          id="exchange_name"
                          value={newWallet.exchange_name}
                          onChange={(e) => setNewWallet(prev => ({ ...prev, exchange_name: e.target.value }))}
                          placeholder="e.g., Binance, Coinbase"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Separator />

                {/* Wallet Verification Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Wallet Verification</CardTitle>
                    <CardDescription>
                      Please confirm the following information for regulatory compliance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Wallet Ownership Confirmation */}
                    <div className="space-y-3">
                      <div className="space-y-4">
                        <Label className="text-sm font-medium">Wallet Ownership</Label>
                        <RadioGroup 
                          value={isWalletOwner} 
                          onValueChange={(value) => {
                            setIsWalletOwner(value as 'yes' | 'no');
                            if (value === 'yes') {
                              setActualOwnerDetails({
                                ownerName: '',
                                ownerSurname: '',
                                ownerIdNumber: '',
                                ownerIdType: 'nationalId'
                              });
                            }
                          }}
                        >
                          <div className="space-y-3">
                            <div className="flex items-start space-x-3 p-3 border rounded-lg">
                              <RadioGroupItem value="yes" id="owner-yes" className="mt-1" />
                              <div className="space-y-1">
                                <Label htmlFor="owner-yes" className="font-medium">Yes, this is my wallet</Label>
                                <p className="text-sm text-gray-600">
                                  I confirm that I am the owner of this cryptocurrency wallet and have full control over it.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3 p-3 border rounded-lg">
                              <RadioGroupItem value="no" id="owner-no" className="mt-1" />
                              <div className="space-y-1">
                                <Label htmlFor="owner-no" className="font-medium">No, this wallet belongs to someone else</Label>
                                <p className="text-sm text-gray-600">
                                  This wallet belongs to another person and I have authorization to use it for this transaction.
                                </p>
                              </div>
                            </div>
                          </div>
                        </RadioGroup>
                        
                        {/* Owner Details Form */}
                        {isWalletOwner === 'no' && (
                          <Card className="border-orange-200 bg-orange-50">
                            <CardHeader>
                              <CardTitle className="text-base text-orange-800">Actual Wallet Owner Details</CardTitle>
                              <CardDescription className="text-orange-700">
                                Please provide the details of the person who owns this wallet
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="owner-name">Owner's First Name</Label>
                                  <Input
                                    id="owner-name"
                                    value={actualOwnerDetails.ownerName}
                                    onChange={(e) => setActualOwnerDetails(prev => ({ 
                                      ...prev, 
                                      ownerName: e.target.value 
                                    }))}
                                    placeholder="Enter first name"
                                    required={isWalletOwner === 'no'}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="owner-surname">Owner's Surname</Label>
                                  <Input
                                    id="owner-surname"
                                    value={actualOwnerDetails.ownerSurname}
                                    onChange={(e) => setActualOwnerDetails(prev => ({ 
                                      ...prev, 
                                      ownerSurname: e.target.value 
                                    }))}
                                    placeholder="Enter surname"
                                    required={isWalletOwner === 'no'}
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Owner's ID Document Type</Label>
                                <RadioGroup 
                                  value={actualOwnerDetails.ownerIdType} 
                                  onValueChange={(value) => setActualOwnerDetails(prev => ({ 
                                    ...prev, 
                                    ownerIdType: value as 'nationalId' | 'passport',
                                    ownerIdNumber: '' // Reset ID number when type changes
                                  }))}
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="nationalId" id="owner-nationalId" />
                                    <Label htmlFor="owner-nationalId">National ID</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="passport" id="owner-passport" />
                                    <Label htmlFor="owner-passport">Passport</Label>
                                  </div>
                                </RadioGroup>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="owner-id-number">
                                  {actualOwnerDetails.ownerIdType === 'passport' ? 'Passport Number' : 'National ID Number'}
                                </Label>
                                <Input
                                  id="owner-id-number"
                                  value={actualOwnerDetails.ownerIdNumber}
                                  onChange={(e) => setActualOwnerDetails(prev => ({ 
                                    ...prev, 
                                    ownerIdNumber: e.target.value 
                                  }))}
                                  placeholder={`Enter ${actualOwnerDetails.ownerIdType === 'passport' ? 'passport number' : 'national ID number'}`}
                                  required={isWalletOwner === 'no'}
                                />
                              </div>
                              
                              <div className="bg-orange-100 border border-orange-200 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                                  <div className="text-sm text-orange-800">
                                    <p className="font-medium mb-1">Important Notice</p>
                                    <p>
                                      By providing these details, you confirm that you have proper authorization from the wallet owner 
                                      to conduct transactions on their behalf and that all provided information is accurate.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>

                      <Separator />

                      {/* Wallet Type Classification */}
                      <div className="space-y-4">
                        <Label className="text-sm font-medium">Please select either option, is your wallet:</Label>
                        <RadioGroup 
                          value={walletTypeClassification} 
                          onValueChange={(value) => setWalletTypeClassification(value as 'hosted' | 'unhosted')}
                        >
                          <div className="space-y-3">
                            <div className="flex items-start space-x-3 p-3 border rounded-lg">
                              <RadioGroupItem value="hosted" id="hosted-classification" className="mt-1" />
                              <div className="space-y-1">
                                <Label htmlFor="hosted-classification" className="font-medium">Hosted</Label>
                                <p className="text-sm text-gray-600">
                                  A wallet where a third party (exchange or service provider) controls the private keys. 
                                  Examples: Binance, Coinbase, Luno, Kraken.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3 p-3 border rounded-lg">
                              <RadioGroupItem value="unhosted" id="unhosted-classification" className="mt-1" />
                              <div className="space-y-1">
                                <Label htmlFor="unhosted-classification" className="font-medium">Unhosted</Label>
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
                              What is a hosted wallet?
                            </p>
                            <p className="text-sm text-blue-700">
                              A hosted wallet (also known as a custodial wallet) is one where a third party (such as a cryptocurrency exchange or financial service provider) controls the wallet and holds the private keys on behalf of the user. Common examples include wallets on platforms like Binance, Coinbase, or Luno.
                            </p>
                            <p className="text-sm text-blue-700">
                              In contrast, an unhosted wallet is one where the user holds their own private keys and has full control, such as wallets created using MetaMask, Ledger, or Trust Wallet.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Warning Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-yellow-800">
                        Important Notice
                      </p>
                      <p className="text-sm text-yellow-700">
                        This information helps us comply with regulatory requirements and ensure proper transaction processing. 
                        Different wallet types may have different processing times and requirements. Always double-check the network compatibility before adding your wallet.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addWallet}
                    disabled={!canAddWallet() || isAddingWallet}
                    className="flex-1"
                  >
                    {isAddingWallet ? 'Adding...' : 'Add Wallet'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {wallets.length === 0 ? (
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No crypto wallets added</p>
            <p className="text-sm text-gray-400 mt-2">
              Add wallet addresses to receive cryptocurrency payments
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {wallets.map((wallet) => {
              const currency = getCurrencyInfo(wallet.currency);
              return (
                <div key={wallet.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {currency?.symbol} {currency?.name} ({wallet.currency})
                        {wallet.wallet_type === 'exchange' && (
                          <Badge variant="outline">Exchange</Badge>
                        )}
                      </h3>
                      {wallet.exchange_name && (
                        <p className="text-sm text-gray-600">
                          {wallet.exchange_name}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 font-mono break-all">
                        {wallet.wallet_address}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {wallet.is_verified ? (
                        <Badge variant="default" className="flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <X className="h-3 w-3" />
                          Unverified
                        </Badge>
                      )}
                    </div>
                  </div>

                  {!wallet.is_verified && (
                    <div className="mt-3 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                      Wallet address is pending verification. You can use it for trades once verified.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CryptoWalletManager;