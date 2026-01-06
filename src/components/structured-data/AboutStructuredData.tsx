'use client';

export default function AboutStructuredData() {
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the Woodpecker Method?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Woodpecker Method is a focused chess training system built around intensive repetition. It involves solving a carefully selected set of puzzles repeatedly, shrinking the time between solving cycles to sharpen pattern recognition, and mastering tactical motifs to make faster, stronger decisions in real games."
        }
      },
      {
        "@type": "Question",
        "name": "How does the Woodpecker Method improve chess skills?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Woodpecker Method improves chess skills through three steps: 1) Solve a carefully selected set of puzzles again and again, 2) Shrink the time between solving cycles to sharpen pattern recognition, 3) Master tactical motifs to make faster, stronger decisions in real games."
        }
      },
      {
        "@type": "Question",
        "name": "Who created the Woodpecker Method?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Woodpecker Method was developed by Grandmasters Axel Smith and Hans Tikkanen as a systematic approach to chess tactics training through puzzle repetition and pattern recognition."
        }
      }
    ]
  };

  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "What is the Woodpecker Method? | Chess Tactics Training System",
    "description": "Learn the Woodpecker Method for chess improvement. Systematic tactical training through puzzle repetition and pattern recognition.",
    "author": {
      "@type": "Person",
      "name": "Matthew Miglio"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ChessPecker",
      "url": "https://chesspecker.org"
    },
    "datePublished": "2025-01-01",
    "dateModified": new Date().toISOString().split('T')[0],
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://chesspecker.org/about"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />
    </>
  );
}