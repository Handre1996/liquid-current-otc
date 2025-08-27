import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { tradingService } from '@/services/tradingService';
import { priceService } from '@/services/priceService';
import { Currency, ExchangeRate } from '@/types/trading';
import { toast } from 'sonner';
import { ArrowUpDown, Calculator, Clock, AlertTriangle, FileText, Network } from 'lucide-react';

interface QuoteGeneratorProps {
  currencies: Currency[];
  onQuoteGenerated: () => void;
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

const QuoteGenerator = ({ currencies, onQuoteGenerated }: QuoteGeneratorProps) => {
  const { user } = useAuth();
  const [quoteType, setQuoteType] = useState<'buy' | 'sell' | 'crypto'>('buy');
  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [selectedChain, setSelectedChain] = useState('');
  const [amount, setAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Safely filter currencies with fallback
  const cryptoCurrencies = currencies?.filter(c => c?.type === 'crypto') || [];
  const fiatCurrencies = currencies?.filter(c => c?.type === 'fiat') || [];

  useEffect(() => {
    if (fromCurrency && toCurrency && fromCurrency !== toCurrency) {
      loadExchangeRate();
    } else {
      setExchangeRate(null);
    }
  }, [fromCurrency, toCurrency]);

  // Reset currency selections when trade type changes
  useEffect(() => {
    setFromCurrency('');
    setToCurrency('');
    setSelectedChain('');
    setExchangeRate(null);
  }, [quoteType]);

  // Reset chain selection when currency changes
  useEffect(() => {
    setSelectedChain('');
  }, [toCurrency]);

  const loadExchangeRate = async () => {
    if (!fromCurrency || !toCurrency) return;
    
    setLoading(true);
    try {
      // For currency pairs, we need to check both directions and use the correct one
      let rate = await priceService.getExchangeRate(fromCurrency, toCurrency);
      
      // If we don't find the rate in the requested direction, try the reverse direction
      if (!rate) {
        const reverseRate = await priceService.getExchangeRate(toCurrency, fromCurrency);
        if (reverseRate) {
          // Create inverted rate object
          rate = {
            ...reverseRate,
            from_currency: fromCurrency,
            to_currency: toCurrency,
            base_rate: 1 / reverseRate.base_rate,
            final_buy_rate: 1 / reverseRate.final_sell_rate,
            final_sell_rate: 1 / reverseRate.final_buy_rate,
          };
        }
      }
      
      setExchangeRate(rate);
    } catch (error) {
      console.error('Error loading exchange rate:', error);
      setExchangeRate(null);
      // Don't show error toast here as it might be expected during normal operation
    } finally {
      setLoading(false);
    }
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setSelectedChain(''); // Reset chain when swapping
  };

  const calculateDetailedEstimate = () => {
    if (!exchangeRate || !amount) return null;
    
    const inputAmount = parseFloat(amount);
    if (isNaN(inputAmount) || inputAmount <= 0) return null;

    try {
      // For crypto-to-crypto trades, we use different logic
      let rate: number;
      if (quoteType === 'crypto') {
        // For crypto-to-crypto, we use the base rate with minimal markup
        rate = exchangeRate.final_buy_rate; // Use buy rate for crypto swaps
      } else {
        rate = quoteType === 'buy' ? exchangeRate.final_buy_rate : exchangeRate.final_sell_rate;
      }
      
      const grossAmount = inputAmount * rate;
      
      // Calculate fees (these should match the backend calculation)
      const adminFeePercentage = 0.005; // 0.5% - should be fetched from settings
      const adminFee = inputAmount * adminFeePercentage;
      
      let withdrawalFee = 0;
      // Only apply withdrawal fees for fiat currencies
      if (quoteType !== 'crypto') {
        if (toCurrency === 'ZAR') withdrawalFee = 50;
        if (toCurrency === 'NAD') withdrawalFee = 50;
      }
      
      const totalFee = adminFee + withdrawalFee;
      const netAmount = Math.max(0, grossAmount - totalFee); // Ensure non-negative
      
      return {
        grossAmount,
        adminFee,
        withdrawalFee,
        totalFee,
        netAmount,
        rate
      };
    } catch (error) {
      console.error('Error calculating estimate:', error);
      return null;
    }
  };

  const generateQuote = async () => {
    if (!user) {
      toast.error('Please log in to generate a quote');
      return;
    }

    if (!fromCurrency || !toCurrency || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    // Check if chain selection is required and provided
    const needsChainSelection = quoteType === 'buy' && CRYPTO_CHAINS[toCurrency];
    if (needsChainSelection && !selectedChain) {
      toast.error(`Please select a blockchain network for ${toCurrency}`);
      return;
    }

    const inputAmount = parseFloat(amount);
    if (isNaN(inputAmount) || inputAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setGenerating(true);
    try {
      // For crypto-to-crypto trades, we still use 'buy' as the quote type in the backend
      const backendQuoteType = quoteType === 'crypto' ? 'buy' : quoteType;
      
      await tradingService.generateQuote(
        user.id,
        backendQuoteType,
        fromCurrency,
        toCurrency,
        inputAmount
      );

      toast.success('Quote generated successfully! Check the "Active Quotes" tab to accept or reject it.');
      setAmount('');
      onQuoteGenerated();
    } catch (error: any) {
      console.error('Error generating quote:', error);
      toast.error(error.message || 'Failed to generate quote');
    } finally {
      setGenerating(false);
    }
  };

  const getAvailableCurrencies = (isFromCurrency: boolean) => {
    switch (quoteType) {
      case 'buy':
        // Buy crypto with fiat: From = Fiat, To = Crypto
        return isFromCurrency ? fiatCurrencies : cryptoCurrencies;
      case 'sell':
        // Sell crypto for fiat: From = Crypto, To = Fiat
        return isFromCurrency ? cryptoCurrencies : fiatCurrencies;
      case 'crypto':
        // Crypto to crypto: Both are crypto
        return cryptoCurrencies;
      default:
        return [];
    }
  };

  const getTradeTypeDescription = () => {
    switch (quoteType) {
      case 'buy':
        return 'Buy cryptocurrency with fiat currency';
      case 'sell':
        return 'Sell cryptocurrency for fiat currency';
      case 'crypto':
        return 'Exchange one cryptocurrency for another';
      default:
        return '';
    }
  };

  const getAvailableChains = () => {
    if (!toCurrency || quoteType !== 'buy') return [];
    return CRYPTO_CHAINS[toCurrency] || [];
  };

  const shouldShowChainSelection = () => {
    return quoteType === 'buy' && toCurrency && CRYPTO_CHAINS[toCurrency];
  };

  const estimate = calculateDetailedEstimate();

  return (
    <Card className="shadow-lg border-navy/30 dark:border-foam/30 bg-gradient-to-br from-blanc to-foam/20 dark:from-navy/30 dark:to-teal/20">
      <CardHeader className="bg-gradient-to-r from-foam/30 to-ivory/50 dark:from-teal/20 dark:to-navy/30 border-b border-navy/20 dark:border-foam/20">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-navy dark:text-foam font-heading">
          <Calculator className="h-5 w-5 text-navy dark:text-foam" />
          Generate Quote
        </CardTitle>
        <CardDescription className="text-sm text-navy/70 dark:text-foam/70 font-body">
          Get an instant quote for your crypto-fiat or crypto-crypto trade with full fee transparency
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Trade Type */}
        <div className="space-y-3">
          <Label className="text-sm sm:text-base font-medium text-navy dark:text-foam font-heading">Trade Type</Label>
          <RadioGroup
            value={quoteType}
            onValueChange={(value) => setQuoteType(value as 'buy' | 'sell' | 'crypto')}
            className="grid grid-cols-1 gap-3"
          >
            <div className="flex items-center space-x-3 p-4 border-2 border-navy/20 dark:border-foam/20 rounded-lg hover:bg-foam/20 dark:hover:bg-teal/20 cursor-pointer bg-blanc dark:bg-navy/50 shadow-sm">
              <RadioGroupItem value="buy" id="buy" className="text-navy dark:text-foam" />
              <div className="flex-1">
                <Label htmlFor="buy" className="font-bold text-sm sm:text-base cursor-pointer text-navy dark:text-foam font-heading">💰 Buy Crypto</Label>
                <p className="text-xs sm:text-sm text-navy/70 dark:text-foam/70 font-body">Pay with fiat currency (ZAR/NAD)</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 border-2 border-navy/20 dark:border-foam/20 rounded-lg hover:bg-foam/20 dark:hover:bg-teal/20 cursor-pointer bg-blanc dark:bg-navy/50 shadow-sm">
              <RadioGroupItem value="sell" id="sell" className="text-navy dark:text-foam" />
              <div className="flex-1">
                <Label htmlFor="sell" className="font-bold text-sm sm:text-base cursor-pointer text-navy dark:text-foam font-heading">💸 Sell Crypto</Label>
                <p className="text-xs sm:text-sm text-navy/70 dark:text-foam/70 font-body">Receive fiat currency (ZAR/NAD)</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 border-2 border-navy/20 dark:border-foam/20 rounded-lg hover:bg-foam/20 dark:hover:bg-teal/20 cursor-pointer bg-blanc dark:bg-navy/50 shadow-sm">
              <RadioGroupItem value="crypto" id="crypto" className="text-navy dark:text-foam" />
              <div className="flex-1">
                <Label htmlFor="crypto" className="font-bold text-sm sm:text-base cursor-pointer text-navy dark:text-foam font-heading">🔄 Crypto Swap</Label>
                <p className="text-xs sm:text-sm text-navy/70 dark:text-foam/70 font-body">Exchange crypto for crypto (lower fees)</p>
              </div>
            </div>
          </RadioGroup>
          <p className="text-sm text-navy dark:text-foam bg-gradient-to-r from-foam/30 to-ivory/50 dark:from-teal/20 dark:to-navy/30 p-3 rounded-lg shadow-sm border border-navy/20 dark:border-foam/20 font-body">
            {getTradeTypeDescription()}
          </p>
        </div>

        <Separator className="bg-navy/20 dark:bg-foam/20" />

        {/* Currency Selection */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fromCurrency" className="text-sm sm:text-base font-medium text-navy dark:text-foam font-heading">
              From Currency {quoteType === 'buy' ? '(Pay with)' : quoteType === 'sell' ? '(Sell)' : '(From)'}
            </Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="h-12 border-navy/20 dark:border-foam/20 bg-blanc dark:bg-navy/50">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="bg-blanc dark:bg-navy">
                {getAvailableCurrencies(true).map((currency) => (
                  <SelectItem key={currency.id} value={currency.code}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{currency.symbol || currency.code}</span>
                      <span>{currency.name}</span>
                      <span className="text-navy/50 dark:text-foam/50">({currency.code})</span>
                    </div>
                  </SelectItem>
                ))}
                {getAvailableCurrencies(true).length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-navy/50 dark:text-foam/50">No currencies available</div>
                )}
              </SelectContent>
            </Select>
          </div>

          {quoteType === 'crypto' && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={swapCurrencies}
                disabled={!fromCurrency || !toCurrency}
                className="h-10 w-10 bg-gradient-to-r from-foam/30 to-ivory/50 dark:from-teal/20 dark:to-navy/30 border-navy/20 dark:border-foam/20"
              >
                <ArrowUpDown className="h-4 w-4 text-navy dark:text-foam" />
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="toCurrency" className="text-sm sm:text-base font-medium text-navy dark:text-foam font-heading">
              To Currency {quoteType === 'buy' ? '(Receive)' : quoteType === 'sell' ? '(Receive)' : '(To)'}
            </Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="h-12 border-navy/20 dark:border-foam/20 bg-blanc dark:bg-navy/50">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="bg-blanc dark:bg-navy">
                {getAvailableCurrencies(false).map((currency) => (
                  <SelectItem key={currency.id} value={currency.code}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{currency.symbol || currency.code}</span>
                      <span>{currency.name}</span>
                      <span className="text-navy/50 dark:text-foam/50">({currency.code})</span>
                    </div>
                  </SelectItem>
                ))}
                {getAvailableCurrencies(false).length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-navy/50 dark:text-foam/50">No currencies available</div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Chain/Network Selection */}
          {shouldShowChainSelection() && (
            <div className="space-y-2">
              <Label htmlFor="selectedChain" className="text-sm sm:text-base font-medium flex items-center gap-2 text-navy dark:text-foam font-heading">
                <Network className="h-4 w-4 text-navy dark:text-foam" />
                Blockchain Network
              </Label>
              <Select value={selectedChain} onValueChange={setSelectedChain}>
                <SelectTrigger className="h-12 border-navy/20 dark:border-foam/20 bg-blanc dark:bg-navy/50">
                  <SelectValue placeholder={`Select ${toCurrency} network`} />
                </SelectTrigger>
                <SelectContent className="bg-blanc dark:bg-navy">
                  {getAvailableChains().map((chain) => (
                    <SelectItem key={chain.id} value={chain.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{chain.name}</span>
                        <span className="text-navy/50 dark:text-foam/50">({chain.description})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="bg-gradient-to-r from-foam/30 to-ivory/50 dark:from-teal/20 dark:to-navy/30 border border-navy/20 dark:border-foam/20 rounded-lg p-3 shadow-sm">
                <div className="flex items-start gap-2">
                  <Network className="h-4 w-4 text-navy dark:text-foam mt-0.5" />
                  <div className="text-sm text-navy dark:text-foam font-body">
                    <p className="font-medium mb-1 font-heading">Why choose a network?</p>
                    <p>Different networks have different transaction fees and speeds. Choose the network that matches your wallet:</p>
                    <ul className="mt-2 space-y-1 text-xs">
                      <li>• <strong>ERC20 (Ethereum):</strong> Higher fees, most widely supported</li>
                      <li>• <strong>TRC20 (Tron):</strong> Lower fees, faster transactions</li>
                      <li>• <strong>BEP20 (BSC):</strong> Low fees, fast transactions</li>
                      <li>• <strong>Polygon:</strong> Very low fees, fast transactions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-sm sm:text-base font-medium text-navy dark:text-foam font-heading">Amount ({fromCurrency || 'Currency'})</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="any"
            className="h-12 text-lg border-navy/20 dark:border-foam/20 bg-blanc dark:bg-navy/50 text-navy dark:text-foam"
          />
        </div>

        {/* Detailed Quote Display */}
        {exchangeRate && estimate && (
          <div className="bg-gradient-to-r from-foam/30 to-ivory/50 dark:from-teal/20 dark:to-navy/30 rounded-lg p-4 sm:p-6 border border-navy/20 dark:border-foam/20 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-navy dark:text-foam" />
              <h3 className="text-lg font-semibold text-navy dark:text-foam font-heading">Quote Preview</h3>
              {shouldShowChainSelection() && selectedChain && (
                <Badge variant="outline" className="text-navy dark:text-foam border-navy/30 dark:border-foam/30 bg-blanc/50 dark:bg-navy/50 font-body">
                  {CRYPTO_CHAINS[toCurrency]?.find(c => c.id === selectedChain)?.name}
                </Badge>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-navy dark:text-foam font-body">Exchange Rate:</span>
                    <span className="text-sm font-mono text-navy dark:text-foam">
                      1 {fromCurrency} = {estimate.rate.toFixed(8)} {toCurrency}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-navy dark:text-foam font-body">Gross Amount:</span>
                    <span className="text-sm font-mono text-navy dark:text-foam">
                      {estimate.grossAmount.toFixed(currencies.find(c => c.code === toCurrency)?.decimals || 2)} {toCurrency}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-redAccent">
                    <span className="text-sm font-medium font-body">Admin Fee (0.5%):</span>
                    <span className="text-sm font-mono">
                      -{estimate.adminFee.toFixed(currencies.find(c => c.code === fromCurrency)?.decimals || 2)} {fromCurrency}
                    </span>
                  </div>
                  
                  {estimate.withdrawalFee > 0 && (
                    <div className="flex justify-between items-center text-redAccent">
                      <span className="text-sm font-medium font-body">Withdrawal Fee:</span>
                      <span className="text-sm font-mono">
                        -{estimate.withdrawalFee.toFixed(2)} {toCurrency}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-greenAccent/20 to-teal/20 rounded-lg p-4 border border-greenAccent/30 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-greenAccent font-heading">Net Amount:</span>
                  <span className="text-lg font-bold text-greenAccent font-mono">
                    {estimate.netAmount.toFixed(currencies.find(c => c.code === toCurrency)?.decimals || 2)} {toCurrency}
            <div className="bg-gradient-to-r from-yellowAccent/20 to-navy/20 border border-yellowAccent/30 rounded-lg p-4 shadow-sm">
                </div>
                <p className="text-xs text-greenAccent/80 mt-1 font-body">Amount you will receive</p>
                {shouldShowChainSelection() && selectedChain && (
                  <p className="text-xs text-greenAccent/80 mt-1 font-body">
                    On {CRYPTO_CHAINS[toCurrency]?.find(c => c.id === selectedChain)?.description}
                  </p>
                )}
              </div>
              
              <div className="text-xs text-navy/50 dark:text-foam/50 space-y-1 font-body">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Quote valid for 15 minutes</span>
                </div>
                <div>Last updated: {new Date(exchangeRate.last_updated).toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Generate Quote Button */}
        <Button
          onClick={generateQuote}
          disabled={!fromCurrency || !toCurrency || !amount || !exchangeRate || generating || (shouldShowChainSelection() && !selectedChain)}
          className="w-full h-12 text-lg font-bold bg-gradient-to-r from-navy to-teal hover:from-navy/90 hover:to-teal/90 text-blanc shadow-md font-body"
          size="lg"
        >
          {generating ? 'Generating Quote...' : '🚀 Generate Quote'}
        </Button>

        {/* Contract Notice and Disclaimers */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-yellowAccent/20 to-greenAccent/20 border border-yellowAccent/30 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 text-yellowAccent mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-navy dark:text-foam font-heading">
                  Formal Contract Notice
                </p>
                <p className="text-xs text-navy/80 dark:text-foam/80 font-body">
                  Please note all information will be stored as a formal contract to confirm this transaction between ourselves and you. 
                  By proceeding with this quote, you agree to the terms and conditions of this trading agreement.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-redAccent/10 to-redAccent/20 border border-redAccent/30 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-redAccent mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-redAccent font-heading">
                  Important Disclaimer
                </p>
                <p className="text-xs text-redAccent/80 font-body">
                  We are a third party provider and in no way responsible or liable for whatever project you put your funds into. 
                  Please conduct your own research and due diligence before making any investment decisions.
                </p>
              </div>
            </div>
          </div>

          <div className="text-xs text-navy/50 dark:text-foam/50 bg-gradient-to-r from-ivory/50 to-foam/30 dark:from-navy/50 dark:to-teal/20 border border-navy/20 dark:border-foam/20 rounded p-3 shadow-sm font-body">
            <p className="font-medium mb-2 font-heading">Trading Information:</p>
            <ul className="space-y-1">
              <li>• Quotes are valid for the day of generation (If your trade continues to the following day, you will be re quoted according to the rates)</li>
              <li>• Admin fee: R50 for all trades under $1000</li>
              <li>• Withdrawal fees: R50 (ZAR), N$50 (NAD) - Not applicable for crypto-to-crypto trades</li>
              <li>• Exchange rates are updated every4/6 hours</li>
              <li>• Minimum trade amount: R250 equivalent</li>
              <li>• All transactions are subject to KYC verification</li>
              <li>• Crypto-to-crypto trades have lower fees (no withdrawal fees)</li>
              <li>• <strong>Network Selection:</strong> Ensure your wallet supports the selected blockchain network</li>
              <li>• FSP License: 53702 (FSCA Regulated)</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteGenerator;