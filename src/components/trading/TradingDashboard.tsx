import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { tradingService } from '@/services/tradingService';
import { priceService } from '@/services/priceService';
import { OTCQuote, OTCOrder, Currency, AdminQuote, UserProfile } from '@/types/trading';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Footer from '@/components/Footer';
import QuoteGenerator from './QuoteGenerator';
import OrderHistory from './OrderHistory';
import BankAccountManager from './BankAccountManager';
import CryptoWalletManager from './CryptoWalletManager';
import QuoteAcceptanceDialog from './QuoteAcceptanceDialog';
import { cn } from '@/lib/utils';
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  FileText, 
  AlertTriangle, 
  X, 
  Crown, 
  Star, 
  MessageCircle,
  Calculator,
  DollarSign,
  History,
  Building,
  Wallet,
  ChevronRight,
  Menu,
  Activity
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
}

const TradingDashboard = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<OTCQuote[]>([]);
  const [adminQuotes, setAdminQuotes] = useState<AdminQuote[]>([]);
  const [orders, setOrders] = useState<OTCOrder[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rejectingQuote, setRejectingQuote] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<OTCQuote | null>(null);
  const [showAcceptanceDialog, setShowAcceptanceDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('trade');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if user is admin based on email domain
  const isAdmin = user?.email?.endsWith('@liquidcurrent.com') || user?.email?.endsWith('@liquidcurrent.co.za');

  const sidebarItems: SidebarItem[] = [
    {
      id: 'trade',
      label: 'New Trade',
      icon: Calculator,
      description: 'Generate quotes & start trading',
      badge: 'Start Here'
    },
    {
      id: 'quotes',
      label: 'Active Quotes',
      icon: DollarSign,
      description: 'Review & accept pending quotes'
    },
    {
      id: 'orders',
      label: 'Order History',
      icon: History,
      description: 'View completed transactions'
    },
    {
      id: 'banking',
      label: 'Banking',
      icon: Building,
      description: 'Manage bank accounts'
    },
    {
      id: 'wallets',
      label: 'Wallets',
      icon: Wallet,
      description: 'Manage crypto wallets'
    }
  ];

  useEffect(() => {
    if (user) {
      loadDashboardData();
      // Only set up automatic price updates for admin users
      if (isAdmin) {
        const interval = setInterval(updatePrices, 5 * 60 * 1000);
        return () => clearInterval(interval);
      }
    }
  }, [user, isAdmin]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load currencies first
      const currenciesData = await loadCurrencies();
      setCurrencies(currenciesData);

      // Load user profile to check SuperUser status
      const profileData = await loadUserProfile();
      setUserProfile(profileData);

      // Then load quotes and orders
      const [quotesData, adminQuotesData, ordersData] = await Promise.all([
        tradingService.getUserQuotes(user.id),
        loadAdminQuotes(),
        tradingService.getUserOrders(user.id)
      ]);

      setQuotes(quotesData);
      setAdminQuotes(adminQuotesData);
      setOrders(ordersData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrencies = async (): Promise<Currency[]> => {
    try {
      const { data, error } = await supabase
        .from('currencies')
        .select('*')
        .eq('is_active', true)
        .order('type', { ascending: true })
        .order('code', { ascending: true });

      if (error) {
        console.error('Error loading currencies:', error);
        throw error;
      }

      console.log('Loaded currencies:', data);
      return data || [];
    } catch (error) {
      console.error('Error loading currencies:', error);
      toast.error('Failed to load currencies');
      return [];
    }
  };

  const loadUserProfile = async (): Promise<UserProfile | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  };

  const loadAdminQuotes = async (): Promise<AdminQuote[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('admin_quotes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading admin quotes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error loading admin quotes:', error);
      return [];
    }
  };

  const updatePrices = async () => {
    // Only allow admin users to update prices
    if (!isAdmin) {
      toast.error('Only administrators can update exchange rates');
      return;
    }

    setRefreshing(true);
    try {
      await priceService.updateExchangeRates();
      toast.success('Prices updated');
    } catch (error) {
      console.error('Error updating prices:', error);
      toast.error('Failed to update prices');
    } finally {
      setRefreshing(false);
    }
  };

  const rejectQuote = async (quoteId: string, isAdminQuote = false) => {
    setRejectingQuote(quoteId);
    try {
      const table = isAdminQuote ? 'admin_quotes' : 'otc_quotes';
      const { error } = await supabase
        .from(table)
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId);

      if (error) throw error;

      // Update local state
      if (isAdminQuote) {
        setAdminQuotes(prev => prev.map(quote => 
          quote.id === quoteId 
            ? { ...quote, status: 'cancelled' as const }
            : quote
        ));
      } else {
        setQuotes(prev => prev.map(quote => 
          quote.id === quoteId 
            ? { ...quote, status: 'cancelled' as const }
            : quote
        ));
      }

      toast.success('Quote rejected successfully');
    } catch (error) {
      console.error('Error rejecting quote:', error);
      toast.error('Failed to reject quote');
    } finally {
      setRejectingQuote(null);
    }
  };

  const handleAcceptQuote = async (quoteId: string, bankAccountId?: string, cryptoWalletId?: string) => {
    try {
      const order = await tradingService.acceptQuote(quoteId, bankAccountId, cryptoWalletId);
      if (order) {
        toast.success('Quote accepted successfully! Your order has been created.');
        await loadDashboardData(); // Refresh data
      }
    } catch (error: any) {
      console.error('Error accepting quote:', error);
      toast.error(error.message || 'Failed to accept quote');
      throw error; // Re-throw to let the dialog handle it
    }
  };

  const handleAcceptAdminQuote = async (adminQuoteId: string, bankAccountId?: string, cryptoWalletId?: string) => {
    try {
      // For admin quotes, we need to create an order directly
      const adminQuote = adminQuotes.find(q => q.id === adminQuoteId);
      if (!adminQuote) throw new Error('Admin quote not found');

      // Generate transaction ID for the order
      const timestamp = Date.now().toString(36);
      const shortQuoteId = adminQuoteId.slice(-8);
      const transactionId = `ADMIN-${shortQuoteId}-${timestamp}`.toUpperCase();

      // Create order from admin quote
      const orderData = {
        user_id: adminQuote.user_id,
        quote_id: adminQuoteId,
        order_type: adminQuote.quote_type,
        from_currency: adminQuote.from_currency,
        to_currency: adminQuote.to_currency,
        from_amount: adminQuote.from_amount,
        to_amount: adminQuote.to_amount,
        exchange_rate: adminQuote.exchange_rate,
        total_fee: adminQuote.total_fee,
        net_amount: adminQuote.net_amount,
        bank_account_id: bankAccountId,
        crypto_wallet_id: cryptoWalletId,
        transaction_id: transactionId,
        status: 'payment_pending' as const
      };

      const { data: order, error: orderError } = await supabase
        .from('otc_orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Update admin quote status
      await supabase
        .from('admin_quotes')
        .update({ status: 'accepted' })
        .eq('id', adminQuoteId);

      toast.success('Admin quote accepted successfully! Your order has been created.');
      await loadDashboardData(); // Refresh data
    } catch (error: any) {
      console.error('Error accepting admin quote:', error);
      toast.error(error.message || 'Failed to accept admin quote');
      throw error;
    }
  };

  const openAcceptanceDialog = (quote: OTCQuote) => {
    setSelectedQuote(quote);
    setShowAcceptanceDialog(true);
  };

  const closeAcceptanceDialog = () => {
    setSelectedQuote(null);
    setShowAcceptanceDialog(false);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
      case 'payment_pending':
        return 'secondary';
      case 'processing':
      case 'payment_confirmed':
        return 'outline';
      case 'cancelled':
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const currencyData = currencies.find(c => c.code === currency);
    const decimals = currencyData?.decimals || 2;
    return `${amount.toFixed(decimals)} ${currency}`;
  };

  const generateTransactionId = (quoteId: string) => {
    // Generate a unique transaction ID based on quote ID and timestamp
    const timestamp = Date.now().toString(36);
    const shortQuoteId = quoteId.slice(-8);
    return `TXN-${shortQuoteId}-${timestamp}`.toUpperCase();
  };

  const openWhatsAppSupport = () => {
    // Format the message
    let message = "Hello Liquid Current OTC Desk Support,\n\n";
    
    if (user) {
      message += `I'm ${user.email} and I need assistance with my trading account.\n\n`;
    }
    
    message += "Please help me with my inquiry.\n\nThank you!";
    
    // Format the phone number and encode the message
    const phoneNumber = "+971 58 573 0141"; // Updated WhatsApp support number
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp with the pre-filled message
    window.open(`https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`, '_blank');
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSidebarOpen(false); // Close mobile sidebar when selecting item
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'trade':
        return (
          <div className="space-y-6">
            {userProfile?.is_super_user ? (
              <Card className="border-yellowAccent/30 bg-gradient-to-br from-yellowAccent/10 to-greenAccent/10 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-yellowAccent/20 to-greenAccent/20 border-b border-yellowAccent/30">
                  <CardTitle className="flex items-center gap-2 text-navy dark:text-foam font-heading">
                    <Crown className="h-5 w-5 text-yellowAccent" />
                    SuperUser Trading
                  </CardTitle>
                  <CardDescription className="text-navy/80 dark:text-foam/80 font-body">
                    As a SuperUser, you have access to special rates. Contact our admin team for custom quotes with preferential pricing.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-blanc dark:bg-navy/50 rounded-lg p-6 border border-yellowAccent/30 shadow-sm">
                    <h3 className="text-lg font-heading font-semibold mb-4 text-navy dark:text-foam">How SuperUser Trading Works</h3>
                    <div className="space-y-3 text-sm font-body text-navy/80 dark:text-foam/80">
                      <div className="flex items-start gap-2">
                        <span className="bg-gradient-to-r from-yellowAccent to-greenAccent text-blanc rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                        <span>Contact our admin team with your trading requirements</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="bg-gradient-to-r from-yellowAccent to-greenAccent text-blanc rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                        <span>Admin will create a custom quote with special rates for you</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="bg-gradient-to-r from-yellowAccent to-greenAccent text-blanc rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                        <span>Review and accept your custom quote in the "Active Quotes" section</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="bg-gradient-to-r from-yellowAccent to-greenAccent text-blanc rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                        <span>Complete your trade with preferential pricing</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button 
                        onClick={openWhatsAppSupport}
                        className="bg-gradient-to-r from-greenAccent to-teal hover:from-greenAccent/90 hover:to-teal/90 text-blanc font-body flex items-center gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Contact Admin via WhatsApp
                      </Button>
                    </div>
                    <div className="mt-6 p-4 bg-gradient-to-r from-yellowAccent/20 to-greenAccent/20 rounded-lg border border-yellowAccent/30">
                      <p className="text-sm font-body text-navy dark:text-foam">
                        <strong>Note:</strong> You can still use the regular quote generator below, but as a SuperUser, 
                        you're entitled to better rates through our custom quote system.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}
            
            <QuoteGenerator 
              currencies={currencies}
              onQuoteGenerated={loadDashboardData}
            />
          </div>
        );
      case 'quotes':
        return renderActiveQuotes();
      case 'orders':
        return <OrderHistory orders={orders} currencies={currencies} />;
      case 'banking':
        return <BankAccountManager />;
      case 'wallets':
        return <CryptoWalletManager currencies={currencies.filter(c => c.type === 'crypto')} />;
      default:
        return null;
    }
  };

  const renderActiveQuotes = () => {
    const activeQuotes = quotes.filter(q => q.status === 'pending' && new Date(q.expires_at) > new Date());
    const activeAdminQuotes = adminQuotes.filter(q => q.status === 'pending' && new Date(q.expires_at) > new Date());

    return (
      <Card className="shadow-lg border-navy/20 dark:border-foam/20">
        <CardHeader className="bg-gradient-to-r from-foam/30 to-ivory/50 dark:from-navy/50 dark:to-teal/30 border-b border-navy/20 dark:border-foam/20">
          <CardTitle className="text-xl font-heading text-navy dark:text-foam">Active Quotes</CardTitle>
          <CardDescription className="font-body text-navy/70 dark:text-foam/70">
            Your pending quotes that are still valid
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-gradient-to-br from-blanc to-foam/20 dark:from-navy/30 dark:to-teal/20">
          {activeQuotes.length === 0 && activeAdminQuotes.length === 0 ? (
            <div className="text-center py-8">
              <p className="font-body text-navy/60 dark:text-foam/60">No active quotes. Generate a new quote to start trading.</p>
              <div className="mt-4">
                <p className="text-sm font-body text-navy/50 dark:text-foam/50 mb-4">Ready to trade? Follow these steps:</p>
                <div className="bg-gradient-to-r from-foam/30 to-ivory/50 dark:from-teal/20 dark:to-navy/30 rounded-lg p-4 text-left">
                  <ol className="text-sm font-body space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="bg-gradient-to-r from-navy to-teal text-blanc rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                      <span>Go to <strong>"New Trade"</strong> section</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-gradient-to-r from-navy to-teal text-blanc rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                      <span>Select trade type and currencies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-gradient-to-r from-navy to-teal text-blanc rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                      <span>Enter amount and generate quote</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-gradient-to-r from-navy to-teal text-blanc rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                      <span>Review and accept your quote here</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Admin Quotes (SuperUser only) */}
              {userProfile?.is_super_user && activeAdminQuotes.map((quote) => (
                <div key={quote.id} className="border rounded-lg p-4 sm:p-6 bg-gradient-to-r from-yellowAccent/10 to-greenAccent/10 border-yellowAccent/30 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <h3 className="font-heading font-semibold text-base sm:text-lg text-navy dark:text-foam flex items-center gap-2">
                        <Crown className="h-4 w-4 text-yellowAccent" />
                        ADMIN QUOTE: {quote.quote_type.toUpperCase()}: {formatCurrency(quote.from_amount, quote.from_currency)} → {formatCurrency(quote.net_amount, quote.to_currency)}
                      </h3>
                      <p className="text-xs sm:text-sm font-body text-navy/70 dark:text-foam/70 font-mono break-all">
                        Admin Quote ID: {quote.id}
                      </p>
                      {quote.special_rate_reason && (
                        <p className="text-xs sm:text-sm font-body text-navy/70 dark:text-foam/70 mt-1">
                          <strong>Special Rate Reason:</strong> {quote.special_rate_reason}
                        </p>
                      )}
                    </div>
                    <Badge variant="default" className="bg-gradient-to-r from-yellowAccent to-greenAccent text-navy font-body self-start">
                      Admin Quote
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4">
                    <div className="space-y-2">
                      <h4 className="font-heading font-medium text-navy dark:text-foam text-sm sm:text-base">Quote Details</h4>
                      <div className="bg-blanc dark:bg-navy/50 rounded p-3 text-xs sm:text-sm font-body space-y-1 shadow-sm">
                        <div className="flex justify-between">
                          <span>Exchange Rate:</span>
                          <span className="font-mono">{quote.exchange_rate.toFixed(8)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gross Amount:</span>
                          <span className="font-mono">{formatCurrency(quote.to_amount, quote.to_currency)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-heading font-medium text-navy dark:text-foam text-sm sm:text-base">Fee Breakdown</h4>
                      <div className="bg-blanc dark:bg-navy/50 rounded p-3 text-xs sm:text-sm font-body space-y-1 shadow-sm">
                        <div className="flex justify-between text-redAccent">
                          <span>Admin Fee:</span>
                          <span className="font-mono">-{formatCurrency(quote.admin_fee, quote.from_currency)}</span>
                        </div>
                        <div className="flex justify-between text-redAccent">
                          <span>Withdrawal Fee:</span>
                          <span className="font-mono">-{formatCurrency(quote.withdrawal_fee, quote.to_currency)}</span>
                        </div>
                        <div className="flex justify-between font-medium text-greenAccent border-t pt-1">
                          <span>Net Amount:</span>
                          <span className="font-mono">{formatCurrency(quote.net_amount, quote.to_currency)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {quote.admin_notes && (
                    <div className="bg-gradient-to-r from-foam/30 to-ivory/50 dark:from-teal/20 dark:to-navy/30 border border-navy/20 dark:border-foam/20 rounded p-3 mb-4 shadow-sm">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-navy dark:text-foam mt-0.5 flex-shrink-0" />
                        <div className="text-xs font-body text-navy dark:text-foam">
                          <p className="font-medium mb-1">Admin Notes:</p>
                          <p>{quote.admin_notes}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                    <div className="text-xs font-body text-navy/50 dark:text-foam/50 space-y-1">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Expires: {new Date(quote.expires_at).toLocaleString()}</span>
                      </div>
                      <div>Created: {new Date(quote.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rejectQuote(quote.id, true)}
                        disabled={rejectingQuote === quote.id}
                        className="w-full sm:w-auto text-redAccent border-redAccent/30 hover:bg-redAccent/10 bg-blanc dark:bg-navy font-body"
                      >
                        <X className="h-4 w-4 mr-1" />
                        {rejectingQuote === quote.id ? 'Rejecting...' : 'Reject Quote'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAcceptAdminQuote(quote.id)}
                        className="w-full sm:w-auto bg-gradient-to-r from-yellowAccent to-greenAccent hover:from-yellowAccent/90 hover:to-greenAccent/90 text-navy dark:text-blanc font-body"
                      >
                        Accept Admin Quote
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Regular Quotes */}
              {activeQuotes.map((quote) => (
                <div key={quote.id} className="border rounded-lg p-4 sm:p-6 bg-gradient-to-r from-foam/30 to-ivory/50 dark:from-teal/20 dark:to-navy/30 border-navy/20 dark:border-foam/20 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <h3 className="font-heading font-semibold text-base sm:text-lg text-navy dark:text-foam">
                        {quote.quote_type.toUpperCase()}: {formatCurrency(quote.from_amount, quote.from_currency)} → {formatCurrency(quote.net_amount, quote.to_currency)}
                      </h3>
                      <p className="text-xs sm:text-sm font-body text-navy/70 dark:text-foam/70 font-mono break-all">
                        Transaction ID: {generateTransactionId(quote.id)}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(quote.status)} className="text-xs sm:text-sm self-start font-body">
                      {quote.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4">
                    <div className="space-y-2">
                      <h4 className="font-heading font-medium text-navy dark:text-foam text-sm sm:text-base">Quote Details</h4>
                      <div className="bg-blanc dark:bg-navy/50 rounded p-3 text-xs sm:text-sm font-body space-y-1 shadow-sm">
                        <div className="flex justify-between">
                          <span>Exchange Rate:</span>
                          <span className="font-mono">{quote.exchange_rate.toFixed(8)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gross Amount:</span>
                          <span className="font-mono">{formatCurrency(quote.to_amount, quote.to_currency)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-heading font-medium text-navy dark:text-foam text-sm sm:text-base">Fee Breakdown</h4>
                      <div className="bg-blanc dark:bg-navy/50 rounded p-3 text-xs sm:text-sm font-body space-y-1 shadow-sm">
                        <div className="flex justify-between text-redAccent">
                          <span>Admin Fee:</span>
                          <span className="font-mono">-{formatCurrency(quote.admin_fee, quote.from_currency)}</span>
                        </div>
                        <div className="flex justify-between text-redAccent">
                          <span>Withdrawal Fee:</span>
                          <span className="font-mono">-{formatCurrency(quote.withdrawal_fee, quote.to_currency)}</span>
                        </div>
                        <div className="flex justify-between font-medium text-greenAccent border-t pt-1">
                          <span>Net Amount:</span>
                          <span className="font-mono">{formatCurrency(quote.net_amount, quote.to_currency)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellowAccent/20 to-greenAccent/20 border border-yellowAccent/30 rounded p-3 mb-4 shadow-sm">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-navy dark:text-foam mt-0.5 flex-shrink-0" />
                      <div className="text-xs font-body text-navy dark:text-foam">
                        <p className="font-medium mb-1">Contract Notice:</p>
                        <p>All information will be stored as a formal contract to confirm this transaction between ourselves and you.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-redAccent/10 to-redAccent/20 border border-redAccent/30 rounded p-3 mb-4 shadow-sm">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-redAccent mt-0.5 flex-shrink-0" />
                      <div className="text-xs font-body text-redAccent dark:text-redAccent">
                        <p className="font-medium mb-1">Disclaimer:</p>
                        <p>We are a third party provider and in no way responsible or liable for whatever project you put your funds into.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                    <div className="text-xs font-body text-navy/50 dark:text-foam/50 space-y-1">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Expires: {new Date(quote.expires_at).toLocaleString()}</span>
                      </div>
                      <div>Created: {new Date(quote.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rejectQuote(quote.id)}
                        disabled={rejectingQuote === quote.id}
                        className="w-full sm:w-auto text-redAccent border-redAccent/30 hover:bg-redAccent/10 bg-blanc dark:bg-navy font-body"
                      >
                        <X className="h-4 w-4 mr-1" />
                        {rejectingQuote === quote.id ? 'Rejecting...' : 'Reject Quote'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => openAcceptanceDialog(quote)}
                        className="w-full sm:w-auto bg-gradient-to-r from-navy to-teal hover:from-navy/90 hover:to-teal/90 text-blanc font-body"
                      >
                        Accept Quote
                      </Button>
                    </div>
                  </div>

                  {/* Next Steps Guide */}
                  <div className="mt-4 bg-gradient-to-r from-greenAccent/20 to-teal/20 border border-greenAccent/30 rounded p-3 shadow-sm">
                    <h5 className="font-heading font-medium text-greenAccent text-sm mb-2">Next Steps After Accepting:</h5>
                    <ol className="text-xs font-body text-greenAccent/80 space-y-1">
                      <li>1. Verify your banking details and wallet ownership</li>
                      <li>2. Complete payment as instructed</li>
                      <li>3. Upload proof of payment</li>
                      <li>4. Wait for admin verification and completion</li>
                    </ol>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory to-foam dark:from-navy dark:to-teal">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeQuotes = quotes.filter(q => q.status === 'pending' && new Date(q.expires_at) > new Date());
  const activeAdminQuotes = adminQuotes.filter(q => q.status === 'pending' && new Date(q.expires_at) > new Date());
  const recentOrders = orders.slice(0, 5);
  const isSuperUser = userProfile?.is_super_user || false;

  return (
    <div className="bg-gradient-to-br from-ivory to-foam dark:from-navy dark:to-teal">
      <div className="flex">
        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed top-20 left-4 z-40">
          <Button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            variant="outline"
            size="icon"
            className="bg-blanc/90 dark:bg-navy/90 border-navy/20 dark:border-foam/20 shadow-lg"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-30 w-80 bg-gradient-to-b from-blanc/80 to-foam/50 dark:from-navy/80 to-teal/50 border-r border-navy/20 dark:border-foam/20 shadow-xl backdrop-blur-sm transform transition-transform duration-300 ease-in-out lg:translate-x-0 top-16",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Sidebar Header */}
          <div className="p-6 border-b border-navy/20 dark:border-foam/20 bg-gradient-to-r from-navy/90 to-teal/90 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blanc/30 backdrop-blur-sm rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blanc" />
                </div>
                <div>
                  <h1 className="text-xl font-heading font-bold text-blanc">Trading Portal</h1>
                  <p className="text-sm font-body text-foam">Manage Your Trades</p>
                  {isSuperUser && (
                    <Badge variant="default" className="mt-1 bg-yellowAccent text-navy font-body">
                      <Crown className="h-3 w-3 mr-1" />
                      SuperUser
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-blanc hover:bg-blanc/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group font-body",
                    isActive
                      ? "bg-gradient-to-r from-navy to-teal text-blanc border border-navy/30 shadow-sm"
                      : "text-navy dark:text-foam hover:bg-navy/10 dark:hover:bg-foam/10 hover:text-navy dark:hover:text-blanc"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg",
                    isActive 
                      ? "bg-blanc/20 text-blanc" 
                      : "bg-navy/10 dark:bg-foam/10 text-navy dark:text-foam group-hover:bg-navy/20 dark:group-hover:bg-foam/20"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{item.label}</span>
                      {item.badge && (
                        <span className={cn(
                          "px-2 py-0.5 text-xs font-medium rounded-full",
                          isActive 
                            ? "bg-blanc/20 text-blanc" 
                            : "bg-navy/10 dark:bg-foam/10 text-navy dark:text-foam"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className={cn(
                      "text-xs truncate mt-0.5",
                      isActive ? "text-foam" : "text-navy/70 dark:text-foam/70"
                    )}>
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className={cn(
                    "h-4 w-4 transition-all duration-200",
                    isActive 
                      ? "text-blanc rotate-90" 
                      : "text-navy/40 dark:text-foam/40 group-hover:text-navy/60 dark:group-hover:text-foam/60"
                  )} />
                </button>
              );
            })}
          </nav>

          {/* User Info Footer */}
          <div className="p-4 border-t border-navy/20 dark:border-foam/20 bg-gradient-to-r from-foam/30 to-ivory/50 dark:from-teal/30 dark:to-navy/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-navy/80 to-teal/80 rounded-lg backdrop-blur-sm">
                <TrendingUp className="h-4 w-4 text-blanc" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-heading font-medium text-navy dark:text-foam truncate">
                  {user?.email?.split('@')[0]}
                </p>
                <p className="text-xs font-body text-navy/70 dark:text-foam/70">Trader</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-navy/50 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-80 flex flex-col min-h-screen">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blanc/80 to-foam/60 dark:from-navy/80 to-teal/50 border-b border-navy/20 dark:border-foam/20 p-6 lg:p-8 backdrop-blur-sm">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
                <div className="lg:ml-0 ml-16"> {/* Add margin for mobile menu button */}
                  <h1 className="text-2xl lg:text-3xl font-heading font-bold text-navy dark:text-foam flex items-center gap-2">
                    Trading Dashboard
                    {isSuperUser && (
                      <Badge variant="default" className="bg-gradient-to-r from-yellowAccent/80 to-greenAccent/80 text-navy backdrop-blur-sm font-body">
                        <Crown className="h-3 w-3 mr-1" />
                        SuperUser
                      </Badge>
                    )}
                  </h1>
                  <p className="text-sm lg:text-base font-body text-navy/70 dark:text-foam/70">
                    {isSuperUser 
                      ? 'Manage your OTC trades with special rates and custom quotes'
                      : 'Manage your OTC trades and view market prices'
                    }
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Only show Update Prices button for admin users */}
                  {isAdmin && (
                    <Button
                      onClick={updatePrices}
                      disabled={refreshing}
                      variant="outline"
                      className="flex items-center gap-2 bg-blanc/90 dark:bg-navy/90 border-navy/20 dark:border-foam/20 text-navy dark:text-foam hover:bg-navy/10 dark:hover:bg-foam/10 font-body"
                    >
                      <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                      Update Prices
                    </Button>
                  )}
                  <Button
                    onClick={openWhatsAppSupport}
                    variant="outline"
                    className="flex items-center gap-2 text-greenAccent border-greenAccent/30 bg-greenAccent/20 hover:bg-greenAccent/30 backdrop-blur-sm font-body"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp Support
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <Card className="bg-gradient-to-r from-blanc/60 to-foam/40 dark:from-navy/60 dark:to-teal/40 border-navy/20 dark:border-foam/20 shadow-md backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-heading font-medium text-navy dark:text-foam">Active Quotes</CardTitle>
                    <Clock className="h-4 w-4 text-navy dark:text-foam" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-heading font-bold text-navy dark:text-foam">{activeQuotes.length + activeAdminQuotes.length}</div>
                    <p className="text-xs font-body text-navy/70 dark:text-foam/70">
                      Pending quotes awaiting acceptance
                    </p>
                  </CardContent>
                </Card>

                {isSuperUser && (
                  <Card className="bg-gradient-to-r from-yellowAccent/40 to-greenAccent/40 border-yellowAccent/30 shadow-md backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-heading font-medium text-navy">Admin Quotes</CardTitle>
                      <Star className="h-4 w-4 text-yellowAccent" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-heading font-bold text-navy">{activeAdminQuotes.length}</div>
                      <p className="text-xs font-body text-navy/70">
                        Special rate quotes from admin
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-gradient-to-r from-greenAccent/40 to-teal/40 border-greenAccent/30 shadow-md backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-heading font-medium text-navy dark:text-foam">Total Orders</CardTitle>
                    <TrendingUp className="h-4 w-4 text-greenAccent" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-heading font-bold text-navy dark:text-foam">{orders.length}</div>
                    <p className="text-xs font-body text-navy/70 dark:text-foam/70">
                      All-time trading orders
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-teal/40 to-navy/60 border-teal/30 shadow-md backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-heading font-medium text-blanc">Completed Trades</CardTitle>
                    <TrendingDown className="h-4 w-4 text-blanc" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-heading font-bold text-blanc">
                      {orders.filter(o => o.status === 'completed').length}
                    </div>
                    <p className="text-xs font-body text-blanc/70">
                      Successfully completed trades
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-6 lg:p-8 flex-1 overflow-y-auto">
              <div className="max-w-7xl">
                {/* Debug info for currencies */}
                {currencies.length === 0 && (
                  <div className="mb-4 p-4 bg-yellowAccent/20 border border-yellowAccent/30 rounded">
                    <p className="text-navy dark:text-foam font-body">
                      No currencies loaded. This may affect trading functionality.
                    </p>
                  </div>
                )}

                {renderContent()}
              </div>
            </div>
            
            {/* Footer */}
            <Footer />
        </div>
      </div>

      {/* Quote Acceptance Dialog */}
      <QuoteAcceptanceDialog
        quote={selectedQuote}
        isOpen={showAcceptanceDialog}
        onClose={closeAcceptanceDialog}
        onAccept={handleAcceptQuote}
      />
    </div>
  );
};

export default TradingDashboard;