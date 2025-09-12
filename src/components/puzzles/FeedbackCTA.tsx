"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";


export default function FeedbackCTA({ className }: { className?: string }) {
    return (
        <div className={cn("my-8 px-4", className)}>
            <Card className="rounded-xl max-w-3xl mx-auto border-dashed">
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-6">
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold tracking-tight">
                            Help us improve ChessPecker
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Have ideas, found a bug, or want a feature? I read every message.
                        </p>
                    </div>

                    <Button asChild className="shrink-0">
                        <Link href="/feedback" aria-label="Open the feedback form">
                            Give Feedback
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
