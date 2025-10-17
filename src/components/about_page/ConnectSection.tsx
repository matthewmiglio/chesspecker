import { Heart } from "lucide-react";

export function ConnectSection() {
  return (
    <section className="text-center space-y-12 max-w-3xl mx-auto pb-20">
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-primary/10 backdrop-blur-sm">
            <Heart className="w-10 h-10 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Connect & Support
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed px-4">
          Thanks for being part of the ChessPecker journey. Whether you want to learn more about the development
          or support the project, I&apos;d love to connect.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-6">
        <a
          href="https://www.matthewmiglio.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-card hover:bg-card/80 border border-border hover:border-primary/50 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-lg font-medium"
        >
          <Heart className="w-5 h-5" />
          <span>Visit My Portfolio</span>
        </a>
        <a
          href="https://donate.stripe.com/4gM7sN3Vj4vO2u4dzF4Ja04"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white border border-orange-500 hover:border-orange-600 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-lg font-medium"
        >
          <Heart className="w-5 h-5" />
          <span>Support ChessPecker</span>
        </a>
      </div>
    </section>
  );
}
