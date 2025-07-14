import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { tradingService } from '@/services/tradingService';
import { priceService } from '@/services/priceService';
import { OTCQuote, OTCOrder, Currency, AdminQuote, UserProfile } from '@/types/trading';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import QuoteGenerator from './QuoteGenerator';
import OrderHistory from './OrderHistory';
import BankAccountManager from './BankAccountManager';
import CryptoWalletManager from './CryptoWalletManager';
import QuoteAcceptanceDialog from './QuoteAcceptanceDialog';
import { RefreshCw, TrendingUp, TrendingDown, Clock, FileText, AlertTriangle, X, Crown, Star, MessageCircle } from 'lucide-react';

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

  // Check if user is admin based on email domain
  const isAdmin = user?.email?.endsWith('@liquidcurrent.com') || user?.email?.endsWith('@liquidcurrent.co.za');

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

      // Only update exchange rates if user is admin and we have currencies
      if (isAdmin && currenciesData.length > 0) {
        try {
          await priceService.updateExchangeRates();
        } catch (error) {
          console.error('Error updating exchange rates:', error);
          // Don't show error toast here as it's not critical for initial load
        }
      }
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

  if (loading) {
    return (
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
    );
  }

  const activeQuotes = quotes.filter(q => q.status === 'pending' && new Date(q.expires_at) > new Date());
  const activeAdminQuotes = adminQuotes.filter(q => q.status === 'pending' && new Date(q.expires_at) > new Date());
  const recentOrders = orders.slice(0, 5);
  const isSuperUser = userProfile?.is_super_user || false;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            Trading Dashboard
            {isSuperUser && (
              <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900">
                <Crown className="h-3 w-3 mr-1" />
                SuperUser
              </Badge>
            )}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
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
              className="flex items-center gap-2 w-full sm:w-auto bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Update Prices
            </Button>
          )}
          <Button
            onClick={openWhatsAppSupport}
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto text-green-600 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp Support
          </Button>
        </div>
      </div>

      {/* Debug info for currencies */}
      {currencies.length === 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800">
            No currencies loaded. This may affect trading functionality.
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="card-gradient-blue border-blue-200 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Quotes</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{activeQuotes.length + activeAdminQuotes.length}</div>
            <p className="text-xs text-blue-600">
              Pending quotes awaiting acceptance
            </p>
          </CardContent>
        </Card>

        {isSuperUser && (
          <Card className="card-gradient-yellow border-yellow-200 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Quotes</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{activeAdminQuotes.length}</div>
              <p className="text-xs text-yellow-600">
                Special rate quotes from admin
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="card-gradient-green border-green-200 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{orders.length}</div>
            <p className="text-xs text-green-600">
              All-time trading orders
            </p>
          </CardContent>
        </Card>

        <Card className="card-gradient-purple border-purple-200 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Trades</CardTitle>
            <TrendingDown className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {orders.filter(o => o.status === 'completed').length}
            </div>
            <p className="text-xs text-purple-600">
              Successfully completed trades
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trade" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto bg-gradient-to-r from-blue-100 to-indigo-100 p-1">
          <TabsTrigger value="trade" className="text-xs sm:text-sm font-bold py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
            📈 New Trade
          </TabsTrigger>
          <TabsTrigger value="quotes" className="text-xs sm:text-sm font-bold py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
            💰 Active Quotes
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-xs sm:text-sm font-bold py-3 col-span-2 sm:col-span-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
            📋 Order History
          </TabsTrigger>
          <TabsTrigger value="banking" className="text-xs sm:text-sm font-bold py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
            🏦 Banking
          </TabsTrigger>
          <TabsTrigger value="wallets" className="text-xs sm:text-sm font-bold py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
            🔐 Wallets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trade">
          {isSuperUser ? (
            <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-md">
              <CardHeader className="bg-gradient-to-r from-yellow-400/10 to-amber-400/10 border-b border-yellow-200">
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  SuperUser Trading
                </CardTitle>
                <CardDescription className="text-yellow-700">
                  As a SuperUser, you have access to special rates. Contact our admin team for custom quotes with preferential pricing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg p-6 border border-yellow-200 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 text-yellow-800">How SuperUser Trading Works</h3>
                  <div className="space-y-3 text-sm text-yellow-700">
                    <div className="flex items-start gap-2">
                      <span className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                      <span>Contact our admin team with your trading requirements</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                      <span>Admin will create a custom quote with special rates for you</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                      <span>Review and accept your custom quote in the "Active Quotes" tab</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                      <span>Complete your trade with preferential pricing</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button 
                      onClick={openWhatsAppSupport}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white flex items-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Contact Admin via WhatsApp
                    </Button>
                  </div>
                  <div className="mt-6 p-4 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg border border-yellow-300">
                    <p className="text-sm text-yellow-800">
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
        </TabsContent>

        <TabsContent value="orders">
          <OrderHistory orders={orders} currencies={currencies} />
        </TabsContent>

        <TabsContent value="quotes">
          <Card className="shadow-md border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
              <CardTitle className="text-lg sm:text-xl text-blue-800">Active Quotes</CardTitle>
              <CardDescription className="text-sm text-blue-600">
                Your pending quotes that are still valid
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-gradient-to-br from-white to-blue-50">
              {activeQuotes.length === 0 && activeAdminQuotes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No active quotes. Generate a new quote to start trading.</p>
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-4">Ready to trade? Follow these steps:</p>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 text-left">
                      <ol className="text-sm space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                          <span>Go to <strong>"New Trade"</strong> tab</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                          <span>Select trade type and currencies</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                          <span>Enter amount and generate quote</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                          <span>Review and accept your quote here</span>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Admin Quotes (SuperUser only) */}
                  {isSuperUser && activeAdminQuotes.map((quote) => (
                    <div key={quote.id} className="border rounded-lg p-4 sm:p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base sm:text-lg text-yellow-900 flex items-center gap-2">
                            <Crown className="h-4 w-4 text-yellow-500" />
                            ADMIN QUOTE: {quote.quote_type.toUpperCase()}: {formatCurrency(quote.from_amount, quote.from_currency)} → {formatCurrency(quote.net_amount, quote.to_currency)}
                          </h3>
                          <p className="text-xs sm:text-sm text-yellow-700 font-mono break-all">
                            Admin Quote ID: {quote.id}
                          </p>
                          {quote.special_rate_reason && (
                            <p className="text-xs sm:text-sm text-yellow-700 mt-1">
                              <strong>Special Rate Reason:</strong> {quote.special_rate_reason}
                            </p>
                          )}
                        </div>
                        <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-amber-400 text-yellow-900 self-start">
                          Admin Quote
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-yellow-800 text-sm sm:text-base">Quote Details</h4>
                          <div className="bg-white rounded p-3 text-xs sm:text-sm space-y-1 shadow-sm">
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
                          <h4 className="font-medium text-yellow-800 text-sm sm:text-base">Fee Breakdown</h4>
                          <div className="bg-white rounded p-3 text-xs sm:text-sm space-y-1 shadow-sm">
                            <div className="flex justify-between text-red-600">
                              <span>Admin Fee:</span>
                              <span className="font-mono">-{formatCurrency(quote.admin_fee, quote.from_currency)}</span>
                            </div>
                            <div className="flex justify-between text-red-600">
                              <span>Withdrawal Fee:</span>
                              <span className="font-mono">-{formatCurrency(quote.withdrawal_fee, quote.to_currency)}</span>
                            </div>
                            <div className="flex justify-between font-medium text-green-600 border-t pt-1">
                              <span>Net Amount:</span>
                              <span className="font-mono">{formatCurrency(quote.net_amount, quote.to_currency)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {quote.admin_notes && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded p-3 mb-4 shadow-sm">
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-blue-700">
                              <p className="font-medium mb-1">Admin Notes:</p>
                              <p>{quote.admin_notes}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                        <div className="text-xs text-gray-500 space-y-1">
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
                            className="w-full sm:w-auto text-red-600 border-red-300 hover:bg-red-50 bg-white"
                          >
                            <X className="h-4 w-4 mr-1" />
                            {rejectingQuote === quote.id ? 'Rejecting...' : 'Reject Quote'}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptAdminQuote(quote.id)}
                            className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white"
                          >
                            Accept Admin Quote
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Regular Quotes */}
                  {activeQuotes.map((quote) => (
                    <div key={quote.id} className="border rounded-lg p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base sm:text-lg text-blue-900">
                            {quote.quote_type.toUpperCase()}: {formatCurrency(quote.from_amount, quote.from_currency)} → {formatCurrency(quote.net_amount, quote.to_currency)}
                          </h3>
                          <p className="text-xs sm:text-sm text-blue-700 font-mono break-all">
                            Transaction ID: {generateTransactionId(quote.id)}
                          </p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(quote.status)} className="text-xs sm:text-sm self-start">
                          {quote.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-blue-800 text-sm sm:text-base">Quote Details</h4>
                          <div className="bg-white rounded p-3 text-xs sm:text-sm space-y-1 shadow-sm">
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
                          <h4 className="font-medium text-blue-800 text-sm sm:text-base">Fee Breakdown</h4>
                          <div className="bg-white rounded p-3 text-xs sm:text-sm space-y-1 shadow-sm">
                            <div className="flex justify-between text-red-600">
                              <span>Admin Fee:</span>
                              <span className="font-mono">-{formatCurrency(quote.admin_fee, quote.from_currency)}</span>
                            </div>
                            <div className="flex justify-between text-red-600">
                              <span>Withdrawal Fee:</span>
                              <span className="font-mono">-{formatCurrency(quote.withdrawal_fee, quote.to_currency)}</span>
                            </div>
                            <div className="flex justify-between font-medium text-green-600 border-t pt-1">
                              <span>Net Amount:</span>
                              <span className="font-mono">{formatCurrency(quote.net_amount, quote.to_currency)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded p-3 mb-4 shadow-sm">
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-yellow-700">
                            <p className="font-medium mb-1">Contract Notice:</p>
                            <p>All information will be stored as a formal contract to confirm this transaction between ourselves and you.</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded p-3 mb-4 shadow-sm">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-red-700">
                            <p className="font-medium mb-1">Disclaimer:</p>
                            <p>We are a third party provider and in no way responsible or liable for whatever project you put your funds into.</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                        <div className="text-xs text-gray-500 space-y-1">
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
                            className="w-full sm:w-auto text-red-600 border-red-300 hover:bg-red-50 bg-white"
                          >
                            <X className="h-4 w-4 mr-1" />
                            {rejectingQuote === quote.id ? 'Rejecting...' : 'Reject Quote'}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => openAcceptanceDialog(quote)}
                            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                          >
                            Accept Quote
                          </Button>
                        </div>
                      </div>

                      {/* Next Steps Guide */}
                      <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded p-3 shadow-sm">
                        <h5 className="font-medium text-green-800 text-sm mb-2">Next Steps After Accepting:</h5>
                        <ol className="text-xs text-green-700 space-y-1">
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
        </TabsContent>

        <TabsContent value="banking">
          <BankAccountManager />
        </TabsContent>

        <TabsContent value="wallets">
          <CryptoWalletManager currencies={currencies.filter(c => c.type === 'crypto')} />
        </TabsContent>
      </Tabs>

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