import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const isAboutPage = location.pathname === '/about';
  
  return (
    <footer
      className={`${isAboutPage ? 'bg-navy dark:bg-navy' : 'bg-blanc dark:bg-blanc'} 
                  ${isAboutPage ? 'text-foam' : 'text-navy dark:text-navy'}`}
    >
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left section */}
          <div>
            <h3 className={`text-xl font-logo font-bold ${isAboutPage ? 'text-foam' : 'text-navy dark:text-navy'}`}>
            </h3>
            <p className="mt-2 font-body font-bold text-teal">
              <span className="text-teal">FSP Number 53702</span> – 
              <span className="text-teal"> Regulated by the Financial Sector Conduct Authority (FSCA)</span>
            </p>
            <p className="mt-4 text-sm font-body font-bold">
              <span className="text-navy">We facilitate crypto-to-fiat and fiat-to-crypto transactions</span><br />
              <span className="text-navy">Ensuring regulatory compliance</span><br />
              <span className="text-navy">Security through our KYC process</span>
            </p>
          </div>
          
          {/* Center Logo */}
          <div className="flex flex-col items-center justify-center">
            <div className="mb-4">
              {isAboutPage ? (
                <img 
                  src="/LiquidCurrent_Logo_CMYK_PrimaryLogoFoam.png" 
                  alt="Liquid Current" 
                  className="h-37 w-auto opacity-80 hover:opacity-100 transition-opacity duration-200"
                />
              ) : (
                <img 
                  src="/LiquidCurrent_Logo_CMYK_PrimaryLogoNavy.png" 
                  alt="Liquid Current" 
                  className="h-36 w-auto opacity-80 hover:opacity-100 transition-opacity duration-200"
                />
              )}
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className={`text-xl font-semibold font-heading font-bold ${isAboutPage ? 'text-foam' : 'text-teal dark:text-navy'}`}>
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2 font-bold">
              <li><Link to="/" className="text-navy hover:text-navy">Home</Link></li>
              <li><Link to="/kyc" className="text-navy hover:text-navy">KYC Process</Link></li>
              <li><Link to="/about" className="text-navy hover:text-navy">About Us</Link></li>
              <li><Link to="/terms" className="text-navy hover:text-navy">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="text-navy hover:text-navy">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="mt-8 pt-8 border-t border-brand-700 dark:border-brand-800 bg-foam rounded-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-navy text-sm font-body font-bold">
              &copy; {new Date().getFullYear()} <span className="text-navy">Liquid Current OTC Desk</span>. All rights reserved.
            </p>

            {/* Social Icons */}
            <div className="mt-4 md:mt-0 flex space-x-6">
              {/* Mail */}
              <a href="mailto:info@liquidcurrent.com" className="text-navy hover:text-teal transition-colors">
                <span className="sr-only">Email</span>
                <svg xmlns="http://www.w3.org/2000/svg" 
                     className="h-6 w-6 font-bold" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2 4a2 2 0 012-2h16a2 2 0 012 2v16a2 
                           2 0 01-2 2H4a2 2 0 01-2-2V4zm2 
                           0v.01L12 13l8-8.99V4H4zm16 
                           16V7.414l-8 8-8-8V20h16z"/>
                </svg>
              </a>

              {/* WhatsApp */}
              <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="text-navy hover:text-teal transition-colors">
                <span className="sr-only">WhatsApp</span>
                <svg xmlns="http://www.w3.org/2000/svg" 
                     className="h-6 w-6 font-bold" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.52 3.48A11.85 11.85 0 0012.01 0C5.39 
                           0 .02 5.37.02 12c0 2.11.55 4.16 
                           1.61 5.98L0 24l6.21-1.63A11.96 
                           11.96 0 0012 24c6.63 0 12-5.37 
                           12-12 0-3.19-1.24-6.19-3.48-8.52zM12 
                           21.82a9.77 9.77 0 01-4.99-1.37l-.36-.21-3.69.97.99-3.6-.23-.37A9.79 
                           9.79 0 012.2 12c0-5.39 4.42-9.8 
                           9.81-9.8 2.62 0 5.09 1.02 6.94 
                           2.87a9.74 9.74 0 012.87 6.93c0 
                           5.39-4.42 9.82-9.82 9.82zm5.36-7.48c-.29-.15-1.71-.84-1.98-.94-.27-.1-.47-.15-.66.15-.2.29-.76.94-.93 
                           1.14-.17.2-.34.22-.63.07-.29-.15-1.24-.46-2.36-1.46-.87-.77-1.45-1.72-1.62-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.48.1-.2.05-.37-.02-.52-.07-.15-.66-1.59-.91-2.18-.24-.58-.48-.5-.66-.51h-.57c-.2 
                           0-.52.07-.79.37-.27.29-1.04 1.02-1.04 
                           2.49 0 1.47 1.07 2.9 1.22 
                           3.1.15.2 2.1 3.2 5.08 
                           4.49.71.31 1.26.49 1.69.63.71.22 
                           1.36.19 1.87.12.57-.08 1.71-.7 
                           1.95-1.37.24-.68.24-1.26.17-1.37-.07-.12-.26-.19-.55-.34z"/>
                </svg>
              </a>

              {/* LinkedIn */}
              <a href="https://linkedin.com/company/liquidcurrent" target="_blank" rel="noopener noreferrer" className="text-navy hover:text-teal transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg xmlns="http://www.w3.org/2000/svg" 
                     className="h-6 w-6 font-bold" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" 
                        d="M19 0h-14C2.24 0 0 2.24 0 
                           5v14c0 2.76 2.24 5 5 
                           5h14c2.76 0 5-2.24 
                           5-5V5c0-2.76-2.24-5-5-5zM7 
                           19H4V8h3v11zM5.5 6.73A1.75 
                           1.75 0 115.5 3a1.75 1.75 0 
                           010 3.73zM20 19h-3v-5.6c0-3.37-4-3.12-4 
                           0V19h-3V8h3v1.76C14.4 
                           7.17 20 6.93 20 11.55V19z" 
                        clipRule="evenodd"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
