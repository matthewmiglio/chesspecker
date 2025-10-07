import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chess Tactics Puzzles | Practice & Improve',
  description: 'Solve chess tactics puzzles online. Practice with curated puzzle sets designed to improve your pattern recognition and calculation.',
  keywords: ['chess tactics puzzles', 'chess puzzle solver', 'chess training puzzles', 'tactical puzzles', 'chess practice'],
  alternates: {
    canonical: 'https://chesspecker.org/puzzles',
  },
  openGraph: {
    title: 'Chess Tactics Puzzles | Practice & Improve',
    description: 'Solve chess tactics puzzles online. Practice with curated puzzle sets designed to improve your pattern recognition and calculation.',
    url: 'https://chesspecker.org/puzzles',
    type: 'website',
  },
  twitter: {
    title: 'Chess Tactics Puzzles | Practice & Improve',
    description: 'Solve chess tactics puzzles online. Practice with curated puzzle sets designed to improve your pattern recognition and calculation.',
  }
}

export default function PuzzlesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}