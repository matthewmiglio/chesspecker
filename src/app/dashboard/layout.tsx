import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chess Training Progress | Performance Analytics',
  description: 'Track your chess tactics improvement with detailed performance analytics and progress visualization.',
  keywords: ['chess training progress', 'chess improvement tracking', 'chess performance analytics', 'tactical progress', 'chess statistics'],
  alternates: {
    canonical: 'https://chesspecker.org/dashboard',
  },
  openGraph: {
    title: 'Chess Training Progress | Performance Analytics',
    description: 'Track your chess tactics improvement with detailed performance analytics and progress visualization.',
    url: 'https://chesspecker.org/dashboard',
    type: 'website',
  },
  twitter: {
    title: 'Chess Training Progress | Performance Analytics', 
    description: 'Track your chess tactics improvement with detailed performance analytics and progress visualization.',
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}