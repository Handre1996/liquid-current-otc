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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { OTCQuote, Currency } from '@/types/trading';
import { toast } from 'sonner';
import { 
  Activity, 
  Clock, 
  Check, 
  X, 
  Eye,
  DollarSign,
  AlertTriangle,
  FileText,
  TrendingUp,
  TrendingDown,
  Hash,
  User,
  Calendar
} from 'lucide-react';

interface QuoteWithUser extends OTCQuote {
  user_email?: string;
  user_name?: string;
}

interface QuoteManagementPanelProps {
  currencies: Currency[];
}

const QuoteManagementPanel = ({ currencies }: QuoteManagementPanelProps) => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<QuoteWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<QuoteWithUser | null>(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [processAction, setProcessAction] = useState<'approve' | 'reject'>('approve');

  const isAdmin = user?.email?.endsWith('@liquidcurrent.com') || user?.email?.endsWith('@liquidcurrent.co.za');

  useEffect(() => {
    if (isAdmin) {
      loadQuotes();
    }
  }, [isAdmin]);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      // Get all quotes with user information
      const { data: quotesData, error: quotesError } = await supabase
        .from('otc_quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (quotesError) throw quotesError;

      if (!quotesData || quotesData.length === 0) {
        setQuotes([]);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(quotesData.map(quote => quote.user_id))];

      // Get user information
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email, first_name, surname')
        .in('id', userIds);

      if (usersError) throw usersError;

      // Create user lookup map
      const userMap = new Map(usersData?.map(user => [
        user.id, 
        {
          email: user.email,
          name: `${user.first_name || ''} ${user.surname || ''}`.trim() || user.email
        }
      ]) || []);

      // Combine quotes with user data
      const quotesWithUsers = quotesData.map(quote => ({
        ...quote,
        user_email: userMap.get(quote.user_id)?.email || 'Unknown',
        user_name: userMap.get(quote.user_id)?.name || 'Unknown User'
      }));

      setQuotes(quotesWithUsers);
    } catch (error) {
      console.error('Error loading quotes:', error);
      toast.error('Failed to load quotes');
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  const generateTransactionId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `TXN-${timestamp}-${random}`.toUpperCase();
  };

  const processQuote = async () => {
    if (!selectedQuote) return;

    if (processAction === 'approve' && !transactionId.trim()) {
      toast.error('Please enter a transaction ID');
      return;
    }

    setProcessing(true);
    try {
      if (processAction === 'approve') {
        // Create an order from the quote
        const orderData = {
          user_id: selectedQuote.user_id,
          quote_id: selectedQuote.id,
          order_type: selectedQuote.quote_type,
          from_currency: selectedQuote.from_currency,
          to_currency: selectedQuote.to_currency,
          from_amount: selectedQuote.from_amount,
          to_amount: selectedQuote.to_amount,
          exchange_rate: selectedQuote.exchange_rate,
          total_fee: selectedQuote.total_fee,
          net_amount: selectedQuote.net_amount,
          transaction_id: transactionId,
          status: 'completed',
          admin_notes: adminNotes
        };

        const { error: orderError } = await supabase
          .from('otc_orders')
          .insert(orderData);

        if (orderError) throw orderError;

        // Update quote status to accepted
        const { error: quoteError } = await supabase
          .from('otc_quotes')
          .update({ status: 'accepted' })
          .eq('id', selectedQuote.id);

        if (quoteError) throw quoteError;

        toast.success(`Quote approved and processed with Transaction ID: ${transactionId}`);
      } else {
        // Reject the quote
        const { error } = await supabase
          .from('otc_quotes')
          .update({ 
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedQuote.id);

        if (error) throw error;

        toast.success('Quote rejected successfully');
      }

      // Refresh quotes list
      await loadQuotes();
      
      // Close dialog and reset form
      setShowProcessDialog(false);
      setSelectedQuote(null);
      setTransactionId('');
      setAdminNotes('');
      setProcessAction('approve');
    } catch (error) {
      console.error(`Error ${processAction}ing quote:`, error);
      toast.error(`Failed to ${processAction} quote`);
    } finally {
      setProcessing(false);
    }
  };

  const openProcessDialog = (quote: QuoteWithUser, action: 'approve' | 'reject') => {
    setSelectedQuote(quote);
    setProcessAction(action);
    
    if (action === 'approve') {
      // Generate a default transaction ID
      setTransactionId(generateTransactionId());
    } else {
      setTransactionId('');
    }
    
    setShowProcessDialog(true);
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
        return 'outline';
    }
  };

  // Filter quotes based on search term
  const filteredQuotes = quotes.filter(quote => 
    quote.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.from_currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.to_currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingQuotes = filteredQuotes.filter(q => q.status === 'pending' && new Date(q.expires_at) > new Date());
  const expiredQuotes = filteredQuotes.filter(q => q.status === 'pending' && new Date(q.expires_at) <= new Date());
  const processedQuotes = filteredQuotes.filter(q => q.status !== 'pending');

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access quote management.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quote Management</CardTitle>
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
            <Activity className="h-6 w-6 text-blue-600" />
            Quote Management
          </h2>
          <p className="text-gray-600">Process user quotes and assign transaction IDs</p>
        </div>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search quotes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80"
          />
          <Button onClick={loadQuotes} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingQuotes.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Quotes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiredQuotes.length}</div>
            <p className="text-xs text-muted-foreground">
              Past expiry time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed Quotes</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{processedQuotes.length}</div>
            <p className="text-xs text-muted-foreground">
              Completed or cancelled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quotes.reduce((sum, quote) => sum + quote.from_amount, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total quote value
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending ({pendingQuotes.length})</TabsTrigger>
          <TabsTrigger value="expired">Expired ({expiredQuotes.length})</TabsTrigger>
          <TabsTrigger value="processed">Processed ({processedQuotes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <QuoteTable
            quotes={pendingQuotes}
            title="Pending Quotes"
            description="Active quotes awaiting admin processing"
            currencies={currencies}
            onProcess={openProcessDialog}
            showActions={true}
          />
        </TabsContent>

        <TabsContent value="expired">
          <QuoteTable
            quotes={expiredQuotes}
            title="Expired Quotes" 
            description="Quotes that have passed their expiry time"
            currencies={currencies}
            onProcess={openProcessDialog}
            showActions={false}
          />
        </TabsContent>

        <TabsContent value="processed">
          <QuoteTable
            quotes={processedQuotes}
            title="Processed Quotes"
            description="Quotes that have been approved or rejected"
            currencies={currencies}
            onProcess={openProcessDialog}
            showActions={false}
          />
        </TabsContent>
      </Tabs>

      {/* Process Quote Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {processAction === 'approve' ? 'Process Quote' : 'Reject Quote'}
            </DialogTitle>
            <DialogDescription>
              {processAction === 'approve' 
                ? 'Approve this quote and assign a transaction ID'
                : 'Reject this quote with a reason'
              }
            </DialogDescription>
          </DialogHeader>

          {selectedQuote && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Quote Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>User:</strong> {selectedQuote.user_name}</p>
                    <p><strong>Email:</strong> {selectedQuote.user_email}</p>
                    <p><strong>Type:</strong> {selectedQuote.quote_type.toUpperCase()}</p>
                    <p><strong>From:</strong> {formatCurrency(selectedQuote.from_amount, selectedQuote.from_currency)}</p>
                  </div>
                  <div>
                    <p><strong>To:</strong> {formatCurrency(selectedQuote.to_amount, selectedQuote.to_currency)}</p>
                    <p><strong>Net Amount:</strong> {formatCurrency(selectedQuote.net_amount, selectedQuote.to_currency)}</p>
                    <p><strong>Rate:</strong> {selectedQuote.exchange_rate.toFixed(8)}</p>
                    <p><strong>Total Fee:</strong> {formatCurrency(selectedQuote.total_fee, selectedQuote.to_currency)}</p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p><strong>Created:</strong> {new Date(selectedQuote.created_at).toLocaleString()}</p>
                  <p><strong>Expires:</strong> {new Date(selectedQuote.expires_at).toLocaleString()}</p>
                  <p><strong>Quote ID:</strong> <span className="font-mono text-xs">{selectedQuote.id}</span></p>
                </div>
              </div>

              {processAction === 'approve' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="transaction_id">Transaction ID</Label>
                    <Input
                      id="transaction_id"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter transaction ID"
                      className="font-mono"
                    />
                    <p className="text-xs text-gray-500">
                      This will be shown to the user as proof of processing
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="admin_notes">Admin Notes (Optional)</Label>
                    <Textarea
                      id="admin_notes"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add any notes about this transaction..."
                      rows={3}
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Processing Action:</p>
                        <p>This will create a completed order with the provided transaction ID and mark the quote as accepted.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="rejection_notes">Rejection Reason</Label>
                  <Textarea
                    id="rejection_notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Provide a reason for rejecting this quote..."
                    rows={3}
                    required
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowProcessDialog(false);
                setSelectedQuote(null);
                setTransactionId('');
                setAdminNotes('');
                setProcessAction('approve');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={processQuote}
              disabled={processing}
              className={processAction === 'approve' 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-red-600 hover:bg-red-700"
              }
            >
              {processing ? 'Processing...' : (processAction === 'approve' ? 'Approve & Process' : 'Reject Quote')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Quote Table Component
interface QuoteTableProps {
  quotes: QuoteWithUser[];
  title: string;
  description: string;
  currencies: Currency[];
  onProcess: (quote: QuoteWithUser, action: 'approve' | 'reject') => void;
  showActions: boolean;
}

const QuoteTable = ({ quotes, title, description, currencies, onProcess, showActions }: QuoteTableProps) => {
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
        return 'outline';
    }
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) <= new Date();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {quotes.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No quotes found</p>
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
                  <TableHead>Net Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Created</TableHead>
                  {showActions && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{quote.user_name}</div>
                        <div className="text-sm text-gray-500">{quote.user_email}</div>
                      </div>
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
                      {formatCurrency(quote.to_amount, quote.to_currency)}
                    </TableCell>
                    <TableCell className="font-mono">
                      {quote.exchange_rate.toFixed(8)}
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      {formatCurrency(quote.net_amount, quote.to_currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(quote.status)}>
                        {quote.status}
                        {quote.status === 'pending' && isExpired(quote.expires_at) && ' (Expired)'}
                      </Badge>
                    </TableCell>
                    <TableCell className={isExpired(quote.expires_at) ? 'text-red-600' : ''}>
                      {new Date(quote.expires_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {new Date(quote.created_at).toLocaleDateString()}
                    </TableCell>
                    {showActions && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onProcess(quote, 'reject')}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => onProcess(quote, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Process
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuoteManagementPanel;