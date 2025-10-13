// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import Navbar from "@/components/header-footer/navbar";
import Footer from "@/components/header-footer/footer";
import { Analytics } from "@vercel/analytics/react";
import AnalyticsProvider from "@/components/AnalyticsProvider";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true
});

export const metadata: Metadata = {
  metadataBase: new URL('https://chesspecker.org'),
  title: {
    default: 'ChessPecker | Chess Puzzle Practice & Training',
    template: '%s | ChessPecker'
  },
  description: 'Master chess tactics with the Woodpecker Method. Create, practice, and track progress with personalized puzzle sets.',
  keywords: ['chess puzzles', 'tactics training', 'woodpecker method', 'chess practice', 'tactical training', 'pattern recognition'],
  authors: [{ name: 'Matthew Miglio', url: 'https://matthewmiglio.dev' }],
  creator: 'Matthew Miglio',
  publisher: 'ChessPecker',
  alternates: {
    canonical: 'https://chesspecker.org',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://chesspecker.org',
    siteName: 'ChessPecker',
    title: 'ChessPecker | Chess Puzzle Practice & Training',
    description: 'Master chess tactics with the Woodpecker Method. Create, practice, and track progress with personalized puzzle sets.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ChessPecker - Chess Tactics Training with the Woodpecker Method'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChessPecker | Chess Puzzle Practice & Training',
    description: 'Master chess tactics with the Woodpecker Method. Create, practice, and track progress with personalized puzzle sets.',
    images: ['/og-image.png'],
    creator: '@matthewmiglio'
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
  verification: {
    google: 'TODO-ADD-GOOGLE-SEARCH-CONSOLE-VERIFICATION-CODE', // Get from Google Search Console
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Providers>
          <AnalyticsProvider>
            <Navbar />
            <div className="lg:pl-64 flex flex-col flex-1">
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Analytics />
          </AnalyticsProvider>
        </Providers>
      </body>
    </html>
  );
}
