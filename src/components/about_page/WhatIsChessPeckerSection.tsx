export function WhatIsChessPeckerSection() {
  return (
    <section className="space-y-16">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            What is ChessPecker?
          </h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
        </div>

        <div className="space-y-8">
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed text-left">
            ChessPecker is a tactical training platform that implements the
            <span className="text-foreground font-semibold"> Woodpecker Method</span> —
            an intensive repetition system designed to transform your pattern recognition.
            Unlike random puzzle apps, ChessPecker gives you carefully curated sets
            that you solve in <span className="text-foreground font-semibold">multiple cycles</span>,
            each time faster and with greater accuracy.
          </p>

          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed text-left">
            <span className="text-foreground font-semibold">Smart curation</span> means puzzles matched to your skill level, not random selections.
            <span className="text-foreground font-semibold"> Cycle training</span> lets you re-solve the same sets for pattern mastery, building neural pathways
            that make tactical recognition automatic. <span className="text-foreground font-semibold">Progress tracking</span> provides detailed analytics to see your improvement,
            including accuracy trends, speed improvements, and weak pattern identification across each training cycle.
          </p>
        </div>
      </div>
    </section>
  );
}
