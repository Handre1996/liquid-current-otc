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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, AdminQuote, Currency } from '@/types/trading';
import { toast } from 'sonner';
import { 
  Crown, 
  Plus, 
  Star, 
  Users, 
  FileText, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    first_name?: string;
    surname?: string;
  };
  created_at: string;
}

interface SuperUserManagerProps {
  currencies: Currency[];
}

const SuperUserManager = ({ currencies }: SuperUserManagerProps) => {
  const { user, session } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [adminQuotes, setAdminQuotes] = useState<AdminQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateQuoteDialog, setShowCreateQuoteDialog] = useState(false);
  const [showSuperUserDialog, setShowSuperUserDialog] = useState(false);
  const [deletingQuote, setDeletingQuote] = useState<string | null>(null);
  const [showDeleteQuoteDialog, setShowDeleteQuoteDialog] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<AdminQuote | null>(null);

  // SuperUser form state
  const [superUserNotes, setSuperUserNotes] = useState('');

  // Quote form state
  const [quoteForm, setQuoteForm] = useState({
    quote_type: 'buy' as 'buy' | 'sell',
    from_currency: '',
    to_currency: '',
    from_amount: '',
    exchange_rate: '',
    admin_fee: '0',
    withdrawal_fee: '0',
    special_rate_reason: '',
    admin_notes: '',
    expires_in_hours: '2' // Default to 2 hours now
  });

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
        loadUsers(),
        loadUserProfiles(),
        loadAdminQuotes()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      if (!session?.access_token) {
        throw new Error('No access token available');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/list-users`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const loadUserProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserProfiles(data || []);
    } catch (error) {
      console.error('Error loading user profiles:', error);
      setUserProfiles([]);
    }
  };

  const loadAdminQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdminQuotes(data || []);
    } catch (error) {
      console.error('Error loading admin quotes:', error);
      setAdminQuotes([]);
    }
  };

  const toggleSuperUser = async (userId: string, isSuperUser: boolean) => {
    try {
      if (isSuperUser) {
        // Remove SuperUser status
        const { error } = await supabase
          .from('user_profiles')
          .update({ 
            is_super_user: false,
            super_user_notes: null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Add SuperUser status
        const { error } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: userId,
            is_super_user: true,
            super_user_notes: superUserNotes,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (error) throw error;
      }

      await loadUserProfiles();
      setShowSuperUserDialog(false);
      setSuperUserNotes('');
      toast.success(isSuperUser ? 'SuperUser status removed' : 'SuperUser status granted');
    } catch (error) {
      console.error('Error updating SuperUser status:', error);
      toast.error('Failed to update SuperUser status');
    }
  };

  const createAdminQuote = async () => {
    if (!selectedUser || !user) return;

    try {
      // Validate form
      if (!quoteForm.from_currency || !quoteForm.to_currency || !quoteForm.from_amount || !quoteForm.exchange_rate) {
        toast.error('Please fill in all required fields');
        return;
      }

      const fromAmount = parseFloat(quoteForm.from_amount);
      const exchangeRate = parseFloat(quoteForm.exchange_rate);
      const adminFee = parseFloat(quoteForm.admin_fee);
      const withdrawalFee = parseFloat(quoteForm.withdrawal_fee);
      const expiresInHours = parseInt(quoteForm.expires_in_hours);

      if (isNaN(fromAmount) || isNaN(exchangeRate) || fromAmount <= 0 || exchangeRate <= 0) {
        toast.error('Please enter valid amounts and exchange rate');
        return;
      }

      const toAmount = fromAmount * exchangeRate;
      const totalFee = adminFee + withdrawalFee;
      const netAmount = toAmount - totalFee;

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiresInHours);

      const { data, error } = await supabase
        .from('admin_quotes')
        .insert({
          user_id: selectedUser.id,
          admin_id: user.id,
          quote_type: quoteForm.quote_type,
          from_currency: quoteForm.from_currency,
          to_currency: quoteForm.to_currency,
          from_amount: fromAmount,
          to_amount: toAmount,
          exchange_rate: exchangeRate,
          admin_fee: adminFee,
          withdrawal_fee: withdrawalFee,
          total_fee: totalFee,
          net_amount: netAmount,
          expires_at: expiresAt.toISOString(),
          admin_notes: quoteForm.admin_notes,
          special_rate_reason: quoteForm.special_rate_reason,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      await loadAdminQuotes();
      setShowCreateQuoteDialog(false);
      resetQuoteForm();
      toast.success('Custom quote created successfully');
    } catch (error) {
      console.error('Error creating admin quote:', error);
      toast.error('Failed to create custom quote');
    }
  };

  const deleteAdminQuote = async () => {
    if (!selectedQuote) return;
    
    setDeletingQuote(selectedQuote.id);
    
    try {
      // First update the status to cancelled
      const { error: updateError } = await supabase
        .from('admin_quotes')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString(),
          admin_notes: (selectedQuote.admin_notes || '') + '\nCancelled by admin.'
        })
        .eq('id', selectedQuote.id);
        
      if (updateError) throw updateError;
      
      // Refresh the quotes list
      await loadAdminQuotes();
      setShowDeleteQuoteDialog(false);
      setSelectedQuote(null);
      toast.success('Admin quote cancelled successfully');
    } catch (error) {
      console.error('Error cancelling admin quote:', error);
      toast.error('Failed to cancel admin quote');
    } finally {
      setDeletingQuote(null);
    }
  };

  const resetQuoteForm = () => {
    setQuoteForm({
      quote_type: 'buy',
      from_currency: '',
      to_currency: '',
      from_amount: '',
      exchange_rate: '',
      admin_fee: '0',
      withdrawal_fee: '0',
      special_rate_reason: '',
      admin_notes: '',
      expires_in_hours: '2' // Default to 2 hours now
    });
  };

  const getUserProfile = (userId: string) => {
    return userProfiles.find(p => p.user_id === userId);
  };

  const getUserFullName = (user: User) => {
    const firstName = user.user_metadata?.first_name || '';
    const surname = user.user_metadata?.surname || '';
    return firstName || surname ? `${firstName} ${surname}`.trim() : 'N/A';
  };

  const formatCurrency = (amount: number, currency: string) => {
    const currencyData = currencies.find(c => c.code === currency);
    const decimals = currencyData?.decimals || 2;
    return `${amount.toFixed(decimals)} ${currency}`;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'accepted':
        return 'default';
      case 'expired':
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const superUsers = users.filter(u => getUserProfile(u.id)?.is_super_user);
  const regularUsers = users.filter(u => !getUserProfile(u.id)?.is_super_user);

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access SuperUser management.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SuperUser Management</CardTitle>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            SuperUser Management
          </h2>
          <p className="text-gray-600">Manage SuperUsers and create custom quotes with special rates</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SuperUsers</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{superUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              Users with special rates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Admin Quotes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {adminQuotes.filter(q => q.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending custom quotes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="superusers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="superusers">SuperUsers ({superUsers.length})</TabsTrigger>
          <TabsTrigger value="quotes">Admin Quotes ({adminQuotes.length})</TabsTrigger>
          <TabsTrigger value="users">All Users ({users.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="superusers">
          <Card>
            <CardHeader>
              <CardTitle>SuperUsers</CardTitle>
              <CardDescription>
                Users with special trading privileges and custom rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {superUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No SuperUsers designated</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Grant SuperUser status to users for special rates
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Since</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {superUsers.map((user) => {
                        const profile = getUserProfile(user.id);
                        return (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Crown className="h-4 w-4 text-yellow-500" />
                                {getUserFullName(user)}
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {profile?.super_user_notes || '-'}
                            </TableCell>
                            <TableCell>
                              {profile ? new Date(profile.created_at).toLocaleDateString() : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowCreateQuoteDialog(true);
                                  }}
                                >
                                  Create Quote
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => toggleSuperUser(user.id, true)}
                                >
                                  Remove
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotes">
          <Card>
            <CardHeader>
              <CardTitle>Admin Quotes</CardTitle>
              <CardDescription>
                Custom quotes created by admins for SuperUsers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {adminQuotes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No admin quotes created</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Create custom quotes for SuperUsers
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminQuotes.map((quote) => {
                        const quoteUser = users.find(u => u.id === quote.user_id);
                        const isPending = quote.status === 'pending';
                        const isExpired = new Date(quote.expires_at) < new Date();
                        
                        return (
                          <TableRow key={quote.id}>
                            <TableCell>
                              <div className="font-medium">{quoteUser ? getUserFullName(quoteUser) : 'Unknown'}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={quote.quote_type === 'buy' ? 'default' : 'secondary'}>
                                {quote.quote_type.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatCurrency(quote.from_amount, quote.from_currency)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(quote.net_amount, quote.to_currency)}
                            </TableCell>
                            <TableCell className="font-mono">
                              {quote.exchange_rate.toFixed(8)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(quote.status)}>
                                {quote.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(quote.expires_at).toLocaleString()}
                              {isPending && isExpired && (
                                <div className="text-xs text-red-500">Expired</div>
                              )}
                            </TableCell>
                            <TableCell>
                              {new Date(quote.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {isPending && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedQuote(quote);
                                    setShowDeleteQuoteDialog(true);
                                  }}
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Manage user SuperUser status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => {
                      const profile = getUserProfile(user.id);
                      const isSuperUser = profile?.is_super_user || false;
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {isSuperUser && <Crown className="h-4 w-4 text-yellow-500" />}
                              {getUserFullName(user)}
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {isSuperUser ? (
                              <Badge variant="default" className="bg-yellow-500">
                                <Star className="h-3 w-3 mr-1" />
                                SuperUser
                              </Badge>
                            ) : (
                              <Badge variant="outline">Regular</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {isSuperUser ? (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowCreateQuoteDialog(true);
                                    }}
                                  >
                                    Create Quote
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => toggleSuperUser(user.id, true)}
                                  >
                                    Remove SuperUser
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowSuperUserDialog(true);
                                  }}
                                >
                                  <Star className="h-4 w-4 mr-1" />
                                  Make SuperUser
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* SuperUser Dialog */}
      <Dialog open={showSuperUserDialog} onOpenChange={setShowSuperUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant SuperUser Status</DialogTitle>
            <DialogDescription>
              Grant special trading privileges to {selectedUser ? getUserFullName(selectedUser) : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="super_user_notes">Notes (Optional)</Label>
              <Textarea
                id="super_user_notes"
                value={superUserNotes}
                onChange={(e) => setSuperUserNotes(e.target.value)}
                placeholder="Reason for granting SuperUser status..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSuperUserDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedUser && toggleSuperUser(selectedUser.id, false)}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <Star className="h-4 w-4 mr-1" />
              Grant SuperUser Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Quote Dialog */}
      <Dialog open={showCreateQuoteDialog} onOpenChange={setShowCreateQuoteDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Custom Quote</DialogTitle>
            <DialogDescription>
              Create a custom quote with special rates for {selectedUser ? getUserFullName(selectedUser) : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quote_type">Quote Type</Label>
                <Select
                  value={quoteForm.quote_type}
                  onValueChange={(value) => setQuoteForm(prev => ({ ...prev, quote_type: value as 'buy' | 'sell' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">Buy (User buys crypto)</SelectItem>
                    <SelectItem value="sell">Sell (User sells crypto)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expires_in_hours">Expires In (Hours)</Label>
                <Input
                  id="expires_in_hours"
                  type="number"
                  value={quoteForm.expires_in_hours}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, expires_in_hours: e.target.value }))}
                  min="1"
                  max="168"
                />
                <p className="text-xs text-gray-500">Default: 2 hours</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from_currency">From Currency</Label>
                <Select
                  value={quoteForm.from_currency}
                  onValueChange={(value) => setQuoteForm(prev => ({ ...prev, from_currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
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
              <div className="space-y-2">
                <Label htmlFor="to_currency">To Currency</Label>
                <Select
                  value={quoteForm.to_currency}
                  onValueChange={(value) => setQuoteForm(prev => ({ ...prev, to_currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from_amount">Amount ({quoteForm.from_currency || 'Currency'})</Label>
                <Input
                  id="from_amount"
                  type="number"
                  step="any"
                  value={quoteForm.from_amount}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, from_amount: e.target.value }))}
                  placeholder="Enter amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exchange_rate">Exchange Rate</Label>
                <Input
                  id="exchange_rate"
                  type="number"
                  step="any"
                  value={quoteForm.exchange_rate}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, exchange_rate: e.target.value }))}
                  placeholder="Custom rate"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin_fee">Admin Fee ({quoteForm.from_currency || 'Currency'})</Label>
                <Input
                  id="admin_fee"
                  type="number"
                  step="any"
                  value={quoteForm.admin_fee}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, admin_fee: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="withdrawal_fee">Withdrawal Fee ({quoteForm.to_currency || 'Currency'})</Label>
                <Input
                  id="withdrawal_fee"
                  type="number"
                  step="any"
                  value={quoteForm.withdrawal_fee}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, withdrawal_fee: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="special_rate_reason">Special Rate Reason</Label>
              <Input
                id="special_rate_reason"
                value={quoteForm.special_rate_reason}
                onChange={(e) => setQuoteForm(prev => ({ ...prev, special_rate_reason: e.target.value }))}
                placeholder="Reason for special rate (e.g., VIP client, bulk trade)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin_notes">Admin Notes</Label>
              <Textarea
                id="admin_notes"
                value={quoteForm.admin_notes}
                onChange={(e) => setQuoteForm(prev => ({ ...prev, admin_notes: e.target.value }))}
                placeholder="Internal notes about this quote..."
                rows={3}
              />
            </div>

            {/* Quote Preview */}
            {quoteForm.from_amount && quoteForm.exchange_rate && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Quote Preview</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>From:</strong> {parseFloat(quoteForm.from_amount || '0').toFixed(2)} {quoteForm.from_currency}</p>
                    <p><strong>Rate:</strong> {parseFloat(quoteForm.exchange_rate || '0').toFixed(8)}</p>
                    <p><strong>Gross Amount:</strong> {(parseFloat(quoteForm.from_amount || '0') * parseFloat(quoteForm.exchange_rate || '0')).toFixed(8)} {quoteForm.to_currency}</p>
                  </div>
                  <div>
                    <p><strong>Admin Fee:</strong> -{parseFloat(quoteForm.admin_fee || '0').toFixed(2)} {quoteForm.from_currency}</p>
                    <p><strong>Withdrawal Fee:</strong> -{parseFloat(quoteForm.withdrawal_fee || '0').toFixed(2)} {quoteForm.to_currency}</p>
                    <p><strong>Net Amount:</strong> {((parseFloat(quoteForm.from_amount || '0') * parseFloat(quoteForm.exchange_rate || '0')) - parseFloat(quoteForm.admin_fee || '0') - parseFloat(quoteForm.withdrawal_fee || '0')).toFixed(8)} {quoteForm.to_currency}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateQuoteDialog(false);
                resetQuoteForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={createAdminQuote}>
              Create Custom Quote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Quote Confirmation Dialog */}
      <Dialog open={showDeleteQuoteDialog} onOpenChange={setShowDeleteQuoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Admin Quote</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this admin quote? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedQuote && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Quote Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Type:</strong> {selectedQuote.quote_type.toUpperCase()}</p>
                    <p><strong>From:</strong> {formatCurrency(selectedQuote.from_amount, selectedQuote.from_currency)}</p>
                    <p><strong>To:</strong> {formatCurrency(selectedQuote.net_amount, selectedQuote.to_currency)}</p>
                  </div>
                  <div>
                    <p><strong>Rate:</strong> {selectedQuote.exchange_rate.toFixed(8)}</p>
                    <p><strong>Created:</strong> {new Date(selectedQuote.created_at).toLocaleDateString()}</p>
                    <p><strong>Expires:</strong> {new Date(selectedQuote.expires_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteQuoteDialog(false);
                setSelectedQuote(null);
              }}
            >
              Keep Quote
            </Button>
            <Button
              variant="destructive"
              onClick={deleteAdminQuote}
              disabled={deletingQuote !== null}
            >
              {deletingQuote ? 'Cancelling...' : 'Cancel Quote'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperUserManager;