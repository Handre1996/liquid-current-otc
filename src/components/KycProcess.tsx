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
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 sm:text-4xl">
            KYC Process
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
            Complete our Know Your Customer process once to trade with confidence through Liquid Current OTC Desk.
          </p>
        </div>

        <div className="mt-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <Card key={step.number} className="border-t-4 border-t-brand bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="pt-6">
                  <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 font-bold text-lg flex items-center justify-center mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">{step.title}</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Required Documents</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {requiredDocuments.map((document, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-brand-500 dark:text-brand-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-base text-gray-700 dark:text-gray-300">{document}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-brand-50 dark:bg-brand-950/50 rounded-md p-4 border border-brand-100 dark:border-brand-800">
            <p className="text-sm text-brand-800 dark:text-brand-200">
              <strong>Note:</strong> We comply with FSCA regulations and South African anti-money laundering laws. All documents are stored securely and confidentially.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}