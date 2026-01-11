import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile | ChessPecker',
  description: 'Manage your ChessPecker profile settings and username.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
