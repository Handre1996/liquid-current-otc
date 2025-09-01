import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const FAQ = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-ivory to-foam dark:from-navy dark:to-teal">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Banner Image */}
          <div className="text-center mb-8">
            <img 
              src="/FAQ Tab.png" 
              alt="Frequently Asked Questions"
              className="mx-auto max-w-full h-auto"
            />
          </div>
          
          {/* First Card - What is an OTC desk? */}
          <Card className="mb-12 bg-ivory border-foam/50 dark:border-teal/30 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Text Content Section - Takes 2/3 of the card */}
                <div className="lg:col-span-2 p-8 lg:p-12 flex flex-col justify-center bg-ivory">
                  <h2 className="text-3xl font-heading font-bold text-teal mb-6">
                    What is an OTC desk?
                  </h2>
                  
                  <div className="space-y-4 text-lg leading-relaxed">
                    <p className="font-body text-navy font-bold">
                      An <span className="text-teal font-bold">OTC (Over-the-Counter) desk</span> is a service that allows you to trade cryptocurrencies directly, rather than through a public exchange. In simple terms, we make it easy and convenient to:
                    </p>
                    
                    <ul className="space-y-2 ml-6 font-body">
                      <li className="flex items-start">
                        <span className="text-navy font-bold mr-2">•</span>
                        <span className="text-navy font-bold">Convert <span className="text-teal font-bold">Rands</span> to <span className="text-teal font-bold">cryptocurrency</span> and <span className="text-teal font-bold">cryptocurrency</span> back to <span className="text-teal font-bold">Rands</span></span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-navy font-bold mr-2">•</span>
                        <span className="text-navy font-bold">Swap one <span className="text-teal font-bold">cryptocurrency</span> for another</span>
                      </li>
                    </ul>
                    
                    <p className="font-body text-navy font-bold">
                      Our role is purely to <span className="text-teal font-bold">facilitate these conversions securely and efficiently</span>.
                    </p>
                    
                    <div className="bg-gradient-to-r from-yellowAccent/20 to-redAccent/10 border border-redAccent/30 rounded-lg p-4 mt-6">
                      <p className="font-body text-navy font-bold">
                        <span className="text-redAccent font-bold">Please note</span> that we are <span className="text-navy font-bold">not an investment company</span> and do <span className="text-redAccent font-bold">not provide financial advice</span>. We simply handle the <span className="text-teal font-bold">conversion of your funds</span>.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Image Section - Takes 1/3 of the card */}
                <div className="relative lg:col-span-1">
                  <img 
                    src="/businesswoman-sitting-couch-office-typing-looking-pc-screen.jpg" 
                    alt="Professional Trading"
                    className="w-full h-full object-cover min-h-[300px] lg:min-h-[500px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-navy/10 to-transparent"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional FAQ Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-blanc/90 dark:bg-navy/80 border-foam/50 dark:border-teal/30 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardHeader className="bg-gradient-to-r from-foam/30 to-ivory/50 dark:from-teal/20 dark:to-navy/30 border-b border-foam/50 dark:border-teal/30">
                <CardTitle className="font-heading text-teal dark:text-foam">How do I start trading?</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 font-body text-navy dark:text-foam">
                  <p className="font-bold">To start trading with us, you need to:</p>
                  <ol className="space-y-2 ml-4">
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">1.</span>
                      <span><span className="text-navy font-bold">Register</span> an account on our platform</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">2.</span>
                      <span><span className="text-navy font-bold">Complete KYC</span> verification (required by FSCA regulations)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">3.</span>
                      <span><span className="text-navy font-bold">Wait for approval</span> from our team</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">4.</span>
                      <span><span className="text-navy font-bold">Access trading dashboard</span> and start generating quotes</span>
                    </li>
                  </ol>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blanc/90 dark:bg-navy/80 border-foam/50 dark:border-teal/30 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardHeader className="bg-gradient-to-r from-foam/30 to-ivory/50 dark:from-teal/20 dark:to-navy/30 border-b border-foam/50 dark:border-teal/30">
                <CardTitle className="font-heading text-teal dark:text-foam">What documents do I need for KYC?</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 font-body text-navy dark:text-foam">
                  <p className="font-bold">You will need to provide:</p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Valid ID document</span> (passport, national ID, or driving license)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Proof of address</span> (utility bill or bank statement, not older than 3 months)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Selfie with ID</span> for verification purposes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Source of funds</span> declaration</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-blanc/90 dark:bg-navy/80 border-foam/50 dark:border-teal/30 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardHeader className="bg-gradient-to-r from-foam/30 to-ivory/50 dark:from-teal/20 dark:to-navy/30 border-b border-foam/50 dark:border-teal/30">
                <CardTitle className="font-heading text-teal dark:text-foam">What are your fees?</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 font-body text-navy dark:text-foam">
                  <p className="font-bold">Our transparent fee structure:</p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Admin fee:</span> <span className="text-teal font-bold">0.5%</span> of transaction amount</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Withdrawal fee:</span> <span className="text-teal font-bold">R50</span> for ZAR, <span className="text-teal font-bold">N$50</span> for NAD</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Exchange rate markup:</span> <span className="text-teal font-bold">2%</span> (built into the rate)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Crypto-to-crypto swaps:</span> <span className="text-teal font-bold">Lower fees</span> (no withdrawal fees)</span>
                    </li>
                  </ul>
                  <div className="bg-gradient-to-r from-greenAccent/20 to-teal/20 border border-greenAccent/30 rounded p-3 mt-4">
                    <p className="text-sm font-bold text-navy dark:text-foam">
                      <span className="text-greenAccent font-bold">All fees</span> are clearly shown in your quote before you accept.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blanc/90 dark:bg-navy/80 border-foam/50 dark:border-teal/30 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardHeader className="bg-gradient-to-r from-foam/30 to-ivory/50 dark:from-teal/20 dark:to-navy/30 border-b border-foam/50 dark:border-teal/30">
                <CardTitle className="font-heading text-teal dark:text-foam">How long do trades take?</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 font-body text-navy dark:text-foam">
                  <p className="font-bold">Trading timelines depend on the type:</p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Quote generation:</span> <span className="text-teal font-bold">Instant</span></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Quote validity:</span> <span className="text-teal font-bold">15 minutes</span></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Payment verification:</span> <span className="text-teal font-bold">1-2 hours</span> during business hours</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Crypto transfers:</span> <span className="text-teal font-bold">15-30 minutes</span> after payment confirmation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Bank transfers:</span> <span className="text-teal font-bold">Same day</span> if processed before 2 PM</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-blanc/90 dark:bg-navy/80 border-foam/50 dark:border-teal/30 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardHeader className="bg-gradient-to-r from-foam/30 to-ivory/50 dark:from-teal/20 dark:to-navy/30 border-b border-foam/50 dark:border-teal/30">
                <CardTitle className="font-heading text-teal dark:text-foam">Is Liquid Current regulated?</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 font-body text-navy dark:text-foam">
                  <p className="font-bold">
                    Yes, we are fully regulated by the <span className="text-teal font-bold">Financial Sector Conduct Authority (FSCA)</span> under <span className="text-navy font-bold">FSP License Number 53702</span>.
                  </p>
                  <p className="font-bold">
                    This means we must comply with:
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">KYC/AML requirements</span></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Financial record keeping</span></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Consumer protection laws</span></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Regular compliance audits</span></span>
                    </li>
                  </ul>
                  <div className="bg-gradient-to-r from-greenAccent/20 to-teal/20 border border-greenAccent/30 rounded p-3 mt-4">
                    <p className="text-sm font-bold text-navy dark:text-foam">
                      <span className="text-greenAccent font-bold">Your funds are protected</span> by South African financial regulations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blanc/90 dark:bg-navy/80 border-foam/50 dark:border-teal/30 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardHeader className="bg-gradient-to-r from-foam/30 to-ivory/50 dark:from-teal/20 dark:to-navy/30 border-b border-foam/50 dark:border-teal/30">
                <CardTitle className="font-heading text-teal dark:text-foam">What cryptocurrencies do you support?</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 font-body text-navy dark:text-foam">
                  <p className="font-bold">We support major cryptocurrencies including:</p>
                  <div className="grid grid-cols-2 gap-2 ml-4">
                    <div className="space-y-1">
                      <p className="flex items-center"><span className="text-teal font-bold mr-2">•</span><span className="text-navy font-bold">Bitcoin (BTC)</span></p>
                      <p className="flex items-center"><span className="text-teal font-bold mr-2">•</span><span className="text-navy font-bold">Ethereum (ETH)</span></p>
                      <p className="flex items-center"><span className="text-teal font-bold mr-2">•</span><span className="text-navy font-bold">USDT (Tether)</span></p>
                      <p className="flex items-center"><span className="text-teal font-bold mr-2">•</span><span className="text-navy font-bold">USDC</span></p>
                    </div>
                    <div className="space-y-1">
                      <p className="flex items-center"><span className="text-teal font-bold mr-2">•</span><span className="text-navy font-bold">Litecoin (LTC)</span></p>
                      <p className="flex items-center"><span className="text-teal font-bold mr-2">•</span><span className="text-navy font-bold">XRP</span></p>
                      <p className="flex items-center"><span className="text-teal font-bold mr-2">•</span><span className="text-navy font-bold">Cardano (ADA)</span></p>
                      <p className="flex items-center"><span className="text-teal font-bold mr-2">•</span><span className="text-navy font-bold">And more...</span></p>
                    </div>
                  </div>
                  <p className="font-bold">
                    We support <span className="text-teal font-bold">South African Rand (ZAR)</span> and <span className="text-teal font-bold">Namibian Dollar (NAD)</span> for fiat conversions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-blanc/90 dark:bg-navy/80 border-foam/50 dark:border-teal/30 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardHeader className="bg-gradient-to-r from-foam/30 to-ivory/50 dark:from-teal/20 dark:to-navy/30 border-b border-foam/50 dark:border-teal/30">
                <CardTitle className="font-heading text-teal dark:text-foam">Are my funds safe?</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 font-body text-navy dark:text-foam">
                  <p className="font-bold">
                    <span className="text-greenAccent font-bold">Yes</span>, your funds are protected through:
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">FSCA regulation</span> and oversight</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Segregated client accounts</span></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Multi-signature wallets</span> for crypto storage</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Bank-grade security</span> protocols</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Professional indemnity insurance</span></span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blanc/90 dark:bg-navy/80 border-foam/50 dark:border-teal/30 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardHeader className="bg-gradient-to-r from-foam/30 to-ivory/50 dark:from-teal/20 dark:to-navy/30 border-b border-foam/50 dark:border-teal/30">
                <CardTitle className="font-heading text-teal dark:text-foam">What are your trading limits?</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 font-body text-navy dark:text-foam">
                  <p className="font-bold">Trading limits vary by verification level:</p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Minimum trade:</span> <span className="text-teal font-bold">R250</span> equivalent</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Standard users:</span> <span className="text-teal font-bold">R50,000</span> per day</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Verified users:</span> <span className="text-teal font-bold">R500,000</span> per day</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">SuperUsers:</span> <span className="text-teal font-bold">Custom limits</span> with special rates</span>
                    </li>
                  </ul>
                  <div className="bg-gradient-to-r from-yellowAccent/20 to-greenAccent/20 border border-yellowAccent/30 rounded p-3 mt-4">
                    <p className="text-sm font-bold text-navy dark:text-foam">
                      <span className="text-yellowAccent font-bold">Higher limits available</span> for institutional clients.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-blanc/90 dark:bg-navy/80 border-foam/50 dark:border-teal/30 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardHeader className="bg-gradient-to-r from-foam/30 to-ivory/50 dark:from-teal/20 dark:to-navy/30 border-b border-foam/50 dark:border-teal/30">
                <CardTitle className="font-heading text-teal dark:text-foam">Can I cancel a trade?</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 font-body text-navy dark:text-foam">
                  <p className="font-bold">Trade cancellation depends on the stage:</p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start">
                      <span className="text-greenAccent font-bold mr-2">✓</span>
                      <span><span className="text-navy font-bold">Before accepting quote:</span> <span className="text-teal font-bold">Yes, free cancellation</span></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellowAccent font-bold mr-2">⚠</span>
                      <span><span className="text-navy font-bold">After accepting quote:</span> <span className="text-teal font-bold">Contact support immediately</span></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-redAccent font-bold mr-2">✗</span>
                      <span><span className="text-navy font-bold">After payment sent:</span> <span className="text-teal font-bold">Cannot cancel, trade will complete</span></span>
                    </li>
                  </ul>
                  <div className="bg-gradient-to-r from-redAccent/10 to-redAccent/20 border border-redAccent/30 rounded p-3 mt-4">
                    <p className="text-sm font-bold text-redAccent">
                      <span className="text-redAccent font-bold">Important:</span> Double-check all details before accepting quotes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blanc/90 dark:bg-navy/80 border-foam/50 dark:border-teal/30 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardHeader className="bg-gradient-to-r from-foam/30 to-ivory/50 dark:from-teal/20 dark:to-navy/30 border-b border-foam/50 dark:border-teal/30">
                <CardTitle className="font-heading text-teal dark:text-foam">How do I get support?</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 font-body text-navy dark:text-foam">
                  <p className="font-bold">Multiple ways to reach our support team:</p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">WhatsApp:</span> <span className="text-teal font-bold">+27 83 607 7670</span> (Jaryd)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">WhatsApp:</span> <span className="text-teal font-bold">+27 74 904 3765</span> (Christelle)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Email:</span> <span className="text-teal font-bold">support@liquidcurrent.com</span></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Trading dashboard:</span> <span className="text-teal font-bold">WhatsApp support button</span></span>
                    </li>
                  </ul>
                  <div className="bg-gradient-to-r from-greenAccent/20 to-teal/20 border border-greenAccent/30 rounded p-3 mt-4">
                    <p className="text-sm font-bold text-navy dark:text-foam">
                      <span className="text-greenAccent font-bold">Business hours:</span> Monday-Friday, 8 AM - 5 PM SAST
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-blanc/90 dark:bg-navy/80 border-foam/50 dark:border-teal/30 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardHeader className="bg-gradient-to-r from-foam/30 to-ivory/50 dark:from-teal/20 dark:to-navy/30 border-b border-foam/50 dark:border-teal/30">
                <CardTitle className="font-heading text-teal dark:text-foam">What blockchain networks do you support?</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 font-body text-navy dark:text-foam">
                  <p className="font-bold">We support multiple blockchain networks:</p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Ethereum (ERC20):</span> <span className="text-teal font-bold">Most secure, higher fees</span></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Tron (TRC20):</span> <span className="text-teal font-bold">Lower fees, fast transactions</span></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Binance Smart Chain (BEP20):</span> <span className="text-teal font-bold">Low fees, fast</span></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span><span className="text-navy font-bold">Polygon:</span> <span className="text-teal font-bold">Very low fees</span></span>
                    </li>
                  </ul>
                  <div className="bg-gradient-to-r from-yellowAccent/20 to-redAccent/10 border border-yellowAccent/30 rounded p-3 mt-4">
                    <p className="text-sm font-bold text-navy dark:text-foam">
                      <span className="text-yellowAccent font-bold">Important:</span> Ensure your wallet supports the selected network.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blanc/90 dark:bg-navy/80 border-foam/50 dark:border-teal/30 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardHeader className="bg-gradient-to-r from-foam/30 to-ivory/50 dark:from-teal/20 dark:to-navy/30 border-b border-foam/50 dark:border-teal/30">
                <CardTitle className="font-heading text-teal dark:text-foam">Do you provide investment advice?</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 font-body text-navy dark:text-foam">
                  <div className="bg-gradient-to-r from-redAccent/10 to-redAccent/20 border border-redAccent/30 rounded p-4">
                    <p className="font-bold text-redAccent mb-3">
                      <span className="text-redAccent font-bold">No</span>, we do not provide investment advice.
                    </p>
                    <p className="font-bold text-navy dark:text-foam">
                      We are a <span className="text-teal font-bold">trading facilitation service</span> that:
                    </p>
                    <ul className="space-y-1 ml-4 mt-2">
                      <li className="flex items-start">
                        <span className="text-teal font-bold mr-2">•</span>
                        <span>Processes <span className="text-navy font-bold">currency conversions</span></span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-teal font-bold mr-2">•</span>
                        <span>Provides <span className="text-navy font-bold">market exchange rates</span></span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-teal font-bold mr-2">•</span>
                        <span>Ensures <span className="text-navy font-bold">regulatory compliance</span></span>
                      </li>
                    </ul>
                  </div>
                  <p className="font-bold text-navy dark:text-foam">
                    <span className="text-redAccent font-bold">Always conduct your own research</span> before making investment decisions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information Card */}
          <Card className="bg-gradient-to-r from-navy to-teal border-foam/50 dark:border-teal/30 shadow-lg text-blanc">
            <CardHeader className="bg-gradient-to-r from-navy/90 to-teal/90 border-b border-foam/50 dark:border-teal/30">
              <CardTitle className="font-heading text-foam text-center">Still Have Questions?</CardTitle>
              <CardDescription className="font-body text-ivory text-center">
                Our team is here to help you with any additional questions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <p className="text-lg font-body font-bold text-ivory">
                  Contact our <span className="text-foam font-bold">expert trading team</span> for personalized assistance
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-blanc/20 backdrop-blur-sm rounded-lg p-4 border border-foam/30">
                    <h3 className="font-heading font-bold text-foam mb-2">Trading Support</h3>
                    <p className="font-body text-ivory">
                      <span className="text-foam font-bold">Jaryd:</span> <span className="text-ivory font-bold">+27 83 607 7670</span>
                    </p>
                    <p className="font-body text-ivory">
                      <span className="text-foam font-bold">Christelle:</span> <span className="text-ivory font-bold">+27 74 904 3765</span>
                    </p>
                  </div>
                  
                  <div className="bg-blanc/20 backdrop-blur-sm rounded-lg p-4 border border-foam/30">
                    <h3 className="font-heading font-bold text-foam mb-2">General Inquiries</h3>
                    <p className="font-body text-ivory">
                      <span className="text-foam font-bold">Email:</span> <span className="text-ivory font-bold">support@liquidcurrent.com</span>
                    </p>
                    <p className="font-body text-ivory">
                      <span className="text-foam font-bold">Complaints:</span> <span className="text-ivory font-bold">Tiffany.Miller@liquidcurrent.co.za</span>
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-foam/20 to-ivory/30 rounded-lg border border-foam/50">
                  <p className="text-sm font-body font-bold text-ivory">
                    <span className="text-foam font-bold">FSP License:</span> 53702 | <span className="text-foam font-bold">Regulated by:</span> Financial Sector Conduct Authority (FSCA)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FAQ;