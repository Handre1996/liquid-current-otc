import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

// Environment variables (will be set in Supabase project settings)
const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY") || "SG.DUMMY_API_KEY_REPLACE_WITH_REAL_KEY"
const ADMIN_EMAIL_ADDRESS = Deno.env.get("ADMIN_EMAIL_ADDRESS") || "dashboard@liquidcurrent.co.za"
const EMAIL_SENDER_ADDRESS = Deno.env.get("EMAIL_SENDER_ADDRESS") || "noreply@liquidcurrent.co.za"
const SENDGRID_ENDPOINT = "https://api.sendgrid.com/v3/mail/send"

const serve = Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    if (req.method === "POST") {
      const { type, data } = await req.json()

      if (!type || !data) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: type and data" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        )
      }

      let subject = ""
      let htmlContent = ""
      let textContent = ""

      switch (type) {
        case "new_quote":
          subject = `🔔 New OTC Quote: ${data.quote_type?.toUpperCase()} ${data.from_amount} ${data.from_currency} → ${data.to_currency}`
          htmlContent = generateQuoteEmailHtml(data)
          textContent = generateQuoteEmailText(data)
          break

        case "new_kyc":
          subject = `📋 New KYC Submission: ${data.first_name} ${data.surname}`
          htmlContent = generateKycEmailHtml(data)
          textContent = generateKycEmailText(data)
          break

        case "new_signup":
          subject = `👤 New User Registration: ${data.email}`
          htmlContent = generateSignupEmailHtml(data)
          textContent = generateSignupEmailText(data)
          break

        default:
          return new Response(
            JSON.stringify({ error: `Invalid notification type: ${type}` }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          )
      }

      // SendGrid API payload
      const sendGridPayload = {
        personalizations: [
          {
            to: [{ email: ADMIN_EMAIL_ADDRESS }],
            subject: subject,
          },
        ],
        from: { 
          email: EMAIL_SENDER_ADDRESS,
          name: "Liquid Current OTC Desk"
        },
        content: [
          { type: "text/plain", value: textContent },
          { type: "text/html", value: htmlContent }
        ],
      }

      // Send email via SendGrid
      const sendGridResponse = await fetch(SENDGRID_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
        },
        body: JSON.stringify(sendGridPayload),
      })

      if (!sendGridResponse.ok) {
        const errorBody = await sendGridResponse.text()
        console.error("SendGrid API Error:", errorBody)
        throw new Error(`SendGrid API failed with status ${sendGridResponse.status}: ${errorBody}`)
      }

      console.log(`✅ Admin notification email sent successfully for ${type}`)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Admin notification email sent successfully",
          type: type,
          subject: subject
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("Error processing admin notification request:", error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal server error",
        details: "Failed to send admin notification email"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})

// Email template generators
function generateQuoteEmailHtml(data: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New OTC Quote Notification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1C3F60; background-color: #F4EFEB; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #CDEAF9; border-radius: 8px; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1C3F60 0%, #7495A8 100%); color: #F4EFEB; padding: 20px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px;">
            <h1 style="margin: 0; font-size: 24px;">🔔 New OTC Quote</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Liquid Current OTC Desk</p>
        </div>
        
        <div style="background-color: #CDEAF9; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 10px 0; color: #1C3F60; font-size: 18px;">Quote Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 5px 10px 5px 0; font-weight: bold;">Type:</td><td style="padding: 5px 0;">${data.quote_type?.toUpperCase() || 'Unknown'}</td></tr>
                <tr><td style="padding: 5px 10px 5px 0; font-weight: bold;">From Amount:</td><td style="padding: 5px 0;">${data.from_amount || 'N/A'} ${data.from_currency || 'N/A'}</td></tr>
                <tr><td style="padding: 5px 10px 5px 0; font-weight: bold;">To Amount:</td><td style="padding: 5px 0;">${data.to_amount || 'N/A'} ${data.to_currency || 'N/A'}</td></tr>
                <tr><td style="padding: 5px 10px 5px 0; font-weight: bold;">Exchange Rate:</td><td style="padding: 5px 0;">${data.exchange_rate || 'N/A'}</td></tr>
                <tr><td style="padding: 5px 10px 5px 0; font-weight: bold;">Net Amount:</td><td style="padding: 5px 0; color: #7495A8; font-weight: bold;">${data.net_amount || 'N/A'} ${data.to_currency || 'N/A'}</td></tr>
                <tr><td style="padding: 5px 10px 5px 0; font-weight: bold;">Total Fee:</td><td style="padding: 5px 0;">${data.total_fee || 'N/A'} ${data.to_currency || 'N/A'}</td></tr>
            </table>
        </div>

        <div style="background-color: #F4EFEB; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #1C3F60; font-size: 16px;">User Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 5px 10px 5px 0; font-weight: bold;">User Email:</td><td style="padding: 5px 0;">${data.user_email || 'N/A'}</td></tr>
                <tr><td style="padding: 5px 10px 5px 0; font-weight: bold;">Quote ID:</td><td style="padding: 5px 0; font-family: monospace; font-size: 12px;">${data.id || 'N/A'}</td></tr>
                <tr><td style="padding: 5px 10px 5px 0; font-weight: bold;">Created:</td><td style="padding: 5px 0;">${data.created_at ? new Date(data.created_at).toLocaleString() : 'N/A'}</td></tr>
                <tr><td style="padding: 5px 10px 5px 0; font-weight: bold;">Expires:</td><td style="padding: 5px 0;">${data.expires_at ? new Date(data.expires_at).toLocaleString() : 'N/A'}</td></tr>
            </table>
        </div>

        <div style="text-align: center; padding: 20px 0;">
            <a href="https://handre1996-liquid-cu-558h.bolt.host/admin" 
               style="background: linear-gradient(135deg, #1C3F60 0%, #7495A8 100%); color: #F4EFEB; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Review in Admin Dashboard
            </a>
        </div>

        <div style="border-top: 1px solid #CDEAF9; padding-top: 15px; margin-top: 20px; text-align: center; color: #7495A8; font-size: 12px;">
            <p style="margin: 0;">Liquid Current OTC Desk | FSP License: 53702 | FSCA Regulated</p>
        </div>
    </div>
</body>
</html>
`
}

function generateQuoteEmailText(data: any): string {
  return `
NEW OTC QUOTE NOTIFICATION
Liquid Current OTC Desk

Quote Details:
- Type: ${data.quote_type?.toUpperCase() || 'Unknown'}
- From Amount: ${data.from_amount || 'N/A'} ${data.from_currency || 'N/A'}
- To Amount: ${data.to_amount || 'N/A'} ${data.to_currency || 'N/A'}
- Exchange Rate: ${data.exchange_rate || 'N/A'}
- Net Amount: ${data.net_amount || 'N/A'} ${data.to_currency || 'N/A'}
- Total Fee: ${data.total_fee || 'N/A'} ${data.to_currency || 'N/A'}

User Information:
- User Email: ${data.user_email || 'N/A'}
- Quote ID: ${data.id || 'N/A'}
- Created: ${data.created_at ? new Date(data.created_at).toLocaleString() : 'N/A'}
- Expires: ${data.expires_at ? new Date(data.expires_at).toLocaleString() : 'N/A'}

Please log in to the admin dashboard to review: https://handre1996-liquid-cu-558h.bolt.host/admin

---
Liquid Current OTC Desk | FSP License: 53702 | FSCA Regulated
`
}

function generateKycEmailHtml(data: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New KYC Submission Notification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1C3F60; background-color: #F4EFEB; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #CDEAF9; border-radius: 8px; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1C3F60 0%, #7495A8 100%); color: #F4EFEB; padding: 20px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px;">
            <h1 style="margin: 0; font-size: 24px;">📋 New KYC Submission</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Liquid Current OTC Desk</p>
        </div>
        
        <div style="background-color: #CDEAF9; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 10px 0; color: #1C3F60; font-size: 18px;">Applicant Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 5px 10px 5px 0; font-weight: bold;">Full Name:</td><td style="padding: 5px 0;">${data.first_name || 'N/A'} ${data.surname || 'N/A'}</td></tr>
                <tr><td style="padding: 5px 10px 5px 0; font-weight: bold;">Email:</td><td style="padding: 5px 0;">${data.email || 'N/A'}</td></tr>
                <tr><td style="padding: 5px 10px 5px 0; font-weight: bold;">Phone:</td><td style="padding: 5px 0;">${data.phone || 'N/A'}</td></tr>
                <tr><td style="padding: 5px 10px 5px 0; font-weight: bold;">ID Type:</td><td style="padding: 5px 0;">${data.id_type || 'N/A'}</td></tr>
                <tr><td style="padding: 5px 10px 5px 0; font-weight: bold;">Country:</td><td style="padding: 5px 0;">${data.country || 'N/A'}</td></tr>
                <tr><td style="padding: 5px 10px 5px 0; font-weight: bold;">Source of Funds:</td><td style="padding: 5px 0;">${data.source_of_funds || 'N/A'}</td></tr>
            </table>
        </div>

        <div style="background-color: #F4EFEB; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #1C3F60; font-size: 16px;">Submission Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 5px 10px 5px 0; font-weight: bold;">Status:</td><td style="padding: 5px 0; color: #F7B54A; font-weight: bold;">${data.status?.toUpperCase() || 'PENDING'}</td></tr>
                <tr><td style="padding: 5px 10px 5px 0; font-weight: bold;">Submission ID:</td><td style="padding: 5px 0; font-family: monospace; font-size: 12px;">${data.id || 'N/A'}</td></tr>
                <tr><td style="padding: 5px 10px 5px 0; font-weight: bold;">Submitted:</td><td style="padding: 5px 0;">${data.created_at ? new Date(data.created_at).toLocaleString() : 'N/A'}</td></tr>
            </table>
        </div>

        <div style="background-color: #F7B54A; color: #1C3F60; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <p style="margin: 0; font-weight: bold;">⚡ Action Required</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">This KYC submission requires admin review and approval before the user can begin trading.</p>
        </div>

        <div style="text-align: center; padding: 20px 0;">
            <a href="https://handre1996-liquid-cu-558h.bolt.host/admin" 
               style="background: linear-gradient(135deg, #1C3F60 0%, #7495A8 100%); color: #F4EFEB; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Review KYC Submission
            </a>
        </div>

        <div style="border-top: 1px solid #CDEAF9; padding-top: 15px; margin-top: 20px; text-align: center; color: #7495A8; font-size: 12px;">
            <p style="margin: 0;">Liquid Current OTC Desk | FSP License: 53702 | FSCA Regulated</p>
        </div>
    </div>
</body>
</html>
`
}

function generateKycEmailText(data: any): string {
  return `
NEW KYC SUBMISSION NOTIFICATION
Liquid Current OTC Desk

Applicant Information:
- Full Name: ${data.first_name || 'N/A'} ${data.surname || 'N/A'}
- Email: ${data.email || 'N/A'}
- Phone: ${data.phone || 'N/A'}
- ID Type: ${data.id_type || 'N/A'}
- Country: ${data.country || 'N/A'}
- Source of Funds: ${data.source_of_funds || 'N/A'}

Submission Details:
- Status: ${data.status?.toUpperCase() || 'PENDING'}
- Submission ID: ${data.id || 'N/A'}
- Submitted: ${data.created_at ? new Date(data.created_at).toLocaleString() : 'N/A'}

ACTION REQUIRED: This KYC submission requires admin review and approval.

Please log in to review: https://handre1996-liquid-cu-558h.bolt.host/admin

---
Liquid Current OTC Desk | FSP License: 53702 | FSCA Regulated
`
}

function generateSignupEmailHtml(data: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New User Registration Notification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1C3F60; background-color: #F4EFEB; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #CDEAF9; border-radius: 8px; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1C3F60 0%, #7495A8 100%); color: #F4EFEB; padding: 20px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px;">
            <h1 style="margin: 0; font-size: 24px;">👤 New User Registration</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Liquid Current OTC Desk</p>
        </div>
        
        <div style="background-color: #CDEAF9; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 10px 0; color: #1C3F60; font-size: 18px;">New User Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 5px 10px 5px 0; font-weight: bold;">Email:</td><td style="padding: 5px 0;">${data.email || 'N/A'}</td></tr>
                <tr><td style="padding: 5px 10px 5px 0; font-weight: bold;">First Name:</td><td style="padding: 5px 0;">${data.first_name || 'N/A'}</td></tr>
                <tr><td style="padding: 5px 10px 5px 0; font-weight: bold;">Surname:</td><td style="padding: 5px 0;">${data.surname || 'N/A'}</td></tr>
                <tr><td style="padding: 5px 10px 5px 0; font-weight: bold;">User ID:</td><td style="padding: 5px 0; font-family: monospace; font-size: 12px;">${data.id || 'N/A'}</td></tr>
                <tr><td style="padding: 5px 10px 5px 0; font-weight: bold;">Registered:</td><td style="padding: 5px 0;">${data.created_at ? new Date(data.created_at).toLocaleString() : 'N/A'}</td></tr>
            </table>
        </div>

        <div style="background-color: #4FCF4D; color: #ffffff; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <p style="margin: 0; font-weight: bold;">🎉 Welcome New User!</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">A new user has joined the Liquid Current OTC Desk platform. They will need to complete KYC before they can start trading.</p>
        </div>

        <div style="text-align: center; padding: 20px 0;">
            <a href="https://handre1996-liquid-cu-558h.bolt.host/admin" 
               style="background: linear-gradient(135deg, #1C3F60 0%, #7495A8 100%); color: #F4EFEB; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View User Management
            </a>
        </div>

        <div style="border-top: 1px solid #CDEAF9; padding-top: 15px; margin-top: 20px; text-align: center; color: #7495A8; font-size: 12px;">
            <p style="margin: 0;">Liquid Current OTC Desk | FSP License: 53702 | FSCA Regulated</p>
        </div>
    </div>
</body>
</html>
`
}

function generateSignupEmailText(data: any): string {
  return `
NEW USER REGISTRATION NOTIFICATION
Liquid Current OTC Desk

New User Details:
- Email: ${data.email || 'N/A'}
- First Name: ${data.first_name || 'N/A'}
- Surname: ${data.surname || 'N/A'}
- User ID: ${data.id || 'N/A'}
- Registered: ${data.created_at ? new Date(data.created_at).toLocaleString() : 'N/A'}

A new user has joined the platform and will need to complete KYC before trading.

Please log in to view: https://handre1996-liquid-cu-558h.bolt.host/admin

---
Liquid Current OTC Desk | FSP License: 53702 | FSCA Regulated
`
}