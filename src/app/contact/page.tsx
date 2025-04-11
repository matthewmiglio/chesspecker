import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Developer Contact</h1>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground text-base">
          <div>
            <span className="font-medium text-foreground">Email:</span>{" "}
            <a
              href="mailto:mmiglio.work@gmail.com"
              className="text-primary hover:underline"
            >
              mmiglio.work@gmail.com
            </a>
          </div>
          <div>
            <span className="font-medium text-foreground">GitHub:</span>{" "}
            <a
              href="https://github.com/matthewmiglio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              github.com/matthewmiglio
            </a>
          </div>
          <div>
            <span className="font-medium text-foreground">Discord:</span>{" "}
            <span className="text-primary">matt03416</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
