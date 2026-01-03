import Link from "next/link";
import { ShieldCheck } from "lucide-react";

function getCurrentMonthUTC() {
  const now = new Date();
  return now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function Footer() {
  const lastUpdated = getCurrentMonthUTC();

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
      <div className="container mx-auto px-4 flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="font-semibold">ChessPecker</span>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-2">
          <Link href="/contact" className="hover:text-foreground px-3 py-2 min-h-[44px] flex items-center">
            Contact
          </Link>
          <Link href="https://www.matthewmiglio.dev/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground px-3 py-2 min-h-[44px] flex items-center">
            Portfolio
          </Link>
          <Link href="https://donate.stripe.com/4gM7sN3Vj4vO2u4dzF4Ja04" target="_blank" rel="noopener noreferrer" className="hover:text-foreground text-orange-500 hover:text-orange-400 px-3 py-2 min-h-[44px] flex items-center">
            Donate ❤️
          </Link>
        </div>
        <span className="text-xs text-zinc-500">Last Updated: {lastUpdated}</span>
      </div>
    </footer>
  );
}
