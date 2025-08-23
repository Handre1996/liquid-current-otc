import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

export default function Footer() {
  const location = useLocation();
  const isAboutPage = location.pathname === "/about";

  // Color schemes
  const headingColor = isAboutPage ? "text-teal" : "text-teal";
  const textColor = isAboutPage ? "text-blanc" : "text-navy";
  const linkColor = isAboutPage ? "text-teal" : "text-navy";
  const linkHoverColor = isAboutPage ? "hover:text-blanc" : "hover:text-teal";

  return (
    <footer
      className={`w-full ${
        isAboutPage ? "bg-navy text-blanc" : "bg-blanc text-navy"
      }`}
    >
      {/* Main Card */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Left Section */}
          <div className="flex flex-col justify-center">
            <p className={`mt-2 font-body font-bold ${headingColor}`}>
              FSP Number 53702 – Regulated by the Financial Sector Conduct
              Authority (FSCA)
            </p>
            <p className={`mt-4 text-sm font-body font-bold ${textColor}`}>
              We facilitate crypto-to-fiat and fiat-to-crypto transactions for
              our clients, ensuring regulatory compliance and security through
              our KYC process.
            </p>
          </div>

          {/* Center Logo */}
          <div className="flex flex-col items-center justify-center">
            <img
              src="/LiquidCurrent_Logo_CMYK_PrimaryLogoTeal.png"
              alt="Liquid Current"
              className="h-[250px] w-auto opacity-90 hover:opacity-100 transition-opacity duration-200"
            />
          </div>

          {/* Quick Links */}
          <div className="flex flex-col justify-center">
            <h3
              className={`text-xl font-semibold font-heading font-bold ${headingColor}`}
            >
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2 font-bold">
              <li>
                <Link to="/" className={`${linkColor} ${linkHoverColor}`}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className={`${linkColor} ${linkHoverColor}`}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/kyc" className={`${linkColor} ${linkHoverColor}`}>
                  KYC Process
                </Link>
              </li>
              <li>
                <Link to="/terms" className={`${linkColor} ${linkHoverColor}`}>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className={`${linkColor} ${linkHoverColor}`}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a
                  href="/Liquid%20Current%20FSP%20Licence%20copy.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkColor} ${linkHoverColor}`}
                >
                  FSP License
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full bg-foam border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center">
          <p className={`text-sm font-body font-bold ${textColor}`}>
            © {new Date().getFullYear()} Liquid Current OTC Desk. All rights
            reserved.
          </p>

          {/* Social Icons */}
          <div className="mt-4 md:mt-0 flex space-x-6">
            {/* Mail */}
            <a
              href="mailto:info@liquidcurrent.com"
              className={`${linkColor} ${linkHoverColor} transition-colors`}
            >
              <span className="sr-only">Email</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 font-bold"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M2 4a2 2 0 012-2h16a2 2 0 012 
                2v16a2 2 0 01-2 2H4a2 2 0 
                01-2-2V4zm2 0v.01L12 13l8-8.99V4H4zm16 
                16V7.414l-8 8-8-8V20h16z" />
              </svg>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/1234567890"
              target="_blank"
              rel="noopener noreferrer"
              className={`${linkColor} ${linkHoverColor} transition-colors`}
            >
              <span className="sr-only">WhatsApp</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 font-bold"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.52 3.48A11.85 11.85 0 0012.01 
                0C5.39 0 .02 5.37.02 12c0 2.11.55 4.16 
                1.61 5.98L0 24l6.21-1.63A11.96 
                11.96 0 0012 24c6.63 0 12-5.37 
                12-12 0-3.19-1.24-6.19-3.48-8.52z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com/company/liquidcurrent"
              target="_blank"
              rel="noopener noreferrer"
              className={`${linkColor} ${linkHoverColor} transition-colors`}
            >
              <span className="sr-only">LinkedIn</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 font-bold"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M19 0h-14C2.24 0 0 
                  2.24 0 5v14c0 2.76 2.24 5 5 
                  5h14c2.76 0 5-2.24 
                  5-5V5c0-2.76-2.24-5-5-5zM7 
                  19H4V8h3v11zM5.5 6.73A1.75 
                  1.75 0 115.5 3a1.75 1.75 0 
                  010 3.73zM20 19h-3v-5.6c0-3.37-4-3.12-4 
                  0V19h-3V8h3v1.76C14.4 
                  7.17 20 6.93 20 11.55V19z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
