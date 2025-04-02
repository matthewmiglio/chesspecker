"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function CreatePuzzleSetPage() {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
    const [setSize, setSetSize] = useState<number>(300)
    const [repeatCount, setRepeatCount] = useState<number>(8)
    const [loggedIn, setLoggedIn] = useState<boolean>(true)

    useEffect(() => {
        const id = sessionStorage.getItem("user_id")
        setLoggedIn(!!id)
    }, [])

    const handleDifficultyToggle = (level: string) => {
        setSelectedDifficulties((prev) =>
            prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
        )
    }


    const addNewPuzzleToDatabase = async (
        user_id: number,
        difficulties: string[],
        size: number,
        repeats: number,
        name: string
    ) => {
        const res = await fetch("/api/addSet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id,
                difficulties,
                size,
                repeats,
                name,
                puzzle_ids: [] // default on creation
            }),
        });

        if (!res.ok) {
            console.error("Failed to add set:", res.status);
            return null;
        }

        return await res.json();
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (
            selectedDifficulties.length === 0 ||
            name.trim() === "" ||
            description.trim() === "" ||
            setSize <= 0 ||
            repeatCount <= 0
        ) {
            console.log("Please fill out all the fields")
            return
        }

        const user_id_raw = sessionStorage.getItem("user_id");
        if (!user_id_raw) {
            console.error("No user_id in session");
            return;
        }
        const user_id = Number(user_id_raw);

        console.log("This set name:", name)
        console.log("This set description:", description)
        console.log("This set size:", setSize)
        console.log("This set repeatCount:", repeatCount)
        console.log("This set difficulties:", selectedDifficulties)
        console.log("This userId is", user_id)

        const addResponse = await addNewPuzzleToDatabase(user_id,
            selectedDifficulties,
            setSize,
            repeatCount,
            name,)

        console.log('add set response', addResponse)

        window.location.href = "/puzzles";

    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Create a New Puzzle Set</h1>

            <div className="relative">
                {!loggedIn && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                        <div className="text-center text-muted-foreground text-xl font-semibold">
                            Log in to create sets
                        </div>
                    </div>
                )}

                <Card className={!loggedIn ? "blur-sm pointer-events-none opacity-50" : ""}>
                    <form onSubmit={handleSubmit}>
                        <CardHeader>
                            <CardTitle>Puzzle Set Details</CardTitle>
                            <CardDescription>Customize your puzzle set parameters</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Set Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="My Tactical Puzzles"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="A collection of tactical puzzles for intermediate players"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="set-size">Set Size</Label>
                                <Input
                                    id="set-size"
                                    type="number"
                                    value={setSize}
                                    min={1}
                                    onChange={(e) => setSetSize(Number(e.target.value))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="repeat-count">Repeat Count</Label>
                                <Input
                                    id="repeat-count"
                                    type="number"
                                    value={repeatCount}
                                    min={1}
                                    onChange={(e) => setRepeatCount(Number(e.target.value))}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label>Difficulty Levels</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {["easiest", "easier", "normal", "harder", "hardest"].map((level) => (
                                        <Button
                                            key={level}
                                            type="button"
                                            variant={selectedDifficulties.includes(level) ? "default" : "outline"}
                                            onClick={() => handleDifficultyToggle(level)}
                                            className="w-full capitalize"
                                        >
                                            {level}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter>
                            <Button type="submit" className="ml-auto">
                                Create Puzzle Set
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
