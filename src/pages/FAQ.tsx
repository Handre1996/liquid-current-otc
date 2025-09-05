import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';

const FAQ: React.FC = () => {
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
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* First Card - What is an OTC desk? */}
            <Card className="mb-12 bg-ivory border-foam/50 dark:border-teal/30 shadow-lg overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                  {/* Text Content Section */}
                  <div className="lg:col-span-2 p-8 lg:p-12 flex flex-col justify-center bg-ivory">
                    <h2 className="text-3xl font-heading font-bold text-teal mb-6">What is an OTC desk?</h2>
                    <div className="space-y-4 text-lg leading-relaxed">
                      <p className="font-body text-navy">
                        An <span className="text-navy text-xl font-bold">OTC (Over-the-Counter) desk</span> lets you trade cryptocurrencies directly,
                        rather than on a public exchange. In simple terms, we make it easy to:
                      </p>
            
                      <ul className="space-y-2 ml-6 font-body list-disc text-navy">
                        <li>
                          <span>Convert </span>
                          <span className="font-bold">Rands to cryptocurrency</span>
                          <span> and </span>
                          <span className="font-bold">cryptocurrency back to Rands</span>
                        </li>
                        <li>
                          <span>Swap </span>
                          <span className="font-bold">one cryptocurrency for another</span>
                        </li>
                      </ul>
            
                      <p className="font-body text-navy">
                        Our role is to facilitate these conversions securely and efficiently.
                      </p>
            
                      <div className="bg-red-0 border border-red-0 rounded-lg p-4 mt-6">
                        <p className="font-body text-navy">
                          Please note that we are <span className="font-bold">not an investment company</span> and do not provide financial advice.
                          We simply handle the conversion of your funds.
                        </p>
                      </div>
                    </div>
                  </div>

                {/* Image Section */}
            <div className="relative lg:col-span-1 overflow-hidden">
              {/* Give the image area a fixed height per breakpoint so cover can actually fill */}
              <div className="relative w-full h-[300px] sm:h-[380px] lg:h-[500px]">
                <img
                  src="/businesswoman-sitting-couch-office-typing-looking-pc-screen.jpg"
                  alt="Professional trading environment"
                  className="
                    absolute inset-0 w-full h-full
                    object-cover
                    object-[50%_15%]           /* 👈 bias crop upward to keep head visible */
                    scale-[1.10] sm:scale-[1.06] lg:scale-[1.00]  /* 👈 slight zoom on mobile/tablet */
                    lg:translate-x-[20px]      /* optional: keep your desktop nudge */
                    transition-transform duration-300
                  "
                  loading="lazy"
                  decoding="async"
                />
                {/* Optional soft overlay; remove if you don't want it */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-navy/10 to-transparent" />
              </div>
            </div>
            </div>            
            </CardContent>
          </Card>

          {/* Second Card - What does KYC mean? */}
<Card className="mb-12 bg-navy border-foam/50 dark:border-teal/30 shadow-lg overflow-hidden">
  <CardContent className="p-0">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
      {/* TEXT — first on mobile, RIGHT on desktop */}
      <div className="order-1 lg:order-2 lg:col-span-2 p-8 lg:p-12 flex flex-col justify-center bg-navy">
        <h2 className="text-3xl font-heading font-bold text-teal mb-6">
          What is a wallet KYC?
        </h2>

        <div className="space-y-4 text-lg leading-relaxed">
          <p className="font-body text-blanc">
            A crypto wallet KYC is the process of verifying the identity of the person who owns a
            cryptocurrency wallet, as well as confirming the type of wallet being used.
          </p>

          <p className="font-body text-blanc">
            There are two kinds of wallets:
          </p>

          <ul className="space-y-2 ml-6 font-body list-disc">
            <li className="text-blanc">
              <span className="font-bold text-blanc">Hosted Wallets</span> — managed by a third-party
              provider (like an exchange or platform).
            </li>
            <li className="text-blanc">
              <span className="font-bold text-blanc">Unhosted Wallets</span> — controlled directly by
              you, where only you hold the private keys.
            </li>
          </ul>

          <p className="font-body text-blanc">
            KYC helps us confirm that the wallet belongs to you and ensures it is being used safely and
            legally. This process protects both our clients and our business, while keeping transactions
            secure, transparent, and compliant with regulations.
          </p>
        </div>
      </div>

      {/* IMAGE — second on mobile, LEFT on desktop */}
<div
  className="
    relative order-2 lg:order-1 lg:col-span-1 overflow-hidden
    h-40 sm:h-48 md:h-56
    lg:h-auto lg:min-h-[500px]
  "
>
  <img
    src="/corporate-coffee-black-man-with-phone-internet-research-work-break-online-news-app-office-african-guy-latte-mobile-notification-stock-exchange-with-business-investment.jpg"
    alt="Professional using mobile phone and laptop with coffee"
    className="
      absolute inset-0 w-full h-full object-cover
      object-[center_22%]          /* mobile: push down 22% */
      lg:object-[10%_center]       /* desktop: shift crop right (try 60–80%) */
      lg:scale-[1.04]              /* slight zoom to fill */
      transition-transform duration-200
    "
    loading="lazy"
    decoding="async"
  />
  <div className="pointer-events-none absolute inset-0 bg-transparent" />
</div>
    </div>
  </CardContent>
</Card>


          {/* Third Card - Why it's important */}
          <Card className="mb-12 bg-blanc border-foam/50 dark:border-teal/30 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Text Content Section */}
                <div className="lg:col-span-2 p-8 lg:p-12 flex flex-col justify-center bg-blanc">
                  <h2 className="text-3xl font-heading font-bold text-teal mb-6">Why it's important:</h2>
                  <div className="space-y-6 text-lg leading-relaxed">
                  <div>
                    <h3 className="text-xl font-heading font-bold text-navy mb-2">1. Legal Compliance</h3>
                    <p className="font-body text-navy">
                      Regulators require KYC to{' '}
                      <span className="font-bold">combat money laundering (AML), terrorist financing (CFT),</span>{' '}
                      and <span className="font-bold">fraud</span>. Without it, a financial services provider could face fines, penalties, or license revocation.
                    </p>
                  </div>
                    <div>
                      <h3 className="text-xl font-heading font-bold text-navy mb-2">2. Risk Management</h3>
                      <p className="font-body text-navy">
                        It protects the business from being used (knowingly or unknowingly) for illegal activities. KYC helps identify high-risk clients before onboarding.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-heading font-bold text-navy mb-2">3. Trust & Transparency</h3>
                      <p className="font-body text-navy">
                        By verifying identities, providers build credibility and trust with clients, partners, and regulators.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-heading font-bold text-navy mb-2">4. Protecting Customers</h3>
                      <p className="font-body text-navy">
                        It helps reduce identity theft and financial crime risks, ensuring safer services for legitimate customers.
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-teal/20 to-navy/20 border border-teal/30 rounded-lg p-4 mt-6">
                      <p className="font-body text-navy">
                        In short: <span className="text-navy font-bold">KYC is a cornerstone of responsible financial services</span> — it keeps the business compliant, safe, and trustworthy.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Image Section */}
<div
  className="
    relative lg:col-span-1 overflow-hidden
    h-40 sm:h-48 md:h-56        /* shorter on mobile */
    lg:h-auto lg:min-h-[500px]  /* original size on desktop */
  "
>
  <img
    src="/young-confident-broker-suit-explaining-female-colleague-online-data.jpg"
    alt="Professional consultation at a desk"
    className="
      absolute inset-0 w-full h-full object-cover
      object-[center_26%]        /* nudge crop down a bit; tweak 20–40% if needed */
      scale-[1.05]               /* zoom IN on mobile */
      md:scale-60               /* normal scale from md+ */
      transition-transform duration-200
    "
    loading="lazy"
    decoding="async"
  />
  <div className="absolute inset-0 bg-gradient-to-l from-blanc/10 to-transparent" />
</div>
              </div>
            </CardContent>
          </Card>

          {/* Fourth Card - Why do you need my KYC and are my documents safe? */}
          <Card className="mb-12 bg-teal border-foam/50 dark:border-teal/30 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Image Section */}
                <div className="relative lg:col-span-1 order-2 lg:order-1">
                  <img
                    src="/cyber-security-data-protection-information-safety-encryption.jpg"
                    alt="Cyber security and data protection"
                    className="w-full h-full object-cover min-h-[300px] lg:min-h-[500px]"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-teal/10 to-transparent" />
                </div>

                {/* Text Content Section */}
              <div className="lg:col-span-2 p-8 lg:p-12 flex flex-col justify-center bg-teal order-1 lg:order-2">
                <h2 className="text-3xl font-heading font-bold text-foam mb-6">
                  Why do you need my KYC and are my documents safe?
                </h2>
              
                <div className="space-y-4 text-lg leading-relaxed">
                  <p className="font-body text-blanc">
                    We are required by law to complete
                    {' '}<span className="font-bold">KYC (Know Your Customer)</span>{' '}
                    checks. This helps us verify your identity, comply with anti-money laundering regulations, and keep our services safe, transparent, and secure for all clients.
                  </p>
              
                  <p className="font-body text-blanc">
                    Your documents are kept <span className="font-bold">strictly confidential</span> and stored on a{' '}
                    <span className="font-bold">separate, secure company database</span>.{' '}
                    <span className="font-bol">We never share your information with third parties</span>, unless required by law.
                    Protecting your privacy and safeguarding your information is a top priority for us.
                  </p>
                </div>
              </div>
              </div>
            </CardContent>
          </Card>

          {/* Fifth Card - What is a wallet KYC? */}
          <Card className="mb-12 bg-foam border-foam/50 dark:border-teal/30 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Text Content Section */}
                <div className="lg:col-span-2 p-8 lg:p-12 flex flex-col justify-center bg-foam">
                  <h2 className="text-3xl font-heading font-bold text-teal mb-6">
                    What is a wallet KYC?
                  </h2>
          
                  <div className="space-y-4 text-lg leading-relaxed">
                    <p className="font-body text-navy">
                      A crypto wallet KYC is the process of verifying the identity of the person who owns a cryptocurrency wallet, as well as confirming the type of wallet being used.
                    </p>
          
                    <p className="font-body text-navy">
                      There are two kinds of wallets:
                    </p>
          
                    <ul className="space-y-2 ml-6 font-body list-disc text-navy">
                      <li>
                        <span className="font-bold">Hosted Wallets</span> — managed by a third-party provider (like an exchange or platform).
                      </li>
                      <li>
                        <span className="font-bold">Unhosted Wallets</span> — controlled directly by you, where only you hold the private keys.
                      </li>
                    </ul>
          
                    <p className="font-body text-navy">
                      KYC helps us confirm that the wallet belongs to you and ensures it is being used safely and legally. This process protects both our clients and our business, while keeping transactions{' '}
                      <span className="font-bold">secure, transparent, and compliant with regulations</span>.
                    </p>
                  </div>
                </div>

                {/* Image Section */}
                <div className="relative lg:col-span-1">
                  <img
                    src="/expert-secures-high-tech-workplace.jpg"
                    alt="Expert securing high-tech workplace"
                    className="w-full h-full object-cover min-h-[300px] lg:min-h-[500px]"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-foam/10 to-transparent" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sixth Card - What is the difference between a hosted/unhosted wallet? */}
          <Card className="mb-12 bg-navy border-foam/50 dark:border-teal/30 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Image Section */}
                <div className="relative lg:col-span-1 order-2 lg:order-1">
                  <img
                    src="/hand-laptop-working-cyber-space-table.jpg"
                    alt="Hand on laptop working in cyber space"
                    className="w-full h-full object-cover min-h-[300px] lg:min-h-[500px]"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-navy/10 to-transparent" />
                </div>

                {/* Text Content Section */}
                <div className="lg:col-span-2 p-8 lg:p-12 flex flex-col justify-center bg-navy order-1 lg:order-2">
                  <h2 className="text-3xl font-heading font-bold text-foam mb-6">
                    What is the difference between a hosted/unhosted wallet?
                  </h2>
                  <div className="space-y-4 text-lg leading-relaxed">
                    <p className="font-body text-blanc">
                      A hosted wallet (also known as a custodial wallet) is one where a third party (such as a cryptocurrency exchange or financial service provider) controls the wallet and holds the private keys on behalf of the user.
                    </p>
                    <p className="font-body text-blanc">
                      Commons examples include wallets on platforms like Binance, Coinbase, or Luno.
                    </p>
                    <p className="font-body text-blanc">
                      In contrast, an unhosted wallet is one where the user holds their own private keys and has full control, such as wallets created use MetaMask, Ledger, or Trust Wallet.
                    </p>
                  </div>
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