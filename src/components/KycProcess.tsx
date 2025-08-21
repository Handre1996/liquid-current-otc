import { Card, CardContent } from "@/components/ui/card";

export default function KycProcess() {
  const steps = [
    {
      number: 1,
      title: "Register",
      description: "Create an account with your email address and basic information."
    },
    {
      number: 2,
      title: "Upload Documents",
      description: "Submit your identification and proof of address documents through our secure portal."
    },
    {
      number: 3,
      title: "Verification",
      description: "Our team will review your documents for compliance with FSCA regulations."
    },
    {
      number: 4,
      title: "Approval",
      description: "Once approved, you'll receive confirmation and can begin trading."
    }
  ];

  const requiredDocuments = [
    "Valid government-issued ID (passport, ID card)",
    "Proof of address (utility bill, bank statement, not older than 3 months)",
    "Selfie with ID document",
    "Additional documents may be required based on transaction volumes"
  ];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-heading font-extrabold text-navy dark:text-foam sm:text-4xl">
            KYC Process
          </h2>
          <p className="mt-4 max-w-2xl text-xl font-body text-teal dark:text-foam/80 mx-auto">
            Complete our Know Your Customer process once to trade with confidence through Liquid Current OTC Desk.
          </p>
        </div>

        <div className="mt-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <Card key={step.number} className={`border-t-4 border-t-navy bg-ivory dark:bg-navy/50 border-foam/30 dark:border-teal shadow-lg hover:shadow-xl transition-all duration-200 ${step.number === 4 ? 'overflow-hidden' : ''}`}>
                <CardContent className="pt-6">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-navy to-teal text-blanc font-bold text-lg flex items-center justify-center mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-navy dark:text-foam">{step.title}</h3>
                  <p className="mt-2 font-body text-teal dark:text-foam/80">{step.description}</p>
                  
                  {/* Add image for step 1 */}
                  {step.number === 1 && (
                    <div className="mt-6 -mx-6 -mb-6">
                      <img 
                        src="/Step1.png" 
                        alt="Registration Process"
                        className="w-full h-32 object-cover object-center"
                      />
                    </div>
                  )}
                  
                  {/* Add image for step 2 */}
                  {step.number === 2 && (
                    <div className="mt-6 -mx-6 -mb-6">
                      <img 
                        src="/Step2.png" 
                        alt="Upload Documents Process"
                        className="w-full h-32 object-cover object-center"
                      />
                    </div>
                  )}
                  
                  {/* Add image for step 3 */}
                  {step.number === 3 && (
                    <div className="mt-6 -mx-6 -mb-6">
                      <img 
                        src="/Step3.png" 
                        alt="Verification Process"
                        className="w-full h-32 object-cover object-center"
                      />
                    </div>
                  )}
                  
                  {/* Add image for step 4 */}
                  {step.number === 4 && (
                    <div className="mt-6 -mx-6 -mb-6">
                      <img 
                        src="/image.png"
                        alt="Approval Process"
                        className="w-full h-32 object-cover object-center"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-16 bg-blanc dark:bg-navy/70 rounded-lg shadow-lg border border-foam/30 dark:border-teal/30 overflow-hidden">
        <div className="mt-16 bg-ivory dark:bg-navy/70 rounded-lg shadow-lg border border-foam/30 dark:border-teal/30 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="relative order-2 lg:order-1">
              <img 
                src="/woman Blue.png" 
                alt="Professional Woman"
                className="w-full h-full object-cover min-h-[300px] lg:min-h-[400px]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-navy/20 to-transparent"></div>
            </div>
            
            {/* Content Section */}
            <div className="p-8 lg:p-12 flex flex-col justify-center order-1 lg:order-2">
              <h3 className="text-2xl font-heading font-bold text-navy dark:text-foam mb-6">Required Documents</h3>
              <div className="space-y-4">
                {requiredDocuments.map((document, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-greenAccent" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base font-body text-navy dark:text-foam">{document}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-gradient-to-r from-foam/20 to-ivory/50 dark:from-teal/20 dark:to-navy/30 rounded-md p-4 border border-foam/50 dark:border-teal/30">
                <p className="text-sm font-body text-navy dark:text-foam">
                  <strong>Note:</strong> We comply with FSCA regulations and South African anti-money laundering laws. All documents are stored securely and confidentially.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}