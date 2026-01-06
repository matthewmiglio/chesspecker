"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Calendar, Clock } from "lucide-react";
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

      {/* Hero Section - Tech/Dark Style */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=1600&h=900&fit=crop"
            alt="Chess training insights"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-24">
          <div className="max-w-3xl">
            <p
              className="text-xs uppercase tracking-[0.3em] font-mono mb-6"
              style={{ color: "var(--theme-color)" }}
            >
              {"// CHESS_TRAINING_INSIGHTS"}
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-wide mb-6">
              ChessPecker<br />Blog
            </h1>
            <div className="h-px bg-zinc-700 w-24 mb-6" />
            <p className="text-zinc-400 text-lg font-mono max-w-xl">
              {">"} Expert articles on the Woodpecker Method, tactical training,
              pattern recognition, and chess improvement strategies.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p
              className="text-xs uppercase tracking-[0.3em] font-mono mb-4"
              style={{ color: "var(--theme-color)" }}
            >
              {"// LATEST_ARTICLES"}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-wide">
              Training Knowledge
            </h2>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogPosts.map((post, index) => (
              <article
                key={post.slug}
                className="group relative bg-zinc-900/50 border border-zinc-800 overflow-hidden cursor-pointer transition-all duration-500 hover:border-[var(--theme-color)]/50 hover:bg-zinc-900/80"
                onClick={() => router.push(`/blog/${post.slug}`)}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Accent border */}
                <div
                  className="absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ backgroundColor: "var(--theme-color)" }}
                />

                {/* Image */}
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />

                  {/* Category Badge */}
                  <span
                    className="absolute top-4 left-4 text-xs uppercase tracking-wider font-mono px-3 py-1"
                    style={{
                      backgroundColor: "var(--theme-color)",
                      color: "white",
                    }}
                  >
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8">
                  {/* Meta */}
                  <div className="flex items-center gap-4 mb-4 text-zinc-500 text-sm font-mono">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {post.date}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-[var(--theme-color)] transition-colors duration-300">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-zinc-400 mb-6 line-clamp-3 text-sm leading-relaxed">
                    {post.excerpt}
                  </p>

                  {/* Read More */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/blog/${post.slug}`);
                    }}
                    className="inline-flex items-center gap-2 text-sm uppercase tracking-wider font-mono transition-all duration-300 group-hover:gap-3"
                    style={{ color: "var(--theme-color)" }}
                  >
                    Read Article
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-zinc-900 border-l-4 p-10 md:p-16" style={{ borderColor: "var(--theme-color)" }}>
            <div className="space-y-6">
              <p
                className="text-xs uppercase tracking-[0.3em] font-mono"
                style={{ color: "var(--theme-color)" }}
              >
                {"// START_TRAINING"}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-wide">
                Ready to Train<br />Smarter?
              </h2>
              <div className="h-px bg-zinc-700 w-24" />
              <p className="text-zinc-400 font-mono max-w-lg">
                {">"} Put these tactical training principles into practice with
                ChessPecker. Build pattern recognition that transfers to real games.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => router.push("/puzzles")}
                  className="px-8 py-4 text-white text-sm uppercase tracking-wider font-semibold transition-all duration-300 hover:opacity-90"
                  style={{ backgroundColor: "var(--theme-color)" }}
                >
                  Initialize Training
                </button>
                <button
                  onClick={() => router.push("/about")}
                  className="px-8 py-4 border border-zinc-600 text-zinc-300 text-sm uppercase tracking-wider font-semibold transition-all duration-300 hover:border-zinc-400 hover:text-white"
                >
                  Read Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
