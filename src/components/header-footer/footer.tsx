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
          <span>Last Updated: April 2025</span>
        </div>
      </div>
    </footer>
  );
}
