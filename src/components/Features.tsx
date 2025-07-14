import { Check } from "lucide-react";

export default function Features() {
  const features = [
    {
      title: "Fiat to Crypto",
      description: "Send us fiat currency through bank transfer and receive cryptocurrency in your wallet.",
      icon: <svg className="h-6 w-6 text-brand-600 dark:text-brand-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    },
    {
      title: "Crypto to Fiat",
      description: "Send us cryptocurrency and receive fiat currency in your bank account.",
      icon: <svg className="h-6 w-6 text-brand-600 dark:text-brand-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    },
    {
      title: "FSCA Regulated",
      description: "We operate under FSP Number 53702, ensuring compliance with South African financial regulations.",
      icon: <svg className="h-6 w-6 text-brand-600 dark:text-brand-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    },
  ];

  const benefits = [
    "One-time KYC process",
    "Competitive rates",
    "Fast processing",
    "Secure transactions",
    "Compliance with regulations",
    "Expert customer support"
  ];

  return (
    <div className="bg-background py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
            Our Services
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-muted-foreground mx-auto">
            Liquid Current OTC Desk offers seamless crypto-fiat trading services, all backed by FSCA regulation.
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="bg-card rounded-lg shadow-brand p-6 border border-border hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-lg font-medium text-foreground">{feature.title}</h3>
                <p className="mt-2 text-base text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 bg-brand-50 dark:bg-brand-950/50 rounded-lg shadow-sm border border-brand-100 dark:border-brand-800">
          <div className="px-6 py-8 md:p-10">
            <h3 className="text-2xl font-bold text-brand-700 dark:text-brand-300 text-center">Why Choose Us</h3>
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-brand-500 dark:text-brand-400" />
                  </div>
                  <p className="ml-3 text-base text-brand-700 dark:text-brand-300">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}