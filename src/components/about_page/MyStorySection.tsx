export function MyStorySection() {
  return (
    <section className="space-y-16">
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            My Story
          </h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
        </div>

        <div className="space-y-12">
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed text-left">
            I&apos;m 23, and last year something clicked. I became absolutely
            <span className="text-foreground font-semibold"> obsessed with chess</span>.
            What started as casual games quickly evolved into studying grandmaster games at 2 AM,
            analyzing positions for hours, and dreaming about tactical patterns.
          </p>

          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed text-left">
            But as I dove deeper into training, I realized most chess improvement is really a
            data problem — you need the right puzzles,
            at the right difficulty, reviewed at the right intervals. It&apos;s not just about solving
            thousands of random tactics; it&apos;s about creating a <span className="text-foreground font-semibold">systematic approach</span> where each puzzle
            builds on the last, <span className="text-foreground font-semibold">reinforcing patterns</span> until they become automatic.
          </p>

          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed text-left">
            Yet existing systems felt unintelligent.
            Random puzzles thrown at you with no context. No real progression tracking beyond simple ratings.
            No understanding of what you actually need to work on, or which specific patterns you&apos;re struggling with.
            Most platforms seemed built for engagement metrics rather than <span className="text-foreground font-semibold">actual learning efficiency</span>.
          </p>

        </div>
      </div>
    </section>
  );
}
