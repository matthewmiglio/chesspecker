"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Mail, Github, MessageSquare, Globe, ExternalLink } from "lucide-react";

const personStructuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Matthew Miglio",
  "jobTitle": "Full Stack Developer",
  "description": "Next.js developer specializing in chess applications and AI/ML implementations",
  "email": "matmigg0804@gmail.com",
  "url": "https://www.matthewmiglio.dev/",
  "sameAs": [
    "https://github.com/matthewmiglio"
  ],
  "knowsAbout": ["Next.js", "React", "TypeScript", "Chess AI", "Computer Vision", "Machine Learning"],
  "worksFor": {
    "@type": "Organization",
    "name": "ChessPecker",
    "url": "https://chesspecker.org"
  }
};

export default function ContactPage() {
  // Always use dark mode color
  const themeColor = "var(--red-progress-color)";

  const contactMethods = [
    {
      icon: Mail,
      label: "Email",
      value: "matmigg0804@gmail.com",
      href: "mailto:matmigg0804@gmail.com",
      external: false,
    },
    {
      icon: Github,
      label: "GitHub",
      value: "github.com/matthewmiglio",
      href: "https://github.com/matthewmiglio",
      external: true,
    },
    {
      icon: MessageSquare,
      label: "Discord",
      value: "matt03416",
      href: null,
      external: false,
    },
    {
      icon: Globe,
      label: "Personal Website",
      value: "matthewmiglio.dev",
      href: "https://www.matthewmiglio.dev/",
      external: true,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personStructuredData) }}
      />

      {/* Header Section */}
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Get In Touch
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Have questions or feedback? Feel free to reach out through any of these channels.
        </p>
      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {contactMethods.map((method, index) => {
          const Icon = method.icon;

          return (
            <div
              key={index}
              className="rounded-xl p-[2px] transition-all duration-300 hover:scale-[1.02]"
              style={{
                boxShadow: `0 0 12px ${themeColor}40`,
                border: `2px solid ${themeColor}40`,
                borderRadius: "1rem",
              }}
            >
              <Card className="h-full rounded-xl border-0 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg transition-colors"
                      style={{
                        backgroundColor: `${themeColor}20`,
                      }}
                    >
                      <Icon
                        className="w-6 h-6"
                        style={{ color: themeColor }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                        {method.label}
                      </h3>

                      {method.href ? (
                        <a
                          href={method.href}
                          target={method.external ? "_blank" : undefined}
                          rel={method.external ? "noopener noreferrer" : undefined}
                          className="group inline-flex items-center gap-2 text-base font-medium hover:opacity-80 transition-opacity break-all"
                          style={{ color: themeColor }}
                        >
                          <span>{method.value}</span>
                          {method.external && (
                            <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          )}
                        </a>
                      ) : (
                        <p
                          className="text-base font-medium break-all"
                          style={{ color: themeColor }}
                        >
                          {method.value}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          Developer and creator of ChessPecker • Building tools for chess improvement
        </p>
      </div>
    </div>
  );
}
