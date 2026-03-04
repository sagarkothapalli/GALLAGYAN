import Link from 'next/link';
import { BarChart3 } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Calculators', href: '/learn/calculators' },
  ],
  Learn: [
    { label: 'Education Hub', href: '/learn' },
    { label: 'Tax Guide', href: '/learn/quarterly-tax-guide-freelancers' },
    { label: 'Income Smoothing', href: '/learn/income-smoothing-freelancers' },
    { label: 'Financial Health Quiz', href: '/learn/quiz' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Disclaimers', href: '/disclaimers' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-navy-900 text-gray-300">
      <div className="container-wide section-padding">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl text-white mb-4">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-navy-900" />
              </div>
              SteadyStack
            </Link>
            <p className="text-body-sm text-gray-400 mb-6 max-w-xs">
              Financial tools built for how freelancers and small businesses actually work.
            </p>
            <div className="flex gap-4">
              {['Twitter', 'LinkedIn', 'YouTube'].map((platform) => (
                <a
                  key={platform}
                  href="#"
                  className="text-gray-500 hover:text-teal-400 transition-colors text-body-sm"
                  aria-label={`Follow us on ${platform}`}
                >
                  {platform}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-heading font-semibold text-white text-body-sm mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body-sm text-gray-400 hover:text-teal-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Disclaimer + Copyright */}
        <div className="mt-16 pt-8 border-t border-navy-700">
          <p className="text-caption text-gray-500 mb-4">
            <strong>Important:</strong> SteadyStack provides educational content and financial tools for informational purposes only.
            Nothing on this platform constitutes personalized financial, tax, or legal advice. Tax calculations are estimates
            based on simplified assumptions and may not reflect your actual tax liability. Always consult a qualified CPA
            or tax professional for advice specific to your situation. Results shown use ranges and general guidance,
            not user-specific recommendations.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-caption text-gray-500">
              &copy; {new Date().getFullYear()} SteadyStack, Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-caption text-gray-500">
              <Link href="/privacy" className="hover:text-gray-300">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-300">Terms</Link>
              <Link href="/cookies" className="hover:text-gray-300">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
