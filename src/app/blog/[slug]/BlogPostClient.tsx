"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Calendar, Clock, User, Share2, ArrowRight } from "lucide-react";
import { getBlogPost, getRelatedPosts } from "../blogData";
import BreadcrumbSchema from "@/components/structured-data/BreadcrumbSchema";

interface BlogPostClientProps {
  slug: string;
}

export default function BlogPostClient({ slug }: BlogPostClientProps) {
  const router = useRouter();
  const post = getBlogPost(slug);
  const relatedPosts = getRelatedPosts(slug, 3);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-4">
          <p
            className="text-xs uppercase tracking-[0.3em] font-mono mb-4"
            style={{ color: "var(--theme-color)" }}
          >
            {"// ERROR_404"}
          </p>
          <h1 className="text-3xl font-bold text-white uppercase tracking-wide mb-4">
            Post Not Found
          </h1>
          <p className="text-zinc-400 font-mono mb-8">
            {">"} The requested article does not exist.
          </p>
          <button
            onClick={() => router.push("/blog")}
            className="inline-flex items-center gap-2 px-6 py-3 text-white text-sm uppercase tracking-wider font-semibold"
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
      "name": post.author
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

      {/* Hero Section with Featured Image */}
      <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          priority
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-4xl mx-auto px-6 pb-12">
            <span
              className="inline-block text-xs uppercase tracking-wider font-mono px-3 py-1 mb-6"
              style={{ backgroundColor: "var(--theme-color)", color: "white" }}
            >
              {post.category}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-3xl">
              {post.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-6 py-12 sm:py-16">
        {/* Back Button */}
        <button
          onClick={() => router.push("/blog")}
          className="inline-flex items-center gap-2 text-sm uppercase tracking-wider font-mono mb-8 transition-all duration-300 hover:gap-3"
          style={{ color: "var(--theme-color)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </button>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-6 text-zinc-400 border-y border-zinc-800 py-6 mb-12">
          <div className="flex items-center gap-2 font-mono text-sm">
            <User className="w-4 h-4" />
            <span>{post.author}</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-sm">
            <Calendar className="w-4 h-4" />
            <span>{post.date}</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-sm">
            <Clock className="w-4 h-4" />
            <span>{post.readTime}</span>
          </div>
          <button
            className="ml-auto flex items-center gap-2 font-mono text-sm transition-opacity hover:opacity-80"
            style={{ color: "var(--theme-color)" }}
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

        {/* Content */}
        <div
          className="prose prose-invert prose-lg max-w-none mb-12
            prose-headings:text-white prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-wide
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-l-4 prose-h2:pl-4 prose-h2:border-[var(--theme-color)]
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-zinc-200
            prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:mb-6
            prose-ul:text-zinc-300 prose-ul:mb-6 prose-ul:marker:text-[var(--theme-color)]
            prose-ol:text-zinc-300 prose-ol:mb-6 prose-ol:marker:text-[var(--theme-color)]
            prose-li:mb-2 prose-li:pl-2
            prose-blockquote:border-l-4 prose-blockquote:border-[var(--theme-color)] prose-blockquote:bg-zinc-900/50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:text-zinc-300 prose-blockquote:my-8
            prose-table:w-full prose-table:border-collapse prose-table:my-8
            prose-th:border prose-th:border-zinc-700 prose-th:bg-zinc-900 prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:text-white prose-th:font-mono prose-th:text-sm prose-th:uppercase prose-th:tracking-wider
            prose-td:border prose-td:border-zinc-800 prose-td:px-4 prose-td:py-3 prose-td:text-zinc-300
            prose-strong:text-white prose-strong:font-semibold
            prose-a:text-[var(--theme-color)] prose-a:no-underline hover:prose-a:underline
            prose-code:text-[var(--theme-color)] prose-code:bg-zinc-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        <div className="border-t border-zinc-800 pt-8 mb-12">
          <p
            className="text-xs uppercase tracking-[0.3em] font-mono mb-4"
            style={{ color: "var(--theme-color)" }}
          >
            {"// TOPICS"}
          </p>
          <div className="flex flex-wrap gap-2">
            {post.keywords.map((keyword, index) => (
              <span
                key={index}
                className="bg-zinc-900 text-zinc-400 px-4 py-2 text-sm font-mono border border-zinc-800 hover:border-zinc-700 transition-colors"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          className="bg-zinc-900 border-l-4 p-8 sm:p-12"
          style={{ borderColor: "var(--theme-color)" }}
        >
          <p
            className="text-xs uppercase tracking-[0.3em] font-mono mb-4"
            style={{ color: "var(--theme-color)" }}
          >
            {"// APPLY_KNOWLEDGE"}
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-wide mb-4">
            Ready to Put This<br />Into Practice?
          </h3>
          <div className="h-px bg-zinc-700 w-24 mb-6" />
          <p className="text-zinc-400 font-mono mb-8 max-w-lg">
            {">"} Start training with the Woodpecker Method on ChessPecker today.
            Build lasting pattern recognition.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.push("/puzzles")}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white text-sm uppercase tracking-wider font-semibold transition-all duration-300 hover:opacity-90"
              style={{ backgroundColor: "var(--theme-color)" }}
            >
              Start Training
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-zinc-900/30 py-16 sm:py-24 border-t border-zinc-800">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <p
                className="text-xs uppercase tracking-[0.3em] font-mono mb-4"
                style={{ color: "var(--theme-color)" }}
              >
                {"// CONTINUE_READING"}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-wide">
                Related Articles
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <article
                  key={relatedPost.slug}
                  className="group bg-zinc-900/50 border border-zinc-800 overflow-hidden cursor-pointer transition-all duration-500 hover:border-[var(--theme-color)]/50"
                  onClick={() => router.push(`/blog/${relatedPost.slug}`)}
                >
                  <div className="relative h-40 w-full overflow-hidden">
                    <Image
                      src={relatedPost.image}
                      alt={relatedPost.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-70 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="text-xs uppercase tracking-wider font-mono"
                        style={{ color: "var(--theme-color)" }}
                      >
                        {relatedPost.category}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">
                        {relatedPost.readTime}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-[var(--theme-color)] transition-colors duration-300">
                      {relatedPost.title}
                    </h3>
                    <button
                      className="inline-flex items-center gap-2 text-sm uppercase tracking-wider font-mono transition-all duration-300 group-hover:gap-3"
                      style={{ color: "var(--theme-color)" }}
                    >
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
