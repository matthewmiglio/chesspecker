import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="
          border-t
          py-4
          mt-14
          text-sm
          text-muted-foreground
             "
    >
      <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="font-semibold">ChessPecker</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/contact" className="hover:text-foreground">
            Developer Contact
          </Link>
          <Link href="https://www.matthewmiglio.dev/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
            Portfolio
          </Link>
          <Link href="https://donate.stripe.com/4gM7sN3Vj4vO2u4dzF4Ja04" target="_blank" rel="noopener noreferrer" className="hover:text-foreground text-orange-500 hover:text-orange-400">
            Donate ❤️
          </Link>
          <span>Last Updated: September 2025</span>
        </div>
      </div>
    </footer>
  );
}
