"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { submitFeedback } from "@/lib/api/feedbackApi";
import { motion, AnimatePresence } from "framer-motion";

/**
 * FeedbackForm - Editorial Magazine Style
 * Luxury editorial layout with generous whitespace, two-column design, and heritage aesthetic.
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

export type FeedbackFormProps = {
  className?: string | null;
};

export default function FeedbackForm({ className }: FeedbackFormProps) {
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
    if (nameEmpty) { setError("Please enter your name."); return; }
    if (messageEmpty) { setError("Please write a short message."); return; }
    if (tooLong) { setError("Your message is too long."); return; }

    try {
      setSubmitting(true);
      const email = session!.user!.email!;
      const payload = { email, text: message, stars: rating, category };
      const ok = await submitFeedback(payload);
      setSubmitted({ ok });
      if (ok) { setName(""); setMessage(""); setRating(0); setCategory("feature"); }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(`Submission failed: ${msg}`);
      setSubmitted({ ok: false });
    } finally {
      setSubmitting(false);
    }
  };

  const label = useMemo(() => {
    if (submitting) return "Sending";
    if (submitted?.ok) return "Received";
    return "Submit Feedback";
  }, [submitting, submitted]);

  // Red color from site theme: rgb(244, 67, 54)
  const redColor = "rgb(244, 67, 54)";

  return (
    <div className={join("relative", className || "")}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-neutral-900 overflow-hidden rounded-lg"
      >
        {/* Editorial Header - Full width band */}
        <div className="text-white px-12 py-16" style={{ backgroundColor: redColor }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-lg"
          >
            <span className="text-red-200 text-xs tracking-[0.3em] uppercase font-medium">Feedback</span>
            <h2 className="mt-4 text-4xl md:text-5xl font-serif font-light leading-tight">
              Help Us Perfect<br />Your Experience
            </h2>
          </motion.div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="px-12 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Column */}
            <div className="space-y-10">
              {/* Name */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <label htmlFor="fb-name" className="block text-xs tracking-[0.2em] uppercase text-neutral-400 mb-4">
                  Your Name
                </label>
                <Input
                  id="fb-name"
                  name="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  ref={(el) => { if (!firstInvalidRef.current) firstInvalidRef.current = el; }}
                  className="border-0 border-b-2 border-neutral-700 rounded-none bg-transparent px-0 py-4 text-xl text-neutral-100 focus:ring-0 transition-colors placeholder:text-neutral-500"
                  style={{ "--tw-ring-color": redColor } as React.CSSProperties}
                />
              </motion.div>

              {/* Category */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                <label className="block text-xs tracking-[0.2em] uppercase text-neutral-400 mb-5">Category</label>
                <div className="space-y-2">
                  {categories.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setCategory(c.id)}
                      className={join(
                        "block w-full text-left px-5 py-3 min-h-[44px] text-sm transition-all duration-300 border-l-2",
                        c.id === category
                          ? "border-l-[rgb(244,67,54)] bg-red-500/10 text-red-400 font-medium"
                          : "border-l-transparent text-neutral-400 hover:border-l-neutral-600 hover:bg-neutral-800"
                      )}
                      aria-pressed={c.id === category}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Rating */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.15 }}
              >
                <label className="block text-xs tracking-[0.2em] uppercase text-neutral-400 mb-5">Rating (Optional)</label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setRating(i === rating ? 0 : i)}
                      className="w-11 h-11 flex items-center justify-center transition-transform duration-300 hover:scale-110"
                    >
                      <svg
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        fill={i <= rating ? redColor : "none"}
                        stroke={redColor}
                        strokeWidth="1.5"
                      >
                        <path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.785 1.402 8.168L12 18.897l-7.336 3.867 1.402-8.168L.132 9.211l8.2-1.193z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex flex-col"
            >
              <div className="flex items-baseline justify-between mb-4">
                <label htmlFor="fb-message" className="text-xs tracking-[0.2em] uppercase text-neutral-400">Your Message</label>
                <span className={join("text-xs", tooLong ? "text-red-500" : "text-neutral-500")}>
                  {charsLeft} characters
                </span>
              </div>
              <Textarea
                id="fb-message"
                name="message"
                placeholder="Share your thoughts, suggestions, or report issues..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 min-h-[200px] border-2 border-neutral-700 rounded-none bg-neutral-800 p-5 text-lg text-neutral-100 focus:ring-0 resize-none transition-colors placeholder:text-neutral-500"
                style={{ "--tw-ring-color": redColor } as React.CSSProperties}
              />
            </motion.div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-8 text-sm text-red-400 bg-red-900/30 px-5 py-3 border border-red-800/50"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-12 pt-8 border-t border-neutral-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6"
          >
            <Button
              type="submit"
              disabled={!canSubmit}
              className="text-white rounded-none px-12 py-6 text-sm tracking-[0.15em] uppercase font-medium transition-all duration-300"
              style={{ backgroundColor: redColor }}
            >
              {label}
            </Button>
            <Button asChild variant="ghost" className="text-neutral-400 hover:text-red-400 hover:bg-transparent text-sm tracking-wide group">
              <Link href="https://donate.stripe.com/4gM7sN3Vj4vO2u4dzF4Ja04" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                Support ChessPecker
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </Button>
          </motion.div>
        </form>
      </motion.div>

      {/* Logged-out overlay */}
      <AnimatePresence>
        {!isLoggedIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 backdrop-blur-sm bg-neutral-900/95 flex items-center justify-center rounded-lg"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="text-center p-10"
            >
              <p className="text-neutral-400 mb-6 tracking-wide">Please sign in to submit feedback</p>
              <Button
                onClick={() => signIn("google")}
                className="rounded-none px-10 py-4 text-sm tracking-[0.15em] uppercase text-white"
                style={{ backgroundColor: redColor }}
              >
                Sign In
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
