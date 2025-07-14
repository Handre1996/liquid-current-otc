import { supabase } from '@/integrations/supabase/client';
import { OTCQuote, OTCOrder, AdminQuote } from '@/types/trading';

export class NotificationService {
  private static instance: NotificationService;
  private readonly ADMIN_WHATSAPP_NUMBER = "+971 58 573 0141"; // Updated WhatsApp number
  private readonly WHATSAPP_API_URL = "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages"; // Replace with your WhatsApp Business API endpoint
  private readonly WHATSAPP_ACCESS_TOKEN = "YOUR_ACCESS_TOKEN"; // Replace with your WhatsApp Business API token

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Send a WhatsApp notification to admin about a new quote
   */
  async notifyAdminAboutNewQuote(quote: OTCQuote | AdminQuote, userEmail: string): Promise<void> {
    try {
      // Create a system notification in the database
      await this.createSystemNotification({
        notification_type: 'new_quote',
        title: 'New Quote Submitted',
        message: `A new ${quote.quote_type} quote for ${quote.from_amount} ${quote.from_currency} to ${quote.to_currency} has been submitted by ${userEmail}`,
        severity: 'info',
        related_table: 'otc_quotes',
        related_id: quote.id
      });

      // In a production environment, you would use the WhatsApp Business API
      // This is a placeholder for the actual API call
      console.log(`WhatsApp notification would be sent to admin at ${this.ADMIN_WHATSAPP_NUMBER}`);
      
      // For demonstration purposes, we'll log what would be sent
      const message = `
🔔 *New Quote Alert*

A new quote has been submitted:
- Type: ${quote.quote_type.toUpperCase()}
- From: ${quote.from_amount} ${quote.from_currency}
- To: ${quote.to_currency}
- User: ${userEmail}
- Quote ID: ${quote.id.substring(0, 8)}...

Please log in to the admin dashboard to review.
`;
      
      console.log("WhatsApp message content:", message);
      
      // In a real implementation, you would call the WhatsApp Business API here
      // await this.sendWhatsAppMessage(this.ADMIN_WHATSAPP_NUMBER, message);
    } catch (error) {
      console.error('Error notifying admin about new quote:', error);
    }
  }

  /**
   * Send a WhatsApp notification to user about quote status change
   */
  async notifyUserAboutQuoteStatus(quote: OTCQuote | AdminQuote | OTCOrder, userPhone: string, status: string): Promise<void> {
    try {
      // Create a system notification in the database
      await this.createSystemNotification({
        notification_type: 'quote_status_update',
        title: 'Quote Status Updated',
        message: `Your ${quote.quote_type} quote/order status has been updated to ${status}`,
        severity: 'info',
        related_table: 'otc_quotes',
        related_id: quote.id,
        created_by: quote.user_id
      });

      // For demonstration purposes, we'll log what would be sent
      const message = `
*Liquid Current OTC Desk*

Your quote status has been updated:
- Status: *${status.toUpperCase()}*
- Type: ${quote.quote_type.toUpperCase()}
- Amount: ${quote.from_amount} ${quote.from_currency} → ${quote.to_currency}

${this.getStatusSpecificMessage(status)}

Need help? Reply to this message or contact our support team.
`;
      
      console.log(`WhatsApp message would be sent to user at ${userPhone}:`, message);
      
      // In a real implementation, you would call the WhatsApp Business API here
      // await this.sendWhatsAppMessage(userPhone, message);
    } catch (error) {
      console.error('Error notifying user about quote status:', error);
    }
  }

  /**
   * Create a system notification in the database
   */
  private async createSystemNotification(notification: {
    notification_type: string;
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    related_table?: string;
    related_id?: string;
    created_by?: string;
  }): Promise<void> {
    try {
      await supabase.from('system_notifications').insert({
        notification_type: notification.notification_type,
        title: notification.title,
        message: notification.message,
        severity: notification.severity,
        related_table: notification.related_table,
        related_id: notification.related_id,
        created_by: notification.created_by,
        is_read: false
      });
    } catch (error) {
      console.error('Error creating system notification:', error);
    }
  }

  /**
   * Get status-specific message for user notifications
   */
  private getStatusSpecificMessage(status: string): string {
    switch (status) {
      case 'accepted':
        return 'Your quote has been accepted. Please proceed with payment as instructed.';
      case 'payment_pending':
        return 'Please complete your payment and upload proof of payment in the trading dashboard.';
      case 'payment_confirmed':
        return 'Your payment has been confirmed. We are processing your transaction.';
      case 'processing':
        return 'Your transaction is being processed. We will notify you once completed.';
      case 'completed':
        return 'Your transaction has been completed successfully! Thank you for trading with us.';
      case 'cancelled':
        return 'Your quote has been cancelled. Please contact support if you have any questions.';
      case 'rejected':
        return 'Your quote has been rejected. Please contact support for more information.';
      default:
        return 'Please check your trading dashboard for more details.';
    }
  }

  /**
   * Send a WhatsApp message using the WhatsApp Business API
   * This is a placeholder for the actual implementation
   */
  private async sendWhatsAppMessage(to: string, message: string): Promise<void> {
    try {
      // This is a placeholder for the actual WhatsApp Business API call
      // In a real implementation, you would use the WhatsApp Business API
      
      // Example implementation using fetch:
      /*
      const response = await fetch(this.WHATSAPP_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: to,
          type: "text",
          text: {
            body: message
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`WhatsApp API error: ${JSON.stringify(error)}`);
      }
      */
      
      console.log(`WhatsApp message sent to ${to}`);
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }
}

export const notificationService = NotificationService.getInstance();