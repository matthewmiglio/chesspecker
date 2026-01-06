import type { Metadata } from "next";
import BlogClient from "./BlogClient";

export const metadata: Metadata = {
  title: "Chess Training Blog | Tactics Tips & Woodpecker Method Guides",
  description:
    "Expert articles on chess tactics training, the Woodpecker Method, pattern recognition, and how to improve your chess game through structured practice.",
  keywords: [
    "chess blog",
    "chess tactics tips",
    "woodpecker method guide",
    "chess improvement articles",
    "pattern recognition chess",
    "chess training tips",
  ],
  alternates: {
    canonical: "https://chesspecker.org/blog",
  },
  openGraph: {
    title: "Chess Training Blog | ChessPecker",
    description:
      "Expert articles on chess tactics training and the Woodpecker Method.",
    url: "https://chesspecker.org/blog",
    type: "website",
  },
  twitter: {
    title: "Chess Training Blog | ChessPecker",
    description:
      "Expert articles on chess tactics training and the Woodpecker Method.",
  },
};

export default function BlogPage() {
  return <BlogClient />;
}
