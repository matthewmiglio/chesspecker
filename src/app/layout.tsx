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
    google: 'your-google-site-verification-code', // You'll need to add this later
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <AnalyticsProvider>
            <Navbar />
            {children}
            <Footer />
            <Analytics />
          </AnalyticsProvider>
        </Providers>
      </body>
    </html>
  );
}
