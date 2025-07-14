import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const AboutUs = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-brand-700">About Liquid Current OTC Desk</h1>
          
          <div className="mb-12">
            <AspectRatio ratio={16/9} className="bg-gray-100 rounded-lg overflow-hidden mb-8">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-brand-700 to-brand-900 text-white">
                <span className="text-xl font-semibold">Our Mission</span>
              </div>
            </AspectRatio>
            
            <p className="text-lg mb-4">
              Liquid Current OTC Desk was founded with a vision to bridge the gap between traditional finance and the emerging world of digital assets. As South Africa's premier over-the-counter cryptocurrency trading desk, we provide a secure, regulated, and efficient platform for high-volume traders, institutions, and individuals seeking to execute large transactions outside the volatility of public exchanges.
            </p>
            
            <p className="text-lg">
              With regulatory compliance at our core (FSP Number 53702 - Regulated by the Financial Sector Conduct Authority), we've created a trusted environment where clients can confidently navigate the cryptocurrency market, backed by our team of financial experts and blockchain specialists.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Our Expertise</CardTitle>
                <CardDescription>What sets us apart</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="font-medium mr-2">•</span>
                    <span>Deep liquidity access across major cryptocurrencies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">•</span>
                    <span>Competitive pricing with minimal slippage</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">•</span>
                    <span>Institutional-grade security protocols</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">•</span>
                    <span>Personalized trading solutions</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Our Promise</CardTitle>
                <CardDescription>What you can expect</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="font-medium mr-2">•</span>
                    <span>Absolute confidentiality for all transactions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">•</span>
                    <span>Transparent fee structure with no hidden costs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">•</span>
                    <span>Swift settlement times</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">•</span>
                    <span>Dedicated account managers</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-brand-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">Our Vision for the Future</h2>
            <p className="text-lg">
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