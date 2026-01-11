import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Leaderboard | ChessPecker',
  description: 'See the top chess puzzle solvers on ChessPecker. Compete with players worldwide and climb the ranks.',
  keywords: ['chess leaderboard', 'chess puzzle rankings', 'top chess players', 'chess puzzle competition'],
  alternates: {
    canonical: 'https://chesspecker.org/leaderboard',
  },
  openGraph: {
    title: 'Leaderboard | ChessPecker',
    description: 'See the top chess puzzle solvers on ChessPecker. Compete with players worldwide and climb the ranks.',
    url: 'https://chesspecker.org/leaderboard',
    type: 'website',
  },
}

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
