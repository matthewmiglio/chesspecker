import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Access Your Chess Training",
  description:
    "Sign in to ChessPecker to access your puzzle sets, track progress, and continue your chess tactics training.",
  keywords: [
    "chess login",
    "chesspecker sign in",
    "chess training login",
    "puzzle tracker login",
  ],
  alternates: {
    canonical: "https://chesspecker.org/auth/signin",
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Sign In | ChessPecker",
    description: "Sign in to access your chess tactics training.",
    url: "https://chesspecker.org/auth/signin",
    type: "website",
  },
  twitter: {
    title: "Sign In | ChessPecker",
    description: "Sign in to access your chess tactics training.",
  },
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
