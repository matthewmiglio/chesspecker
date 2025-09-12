'use client';

export default function HomeStructuredData() {
  const webAppStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "ChessPecker",
    "description": "Chess tactics training using the Woodpecker Method",
    "url": "https://chesspecker.org",
    "applicationCategory": "GameApplication",
    "operatingSystem": "Web Browser",
    "creator": {
      "@type": "Person",
      "name": "Matthew Miglio",
      "url": "https://matthewmiglio.dev"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Chess puzzle practice",
      "Woodpecker Method training",
      "Progress tracking",
      "Custom puzzle sets",
      "Performance analytics"
    ]
  };

  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ChessPecker",
    "url": "https://chesspecker.org",
    "description": "Chess tactics training platform using the Woodpecker Method",
    "founder": {
      "@type": "Person",
      "name": "Matthew Miglio"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "mmiglio.work@gmail.com",
      "contactType": "technical support"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationStructuredData) }}
      />
    </>
  );
}