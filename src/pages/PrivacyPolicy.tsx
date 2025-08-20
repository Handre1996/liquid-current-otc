import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-ivory to-foam dark:from-navy dark:to-teal">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-center mb-8 text-navy dark:text-foam">
            Privacy Policy
          </h1>
          
          <Card className="bg-blanc/90 dark:bg-navy/80 border-foam/50 dark:border-teal/30 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-foam/20 to-ivory/50 dark:from-teal/20 dark:to-navy/30 border-b border-foam/50 dark:border-teal/30">
              <CardTitle className="font-heading text-navy dark:text-foam">
                Liquid Current OTC Desk - Privacy Policy
              </CardTitle>
              <CardDescription className="font-body text-teal dark:text-foam/80">
                Effective Date: January 2025
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-8 font-body text-navy dark:text-foam">
              
              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">1. Introduction</h2>
                <p className="leading-relaxed">
                  Liquid Current OTC Desk ("we", "us", "our") operates under FSP License Number 53702, regulated by the Financial Sector Conduct Authority (FSCA) of South Africa. We are committed to protecting and respecting your privacy in accordance with the Protection of Personal Information Act (POPIA) and other applicable privacy laws.
                </p>
                <p className="leading-relaxed">
                  This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our over-the-counter cryptocurrency trading services.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">2. Information We Collect</h2>
                <div className="space-y-4">
                  <h3 className="text-xl font-heading font-semibold text-teal dark:text-yellowAccent">2.1 Personal Information</h3>
                  <p className="leading-relaxed">We collect the following personal information:</p>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start">
                      <span className="text-greenAccent mr-2">•</span>
                      <span><strong>Identity Information:</strong> Full name, date of birth, nationality, government-issued ID numbers</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-greenAccent mr-2">•</span>
                      <span><strong>Contact Information:</strong> Email address, phone number, residential address</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-greenAccent mr-2">•</span>
                      <span><strong>Financial Information:</strong> Bank account details, source of funds, transaction history</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-greenAccent mr-2">•</span>
                      <span><strong>Verification Documents:</strong> ID documents, proof of address, bank statements</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-greenAccent mr-2">•</span>
                      <span><strong>Biometric Data:</strong> Photographs for identity verification</span>
                    </li>
                  </ul>
                  
                  <h3 className="text-xl font-heading font-semibold text-teal dark:text-yellowAccent">2.2 Technical Information</h3>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start">
                      <span className="text-greenAccent mr-2">•</span>
                      <span>IP addresses and device information</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-greenAccent mr-2">•</span>
                      <span>Browser type and version</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-greenAccent mr-2">•</span>
                      <span>Access times and pages viewed</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-greenAccent mr-2">•</span>
                      <span>Cookies and similar tracking technologies</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">3. How We Use Your Information</h2>
                <p className="leading-relaxed">We use your personal information for the following purposes:</p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Identity Verification:</strong> To comply with KYC and AML requirements</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Service Provision:</strong> To provide OTC trading services and execute transactions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Risk Management:</strong> To assess and monitor trading risks and compliance</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Communication:</strong> To provide updates on transactions and important notices</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Legal Compliance:</strong> To meet regulatory obligations and reporting requirements</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Fraud Prevention:</strong> To detect and prevent fraudulent activities</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">4. Legal Basis for Processing</h2>
                <p className="leading-relaxed">Under POPIA, we process your personal information based on:</p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Consent:</strong> Where you have given explicit consent for specific purposes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Contractual Necessity:</strong> To fulfill our contractual obligations to you</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Legal Obligation:</strong> To comply with regulatory and legal requirements</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Legitimate Interest:</strong> For fraud prevention and business operations</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">5. Information Sharing and Disclosure</h2>
                <p className="leading-relaxed">We may share your information with:</p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Regulatory Bodies:</strong> FSCA, SARB, FIC, and other applicable authorities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Law Enforcement:</strong> When required by law or court order</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Service Providers:</strong> Third-party vendors who assist in our operations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Professional Advisors:</strong> Lawyers, auditors, and compliance consultants</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Banking Partners:</strong> For transaction processing and verification</span>
                  </li>
                </ul>
                <div className="bg-gradient-to-r from-yellowAccent/10 to-redAccent/10 dark:bg-yellowAccent/20 border border-yellowAccent/30 rounded-lg p-4">
                  <p className="leading-relaxed text-redAccent dark:text-yellowAccent">
                    <strong>Important:</strong> We will never sell your personal information to third parties for marketing purposes.
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">6. Data Security</h2>
                <p className="leading-relaxed">We implement comprehensive security measures including:</p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Encryption:</strong> All sensitive data is encrypted in transit and at rest</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Access Controls:</strong> Strict user authentication and authorization protocols</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Regular Audits:</strong> Periodic security assessments and penetration testing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Employee Training:</strong> Regular privacy and security awareness training</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Incident Response:</strong> Procedures for handling security breaches</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">7. Data Retention</h2>
                <p className="leading-relaxed">We retain your personal information:</p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>KYC Records:</strong> For 5 years after account closure as required by FICA</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Transaction Records:</strong> For 5 years as required by regulatory obligations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Communication Records:</strong> For 7 years for dispute resolution purposes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Marketing Consent:</strong> Until withdrawn or account closure</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">8. Your Rights Under POPIA</h2>
                <p className="leading-relaxed">You have the following rights regarding your personal information:</p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Right to Access:</strong> Request copies of your personal information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Right to Correction:</strong> Request correction of inaccurate information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Right to Deletion:</strong> Request deletion where legally permissible</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Right to Object:</strong> Object to processing for direct marketing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Right to Portability:</strong> Receive your data in a structured format</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Right to Restriction:</strong> Request limitation of processing activities</span>
                  </li>
                </ul>
                <div className="bg-gradient-to-r from-foam/20 to-ivory/50 dark:from-teal/20 dark:to-navy/30 rounded-lg p-4 border border-foam/50 dark:border-teal/30">
                  <p className="leading-relaxed">
                    <strong>Note:</strong> Some rights may be limited by regulatory requirements that mandate data retention for compliance purposes.
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">9. Cross-Border Data Transfers</h2>
                <p className="leading-relaxed">
                  Your personal information may be transferred outside South Africa for:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Cloud storage and backup services</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>International compliance and reporting</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Technical support and maintenance</span>
                  </li>
                </ul>
                <p className="leading-relaxed">
                  All cross-border transfers are conducted in accordance with POPIA requirements and include appropriate safeguards such as adequacy decisions, standard contractual clauses, or binding corporate rules.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">10. Automated Decision Making and Profiling</h2>
                <p className="leading-relaxed">
                  We may use automated systems for:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Risk Assessment:</strong> Automated analysis of transaction patterns</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Fraud Detection:</strong> Algorithmic monitoring for suspicious activities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Compliance Screening:</strong> Automated checks against sanctions lists</span>
                  </li>
                </ul>
                <p className="leading-relaxed">
                  You have the right to request human intervention and challenge automated decisions that significantly affect you.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">11. Cookies and Tracking Technologies</h2>
                <div className="space-y-4">
                  <p className="leading-relaxed">We use cookies and similar technologies for:</p>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start">
                      <span className="text-greenAccent mr-2">•</span>
                      <span><strong>Essential Cookies:</strong> Required for platform functionality</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-greenAccent mr-2">•</span>
                      <span><strong>Analytics Cookies:</strong> To understand platform usage patterns</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-greenAccent mr-2">•</span>
                      <span><strong>Security Cookies:</strong> To detect and prevent fraudulent activities</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-greenAccent mr-2">•</span>
                      <span><strong>Preference Cookies:</strong> To remember your settings and preferences</span>
                    </li>
                  </ul>
                  <p className="leading-relaxed">
                    You can manage cookie preferences through your browser settings, though disabling essential cookies may affect platform functionality.
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">12. Data Breach Notification</h2>
                <p className="leading-relaxed">
                  In the event of a data breach that poses a risk to your rights and freedoms, we will:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Notify the Information Regulator within 72 hours</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Inform affected individuals without undue delay</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Provide clear information about the breach and mitigation steps</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Implement measures to prevent future breaches</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">13. Third-Party Services</h2>
                <p className="leading-relaxed">We work with trusted third-party service providers including:</p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Identity Verification Services:</strong> For enhanced KYC procedures</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Cloud Infrastructure Providers:</strong> For secure data storage and processing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Payment Processors:</strong> For transaction settlement</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span><strong>Analytics Providers:</strong> For platform performance monitoring</span>
                  </li>
                </ul>
                <p className="leading-relaxed">
                  All third-party providers are contractually bound to protect your information and use it only for specified purposes.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">14. Marketing Communications</h2>
                <p className="leading-relaxed">
                  We may send you marketing communications about our services where:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>You have provided explicit consent</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>It relates to similar services you have used</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Required for important service updates</span>
                  </li>
                </ul>
                <p className="leading-relaxed">
                  You can opt-out of marketing communications at any time by contacting us or using unsubscribe links in our emails.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">15. Children's Privacy</h2>
                <p className="leading-relaxed">
                  Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child under 18, we will take steps to delete it promptly.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">16. Updates to This Policy</h2>
                <p className="leading-relaxed">
                  We may update this Privacy Policy periodically to reflect changes in our practices or applicable laws. 
                  We will notify you of material changes through:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Email notifications to registered users</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Prominent notices on our platform</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Updated version numbers and effective dates</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">17. Information Officer</h2>
                <p className="leading-relaxed">
                  Our Information Officer is responsible for ensuring compliance with POPIA and handling privacy-related inquiries. You can contact our Information Officer regarding:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Data subject access requests</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Privacy complaints or concerns</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Questions about data processing activities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Requests to exercise your privacy rights</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">18. Complaints Process</h2>
                <p className="leading-relaxed">
                  If you have concerns about our privacy practices:
                </p>
                <div className="space-y-4">
                  <h3 className="text-xl font-heading font-semibold text-teal dark:text-yellowAccent">18.1 Internal Complaints</h3>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start">
                      <span className="text-greenAccent mr-2">•</span>
                      <span>Contact our Information Officer directly</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-greenAccent mr-2">•</span>
                      <span>We will acknowledge your complaint within 48 hours</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-greenAccent mr-2">•</span>
                      <span>Investigation and response within 30 days</span>
                    </li>
                  </ul>
                  
                  <h3 className="text-xl font-heading font-semibold text-teal dark:text-yellowAccent">18.2 External Complaints</h3>
                  <p className="leading-relaxed">
                    You may also lodge complaints with:
                  </p>
                  <ul className="space-y-2 ml-6">
                    <li className="flex items-start">
                      <span className="text-greenAccent mr-2">•</span>
                      <span>The Information Regulator of South Africa</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-greenAccent mr-2">•</span>
                      <span>The Financial Sector Conduct Authority (FSCA)</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">19. International Compliance</h2>
                <p className="leading-relaxed">
                  While primarily governed by South African law, we also consider international privacy standards including:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>General Data Protection Regulation (GDPR) principles</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>International financial privacy standards</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Best practices for cryptocurrency platforms</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">20. Special Categories of Data</h2>
                <p className="leading-relaxed">
                  We may process special categories of personal information where:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Required for regulatory compliance (e.g., sanctions screening)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>Necessary for fraud prevention and detection</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-greenAccent mr-2">•</span>
                    <span>You have provided explicit consent</span>
                  </li>
                </ul>
                <p className="leading-relaxed">
                  Such processing is subject to additional safeguards and restrictions under POPIA.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">21. Contact Information</h2>
                <div className="bg-gradient-to-r from-foam/20 to-ivory/50 dark:from-teal/20 dark:to-navy/30 rounded-lg p-4 border border-foam/50 dark:border-teal/30">
                  <p className="leading-relaxed mb-4">
                    For privacy-related inquiries, data subject requests, or complaints:
                  </p>
                  <div className="space-y-2">
                    <p><strong className="text-teal dark:text-yellowAccent">Information Officer:</strong> Liquid Current OTC Desk</p>
                    <p><strong className="text-teal dark:text-yellowAccent">Email:</strong> privacy@liquidcurrent.co.za</p>
                    <p><strong className="text-teal dark:text-yellowAccent">Support:</strong> support@liquidcurrent.com</p>
                    <p><strong className="text-teal dark:text-yellowAccent">WhatsApp:</strong> +27 73 147 5549</p>
                    <p><strong className="text-teal dark:text-yellowAccent">FSP License:</strong> 53702</p>
                    <p><strong className="text-teal dark:text-yellowAccent">Regulatory Authority:</strong> Financial Sector Conduct Authority (FSCA)</p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">22. Regulatory Authorities</h2>
                <div className="space-y-4">
                  <h3 className="text-xl font-heading font-semibold text-teal dark:text-yellowAccent">Information Regulator</h3>
                  <div className="bg-gradient-to-r from-foam/10 to-ivory/30 dark:from-teal/10 dark:to-navy/20 rounded-lg p-4 border border-foam/30 dark:border-teal/20">
                    <p className="text-sm leading-relaxed">
                      <strong>Address:</strong> JD House, 27 Stiemens Street, Braamfontein, Johannesburg, 2001<br/>
                      <strong>Email:</strong> inforeg@justice.gov.za<br/>
                      <strong>Website:</strong> www.justice.gov.za/inforeg/
                    </p>
                  </div>
                  
                  <h3 className="text-xl font-heading font-semibold text-teal dark:text-yellowAccent">Financial Sector Conduct Authority</h3>
                  <div className="bg-gradient-to-r from-foam/10 to-ivory/30 dark:from-teal/10 dark:to-navy/20 rounded-lg p-4 border border-foam/30 dark:border-teal/20">
                    <p className="text-sm leading-relaxed">
                      <strong>Address:</strong> Riverwalk Office Park, Block B, 41 Matroosberg Road, Ashlea Gardens, Pretoria<br/>
                      <strong>Email:</strong> info@fsca.co.za<br/>
                      <strong>Website:</strong> www.fsca.co.za
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-gradient-to-r from-navy/10 to-teal/10 dark:from-foam/10 dark:to-ivory/10 rounded-lg p-6 border border-navy/20 dark:border-foam/20">
                <p className="text-sm leading-relaxed text-center">
                  <strong>Last Updated:</strong> January 2025<br/>
                  <strong>Version:</strong> 2.0<br/>
                  <strong>Policy Review Date:</strong> January 2026<br/><br/>
                  This Privacy Policy forms part of our Terms and Conditions. By using our services, you acknowledge that you have read, understood, and agree to this Privacy Policy.
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

export default PrivacyPolicy;