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
      const rate = await priceService.getExchangeRate(fromCurrency, toCurrency);
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
    <Card className="shadow-md border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-blue-800">
          <Calculator className="h-5 w-5 text-blue-600" />
          Generate Quote
        </CardTitle>
        <CardDescription className="text-sm text-blue-600">
          Get an instant quote for your crypto-fiat or crypto-crypto trade with full fee transparency
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 bg-gradient-to-br from-white to-blue-50 p-6">
        {/* Trade Type */}
        <div className="space-y-3">
          <Label className="text-sm sm:text-base font-medium text-blue-800">Trade Type</Label>
          <RadioGroup
            value={quoteType}
            onValueChange={(value) => setQuoteType(value as 'buy' | 'sell' | 'crypto')}
            className="grid grid-cols-1 gap-3"
          >
            <div className="flex items-center space-x-3 p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer bg-white shadow-sm">
              <RadioGroupItem value="buy" id="buy" className="text-blue-600" />
              <div className="flex-1">
                <Label htmlFor="buy" className="font-bold text-sm sm:text-base cursor-pointer text-blue-800">💰 Buy Crypto</Label>
                <p className="text-xs sm:text-sm text-blue-600">Pay with fiat currency (ZAR/NAD)</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer bg-white shadow-sm">
              <RadioGroupItem value="sell" id="sell" className="text-blue-600" />
              <div className="flex-1">
                <Label htmlFor="sell" className="font-bold text-sm sm:text-base cursor-pointer text-blue-800">💸 Sell Crypto</Label>
                <p className="text-xs sm:text-sm text-blue-600">Receive fiat currency (ZAR/NAD)</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer bg-white shadow-sm">
              <RadioGroupItem value="crypto" id="crypto" className="text-blue-600" />
              <div className="flex-1">
                <Label htmlFor="crypto" className="font-bold text-sm sm:text-base cursor-pointer text-blue-800">🔄 Crypto Swap</Label>
                <p className="text-xs sm:text-sm text-blue-600">Exchange crypto for crypto (lower fees)</p>
              </div>
            </div>
          </RadioGroup>
          <p className="text-sm text-blue-700 bg-gradient-to-r from-blue-100 to-indigo-100 p-3 rounded-lg shadow-sm">{getTradeTypeDescription()}</p>
        </div>

        <Separator className="bg-blue-200" />

        {/* Currency Selection */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fromCurrency" className="text-sm sm:text-base font-medium text-blue-800">
              From Currency {quoteType === 'buy' ? '(Pay with)' : quoteType === 'sell' ? '(Sell)' : '(From)'}
            </Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="h-12 border-blue-200 bg-white">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {getAvailableCurrencies(true).map((currency) => (
                  <SelectItem key={currency.id} value={currency.code}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{currency.symbol || currency.code}</span>
                      <span>{currency.name}</span>
                      <span className="text-gray-500">({currency.code})</span>
                    </div>
                  </SelectItem>
                ))}
                {getAvailableCurrencies(true).length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-gray-500">No currencies available</div>
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
                className="h-10 w-10 bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-200"
              >
                <ArrowUpDown className="h-4 w-4 text-blue-600" />
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="toCurrency" className="text-sm sm:text-base font-medium text-blue-800">
              To Currency {quoteType === 'buy' ? '(Receive)' : quoteType === 'sell' ? '(Receive)' : '(To)'}
            </Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="h-12 border-blue-200 bg-white">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {getAvailableCurrencies(false).map((currency) => (
                  <SelectItem key={currency.id} value={currency.code}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{currency.symbol || currency.code}</span>
                      <span>{currency.name}</span>
                      <span className="text-gray-500">({currency.code})</span>
                    </div>
                  </SelectItem>
                ))}
                {getAvailableCurrencies(false).length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-gray-500">No currencies available</div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Chain/Network Selection */}
          {shouldShowChainSelection() && (
            <div className="space-y-2">
              <Label htmlFor="selectedChain" className="text-sm sm:text-base font-medium flex items-center gap-2 text-blue-800">
                <Network className="h-4 w-4 text-blue-600" />
                Blockchain Network
              </Label>
              <Select value={selectedChain} onValueChange={setSelectedChain}>
                <SelectTrigger className="h-12 border-blue-200 bg-white">
                  <SelectValue placeholder={`Select ${toCurrency} network`} />
                </SelectTrigger>
                <SelectContent className="bg-white">
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
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-lg p-3 shadow-sm">
                <div className="flex items-start gap-2">
                  <Network className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Why choose a network?</p>
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
          <Label htmlFor="amount" className="text-sm sm:text-base font-medium text-blue-800">Amount ({fromCurrency || 'Currency'})</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="any"
            className="h-12 text-lg border-blue-200 bg-white"
          />
        </div>

        {/* Detailed Quote Display */}
        {exchangeRate && estimate && (
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-4 sm:p-6 border border-blue-200 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">Quote Preview</h3>
              {shouldShowChainSelection() && selectedChain && (
                <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
                  {CRYPTO_CHAINS[toCurrency]?.find(c => c.id === selectedChain)?.name}
                </Badge>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-700">Exchange Rate:</span>
                    <span className="text-sm font-mono text-blue-800">
                      1 {fromCurrency} = {estimate.rate.toFixed(8)} {toCurrency}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-700">Gross Amount:</span>
                    <span className="text-sm font-mono text-blue-800">
                      {estimate.grossAmount.toFixed(currencies.find(c => c.code === toCurrency)?.decimals || 2)} {toCurrency}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-red-600">
                    <span className="text-sm font-medium">Admin Fee (0.5%):</span>
                    <span className="text-sm font-mono">
                      -{estimate.adminFee.toFixed(currencies.find(c => c.code === fromCurrency)?.decimals || 2)} {fromCurrency}
                    </span>
                  </div>
                  
                  {estimate.withdrawalFee > 0 && (
                    <div className="flex justify-between items-center text-red-600">
                      <span className="text-sm font-medium">Withdrawal Fee:</span>
                      <span className="text-sm font-mono">
                        -{estimate.withdrawalFee.toFixed(2)} {toCurrency}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4 border border-green-200 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-800">Net Amount:</span>
                  <span className="text-lg font-bold text-green-800 font-mono">
                    {estimate.netAmount.toFixed(currencies.find(c => c.code === toCurrency)?.decimals || 2)} {toCurrency}
                  </span>
                </div>
                <p className="text-xs text-green-600 mt-1">Amount you will receive</p>
                {shouldShowChainSelection() && selectedChain && (
                  <p className="text-xs text-green-600 mt-1">
                    On {CRYPTO_CHAINS[toCurrency]?.find(c => c.id === selectedChain)?.description}
                  </p>
                )}
              </div>
              
              <div className="text-xs text-gray-500 space-y-1">
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
          className="w-full h-12 text-lg font-bold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md"
          size="lg"
        >
          {generating ? 'Generating Quote...' : '🚀 Generate Quote'}
        </Button>

        {/* Contract Notice and Disclaimers */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-yellow-800">
                  Formal Contract Notice
                </p>
                <p className="text-xs text-yellow-700">
                  Please note all information will be stored as a formal contract to confirm this transaction between ourselves and you. 
                  By proceeding with this quote, you agree to the terms and conditions of this trading agreement.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-red-800">
                  Important Disclaimer
                </p>
                <p className="text-xs text-red-700">
                  We are a third party provider and in no way responsible or liable for whatever project you put your funds into. 
                  Please conduct your own research and due diligence before making any investment decisions.
                </p>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded p-3 shadow-sm">
            <p className="font-medium mb-2">Trading Information:</p>
            <ul className="space-y-1">
              <li>• Quotes are valid for 15 minutes from generation</li>
              <li>• Admin fee: 0.5% of transaction amount</li>
              <li>• Withdrawal fees: R50 (ZAR), N$50 (NAD) - Not applicable for crypto-to-crypto trades</li>
              <li>• Exchange rates are updated every 5 minutes</li>
              <li>• Minimum trade amount: R1,000 equivalent</li>
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