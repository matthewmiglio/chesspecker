import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chess Puzzle Creator | Build Custom Training Sets',
  description: 'Create personalized chess puzzle sets. Design targeted tactical training with custom difficulty and theme selection.',
  keywords: ['chess puzzle creator', 'create chess puzzles', 'chess puzzle generator', 'custom chess training', 'puzzle maker'],
  alternates: {
    canonical: 'https://chesspecker.org/create',
  },
  openGraph: {
    title: 'Chess Puzzle Creator | Build Custom Training Sets',
    description: 'Create personalized chess puzzle sets. Design targeted tactical training with custom difficulty and theme selection.',
    url: 'https://chesspecker.org/create',
    type: 'website',
  },
  twitter: {
    title: 'Chess Puzzle Creator | Build Custom Training Sets',
    description: 'Create personalized chess puzzle sets. Design targeted tactical training with custom difficulty and theme selection.',
  }
}

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}