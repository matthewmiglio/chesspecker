import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to ChessPecker</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Create custom chess puzzle sets, track your progress, and improve your skills with targeted practice.
        </p>
        <div className="flex gap-4 justify-center mt-6">
          <Button asChild size="lg">
            <Link href="/login">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Create Puzzle Sets</CardTitle>
            <CardDescription>Customize by skill level and type</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Build your own puzzle collections based on rating (0-3000), themes, openings, and more.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interactive Training</CardTitle>
            <CardDescription>Solve puzzles on a real chess board</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Practice with a fully-featured chess board that follows all standard chess rules.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Track Progress</CardTitle>
            <CardDescription>Monitor your improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Get detailed statistics on your accuracy, solving time, and overall performance.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

