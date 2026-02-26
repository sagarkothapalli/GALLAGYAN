import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GallaGyan | Live NSE/BSE Stock Market Data & Analysis",
    template: "%s | GallaGyan"
  },
  description: "Real-time Indian stock market (NSE/BSE) dashboard. Get live share prices, advanced technical analysis, TradingView charts, and breaking financial news. Master the markets with GallaGyan.",
  keywords: ["Indian stock market", "NSE", "BSE", "live share price", "stock analysis", "Nifty 50", "Sensex", "financial news India", "technical analysis", "TradingView charts", "stock screener India", "GallaGyan", "stock market dashboard"],
  authors: [{ name: "Anand Sagar" }],
  creator: "Anand Sagar",
  publisher: "GallaGyan",
  openGraph: {
    title: "GallaGyan | Live NSE/BSE Stock Market Data & Analysis",
    description: "Real-time Indian stock market dashboard. Live prices, charts, and news.",
    url: "https://gallagyan.com",
    siteName: "GallaGyan",
    images: [
      {
        url: "https://gallagyan.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GallaGyan - Indian Stock Market Dashboard",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GallaGyan | Live NSE/BSE Stock Market Data",
    description: "Real-time Indian stock market dashboard. Live prices, charts, and breaking financial news.",
    images: ["https://gallagyan.com/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://gallagyan.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "GallaGyan",
              "url": "https://gallagyan.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://gallagyan.com/?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FinancialService",
              "name": "GallaGyan",
              "description": "Real-time Indian stock market (NSE/BSE) dashboard and educational platform.",
              "url": "https://gallagyan.com",
              "areaServed": "IN",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN"
              }
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "GallaGyan",
              "url": "https://gallagyan.com",
              "logo": "https://gallagyan.com/logo.png",
              "sameAs": [
                "https://github.com/kothapallianandsagar"
              ],
              "founder": {
                "@type": "Person",
                "name": "Anand Sagar"
              },
              "description": "GallaGyan is India's premier educational dashboard for real-time NSE/BSE stock market analysis, combining traditional Indian financial wisdom with modern technology."
            }),
          }}
        />
        {/* Global Educational Notice Banner */}
        <div className="bg-blue-600/10 border-b border-blue-500/20 py-2.5 px-4 sticky top-0 z-[100] backdrop-blur-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 text-center">
            <span className="text-blue-400 text-xs">⚠️</span>
            <p className="text-[9px] md:text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] leading-tight">
              GallaGyan Notice: Educational Purpose Only. No Financial Advice or Tips Provided.
            </p>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
