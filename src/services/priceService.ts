import { supabase } from '@/integrations/supabase/client';
import { PriceData, ExchangeRate } from '@/types/trading';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// CoinGecko ID mapping for cryptocurrencies
const CRYPTO_ID_MAP: { [key: string]: string } = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'USDT': 'tether',
  'USDC': 'usd-coin',
  'LTC': 'litecoin',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'DOT': 'polkadot',
  'LINK': 'chainlink',
  'SOL': 'solana',
};

export class PriceService {
  private static instance: PriceService;
  private priceCache: Map<string, { price: number; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 60000; // 1 minute cache

  static getInstance(): PriceService {
    if (!PriceService.instance) {
      PriceService.instance = new PriceService();
    }
    return PriceService.instance;
  }

  async fetchCryptoPrices(cryptoCodes: string[]): Promise<PriceData> {
    try {
      const coinIds = cryptoCodes
        .map(code => CRYPTO_ID_MAP[code])
        .filter(Boolean)
        .join(',');

      if (!coinIds) {
        throw new Error('No valid cryptocurrency codes provided');
      }

      const response = await fetch(
        `${COINGECKO_API}/simple/price?ids=${coinIds}&vs_currencies=usd`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Convert back to our currency codes
      const priceData: PriceData = {};
      Object.entries(CRYPTO_ID_MAP).forEach(([code, id]) => {
        if (data[id]) {
          priceData[code] = {
            usd: data[id].usd
          };
        }
      });

      return priceData;
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      throw error;
    }
  }

  async fetchFiatRates(): Promise<{ USDZAR: number; USDNAD: number }> {
    try {
      // Using a free forex API - you might want to use a more reliable paid service
      const response = await fetch(
        'https://api.exchangerate-api.com/v4/latest/USD'
      );

      if (!response.ok) {
        throw new Error(`Exchange rate API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        USDZAR: data.rates.ZAR || 18.5, // Fallback rate
        USDNAD: data.rates.NAD || 18.5   // Fallback rate (NAD usually pegged to ZAR)
      };
    } catch (error) {
      console.error('Error fetching fiat rates:', error);
      // Return fallback rates
      return {
        USDZAR: 18.5,
        USDNAD: 18.5
      };
    }
  }

  async updateExchangeRates(): Promise<void> {
    try {
      // Check if user is admin (this should be done at the component level)
      const { data: { user } } = await supabase.auth.getUser();
      const isAdmin = user?.email?.endsWith('@liquidcurrent.com') || user?.email?.endsWith('@liquidcurrent.co.za');
      
      if (!isAdmin) {
        throw new Error('Only administrators can update exchange rates');
      }
      
      // Get all active currencies
      const { data: currencies } = await supabase
        .from('currencies')
        .select('code, type')
        .eq('is_active', true);

      if (!currencies) return;

      const cryptoCodes = currencies
        .filter(c => c.type === 'crypto')
        .map(c => c.code);

      const fiatCodes = currencies
        .filter(c => c.type === 'fiat')
        .map(c => c.code);

      // Fetch crypto prices and fiat rates
      const [cryptoPrices, fiatRates] = await Promise.all([
        this.fetchCryptoPrices(cryptoCodes),
        this.fetchFiatRates()
      ]);

      // Get admin settings for markups
      const { data: settings } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['default_buy_markup', 'default_sell_markup']);

      const buyMarkup = parseFloat(settings?.find(s => s.setting_key === 'default_buy_markup')?.setting_value || '0.02');
      const sellMarkup = parseFloat(settings?.find(s => s.setting_key === 'default_sell_markup')?.setting_value || '0.02');

      // Update exchange rates for all currency pairs
      const exchangeRates: Partial<ExchangeRate>[] = [];

      // Crypto to Fiat rates
      for (const cryptoCode of cryptoCodes) {
        if (!cryptoPrices[cryptoCode]) continue;

        const usdPrice = cryptoPrices[cryptoCode].usd;

        for (const fiatCode of fiatCodes) {
          let fiatRate = 1;
          if (fiatCode === 'ZAR') fiatRate = fiatRates.USDZAR;
          if (fiatCode === 'NAD') fiatRate = fiatRates.USDNAD;

          const baseRate = usdPrice * fiatRate;
          const finalBuyRate = baseRate * (1 + buyMarkup);
          const finalSellRate = baseRate * (1 - sellMarkup);

          exchangeRates.push({
            from_currency: cryptoCode,
            to_currency: fiatCode,
            base_rate: baseRate,
            buy_markup: buyMarkup,
            sell_markup: sellMarkup,
            final_buy_rate: finalBuyRate,
            final_sell_rate: finalSellRate,
            last_updated: new Date().toISOString()
          });

          // Reverse pair (fiat to crypto)
          const reverseBuyRate = 1 / finalSellRate;
          const reverseSellRate = 1 / finalBuyRate;

          exchangeRates.push({
            from_currency: fiatCode,
            to_currency: cryptoCode,
            base_rate: 1 / baseRate,
            buy_markup: buyMarkup,
            sell_markup: sellMarkup,
            final_buy_rate: reverseBuyRate,
            final_sell_rate: reverseSellRate,
            last_updated: new Date().toISOString()
          });
        }
      }

      // Crypto to Crypto rates
      for (const fromCrypto of cryptoCodes) {
        for (const toCrypto of cryptoCodes) {
          if (fromCrypto === toCrypto) continue;
          if (!cryptoPrices[fromCrypto] || !cryptoPrices[toCrypto]) continue;

          const baseRate = cryptoPrices[fromCrypto].usd / cryptoPrices[toCrypto].usd;
          const finalBuyRate = baseRate * (1 + buyMarkup);
          const finalSellRate = baseRate * (1 - sellMarkup);

          exchangeRates.push({
            from_currency: fromCrypto,
            to_currency: toCrypto,
            base_rate: baseRate,
            buy_markup: buyMarkup,
            sell_markup: sellMarkup,
            final_buy_rate: finalBuyRate,
            final_sell_rate: finalSellRate,
            last_updated: new Date().toISOString()
          });
        }
      }

      // Upsert exchange rates
      if (exchangeRates.length > 0) {
        const { error } = await supabase
          .from('exchange_rates')
          .upsert(exchangeRates, {
            onConflict: 'from_currency,to_currency'
          });

        if (error) {
          console.error('Error updating exchange rates:', error);
          throw error;
        }
      }

    } catch (error) {
      console.error('Error in updateExchangeRates:', error);
      throw error;
    }
  }

  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRate | null> {
    try {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('from_currency', fromCurrency)
        .eq('to_currency', toCurrency)
        .single();

      if (error) {
        console.error('Error fetching exchange rate:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getExchangeRate:', error);
      return null;
    }
  }

  async getAllExchangeRates(): Promise<ExchangeRate[]> {
    try {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('from_currency', { ascending: true });

      if (error) {
        console.error('Error fetching all exchange rates:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllExchangeRates:', error);
      return [];
    }
  }
}

export const priceService = PriceService.getInstance();