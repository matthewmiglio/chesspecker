"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { submitFeedback } from "@/lib/api/feedbackApi";
import { motion, AnimatePresence } from "framer-motion";

/**
 * EnhancedFeedbackForm
 * A more engaging, animated feedback form with validation, categories, rating, and character count.
 * - Degrades gracefully if animations fail (pure HTML still works).
 * - Logged-out users see a friendly overlay + sign-in CTA.
 * - Uses internal `join` util to avoid null issues from external `cn`.
 */

function join(...parts: Array<string | null | undefined | false>) {
  return parts.filter((p): p is string => typeof p === "string" && p.length > 0).join(" ");
}

const MAX_LEN = 1000;
const categories = [
  { id: "bug", label: "Bug" },
  { id: "feature", label: "Feature Request" },
  { id: "ux", label: "UX / UI" },
  { id: "puzzles", label: "Puzzles" },
  { id: "other", label: "Other" },
];

export type EnhancedFeedbackFormProps = {
  className?: string | null;
};

export default function EnhancedFeedbackForm({ className }: EnhancedFeedbackFormProps) {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && !!session?.user?.email;

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<string>("feature");
  const [rating, setRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<null | { ok: boolean }>(null);
  const [error, setError] = useState<string | null>(null);

  const charsLeft = MAX_LEN - message.length;
  const tooLong = charsLeft < 0;
  const messageEmpty = message.trim().length === 0;
  const nameEmpty = name.trim().length === 0;
  const canSubmit = isLoggedIn && !submitting && !tooLong && !messageEmpty && !nameEmpty;

  const firstInvalidRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setError(null);
  }, [name, message, category, rating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) return;

    if (nameEmpty) {
      setError("Please enter your name.");
      return;
    }
    if (messageEmpty) {
      setError("Please write a short message.");
      return;
    }
    if (tooLong) {
      setError("Your message is too long.");
      return;
    }

    try {
      setSubmitting(true);
      const email = session!.user!.email!;
      const payload = {
        email,
        text: message,
        stars: rating,
        category,
      };
      const ok = await submitFeedback(payload);
      setSubmitted({ ok });
      if (ok) {
        setName("");
        setMessage("");
        setRating(0);
        setCategory("feature");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`Submission failed: ${message}`);
      setSubmitted({ ok: false });
    } finally {
      setSubmitting(false);
    }
  };

  const label = useMemo(() => {
    if (submitting) return "Submitting...";
    if (submitted?.ok) return "Submitted!";
    return "Submit Feedback";
  }, [submitting, submitted]);

  return (
    <div className={join("relative", className || "")}>
      <Card className="overflow-hidden border" data-testid="enhanced-feedback-card">
        <CardContent className="p-0">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="px-8 pt-8 pb-2"
          >
            <h2 className="text-xl font-semibold tracking-tight">I value your feedback</h2>
            <p className="text-sm text-muted-foreground">Tell me what&apos;s working great and what I should improve.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="px-8 pb-8 pt-6 space-y-6">
            {/* Name */}
            <motion.div initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.2 }}>
              <label htmlFor="fb-name" className="block text-sm font-medium mb-2">Name</label>
              <Input
                id="fb-name"
                name="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                ref={(el) => { if (!firstInvalidRef.current) firstInvalidRef.current = el; }}
                aria-invalid={nameEmpty}
              />
            </motion.div>

            {/* Category + Rating */}
            <motion.div initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.2, delay: 0.03 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setCategory(c.id)}
                      className={join(
                        "px-3 py-1.5 rounded-full border text-sm",
                        c.id === category ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                      )}
                      aria-pressed={c.id === category}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Rating (optional)</label>
                <div className="flex items-center gap-1" aria-label="rating">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setRating(i === rating ? 0 : i)}
                      aria-label={`${i} star${i > 1 ? "s" : ""}`}
                      className={join(
                        "p-1 rounded",
                        i <= rating ? "text-yellow-500" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {/* star */}
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.785 1.402 8.168L12 18.897l-7.336 3.867 1.402-8.168L.132 9.211l8.2-1.193z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Message */}
            <motion.div initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.2, delay: 0.06 }}>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="fb-message" className="text-sm font-medium">Message</label>
                <span className={join("text-xs", tooLong ? "text-red-500" : "text-muted-foreground")}>
                  {charsLeft} characters left
                </span>
              </div>
              <Textarea
                id="fb-message"
                name="message"
                placeholder="What’s on your mind?"
                rows={7}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                aria-invalid={tooLong || messageEmpty}
              />
            </motion.div>

            {/* Errors */}
            <AnimatePresence initial={false}>
              {error && (
                <motion.div
                  key="err"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-sm text-red-600"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <motion.div initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.2, delay: 0.09 }} className="flex items-center gap-3">
              <Button type="submit" className="w-full sm:w-auto" disabled={!canSubmit} aria-disabled={!canSubmit}>
                {label}
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto border-orange-500 text-orange-600 hover:bg-orange-950 hover:text-orange-700">
                <Link href="https://donate.stripe.com/4gM7sN3Vj4vO2u4dzF4Ja04" target="_blank" rel="noopener noreferrer">
                  Support ChessPecker ❤️
                </Link>
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>

      {/* Logged-out overlay */}
      <AnimatePresence>
        {!isLoggedIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 backdrop-blur-md bg-background/80 flex items-center justify-center rounded-xl"
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="text-center p-6"
            >
              <p className="text-sm text-foreground mb-3">Please log in to submit feedback.</p>
              <Button onClick={() => signIn("google")}>
                Sign in
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/*
Suggested tests (React Testing Library):

// __tests__/EnhancedFeedbackForm.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import EnhancedFeedbackForm from "@/components/feedback/EnhancedFeedbackForm";
import "@testing-library/jest-dom";

jest.mock("next-auth/react", () => ({
  __esModule: true,
  useSession: () => ({ data: { user: { email: "test@example.com" } }, status: "authenticated" }),
}));

jest.mock("@/lib/api/feedbackApi", () => ({
  submitFeedback: jest.fn(async () => true),
}));

describe("EnhancedFeedbackForm", () => {
  it("renders and disables submit when empty", () => {
    render(<EnhancedFeedbackForm />);
    expect(screen.getByTestId("enhanced-feedback-card")).toBeInTheDocument();
    const submitBtn = screen.getByRole("button", { name: /submit feedback/i });
    expect(submitBtn).toBeDisabled();
  });

  it("enables submit when valid", () => {
    render(<EnhancedFeedbackForm />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "A" } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: "Hello" } });
    const submitBtn = screen.getByRole("button", { name: /submit feedback/i });
    expect(submitBtn).not.toBeDisabled();
  });

  it("shows character countdown", () => {
    render(<EnhancedFeedbackForm />);
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: "Hi" } });
    expect(screen.getByText(/characters left/i)).toBeInTheDocument();
  });
});
*/
