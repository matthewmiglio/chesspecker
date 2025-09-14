const steps = [
    {
      title: "Select & Solve",
      description: "Choose a curated set of tactical puzzles matched to your skill level and solve them methodically.",
      icon: "🎯"
    },
    {
      title: "Cycle & Accelerate",
      description: "Re-solve the same puzzles in faster cycles, building pattern recognition and tactical fluency.",
      icon: "⚡"
    },
    {
      title: "Master & Apply",
      description: "Transform learned patterns into instant recognition for stronger, faster decisions in real games.",
      icon: "🏆"
    },
  ];

export default function ChessPeckerSteps({ themeColor }: { themeColor: string }) {
    return (
        <div className="relative">
          {/* Connection lines for larger screens */}
          <div className="hidden md:block absolute top-16 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="group relative"
              >
                {/* Hover glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-1000 blur" />

                {/* Main card */}
                <div className="relative bg-card/60 backdrop-blur-sm border border-border/50 p-8 rounded-2xl hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group-hover:bg-card/80">
                  {/* Step number with enhanced styling */}
                  <div className="relative mb-6">
                    <div
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl font-bold text-primary ring-2 ring-primary/20 mx-auto transition-all duration-500 group-hover:scale-110 group-hover:ring-primary/40"
                      style={{
                        boxShadow: `0 0 20px ${themeColor}20, 0 0 40px ${themeColor}10`
                      }}
                    >
                      <span className="text-sm font-bold">{idx + 1}</span>
                    </div>

                    {/* Animated icon overlay */}
                    <div className="absolute -top-2 -right-2 text-2xl opacity-80 group-hover:scale-125 transition-transform duration-300">
                      {step.icon}
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent group-hover:from-primary group-hover:to-secondary transition-all duration-500">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                      {step.description}
                    </p>
                  </div>

                  {/* Progress indicator */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out"
                      style={{ transitionDelay: `${idx * 200}ms` }}
                    />
                  </div>
                </div>

                {/* Connection arrow for larger screens */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 -right-4 w-8 h-px">
                    <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-primary/40 rotate-45 transform translate-x-px -translate-y-px" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
    );
}
