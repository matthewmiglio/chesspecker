"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Calendar, Clock, BookOpen } from "lucide-react";
import { blogPosts } from "./blogData";
import BreadcrumbSchema from "@/components/structured-data/BreadcrumbSchema";

export default function BlogClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chesspecker.org" },
          { name: "Blog", url: "https://chesspecker.org/blog" },
        ]}
      />

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--theme-color)]/5 to-transparent" />
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--theme-color)]/10 text-[var(--theme-color)] text-sm font-medium mb-6">
            <BookOpen className="w-4 h-4" />
            Chess Training Insights
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            ChessPecker Blog
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Expert articles on the Woodpecker Method, tactical training, pattern
            recognition, and chess improvement strategies.
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {blogPosts.map((post) => (
              <article
                key={post.slug}
                className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-[var(--theme-color)]/50 transition-all duration-300 cursor-pointer"
                onClick={() => router.push(`/blog/${post.slug}`)}
              >
                {/* Gradient accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--theme-color)] to-[var(--theme-color)]/50 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="p-6 sm:p-8">
                  {/* Category & Read Time */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--theme-color)]">
                      {post.category}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl sm:text-2xl font-bold mb-3 group-hover:text-[var(--theme-color)] transition-colors line-clamp-2">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-muted-foreground mb-6 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{post.date}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/blog/${post.slug}`);
                      }}
                      className="inline-flex items-center gap-2 text-[var(--theme-color)] font-semibold hover:gap-3 transition-all"
                    >
                      Read Article
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Train Smarter?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Put these tactics training principles into practice with ChessPecker.
          </p>
          <button
            onClick={() => router.push("/puzzles")}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-white font-semibold transition-all hover:scale-105"
            style={{ backgroundColor: "var(--theme-color)" }}
          >
            Start Training
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
