"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitFeedback } from "@/lib/api/feedbackApi";

export default function FeedbackForm() {
    const { data: session, status } = useSession();
    const isLoggedIn = status === "authenticated" && !!session?.user?.email;

    const [form, setForm] = useState({ name: "", message: "" });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoggedIn) return;

        setSubmitting(true);

        const email = session?.user?.email;

        if (!email) {
            alert("❌ Email not found. Please log in again.");
            setSubmitting(false);
            return;
        }

        const success = await submitFeedback({
            email: email,
            name: form.name,
            message: form.message,
        });

        setSubmitting(false);

        if (success) {
            alert("✅ Feedback submitted successfully!");
            setForm({ name: "", message: "" });
        } else {
            alert("❌ Failed to submit feedback. Try again.");
        }
    };

    return (
        <>
            <form
                onSubmit={handleSubmit}
                className={`space-y-4 rounded-xl p-6 border border-border shadow ${!isLoggedIn ? "blur-sm pointer-events-none opacity-50" : ""
                    }`}
            >
                <Input
                    name="name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange}
                />

                <Textarea
                    name="message"
                    placeholder="What's on your mind?"
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                />

                <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Feedback"}
                </Button>
            </form>

            {!isLoggedIn && (
                <p className="text-center mt-4 text-sm text-muted-foreground">
                    Please log in to submit feedback.
                </p>
            )}
        </>
    );
}
