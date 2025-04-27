import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CreateSetButton() {
  return (
    <Button className="" variant="outline" asChild>
      <Link href="/create">Create Your First Set</Link>
    </Button>
  );
}
