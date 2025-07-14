export interface Currency {
  id: string;
  code: string;
  name: string;
  type: 'crypto' | 'fiat';
  symbol?: string;
  decimals: number;
  is_active: boolean;
}

export interface ExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  base_rate: number;
  buy_markup: number;
  sell_markup: number;
  final_buy_rate: number;
  final_sell_rate: number;
  last_updated: string;
}

export interface BankAccount {
  id: string;
  user_id: string;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  branch_code?: string;
  account_type: 'savings' | 'current' | 'transmission';
  currency: string;
  is_verified: boolean;
  proof_document_path?: string;
  created_at: string;
  updated_at: string;
}

export interface CryptoWallet {
  id: string;
  user_id: string;
  currency: string;
  wallet_address: string;
  wallet_type: 'exchange' | 'personal';
  exchange_name?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface OTCQuote {
  id: string;
  user_id: string;
  quote_type: 'buy' | 'sell';
  from_currency: string;
  to_currency: string;
  from_amount: number;
  to_amount: number;
  exchange_rate: number;
  admin_fee: number;
  withdrawal_fee: number;
  total_fee: number;
  net_amount: number;
  expires_at: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface AdminQuote {
  id: string;
  user_id: string;
  admin_id: string;
  quote_type: 'buy' | 'sell';
  from_currency: string;
  to_currency: string;
  from_amount: number;
  to_amount: number;
  exchange_rate: number;
  admin_fee: number;
  withdrawal_fee: number;
  total_fee: number;
  net_amount: number;
  expires_at: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  admin_notes?: string;
  special_rate_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  is_super_user: boolean;
  super_user_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OTCOrder {
  id: string;
  user_id: string;
  quote_id: string;
  order_type: 'buy' | 'sell';
  from_currency: string;
  to_currency: string;
  from_amount: number;
  to_amount: number;
  exchange_rate: number;
  total_fee: number;
  net_amount: number;
  bank_account_id?: string;
  crypto_wallet_id?: string;
  payment_proof_path?: string;
  transaction_id?: string;
  status: 'pending' | 'payment_pending' | 'payment_confirmed' | 'processing' | 'completed' | 'cancelled' | 'failed';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  order_id: string;
  user_id: string;
  transaction_type: 'deposit' | 'withdrawal' | 'exchange';
  currency: string;
  amount: number;
  fee: number;
  net_amount: number;
  transaction_hash?: string;
  bank_reference?: string;
  status: 'pending' | 'confirmed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface AdminSettings {
  id: string;
  setting_key: string;
  setting_value: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface PriceData {
  [key: string]: {
    usd: number;
    zar?: number;
    nad?: number;
  };
}