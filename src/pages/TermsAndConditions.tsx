import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-ivory to-foam dark:from-navy dark:to-teal">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-center mb-8 text-navy dark:text-foam">
            Terms and Conditions
          </h1>
          
          <Card className="bg-blanc/90 dark:bg-navy/80 border-foam/50 dark:border-teal/30 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-foam/20 to-ivory/50 dark:from-teal/20 dark:to-navy/30 border-b border-foam/50 dark:border-teal/30">
              <CardTitle className="font-heading text-navy dark:text-foam">
                Liquid Current OTC Desk - Terms and Conditions
              </CardTitle>
              <CardDescription className="font-body text-teal dark:text-foam/80">
                Please read these terms carefully before using our services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-8 font-body text-navy dark:text-foam">
              
              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">1. Introduction</h2>
                <p className="leading-relaxed">
                  These Terms and Conditions ("Terms") govern your use of the services provided by Liquid Current OTC Desk, 
                  a division operating under FSP License Number 53702, regulated by the Financial Sector Conduct Authority (FSCA) 
                  of South Africa. By accessing or using our services, you agree to be bound by these Terms.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">2. Definitions</h2>
                <div className="space-y-2">
                  <p><strong className="text-teal dark:text-yellowAccent">"Company", "we", "us", "our"</strong> refers to Liquid Current OTC Desk</p>
                  <p><strong className="text-teal dark:text-yellowAccent">"Client", "you", "your"</strong> refers to the person or entity using our services</p>
                  <p><strong className="text-teal dark:text-yellowAccent">"OTC Services"</strong> refers to over-the-counter cryptocurrency trading services</p>
                  <p><strong className="text-teal dark:text-yellowAccent">"Digital Assets"</strong> refers to cryptocurrencies and virtual currencies</p>
                  <p><strong className="text-teal dark:text-yellowAccent">"KYC"</strong> refers to Know Your Customer procedures</p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">3. Services Provided</h2>
                <p className="leading-relaxed">
                  Liquid Current OTC Desk provides over-the-counter cryptocurrency trading services, facilitating the exchange 
                  between digital assets and fiat currencies. Our services include:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Cryptocurrency to fiat currency conversion</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Fiat currency to cryptocurrency conversion</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Cryptocurrency to cryptocurrency exchanges</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Professional trading consultation and support</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">4. Eligibility and Registration</h2>
                <p className="leading-relaxed">
                  To use our services, you must:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Be at least 18 years of age</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Have legal capacity to enter into binding agreements</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Complete our KYC verification process</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Provide accurate and complete information during registration</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Comply with all applicable laws and regulations</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">5. Know Your Customer (KYC) Requirements</h2>
                <p className="leading-relaxed">
                  As a regulated financial service provider, we are required to implement comprehensive KYC procedures. 
                  All clients must provide:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Valid government-issued identification documents</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Proof of residential address (not older than 3 months)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Source of funds declaration and supporting documentation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Selfie photograph with identification document</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">6. Trading Terms</h2>
                <div className="space-y-4">
                  <h3 className="text-xl font-heading font-semibold text-teal dark:text-yellowAccent">6.1 Quote Validity</h3>
                  <p className="leading-relaxed">
                    All quotes provided are valid for a limited time period as specified in the quote. 
                    Quotes may be withdrawn or modified at any time before acceptance.
                  </p>
                  
                  <h3 className="text-xl font-heading font-semibold text-teal dark:text-yellowAccent">6.2 Fees and Charges</h3>
                  <p className="leading-relaxed">
                    Our fee structure includes administrative fees and withdrawal fees as disclosed in each quote. 
                    All fees are transparently displayed before transaction confirmation.
                  </p>
                  
                  <h3 className="text-xl font-heading font-semibold text-teal dark:text-yellowAccent">6.3 Settlement</h3>
                  <p className="leading-relaxed">
                    Transactions will be settled according to agreed timelines following receipt and verification of payment. 
                    Settlement times may vary based on network congestion and verification requirements.
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">7. Risk Disclosure</h2>
                <div className="bg-redAccent/10 dark:bg-redAccent/20 border border-redAccent/30 rounded-lg p-4">
                  <p className="leading-relaxed text-redAccent dark:text-redAccent">
                    <strong>WARNING:</strong> Trading in digital assets involves significant risks including:
                  </p>
                  <ul className="space-y-2 ml-6 mt-4 text-redAccent dark:text-redAccent">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Extreme price volatility</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Potential total loss of invested capital</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Regulatory and legal risks</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Technology and security risks</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Liquidity risks</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">8. Liability and Disclaimers</h2>
                <p className="leading-relaxed">
                  We are a third-party service provider and are not responsible or liable for any projects, 
                  investments, or uses to which you apply your funds. You acknowledge that:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>You conduct your own research and due diligence</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Investment decisions are made at your own risk</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>We provide trading services only, not investment advice</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">9. Compliance and Regulatory</h2>
                <p className="leading-relaxed">
                  As an FSCA-regulated entity (FSP 53702), we maintain strict compliance with:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Financial Intelligence Centre Act (FICA)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Prevention of Organised Crime Act (POCA)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Financial Advisory and Intermediary Services Act (FAIS)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>All applicable FSCA regulations and guidance</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">10. Privacy and Data Protection</h2>
                <p className="leading-relaxed">
                  We are committed to protecting your personal information in accordance with the Protection of Personal 
                  Information Act (POPIA) and other applicable privacy laws. Your information will be used solely for:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>KYC and compliance verification</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Transaction processing and settlement</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Regulatory reporting requirements</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Customer service and support</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">11. Transaction Procedures</h2>
                <div className="space-y-4">
                  <h3 className="text-xl font-heading font-semibold text-teal dark:text-yellowAccent">11.1 Quote Generation</h3>
                  <p className="leading-relaxed">
                    Quotes are generated based on current market rates plus applicable markups and fees. 
                    All quotes include full fee disclosure and net amounts.
                  </p>
                  
                  <h3 className="text-xl font-heading font-semibold text-teal dark:text-yellowAccent">11.2 Payment Instructions</h3>
                  <p className="leading-relaxed">
                    Upon quote acceptance, detailed payment instructions will be provided. Failure to complete 
                    payment within specified timeframes may result in quote expiration.
                  </p>
                  
                  <h3 className="text-xl font-heading font-semibold text-teal dark:text-yellowAccent">11.3 Proof of Payment</h3>
                  <p className="leading-relaxed">
                    Clients must provide valid proof of payment for all transactions. Processing will commence 
                    only after payment verification.
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">12. Anti-Money Laundering (AML)</h2>
                <p className="leading-relaxed">
                  We maintain a comprehensive AML program including:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Enhanced due diligence for high-value transactions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Ongoing monitoring of client activities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Suspicious transaction reporting to the Financial Intelligence Centre</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Regular review and update of AML procedures</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">13. Prohibited Activities</h2>
                <p className="leading-relaxed">
                  The following activities are strictly prohibited:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-redAccent mr-2">•</span>
                    <span>Money laundering or terrorist financing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-redAccent mr-2">•</span>
                    <span>Fraud, market manipulation, or illegal activities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-redAccent mr-2">•</span>
                    <span>Use of our services for sanctions evasion</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-redAccent mr-2">•</span>
                    <span>Providing false or misleading information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-redAccent mr-2">•</span>
                    <span>Circumventing our compliance procedures</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">14. Limitation of Liability</h2>
                <p className="leading-relaxed">
                  To the maximum extent permitted by law, Liquid Current OTC Desk shall not be liable for:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Market volatility or price fluctuations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Third-party network delays or failures</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Regulatory changes affecting digital asset trading</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Client investment decisions or outcomes</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">15. Dispute Resolution</h2>
                <p className="leading-relaxed">
                  Any disputes arising from these Terms or our services shall be resolved through:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Good faith negotiation between parties</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Mediation through recognized dispute resolution bodies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Arbitration under South African law if mediation fails</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Final recourse to South African courts</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">16. Amendments</h2>
                <p className="leading-relaxed">
                  We reserve the right to modify these Terms at any time. Material changes will be communicated 
                  to clients with reasonable notice. Continued use of our services constitutes acceptance of amended Terms.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">17. Governing Law</h2>
                <p className="leading-relaxed">
                  These Terms are governed by the laws of the Republic of South Africa. Any legal proceedings 
                  shall be subject to the exclusive jurisdiction of South African courts.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">18. Contact Information</h2>
                <div className="bg-gradient-to-r from-foam/20 to-ivory/50 dark:from-teal/20 dark:to-navy/30 rounded-lg p-4 border border-foam/50 dark:border-teal/30">
                  <p className="leading-relaxed">
                    For questions regarding these Terms or our services, please contact us:
                  </p>
                  <div className="mt-4 space-y-2">
                    <p><strong className="text-teal dark:text-yellowAccent">Email:</strong> support@liquidcurrent.co.za</p>
                    <p><strong className="text-teal dark:text-yellowAccent">WhatsApp:</strong> +27 73 147 5549</p>
                    <p><strong className="text-teal dark:text-yellowAccent">FSP License:</strong> 53702</p>
                    <p><strong className="text-teal dark:text-yellowAccent">Regulatory Authority:</strong> Financial Sector Conduct Authority (FSCA)</p>
                  </div>
                </div>
              </section>

              <section className="bg-gradient-to-r from-navy/10 to-teal/10 dark:from-foam/10 dark:to-ivory/10 rounded-lg p-6 border border-navy/20 dark:border-foam/20">
                <p className="text-sm leading-relaxed text-center">
                  <strong>Last Updated:</strong> January 2025<br/>
                  <strong>Version:</strong> 2.0<br/>
                  By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TermsAndConditions;