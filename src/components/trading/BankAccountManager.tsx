import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BankAccount } from '@/types/trading';
import { toast } from 'sonner';
import { Plus, Upload, Check, X } from 'lucide-react';

const BankAccountManager = () => {
  const { user } = useAuth();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [uploadingProof, setUploadingProof] = useState<string | null>(null);

  const [newAccount, setNewAccount] = useState({
    account_holder_name: '',
    bank_name: '',
    account_number: '',
    branch_code: '',
    account_type: 'savings' as const,
    currency: 'ZAR'
  });

  useEffect(() => {
    if (user) {
      loadBankAccounts();
    }
  }, [user]);

  const loadBankAccounts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBankAccounts(data || []);
    } catch (error) {
      console.error('Error loading bank accounts:', error);
      toast.error('Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  };

  const addBankAccount = async () => {
    if (!user) return;

    if (!newAccount.account_holder_name || !newAccount.bank_name || !newAccount.account_number) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsAddingAccount(true);
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert({
          user_id: user.id,
          ...newAccount
        })
        .select()
        .single();

      if (error) throw error;

      setBankAccounts(prev => [data, ...prev]);
      setNewAccount({
        account_holder_name: '',
        bank_name: '',
        account_number: '',
        branch_code: '',
        account_type: 'savings',
        currency: 'ZAR'
      });
      toast.success('Bank account added successfully');
    } catch (error) {
      console.error('Error adding bank account:', error);
      toast.error('Failed to add bank account');
    } finally {
      setIsAddingAccount(false);
    }
  };

  const uploadProofOfAccount = async (accountId: string, file: File) => {
    setUploadingProof(accountId);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `bank_proof_${accountId}.${fileExt}`;
      const filePath = `bank_proofs/${user?.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('kyc_documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Update bank account with proof document path
      const { error: updateError } = await supabase
        .from('bank_accounts')
        .update({ proof_document_path: filePath })
        .eq('id', accountId);

      if (updateError) throw updateError;

      // Update local state
      setBankAccounts(prev =>
        prev.map(account =>
          account.id === accountId
            ? { ...account, proof_document_path: filePath }
            : account
        )
      );

      toast.success('Proof of account uploaded successfully');
    } catch (error) {
      console.error('Error uploading proof:', error);
      toast.error('Failed to upload proof of account');
    } finally {
      setUploadingProof(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bank Accounts</CardTitle>
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
            <CardTitle>Bank Accounts</CardTitle>
            <CardDescription>
              Manage your bank accounts for fiat withdrawals
            </CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Bank Account</DialogTitle>
                <DialogDescription>
                  Add a new bank account for receiving fiat payments
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="account_holder_name">Account Holder Name</Label>
                  <Input
                    id="account_holder_name"
                    value={newAccount.account_holder_name}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, account_holder_name: e.target.value }))}
                    placeholder="Full name as on bank account"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input
                    id="bank_name"
                    value={newAccount.bank_name}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, bank_name: e.target.value }))}
                    placeholder="e.g., Standard Bank"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="account_number">Account Number</Label>
                    <Input
                      id="account_number"
                      value={newAccount.account_number}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, account_number: e.target.value }))}
                      placeholder="Account number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch_code">Branch Code</Label>
                    <Input
                      id="branch_code"
                      value={newAccount.branch_code}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, branch_code: e.target.value }))}
                      placeholder="Branch code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="account_type">Account Type</Label>
                    <Select
                      value={newAccount.account_type}
                      onValueChange={(value) => setNewAccount(prev => ({ ...prev, account_type: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="savings">Savings</SelectItem>
                        <SelectItem value="current">Current</SelectItem>
                        <SelectItem value="transmission">Transmission</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={newAccount.currency}
                      onValueChange={(value) => setNewAccount(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
                        <SelectItem value="NAD">NAD - Namibian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={addBankAccount}
                  disabled={isAddingAccount}
                  className="w-full"
                >
                  {isAddingAccount ? 'Adding...' : 'Add Bank Account'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {bankAccounts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No bank accounts added</p>
            <p className="text-sm text-gray-400 mt-2">
              Add a bank account to receive fiat payments
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bankAccounts.map((account) => (
              <div key={account.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{account.bank_name}</h3>
                    <p className="text-sm text-gray-600">
                      {account.account_holder_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {account.account_number} • {account.account_type} • {account.currency}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {account.is_verified ? (
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

                {!account.proof_document_path && (
                  <div className="mt-3">
                    <Label htmlFor={`proof-${account.id}`} className="text-sm">
                      Upload Proof of Account
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        id={`proof-${account.id}`}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            uploadProofOfAccount(account.id, file);
                          }
                        }}
                        disabled={uploadingProof === account.id}
                      />
                      {uploadingProof === account.id && (
                        <div className="animate-spin">
                          <Upload className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {account.proof_document_path && !account.is_verified && (
                  <div className="mt-3 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                    Proof of account uploaded. Awaiting verification.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BankAccountManager;