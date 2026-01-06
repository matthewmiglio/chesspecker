"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, User, Share2, ArrowRight } from "lucide-react";
import { getBlogPost, getRelatedPosts } from "../blogData";
import BreadcrumbSchema from "@/components/structured-data/BreadcrumbSchema";

interface BlogPostClientProps {
  slug: string;
}

export default function BlogPostClient({ slug }: BlogPostClientProps) {
  const router = useRouter();
  const post = getBlogPost(slug);
  const relatedPosts = getRelatedPosts(slug, 2);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-4">
          <h1 className="text-3xl font-bold mb-4">Blog Post Not Found</h1>
          <p className="text-muted-foreground mb-8">
            Sorry, the blog post you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={() => router.push("/blog")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold"
            style={{ backgroundColor: "var(--theme-color)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  // Article structured data
  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "author": {
      "@type": "Person",
      "name": "Matthew Miglio"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ChessPecker",
      "url": "https://chesspecker.org"
    },
    "datePublished": new Date(post.date).toISOString(),
    "dateModified": new Date().toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://chesspecker.org/blog/${slug}`
    },
    "keywords": post.keywords.join(", ")
  };

  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chesspecker.org" },
          { name: "Blog", url: "https://chesspecker.org/blog" },
          { name: post.title, url: `https://chesspecker.org/blog/${slug}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />

      {/* Article */}
      <article className="max-w-4xl mx-auto px-6 py-12 sm:py-16">
        {/* Back Button */}
        <button
          onClick={() => router.push("/blog")}
          className="inline-flex items-center gap-2 text-[var(--theme-color)] font-semibold hover:gap-3 transition-all mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </button>

        {/* Header */}
        <header className="mb-12">
          {/* Category */}
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[var(--theme-color)] bg-[var(--theme-color)]/10 px-3 py-1 rounded-full mb-6">
            {post.category}
          </span>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground border-y border-border py-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="font-medium">Matthew Miglio</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{post.readTime}</span>
            </div>
            <button
              className="ml-auto flex items-center gap-2 text-[var(--theme-color)] hover:opacity-80 font-semibold transition-opacity"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: post.title,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </header>

        {/* Content */}
        <div
          className="prose prose-invert prose-lg max-w-none mb-12
            prose-headings:text-foreground prose-headings:font-bold
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
            prose-ul:text-muted-foreground prose-ul:mb-6
            prose-ol:text-muted-foreground prose-ol:mb-6
            prose-li:mb-2
            prose-blockquote:border-l-4 prose-blockquote:border-[var(--theme-color)] prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:my-8
            prose-table:w-full prose-table:border-collapse prose-table:my-8
            prose-th:border prose-th:border-border prose-th:bg-card prose-th:px-4 prose-th:py-2 prose-th:text-left
            prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2
            prose-strong:text-foreground
            prose-a:text-[var(--theme-color)] prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        <div className="border-t border-border pt-8 mb-12">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {post.keywords.map((keyword, index) => (
              <span
                key={index}
                className="bg-card text-muted-foreground px-3 py-1 rounded-full text-sm border border-border"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-[var(--theme-color)]/10 to-[var(--theme-color)]/5 rounded-2xl p-8 sm:p-12 text-center border border-[var(--theme-color)]/20">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to Put This Into Practice?
          </h3>
          <p className="text-lg text-muted-foreground mb-6">
            Start training with the Woodpecker Method on ChessPecker today.
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
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-card/50 py-16 sm:py-24 border-t border-border">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {relatedPosts.map((relatedPost) => (
                <article
                  key={relatedPost.slug}
                  className="group bg-card border border-border rounded-xl overflow-hidden hover:border-[var(--theme-color)]/50 transition-all cursor-pointer"
                  onClick={() => router.push(`/blog/${relatedPost.slug}`)}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--theme-color)]">
                        {relatedPost.category}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {relatedPost.readTime}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-[var(--theme-color)] transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    <button className="inline-flex items-center gap-2 text-[var(--theme-color)] font-semibold">
                      Read More
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
