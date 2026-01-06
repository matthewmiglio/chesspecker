import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support ChessPecker | Donate to Keep Chess Training Free",
  description:
    "Help keep ChessPecker free for everyone. Your donation supports server costs, development, and keeps the platform ad-free.",
  keywords: [
    "support chesspecker",
    "donate chess",
    "chess donation",
    "support chess training",
    "chess community support",
  ],
  alternates: {
    canonical: "https://chesspecker.org/donate",
  },
  openGraph: {
    title: "Support ChessPecker | Donate",
    description:
      "Help keep ChessPecker free for everyone. Your donation supports server costs and development.",
    url: "https://chesspecker.org/donate",
    type: "website",
  },
  twitter: {
    title: "Support ChessPecker | Donate",
    description:
      "Help keep ChessPecker free for everyone. Your donation supports server costs and development.",
  },
};

export default function DonateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
