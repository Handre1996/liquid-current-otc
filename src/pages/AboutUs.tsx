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
          
          <Card className="mb-12 bg-blanc/80 dark:bg-navy/70 border-foam/50 dark:border-teal/30 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Image Section */}
                <div className="relative">
                  <img 
                    src="/lack on call.png" 
                    alt="Liquid Current Team"
                    className="w-full h-full object-cover min-h-[300px] lg:min-h-[400px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-navy/20 to-transparent"></div>
                </div>
                
                {/* Content Section */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <h2 className="text-3xl font-heading font-bold text-navy dark:text-foam mb-6">
                    Our Mission
                  </h2>
                  
                  <p className="text-lg mb-6 font-body text-navy dark:text-foam leading-relaxed">
                    Liquid Current OTC Desk was founded with a vision to bridge the gap between traditional finance and the emerging world of digital assets. As South Africa's premier over-the-counter cryptocurrency trading desk, we provide a secure, regulated, and efficient platform for high-volume traders, institutions, and individuals seeking to execute large transactions outside the volatility of public exchanges.
                  </p>
                  
                  <p className="text-lg font-body text-navy dark:text-foam leading-relaxed">
                    With regulatory compliance at our core (FSP Number 53702 - Regulated by the Financial Sector Conduct Authority), we've created a trusted environment where clients can confidently navigate the cryptocurrency market, backed by our team of financial experts and blockchain specialists.
                  </p>
                  
                  <div className="mt-6 flex items-center gap-2 text-sm font-body text-teal dark:text-foam/80">
                    <div className="w-2 h-2 bg-greenAccent rounded-full"></div>
                    <span>FSP Number 53702 - FSCA Regulated</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
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
          
          {/* Leadership Team Section */}
          <Card className="mb-12 bg-blanc/80 dark:bg-navy/70 border-foam/50 dark:border-teal/30 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-foam/20 to-ivory/50 dark:from-teal/20 dark:to-navy/30 border-b border-foam/50 dark:border-teal/30">
              <CardTitle className="text-2xl font-heading text-center text-navy dark:text-foam">Our Leadership Team</CardTitle>
              <CardDescription className="text-center font-body text-teal dark:text-foam/80">
                Meet the experienced professionals driving our success
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Janine Miller - CEO */}
                <div className="text-center group">
                  <div className="relative mb-4">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/gif?seed=janine&backgroundColor=b6e3f4&clothesColor=262e33&topType=longHairStraight&hairColor=724133&accessoriesType=round&facialHairType=blank&clothesType=blazerShirt&eyeType=happy&eyebrowType=default&mouthType=smile&skinColor=light"
                      alt="Janine Miller"
                      className="w-24 h-24 rounded-full mx-auto border-4 border-navy/20 dark:border-foam/20 shadow-lg group-hover:shadow-xl transition-all duration-200"
                    />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-navy to-teal text-blanc px-3 py-1 rounded-full text-xs font-bold">
                        CEO
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-navy dark:text-foam">Janine Miller</h3>
                  <p className="text-sm font-body text-teal dark:text-foam/80">Chief Executive Officer</p>
                </div>

                {/* Tiffany Miller - Project and Operations Manager */}
                <div className="text-center group">
                  <div className="relative mb-4">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/gif?seed=tiffany&backgroundColor=fef3c7&clothesColor=3c4142&topType=longHairBob&hairColor=2c1b18&accessoriesType=prescription02&facialHairType=blank&clothesType=blazerSweater&eyeType=happy&eyebrowType=default&mouthType=smile&skinColor=light"
                      alt="Tiffany Miller"
                      className="w-24 h-24 rounded-full mx-auto border-4 border-navy/20 dark:border-foam/20 shadow-lg group-hover:shadow-xl transition-all duration-200"
                    />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-teal to-greenAccent text-blanc px-3 py-1 rounded-full text-xs font-bold">
                        Operations
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-navy dark:text-foam">Tiffany Miller</h3>
                  <p className="text-sm font-body text-teal dark:text-foam/80">Project and Operations Manager</p>
                </div>

                {/* David Armstrong - Company KI */}
                <div className="text-center group">
                  <div className="relative mb-4">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/gif?seed=david&backgroundColor=ddd6fe&clothesColor=262e33&topType=shortHairShortWaved&hairColor=4a312c&accessoriesType=sunglasses&facialHairType=goatee&clothesType=shirtCrewNeck&eyeType=default&eyebrowType=default&mouthType=serious&skinColor=light"
                      alt="David Armstrong"
                      className="w-24 h-24 rounded-full mx-auto border-4 border-navy/20 dark:border-foam/20 shadow-lg group-hover:shadow-xl transition-all duration-200"
                    />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-yellowAccent to-redAccent text-blanc px-3 py-1 rounded-full text-xs font-bold">
                        KI
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-navy dark:text-foam">David Armstrong</h3>
                  <p className="text-sm font-body text-teal dark:text-foam/80">Company KI</p>
                </div>

                {/* Jaryd Templar - Processing Team */}
                <div className="text-center group">
                  <div className="relative mb-4">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/gif?seed=jaryd&backgroundColor=d1fae5&clothesColor=5199e4&topType=shortHairShortCurly&hairColor=d08b5b&accessoriesType=blank&facialHairType=blank&clothesType=collarSweater&eyeType=happy&eyebrowType=default&mouthType=smile&skinColor=light"
                      alt="Jaryd Templar"
                      className="w-24 h-24 rounded-full mx-auto border-4 border-navy/20 dark:border-foam/20 shadow-lg group-hover:shadow-xl transition-all duration-200"
                    />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-greenAccent to-teal text-blanc px-3 py-1 rounded-full text-xs font-bold">
                        Processing
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-navy dark:text-foam">Jaryd Templar</h3>
                  <p className="text-sm font-body text-teal dark:text-foam/80">Processing Team</p>
                </div>

                {/* Christelle Lazarus - Processing Team */}
                <div className="text-center group">
                  <div className="relative mb-4">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/gif?seed=christelle&backgroundColor=fce7f3&clothesColor=77dd77&topType=longHairBigHair&hairColor=724133&accessoriesType=blank&facialHairType=blank&clothesType=overall&eyeType=happy&eyebrowType=default&mouthType=smile&skinColor=light"
                      alt="Christelle Lazarus"
                      className="w-24 h-24 rounded-full mx-auto border-4 border-navy/20 dark:border-foam/20 shadow-lg group-hover:shadow-xl transition-all duration-200"
                    />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-greenAccent to-teal text-blanc px-3 py-1 rounded-full text-xs font-bold">
                        Processing
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-navy dark:text-foam">Christelle Lazarus</h3>
                  <p className="text-sm font-body text-teal dark:text-foam/80">Processing Team</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
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