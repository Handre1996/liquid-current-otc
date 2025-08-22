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
                  className="h-36 w-auto opacity-80 hover:opacity-100 transition-opacity duration-200"
                />
              ) : (
                <img 
                  src="/LiquidCurrent_Logo_CMYK_PrimaryLogoNavy.png" 
                  alt="Liquid Current" 
                  className="h-37 w-auto opacity-80 hover:opacity-100 transition-opacity duration-200"
                />
              )}
            </div>
            <p className="text-sm font-body font-bold text-center">
              <span className="text-navy"></span><br />
              <span className="text-navy"></span>
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className={`text-lg font-semibold font-heading font-bold ${isAboutPage ? 'text-foam' : 'text-teal dark:text-navy'}`}>
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
            <div className="mt-4 md:mt-0 flex space-x-4">
              {/* Socials left as-is */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
