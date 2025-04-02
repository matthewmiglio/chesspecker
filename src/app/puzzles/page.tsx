"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChessBoard } from "@/components/chess-board"

// Mock data for puzzle sets
const mockPuzzleSets = [
  {
    id: "1",
    name: "Beginner Tactics",
    description: "Simple tactical puzzles for beginners",
    rating: "800-1200",
    types: ["pin", "fork"],
    puzzleCount: 25,
  },
  {
    id: "2",
    name: "Intermediate Checkmates",
    description: "Practice your checkmate patterns",
    rating: "1200-1800",
    types: ["mate", "tactics"],
    puzzleCount: 40,
  },
  {
    id: "3",
    name: "Advanced Endgames",
    description: "Complex endgame positions for advanced players",
    rating: "1800-2400",
    types: ["endgame"],
    puzzleCount: 30,
  },
]

export default function PuzzlesPage() {
  const [selectedSet, setSelectedSet] = useState<string | null>(null)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Puzzle Sets</h1>
        <Button asChild>
          <Link href="/create">Create New Set</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Available Sets</h2>
          {mockPuzzleSets.map((set) => (
            <Card
              key={set.id}
              className={`cursor-pointer transition-all ${selectedSet === set.id ? "border-primary" : ""}`}
              onClick={() => setSelectedSet(set.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle>{set.name}</CardTitle>
                <CardDescription>{set.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {set.types.map((type) => (
                    <Badge key={type} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">Rating: {set.rating}</div>
                <div className="text-sm text-muted-foreground">{set.puzzleCount} puzzles</div>
              </CardContent>
              <CardFooter>
                <Button
                  variant={selectedSet === set.id ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setSelectedSet(set.id)}
                >
                  {selectedSet === set.id ? "Selected" : "Select"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selectedSet ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{mockPuzzleSets.find((s) => s.id === selectedSet)?.name}</CardTitle>
                  <CardDescription>Solve puzzles to improve your skills</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center mb-6">
                    <ChessBoard />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Session accuracy: 0%</p>
                    <p className="text-sm text-muted-foreground">
                      Puzzles solved: 0/{mockPuzzleSets.find((s) => s.id === selectedSet)?.puzzleCount}
                    </p>
                  </div>
                  <Button>Start Session</Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px] border rounded-lg bg-muted/20">
              <div className="text-center p-8">
                <h3 className="text-xl font-medium mb-2">No Puzzle Set Selected</h3>
                <p className="text-muted-foreground mb-4">Select a puzzle set from the left to start solving</p>
                <Button variant="outline" asChild>
                  <Link href="/create">Create Your Own Set</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

