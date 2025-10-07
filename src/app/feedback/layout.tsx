import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Submit Feedback | ChessPecker Chess Puzzle Platform',
  description: 'Provide valuable feedback to improve ChessPecker\'s chess puzzle creation and practice tools.',
  keywords: ['chess feedback', 'puzzle feedback', 'chess app feedback', 'user feedback', 'chess improvement suggestions'],
  alternates: {
    canonical: 'https://chesspecker.org/feedback',
  },
  openGraph: {
    title: 'Submit Feedback | ChessPecker Chess Puzzle Platform',
    description: 'Provide valuable feedback to improve ChessPecker\'s chess puzzle creation and practice tools.',
    url: 'https://chesspecker.org/feedback',
    type: 'website',
  },
  twitter: {
    title: 'Submit Feedback | ChessPecker Chess Puzzle Platform',
    description: 'Provide valuable feedback to improve ChessPecker\'s chess puzzle creation and practice tools.',
  }
}

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}