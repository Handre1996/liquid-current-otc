import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const AboutUs = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-ivory to-foam dark:from-navy dark:to-teal">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-center mb-8 text-navy dark:text-foam">About Liquid Current OTC Desk</h1>
          
          <div className="mb-12">
            <AspectRatio ratio={16/9} className="bg-foam/20 dark:bg-navy/50 rounded-lg overflow-hidden mb-8 border border-foam/50 dark:border-teal/30">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-navy to-teal text-blanc">
                <span className="text-xl font-heading font-semibold">Our Mission</span>
              </div>
            </AspectRatio>
            
            <p className="text-lg mb-4 font-body text-navy dark:text-foam leading-relaxed">
              Liquid Current OTC Desk was founded with a vision to bridge the gap between traditional finance and the emerging world of digital assets. As South Africa's premier over-the-counter cryptocurrency trading desk, we provide a secure, regulated, and efficient platform for high-volume traders, institutions, and individuals seeking to execute large transactions outside the volatility of public exchanges.
            </p>
            
            <p className="text-lg font-body text-navy dark:text-foam leading-relaxed">
              With regulatory compliance at our core (FSP Number 53702 - Regulated by the Financial Sector Conduct Authority), we've created a trusted environment where clients can confidently navigate the cryptocurrency market, backed by our team of financial experts and blockchain specialists.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-blanc/80 dark:bg-navy/70 border-foam/50 dark:border-teal/30 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardHeader>
                <CardTitle className="font-heading text-navy dark:text-foam">Our Expertise</CardTitle>
                <CardDescription className="font-body text-teal dark:text-foam/80">What sets us apart</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 font-body text-navy dark:text-foam">
                  <li className="flex items-start">
                    <span className="font-medium mr-2 text-greenAccent">•</span>
                    <span>Deep liquidity access across major cryptocurrencies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2 text-greenAccent">•</span>
                    <span>Competitive pricing with minimal slippage</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2 text-greenAccent">•</span>
                    <span>Institutional-grade security protocols</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2 text-greenAccent">•</span>
                    <span>Personalized trading solutions</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-blanc/80 dark:bg-navy/70 border-foam/50 dark:border-teal/30 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardHeader>
                <CardTitle className="font-heading text-navy dark:text-foam">Our Promise</CardTitle>
                <CardDescription className="font-body text-teal dark:text-foam/80">What you can expect</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 font-body text-navy dark:text-foam">
                  <li className="flex items-start">
                    <span className="font-medium mr-2 text-greenAccent">•</span>
                    <span>Absolute confidentiality for all transactions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2 text-greenAccent">•</span>
                    <span>Transparent fee structure with no hidden costs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2 text-greenAccent">•</span>
                    <span>Swift settlement times</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2 text-greenAccent">•</span>
                    <span>Dedicated account managers</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-gradient-to-br from-foam/30 to-ivory dark:from-navy/50 dark:to-teal/20 p-8 rounded-lg shadow-lg border border-foam/50 dark:border-teal/30">
            <h2 className="text-2xl font-heading font-bold mb-4 text-center text-navy dark:text-foam">Our Vision for the Future</h2>
            <p className="text-lg font-body text-navy dark:text-foam leading-relaxed">
              As blockchain technology continues to evolve, Liquid Current OTC Desk remains committed to pioneering innovative solutions that make cryptocurrency trading more accessible, secure, and compliant. We envision a future where digital assets are seamlessly integrated into the global financial ecosystem, and we're proud to be at the forefront of this transformation in the African market.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AboutUs;