/**
 * Admin Notification Service
 * Handles sending email notifications to admin for important events
 */

export interface NotificationData {
  // Quote data
  id?: string;
  quote_type?: string;
  from_amount?: number;
  from_currency?: string;
  to_amount?: number;
  to_currency?: string;
  exchange_rate?: number;
  net_amount?: number;
  total_fee?: number;
  user_email?: string;
  created_at?: string;
  expires_at?: string;
  
  // KYC data
  first_name?: string;
  surname?: string;
  email?: string;
  phone?: string;
  id_type?: string;
  country?: string;
  source_of_funds?: string;
  status?: string;
  
  // User data
  user_metadata?: {
    first_name?: string;
    surname?: string;
  };
}

export const sendAdminNotification = async (
  type: 'new_quote' | 'new_kyc' | 'new_signup', 
  data: NotificationData
): Promise<boolean> => {
  try {
    // Get the Supabase URL for the edge function
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return false;
    }

    const functionUrl = `${supabaseUrl}/functions/v1/send-admin-notification`;

    // Make the API call to the edge function
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        type: type,
        data: data
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Admin notification failed:', response.status, errorText);
      return false;
    }

    const result = await response.json();
    console.log('✅ Admin notification sent successfully:', result);
    return true;

  } catch (error) {
    console.error('Error sending admin notification:', error);
    return false;
  }
};

/**
 * Send notification for new quote generation
 */
export const notifyAdminNewQuote = async (quote: any, userEmail: string): Promise<void> => {
  try {
    const success = await sendAdminNotification('new_quote', {
      id: quote.id,
      quote_type: quote.quote_type,
      from_amount: quote.from_amount,
      from_currency: quote.from_currency,
      to_amount: quote.to_amount,
      to_currency: quote.to_currency,
      exchange_rate: quote.exchange_rate,
      net_amount: quote.net_amount,
      total_fee: quote.total_fee,
      user_email: userEmail,
      created_at: quote.created_at,
      expires_at: quote.expires_at,
    });

    if (!success) {
      console.warn('Failed to send admin notification for new quote');
    }
  } catch (error) {
    console.error('Error in notifyAdminNewQuote:', error);
  }
};

/**
 * Send notification for new KYC submission
 */
export const notifyAdminNewKyc = async (submission: any): Promise<void> => {
  try {
    const success = await sendAdminNotification('new_kyc', {
      id: submission.id,
      first_name: submission.first_name,
      surname: submission.surname,
      email: submission.email,
      phone: submission.phone,
      id_type: submission.id_type,
      country: submission.country,
      source_of_funds: submission.source_of_funds,
      status: submission.status,
      created_at: submission.created_at,
    });

    if (!success) {
      console.warn('Failed to send admin notification for new KYC submission');
    }
  } catch (error) {
    console.error('Error in notifyAdminNewKyc:', error);
  }
};

/**
 * Send notification for new user signup
 */
export const notifyAdminNewSignup = async (user: any): Promise<void> => {
  try {
    const success = await sendAdminNotification('new_signup', {
      id: user.id,
      email: user.email,
      first_name: user.user_metadata?.first_name,
      surname: user.user_metadata?.surname,
      created_at: user.created_at,
    });

    if (!success) {
      console.warn('Failed to send admin notification for new user signup');
    }
  } catch (error) {
    console.error('Error in notifyAdminNewSignup:', error);
  }
};