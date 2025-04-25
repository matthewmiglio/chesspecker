import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center px-6 py-16 relative overflow-hidden">
      {/* HERO SECTION */}
      <div className="flex flex-col items-center text-center max-w-3xl space-y-6">
        <Link href="/puzzles" className="group">
          <div className="relative w-40 h-40 md:w-52 md:h-52 transition-transform group-hover:scale-105 cursor-pointer">
            <Image
              src="/logos/logo_circle.png"
              alt="ChessPecker Logo"
              layout="fill"
              objectFit="contain"
              priority
            />
          </div>
        </Link>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Train Smarter. Play Better.
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl px-4">
          Build your own tactical puzzles, master key positions, and track your
          progress across every session.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Button asChild size="lg">
            <Link href="/login">Start Training</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
          <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </div>

      {/* FEATURE STRIP */}
      <section className="mt-24 w-full max-w-6xl px-4 flex flex-col md:flex-row items-center justify-between gap-8">
        {[
          {
            title: "Create Puzzle Sets",
            desc: "Tailor puzzles by theme, rating, opening, and more.",
            icon: "♟️",
          },
          {
            title: "Interactive Solving",
            desc: "Play puzzles on a real board with smart feedback.",
            icon: "🎯",
          },
          {
            title: "Track & Improve",
            desc: "See your accuracy, solve time, and improvement.",
            icon: "📈",
          },
        ].map((f, i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center bg-card p-6 rounded-xl shadow-md border border-border w-full"
          >
            <div className="text-4xl mb-2">{f.icon}</div>
            <h3 className="text-lg font-semibold">{f.title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* CALL TO ACTION STRIP */}
      <section className="mt-32 w-full bg-muted text-muted-foreground py-12 px-6 text-center rounded-xl">
        <h2 className="text-2xl font-semibold text-foreground">
          Ready to sharpen your tactical edge?
        </h2>
        <p className="mt-2 max-w-xl mx-auto">
          Start building your first puzzle set and experience the most focused
          chess training on the web.
        </p>
        <div className="mt-6">
          <Button asChild size="lg">
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
