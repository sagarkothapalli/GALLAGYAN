import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: {
    default: 'SteadyStack — Financial Tools for Freelancers',
    template: '%s | SteadyStack',
  },
  description:
    'Stop overpaying taxes. Start getting paid on time. SteadyStack helps freelancers and micro-SMB owners master their finances with smart tools, education, and banking.',
  keywords: [
    'freelancer finances',
    'quarterly taxes freelancer',
    'freelance banking',
    'self-employment tax calculator',
    'freelancer emergency fund',
    'income smoothing',
  ],
  authors: [{ name: 'SteadyStack' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://steadystack.com',
    siteName: 'SteadyStack',
    title: 'SteadyStack — Financial Tools for Freelancers',
    description:
      'Stop overpaying taxes. Start getting paid on time. Smart financial tools built for how freelancers actually work.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'SteadyStack' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SteadyStack — Financial Tools for Freelancers',
    description:
      'Stop overpaying taxes. Start getting paid on time. Smart financial tools built for how freelancers actually work.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export default function SteadyStackLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </ThemeProvider>
  );
}
