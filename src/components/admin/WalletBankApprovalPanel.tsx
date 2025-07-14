import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BankAccount, CryptoWallet } from '@/types/trading';
import { toast } from 'sonner';
import { 
  Check, 
  X, 
  Eye, 
  Download, 
  Building, 
  Wallet, 
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  first_name?: string;
  surname?: string;
}

interface BankAccountWithUser extends BankAccount {
  user?: User;
}

interface CryptoWalletWithUser extends CryptoWallet {
  user?: User;
}

const WalletBankApprovalPanel = () => {
  const { user } = useAuth();
  const [bankAccounts, setBankAccounts] = useState<BankAccountWithUser[]>([]);
  const [cryptoWallets, setCryptoWallets] = useState<CryptoWalletWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<BankAccountWithUser | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<CryptoWalletWithUser | null>(null);
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const isAdmin = user?.email?.endsWith('@liquidcurrent.com');

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadBankAccounts(),
        loadCryptoWallets()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load wallet and bank account data');
    } finally {
      setLoading(false);
    }
  };

  const loadBankAccounts = async () => {
    try {
      // First, fetch all bank accounts
      const { data: accounts, error: accountsError } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (accountsError) throw accountsError;

      if (!accounts || accounts.length === 0) {
        setBankAccounts([]);
        return;
      }

      // Extract unique user IDs
      const userIds = [...new Set(accounts.map(account => account.user_id))];

      // Fetch user details from the users table
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, first_name, surname')
        .in('id', userIds);

      if (usersError) throw usersError;

      // Create a map of users for quick lookup
      const userMap = new Map(users?.map(user => [user.id, user]) || []);

      // Combine bank accounts with user data
      const accountsWithUsers = accounts.map(account => ({
        ...account,
        user: userMap.get(account.user_id)
      }));

      setBankAccounts(accountsWithUsers);
    } catch (error) {
      console.error('Error loading bank accounts:', error);
      setBankAccounts([]);
    }
  };

  const loadCryptoWallets = async () => {
    try {
      // First, fetch all crypto wallets
      const { data: wallets, error: walletsError } = await supabase
        .from('crypto_wallets')
        .select('*')
        .order('created_at', { ascending: false });

      if (walletsError) throw walletsError;

      if (!wallets || wallets.length === 0) {
        setCryptoWallets([]);
        return;
      }

      // Extract unique user IDs
      const userIds = [...new Set(wallets.map(wallet => wallet.user_id))];

      // Fetch user details from the users table
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, first_name, surname')
        .in('id', userIds);

      if (usersError) throw usersError;

      // Create a map of users for quick lookup
      const userMap = new Map(users?.map(user => [user.id, user]) || []);

      // Combine crypto wallets with user data
      const walletsWithUsers = wallets.map(wallet => ({
        ...wallet,
        user: userMap.get(wallet.user_id)
      }));

      setCryptoWallets(walletsWithUsers);
    } catch (error) {
      console.error('Error loading crypto wallets:', error);
      setCryptoWallets([]);
    }
  };

  const approveBankAccount = async (accountId: string) => {
    setActionLoading(accountId);
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .update({ 
          is_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', accountId);

      if (error) throw error;

      setBankAccounts(prev => prev.map(account => 
        account.id === accountId 
          ? { ...account, is_verified: true }
          : account
      ));

      toast.success('Bank account approved successfully');
      setShowBankDialog(false);
      setSelectedAccount(null);
    } catch (error) {
      console.error('Error approving bank account:', error);
      toast.error('Failed to approve bank account');
    } finally {
      setActionLoading(null);
    }
  };

  const rejectBankAccount = async (accountId: string, reason: string) => {
    if (!reason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setActionLoading(accountId);
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .update({ 
          is_verified: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', accountId);

      if (error) throw error;

      setBankAccounts(prev => prev.map(account => 
        account.id === accountId 
          ? { ...account, is_verified: false }
          : account
      ));

      toast.success('Bank account rejected');
      setShowBankDialog(false);
      setSelectedAccount(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting bank account:', error);
      toast.error('Failed to reject bank account');
    } finally {
      setActionLoading(null);
    }
  };

  const approveCryptoWallet = async (walletId: string) => {
    setActionLoading(walletId);
    try {
      const { error } = await supabase
        .from('crypto_wallets')
        .update({ 
          is_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', walletId);

      if (error) throw error;

      setCryptoWallets(prev => prev.map(wallet => 
        wallet.id === walletId 
          ? { ...wallet, is_verified: true }
          : wallet
      ));

      toast.success('Crypto wallet approved successfully');
      setShowWalletDialog(false);
      setSelectedWallet(null);
    } catch (error) {
      console.error('Error approving crypto wallet:', error);
      toast.error('Failed to approve crypto wallet');
    } finally {
      setActionLoading(null);
    }
  };

  const rejectCryptoWallet = async (walletId: string, reason: string) => {
    if (!reason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setActionLoading(walletId);
    try {
      const { error } = await supabase
        .from('crypto_wallets')
        .update({ 
          is_verified: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', walletId);

      if (error) throw error;

      setCryptoWallets(prev => prev.map(wallet => 
        wallet.id === walletId 
          ? { ...wallet, is_verified: false }
          : wallet
      ));

      toast.success('Crypto wallet rejected');
      setShowWalletDialog(false);
      setSelectedWallet(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting crypto wallet:', error);
      toast.error('Failed to reject crypto wallet');
    } finally {
      setActionLoading(null);
    }
  };

  const downloadProofDocument = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('kyc_documents')
        .download(filePath);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'proof_document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading proof document:', error);
      toast.error('Failed to download proof document');
    }
  };

  const getStatusBadge = (isVerified: boolean) => {
    return isVerified ? (
      <Badge variant="default\" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Verified
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    );
  };

  const getUserFullName = (user?: User) => {
    if (!user) return 'Unknown User';
    const firstName = user.first_name || '';
    const surname = user.surname || '';
    return firstName || surname ? `${firstName} ${surname}`.trim() : user.email;
  };

  // Filter data based on search term
  const filteredBankAccounts = bankAccounts.filter(account => 
    getUserFullName(account.user).toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.account_number.includes(searchTerm)
  );

  const filteredCryptoWallets = cryptoWallets.filter(wallet => 
    getUserFullName(wallet.user).toLowerCase().includes(searchTerm.toLowerCase()) ||
    wallet.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wallet.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wallet.wallet_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access wallet and bank account approvals.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet & Bank Account Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingBankAccounts = filteredBankAccounts.filter(a => !a.is_verified);
  const verifiedBankAccounts = filteredBankAccounts.filter(a => a.is_verified);
  const pendingCryptoWallets = filteredCryptoWallets.filter(w => !w.is_verified);
  const verifiedCryptoWallets = filteredCryptoWallets.filter(w => w.is_verified);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Wallet & Bank Account Approvals</h2>
          <p className="text-gray-600">Review and approve user bank accounts and crypto wallets</p>
        </div>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search accounts and wallets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80"
          />
          <Button onClick={loadData} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bank Accounts</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingBankAccounts.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Bank Accounts</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{verifiedBankAccounts.length}</div>
            <p className="text-xs text-muted-foreground">
              Successfully verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Crypto Wallets</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingCryptoWallets.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Crypto Wallets</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{verifiedCryptoWallets.length}</div>
            <p className="text-xs text-muted-foreground">
              Successfully verified
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bank-accounts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bank-accounts">
            Bank Accounts ({filteredBankAccounts.length})
          </TabsTrigger>
          <TabsTrigger value="crypto-wallets">
            Crypto Wallets ({filteredCryptoWallets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bank-accounts">
          <Card>
            <CardHeader>
              <CardTitle>Bank Account Verification</CardTitle>
              <CardDescription>
                Review and approve user bank account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredBankAccounts.length === 0 ? (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No bank accounts found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Bank Details</TableHead>
                        <TableHead>Account Info</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBankAccounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{getUserFullName(account.user)}</div>
                              <div className="text-sm text-gray-500">{account.user?.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{account.bank_name}</div>
                              <div className="text-sm text-gray-500">
                                {account.account_holder_name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-mono text-sm">•••{account.account_number.slice(-4)}</div>
                              <div className="text-sm text-gray-500">
                                {account.account_type} • {account.currency}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(account.is_verified)}
                          </TableCell>
                          <TableCell>
                            {new Date(account.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedAccount(account);
                                  setShowBankDialog(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {account.proof_document_path && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => downloadProofDocument(account.proof_document_path!)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crypto-wallets">
          <Card>
            <CardHeader>
              <CardTitle>Crypto Wallet Verification</CardTitle>
              <CardDescription>
                Review and approve user cryptocurrency wallet addresses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredCryptoWallets.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No crypto wallets found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Wallet Address</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCryptoWallets.map((wallet) => (
                        <TableRow key={wallet.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{getUserFullName(wallet.user)}</div>
                              <div className="text-sm text-gray-500">{wallet.user?.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{wallet.currency}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-sm max-w-xs truncate">
                              {wallet.wallet_address}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="capitalize">{wallet.wallet_type}</div>
                              {wallet.exchange_name && (
                                <div className="text-sm text-gray-500">{wallet.exchange_name}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(wallet.is_verified)}
                          </TableCell>
                          <TableCell>
                            {new Date(wallet.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedWallet(wallet);
                                setShowWalletDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bank Account Review Dialog */}
      <Dialog open={showBankDialog} onOpenChange={setShowBankDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Review Bank Account</DialogTitle>
            <DialogDescription>
              Review and approve or reject this bank account
            </DialogDescription>
          </DialogHeader>

          {selectedAccount && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Account Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>User:</strong> {getUserFullName(selectedAccount.user)}</p>
                    <p><strong>Email:</strong> {selectedAccount.user?.email}</p>
                    <p><strong>Bank:</strong> {selectedAccount.bank_name}</p>
                    <p><strong>Account Holder:</strong> {selectedAccount.account_holder_name}</p>
                  </div>
                  <div>
                    <p><strong>Account Number:</strong> {selectedAccount.account_number}</p>
                    <p><strong>Branch Code:</strong> {selectedAccount.branch_code || 'N/A'}</p>
                    <p><strong>Account Type:</strong> {selectedAccount.account_type}</p>
                    <p><strong>Currency:</strong> {selectedAccount.currency}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Current Status:</span>
                {getStatusBadge(selectedAccount.is_verified)}
              </div>

              {selectedAccount.proof_document_path && (
                <div className="space-y-2">
                  <Label>Proof Document</Label>
                  <Button
                    variant="outline"
                    onClick={() => downloadProofDocument(selectedAccount.proof_document_path!)}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Download Proof Document
                  </Button>
                </div>
              )}

              {!selectedAccount.is_verified && (
                <div className="space-y-2">
                  <Label htmlFor="rejection-reason">Rejection Reason (if rejecting)</Label>
                  <Textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a reason for rejection..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowBankDialog(false);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            {selectedAccount && !selectedAccount.is_verified && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => rejectBankAccount(selectedAccount.id, rejectionReason)}
                  disabled={actionLoading === selectedAccount.id}
                >
                  <X className="h-4 w-4 mr-1" />
                  {actionLoading === selectedAccount.id ? 'Rejecting...' : 'Reject'}
                </Button>
                <Button
                  onClick={() => approveBankAccount(selectedAccount.id)}
                  disabled={actionLoading === selectedAccount.id}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-1" />
                  {actionLoading === selectedAccount.id ? 'Approving...' : 'Approve'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Crypto Wallet Review Dialog */}
      <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Review Crypto Wallet</DialogTitle>
            <DialogDescription>
              Review and approve or reject this cryptocurrency wallet
            </DialogDescription>
          </DialogHeader>

          {selectedWallet && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Wallet Details</h4>
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div>
                    <p><strong>User:</strong> {getUserFullName(selectedWallet.user)}</p>
                    <p><strong>Email:</strong> {selectedWallet.user?.email}</p>
                    <p><strong>Currency:</strong> {selectedWallet.currency}</p>
                    <p><strong>Wallet Type:</strong> {selectedWallet.wallet_type}</p>
                    {selectedWallet.exchange_name && (
                      <p><strong>Exchange:</strong> {selectedWallet.exchange_name}</p>
                    )}
                  </div>
                  <div>
                    <p><strong>Wallet Address:</strong></p>
                    <p className="font-mono text-xs break-all bg-white p-2 rounded border">
                      {selectedWallet.wallet_address}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Current Status:</span>
                {getStatusBadge(selectedWallet.is_verified)}
              </div>

              {!selectedWallet.is_verified && (
                <div className="space-y-2">
                  <Label htmlFor="wallet-rejection-reason">Rejection Reason (if rejecting)</Label>
                  <Textarea
                    id="wallet-rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a reason for rejection..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowWalletDialog(false);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            {selectedWallet && !selectedWallet.is_verified && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => rejectCryptoWallet(selectedWallet.id, rejectionReason)}
                  disabled={actionLoading === selectedWallet.id}
                >
                  <X className="h-4 w-4 mr-1" />
                  {actionLoading === selectedWallet.id ? 'Rejecting...' : 'Reject'}
                </Button>
                <Button
                  onClick={() => approveCryptoWallet(selectedWallet.id)}
                  disabled={actionLoading === selectedWallet.id}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-1" />
                  {actionLoading === selectedWallet.id ? 'Approving...' : 'Approve'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletBankApprovalPanel;