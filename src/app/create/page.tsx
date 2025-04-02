"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

export default function CreatePuzzleSetPage() {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [minRating, setMinRating] = useState([800])
    const [maxRating, setMaxRating] = useState([2200])
    const [selectedTypes, setSelectedTypes] = useState<string[]>([])

    const puzzleTypes = [
        { id: "mate", label: "Checkmate" },
        { id: "tactics", label: "Tactics" },
        { id: "endgame", label: "Endgame" },
        { id: "opening", label: "Opening" },
        { id: "middlegame", label: "Middlegame" },
        { id: "pin", label: "Pin" },
        { id: "fork", label: "Fork" },
        { id: "discovery", label: "Discovery" },
    ]

    const handleTypeToggle = (typeId: string) => {
        setSelectedTypes((prev) => (prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const puzzleSet = {
            name,
            description,
            minRating: minRating[0],
            maxRating: maxRating[0],
            types: selectedTypes,
        }
        console.log("Created puzzle set:", puzzleSet)
        alert("Puzzle set creation would be implemented here")
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Create a New Puzzle Set</h1>

            <Card>
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

                        <div className="space-y-4">
                            <div>
                                <Label>Minimum Rating: {minRating}</Label>
                                <Slider value={minRating} min={0} max={3000} step={100} onValueChange={setMinRating} className="my-4" />
                            </div>

                            <div>
                                <Label>Maximum Rating: {maxRating}</Label>
                                <Slider value={maxRating} min={0} max={3000} step={100} onValueChange={setMaxRating} className="my-4" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>Puzzle Types</Label>
                            <div className="grid grid-cols-2 gap-4">
                                {puzzleTypes.map((type) => (
                                    <div key={type.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={type.id}
                                            checked={selectedTypes.includes(type.id)}
                                            onCheckedChange={() => handleTypeToggle(type.id)}
                                        />
                                        <Label htmlFor={type.id} className="cursor-pointer">
                                            {type.label}
                                        </Label>
                                    </div>
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
    )
}

