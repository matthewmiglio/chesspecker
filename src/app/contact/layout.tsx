import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact | Chess App Developer & Next.js Expert',
  description: 'Get in touch with Matthew Miglio - Next.js developer specializing in chess applications and AI/ML implementations.',
  keywords: ['chess app developer', 'Next.js chess application', 'React chess project', 'chess software developer', 'contact developer'],
  alternates: {
    canonical: 'https://chesspecker.org/contact',
  },
  openGraph: {
    title: 'Contact | Chess App Developer & Next.js Expert',
    description: 'Get in touch with Matthew Miglio - Next.js developer specializing in chess applications and AI/ML implementations.',
    url: 'https://chesspecker.org/contact',
    type: 'profile',
  },
  twitter: {
    title: 'Contact | Chess App Developer & Next.js Expert',
    description: 'Get in touch with Matthew Miglio - Next.js developer specializing in chess applications and AI/ML implementations.',
  }
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}