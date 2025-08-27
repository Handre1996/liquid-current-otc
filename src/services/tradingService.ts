import { supabase } from '@/integrations/supabase/client';
import { OTCQuote, OTCOrder, BankAccount, CryptoWallet } from '@/types/trading';
import { priceService } from './priceService';
import { notifyAdminNewQuote } from './adminNotificationService';

export class TradingService {
  async generateQuote(
    userId: string,
    quoteType: 'buy' | 'sell',
    fromCurrency: string,
    toCurrency: string,
    fromAmount: number
  ): Promise<OTCQuote | null> {
    try {
      // Get exchange rate
      const exchangeRate = await priceService.getExchangeRate(fromCurrency, toCurrency);
      if (!exchangeRate) {
        throw new Error('Exchange rate not available for this currency pair');
      }

      // Get admin settings
      const { data: settings } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'admin_fee_percentage',
          'withdrawal_fee_zar',
          'withdrawal_fee_nad',
          'quote_expiry_minutes'
        ]);

      const adminFeePercentage = parseFloat(
        settings?.find(s => s.setting_key === 'admin_fee_percentage')?.setting_value || '0.005'
      );
      const withdrawalFeeZAR = parseFloat(
        settings?.find(s => s.setting_key === 'withdrawal_fee_zar')?.setting_value || '50'
      );
      const withdrawalFeeNAD = parseFloat(
        settings?.find(s => s.setting_key === 'withdrawal_fee_nad')?.setting_value || '50'
      );
      const quoteExpiryMinutes = parseInt(
        settings?.find(s => s.setting_key === 'quote_expiry_minutes')?.setting_value || '15'
      );

      // Calculate amounts and fees
      const rate = quoteType === 'buy' ? exchangeRate.final_buy_rate : exchangeRate.final_sell_rate;
      const toAmount = fromAmount * rate;
      
      const adminFee = fromAmount * adminFeePercentage;
      let withdrawalFee = 0;
      
      if (toCurrency === 'ZAR') withdrawalFee = withdrawalFeeZAR;
      if (toCurrency === 'NAD') withdrawalFee = withdrawalFeeNAD;
      
      const totalFee = adminFee + withdrawalFee;
      const netAmount = toAmount - totalFee;

      // Create quote with transaction ID
      const quoteData = {
        user_id: userId,
        quote_type: quoteType,
        from_currency: fromCurrency,
        to_currency: toCurrency,
        from_amount: fromAmount,
        to_amount: toAmount,
        exchange_rate: rate,
        admin_fee: adminFee,
        withdrawal_fee: withdrawalFee,
        total_fee: totalFee,
        net_amount: netAmount,
        expires_at: new Date(Date.now() + quoteExpiryMinutes * 60 * 1000).toISOString(),
        status: 'pending' as const
      };

      const { data, error } = await supabase
        .from('otc_quotes')
        .insert(quoteData)
        .select()
        .single();

      if (error) {
        console.error('Error creating quote:', error);
        throw error;
      }

      // Get user email for notification
      const { data: userData } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();

      // Send email notification to admin about new quote
      if (userData?.email) {
        await notifyAdminNewQuote(data, userData.email);
      }

      return data;
    } catch (error) {
      console.error('Error in generateQuote:', error);
      throw error;
    }
  }

  async acceptQuote(
    quoteId: string,
    bankAccountId?: string,
    cryptoWalletId?: string
  ): Promise<OTCOrder | null> {
    try {
      // Get the quote
      const { data: quote, error: quoteError } = await supabase
        .from('otc_quotes')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (quoteError || !quote) {
        throw new Error('Quote not found');
      }

      // Check if quote is still valid
      if (new Date(quote.expires_at) < new Date()) {
        throw new Error('Quote has expired');
      }

      if (quote.status !== 'pending') {
        throw new Error('Quote is no longer available');
      }

      // Generate transaction ID for the order
      const timestamp = Date.now().toString(36);
      const shortQuoteId = quoteId.slice(-8);
      const transactionId = `TXN-${shortQuoteId}-${timestamp}`.toUpperCase();

      // Create order
      const orderData = {
        user_id: quote.user_id,
        quote_id: quoteId,
        order_type: quote.quote_type,
        from_currency: quote.from_currency,
        to_currency: quote.to_currency,
        from_amount: quote.from_amount,
        to_amount: quote.to_amount,
        exchange_rate: quote.exchange_rate,
        total_fee: quote.total_fee,
        net_amount: quote.net_amount,
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

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw orderError;
      }

      // Update quote status
      await supabase
        .from('otc_quotes')
        .update({ status: 'accepted' })
        .eq('id', quoteId);

      // Get user phone for notification
      const { data: userData } = await supabase
        .from('users')
        .select('phone')
        .eq('id', quote.user_id)
        .single();

      // Send notification to user about quote acceptance
      if (userData?.phone) {
        await notificationService.notifyUserAboutQuoteStatus(order, userData.phone, 'payment_pending');
      }

      return order;
    } catch (error) {
      console.error('Error in acceptQuote:', error);
      throw error;
    }
  }

  async getUserQuotes(userId: string): Promise<OTCQuote[]> {
    try {
      const { data, error } = await supabase
        .from('otc_quotes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user quotes:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserQuotes:', error);
      return [];
    }
  }

  async getUserOrders(userId: string): Promise<OTCOrder[]> {
    try {
      const { data, error } = await supabase
        .from('otc_orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user orders:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserOrders:', error);
      return [];
    }
  }

  async uploadPaymentProof(orderId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `payment_proof_${orderId}.${fileExt}`;
      const filePath = `payment_proofs/${orderId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('kyc_documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Error uploading payment proof:', error);
        throw error;
      }

      // Update order with payment proof path
      const { data: order } = await supabase
        .from('otc_orders')
        .update({ 
          payment_proof_path: filePath,
          status: 'payment_confirmed'
        })
        .eq('id', orderId)
        .select()
        .single();

      // Get user phone for notification
      if (order) {
        const { data: userData } = await supabase
          .from('users')
          .select('phone')
          .eq('id', order.user_id)
          .single();

        // Send notification to user about payment confirmation
        if (userData?.phone) {
          await notificationService.notifyUserAboutQuoteStatus(order, userData.phone, 'payment_confirmed');
        }
      }

      return filePath;
    } catch (error) {
      console.error('Error in uploadPaymentProof:', error);
      throw error;
    }
  }

  async confirmPayment(orderId: string, transactionId?: string): Promise<void> {
    try {
      const { data: order } = await supabase
        .from('otc_orders')
        .update({ 
          status: 'payment_confirmed',
          transaction_id: transactionId,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      // Get user phone for notification
      if (order) {
        const { data: userData } = await supabase
          .from('users')
          .select('phone')
          .eq('id', order.user_id)
          .single();

        // Send notification to user about payment confirmation
        if (userData?.phone) {
          await notificationService.notifyUserAboutQuoteStatus(order, userData.phone, 'payment_confirmed');
        }
      }
    } catch (error) {
      console.error('Error in confirmPayment:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: string, status: string, adminNotes?: string): Promise<void> {
    try {
      const { data: order } = await supabase
        .from('otc_orders')
        .update({ 
          status,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      // Get user phone for notification
      if (order) {
        const { data: userData } = await supabase
          .from('users')
          .select('phone')
          .eq('id', order.user_id)
          .single();

        // Send notification to user about order status update
        if (userData?.phone) {
          await notificationService.notifyUserAboutQuoteStatus(order, userData.phone, status);
        }
      }
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      throw error;
    }
  }
}

export const tradingService = new TradingService();