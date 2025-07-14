import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Currency } from '@/types/trading';
import { toast } from 'sonner';
import { 
  Shield, 
  Plus, 
  Edit, 
  AlertTriangle,
  TrendingUp,
  Users,
  DollarSign,
  Clock
} from 'lucide-react';

interface TradingLimit {
  id: string;
  user_id: string;
  currency: string;
  daily_limit: number;
  monthly_limit: number;
  daily_used: number;
  monthly_used: number;
  last_reset_daily: string;
  last_reset_monthly: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  email: string;
  first_name?: string;
  surname?: string;
}

interface TradingLimitsManagerProps {
  currencies: Currency[];
}

const TradingLimitsManager = ({ currencies }: TradingLimitsManagerProps) => {
  const { user, session } = useAuth();
  const [tradingLimits, setTradingLimits] = useState<TradingLimit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedLimit, setSelectedLimit] = useState<TradingLimit | null>(null);

  const [limitForm, setLimitForm] = useState({
    user_id: '',
    currency: '',
    daily_limit: '',
    monthly_limit: ''
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
        loadTradingLimits(),
        loadUsers()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load trading limits data');
    } finally {
      setLoading(false);
    }
  };

  const loadTradingLimits = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_limits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTradingLimits(data || []);
    } catch (error) {
      console.error('Error loading trading limits:', error);
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

  const createTradingLimit = async () => {
    if (!limitForm.user_id || !limitForm.currency || !limitForm.daily_limit || !limitForm.monthly_limit) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('trading_limits')
        .insert({
          user_id: limitForm.user_id,
          currency: limitForm.currency,
          daily_limit: parseFloat(limitForm.daily_limit),
          monthly_limit: parseFloat(limitForm.monthly_limit),
          daily_used: 0,
          monthly_used: 0,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      setTradingLimits(prev => [data, ...prev]);
      setShowCreateDialog(false);
      resetForm();
      toast.success('Trading limit created successfully');
    } catch (error) {
      console.error('Error creating trading limit:', error);
      toast.error('Failed to create trading limit');
    }
  };

  const updateTradingLimit = async () => {
    if (!selectedLimit || !limitForm.daily_limit || !limitForm.monthly_limit) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('trading_limits')
        .update({
          daily_limit: parseFloat(limitForm.daily_limit),
          monthly_limit: parseFloat(limitForm.monthly_limit),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedLimit.id)
        .select()
        .single();

      if (error) throw error;

      setTradingLimits(prev => prev.map(limit => 
        limit.id === selectedLimit.id ? data : limit
      ));
      setShowEditDialog(false);
      setSelectedLimit(null);
      resetForm();
      toast.success('Trading limit updated successfully');
    } catch (error) {
      console.error('Error updating trading limit:', error);
      toast.error('Failed to update trading limit');
    }
  };

  const toggleLimitStatus = async (limitId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('trading_limits')
        .update({ 
          is_active: !isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', limitId);

      if (error) throw error;

      setTradingLimits(prev => prev.map(limit => 
        limit.id === limitId 
          ? { ...limit, is_active: !isActive }
          : limit
      ));

      toast.success(`Trading limit ${!isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling limit status:', error);
      toast.error('Failed to update limit status');
    }
  };

  const resetLimitUsage = async (limitId: string, resetType: 'daily' | 'monthly' | 'both') => {
    try {
      const updates: any = { updated_at: new Date().toISOString() };
      
      if (resetType === 'daily' || resetType === 'both') {
        updates.daily_used = 0;
        updates.last_reset_daily = new Date().toISOString();
      }
      
      if (resetType === 'monthly' || resetType === 'both') {
        updates.monthly_used = 0;
        updates.last_reset_monthly = new Date().toISOString();
      }

      const { error } = await supabase
        .from('trading_limits')
        .update(updates)
        .eq('id', limitId);

      if (error) throw error;

      await loadTradingLimits();
      toast.success(`${resetType} usage reset successfully`);
    } catch (error) {
      console.error('Error resetting limit usage:', error);
      toast.error('Failed to reset limit usage');
    }
  };

  const resetForm = () => {
    setLimitForm({
      user_id: '',
      currency: '',
      daily_limit: '',
      monthly_limit: ''
    });
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return 'Unknown User';
    
    const firstName = user.first_name || '';
    const surname = user.surname || '';
    return firstName || surname ? `${firstName} ${surname}`.trim() : user.email;
  };

  const getUserEmail = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.email || 'Unknown';
  };

  const formatCurrency = (amount: number, currency: string) => {
    const currencyData = currencies.find(c => c.code === currency);
    const decimals = currencyData?.decimals || 2;
    return `${amount.toFixed(decimals)} ${currency}`;
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageBadgeVariant = (percentage: number) => {
    if (percentage >= 90) return 'destructive';
    if (percentage >= 75) return 'secondary';
    return 'default';
  };

  // Filter limits based on search term and selected user
  const filteredLimits = tradingLimits.filter(limit => {
    const matchesSearch = searchTerm === '' || 
      getUserName(limit.user_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getUserEmail(limit.user_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      limit.currency.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = selectedUser === 'all' || limit.user_id === selectedUser;
    
    return matchesSearch && matchesUser;
  });

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access trading limits management.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trading Limits Management</CardTitle>
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
            <Shield className="h-6 w-6 text-blue-600" />
            Trading Limits Management
          </h2>
          <p className="text-gray-600">Manage user trading limits and monitor usage</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={resetForm}>
              <Plus className="h-4 w-4" />
              Create Limit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Trading Limit</DialogTitle>
              <DialogDescription>
                Set trading limits for a user and currency
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user">User</Label>
                <Select
                  value={limitForm.user_id}
                  onValueChange={(value) => setLimitForm(prev => ({ ...prev, user_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {getUserName(user.id)} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={limitForm.currency}
                  onValueChange={(value) => setLimitForm(prev => ({ ...prev, currency: value }))}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="daily_limit">Daily Limit</Label>
                  <Input
                    id="daily_limit"
                    type="number"
                    step="any"
                    value={limitForm.daily_limit}
                    onChange={(e) => setLimitForm(prev => ({ ...prev, daily_limit: e.target.value }))}
                    placeholder="Enter daily limit"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthly_limit">Monthly Limit</Label>
                  <Input
                    id="monthly_limit"
                    type="number"
                    step="any"
                    value={limitForm.monthly_limit}
                    onChange={(e) => setLimitForm(prev => ({ ...prev, monthly_limit: e.target.value }))}
                    placeholder="Enter monthly limit"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createTradingLimit}>
                Create Limit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Limits</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tradingLimits.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Limits</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tradingLimits.filter(l => l.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently enforced
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Near Limits</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {tradingLimits.filter(l => 
                getUsagePercentage(l.daily_used, l.daily_limit) >= 75 ||
                getUsagePercentage(l.monthly_used, l.monthly_limit) >= 75
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Above 75% usage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users with Limits</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(tradingLimits.map(l => l.user_id)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by user or currency..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger className="max-w-sm">
            <SelectValue placeholder="Filter by user" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {getUserName(user.id)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Trading Limits Table */}
      <Card>
        <CardHeader>
          <CardTitle>Trading Limits</CardTitle>
          <CardDescription>
            Monitor and manage user trading limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLimits.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No trading limits found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Daily Limit</TableHead>
                    <TableHead>Daily Used</TableHead>
                    <TableHead>Monthly Limit</TableHead>
                    <TableHead>Monthly Used</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLimits.map((limit) => {
                    const dailyPercentage = getUsagePercentage(limit.daily_used, limit.daily_limit);
                    const monthlyPercentage = getUsagePercentage(limit.monthly_used, limit.monthly_limit);
                    
                    return (
                      <TableRow key={limit.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{getUserName(limit.user_id)}</div>
                            <div className="text-sm text-gray-500">{getUserEmail(limit.user_id)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{limit.currency}</Badge>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(limit.daily_limit, limit.currency)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div>{formatCurrency(limit.daily_used, limit.currency)}</div>
                            <Badge variant={getUsageBadgeVariant(dailyPercentage)} className="text-xs">
                              {dailyPercentage.toFixed(1)}%
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(limit.monthly_limit, limit.currency)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div>{formatCurrency(limit.monthly_used, limit.currency)}</div>
                            <Badge variant={getUsageBadgeVariant(monthlyPercentage)} className="text-xs">
                              {monthlyPercentage.toFixed(1)}%
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={limit.is_active ? 'default' : 'secondary'}>
                            {limit.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedLimit(limit);
                                setLimitForm({
                                  user_id: limit.user_id,
                                  currency: limit.currency,
                                  daily_limit: limit.daily_limit.toString(),
                                  monthly_limit: limit.monthly_limit.toString()
                                });
                                setShowEditDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleLimitStatus(limit.id, limit.is_active)}
                            >
                              {limit.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resetLimitUsage(limit.id, 'both')}
                            >
                              Reset Usage
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

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Trading Limit</DialogTitle>
            <DialogDescription>
              Update trading limits for this user and currency
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>User</Label>
                <p className="text-sm">{selectedLimit ? getUserName(selectedLimit.user_id) : ''}</p>
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <p className="text-sm">{selectedLimit?.currency}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_daily_limit">Daily Limit</Label>
                <Input
                  id="edit_daily_limit"
                  type="number"
                  step="any"
                  value={limitForm.daily_limit}
                  onChange={(e) => setLimitForm(prev => ({ ...prev, daily_limit: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_monthly_limit">Monthly Limit</Label>
                <Input
                  id="edit_monthly_limit"
                  type="number"
                  step="any"
                  value={limitForm.monthly_limit}
                  onChange={(e) => setLimitForm(prev => ({ ...prev, monthly_limit: e.target.value }))}
                />
              </div>
            </div>

            {selectedLimit && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Current Usage</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Daily Used:</strong> {formatCurrency(selectedLimit.daily_used, selectedLimit.currency)}</p>
                    <p><strong>Monthly Used:</strong> {formatCurrency(selectedLimit.monthly_used, selectedLimit.currency)}</p>
                  </div>
                  <div>
                    <p><strong>Last Daily Reset:</strong> {new Date(selectedLimit.last_reset_daily).toLocaleDateString()}</p>
                    <p><strong>Last Monthly Reset:</strong> {new Date(selectedLimit.last_reset_monthly).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={updateTradingLimit}>
              Update Limit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TradingLimitsManager;