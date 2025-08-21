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
            <img 
              src="/image copy.png" 
              alt="About Liquid Current OTC Desk"
              className="w-full rounded-lg shadow-lg"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-teal border-foam/50 dark:border-teal/30 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardHeader>
                <CardTitle className="font-heading text-foam">Our Expertise</CardTitle>
                <CardDescription className="font-body"><span className="font-bold text-ivory">What sets us apart</span></CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 font-body text-ivory">
                  <li className="flex items-start">
                    <span className="font-medium mr-2 text-ivory">•</span>
                    <span>Deep liquidity access across major cryptocurrencies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2 text-ivory">•</span>
                    <span>Competitive pricing with minimal slippage</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2 text-ivory">•</span>
                    <span>Institutional-grade security protocols</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2 text-ivory">•</span>
                    <span>Personalized trading solutions</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-teal border-foam/50 dark:border-teal/30 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardHeader>
                <CardTitle className="font-heading text-foam">Our Promise</CardTitle>
                <CardDescription className="font-body"><span className="font-bold text-ivory">What you can expect</span></CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 font-body text-ivory">
                  <li className="flex items-start">
                    <span className="font-medium mr-2 text-ivory">•</span>
                    <span>Absolute confidentiality for all transactions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2 text-ivory">•</span>
                    <span>Transparent fee structure with no hidden costs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2 text-ivory">•</span>
                    <span>Swift settlement times</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2 text-ivory">•</span>
                    <span>Dedicated account managers</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          {/* Leadership Team Section */}
          <Card className="mb-12 bg-ivory border-foam/50 dark:border-teal/30 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-foam/20 to-ivory/50 dark:from-teal/20 dark:to-navy/30 border-b border-foam/50 dark:border-teal/30">
              <CardTitle className="text-2xl font-heading text-center text-teal">Our Leadership Team</CardTitle>
              <CardDescription className="text-center font-body text-teal dark:text-foam/80">
                Meet the experienced professionals driving our success
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Janine Miller - CEO */}
                <div className="text-center group">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full mx-auto border-4 border-navy/20 dark:border-foam/20 shadow-lg group-hover:shadow-xl transition-all duration-200 bg-teal flex items-center justify-center">
                      <span className="text-2xl font-bold text-blanc">JM</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-navy dark:text-foam">Janine Miller</h3>
                  <p className="text-sm font-body text-teal dark:text-foam/80">Chief Executive Officer</p>
                </div>

                {/* Tiffany Miller - Project and Operations Manager */}
                <div className="text-center group">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full mx-auto border-4 border-navy/20 dark:border-foam/20 shadow-lg group-hover:shadow-xl transition-all duration-200 bg-teal flex items-center justify-center">
                      <span className="text-2xl font-bold text-blanc">TM</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-navy dark:text-foam">Tiffany Miller</h3>
                  <p className="text-sm font-body text-teal dark:text-foam/80">Project and Operations Manager</p>
                </div>

                {/* David Armstrong - Company KI */}
                <div className="text-center group">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full mx-auto border-4 border-navy/20 dark:border-foam/20 shadow-lg group-hover:shadow-xl transition-all duration-200 bg-teal flex items-center justify-center">
                      <span className="text-2xl font-bold text-blanc">DA</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-navy dark:text-foam">David Armstrong</h3>
                  <p className="text-sm font-body text-teal dark:text-foam/80">Company KI</p>
                </div>

                {/* Jaryd Templar - Processing Team */}
                <div className="text-center group">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full mx-auto border-4 border-navy/20 dark:border-foam/20 shadow-lg group-hover:shadow-xl transition-all duration-200 bg-teal flex items-center justify-center">
                      <span className="text-2xl font-bold text-blanc">JT</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-navy dark:text-foam">Jaryd Templar</h3>
                  <p className="text-sm font-body text-teal dark:text-foam/80">Processing Team</p>
                </div>

                {/* Christelle Lazarus - Processing Team */}
                <div className="text-center group">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full mx-auto border-4 border-navy/20 dark:border-foam/20 shadow-lg group-hover:shadow-xl transition-all duration-200 bg-teal flex items-center justify-center">
                      <span className="text-2xl font-bold text-blanc">CL</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-navy dark:text-foam">Christelle Lazarus</h3>
                  <p className="text-sm font-body text-teal dark:text-foam/80">Processing Team</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Our Vision for the Future */}
          <Card className="mb-12 bg-blanc/90 dark:bg-navy/80 border-foam/50 dark:border-teal/30 shadow-lg">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Content Section */}
                <div className="p-8 lg:p-12 flex flex-col justify-center order-2 lg:order-1">
                  <h2 className="text-3xl font-heading font-bold text-navy dark:text-foam mb-6">
                    Our Vision for the Future
                  </h2>
                  
                  <p className="text-lg font-body text-navy dark:text-foam leading-relaxed">
                    As blockchain technology continues to evolve, Liquid Current OTC Desk remains committed to pioneering innovative solutions that make cryptocurrency trading more accessible, secure, and compliant. We envision a future where digital assets are seamlessly integrated into the global financial ecosystem, and we're proud to be at the forefront of this transformation in the African market.
                  </p>
                  
                  <div className="mt-6 flex items-center gap-2 text-sm font-body text-teal dark:text-foam/80">
                    <div className="w-2 h-2 bg-greenAccent rounded-full"></div>
                    <span>Leading Africa's Digital Asset Evolution</span>
                  </div>
                </div>
                
                {/* Image Section */}
                <div className="relative order-1 lg:order-2">
                  <img 
                    src="/Woman stair.png" 
                    alt="Vision for the Future"
                    className="w-full h-full object-cover min-h-[300px] lg:min-h-[400px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-navy/20 to-transparent"></div>
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

export default AboutUs;