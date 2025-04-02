"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Mock data
const mockPuzzleSets = [
  {
    id: "1",
    name: "Beginner Tactics",
    description: "Simple tactical puzzles for beginners",
    rating: "800-1200",
    types: ["pin", "fork"],
    puzzleCount: 25,
    progress: 68,
    accuracy: 72,
  },
  {
    id: "2",
    name: "Intermediate Checkmates",
    description: "Practice your checkmate patterns",
    rating: "1200-1800",
    types: ["mate", "tactics"],
    puzzleCount: 40,
    progress: 45,
    accuracy: 65,
  },
  {
    id: "3",
    name: "Advanced Endgames",
    description: "Complex endgame positions for advanced players",
    rating: "1800-2400",
    types: ["endgame"],
    puzzleCount: 30,
    progress: 20,
    accuracy: 58,
  },
]

const mockRecentActivity = [
  {
    id: "1",
    date: "Today, 2:30 PM",
    set: "Beginner Tactics",
    puzzlesSolved: 12,
    accuracy: 75,
    timeSpent: "15 minutes",
  },
  {
    id: "2",
    date: "Yesterday, 10:15 AM",
    set: "Intermediate Checkmates",
    puzzlesSolved: 8,
    accuracy: 62,
    timeSpent: "10 minutes",
  },
  {
    id: "3",
    date: "Mar 29, 4:45 PM",
    set: "Advanced Endgames",
    puzzlesSolved: 6,
    accuracy: 50,
    timeSpent: "12 minutes",
  },
]

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="my-sets">My Puzzle Sets</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Puzzles Solved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">247</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Average Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">68%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Active Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">5 days</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Progress</CardTitle>
              <CardDescription>Your puzzle-solving activity over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-end justify-between gap-2">
                {[35, 42, 58, 75, 68, 54, 62].map((value, index) => (
                  <div key={index} className="relative flex-1 group">
                    <div
                      className="bg-primary/80 hover:bg-primary transition-colors rounded-t-sm"
                      style={{ height: `${value}%` }}
                    ></div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-background border rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      {value} puzzles
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
                <div>Sun</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-sets" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">My Puzzle Sets</h2>
            <Button asChild>
              <Link href="/create">Create New Set</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockPuzzleSets.map((set) => (
              <Card key={set.id}>
                <CardHeader>
                  <CardTitle>{set.name}</CardTitle>
                  <CardDescription>{set.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {set.types.map((type) => (
                      <Badge key={type} variant="secondary">
                        {type}
                      </Badge>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{set.progress}%</span>
                    </div>
                    <Progress value={set.progress} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Puzzles</div>
                      <div>{set.puzzleCount}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Accuracy</div>
                      <div>{set.accuracy}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Rating</div>
                      <div>{set.rating}</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/puzzles?set=${set.id}`}>Continue Practice</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent puzzle-solving sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockRecentActivity.map((activity) => (
                  <div key={activity.id} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{activity.set}</div>
                      <div className="text-sm text-muted-foreground">{activity.date}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Puzzles Solved</div>
                        <div>{activity.puzzlesSolved}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Accuracy</div>
                        <div>{activity.accuracy}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Time Spent</div>
                        <div>{activity.timeSpent}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

