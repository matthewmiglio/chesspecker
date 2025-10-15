"use client";

import FeedbackForm from "@/components/feedback/feedbackForm";

export default function FeedbackPage() {
    return (
        <div className="max-w-xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-6">I&apos;d Love Your Feedback</h1>
            <FeedbackForm />
        </div>
    );
}
