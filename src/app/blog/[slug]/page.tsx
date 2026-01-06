import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogPostClient from "./BlogPostClient";
import { getBlogPost, blogPosts } from "../blogData";

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: "Blog Post Not Found",
    };
  }

  return {
    title: `${post.title} | ChessPecker Blog`,
    description: post.excerpt,
    keywords: post.keywords,
    alternates: {
      canonical: `https://chesspecker.org/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `https://chesspecker.org/blog/${slug}`,
      publishedTime: new Date(post.date).toISOString(),
      authors: ["Matthew Miglio"],
      tags: post.keywords,
    },
    twitter: {
      title: post.title,
      description: post.excerpt,
      card: "summary_large_image",
    },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return <BlogPostClient slug={slug} />;
}
