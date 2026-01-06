'use client';

export default function PricingStructuredData() {
  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "ChessPecker Premium",
    "description": "Premium chess tactics training with unlimited puzzle sets, larger set sizes (up to 500 puzzles), and access to all 21 tactical themes.",
    "brand": {
      "@type": "Brand",
      "name": "ChessPecker"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Monthly Premium",
        "price": "4.99",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        "url": "https://chesspecker.org/pricing"
      },
      {
        "@type": "Offer",
        "name": "Yearly Premium",
        "price": "39.99",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        "url": "https://chesspecker.org/pricing"
      }
    ],
    "category": "Chess Training Software"
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://chesspecker.org"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Pricing",
        "item": "https://chesspecker.org/pricing"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
    </>
  );
}
