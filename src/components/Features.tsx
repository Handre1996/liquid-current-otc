import { UserCheck, TrendingDown, Zap, Shield, FileCheck, Headphones } from "lucide-react";

export default function Features() {
  const features = [
    {
      title: "Fiat to Crypto",
      description: "Send us fiat currency through bank transfer and receive cryptocurrency in your wallet.",
      icon: <svg className="h-6 w-6 text-navy dark:text-foam" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    },
    {
      title: "Crypto to Fiat",
      description: "Send us cryptocurrency and receive fiat currency in your bank account.",
      icon: <svg className="h-6 w-6 text-navy dark:text-foam" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    },
    {
      title: "FSCA Regulated",
      description: "We operate under FSP Number 53702, ensuring compliance with South African financial regulations.",
      icon: <svg className="h-6 w-6 text-navy dark:text-foam" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    },
  ];

  const benefits = [
    {
      text: "One-time KYC process",
      icon: UserCheck
    },
    {
      text: "Competitive rates",
      icon: TrendingDown
    },
    {
      text: "Fast processing",
      icon: Zap
    },
    {
      text: "Secure transactions",
      icon: Shield
    },
    {
      text: "Compliance with regulations",
      icon: FileCheck
    },
    {
      text: "Expert customer support",
      icon: Headphones
    }
  ];

  return (
    <div className="bg-background py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl font-heading">
            Our Services
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-muted-foreground mx-auto font-body">
            Liquid Current OTC Desk offers seamless crypto-fiat trading services, all backed by FSCA regulation.
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="bg-ivory dark:bg-navy rounded-lg shadow-lg p-6 border border-foam/30 dark:border-teal hover:shadow-xl transition-all duration-200 hover:scale-105">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-foam/20 dark:bg-foam/10 text-navy dark:text-foam border border-foam/50 dark:border-teal">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-lg font-heading font-semibold text-navy dark:text-foam">{feature.title}</h3>
                <p className="mt-2 text-base font-body text-teal dark:text-foam/80">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 bg-navy rounded-lg shadow-lg border border-foam/50 dark:border-teal/30 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Text Content Section */}
            <div className="p-8 lg:p-12 flex flex-col justify-center order-1">
              <h3 className="text-2xl font-heading font-bold text-foam mb-8">Why Choose Us</h3>
              <div className="space-y-4">
                {benefits.map((benefit, index) => {
                  const IconComponent = benefit.icon;
                  return (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                      <IconComponent className="h-5 w-5 text-navy" />
                    </div>
                    <p className="ml-3 text-base font-body text-foam">{benefit.text}</p>
                  </div>
                  );
                })}
              </div>
            </div>
            
            {/* Image Section */}
            <div className="relative order-2">
              <img 
                src="/choose.png" 
                alt="Why Choose Liquid Current"
                className="w-full h-full object-cover min-h-[300px] lg:min-h-[400px]"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-navy/10 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}