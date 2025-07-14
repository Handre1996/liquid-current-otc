// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deploy_node_server

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// WhatsApp Business API configuration
const WHATSAPP_API_URL = Deno.env.get("WHATSAPP_API_URL") || "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages";
const WHATSAPP_ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN") || "YOUR_ACCESS_TOKEN";
const ADMIN_WHATSAPP_NUMBER = Deno.env.get("ADMIN_WHATSAPP_NUMBER") || "+971 58 573 0141";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables are not set");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === "POST") {
      const { type, data, userPhone, adminNotify } = await req.json();

      // Validate required fields
      if (!type || !data) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      let message = "";
      let recipient = userPhone;

      // Format message based on notification type
      switch (type) {
        case "new_quote":
          message = formatNewQuoteMessage(data);
          recipient = ADMIN_WHATSAPP_NUMBER;
          break;
        case "quote_accepted":
          message = formatQuoteAcceptedMessage(data);
          break;
        case "order_status_update":
          message = formatOrderStatusUpdateMessage(data);
          break;
        case "custom_message":
          message = data.message;
          break;
        default:
          return new Response(
            JSON.stringify({ error: "Invalid notification type" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
      }

      // In a production environment, you would call the WhatsApp Business API
      // For now, we'll just log the message and return success
      console.log(`Would send WhatsApp message to ${recipient}: ${message}`);

      // Create a system notification in the database
      const { error: notificationError } = await supabase
        .from("system_notifications")
        .insert({
          notification_type: `whatsapp_${type}`,
          title: `WhatsApp ${type.replace('_', ' ')}`,
          message: `WhatsApp message sent to ${recipient}: ${message.substring(0, 100)}...`,
          severity: "info",
          related_table: data.related_table || null,
          related_id: data.related_id || null,
          created_by: data.created_by || null,
        });

      if (notificationError) {
        console.error("Error creating system notification:", notificationError);
      }

      // If admin notification is also requested
      if (adminNotify && recipient !== ADMIN_WHATSAPP_NUMBER) {
        console.log(`Would also notify admin at ${ADMIN_WHATSAPP_NUMBER}`);
        // In production, send another message to admin
      }

      return new Response(
        JSON.stringify({ success: true, message: "Notification sent" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Message formatting functions
function formatNewQuoteMessage(data: any): string {
  return `
🔔 *New Quote Alert*

A new quote has been submitted:
- Type: ${data.quote_type.toUpperCase()}
- From: ${data.from_amount} ${data.from_currency}
- To: ${data.to_currency}
- User: ${data.user_email || "Unknown"}
- Quote ID: ${data.id.substring(0, 8)}...

Please log in to the admin dashboard to review.
`;
}

function formatQuoteAcceptedMessage(data: any): string {
  return `
✅ *Quote Accepted*

Your quote has been accepted:
- Type: ${data.quote_type.toUpperCase()}
- From: ${data.from_amount} ${data.from_currency}
- To: ${data.to_currency}
- Net Amount: ${data.net_amount} ${data.to_currency}

Please proceed with payment as instructed in your trading dashboard.
`;
}

function formatOrderStatusUpdateMessage(data: any): string {
  let statusMessage = "";
  
  switch (data.status) {
    case "payment_pending":
      statusMessage = "Please complete your payment and upload proof of payment in the trading dashboard.";
      break;
    case "payment_confirmed":
      statusMessage = "Your payment has been confirmed. We are processing your transaction.";
      break;
    case "processing":
      statusMessage = "Your transaction is being processed. We will notify you once completed.";
      break;
    case "completed":
      statusMessage = "Your transaction has been completed successfully! Thank you for trading with us.";
      break;
    case "cancelled":
      statusMessage = "Your order has been cancelled. Please contact support if you have any questions.";
      break;
    default:
      statusMessage = "Please check your trading dashboard for more details.";
  }

  return `
🔄 *Order Status Update*

Your order status has been updated to: *${data.status.toUpperCase()}*

- Type: ${data.order_type.toUpperCase()}
- From: ${data.from_amount} ${data.from_currency}
- To: ${data.to_currency}
- Net Amount: ${data.net_amount} ${data.to_currency}

${statusMessage}

Need help? Reply to this message or contact our support team.
`;
}