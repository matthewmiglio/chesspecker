import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium Pricing | Chess Tactics Training Plans",
  description:
    "Upgrade to ChessPecker Premium for unlimited puzzle sets, larger set sizes, and all 21 tactical themes. Plans start at $4.99/month.",
  keywords: [
    "chess premium",
    "chess subscription",
    "chess training plans",
    "woodpecker method premium",
    "chess puzzle subscription",
    "tactical training upgrade",
  ],
  alternates: {
    canonical: "https://chesspecker.org/pricing",
  },
  openGraph: {
    title: "Premium Pricing | ChessPecker",
    description:
      "Unlock unlimited chess puzzle sets and all tactical themes. Plans from $4.99/month or $39.99/year.",
    url: "https://chesspecker.org/pricing",
    type: "website",
  },
  twitter: {
    title: "Premium Pricing | ChessPecker",
    description:
      "Unlock unlimited chess puzzle sets and all tactical themes. Plans from $4.99/month.",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
