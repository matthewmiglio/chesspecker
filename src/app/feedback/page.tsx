"use client";

import FeedbackForm from "@/components/feedback/feedbackForm";

export default function FeedbackPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] py-12">
            <div className="max-w-4xl mx-auto px-4">
                <FeedbackForm />
            </div>
        </div>
    );
}
