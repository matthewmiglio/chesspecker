import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Woodpecker Method | Chess Tactics Training System',
  description: 'Learn the Woodpecker Method for chess improvement. Systematic tactical training through puzzle repetition and pattern recognition.',
  keywords: ['woodpecker method', 'chess tactics training', 'chess pattern recognition', 'tactical training', 'chess improvement'],
  openGraph: {
    title: 'Woodpecker Method | Chess Tactics Training System',
    description: 'Learn the Woodpecker Method for chess improvement. Systematic tactical training through puzzle repetition and pattern recognition.',
    url: 'https://chesspecker.org/about',
    type: 'article',
  },
  twitter: {
    title: 'Woodpecker Method | Chess Tactics Training System',
    description: 'Learn the Woodpecker Method for chess improvement. Systematic tactical training through puzzle repetition and pattern recognition.',
  }
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}